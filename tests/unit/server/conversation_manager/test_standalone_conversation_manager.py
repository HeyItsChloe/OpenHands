import asyncio
import json
from dataclasses import dataclass
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from openhands.core.config.openhands_config import OpenHandsConfig
from openhands.core.schema import ObservationType
from openhands.events.observation.commands import CmdOutputMetadata, CmdOutputObservation
from openhands.server.conversation_manager.standalone_conversation_manager import (
    StandaloneConversationManager,
)
from openhands.server.monitoring import MonitoringListener
from openhands.server.session.conversation_init_data import ConversationInitData
from openhands.storage.data_models.conversation_metadata import ConversationMetadata
from openhands.storage.memory import InMemoryFileStore


@dataclass
class GetMessageMock:
    message: dict | None
    sleep_time: int = 0.01

    async def get_message(self, **kwargs):
        await asyncio.sleep(self.sleep_time)
        return {'data': json.dumps(self.message)}


def get_mock_sio(get_message: GetMessageMock | None = None):
    sio = MagicMock()
    sio.enter_room = AsyncMock()
    sio.manager.redis = MagicMock()
    sio.manager.redis.publish = AsyncMock()
    pubsub = AsyncMock()
    pubsub.get_message = (get_message or GetMessageMock(None)).get_message
    sio.manager.redis.pubsub.return_value = pubsub
    return sio


@pytest.mark.asyncio
async def test_init_new_local_session():
    session_instance = AsyncMock()
    session_instance.agent_session = MagicMock()
    session_instance.agent_session.event_stream.cur_id = 1
    mock_session = MagicMock()
    mock_session.return_value = session_instance
    sio = get_mock_sio()
    get_running_agent_loops_mock = AsyncMock()
    get_running_agent_loops_mock.return_value = set()
    is_agent_loop_running_mock = AsyncMock()
    is_agent_loop_running_mock.return_value = True
    with (
        patch(
            'openhands.server.conversation_manager.standalone_conversation_manager.Session',
            mock_session,
        ),
        patch(
            'openhands.server.conversation_manager.standalone_conversation_manager.StandaloneConversationManager.get_running_agent_loops',
            get_running_agent_loops_mock,
        ),
    ):
        async with StandaloneConversationManager(
            sio, OpenHandsConfig(), InMemoryFileStore(), MonitoringListener()
        ) as conversation_manager:
            await conversation_manager.maybe_start_agent_loop(
                'new-session-id', ConversationInitData(), 1
            )
            with (
                patch(
                    'openhands.server.conversation_manager.standalone_conversation_manager.StandaloneConversationManager.is_agent_loop_running',
                    is_agent_loop_running_mock,
                ),
            ):
                await conversation_manager.join_conversation(
                    'new-session-id',
                    'new-session-id',
                    ConversationInitData(),
                    1,
                )
    assert session_instance.initialize_agent.call_count == 1
    assert sio.enter_room.await_count == 1


@pytest.mark.asyncio
async def test_join_local_session():
    session_instance = AsyncMock()
    session_instance.agent_session = MagicMock()
    mock_session = MagicMock()
    mock_session.return_value = session_instance
    session_instance.agent_session.event_stream.cur_id = 1
    sio = get_mock_sio()
    get_running_agent_loops_mock = AsyncMock()
    get_running_agent_loops_mock.return_value = set()
    is_agent_loop_running_mock = AsyncMock()
    is_agent_loop_running_mock.return_value = True
    with (
        patch(
            'openhands.server.conversation_manager.standalone_conversation_manager.Session',
            mock_session,
        ),
        patch(
            'openhands.server.conversation_manager.standalone_conversation_manager.StandaloneConversationManager.get_running_agent_loops',
            get_running_agent_loops_mock,
        ),
    ):
        async with StandaloneConversationManager(
            sio, OpenHandsConfig(), InMemoryFileStore(), MonitoringListener()
        ) as conversation_manager:
            await conversation_manager.maybe_start_agent_loop(
                'new-session-id', ConversationInitData(), None
            )
            with (
                patch(
                    'openhands.server.conversation_manager.standalone_conversation_manager.StandaloneConversationManager.is_agent_loop_running',
                    is_agent_loop_running_mock,
                ),
            ):
                await conversation_manager.join_conversation(
                    'new-session-id',
                    'new-session-id',
                    ConversationInitData(),
                    None,
                )
                await conversation_manager.join_conversation(
                    'new-session-id',
                    'new-session-id',
                    ConversationInitData(),
                    None,
                )
    assert session_instance.initialize_agent.call_count == 1
    assert sio.enter_room.await_count == 2


@pytest.mark.asyncio
async def test_add_to_local_event_stream():
    session_instance = AsyncMock()
    session_instance.agent_session = MagicMock()
    mock_session = MagicMock()
    mock_session.return_value = session_instance
    session_instance.agent_session.event_stream.cur_id = 1
    sio = get_mock_sio()
    get_running_agent_loops_mock = AsyncMock()
    get_running_agent_loops_mock.return_value = set()
    with (
        patch(
            'openhands.server.conversation_manager.standalone_conversation_manager.Session',
            mock_session,
        ),
        patch(
            'openhands.server.conversation_manager.standalone_conversation_manager.StandaloneConversationManager.get_running_agent_loops',
            get_running_agent_loops_mock,
        ),
    ):
        async with StandaloneConversationManager(
            sio, OpenHandsConfig(), InMemoryFileStore(), MonitoringListener()
        ) as conversation_manager:
            await conversation_manager.maybe_start_agent_loop(
                'new-session-id', ConversationInitData(), 1
            )
            await conversation_manager.join_conversation(
                'new-session-id', 'connection-id', ConversationInitData(), 1
            )
            await conversation_manager.send_to_event_stream(
                'connection-id', {'event_type': 'some_event'}
            )
    session_instance.dispatch.assert_called_once_with({'event_type': 'some_event'})


@pytest.mark.asyncio
async def test_cleanup_session_connections():
    sio = get_mock_sio()
    sio.disconnect = AsyncMock()  # Mock the disconnect method
    async with StandaloneConversationManager(
        sio, OpenHandsConfig(), InMemoryFileStore(), MonitoringListener()
    ) as conversation_manager:
        conversation_manager._local_connection_id_to_session_id.update(
            {
                'conn1': 'session1',
                'conn2': 'session1',
                'conn3': 'session2',
                'conn4': 'session2',
            }
        )

        await conversation_manager._close_session('session1')

        # Check that connections were removed from the dictionary
        remaining_connections = conversation_manager._local_connection_id_to_session_id
        assert 'conn1' not in remaining_connections
        assert 'conn2' not in remaining_connections
        assert 'conn3' in remaining_connections
        assert 'conn4' in remaining_connections
        assert remaining_connections['conn3'] == 'session2'
        assert remaining_connections['conn4'] == 'session2'

        # Check that disconnect was called for each connection
        assert sio.disconnect.await_count == 2
        sio.disconnect.assert_any_call('conn1')
        sio.disconnect.assert_any_call('conn2')


# =============================================================================
# Tests for Git Branch Update Detection and WebSocket Emission
# =============================================================================


def _create_cmd_observation(command: str, exit_code: int = 0) -> CmdOutputObservation:
    """Helper to create CmdOutputObservation for testing."""
    return CmdOutputObservation(
        content='output',
        command=command,
        observation=ObservationType.RUN,
        metadata=CmdOutputMetadata(exit_code=exit_code),
    )


class TestIsGitRelatedEvent:
    """Test the _is_git_related_event method for detecting git branch-changing commands."""

    def setup_method(self):
        """Create a minimal conversation manager for testing."""
        self.sio = get_mock_sio()
        self.manager = MagicMock(spec=StandaloneConversationManager)
        # Bind the actual method to our mock
        self.manager._is_git_related_event = (
            StandaloneConversationManager._is_git_related_event.__get__(
                self.manager, StandaloneConversationManager
            )
        )

    def test_git_checkout_detected(self):
        """Test that 'git checkout' commands are detected."""
        event = _create_cmd_observation('git checkout feature-branch')
        assert self.manager._is_git_related_event(event) is True

    def test_git_checkout_with_b_flag_detected(self):
        """Test that 'git checkout -b' (new branch) is detected."""
        event = _create_cmd_observation('git checkout -b new-feature')
        assert self.manager._is_git_related_event(event) is True

    def test_git_switch_detected(self):
        """Test that 'git switch' commands are detected."""
        event = _create_cmd_observation('git switch main')
        assert self.manager._is_git_related_event(event) is True

    def test_git_switch_create_detected(self):
        """Test that 'git switch -c' (create branch) is detected."""
        event = _create_cmd_observation('git switch -c new-branch')
        assert self.manager._is_git_related_event(event) is True

    def test_git_merge_detected(self):
        """Test that 'git merge' commands are detected."""
        event = _create_cmd_observation('git merge feature-branch')
        assert self.manager._is_git_related_event(event) is True

    def test_git_rebase_detected(self):
        """Test that 'git rebase' commands are detected."""
        event = _create_cmd_observation('git rebase main')
        assert self.manager._is_git_related_event(event) is True

    def test_git_reset_detected(self):
        """Test that 'git reset' commands are detected."""
        event = _create_cmd_observation('git reset --hard HEAD~1')
        assert self.manager._is_git_related_event(event) is True

    def test_git_branch_detected(self):
        """Test that 'git branch' commands are detected."""
        event = _create_cmd_observation('git branch new-branch')
        assert self.manager._is_git_related_event(event) is True

    def test_compound_command_with_git_checkout(self):
        """Test that compound commands containing git checkout are detected."""
        event = _create_cmd_observation('cd /workspace && git checkout feature-branch')
        assert self.manager._is_git_related_event(event) is True

    def test_compound_command_with_multiple_git_commands(self):
        """Test compound commands with multiple git operations."""
        event = _create_cmd_observation(
            'git fetch origin && git checkout -b feature origin/feature'
        )
        assert self.manager._is_git_related_event(event) is True

    def test_failed_git_command_not_detected(self):
        """Test that failed git commands (non-zero exit code) are NOT detected."""
        event = _create_cmd_observation('git checkout nonexistent-branch', exit_code=1)
        assert self.manager._is_git_related_event(event) is False

    def test_failed_git_command_exit_code_128(self):
        """Test that git commands with exit code 128 (common git error) are NOT detected."""
        event = _create_cmd_observation('git checkout invalid', exit_code=128)
        assert self.manager._is_git_related_event(event) is False

    def test_non_git_command_not_detected(self):
        """Test that non-git commands are not detected."""
        event = _create_cmd_observation('ls -la')
        assert self.manager._is_git_related_event(event) is False

    def test_git_status_not_detected(self):
        """Test that 'git status' (read-only) is not detected as branch-changing."""
        event = _create_cmd_observation('git status')
        assert self.manager._is_git_related_event(event) is False

    def test_git_log_not_detected(self):
        """Test that 'git log' (read-only) is not detected as branch-changing."""
        event = _create_cmd_observation('git log --oneline')
        assert self.manager._is_git_related_event(event) is False

    def test_git_diff_not_detected(self):
        """Test that 'git diff' (read-only) is not detected as branch-changing."""
        event = _create_cmd_observation('git diff HEAD')
        assert self.manager._is_git_related_event(event) is False

    def test_git_add_not_detected(self):
        """Test that 'git add' is not detected as branch-changing."""
        event = _create_cmd_observation('git add .')
        assert self.manager._is_git_related_event(event) is False

    def test_git_commit_not_detected(self):
        """Test that 'git commit' is not detected as branch-changing."""
        event = _create_cmd_observation('git commit -m "test"')
        assert self.manager._is_git_related_event(event) is False

    def test_git_push_not_detected(self):
        """Test that 'git push' is not detected as branch-changing."""
        event = _create_cmd_observation('git push origin main')
        assert self.manager._is_git_related_event(event) is False

    def test_none_event_not_detected(self):
        """Test that None events return False."""
        assert self.manager._is_git_related_event(None) is False

    def test_non_cmd_observation_not_detected(self):
        """Test that non-CmdOutputObservation events return False."""
        event = MagicMock()  # Not a CmdOutputObservation
        assert self.manager._is_git_related_event(event) is False

    def test_case_insensitive_detection(self):
        """Test that git commands are detected case-insensitively."""
        event = _create_cmd_observation('GIT CHECKOUT main')
        assert self.manager._is_git_related_event(event) is True


class TestShouldUpdateBranch:
    """Test the _should_update_branch method for determining if branch needs update."""

    def setup_method(self):
        """Create a minimal conversation manager for testing."""
        self.manager = MagicMock(spec=StandaloneConversationManager)
        self.manager._should_update_branch = (
            StandaloneConversationManager._should_update_branch.__get__(
                self.manager, StandaloneConversationManager
            )
        )

    def test_should_update_when_branch_changed(self):
        """Test that branch should update when it changes from one branch to another."""
        assert self.manager._should_update_branch('main', 'feature-branch') is True

    def test_should_not_update_when_same_branch(self):
        """Test that branch should not update when it's the same."""
        assert self.manager._should_update_branch('main', 'main') is False

    def test_should_not_update_when_new_branch_is_none(self):
        """Test that branch should not update when new branch is None."""
        assert self.manager._should_update_branch('main', None) is False

    def test_should_update_from_none_to_branch(self):
        """Test that branch should update from None to a valid branch."""
        assert self.manager._should_update_branch(None, 'main') is True

    def test_should_not_update_both_none(self):
        """Test that branch should not update when both are None."""
        assert self.manager._should_update_branch(None, None) is False

    def test_should_update_different_feature_branches(self):
        """Test updating between different feature branches."""
        assert self.manager._should_update_branch('feature-a', 'feature-b') is True


class TestUpdateBranchInConversation:
    """Test the _update_branch_in_conversation method."""

    def setup_method(self):
        """Create a minimal conversation manager for testing."""
        self.manager = MagicMock(spec=StandaloneConversationManager)
        self.manager._update_branch_in_conversation = (
            StandaloneConversationManager._update_branch_in_conversation.__get__(
                self.manager, StandaloneConversationManager
            )
        )

    def test_updates_conversation_branch(self):
        """Test that conversation branch is updated correctly."""
        conversation = ConversationMetadata(
            conversation_id='test-id',
            selected_repository='org/repo',
            selected_branch='main',
        )
        self.manager._update_branch_in_conversation(conversation, 'feature-branch')
        assert conversation.selected_branch == 'feature-branch'

    def test_updates_from_none(self):
        """Test updating branch from None."""
        conversation = ConversationMetadata(
            conversation_id='test-id',
            selected_repository='org/repo',
            selected_branch=None,
        )
        self.manager._update_branch_in_conversation(conversation, 'main')
        assert conversation.selected_branch == 'main'

    def test_updates_to_none(self):
        """Test updating branch to None (edge case)."""
        conversation = ConversationMetadata(
            conversation_id='test-id',
            selected_repository='org/repo',
            selected_branch='main',
        )
        self.manager._update_branch_in_conversation(conversation, None)
        assert conversation.selected_branch is None


@pytest.mark.asyncio
class TestEmitBranchUpdateEvent:
    """Test the _emit_branch_update_event method for WebSocket emission."""

    async def test_emits_correct_event_structure(self):
        """Test that the emitted event has the correct structure."""
        sio = get_mock_sio()
        sio.emit = AsyncMock()

        async with StandaloneConversationManager(
            sio, OpenHandsConfig(), InMemoryFileStore(), MonitoringListener()
        ) as conversation_manager:
            await conversation_manager._emit_branch_update_event(
                'test-conversation-id', 'main', 'feature-branch'
            )

        # Verify emit was called
        sio.emit.assert_called_once()
        call_args = sio.emit.call_args

        # Check event name
        assert call_args[0][0] == 'oh_event'

        # Check event payload structure
        payload = call_args[0][1]
        assert payload['status_update'] is True
        assert payload['type'] == 'info'
        assert payload['message'] == 'test-conversation-id'
        assert payload['selected_branch'] == 'feature-branch'

        # Check room targeting
        assert call_args[1]['to'] == 'room:test-conversation-id'

    async def test_emits_event_with_none_old_branch(self):
        """Test emission when old branch is None."""
        sio = get_mock_sio()
        sio.emit = AsyncMock()

        async with StandaloneConversationManager(
            sio, OpenHandsConfig(), InMemoryFileStore(), MonitoringListener()
        ) as conversation_manager:
            await conversation_manager._emit_branch_update_event(
                'test-id', None, 'new-branch'
            )

        sio.emit.assert_called_once()
        payload = sio.emit.call_args[0][1]
        assert payload['selected_branch'] == 'new-branch'

    async def test_handles_emit_error_gracefully(self):
        """Test that errors during emit are handled gracefully."""
        sio = get_mock_sio()
        sio.emit = AsyncMock(side_effect=Exception('Socket error'))

        async with StandaloneConversationManager(
            sio, OpenHandsConfig(), InMemoryFileStore(), MonitoringListener()
        ) as conversation_manager:
            # Should not raise an exception
            await conversation_manager._emit_branch_update_event(
                'test-id', 'main', 'feature'
            )

        # Verify emit was attempted
        sio.emit.assert_called_once()


@pytest.mark.asyncio
class TestUpdateConversationBranchIntegration:
    """Integration tests for _update_conversation_branch with WebSocket emission."""

    async def test_branch_update_triggers_websocket_emission(self):
        """Test that a branch change triggers WebSocket event emission."""
        sio = get_mock_sio()
        sio.emit = AsyncMock()

        async with StandaloneConversationManager(
            sio, OpenHandsConfig(), InMemoryFileStore(), MonitoringListener()
        ) as conversation_manager:
            # Create a conversation metadata
            conversation = ConversationMetadata(
                conversation_id='test-conv-id',
                selected_repository='org/repo',
                selected_branch='main',
            )

            # Mock the session and runtime
            mock_session = MagicMock()
            mock_runtime = MagicMock()
            mock_runtime.get_workspace_branch.return_value = 'feature-branch'
            mock_session.agent_session.runtime = mock_runtime

            conversation_manager._local_agent_loops_by_sid = {
                'test-conv-id': mock_session
            }

            # Call the method
            await conversation_manager._update_conversation_branch(conversation)

            # Verify branch was updated
            assert conversation.selected_branch == 'feature-branch'

            # Verify WebSocket event was emitted
            sio.emit.assert_called_once()
            payload = sio.emit.call_args[0][1]
            assert payload['selected_branch'] == 'feature-branch'
            assert payload['message'] == 'test-conv-id'

    async def test_no_emission_when_branch_unchanged(self):
        """Test that no WebSocket event is emitted when branch hasn't changed."""
        sio = get_mock_sio()
        sio.emit = AsyncMock()

        async with StandaloneConversationManager(
            sio, OpenHandsConfig(), InMemoryFileStore(), MonitoringListener()
        ) as conversation_manager:
            conversation = ConversationMetadata(
                conversation_id='test-conv-id',
                selected_repository='org/repo',
                selected_branch='main',
            )

            # Mock runtime returning same branch
            mock_session = MagicMock()
            mock_runtime = MagicMock()
            mock_runtime.get_workspace_branch.return_value = 'main'  # Same as current
            mock_session.agent_session.runtime = mock_runtime

            conversation_manager._local_agent_loops_by_sid = {
                'test-conv-id': mock_session
            }

            await conversation_manager._update_conversation_branch(conversation)

            # Branch should remain unchanged
            assert conversation.selected_branch == 'main'

            # No WebSocket event should be emitted
            sio.emit.assert_not_called()

    async def test_no_emission_when_no_session(self):
        """Test that no WebSocket event is emitted when session doesn't exist."""
        sio = get_mock_sio()
        sio.emit = AsyncMock()

        async with StandaloneConversationManager(
            sio, OpenHandsConfig(), InMemoryFileStore(), MonitoringListener()
        ) as conversation_manager:
            conversation = ConversationMetadata(
                conversation_id='nonexistent-conv-id',
                selected_repository='org/repo',
                selected_branch='main',
            )

            # No session exists
            conversation_manager._local_agent_loops_by_sid = {}

            await conversation_manager._update_conversation_branch(conversation)

            # Branch should remain unchanged
            assert conversation.selected_branch == 'main'

            # No WebSocket event should be emitted
            sio.emit.assert_not_called()

import uuid
from unittest.mock import patch

# Mock the database module before importing
with patch('storage.database.engine'), patch('storage.database.a_engine'):
    from server.routes.auth import needs_onboarding
    from storage.org import Org
    from storage.org_member import OrgMember
    from storage.role import Role
    from storage.user import User


def test_needs_onboarding_returns_false_when_user_has_personal_org(session_maker):
    """User with a personal org does not need onboarding."""
    with session_maker() as session:
        user_id = uuid.uuid4()
        personal_org_name = f'user_{user_id}_org'

        # Create personal org
        org = Org(name=personal_org_name)
        session.add(org)
        session.flush()

        # Create user
        user = User(id=user_id, current_org_id=org.id)
        session.add(user)
        session.commit()

    with patch('server.routes.auth.session_maker', session_maker):
        with session_maker() as session:
            user = session.query(User).filter(User.id == user_id).first()
            result = needs_onboarding(user)
            assert result is False


def test_needs_onboarding_returns_false_when_user_has_active_membership(session_maker):
    """User with active org membership does not need onboarding."""
    with session_maker() as session:
        user_id = uuid.uuid4()

        # Create org (not a personal org)
        org = Org(name='company-org')
        session.add(org)
        session.flush()

        # Create user
        user = User(id=user_id, current_org_id=org.id)
        role = Role(name='member', rank=2)
        session.add_all([user, role])
        session.flush()

        # Create active org membership
        org_member = OrgMember(
            org_id=org.id,
            user_id=user.id,
            role_id=role.id,
            llm_api_key='test-key',
            status='active',
        )
        session.add(org_member)
        session.commit()

    with patch('server.routes.auth.session_maker', session_maker):
        with session_maker() as session:
            user = session.query(User).filter(User.id == user_id).first()
            result = needs_onboarding(user)
            assert result is False


def test_needs_onboarding_returns_false_when_user_has_inactive_membership(session_maker):
    """User with inactive org membership does not need onboarding (not a new user)."""
    with session_maker() as session:
        user_id = uuid.uuid4()

        # Create org
        org = Org(name='company-org')
        session.add(org)
        session.flush()

        # Create user
        user = User(id=user_id, current_org_id=org.id)
        role = Role(name='member', rank=2)
        session.add_all([user, role])
        session.flush()

        # Create inactive org membership
        org_member = OrgMember(
            org_id=org.id,
            user_id=user.id,
            role_id=role.id,
            llm_api_key='test-key',
            status='inactive',
        )
        session.add(org_member)
        session.commit()

    with patch('server.routes.auth.session_maker', session_maker):
        with session_maker() as session:
            user = session.query(User).filter(User.id == user_id).first()
            result = needs_onboarding(user)
            assert result is False


def test_needs_onboarding_returns_false_when_user_has_pending_invite(session_maker):
    """User with pending org invite does not need onboarding."""
    with session_maker() as session:
        user_id = uuid.uuid4()

        # Create org
        org = Org(name='company-org')
        session.add(org)
        session.flush()

        # Create user
        user = User(id=user_id, current_org_id=org.id)
        role = Role(name='member', rank=2)
        session.add_all([user, role])
        session.flush()

        # Create pending org membership (invite)
        org_member = OrgMember(
            org_id=org.id,
            user_id=user.id,
            role_id=role.id,
            llm_api_key='test-key',
            status='pending',
        )
        session.add(org_member)
        session.commit()

    with patch('server.routes.auth.session_maker', session_maker):
        with session_maker() as session:
            user = session.query(User).filter(User.id == user_id).first()
            result = needs_onboarding(user)
            assert result is False


def test_needs_onboarding_returns_false_when_user_has_invited_status(session_maker):
    """User with 'invited' org membership status does not need onboarding."""
    with session_maker() as session:
        user_id = uuid.uuid4()

        # Create org
        org = Org(name='company-org')
        session.add(org)
        session.flush()

        # Create user
        user = User(id=user_id, current_org_id=org.id)
        role = Role(name='member', rank=2)
        session.add_all([user, role])
        session.flush()

        # Create invited org membership
        org_member = OrgMember(
            org_id=org.id,
            user_id=user.id,
            role_id=role.id,
            llm_api_key='test-key',
            status='invited',
        )
        session.add(org_member)
        session.commit()

    with patch('server.routes.auth.session_maker', session_maker):
        with session_maker() as session:
            user = session.query(User).filter(User.id == user_id).first()
            result = needs_onboarding(user)
            assert result is False


def test_needs_onboarding_returns_false_when_user_has_null_status_membership(
    session_maker,
):
    """User with null status org membership does not need onboarding (has an account)."""
    with session_maker() as session:
        user_id = uuid.uuid4()

        # Create org
        org = Org(name='company-org')
        session.add(org)
        session.flush()

        # Create user
        user = User(id=user_id, current_org_id=org.id)
        role = Role(name='member', rank=2)
        session.add_all([user, role])
        session.flush()

        # Create org membership with null status
        org_member = OrgMember(
            org_id=org.id,
            user_id=user.id,
            role_id=role.id,
            llm_api_key='test-key',
            status=None,
        )
        session.add(org_member)
        session.commit()

    with patch('server.routes.auth.session_maker', session_maker):
        with session_maker() as session:
            user = session.query(User).filter(User.id == user_id).first()
            result = needs_onboarding(user)
            assert result is False


def test_needs_onboarding_returns_true_when_user_is_new(session_maker):
    """New user with no personal org and no org membership needs onboarding."""
    with session_maker() as session:
        user_id = uuid.uuid4()

        # Create org that is NOT a personal org for this user
        org = Org(name='some-other-org')
        session.add(org)
        session.flush()

        # Create user with no org memberships
        user = User(id=user_id, current_org_id=org.id)
        session.add(user)
        session.commit()

    with patch('server.routes.auth.session_maker', session_maker):
        with session_maker() as session:
            user = session.query(User).filter(User.id == user_id).first()
            result = needs_onboarding(user)
            assert result is True


def test_needs_onboarding_checks_personal_org_name_format(session_maker):
    """Verify that personal org check uses correct naming format."""
    with session_maker() as session:
        user_id = uuid.uuid4()

        # Create an org with a similar but incorrect name format
        wrong_name_org = Org(
            name=f'user-{user_id}-org'
        )  # Using dashes instead of underscores
        session.add(wrong_name_org)
        session.flush()

        # Create user
        user = User(id=user_id, current_org_id=wrong_name_org.id)
        session.add(user)
        session.commit()

    with patch('server.routes.auth.session_maker', session_maker):
        with session_maker() as session:
            user = session.query(User).filter(User.id == user_id).first()
            # Should return True because the org name doesn't match the expected format
            result = needs_onboarding(user)
            assert result is True


def test_needs_onboarding_with_multiple_memberships(session_maker):
    """User with multiple memberships (any status) does not need onboarding."""
    with session_maker() as session:
        user_id = uuid.uuid4()

        # Create two orgs
        org1 = Org(name='company-org-1')
        org2 = Org(name='company-org-2')
        session.add_all([org1, org2])
        session.flush()

        # Create user
        user = User(id=user_id, current_org_id=org1.id)
        role = Role(name='member', rank=2)
        session.add_all([user, role])
        session.flush()

        # Create one inactive and one active membership
        org_member1 = OrgMember(
            org_id=org1.id,
            user_id=user.id,
            role_id=role.id,
            llm_api_key='test-key-1',
            status='inactive',
        )
        org_member2 = OrgMember(
            org_id=org2.id,
            user_id=user.id,
            role_id=role.id,
            llm_api_key='test-key-2',
            status='active',
        )
        session.add_all([org_member1, org_member2])
        session.commit()

    with patch('server.routes.auth.session_maker', session_maker):
        with session_maker() as session:
            user = session.query(User).filter(User.id == user_id).first()
            result = needs_onboarding(user)
            assert result is False


def test_needs_onboarding_with_only_inactive_memberships(session_maker):
    """User with only inactive memberships does not need onboarding (not a new user)."""
    with session_maker() as session:
        user_id = uuid.uuid4()

        # Create two orgs
        org1 = Org(name='company-org-1')
        org2 = Org(name='company-org-2')
        session.add_all([org1, org2])
        session.flush()

        # Create user
        user = User(id=user_id, current_org_id=org1.id)
        role = Role(name='member', rank=2)
        session.add_all([user, role])
        session.flush()

        # Create two inactive memberships
        org_member1 = OrgMember(
            org_id=org1.id,
            user_id=user.id,
            role_id=role.id,
            llm_api_key='test-key-1',
            status='inactive',
        )
        org_member2 = OrgMember(
            org_id=org2.id,
            user_id=user.id,
            role_id=role.id,
            llm_api_key='test-key-2',
            status='inactive',
        )
        session.add_all([org_member1, org_member2])
        session.commit()

    with patch('server.routes.auth.session_maker', session_maker):
        with session_maker() as session:
            user = session.query(User).filter(User.id == user_id).first()
            result = needs_onboarding(user)
            assert result is False

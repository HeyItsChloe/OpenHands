"""Add completed_onboarding column to user table.

Revision ID: 093

This migration adds a `completed_onboarding` column to track whether users
have completed the onboarding flow. Existing users are backfilled with the
current timestamp to prevent them from being prompted to complete onboarding.
"""

from datetime import datetime, timezone

import sqlalchemy as sa
from alembic import op

revision = '093'
down_revision = '092'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add the column
    op.add_column(
        'user',
        sa.Column('completed_onboarding', sa.DateTime(), nullable=True),
    )

    # Backfill existing users so they won't be prompted for onboarding
    op.execute(
        sa.text(
            'UPDATE "user" SET completed_onboarding = :now WHERE completed_onboarding IS NULL'
        ).bindparams(now=datetime.now(timezone.utc))
    )


def downgrade() -> None:
    op.drop_column('user', 'completed_onboarding')

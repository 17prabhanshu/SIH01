"""rename_probability_to_hazard_score

Revision ID: 4933db63819d
Revises: 
Create Date: 2026-09-11 06:11:32.936661

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4933db63819d'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column('model_predictions', 'probability', new_column_name='hazard_evidence_score')

def downgrade() -> None:
    op.alter_column('model_predictions', 'hazard_evidence_score', new_column_name='probability')

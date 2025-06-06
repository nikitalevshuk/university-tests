"""deleted title and description in tests

Revision ID: 126be9a74c78
Revises: b1a1993d67d4
Create Date: 2025-06-01 19:35:28.246571

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '126be9a74c78'
down_revision = 'b1a1993d67d4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('tests', 'description')
    op.drop_column('tests', 'title')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('tests', sa.Column('title', sa.VARCHAR(length=200), autoincrement=False, nullable=False, comment='Название теста'))
    op.add_column('tests', sa.Column('description', sa.TEXT(), autoincrement=False, nullable=True, comment='Описание теста'))
    # ### end Alembic commands ### 
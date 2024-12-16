"""Initial migration

Revision ID: 1a7c18595853
Revises: 
Create Date: 2024-12-16 12:31:47.875802

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1a7c18595853'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Manually add table creation code
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('username', sa.String(80), unique=True, nullable=False),
        sa.Column('hash', sa.String(120), nullable=False),
        sa.Column('risk_profile', sa.String(80), nullable=False),
    )

    op.create_table(
        'categories',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(80), nullable=False),
        sa.Column('sub_category', sa.String(80), nullable=False),
    )

    op.create_table(
        'portfolios',
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), primary_key=True),
        sa.Column('category_id', sa.Integer, sa.ForeignKey('categories.id'), primary_key=True),
        sa.Column('balance', sa.Integer, nullable=False, default=0),
    )

    op.create_table(
        'transactions',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('category_id', sa.Integer, sa.ForeignKey('categories.id'), nullable=False),
        sa.Column('amount', sa.Integer, nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=True, default=sa.func.now()),
    )

def downgrade():
    # Drop the tables in reverse order
    op.drop_table('transactions')
    op.drop_table('portfolios')
    op.drop_table('categories')
    op.drop_table('users')

    # ### end Alembic commands ###

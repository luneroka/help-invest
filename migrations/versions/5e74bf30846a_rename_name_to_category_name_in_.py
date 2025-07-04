"""Rename name to category_name in Categories

Revision ID: 5e74bf30846a
Revises: 
Create Date: 2025-07-04 14:15:25.562830

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '5e74bf30846a'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Rename 'name' column to 'category_name' in 'categories' table
    op.alter_column('categories', 'name', new_column_name='category_name')


def downgrade():
    # Rename 'category_name' column back to 'name' in 'categories' table
    op.alter_column('categories', 'category_name', new_column_name='name')

import uuid
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy_utils import UUIDType # For UUID field
from fastapi_users.db import SQLAlchemyBaseUserTableUUID
# Assuming your Base is defined in .base and IdMixin/TimestampMixin are not strictly needed
# for the User model when using SQLAlchemyBaseUserTableUUID as it provides its own id.
from .base import Base # Your declarative base
# from .base import TimestampMixin # SQLAlchemyBaseUserTable might provide similar or you can add

# Association table for user_role (remains the same)
user_role_association = Table(
    'user_role_association', Base.metadata,
    Column('user_id', UUIDType(binary=False), ForeignKey('users.id'), primary_key=True),
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True)
)

class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "users"
    # id = Column(UUIDType(binary=False), primary_key=True, default=uuid.uuid4) # Provided by SQLAlchemyBaseUserTableUUID
    # email = Column(String, unique=True, index=True, nullable=False) # Provided
    # hashed_password = Column(String, nullable=False) # Provided
    # is_active = Column(Boolean, default=True) # Provided
    # is_superuser = Column(Boolean, default=False) # Provided
    # is_verified = Column(Boolean, default=False) # Provided, if you need email verification

    # You can add your custom fields here if any.
    # For example, if TimestampMixin is still desired for created_at/updated_at
    # and not provided by SQLAlchemyBaseUserTableUUID in a way you want:
    # created_at = Column(DateTime, default=func.now())
    # updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    # `projects` relationship needs to refer to the correct local `id` column.
    # The foreign key in project_member_association also needs to be UUIDType.
    projects = relationship("Project", secondary="project_member_association", back_populates="members")
    roles = relationship("Role", secondary=user_role_association, back_populates="users")

    # Relationships for created_by_id and reviewed_by_id in TestCase and TestPoint
    # These foreign keys in TestPoint and TestCase will also need to be UUIDType if they point to User.id
    created_test_points = relationship("TestPoint", back_populates="creator", foreign_keys="[TestPoint.created_by_id]")
    created_test_cases = relationship("TestCase", back_populates="creator", foreign_keys="[TestCase.created_by_id]")
    reviewed_test_cases = relationship("TestCase", back_populates="reviewer", foreign_keys="[TestCase.reviewed_by_id]")

    owned_projects: Mapped[list["Project"]] = relationship(back_populates="owner") # Added relationship

# IMPORTANT: The `project_member_association` table and the foreign keys in
# TestPoint and TestCase that reference User.id will need to be updated to use UUIDType.
# This change is outside the scope of this file but crucial for DB integrity.
# I will address this when I update those models/association tables.

from typing import TYPE_CHECKING, List # For type hinting 'Project'
if TYPE_CHECKING:
    from .project import Project # For Mapped[List["Project"]] type hint
    from .test_case import TestPoint, TestCase # For existing relationships
    from .role import Role # For existing relationships
from sqlalchemy.orm import Mapped # For Mapped type

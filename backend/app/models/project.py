from sqlalchemy import Column, Integer, String, Text, ForeignKey, Table
from sqlalchemy.orm import relationship, Mapped, mapped_column # For new relationship style
from sqlalchemy_utils import UUIDType
from .base import Base, TimestampMixin, IdMixin
# from .user import User # Forward reference often needed for relationships

project_member_association = Table(
    'project_member_association', Base.metadata,
    Column('project_id', Integer, ForeignKey('projects.id'), primary_key=True),
    Column('user_id', UUIDType(binary=False), ForeignKey('users.id'), primary_key=True) # Changed to UUIDType
)

class Project(Base, IdMixin, TimestampMixin):
    __tablename__ = "projects"

    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    owner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=True) # Made nullable for now, can be False
    owner: Mapped["User"] = relationship(back_populates="owned_projects")

    requirements = relationship("Requirement", back_populates="project")
    members = relationship("User", secondary=project_member_association, back_populates="projects")

import uuid # For Mapped[uuid.UUID]

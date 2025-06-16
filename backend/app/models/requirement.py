from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin, IdMixin

class Requirement(Base, IdMixin, TimestampMixin):
    __tablename__ = "requirements"

    title = Column(String, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    project = relationship("Project", back_populates="requirements")
    versions = relationship("RequirementVersion", back_populates="requirement", cascade="all, delete-orphan")

class RequirementVersion(Base, IdMixin, TimestampMixin):
    __tablename__ = "requirement_versions"

    requirement_id = Column(Integer, ForeignKey("requirements.id"), nullable=False)
    version_string = Column(String, nullable=False)
    description = Column(Text)
    file_path = Column(String, nullable=True)

    requirement = relationship("Requirement", back_populates="versions")
    test_points = relationship("TestPoint", back_populates="requirement_version", cascade="all, delete-orphan")

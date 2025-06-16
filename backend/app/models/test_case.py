from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy_utils import UUIDType # Import UUIDType
from .base import Base, TimestampMixin, IdMixin

class TestPoint(Base, IdMixin, TimestampMixin):
    __tablename__ = "test_points"

    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    requirement_version_id = Column(Integer, ForeignKey("requirement_versions.id"), nullable=False)
    created_by_id = Column(UUIDType(binary=False), ForeignKey("users.id"), nullable=True) # Changed to UUIDType

    requirement_version = relationship("RequirementVersion", back_populates="test_points")
    creator = relationship("User", back_populates="created_test_points", foreign_keys=[created_by_id])
    test_cases = relationship("TestCase", back_populates="test_point", cascade="all, delete-orphan")

class TestCase(Base, IdMixin, TimestampMixin):
    __tablename__ = "test_cases"

    title = Column(String, nullable=False)
    test_point_id = Column(Integer, ForeignKey("test_points.id"), nullable=False)
    steps = Column(Text)
    expected_result = Column(Text)
    status = Column(String, default='new')  # e.g., new, passed, failed, skipped, under_review
    priority = Column(String, default='medium') # e.g., low, medium, high
    type = Column(String) # e.g., positive, negative, destructive, usability, performance
    created_by_id = Column(UUIDType(binary=False), ForeignKey("users.id"), nullable=True) # Changed to UUIDType
    reviewed_by_id = Column(UUIDType(binary=False), ForeignKey("users.id"), nullable=True) # Changed to UUIDType

    test_point = relationship("TestPoint", back_populates="test_cases")
    creator = relationship("User", back_populates="created_test_cases", foreign_keys=[created_by_id])
    reviewer = relationship("User", back_populates="reviewed_test_cases", foreign_keys=[reviewed_by_id])

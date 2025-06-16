from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from .base import Base, IdMixin

class Role(Base, IdMixin):
    __tablename__ = "roles"

    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)

    users = relationship("User", secondary="user_role_association", back_populates="roles")

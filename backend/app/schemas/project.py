from typing import Optional, List
from datetime import datetime
import uuid # For owner_id type
from .base import SchemaBase
from .user import User  # Import User for relationship typing
from .requirement import Requirement # Import Requirement for relationship typing

class ProjectBase(SchemaBase):
    name: str
    description: Optional[str] = None
    owner_id: Optional[uuid.UUID] = None # Added owner_id, optional for creation input

class ProjectCreate(ProjectBase):
    # owner_id will be set by the system using current_user.id, not part of create payload by client typically
    owner_id: Optional[uuid.UUID] = None # Make it explicitly None here or remove if always system-set

class ProjectUpdate(ProjectBase):
    name: Optional[str] = None
    description: Optional[str] = None
    owner_id: Optional[uuid.UUID] = None # Allow updating owner, optional

class Project(ProjectBase): # This is ProjectRead
    id: int
    owner_id: uuid.UUID # Should be present when reading a project
    owner: Optional[User] = None # For returning owner details
    created_at: datetime
    updated_at: datetime
    requirements: List[Requirement] = []
    members: List[User] = []

    model_config = {"from_attributes": True}

import uuid # Added import
from typing import Optional, List
from datetime import datetime
from .base import SchemaBase
# Import Project using a string literal for forward reference if direct import causes circularity
# from .project import Project

class UserBase(SchemaBase):
    email: str

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    email: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    # is_verified: Optional[bool] = None # Add if you manage this field

class User(UserBase): # This will be our UserRead schema
    id: uuid.UUID # Changed from int to uuid.UUID
    is_active: bool
    is_superuser: bool
    is_verified: bool = False # Add is_verified, defaulting to False
    created_at: datetime
    updated_at: datetime
    projects: List["Project"] = [] # Use string literal for Project

    model_config = {"from_attributes": True}

# We might need to import uuid at the top of the file
# import uuid

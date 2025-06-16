from typing import Optional, List
from .base import SchemaBase
# from .user import User # Using forward reference string "User"

class RoleBase(SchemaBase):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(RoleBase):
    name: Optional[str] = None
    description: Optional[str] = None

class Role(RoleBase):
    id: int
    users: List["User"] = [] # Use string literal for User

    model_config = {"from_attributes": True}

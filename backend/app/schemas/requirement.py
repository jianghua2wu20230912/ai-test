from typing import Optional, List
from datetime import datetime
from .base import SchemaBase

# RequirementVersion Schemas
class RequirementVersionBase(SchemaBase):
    version_string: str
    description: Optional[str] = None
    file_path: Optional[str] = None

class RequirementVersionCreate(RequirementVersionBase):
    requirement_id: int # Required when creating a version

class RequirementVersionUpdate(RequirementVersionBase):
    version_string: Optional[str] = None
    description: Optional[str] = None
    file_path: Optional[str] = None

class RequirementVersion(RequirementVersionBase):
    id: int
    requirement_id: int
    created_at: datetime
    updated_at: datetime
    test_points: List["TestPoint"] = []

    model_config = {"from_attributes": True}


# Requirement Schemas
class RequirementBase(SchemaBase):
    title: str
    # project_id is not in base as it might be part of path parameter for creation
    # or derived from context in some cases.

class RequirementCreate(RequirementBase):
    project_id: int # Explicitly needed for creation

class RequirementUpdate(RequirementBase):
    title: Optional[str] = None
    # project_id is typically not updatable directly, or handled separately.

class Requirement(RequirementBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
    versions: List[RequirementVersion] = []

    model_config = {"from_attributes": True}

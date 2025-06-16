from typing import Optional, List
from datetime import datetime
from .base import SchemaBase

# Forward declare User for relationship hints if not importing directly
# from .user import User

# TestCase Schemas
class TestCaseBase(SchemaBase):
    title: str
    steps: Optional[str] = None
    expected_result: Optional[str] = None
    status: str = 'new'
    priority: str = 'medium'
    type: Optional[str] = None # E.g., 'positive', 'negative'

class TestCaseCreate(TestCaseBase):
    test_point_id: int

class TestCaseUpdate(TestCaseBase):
    title: Optional[str] = None
    steps: Optional[str] = None
    expected_result: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    type: Optional[str] = None
    reviewed_by_id: Optional[int] = None

class TestCase(TestCaseBase):
    id: int # Keep as int for now, as these are read models from DB using int PKs from IdMixin
    test_point_id: int
    created_by_id: Optional[uuid.UUID] = None # Changed to UUID
    reviewed_by_id: Optional[uuid.UUID] = None # Changed to UUID
    created_at: datetime
    updated_at: datetime
    creator: Optional["User"] = None
    reviewer: Optional["User"] = None

    model_config = {"from_attributes": True}


# TestPoint Schemas
class TestPointBase(SchemaBase):
    name: str
    description: Optional[str] = None

class TestPointCreate(TestPointBase):
    requirement_version_id: int
    # created_by_id can be set automatically based on current user

class TestPointUpdate(TestPointBase):
    name: Optional[str] = None
    description: Optional[str] = None

class TestPoint(TestPointBase):
    id: int # Keep as int for now
    requirement_version_id: int
    created_by_id: Optional[uuid.UUID] = None # Changed to UUID
    created_at: datetime
    updated_at: datetime
    test_cases: List[TestCase] = []
    creator: Optional["User"] = None
    requirement_version: Optional["RequirementVersion"] = None

    model_config = {"from_attributes": True}

import uuid # Add import for uuid

from .base import SchemaBase
from .project import Project, ProjectCreate, ProjectUpdate, ProjectBase
from .user import User, UserCreate, UserUpdate, UserBase
from .role import Role, RoleCreate, RoleUpdate, RoleBase
from .requirement import (
    Requirement, RequirementCreate, RequirementUpdate, RequirementBase,
    RequirementVersion, RequirementVersionCreate, RequirementVersionUpdate, RequirementVersionBase
)
from .test_case import (
    TestPoint, TestPointCreate, TestPointUpdate, TestPointBase,
    TestCase, TestCaseCreate, TestCaseUpdate, TestCaseBase
)
from .token import Token, TokenData

__all__ = [
    "SchemaBase",
    "Project", "ProjectCreate", "ProjectUpdate", "ProjectBase",
    "User", "UserCreate", "UserUpdate", "UserBase",
    "Role", "RoleCreate", "RoleUpdate", "RoleBase",
    "Requirement", "RequirementCreate", "RequirementUpdate", "RequirementBase",
    "RequirementVersion", "RequirementVersionCreate", "RequirementVersionUpdate", "RequirementVersionBase",
    "TestPoint", "TestPointCreate", "TestPointUpdate", "TestPointBase",
    "TestCase", "TestCaseCreate", "TestCaseUpdate", "TestCaseBase",
    "Token", "TokenData",
    # AI Generation Schemas
    "RequirementAnalysisRequest", "TestPointGenerationRequest", "TestCaseGenerationRequest",
]
from .ai_generation import (
    RequirementAnalysisRequest,
    TestPointGenerationRequest,
    TestCaseGenerationRequest
)

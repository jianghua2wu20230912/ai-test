from typing import Optional
from pydantic import BaseModel, Field

class RequirementAnalysisRequest(BaseModel):
    requirement_text: str = Field(..., min_length=10, description="The full text of the requirement to be analyzed.")
    # These IDs are optional because the AI might generate suggestions
    # before a formal Requirement or Project is created, or for an existing one.
    requirement_id: Optional[int] = None
    project_id: Optional[int] = None

class TestPointGenerationRequest(BaseModel):
    requirement_version_id: int # Must link to an existing RequirementVersion
    context_text: Optional[str] = None # User can highlight specific text from the full requirement version's description

class TestCaseGenerationRequest(BaseModel):
    test_point_id: int # Must link to an existing TestPoint
    num_suggestions: int = Field(default=3, gt=0, le=10, description="Number of test case suggestions to generate.")
    test_case_type: Optional[str] = None # E.g., 'positive', 'negative', 'boundary', 'exploratory'
    # More parameters could be added: e.g., desired_priority, specific_focus_areas, etc.

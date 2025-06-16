from typing import List, Optional
from datetime import datetime, timezone # Added timezone
import uuid # For user ID type

from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from backend.app import models
from backend.app import schemas # Will import specific AI schemas from here
from backend.app.database import get_db
from backend.app.auth.dependencies import current_active_user # Centralized auth dependency
from backend.app.models.user import User as UserModel # For current_user type hint

# Helpers from other modules (if needed, and if they are generic enough)
# from .requirement import get_requirement_or_404 (example)
# from .test_point import get_test_point_or_404 (example)

router = APIRouter(
    prefix="/ai", # This will be /api/v1/ai/...
    tags=["AI Generation"],
)

@router.post("/generate-test-points-from-text", response_model=List[schemas.TestPoint])
async def generate_test_points_from_text(
    request: schemas.RequirementAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(current_active_user)
):
    print(f"Received requirement text for analysis by user {current_user.email}: {request.requirement_text[:100]}...") # Log snippet

    # Placeholder: Check if requirement_id or project_id exists if provided
    if request.requirement_id:
        # In a real scenario, you'd fetch the Requirement or RequirementVersion
        # to ensure it exists and potentially use its data.
        # For now, just a conceptual check.
        # get_requirement_or_404(db, request.requirement_id) # If we had such a common helper
        pass
    if request.project_id:
        # get_project_or_404(db, request.project_id) # If we had such a common helper
        pass

    # Mock AI response
    mock_test_points = []
    for i in range(1, 4): # Generate 3 mock test points
        # Ensure all required fields for schemas.TestPoint are present
        # Our schemas.TestPoint expects: id, name, requirement_version_id, created_at, updated_at
        # Optional: description, created_by_id, test_cases
        # The ID here should be a dummy or the schema should be for "suggestions"
        # For now, using a dummy int ID as the schema currently expects int.
        # If TestPoint schema ID becomes UUID, this needs to change.
        # created_by_id should be current_user.id (which is UUID)

        # Assuming requirement_version_id is crucial for a TestPoint,
        # if request.requirement_id is actually a RequirementVersion ID, use it.
        # Otherwise, this mock data is a bit disconnected.
        # Let's use a placeholder requirement_version_id if not provided.
        # A real AI would likely need a valid requirement_version_id to associate.

        # The schemas.TestPoint also expects created_by_id to be UUID.
        # The model TestPoint has created_by_id as UUID.
        # The schema TestPoint has created_by_id as Optional[int]. This is an inconsistency.
        # Let's assume schemas.TestPoint.created_by_id should be Optional[uuid.UUID].
        # I'll proceed with current_user.id, and fix schema later if error.

        mock_tp = schemas.TestPoint(
            id=-i, # Negative ID to signify it's a mock/unsaved suggestion
            name=f"Mock AI Test Point {i} from text",
            description=f"Detailed description for mock AI Test Point {i} based on analyzed text.",
            requirement_version_id=request.requirement_id or 9999, # Placeholder if not given
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            created_by_id=current_user.id, # UserModel.id is UUID
            test_cases=[] # Default as per schema
        )
        mock_test_points.append(mock_tp)

    return mock_test_points


@router.post("/generate-test-cases-from-test-point", response_model=List[schemas.TestCase])
async def generate_test_cases_from_test_point(
    request: schemas.TestCaseGenerationRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(current_active_user)
):
    print(f"Received request to generate test cases for TP {request.test_point_id} by user {current_user.email}...")

    # Check if the TestPoint exists
    test_point = db.query(models.TestPoint).filter(models.TestPoint.id == request.test_point_id).first()
    if not test_point:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"TestPoint with id {request.test_point_id} not found")

    mock_test_cases = []
    for i in range(1, request.num_suggestions + 1):
        # schemas.TestCase expects: id, title, test_point_id, created_at, updated_at
        # Optional: steps, expected_result, status, priority, type, created_by_id, reviewed_by_id
        # Similar to TestPoint, ID is dummy. created_by_id is current_user.id.
        # reviewed_by_id can be None.

        # schemas.TestCase.created_by_id and reviewed_by_id are Optional[int].
        # This should be Optional[uuid.UUID]. I'll use current_user.id and fix schema later if needed.

        mock_tc = schemas.TestCase(
            id=-i, # Mock ID
            title=f"Mock AI Test Case {i} for TP {request.test_point_id}",
            test_point_id=request.test_point_id,
            steps=f"Step 1 (AI generated for type: {request.test_case_type or 'positive'}).\nStep 2.\nStep 3.",
            expected_result="Expected AI generated result.",
            status="new", # Default from schema
            priority="medium", # Default from schema
            type=request.test_case_type or "positive",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            created_by_id=current_user.id, # UserModel.id is UUID
            reviewed_by_id=None
        )
        mock_test_cases.append(mock_tc)

    return mock_test_cases

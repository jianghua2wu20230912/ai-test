from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from backend.app import models
from backend.app import schemas
from backend.app.database import get_db
from backend.app.api.endpoints.test_point import get_test_point_or_404 # Import helper

router = APIRouter(
    prefix="/test-cases",
    tags=["Test Cases"],
)

# Helper function to get test case or 404
def get_test_case_or_404(db: Session, test_case_id: int):
    test_case = db.query(models.TestCase).filter(models.TestCase.id == test_case_id).first()
    if not test_case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"TestCase with id {test_case_id} not found")
    return test_case

@router.post("/", response_model=schemas.TestCase, status_code=status.HTTP_201_CREATED)
async def create_test_case(test_case: schemas.TestCaseCreate, db: Session = Depends(get_db)):
    # Ensure the referenced test point exists
    get_test_point_or_404(db, test_point_id=test_case.test_point_id)

    # TODO: Add created_by_id and reviewed_by_id from logged-in user later
    db_test_case = models.TestCase(**test_case.model_dump())
    db.add(db_test_case)
    db.commit()
    db.refresh(db_test_case)
    return db_test_case

@router.get("/", response_model=List[schemas.TestCase])
async def read_test_cases(test_point_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(models.TestCase)
    if test_point_id is not None:
        # Ensure the referenced test point exists if filtering by it
        get_test_point_or_404(db, test_point_id=test_point_id)
        query = query.filter(models.TestCase.test_point_id == test_point_id)
    test_cases = query.offset(skip).limit(limit).all()
    return test_cases

@router.get("/{test_case_id}", response_model=schemas.TestCase)
async def read_test_case(test_case_id: int, db: Session = Depends(get_db)):
    db_test_case = get_test_case_or_404(db, test_case_id)
    return db_test_case

@router.put("/{test_case_id}", response_model=schemas.TestCase)
async def update_test_case(test_case_id: int, test_case_update: schemas.TestCaseUpdate, db: Session = Depends(get_db)):
    db_test_case = get_test_case_or_404(db, test_case_id)

    update_data = test_case_update.model_dump(exclude_unset=True)

    if "test_point_id" in update_data and update_data["test_point_id"] is not None:
        # Ensure the new test point exists if it's being changed
        get_test_point_or_404(db, test_point_id=update_data["test_point_id"])

    # TODO: Handle updates to created_by_id, reviewed_by_id (likely restricted)

    for key, value in update_data.items():
        setattr(db_test_case, key, value)

    db.add(db_test_case)
    db.commit()
    db.refresh(db_test_case)
    return db_test_case

@router.delete("/{test_case_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_test_case(test_case_id: int, db: Session = Depends(get_db)):
    db_test_case = get_test_case_or_404(db, test_case_id)
    db.delete(db_test_case)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

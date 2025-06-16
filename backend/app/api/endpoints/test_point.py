from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from backend.app import models
from backend.app import schemas
from backend.app.database import get_db
# Attempt to import the helper from requirement endpoints. If this structure becomes complex,
# a shared utils.py would be better.
from backend.app.api.endpoints.requirement import get_requirement_version_or_404


router = APIRouter(
    prefix="/test-points",
    tags=["Test Points"],
)

# Helper function to get test point or 404
def get_test_point_or_404(db: Session, test_point_id: int):
    test_point = db.query(models.TestPoint).filter(models.TestPoint.id == test_point_id).first()
    if not test_point:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"TestPoint with id {test_point_id} not found")
    return test_point

@router.post("/", response_model=schemas.TestPoint, status_code=status.HTTP_201_CREATED)
async def create_test_point(test_point: schemas.TestPointCreate, db: Session = Depends(get_db)):
    # Ensure the referenced requirement version exists
    get_requirement_version_or_404(db, requirement_id=None, version_id=test_point.requirement_version_id)
    # The original get_requirement_version_or_404 expects requirement_id, which is not ideal here.
    # For now, we'll fetch the RequirementVersion directly to validate its existence.
    # A more direct get_requirement_version_by_id(db, version_id) would be better.

    req_version = db.query(models.RequirementVersion).filter(models.RequirementVersion.id == test_point.requirement_version_id).first()
    if not req_version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"RequirementVersion with id {test_point.requirement_version_id} not found")

    # TODO: Add created_by_id from logged-in user later
    db_test_point = models.TestPoint(**test_point.model_dump())
    db.add(db_test_point)
    db.commit()
    db.refresh(db_test_point)
    return db_test_point

@router.get("/", response_model=List[schemas.TestPoint])
async def read_test_points(requirement_version_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(models.TestPoint)
    if requirement_version_id is not None:
        # Ensure the referenced requirement version exists if filtering by it
        req_version = db.query(models.RequirementVersion).filter(models.RequirementVersion.id == requirement_version_id).first()
        if not req_version:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"RequirementVersion with id {requirement_version_id} not found for filtering")
        query = query.filter(models.TestPoint.requirement_version_id == requirement_version_id)
    test_points = query.offset(skip).limit(limit).all()
    return test_points

@router.get("/{test_point_id}", response_model=schemas.TestPoint)
async def read_test_point(test_point_id: int, db: Session = Depends(get_db)):
    db_test_point = get_test_point_or_404(db, test_point_id)
    return db_test_point

@router.put("/{test_point_id}", response_model=schemas.TestPoint)
async def update_test_point(test_point_id: int, test_point_update: schemas.TestPointUpdate, db: Session = Depends(get_db)):
    db_test_point = get_test_point_or_404(db, test_point_id)

    update_data = test_point_update.model_dump(exclude_unset=True)
    if "requirement_version_id" in update_data:
        # Ensure the new requirement version exists if it's being changed
        req_version = db.query(models.RequirementVersion).filter(models.RequirementVersion.id == update_data["requirement_version_id"]).first()
        if not req_version:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"New RequirementVersion with id {update_data['requirement_version_id']} not found")

    for key, value in update_data.items():
        setattr(db_test_point, key, value)

    db.add(db_test_point)
    db.commit()
    db.refresh(db_test_point)
    return db_test_point

@router.delete("/{test_point_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_test_point(test_point_id: int, db: Session = Depends(get_db)):
    db_test_point = get_test_point_or_404(db, test_point_id)
    # Cascading deletes for TestCases linked to this TestPoint should be configured in the model relationship
    db.delete(db_test_point)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

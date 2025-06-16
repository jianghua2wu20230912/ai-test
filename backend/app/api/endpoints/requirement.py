from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from backend.app import models
from backend.app import schemas
from backend.app.database import get_db

router = APIRouter(
    prefix="/requirements",
    tags=["Requirements"],
)

# Helper function to check if project exists
def get_project_or_404(db: Session, project_id: int):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Project with id {project_id} not found")
    return project

# Helper function to get requirement or 404
def get_requirement_or_404(db: Session, requirement_id: int):
    requirement = db.query(models.Requirement).filter(models.Requirement.id == requirement_id).first()
    if not requirement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Requirement with id {requirement_id} not found")
    return requirement

# Helper function to get requirement version or 404
def get_requirement_version_or_404(db: Session, requirement_id: int, version_id: int):
    version = db.query(models.RequirementVersion).filter(
        models.RequirementVersion.id == version_id,
        models.RequirementVersion.requirement_id == requirement_id
    ).first()
    if not version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"RequirementVersion with id {version_id} for Requirement {requirement_id} not found")
    return version


# --- Requirements CRUD ---

@router.post("/", response_model=schemas.Requirement, status_code=status.HTTP_201_CREATED)
async def create_requirement(requirement: schemas.RequirementCreate, db: Session = Depends(get_db)):
    get_project_or_404(db, requirement.project_id) # Ensure project exists

    db_requirement = models.Requirement(**requirement.model_dump())
    db.add(db_requirement)
    db.commit()
    db.refresh(db_requirement)
    return db_requirement

@router.get("/", response_model=List[schemas.Requirement])
async def read_requirements(project_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(models.Requirement)
    if project_id is not None:
        get_project_or_404(db, project_id) # Ensure project exists if filtered by it
        query = query.filter(models.Requirement.project_id == project_id)
    requirements = query.offset(skip).limit(limit).all()
    return requirements

@router.get("/{requirement_id}", response_model=schemas.Requirement)
async def read_requirement(requirement_id: int, db: Session = Depends(get_db)):
    db_requirement = get_requirement_or_404(db, requirement_id)
    return db_requirement

@router.put("/{requirement_id}", response_model=schemas.Requirement)
async def update_requirement(requirement_id: int, requirement_update: schemas.RequirementUpdate, db: Session = Depends(get_db)):
    db_requirement = get_requirement_or_404(db, requirement_id)

    update_data = requirement_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_requirement, key, value)

    db.add(db_requirement)
    db.commit()
    db.refresh(db_requirement)
    return db_requirement

@router.delete("/{requirement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_requirement(requirement_id: int, db: Session = Depends(get_db)):
    db_requirement = get_requirement_or_404(db, requirement_id)
    # Consider implications: child versions, test points. For now, direct delete.
    # Cascading deletes in SQLAlchemy models would handle this at DB level if configured.
    db.delete(db_requirement)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Requirement Versions CRUD (nested under requirements) ---

@router.post("/{requirement_id}/versions/", response_model=schemas.RequirementVersion, status_code=status.HTTP_201_CREATED)
async def create_requirement_version(requirement_id: int, version: schemas.RequirementVersionCreate, db: Session = Depends(get_db)):
    get_requirement_or_404(db, requirement_id) # Ensure parent requirement exists

    # The schema RequirementVersionCreate already includes requirement_id, but we ensure it matches the path.
    if version.requirement_id != requirement_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Path requirement_id {requirement_id} does not match payload requirement_id {version.requirement_id}"
        )

    db_version = models.RequirementVersion(**version.model_dump())
    db.add(db_version)
    db.commit()
    db.refresh(db_version)
    return db_version

@router.get("/{requirement_id}/versions/", response_model=List[schemas.RequirementVersion])
async def read_requirement_versions(requirement_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    get_requirement_or_404(db, requirement_id) # Ensure parent requirement exists
    versions = db.query(models.RequirementVersion).filter(models.RequirementVersion.requirement_id == requirement_id).offset(skip).limit(limit).all()
    return versions

@router.get("/{requirement_id}/versions/{version_id}", response_model=schemas.RequirementVersion)
async def read_requirement_version(requirement_id: int, version_id: int, db: Session = Depends(get_db)):
    # get_requirement_or_404(db, requirement_id) # Ensured by get_requirement_version_or_404
    db_version = get_requirement_version_or_404(db, requirement_id, version_id)
    return db_version

@router.put("/{requirement_id}/versions/{version_id}", response_model=schemas.RequirementVersion)
async def update_requirement_version(requirement_id: int, version_id: int, version_update: schemas.RequirementVersionUpdate, db: Session = Depends(get_db)):
    db_version = get_requirement_version_or_404(db, requirement_id, version_id)

    update_data = version_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_version, key, value)

    db.add(db_version)
    db.commit()
    db.refresh(db_version)
    return db_version

@router.delete("/{requirement_id}/versions/{version_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_requirement_version(requirement_id: int, version_id: int, db: Session = Depends(get_db)):
    db_version = get_requirement_version_or_404(db, requirement_id, version_id)
    # Similar considerations for cascading deletes to TestPoints if any.
    db.delete(db_version)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

from typing import List, Optional
import uuid

from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from backend.app.models import Project, User # Assuming User model is needed for owner context
from backend.app.schemas.project import ProjectCreate, ProjectUpdate

def get_project(db: Session, project_id: int) -> Optional[Project]:
    return db.query(Project).options(joinedload(Project.owner), joinedload(Project.members)).filter(Project.id == project_id).first()

def get_projects(db: Session, skip: int = 0, limit: int = 100) -> List[Project]:
    return db.query(Project).options(joinedload(Project.owner), joinedload(Project.members)).offset(skip).limit(limit).all()

def create_project(db: Session, project_in: ProjectCreate, owner_id: uuid.UUID) -> Project:
    # Check if owner_id exists (optional, DB foreign key will also check)
    owner = db.query(User).filter(User.id == owner_id).first()
    if not owner:
        # This case should ideally not happen if owner_id comes from a validated current_user
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Owner with id {owner_id} not found")

    # Create project dictionary, excluding owner_id from project_in if it's there,
    # as we're setting it explicitly.
    project_data = project_in.model_dump(exclude_unset=True)
    if 'owner_id' in project_data: # remove if client sent it, we use authenticated user's id
        del project_data['owner_id']

    db_project = Project(**project_data, owner_id=owner_id)

    # Add owner to members list automatically?
    # For now, let's assume this is handled separately or not required by default.
    # If so:
    # if owner not in db_project.members:
    #     db_project.members.append(owner)

    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, project_id: int, project_in: ProjectUpdate) -> Optional[Project]:
    db_project = get_project(db, project_id) # Use get_project to ensure relations are loaded if needed later
    if not db_project:
        return None

    update_data = project_in.model_dump(exclude_unset=True)

    # If owner_id is being updated, ensure the new owner exists
    if "owner_id" in update_data and update_data["owner_id"] is not None:
        new_owner_id = update_data["owner_id"]
        new_owner = db.query(User).filter(User.id == new_owner_id).first()
        if not new_owner:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"New owner with id {new_owner_id} not found")

    for field, value in update_data.items():
        setattr(db_project, field, value)

    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int) -> Optional[Project]:
    db_project = get_project(db, project_id)
    if not db_project:
        return None

    # Perform deletion
    db.delete(db_project)
    db.commit()
    # The db_project object is now detached. We can return it as it was before deletion,
    # or simply return True/None. FastAPI usually expects the deleted object or a 204 No Content.
    # For consistency, if the endpoint expects a response model, return the object.
    # If status_code=204, then no body should be returned.
    return db_project

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
import uuid # For potential owner_id typing

from backend.app import models
from backend.app import schemas
from backend.app.database import get_db
from backend.app.models.user import User as UserModel
from backend.app.auth.dependencies import current_active_user
from backend.app.services import project_service # Import the project service

router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)

# Placeholder for services - normally these would be in a services.project module
# from backend.app.services import project_service

# For now, direct DB interactions:

@router.post("/", response_model=schemas.Project, status_code=status.HTTP_201_CREATED)
async def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    user: UserModel = Depends(current_active_user)
):
    db_project = project_service.create_project(db=db, project_in=project, owner_id=user.id)
    # The service now handles raising HTTPException if owner is not found, though this is unlikely here.
    return db_project

@router.get("/", response_model=List[schemas.Project])
async def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    projects = project_service.get_projects(db=db, skip=skip, limit=limit)
    return projects

@router.get("/{project_id}", response_model=schemas.Project)
async def read_project(project_id: int, db: Session = Depends(get_db)):
    db_project = project_service.get_project(db=db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return db_project

@router.put("/{project_id}", response_model=schemas.Project)
async def update_project(
    project_id: int,
    project: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    # user: UserModel = Depends(current_active_user) # Add if only owner or specific roles can update
):
    # TODO: Add permission check: only project owner or admin can update.
    # For now, any authenticated user can update if they know the project_id.
    db_project = project_service.update_project(db=db, project_id=project_id, project_in=project)
    if db_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    # The service raises HTTPException if new owner_id in project_in is invalid.
    return db_project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    # user: UserModel = Depends(current_active_user) # Add if only owner or admin can delete
):
    # TODO: Add permission check: only project owner or admin can delete.
    deleted_project = project_service.delete_project(db=db, project_id=project_id)
    if deleted_project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# Placeholder for managing project members - to be implemented later
# @router.post("/{project_id}/members/{user_id}", response_model=schemas.Project)
# async def add_project_member(...): ...

# @router.delete("/{project_id}/members/{user_id}", response_model=schemas.Project)
# async def remove_project_member(...): ...

# @router.get("/{project_id}/members", response_model=List[schemas.User]) # Assuming a User schema
# async def list_project_members(...): ...

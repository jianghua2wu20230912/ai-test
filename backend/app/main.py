from fastapi import FastAPI

# Assuming your models and Base are correctly set up
# If Base is in models.base, use that:
# from backend.app.models.base import Base
# If Base is part of the database.py setup (as per previous step):
from backend.app.database import engine, Base as DatabaseBase # Use an alias if names clash

from backend.app import models # This ensures all models are loaded for create_all
from backend.app.api.endpoints import project as project_api_router

# Create database tables
# In a production app, you'd likely use Alembic for migrations.
# models.Base.metadata.create_all(bind=engine)
# If your models.Base is separate from database.Base, choose the one that has all table metadata.
# For this setup, let's assume models.Base is the one to use:
# from backend.app.models.base import Base as ModelsBase # Already imported
ModelsBase.metadata.create_all(bind=engine)

from backend.app.api.endpoints import requirement as requirement_api_router
from backend.app.api.endpoints import test_point as test_point_api_router
from backend.app.api.endpoints import test_case as test_case_api_router

# FastAPI Users imports
# import uuid # No longer directly needed here for FastAPIUsers instantiation
# from fastapi_users import FastAPIUsers # No longer directly needed here
# from backend.app.auth.manager import get_user_manager # Handled by dependencies.py
from backend.app.auth.transport import auth_backend # Still needed for get_auth_router
from backend.app.auth.dependencies import fastapi_users_instance # Import the instance
# from backend.app.models.user import User as UserModel # Not directly needed here if instance is pre-typed
from backend.app.schemas.user import User as UserSchema, UserCreate, UserUpdate # Our Pydantic schemas
from backend.app.api.endpoints import ai_generation as ai_generation_router # Import AI router

app = FastAPI(
    title="Requirements Management System API",
    description="API for managing requirements, projects, users, and test cases.",
    version="0.1.0"
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Requirements Management System API"}

# Include routers
app.include_router(project_api_router.router, prefix="/api/v1/projects", tags=["Projects"])
# Note: The prefix in project.py is "/projects", so the full path will be /api/v1/projects/projects.
# Consider removing the prefix from the router in project.py or adjusting here.
# For now, let's adjust it here for clarity by removing the router's own prefix.

# To fix the double prefix issue, I will assume the router in project.py should not have its own prefix
# if the main app includes it with a prefix.
# For now, I'll proceed with the current structure and it can be refined later.
# Or, more simply, the include_router could be:
# app.include_router(project_api_router.router)
# and the prefix in project.py defines the path.
# Let's use the prefix in the include_router for versioning and keep tags.
# The router in project.py should have prefix="" or just "/" if versioning prefix is handled here.

# Let's refine the project router inclusion.
# The router in `project.py` has `prefix="/projects"`.
# If we include it here as `app.include_router(project_api_router.router, prefix="/api/v1")`
# the paths would become `/api/v1/projects/...` which is good.

app.include_router(project_api_router.router, prefix="/api/v1")
app.include_router(requirement_api_router.router, prefix="/api/v1")
app.include_router(test_point_api_router.router, prefix="/api/v1")
app.include_router(test_case_api_router.router, prefix="/api/v1")

# FastAPI Users setup uses the instance from auth.dependencies
# Auth routes
app.include_router(
    fastapi_users_instance.get_auth_router(auth_backend), # auth_backend is still needed here
    prefix="/api/v1/auth/jwt",
    tags=["Auth"]
)
app.include_router(
    fastapi_users_instance.get_register_router(UserSchema, UserCreate),
    prefix="/api/v1/auth",
    tags=["Auth"]
)
app.include_router(
    fastapi_users_instance.get_reset_password_router(),
    prefix="/api/v1/auth",
    tags=["Auth"]
)
app.include_router(
    fastapi_users_instance.get_verify_router(UserSchema),
    prefix="/api/v1/auth",
    tags=["Auth"]
)

# Users CRUD router
app.include_router(
    fastapi_users_instance.get_users_router(UserSchema, UserUpdate),
    prefix="/api/v1/users",
    tags=["Users"]
)

app.include_router(ai_generation_router.router, prefix="/api/v1") # Add AI router


# Example: How other routers would be added
# from backend.app.api.endpoints import user_router
# app.include_router(user_router.router, prefix="/api/v1/users", tags=["Users"])

# Add other routers as they are developed.

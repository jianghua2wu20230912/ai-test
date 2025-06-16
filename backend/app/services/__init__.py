from .project_service import (
    get_project,
    get_projects,
    create_project,
    update_project,
    delete_project
)

# You can also define an alias for easier importing if you prefer
# import backend.app.services.project_service as project_service

__all__ = [
    "get_project",
    "get_projects",
    "create_project",
    "update_project",
    "delete_project",
    # Add other service functions or modules here as they are created
]

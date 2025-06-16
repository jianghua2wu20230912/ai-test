import uuid
from typing import AsyncGenerator

from fastapi import Depends
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession # fastapi-users often uses async
# However, our current get_db is sync. We might need to adjust this.
# For now, let's assume we can adapt it or that a sync version is available.

# If using standard SQLAlchemy session (sync):
from sqlalchemy.orm import Session
from backend.app.database import get_db # Our existing sync get_db
from backend.app.models.user import User


# Original fastapi-users uses AsyncSession. If we stick to sync for now:
# We need a UserDatabase a Pydantic schema to map to our User model.
# The schemas.User from fastapi-users is typically UserDB.
# Let's use our existing User model.

class SyncSQLAlchemyUserDatabase(SQLAlchemyUserDatabase[User, uuid.UUID]):
    pass # No need to override methods if using default sync behavior with sync session

async def get_user_db(session: Session = Depends(get_db)) -> SyncSQLAlchemyUserDatabase:
    yield SyncSQLAlchemyUserDatabase(session, User)

# If we were to switch to Async:
# from backend.app.database import get_async_db # Assuming we create an async version of get_db
# async def get_async_user_db(session: AsyncSession = Depends(get_async_db)):
# yield SQLAlchemyUserDatabase(session, User)

GET_USER_DB_DEPENDENCY = Depends(get_user_db)

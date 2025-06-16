import uuid
from typing import Optional

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, UUIDIDMixin, exceptions, models, schemas

from backend.app.auth.db import GET_USER_DB_DEPENDENCY, SyncSQLAlchemyUserDatabase
from backend.app.auth.utils import VERIFICATION_TOKEN_SECRET, RESET_PASSWORD_TOKEN_SECRET
from backend.app.models.user import User as UserModel

# We'll use our existing schemas.User for UserRead and schemas.UserCreate for UserCreate.
# fastapi-users might have its own UserUpdate schema, let's use ours (schemas.UserUpdate)
# from backend.app import schemas as app_schemas


class UserManager(UUIDIDMixin, BaseUserManager[UserModel, uuid.UUID]):
    reset_password_token_secret = RESET_PASSWORD_TOKEN_SECRET
    verification_token_secret = VERIFICATION_TOKEN_SECRET

    async def on_after_register(self, user: UserModel, request: Optional[Request] = None):
        print(f"User {user.id} has registered.")
        # Here you could, for example, send a verification email.
        # For now, just a print statement.

    async def on_after_forgot_password(
        self, user: UserModel, token: str, request: Optional[Request] = None
    ):
        print(f"User {user.id} has forgot their password. Reset token: {token}")
        # Send email with reset token link

    async def on_after_request_verify(
        self, user: UserModel, token: str, request: Optional[Request] = None
    ):
        print(f"Verification requested for user {user.id}. Verification token: {token}")
        # Send email with verification link

    # We need to define `create` if we want to use our own UserCreate schema
    # and potentially add more logic or if the base User model has more fields
    # than the standard fastapi-users UserCreate schema.
    # However, fastapi-users BaseUserManager.create should work with compatible schemas.
    # Let's rely on the default `create` for now, assuming our schemas.UserCreate is compatible
    # or we use fastapi-users' own UserCreate schema.

async def get_user_manager(user_db: SyncSQLAlchemyUserDatabase = GET_USER_DB_DEPENDENCY) -> UserManager:
    yield UserManager(user_db)

USER_MANAGER_DEPENDENCY = Depends(get_user_manager)

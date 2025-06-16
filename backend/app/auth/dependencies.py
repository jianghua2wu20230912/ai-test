import uuid
from fastapi_users import FastAPIUsers
from backend.app.auth.manager import get_user_manager
from backend.app.auth.transport import auth_backend
from backend.app.models.user import User as UserModel

# This instance should be consistent with the one in main.py or be the one main.py uses.
# To avoid circular imports if main.py also needs to import these dependencies,
# it's common to initialize FastAPIUsers here and have main.py use this instance
# for router setup. Or, main.py initializes it and passes it to functions here (less common for deps).

# Let's assume this is the primary FastAPIUsers instance for defining dependencies.
# main.py would then use this `fastapi_users_instance` for its router includes.
fastapi_users_instance = FastAPIUsers[UserModel, uuid.UUID](
    get_user_manager,
    [auth_backend],
)

current_active_user = fastapi_users_instance.current_user(active=True, verified=False) # verified=False if not strictly enforcing email verification yet
current_optional_active_user = fastapi_users_instance.current_user(active=True, optional=True)
current_superuser = fastapi_users_instance.current_user(active=True, superuser=True)
current_verified_user = fastapi_users_instance.current_user(active=True, verified=True)

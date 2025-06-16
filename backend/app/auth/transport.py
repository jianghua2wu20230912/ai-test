from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from backend.app.auth.utils import JWT_SECRET

# BearerTransport defines how the token is obtained from the request
# For example, from an "Authorization: Bearer <token>" header.
# tokenUrl is the endpoint where clients can obtain the token (login endpoint).
bearer_transport = BearerTransport(tokenUrl="/api/v1/auth/jwt/login") # Adjusted to include /api/v1

# JWTStrategy defines how JWTs are generated and validated.
# SECRET is crucial and should be kept safe and ideally loaded from env variables.
# lifetime_seconds defines how long the token is valid.
def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=JWT_SECRET, lifetime_seconds=3600) # 1 hour

# AuthenticationBackend brings together the transport and strategy.
# It also requires a "name" which can be used if you have multiple auth backends.
auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

# For fastapi-users v12+, you might need to provide get_user_manager to the backend too,
# but usually, it's passed to the FastAPIUsers instance directly.
# Let's assume for now it's not needed directly in the backend instance.

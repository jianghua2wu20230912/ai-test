# In a real application, load this from environment variables or a secure config file!
SECRET_KEY = "YOUR_VERY_SECRET_KEY_CHANGE_ME_PLEASE_AND_MAKE_IT_STRONG"

# This secret is used for JWT, but fastapi-users also has other settings
# that might need management, e.g., for email verification tokens, etc.
# For now, we only need one for JWT.
JWT_SECRET = SECRET_KEY
RESET_PASSWORD_TOKEN_SECRET = SECRET_KEY + "_reset" # Example for another secret
VERIFICATION_TOKEN_SECRET = SECRET_KEY + "_verify" # Example for another secret

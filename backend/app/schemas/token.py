from typing import Optional
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    # Depending on your JWT subject, you might use user_id or email
    # user_id: Optional[int] = None
    # sub: Optional[str] = None

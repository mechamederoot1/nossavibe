"""
Schemas de autenticação
"""
from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

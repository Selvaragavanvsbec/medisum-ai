"""Authentication and admin routes."""
import re

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from app.core.auth import create_access_token, verify_password
from app.core.deps import current_user, require_admin
from app.services import users

router = APIRouter()

_PW_MIN = 8


class RegisterReq(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=_PW_MIN, max_length=200)


class LoginReq(BaseModel):
    email: EmailStr
    password: str


class RoleReq(BaseModel):
    email: EmailStr
    role: str


def _token_response(user: dict) -> dict:
    token = create_access_token(sub=user["email"], role=user.get("role", "user"))
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "name": user.get("name", ""),
            "email": user["email"],
            "role": user.get("role", "user"),
        },
    }


@router.post("/auth/register")
async def register(req: RegisterReq):
    if await users.get_user(req.email):
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists.")
    user = await users.create_user(req.name, req.email, req.password, role="user")
    return _token_response(user)


@router.post("/auth/login")
async def login(req: LoginReq):
    user = await users.get_user(req.email)
    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password.")
    return _token_response(user)


@router.get("/auth/me")
async def me(user: dict = Depends(current_user)):
    return {"name": user.get("name", ""), "email": user["email"], "role": user.get("role", "user")}


# ---------- Admin ----------
@router.get("/admin/stats")
async def admin_stats(_: dict = Depends(require_admin)):
    from app.services import db as dbsvc

    total_users = await users.count_users()
    all_users = await users.list_users(limit=1000)
    admins = sum(1 for u in all_users if u.get("role") == "admin")
    recent = await dbsvc.recent_summaries(limit=1000)
    return {
        "total_users": total_users,
        "admins": admins,
        "regular_users": total_users - admins,
        "total_summaries": len(recent),
    }


@router.get("/admin/users")
async def admin_users(_: dict = Depends(require_admin)):
    return {"users": await users.list_users(limit=500)}


@router.post("/admin/users/role")
async def admin_set_role(req: RoleReq, _: dict = Depends(require_admin)):
    if req.role not in ("user", "admin"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Role must be 'user' or 'admin'.")
    ok = await users.set_role(req.email, req.role)
    if not ok:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found.")
    return {"ok": True}


@router.delete("/admin/users/{email}")
async def admin_delete_user(email: str, admin: dict = Depends(require_admin)):
    if email.lower() == admin["email"].lower():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You can't delete your own admin account.")
    ok = await users.delete_user(email)
    if not ok:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found.")
    return {"ok": True}

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.user import UserResponse, UserUpdate, PasswordChange
from backend.app.services.auth_service import get_current_user, verify_password, get_password_hash

router = APIRouter(prefix="/users", tags=["Users"])

@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_in.name:
        current_user.name = profile_in.name
    if profile_in.email and profile_in.email != current_user.email:
        existing = db.query(User).filter(User.email == profile_in.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already in use by another account."
            )
        current_user.email = profile_in.email
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/password")
def change_password(
    pass_in: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(pass_in.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password does not match."
        )
    current_user.hashed_password = get_password_hash(pass_in.new_password)
    db.commit()
    return {"message": "Password updated successfully."}


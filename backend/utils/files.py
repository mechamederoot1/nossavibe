"""
File handling utilities
"""
import os
import uuid
from pathlib import Path
from fastapi import HTTPException, UploadFile
from core.config import UPLOAD_DIR, MAX_FILE_SIZE_MB, MAX_AVATAR_SIZE_MB, MAX_COVER_SIZE_MB

def validate_image_file(file: UploadFile, max_size_mb: int = MAX_FILE_SIZE_MB):
    """Validate uploaded image file"""
    # Validate content type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Validate file size
    if file.size and file.size > max_size_mb * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"Image too large (max {max_size_mb}MB)")

def validate_media_file(file: UploadFile):
    """Validate uploaded media file"""
    allowed_types = {
        "image": ["image/jpeg", "image/png", "image/gif", "image/webp"],
        "video": ["video/mp4", "video/webm", "video/avi", "video/mov"],
        "audio": ["audio/mp3", "audio/wav", "audio/ogg", "audio/m4a"],
        "document": ["application/pdf", "text/plain", "application/msword"]
    }

    file_type = None
    for ftype, mimes in allowed_types.items():
        if file.content_type in mimes:
            file_type = ftype
            break

    if not file_type:
        return {"valid": False, "error": "Tipo de arquivo não suportado"}

    # Validate size (100MB max)
    if file.size and file.size > MAX_FILE_SIZE_MB * 1024 * 1024:
        return {"valid": False, "error": f"Arquivo muito grande (máximo {MAX_FILE_SIZE_MB}MB)"}

    return {"valid": True, "file_type": file_type}

async def save_uploaded_file(file: UploadFile, file_type: str, prefix: str = "file") -> str:
    """Save uploaded file and return file_url"""
    # Create directory if it doesn't exist
    upload_dir = Path(UPLOAD_DIR) / file_type
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    file_extension = Path(file.filename).suffix if file.filename else ".jpg"
    unique_filename = f"{prefix}_{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename

    # Save file
    try:
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Return URL path
    return f"/{UPLOAD_DIR}/{file_type}/{unique_filename}"

async def save_avatar(file: UploadFile, user_id: int) -> str:
    """Save avatar file and return URL"""
    validate_image_file(file, MAX_AVATAR_SIZE_MB)
    
    upload_dir = Path(UPLOAD_DIR) / "image"
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_extension = Path(file.filename).suffix if file.filename else ".jpg"
    unique_filename = f"avatar_{user_id}_{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return f"/{UPLOAD_DIR}/image/{unique_filename}"

async def save_cover_photo(file: UploadFile, user_id: int) -> str:
    """Save cover photo and return URL"""
    validate_image_file(file, MAX_COVER_SIZE_MB)
    
    upload_dir = Path(UPLOAD_DIR) / "image"
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_extension = Path(file.filename).suffix if file.filename else ".jpg"
    unique_filename = f"cover_{user_id}_{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return f"/{UPLOAD_DIR}/image/{unique_filename}"

def ensure_upload_directories():
    """Ensure all upload directories exist"""
    directories = [
        f"{UPLOAD_DIR}/stories",
        f"{UPLOAD_DIR}/posts", 
        f"{UPLOAD_DIR}/profiles",
        f"{UPLOAD_DIR}/image",
        f"{UPLOAD_DIR}/video",
        f"{UPLOAD_DIR}/audio",
        f"{UPLOAD_DIR}/document"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)

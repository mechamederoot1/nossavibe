"""
Albums routes for photo album management
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from core.database import get_db
from models.user import User
from models.album import Album, AlbumPhoto
from utils.auth import get_current_user
from utils.files import save_upload_file

router = APIRouter(prefix="/albums", tags=["albums"])

@router.post("/")
async def create_album(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new photo album"""
    
    album = Album(
        user_id=current_user.id,
        name=name,
        description=description
    )
    
    db.add(album)
    db.commit()
    db.refresh(album)
    
    return {
        "id": album.id,
        "name": album.name,
        "description": album.description,
        "created_at": album.created_at.isoformat(),
        "photos_count": 0
    }

@router.get("/")
async def get_user_albums(
    user_id: Optional[int] = None,
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get albums for a user"""
    
    target_user_id = user_id if user_id else current_user.id
    
    albums = db.query(Album).filter(
        Album.user_id == target_user_id
    ).order_by(desc(Album.created_at)).offset(offset).limit(limit).all()
    
    result = []
    for album in albums:
        # Get photo count
        photos_count = db.query(AlbumPhoto).filter(AlbumPhoto.album_id == album.id).count()
        
        # Get first few photos as preview
        preview_photos = db.query(AlbumPhoto).filter(
            AlbumPhoto.album_id == album.id
        ).order_by(AlbumPhoto.created_at).limit(4).all()
        
        result.append({
            "id": album.id,
            "name": album.name,
            "description": album.description,
            "created_at": album.created_at.isoformat(),
            "updated_at": album.updated_at.isoformat(),
            "photos_count": photos_count,
            "preview_photos": [
                {
                    "id": photo.id,
                    "photo_url": photo.photo_url,
                    "caption": photo.caption
                }
                for photo in preview_photos
            ]
        })
    
    return {
        "albums": result,
        "total": len(result),
        "has_more": len(result) == limit
    }

@router.get("/{album_id}")
async def get_album(
    album_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get album details with photos"""
    
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Album not found"
        )
    
    # Check if user can view this album
    # TODO: Add privacy settings for albums
    
    photos = db.query(AlbumPhoto).filter(
        AlbumPhoto.album_id == album_id
    ).order_by(AlbumPhoto.created_at).all()
    
    return {
        "id": album.id,
        "name": album.name,
        "description": album.description,
        "created_at": album.created_at.isoformat(),
        "updated_at": album.updated_at.isoformat(),
        "owner": {
            "id": album.user.id,
            "first_name": album.user.first_name,
            "last_name": album.user.last_name,
            "avatar": album.user.avatar
        },
        "photos_count": len(photos),
        "photos": [
            {
                "id": photo.id,
                "photo_url": photo.photo_url,
                "caption": photo.caption,
                "created_at": photo.created_at.isoformat()
            }
            for photo in photos
        ]
    }

@router.put("/{album_id}")
async def update_album(
    album_id: int,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update album details"""
    
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Album not found"
        )
    
    if album.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this album"
        )
    
    if name is not None:
        album.name = name
    if description is not None:
        album.description = description
    
    album.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(album)
    
    return {
        "message": "Album updated successfully",
        "album": {
            "id": album.id,
            "name": album.name,
            "description": album.description,
            "updated_at": album.updated_at.isoformat()
        }
    }

@router.delete("/{album_id}")
async def delete_album(
    album_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an album and all its photos"""
    
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Album not found"
        )
    
    if album.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this album"
        )
    
    # Delete all photos in album
    db.query(AlbumPhoto).filter(AlbumPhoto.album_id == album_id).delete()
    
    # Delete album
    db.delete(album)
    db.commit()
    
    return {"message": "Album deleted successfully"}

@router.post("/{album_id}/photos")
async def add_photos_to_album(
    album_id: int,
    photos: List[UploadFile] = File(...),
    captions: Optional[List[str]] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add photos to an album"""
    
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Album not found"
        )
    
    if album.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add photos to this album"
        )
    
    added_photos = []
    
    for i, photo_file in enumerate(photos):
        # Validate file type
        if not photo_file.content_type.startswith("image/"):
            continue
        
        # Save photo file
        photo_url = await save_upload_file(photo_file, "albums")
        
        # Get caption for this photo
        caption = None
        if captions and i < len(captions):
            caption = captions[i]
        
        # Create album photo record
        album_photo = AlbumPhoto(
            album_id=album_id,
            photo_url=photo_url,
            caption=caption
        )
        
        db.add(album_photo)
        added_photos.append({
            "photo_url": photo_url,
            "caption": caption
        })
    
    # Update album updated_at
    album.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": f"Added {len(added_photos)} photos to album",
        "added_photos": added_photos
    }

@router.delete("/{album_id}/photos/{photo_id}")
async def remove_photo_from_album(
    album_id: int,
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a photo from an album"""
    
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Album not found"
        )
    
    if album.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this album"
        )
    
    photo = db.query(AlbumPhoto).filter(
        AlbumPhoto.id == photo_id,
        AlbumPhoto.album_id == album_id
    ).first()
    
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found in album"
        )
    
    db.delete(photo)
    album.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Photo removed from album"}

@router.put("/{album_id}/photos/{photo_id}")
async def update_photo_caption(
    album_id: int,
    photo_id: int,
    caption: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update photo caption"""
    
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Album not found"
        )
    
    if album.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this album"
        )
    
    photo = db.query(AlbumPhoto).filter(
        AlbumPhoto.id == photo_id,
        AlbumPhoto.album_id == album_id
    ).first()
    
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found in album"
        )
    
    photo.caption = caption
    db.commit()
    
    return {
        "message": "Photo caption updated",
        "photo": {
            "id": photo.id,
            "caption": photo.caption
        }
    }

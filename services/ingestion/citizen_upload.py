import logging
import uuid
import magic
from typing import Tuple, Dict, Any
from fastapi import UploadFile, HTTPException
from PIL import Image
from io import BytesIO

logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "video/mp4": "mp4"
}

MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB
MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024  # 50MB

def scan_for_malware(file_bytes: bytes) -> bool:
    """
    Placeholder for ClamAV integration.
    """
    # Real implementation would pass to ClamAV daemon
    return True

def strip_exif_data(file_bytes: bytes) -> bytes:
    """
    Strips EXIF metadata from images to protect privacy.
    """
    try:
        image = Image.open(BytesIO(file_bytes))
        data = list(image.getdata())
        image_without_exif = Image.new(image.mode, image.size)
        image_without_exif.putdata(data)
        
        output = BytesIO()
        image_without_exif.save(output, format=image.format or "JPEG")
        return output.getvalue()
    except Exception as e:
        logger.error(f"Failed to strip EXIF data: {e}")
        return file_bytes

async def validate_upload(file: UploadFile, privacy_mode: bool = True) -> Dict[str, Any]:
    """
    Validates user uploads for size, MIME type, magic bytes, sanitizes EXIF,
    generates a secure key, and returns info for secure storage.
    """
    file_bytes = await file.read()
    file_size = len(file_bytes)
    
    # 1. MIME type validation from header
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")
        
    # 2. File size limit
    if file.content_type.startswith("image/") and file_size > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Image exceeds 10MB limit")
    if file.content_type.startswith("video/") and file_size > MAX_VIDEO_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Video exceeds 50MB limit")
        
    # 3. File signature (magic bytes) validation
    mime_guesser = magic.Magic(mime=True)
    actual_mime = mime_guesser.from_buffer(file_bytes)
    if actual_mime not in ALLOWED_MIME_TYPES or actual_mime != file.content_type:
        raise HTTPException(status_code=400, detail="File content does not match extension")

    # 4. Malware scanning
    if not scan_for_malware(file_bytes):
        raise HTTPException(status_code=400, detail="Malware detected")
        
    # 5. EXIF metadata sanitization
    if privacy_mode and actual_mime.startswith("image/"):
        file_bytes = strip_exif_data(file_bytes)
        
    # 6. Filename sanitization and unique key generation
    ext = ALLOWED_MIME_TYPES[actual_mime]
    unique_id = uuid.uuid4().hex
    safe_filename = f"{unique_id}.{ext}"
    
    # Return information for storage (isolated bucket 'field-media')
    return {
        "bucket": "field-media",
        "storage_key": safe_filename,
        "content_type": actual_mime,
        "sanitized_bytes": file_bytes,
        "signed_url_placeholder": f"https://storage.example.com/field-media/{safe_filename}?signature=..."
    }

from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from uuid import UUID
from typing import List, Optional

from services.api.database import get_db
from services.api.deps import get_current_user, require_role
from services.api.models.user import User, UserRole
from services.api.models.citizen_report import CitizenReport, VerificationStatus, ReportCategory
from services.api.schemas.common import PaginatedResponse

router = APIRouter()

@router.post("", status_code=status.HTTP_201_CREATED)
async def submit_report(
    lat: float = Form(...),
    lon: float = Form(...),
    category: ReportCategory = Form(...),
    description: str = Form(...),
    files: List[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    # Process files and upload to MinIO...
    media_urls = []
    
    report = CitizenReport(
        location=f"POINT({lon} {lat})",
        state="Unknown",
        district="Unknown",
        category=category,
        description=description,
        timestamp=datetime.now(),
        media_urls=media_urls
    )
    
    db.add(report)
    await db.commit()
    await db.refresh(report)
    
    return report

@router.get("", response_model=PaginatedResponse)
async def list_reports(
    status_filter: Optional[VerificationStatus] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    query = select(CitizenReport)
    if status_filter:
        query = query.where(CitizenReport.verification_status == status_filter)
        
    query = query.offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    reports = result.scalars().all()
    
    return PaginatedResponse(
        data=list(reports),
        total=len(reports),
        page=page,
        size=size,
        pages=1
    )

@router.get("/{report_id}")
async def get_report(
    report_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(CitizenReport).where(CitizenReport.id == report_id))
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    return report

@router.patch("/{report_id}/verify")
async def verify_report(
    report_id: UUID,
    status: VerificationStatus,
    notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.FIELD_OFFICER, UserRole.DISTRICT_ADMIN]))
):
    result = await db.execute(select(CitizenReport).where(CitizenReport.id == report_id))
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    report.verification_status = status
    report.verified_by = current_user.id
    report.verified_at = datetime.now()
    report.verification_notes = notes
    
    await db.commit()
    return report

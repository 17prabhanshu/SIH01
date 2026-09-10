from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from uuid import UUID
from typing import List, Optional

from services.api.database import get_db
from services.api.deps import get_current_user, require_role
from services.api.models.user import User, UserRole
from services.api.models.alert import Alert, AlertStatus
from services.api.schemas.common import PaginatedResponse

router = APIRouter()

@router.get("", response_model=PaginatedResponse)
async def list_alerts(
    status_filter: Optional[AlertStatus] = None,
    state: Optional[str] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Alert)
    if status_filter:
        query = query.where(Alert.status == status_filter)
    if state:
        query = query.where(Alert.state == state)
        
    query = query.offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    alerts = result.scalars().all()
    
    return PaginatedResponse(
        data=list(alerts),
        total=len(alerts), # Should be a count query in reality
        page=page,
        size=size,
        pages=1
    )

@router.get("/{alert_id}")
async def get_alert(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    return alert

@router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN, UserRole.STATE_ADMIN, UserRole.NATIONAL_ADMIN]))
):
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    if alert.status != AlertStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Only active alerts can be acknowledged")
        
    alert.status = AlertStatus.ACKNOWLEDGED
    alert.acknowledged_by = str(current_user.id)
    alert.acknowledged_at = datetime.now()
    
    await db.commit()
    return alert

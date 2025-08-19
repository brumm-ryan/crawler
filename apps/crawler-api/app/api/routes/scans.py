from typing import List, Optional, Dict, Any
from datetime import datetime

from fastapi import Depends, HTTPException, APIRouter, Query
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.datasheets import Datasheet
from app.models.scans import Scan, ScanCreate, ScanRead, ScanUpdate
from app.models.scan_results import (
    ScanResult, 
    ScanResultCreate, 
    ScanResultRead, 
    ScanCompletionRequest, 
    ScanCompletionResponse
)
from app.core.temporal_client import TemporalClientSingleton


router = APIRouter()

@router.post("/scans/", response_model=ScanRead)
async def create_scan(scan: ScanCreate,
    session: Session = Depends(get_session)):
    datasheet = session.get(Datasheet, scan.datasheet_id)
    if not datasheet:
        raise HTTPException(
            status_code=404,
            detail=f"Datasheet with id {scan.datasheet_id} not found"
        )

    # 2. Create the scan record in the database with an initial "PENDING" status.
    # This allows us to get a unique ID for the scan.
    db_scan = Scan.from_orm(scan)
    db_scan.status = "PENDING"
    session.add(db_scan)
    session.commit()
    session.refresh(db_scan)

    try:
        # 3. Connect to the Temporal client.
        try:
            temporal_client = await TemporalClientSingleton().connect()
        except Exception as conn_err:
            # Specific error for connection issues
            db_scan.status = "FAILED"
            session.add(db_scan)
            session.commit()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to connect to Temporal service: {str(conn_err)}"
            )

        datasheet_dict = datasheet.dict(include={"first_name", "last_name"})

        try:
            handle = await temporal_client.start_workflow(
                "crawlWorkflow",
                datasheet_dict,
                id=f"scan-{db_scan.id}",
                task_queue="crawler-queue",
                # Note: This should be an environment variable or config value
            )
        except Exception as workflow_err:
            # Specific error for workflow start issues
            db_scan.status = "FAILED"
            session.add(db_scan)
            session.commit()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to start workflow: {str(workflow_err)}"
            )

        # 5. Update the scan with the workflow ID and "STARTED" status.
        db_scan.workflow_id = handle.id
        db_scan.status = "STARTED"
        session.add(db_scan)
        session.commit()
        session.refresh(db_scan)

    except Exception as e:
        # If any other unexpected error occurs
        db_scan.status = "FAILED"
        session.add(db_scan)
        session.commit()
        # It's good practice to log the actual exception `e` here.
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start crawl workflow: {str(e)}"
        )

    return db_scan

@router.get("/scans/", response_model=List[ScanRead])
def read_scans(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None, description="Filter scans by status"),
    session: Session = Depends(get_session)
):
    """Get all scans with optional filtering by status."""
    query = select(Scan)

    if status:
        query = query.where(Scan.status == status)

    scans = session.exec(query.offset(skip).limit(limit)).all()
    return scans

@router.get("/scans/{scan_id}", response_model=ScanRead)
def read_scan(scan_id: int, session: Session = Depends(get_session)):
    """Get a specific scan by ID."""
    scan = session.get(Scan, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


# Internal API endpoints for stagehand-temporal service
@router.post("/internal/scans/{scan_id}/complete", response_model=ScanCompletionResponse)
async def complete_scan(
    scan_id: int,
    completion_data: ScanCompletionRequest,
    session: Session = Depends(get_session)
):
    """
    Internal API endpoint for persisting scan completion data from stagehand-temporal.
    """
    # Verify scan exists
    scan = session.get(Scan, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    try:
        results = completion_data.results or {}
        errors = completion_data.errors or {}
        global_error = completion_data.global_error
        
        # Process successful results
        for site_id_str, result_data in results.items():
            try:
                site_id = int(site_id_str)
            except ValueError:
                continue  # Skip non-numeric site IDs
            
            # Check if result already exists for this scan/site combination
            existing_result = session.exec(
                select(ScanResult).where(
                    ScanResult.scan_id == scan_id,
                    ScanResult.site_id == site_id
                )
            ).first()
            
            if existing_result:
                # Update existing result
                existing_result.data = result_data
                existing_result.status = "completed"
                existing_result.updated_at = datetime.utcnow()
                existing_result.error_message = None  # Clear any previous errors
                session.add(existing_result)
            else:
                # Create new result
                scan_result = ScanResult(
                    scan_id=scan_id,
                    site_id=site_id,
                    status="completed",
                    data=result_data
                )
                session.add(scan_result)

        # Process errors
        for site_id_str, error_message in errors.items():
            try:
                site_id = int(site_id_str)
            except ValueError:
                continue  # Skip non-numeric site IDs
            
            # Check if result already exists for this scan/site combination
            existing_result = session.exec(
                select(ScanResult).where(
                    ScanResult.scan_id == scan_id,
                    ScanResult.site_id == site_id
                )
            ).first()
            
            if existing_result:
                # Update existing result with error
                existing_result.status = "failed"
                existing_result.error_message = str(error_message)
                existing_result.updated_at = datetime.utcnow()
                existing_result.data = None  # Clear any previous data
                session.add(existing_result)
            else:
                # Create new error result
                scan_result = ScanResult(
                    scan_id=scan_id,
                    site_id=site_id,
                    status="failed",
                    error_message=str(error_message)
                )
                session.add(scan_result)

        # Determine overall scan status
        if completion_data.status:
            final_status = completion_data.status
        elif results and not errors:
            final_status = "completed"
        elif errors and not results:
            final_status = "failed"
        elif results and errors:
            final_status = "partial"
        else:
            final_status = "failed"  # No results or errors provided

        # Update scan status
        scan.status = final_status
        scan.updated_at = datetime.utcnow()
        if final_status in ["completed", "partial"]:
            scan.completed_at = datetime.utcnow()
        session.add(scan)

        session.commit()
        
        return ScanCompletionResponse(
            message="Scan completion data persisted successfully",
            scan_id=scan_id,
            final_status=final_status,
            results_count=len(results),
            errors_count=len(errors)
        )
    
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to persist scan completion data: {str(e)}"
        )


@router.get("/scans/{scan_id}/results", response_model=List[ScanResultRead])
def get_scan_results(scan_id: int, session: Session = Depends(get_session)):
    """Get all results for a specific scan."""
    # Verify scan exists
    scan = session.get(Scan, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    results = session.exec(
        select(ScanResult).where(ScanResult.scan_id == scan_id)
    ).all()
    
    return results

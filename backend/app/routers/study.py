from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth, spaced_repetition

router = APIRouter()

@router.get("/sets/{set_id}/due", response_model=List[schemas.FlashcardWithProgress])
def get_cards_due_for_review(
    set_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get flashcards that are due for review"""
    db_set = db.query(models.FlashcardSet).filter(models.FlashcardSet.id == set_id).first()
    if not db_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")
    
    due_cards = spaced_repetition.get_cards_due_for_review(db, current_user.id, set_id)
    
    result = []
    for card in due_cards:
        # Get or create study record
        study_record = db.query(models.StudyRecord).filter(
            models.StudyRecord.flashcard_id == card.id,
            models.StudyRecord.user_id == current_user.id
        ).first()
        
        if not study_record:
            study_record = models.StudyRecord(
                flashcard_id=card.id,
                user_id=current_user.id
            )
            db.add(study_record)
            db.commit()
            db.refresh(study_record)
        
        card_data = schemas.FlashcardWithProgress(
            id=card.id,
            set_id=card.set_id,
            front=card.front,
            back=card.back,
            created_at=card.created_at,
            ease_factor=study_record.ease_factor,
            interval=study_record.interval,
            next_review_date=study_record.next_review_date,
            total_reviews=study_record.total_reviews,
            correct_count=study_record.correct_count,
            incorrect_count=study_record.incorrect_count
        )
        result.append(card_data)
    
    return result

@router.post("/answer")
def submit_answer(
    answer: schemas.StudyAnswer,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Submit answer for a flashcard and update spaced repetition data"""
    flashcard = db.query(models.Flashcard).filter(models.Flashcard.id == answer.flashcard_id).first()
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    # Get or create study record
    study_record = db.query(models.StudyRecord).filter(
        models.StudyRecord.flashcard_id == answer.flashcard_id,
        models.StudyRecord.user_id == current_user.id
    ).first()
    
    if not study_record:
        study_record = models.StudyRecord(
            flashcard_id=answer.flashcard_id,
            user_id=current_user.id
        )
        db.add(study_record)
        db.commit()
        db.refresh(study_record)
    
    # Update with spaced repetition algorithm
    spaced_repetition.update_study_record(db, study_record, answer.quality)
    
    return {
        "message": "Answer recorded",
        "ease_factor": study_record.ease_factor,
        "interval": study_record.interval,
        "next_review_date": study_record.next_review_date
    }

@router.post("/sessions", response_model=schemas.StudySessionResponse)
def create_study_session(
    session_data: schemas.StudySessionCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new study session"""
    db_set = db.query(models.FlashcardSet).filter(models.FlashcardSet.id == session_data.set_id).first()
    if not db_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")
    
    db_session = models.StudySession(
        user_id=current_user.id,
        set_id=session_data.set_id
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.put("/sessions/{session_id}", response_model=schemas.StudySessionResponse)
def complete_study_session(
    session_id: int,
    cards_studied: int,
    cards_correct: int,
    cards_incorrect: int,
    duration_minutes: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Complete a study session"""
    db_session = db.query(models.StudySession).filter(
        models.StudySession.id == session_id,
        models.StudySession.user_id == current_user.id
    ).first()
    
    if not db_session:
        raise HTTPException(status_code=404, detail="Study session not found")
    
    db_session.cards_studied = cards_studied
    db_session.cards_correct = cards_correct
    db_session.cards_incorrect = cards_incorrect
    db_session.duration_minutes = duration_minutes
    db_session.completed_at = datetime.utcnow()
    
    # Update leaderboard
    leaderboard = db.query(models.Leaderboard).filter(
        models.Leaderboard.user_id == current_user.id
    ).first()
    
    if leaderboard:
        leaderboard.total_study_time += duration_minutes
        leaderboard.total_cards_studied += cards_studied
        leaderboard.total_correct += cards_correct
        
        # Calculate points (simple scoring system)
        leaderboard.points = (
            leaderboard.total_cards_studied * 10 +
            leaderboard.total_correct * 5 +
            leaderboard.streak_days * 20
        )
        
        # Update streak
        today = datetime.utcnow().date()
        if leaderboard.last_study_date:
            last_date = leaderboard.last_study_date.date()
            if (today - last_date).days == 1:
                leaderboard.streak_days += 1
            elif (today - last_date).days > 1:
                leaderboard.streak_days = 1
        else:
            leaderboard.streak_days = 1
        
        leaderboard.last_study_date = datetime.utcnow()
    
    db.commit()
    db.refresh(db_session)
    return db_session

@router.get("/progress/{set_id}", response_model=schemas.StudyProgress)
def get_study_progress(
    set_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get study progress for a flashcard set"""
    db_set = db.query(models.FlashcardSet).filter(models.FlashcardSet.id == set_id).first()
    if not db_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")
    
    total_cards = len(db_set.flashcards)
    due_cards = spaced_repetition.get_cards_due_for_review(db, current_user.id, set_id)
    cards_to_review = len(due_cards)
    
    # Count mastered cards (interval > 30 days and correct_count > 5)
    mastered = db.query(models.StudyRecord).filter(
        models.StudyRecord.user_id == current_user.id,
        models.StudyRecord.flashcard.has(models.Flashcard.set_id == set_id),
        models.StudyRecord.interval > 30,
        models.StudyRecord.correct_count > 5
    ).count()
    
    # Get daily progress
    today = datetime.utcnow().date()
    today_sessions = db.query(models.StudySession).filter(
        models.StudySession.user_id == current_user.id,
        models.StudySession.set_id == set_id,
        models.StudySession.started_at >= datetime.combine(today, datetime.min.time())
    ).all()
    
    daily_progress = sum(session.cards_studied for session in today_sessions)
    daily_goal = 20  # Default daily goal
    
    # Get streak from leaderboard
    leaderboard = db.query(models.Leaderboard).filter(
        models.Leaderboard.user_id == current_user.id
    ).first()
    streak_days = leaderboard.streak_days if leaderboard else 0
    
    return schemas.StudyProgress(
        total_cards=total_cards,
        cards_to_review=cards_to_review,
        cards_mastered=mastered,
        daily_goal=daily_goal,
        daily_progress=daily_progress,
        streak_days=streak_days
    )


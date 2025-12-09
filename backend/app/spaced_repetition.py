"""
Spaced Repetition Algorithm (SM-2)
Based on SuperMemo 2 algorithm
"""
from datetime import datetime, timedelta, timezone
from typing import Tuple
from sqlalchemy.orm import Session
from app import models

def calculate_next_review(
    ease_factor: float,
    interval: int,
    repetitions: int,
    quality: int  # 0-5 rating
) -> Tuple[float, int, int, datetime]:
    """
    Calculate next review parameters based on SM-2 algorithm
    
    Quality ratings:
    0-1: Incorrect response
    2-3: Correct response with difficulty
    4-5: Perfect response
    
    Returns: (new_ease_factor, new_interval, new_repetitions, next_review_date)
    """
    if quality < 3:  # Incorrect or difficult response
        repetitions = 0
        interval = 1
    else:  # Correct response
        if repetitions == 0:
            interval = 1
        elif repetitions == 1:
            interval = 6
        else:
            interval = int(interval * ease_factor)
        repetitions += 1
    
    # Adjust ease factor
    ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    ease_factor = max(1.3, ease_factor)  # Minimum ease factor
    
    next_review_date = datetime.now(timezone.utc) + timedelta(days=interval)
    
    return ease_factor, interval, repetitions, next_review_date

def update_study_record(
    db: Session,
    study_record: models.StudyRecord,
    quality: int
):
    """Update study record with new spaced repetition data"""
    ease_factor, interval, repetitions, next_review_date = calculate_next_review(
        study_record.ease_factor,
        study_record.interval,
        study_record.repetitions,
        quality
    )
    
    study_record.ease_factor = ease_factor
    study_record.interval = interval
    study_record.repetitions = repetitions
    study_record.next_review_date = next_review_date
    study_record.last_reviewed = datetime.now(timezone.utc)
    study_record.total_reviews += 1
    
    if quality >= 3:
        study_record.correct_count += 1
    else:
        study_record.incorrect_count += 1
    
    db.commit()
    db.refresh(study_record)
    
    return study_record

def get_cards_due_for_review(
    db: Session,
    user_id: int,
    set_id: int
) -> list[models.Flashcard]:
    """Get flashcards that are due for review"""
    now = datetime.now(timezone.utc)
    
    # Get all flashcards in the set
    all_flashcards = db.query(models.Flashcard).filter(
        models.Flashcard.set_id == set_id
    ).all()
    
    # Get study records for this user and set
    all_study_records = db.query(models.StudyRecord).filter(
        models.StudyRecord.user_id == user_id,
        models.StudyRecord.flashcard_id.in_([card.id for card in all_flashcards])
    ).all()
    
    record_dict = {record.flashcard_id: record for record in all_study_records}
    
    # Separate cards into due and new
    due_cards = []
    for card in all_flashcards:
        record = record_dict.get(card.id)
        if record is None:
            # New card, no study record yet
            due_cards.append(card)
        elif record.next_review_date is None or record.next_review_date <= now:
            # Card is due for review
            due_cards.append(card)
    
    return due_cards


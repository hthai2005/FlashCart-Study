from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter()

@router.post("/sets", response_model=schemas.FlashcardSetResponse)
def create_flashcard_set(
    set_data: schemas.FlashcardSetCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_set = models.FlashcardSet(
        **set_data.dict(),
        owner_id=current_user.id
    )
    db.add(db_set)
    db.commit()
    db.refresh(db_set)
    return db_set

@router.get("/sets", response_model=List[schemas.FlashcardSetResponse])
def get_flashcard_sets(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    sets = db.query(models.FlashcardSet).filter(
        (models.FlashcardSet.owner_id == current_user.id) |
        (models.FlashcardSet.is_public == True)
    ).offset(skip).limit(limit).all()
    return sets

@router.get("/sets/{set_id}", response_model=schemas.FlashcardSetWithCards)
def get_flashcard_set(
    set_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_set = db.query(models.FlashcardSet).filter(models.FlashcardSet.id == set_id).first()
    if not db_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")
    
    if db_set.owner_id != current_user.id and not db_set.is_public:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return db_set

@router.put("/sets/{set_id}", response_model=schemas.FlashcardSetResponse)
def update_flashcard_set(
    set_id: int,
    set_data: schemas.FlashcardSetBase,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_set = db.query(models.FlashcardSet).filter(models.FlashcardSet.id == set_id).first()
    if not db_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")
    
    if db_set.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    for key, value in set_data.dict().items():
        setattr(db_set, key, value)
    
    db.commit()
    db.refresh(db_set)
    return db_set

@router.delete("/sets/{set_id}")
def delete_flashcard_set(
    set_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_set = db.query(models.FlashcardSet).filter(models.FlashcardSet.id == set_id).first()
    if not db_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")
    
    if db_set.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(db_set)
    db.commit()
    return {"message": "Flashcard set deleted"}

@router.post("/sets/{set_id}/cards", response_model=schemas.FlashcardResponse)
def create_flashcard(
    set_id: int,
    card: schemas.FlashcardCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_set = db.query(models.FlashcardSet).filter(models.FlashcardSet.id == set_id).first()
    if not db_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")
    
    if db_set.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_card = models.Flashcard(**card.dict(), set_id=set_id)
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card

@router.get("/sets/{set_id}/cards", response_model=List[schemas.FlashcardResponse])
def get_flashcards(
    set_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_set = db.query(models.FlashcardSet).filter(models.FlashcardSet.id == set_id).first()
    if not db_set:
        raise HTTPException(status_code=404, detail="Flashcard set not found")
    
    if db_set.owner_id != current_user.id and not db_set.is_public:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return db_set.flashcards

@router.put("/cards/{card_id}", response_model=schemas.FlashcardResponse)
def update_flashcard(
    card_id: int,
    card: schemas.FlashcardBase,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_card = db.query(models.Flashcard).filter(models.Flashcard.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    if db_card.set.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    for key, value in card.dict().items():
        setattr(db_card, key, value)
    
    db.commit()
    db.refresh(db_card)
    return db_card

@router.delete("/cards/{card_id}")
def delete_flashcard(
    card_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_card = db.query(models.Flashcard).filter(models.Flashcard.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    if db_card.set.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(db_card)
    db.commit()
    return {"message": "Flashcard deleted"}


from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_history():
    # To be implemented with Supabase Auth / RLS
    return {"message": "History endpoint (requires auth)", "data": []}

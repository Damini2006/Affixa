from fastapi import APIRouter

router = APIRouter()

@router.get("/summary")
async def get_analytics_summary():
    # To be implemented with Supabase Analytics Cache
    return {
        "message": "Analytics summary",
        "total_analyzed": 0,
        "most_frequent_prefix": None,
        "most_frequent_suffix": None,
        "most_frequent_root": None
    }

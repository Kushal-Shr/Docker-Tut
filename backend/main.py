from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScoreEntry(BaseModel):
    player: str
    score: int

# In-memory database for leaderboards
# format: { "snake": [{"player": "Alice", "score": 100}, ...], "tictactoe": [...] }
leaderboards: Dict[str, List[Dict[str, any]]] = {
    "snake": [],
    "tictactoe": [],
    "memory": [],
    "rps": [],
    "2048": [],
    "minesweeper": []
}

@app.get("/leaderboards")
def get_all_leaderboards():
    return leaderboards

@app.get("/leaderboard/{game_id}")
def get_leaderboard(game_id: str):
    if game_id not in leaderboards:
        return {"error": "Game not found"}
    return {"leaderboard": leaderboards[game_id]}

@app.post("/score/{game_id}")
def post_score(game_id: str, entry: ScoreEntry):
    if game_id not in leaderboards:
        leaderboards[game_id] = []
    
    leaderboards[game_id].append({"player": entry.player, "score": entry.score})
    # Sort descending and keep top 10
    leaderboards[game_id] = sorted(leaderboards[game_id], key=lambda x: x["score"], reverse=True)[:10]
    
    return {"success": True, "leaderboard": leaderboards[game_id]}

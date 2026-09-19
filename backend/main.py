from fastapi import FastAPI
from pydantic import BaseModel
import random
from typing import List, Dict
import asyncio
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

class Order(BaseModel):
    id: int
    name: str
    ingredients: List[str]

class ServeRequest(BaseModel):
    ingredients: List[str]

RECIPES = {
    "Burger": ["bun", "cooked_meat"],
    "Salad": ["lettuce", "tomato"],
    "Sushi": ["rice", "fish"],
    "Soup": ["water", "tomato", "cooked_meat"]
}

state = {
    "score": 0,
    "active_orders": [],
    "order_id_counter": 0,
    "bg_task": None
}

def generate_order():
    name, ingredients = random.choice(list(RECIPES.items()))
    state["order_id_counter"] += 1
    state["active_orders"].append({
        "id": state["order_id_counter"],
        "name": name,
        "ingredients": ingredients
    })

async def order_generator_task():
    try:
        while True:
            await asyncio.sleep(random.randint(10, 20))
            if len(state["active_orders"]) < 5:
                generate_order()
    except asyncio.CancelledError:
        pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    generate_order()
    state["bg_task"] = asyncio.create_task(order_generator_task())
    yield
    # Shutdown
    if state["bg_task"]:
        state["bg_task"].cancel()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/orders")
def get_orders():
    return {"orders": state["active_orders"], "score": state["score"], "recipes": RECIPES}

@app.post("/serve")
def serve_dish(req: ServeRequest):
    req_ingredients = sorted(req.ingredients)
    
    for i, order in enumerate(state["active_orders"]):
        order_ingredients = sorted(order["ingredients"])
        if req_ingredients == order_ingredients:
            state["score"] += 10
            state["active_orders"].pop(i)
            # Instantly generate a new one to keep it fun
            generate_order()
            return {"success": True, "score": state["score"], "message": f"Served {order['name']}!"}
            
    return {"success": False, "score": state["score"], "message": "No matching order found!"}

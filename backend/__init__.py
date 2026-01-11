from fastapi import FastAPI
from contextlib import asynccontextmanager
from beanie import init_beanie
from pymongo import AsyncMongoClient



@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_beanie(
        AsyncMongoClient("mongodb://localhost:27017").get_default_database(),
        document_models=[User]
    )
    print("MongoDb Connected")
    yield
    await client.close()

app = FastAPI()



@app.get("/")
async def health_check():
    return {"message": "Server is working"}
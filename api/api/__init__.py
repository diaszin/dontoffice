from fastapi import FastAPI
from dotenv import load_dotenv
from os import getenv

load_dotenv()

host = getenv("HOST")
port = getenv("PORT")

app = FastAPI(
    host=host,
    port=port
)


@app.get("/")
def hello():
    return "Hello world !"
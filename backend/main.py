from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil
import tempfile
import os
from gemini import gemini
from supabase import create_client, Client
import dotenv
# from pydantic import BaseModel, Field
from typing import Annotated
import json


dotenv.load_dotenv()
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client('https://ykocmmofnolamcwtlftb.supabase.co', SUPABASE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/upload-audio")
async def upload_audio(project_id: Annotated[str, Form()], audio: UploadFile = File(...)): # , audio: UploadFile = File(...)
    try:
        data = supabase.table("projects").select("description").eq("project_id", project_id).execute()
        description = data.data[0]["description"]
        data = supabase.table("user_stories").select("id, title, story, points").eq("project_id", project_id).execute()
        stories = data.data
        data = supabase.rpc("fetch_project_tasks", {"p_project_id": project_id}).execute()
        tasks = data.data

        print(tasks)
        print(stories)
        
        # Create a temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            # Get the temporary path
            temp_path = os.path.join(temp_dir, "temp_mp3.mp3")
            
            # Copy the uploaded MP3 file to the temporary location
            try:
                with open(temp_path, "wb") as buffer:
                    shutil.copyfileobj(audio.file, buffer)
                # desc = ("This is an app that allows users to find restaurants near to their current location. Users can use this app to "
                #     "search for restaurants based off of location, cusine, distance, ratings, etc. The user can view restaurant details and "
                #     "save restaurants to their account")
                # tasks = [{"dependencies": [], "difficulty": 13, "task_id": 1, "name": "Implement restaurant search functionality", "priority": 10, "status": 0, "story_id": 1}, {"dependencies": [1], "difficulty": 8, "task_id": 2, "name": "Display search results", "priority": 9, "status": 0, "story_id": 1}, {"dependencies": [], "difficulty": 13, "task_id": 3, "name": "Implement user location services", "priority": 8, "status": 0, "story_id": 1}, {"dependencies": [3], "difficulty": 8, "task_id": 4, "name": "Implement user authentication", "priority": 6, "status": 0, "story_id": 2}, {"dependencies": [2], "difficulty": 5, "task_id": 5, "name": "Implement saved restaurants functionality", "priority": 5, "status": 0, "story_id": 2}, {"dependencies": [3, 4], "difficulty": 3, "task_id": 6, "name": "Create saved restaurants page", "priority": 5, "status": 0, "story_id": 2}, {"dependencies": [4], "difficulty": 8, "task_id": 7, "name": "Implement search filters", "priority": 7, "status": 0, "story_id": 3}, {"dependencies": [2], "difficulty": 8, "task_id": 9, "priority": 7, "status": 0, "story_id": 8}]

                # stories = [{"id": 1, "points": 8, "story": "As a user I want to be able to search for restaurants based on name, cuisine, rating, and distance from me. I want to find restaurants that are near my current location.", "title": "Search for Restaurants"}, {"id": 2, "points": 3, "story": "as a logged in user, i want to be able to save restaurants to my profile where i can view them in a saved restaurants page", "title": "Save Restaurants"}, {"id": 3, "points": 5, "story": "as a user i want to be able to filter search results by distance, rating, cuisine.", "title": "Filter Search Results"}, {"id": 8, "points": 5, "story": "As a user, I want to be able to view restaurant details such as opening hours, address, phone number, and menu when I select a restaurant from the search results.", "title": "View Restaurant Details"}]
                res = gemini(True, "We have finished all tasks regarding search capabilities but our client wants to add a new feature where a logged in user can write and post reviews through our site", description, stories, tasks)

                # Delete the temporary MP3 file
                os.remove(temp_path)
                print(res.text)
                return {"message": "hi"}
            except Exception as e:
                return {"message": f"Error processing MP3 file: {str(e)}"}
        # return {"description": description, "stories": stories, "tasks": tasks}
    except Exception as e:
        return {"message": str(e)}
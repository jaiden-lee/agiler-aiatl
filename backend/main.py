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
    print(project_id)
    print(audio.filename)
    try:
        data = supabase.table("projects").select("description").eq("project_id", project_id).execute()
        description = data.data[0]["description"]
        data = supabase.table("user_stories").select("id, title, story, points").eq("project_id", project_id).execute()
        stories = data.data
        data = supabase.rpc("fetch_project_tasks", {"p_project_id": project_id}).execute()
        tasks = data.data
        
        # Create a temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            # Get the temporary path
            temp_path = os.path.join(temp_dir, "temp_mp3.mp3")
            
            # Copy the uploaded MP3 file to the temporary location
            try:
                with open(temp_path, "wb") as buffer:
                    shutil.copyfileobj(audio.file, buffer)
                
                res = gemini(False, temp_path, description, stories, tasks)
                if "error" in res:
                    return {"message": "The model failed to generate the proper output"}
                
                
                
                idMap = {}
                if "stories" in res:
                    output_stories = res["stories"]
                    for story in output_stories:
                        if story["new"] == True:
                            try:
                                data = supabase.table("user_stories").insert({
                                    "title": story["title"],
                                    "story": story["story"],
                                    "points": story["points"],
                                    "project_id": project_id
                                }).execute()
                                idMap[story["id"]] = data.data[0]["id"]
                            except Exception as e:
                                print(str(e))
                        else:
                            try:
                                supabase.table("user_stories").update({
                                    "title": story["title"],
                                    "story": story["story"],
                                    "points": story["points"]
                                }).eq("id", story["id"]).execute()
                            except:
                                print(str(e))
                if "tasks" in res:
                    output_tasks = res["tasks"]
                    for task in output_tasks:
                        if task["new"] == True:
                            try:
                                data = supabase.table("tasks").insert({
                                    "story_id": idMap[task["story_id"]],
                                    "name": task["name"],
                                    "difficulty": task["difficulty"],
                                    "priority": task["priority"],
                                    "status": task["status"],
                                    "dependencies": task["dependencies"]
                                }).execute()
                                print(data)
                            except Exception as e:
                                print(str(e))
                        else:
                            try:
                                data = supabase.table("tasks").update({
                                    "story_id": task["story_id"],
                                    "name": task["name"],
                                    "difficulty": task["difficulty"],
                                    "priority": task["priority"],
                                    "status": task["status"],
                                    "dependencies": task["dependencies"]
                                }).eq("task_id", task["task_id"]).execute()
                                print(data)
                            except Exception as e:
                                print()
                                print(str(e))

                # Delete the temporary MP3 file
                os.remove(temp_path)
                print(res)
                return {"success": True}
            except Exception as e:
                return {"message": f"Error processing MP3 file: {str(e)}"}
        # return {"description": description, "stories": stories, "tasks": tasks}
    except Exception as e:
        return {"message": str(e)}


@app.post("/upload-text")
async def upload_audio(project_id: Annotated[str, Form()], text: Annotated[str, Form()]): # , audio: UploadFile = File(...)
    print(project_id)
    try:
        data = supabase.table("projects").select("description").eq("project_id", project_id).execute()
        description = data.data[0]["description"]
        data = supabase.table("user_stories").select("id, title, story, points").eq("project_id", project_id).execute()
        stories = data.data
        data = supabase.rpc("fetch_project_tasks", {"p_project_id": project_id}).execute()
        tasks = data.data
        
        res = gemini(True, text, description, stories, tasks)
        if "error" in res:
            return {"message": "The model failed to generate the proper output"}
        
        
        
        idMap = {}
        if "stories" in res:
            output_stories = res["stories"]
            for story in output_stories:
                if story["new"] == True:
                    try:
                        data = supabase.table("user_stories").insert({
                            "title": story["title"],
                            "story": story["story"],
                            "points": story["points"],
                            "project_id": project_id
                        }).execute()
                        idMap[story["id"]] = data.data[0]["id"]
                    except Exception as e:
                        print(str(e))
                else:
                    try:
                        supabase.table("user_stories").update({
                            "title": story["title"],
                            "story": story["story"],
                            "points": story["points"]
                        }).eq("id", story["id"]).execute()
                    except:
                        print(str(e))
        if "tasks" in res:
            output_tasks = res["tasks"]
            for task in output_tasks:
                if task["new"] == True:
                    try:
                        data = supabase.table("tasks").insert({
                            "story_id": idMap[task["story_id"]],
                            "name": task["name"],
                            "difficulty": task["difficulty"],
                            "priority": task["priority"],
                            "status": task["status"],
                            "dependencies": task["dependencies"]
                        }).execute()
                        print(data)
                    except Exception as e:
                        print(str(e))
                else:
                    try:
                        data = supabase.table("tasks").update({
                            "story_id": task["story_id"],
                            "name": task["name"],
                            "difficulty": task["difficulty"],
                            "priority": task["priority"],
                            "status": task["status"],
                            "dependencies": task["dependencies"]
                        }).eq("task_id", task["task_id"]).execute()
                        print(data)
                    except Exception as e:
                        print()
                        print(str(e))

        # Delete the temporary MP3 file
        print(res)
        return {"success": True}
        # return {"description": description, "stories": stories, "tasks": tasks}
    except Exception as e:
        return {"message": str(e)}
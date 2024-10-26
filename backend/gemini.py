import json
# For grabbing Gemini API Key
import os
from dotenv import load_dotenv

# Importing Gemini
import google.generativeai as genai
import typing_extensions as typing

# Load API key from .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# set up json format
class UserStory(typing.TypedDict):
    id: int
    title: str
    new: bool

class Task(typing.TypedDict):
     name: str
     id: int
     dependencies: list[int]
     difficulty: int
     priority: int
     status: str
     new: bool

class CombinedSchema(typing.TypedDict):
    tasks: list[Task]
    stories: list[UserStory]

#setting up gemini for 1.5 pro
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

# default values for inputs
description = "This application has no description"
user_stories = "There are currently no user stories"
tasks = "There are currently no tasks"
meeting_input = "There is no meeting input"

# Generates updates user stories and tasks in an array of two JSON files, [{}, {}]. The first JSON file is the user stories
# The second JSON file are the tasks
def gemini(isTextBox: bool, meeting_input, description, user_stories, tasks):
    input_string = f"""
        I need you to update user stories and tasks in the backlog for a project in JSON format. Here is the description of our project:
        {description}
        \nHere are our current user stories in JSON format:
        {user_stories}
        \nHere are our current tasks in the backlog in JSON format:
        {tasks}
        \nWe have since held a meeting, and the tasks in the backlog and the user stories may or may not need to be updated. 
        Updating the user stories and tasks include adding or editing user stories and tasks, and tasks may be moved between to-do, in progress, and done states.
        priority should be integers 1-10 where 1 is the highest priority, and 10 is the lowest priority. Difficulty should be fibonacci integers from 1-21 where 21 is extremely difficult. 
        Status should be either 'To-Do', 'In Progress', or 'Done'. Dependencies should be a list of other tasks' IDs this current task depends on. 
        userStory should be the user story's ID this current task is for. If the user story or task is brand new and not an old task or user story being updated, set new to true.
        Only return tasks or stories that have been edited or added and you must always return the ID as that is how the database will be updated.
        When new tasks are created, ALL fields must be filled out, especially name, priority, difficulty, priority, and dependencies.
    """

    if isTextBox:
        input_string = input_string + "\n This is the transcription/summary of the meeting: \n" + meeting_input

    else:
        genai.upload_file(meeting_input)
        input_string = input_string + "\n The meeting was uploaded."

    return model.generate_content(
        input_string,

        generation_config=genai.GenerationConfig(
            response_mime_type="application/json", response_schema=CombinedSchema,
            temperature=0.4
        ),
    )

desc = ("This is an app that allows users to find restaurants near to their current location. Users can use this app to "
     "search for restaurants based off of location, cusine, distance, ratings, etc. The user can view restaurant details and "
     "save restaurants to their account")
stories = [{"id": 1, "userStory": "As a user I want to be able to search for restaurants based on name, cusine, rating, and distance from me. I want to find restaurants that are near my current location."}, {"id": 2, "userStory": "As a user I want to be able to search for restaurants based on name, cusine, rating, and distance from me. I want to find restaurants that are near my current location."}, {"id": 3, "userStory": "As a user I want to be able to search for restaurants based on name, cusine, rating, and distance from me. I want to find restaurants that are near my current location."}, {"id": 4, "userStory": "as a logged in user, i want to be able to save restaurants to my profile where i can view them in a saved restaurants page"}, {"id": 5, "userStory": "as a logged in user, i want to be able to save restaurants to my profile where i can view them in a saved restaurants page"}, {"id": 6, "userStory": "as a logged in user, i want to be able to save restaurants to my profile where i can view them in a saved restaurants page"}, {"id": 7,"userStory": "as a user i want to be able to filter search results by distance, rating, cuisine."}]
tasks = [{"title": "Implement restaurant search functionality", "description": "Allow users to search for restaurants based on name, cuisine, rating, and distance from their current location.", "priority": 10, "difficulty": 13, "status": "To Do", "dependencies": [], "userStory": "As a user I want to be able to search for restaurants based on name, cusine, rating, and distance from me. I want to find restaurants that are near my current location."}, {"title": "Display search results", "description": "Display search results in a clear and concise manner, including relevant information such as restaurant name, cuisine, rating, and distance.", "priority": 9, "difficulty": 8, "status": "To Do", "dependencies": [1], "userStory": "As a user I want to be able to search for restaurants based on name, cusine, rating, and distance from me. I want to find restaurants that are near my current location."}, {"title": "Implement user location services", "description": "Utilize device GPS to determine the users current location and display nearby restaurants.", "priority": 8, "difficulty": 13, "status": "To Do", "dependencies": [], "userStory": "As a user I want to be able to search for restaurants based on name, cusine, rating, and distance from me. I want to find restaurants that are near my current location."}, {"title": "Implement user authentication", "description": "Allow users to create an account and log in to the app.", "priority": 6, "difficulty": 8, "status": "To Do", "dependencies": [3], "userStory": "as a logged in user, i want to be able to save restaurants to my profile where i can view them in a saved restaurants page"}, {"title": "Implement saved restaurants functionality", "description": "Allow logged-in users to save restaurants to their profile for future reference.", "priority": 5, "difficulty": 5, "status": "To Do", "dependencies": [2], "userStory": "as a logged in user, i want to be able to save restaurants to my profile where i can view them in a saved restaurants page"}, {"title": "Create saved restaurants page", "description": "Display a dedicated page where logged-in users can view their saved restaurants.", "priority": 5, "difficulty": 3, "status": "To Do", "dependencies": [3,4], "userStory": "as a logged in user, i want to be able to save restaurants to my profile where i can view them in a saved restaurants page"}, {"title": "Implement search filters", "description": "Allow users to filter search results by distance, rating, and cuisine.", "priority": 7, "difficulty": 8, "status": "To Do", "dependencies": [4], "userStory": "as a user i want to be able to filter search results by distance, rating, cuisine."}]
result = gemini(True, "We finished implementing all restaurant search capabilities. However, our client wants to add a new user story where a logged in user can write and post reviews through our site", desc, json.dumps(stories), json.dumps(tasks))
print(result.text)
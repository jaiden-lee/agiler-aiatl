import json
from supabase import create_client, Client
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
    story: str
    title: str
    points: int
    new: bool

class Task(typing.TypedDict):
     name: str
     task_id: int
     story_id: int
     dependencies: list[int]
     difficulty: int
     priority: int
     status: int
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
        If there are no tasks or user stories, you will need to generate all of them for the entire project based on the description.
        Updating the user stories and tasks include adding or editing user stories and tasks, and tasks may be moved between to-do, in progress, and done states.
        priority should be integers 1-10 where 1 is the highest priority, and 10 is the lowest priority. Difficulty should be fibonacci integers from 1-21 where 21 is extremely difficult. 
        Status should be either 0 for 'To-Do', 1 for 'In Progress', or 2 for 'Done'. Dependencies should be a list of other tasks' IDs this current task depends on. 
        userStory should be the user story's ID this current task is for. If the user story or task is brand new and not an old task or user story being updated, set new to true.
        story_id for tasks gives the ID of the story the current task works on.
        Points for user stories are the story points estimating difficulty to complete the entire story. The title should be a very short, the user story should be a detailed user story.
        Only return tasks or stories that have been edited or added and you must always return the ID as that is how the database will be updated.
        When new tasks are created, ALL fields must be filled out, especially name, priority, difficulty, priority, and dependencies.
    """

    if isTextBox:
        input_string = input_string + "\n This is the transcription/summary of the meeting: \n" + meeting_input
        input_string += "If there are no previous user stories, you should create user stories and tasks needed before adding things from the meeting."

    else:
        myfile = genai.upload_file(meeting_input)
        result = model.generate_content(["give me a summary of the meeting recording including status updates, what was completed, what is in progress, and what new tasks there should be", myfile])
        print(myfile)
        meeting_input = result.text
        print(meeting_input)
        return gemini(True, meeting_input, description, user_stories, tasks)

    return model.generate_content(
        input_string,

        generation_config=genai.GenerationConfig(
            response_mime_type="application/json", response_schema=CombinedSchema,
            temperature=0.4
        ),
    )


# Testing gemini function
desc = ("This is an app that allows users to find restaurants near to their current location. Users can use this app to "
     "search for restaurants based off of location, cusine, distance, ratings, etc. The user can view restaurant details and "
     "save restaurants to their account")
stories = [{"id": 1, "points": 8, "story": "As a user I want to be able to search for restaurants based on name, cuisine, rating, and distance from me. I want to find restaurants that are near my current location.", "title": "Search for Restaurants"}, {"id": 2, "points": 3, "story": "as a logged in user, i want to be able to save restaurants to my profile where i can view them in a saved restaurants page", "title": "Save Restaurants"}, {"id": 3, "points": 5, "story": "as a user i want to be able to filter search results by distance, rating, cuisine.", "title": "Filter Search Results"}, {"id": 8, "points": 5, "story": "As a user, I want to be able to view restaurant details such as opening hours, address, phone number, and menu when I select a restaurant from the search results.", "title": "View Restaurant Details"}]
tasks = [{"dependencies": [], "difficulty": 13, "task_id": 1, "name": "Implement restaurant search functionality", "priority": 10, "status": 0, "stor": 1}, {"dependencies": [1], "difficulty": 8, "task_id": 2, "name": "Display search results", "priority": 9, "status": 0, "story_id": 1}, {"dependencies": [], "difficulty": 13, "task_id": 3, "name": "Implement user location services", "priority": 8, "status": 0, "story_id": 1}, {"dependencies": [3], "difficulty": 8, "task_id": 4, "name": "Implement user authentication", "priority": 6, "status": 0, "story_id": 2}, {"dependencies": [2], "difficulty": 5, "task_id": 5, "name": "Implement saved restaurants functionality", "priority": 5, "status": 0, "story_id": 2}, {"dependencies": [3, 4], "difficulty": 3, "task_id": 6, "name": "Create saved restaurants page", "priority": 5, "status": 0, "story_id": 2}, {"dependencies": [4], "difficulty": 8, "task_id": 7, "name": "Implement search filters", "priority": 7, "status": 0, "story_id": 3}, {"dependencies": [2], "difficulty": 8, "task_id": 9, "priority": 7, "status": 0, "story_id": 8}]
#result = gemini(True, "We have finished all tasks regarding search capabilities but our client wants to add a new feature where a logged in user can write and post reviews through our site", desc, json.dumps(stories), json.dumps(tasks))
result = gemini(False, "meeting.txt", desc, json.dumps(stories), json.dumps(tasks))
print(result.text)
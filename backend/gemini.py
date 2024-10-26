import json
# For grabbing Gemini API Key
import os
from dotenv import load_dotenv

# Importing Gemini
import google.generativeai as genai

# Load API key from .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

#setting up gemini for 1.5 pro
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-pro-latest")

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
        Here are our current user stories in JSON format:
        {user_stories}
        Here are our current tasks in the backlog in JSON format:
        {tasks}
        We have since held a meeting, and the tasks in the backlog and the user stories may or may not need to be updated. 
        Updating the user stories and tasks include adding, deleting, or editing user stories and tasks, and tasks may be moved between to-do, in progress, and done states.
        Return two JSON files in the format of [[{{}}], [{{}}]] where the user stories come first and the tasks second.
        Use this JSON schema for user stories:
        UserStory = {{'userStory': str}}
        Use this JSON schema for the tasks:
        Task = {{'title': str, 'description': str, 'priority': int, 'difficulty': int, 'status': enum{{'To-Do', 'In Progress', 'Done'}}, 'dependencies': list[str], 'userStory': str}}
        priority should be integers 1-10 where 1 is the highest priority, and 10 is the lowest priority. Difficulty should be integers from 1-21 in a Fibonacci sequence where 21 is extremely difficult. Status should be either 'To-Do', 'In Progress', or 'Done'. Dependencies should be a list of other tasks' titles this current task depends on. userStory should be the user story this current task is for.
    """

    if isTextBox:
        input_string = input_string + "\n This is the transcription/summary of the meeting: \n" + meeting_input

    else:
        genai.upload_file(meeting_input)
        input_string = input_string + "\n The meeting was uploaded."

    return model.generate_content(input_string)

desc = ("This is an app that allows users to find restaurants near to their current location. Users can use this app to "
     "search for restaurants based off of location, cusine, distance, ratings, etc. The user can view restaurant details and "
     "save restaurants to their account")
stories = [{"userStory": "As a user I want to be able to search for restaurants based on name, cusine, rating, and distance from me. I want to find restaurants that are near my current location."}, {"userStory": "As a user I want to be able to search for restaurants based on name, cusine, rating, and distance from me. I want to find restaurants that are near my current location."}, {"userStory": "As a user I want to be able to search for restaurants based on name, cusine, rating, and distance from me. I want to find restaurants that are near my current location."}, {"userStory": "as a logged in user, i want to be able to save restaurants to my profile where i can view them in a saved restaurants page"}, {"userStory": "as a logged in user, i want to be able to save restaurants to my profile where i can view them in a saved restaurants page"}, {"userStory": "as a logged in user, i want to be able to save restaurants to my profile where i can view them in a saved restaurants page"}, {"userStory": "as a user i want to be able to filter search results by distance, rating, cuisine."}]
tasks = [{"title": "Implement restaurant search functionality", "description": "Allow users to search for restaurants based on name, cuisine, rating, and distance from their current location.", "priority": 10, "difficulty": 13, "status": "To Do", "dependencies": [], "userStory": "As a user I want to be able to search for restaurants based on name, cusine, rating, and distance from me. I want to find restaurants that are near my current location."}, {"title": "Display search results", "description": "Display search results in a clear and concise manner, including relevant information such as restaurant name, cuisine, rating, and distance.", "priority": 9, "difficulty": 8, "status": "To Do", "dependencies": ["Implement restaurant search functionality"], "userStory": "As a user I want to be able to search for restaurants based on name, cusine, rating, and distance from me. I want to find restaurants that are near my current location."}, {"title": "Implement user location services", "description": "Utilize device GPS to determine the users current location and display nearby restaurants.", "priority": 8, "difficulty": 13, "status": "To Do", "dependencies": [], "userStory": "As a user I want to be able to search for restaurants based on name, cusine, rating, and distance from me. I want to find restaurants that are near my current location."}, {"title": "Implement user authentication", "description": "Allow users to create an account and log in to the app.", "priority": 6, "difficulty": 8, "status": "To Do", "dependencies": [], "userStory": "as a logged in user, i want to be able to save restaurants to my profile where i can view them in a saved restaurants page"}, {"title": "Implement saved restaurants functionality", "description": "Allow logged-in users to save restaurants to their profile for future reference.", "priority": 5, "difficulty": 5, "status": "To Do", "dependencies": ["Implement user authentication"], "userStory": "as a logged in user, i want to be able to save restaurants to my profile where i can view them in a saved restaurants page"}, {"title": "Create saved restaurants page", "description": "Display a dedicated page where logged-in users can view their saved restaurants.", "priority": 5, "difficulty": 3, "status": "To Do", "dependencies": ["Implement user authentication", "Implement saved restaurants functionality"], "userStory": "as a logged in user, i want to be able to save restaurants to my profile where i can view them in a saved restaurants page"}, {"title": "Implement search filters", "description": "Allow users to filter search results by distance, rating, and cuisine.", "priority": 7, "difficulty": 8, "status": "To Do", "dependencies": ["Implement restaurant search functionality"], "userStory": "as a user i want to be able to filter search results by distance, rating, cuisine."}]
result = gemini(True, "We finished implementing restaurant search capabilities. However, our client wants to add a new user story where a logged in user can write and post reviews through our site", desc, json.dumps(stories), json.dumps(tasks))
print(result)
print(type(result))
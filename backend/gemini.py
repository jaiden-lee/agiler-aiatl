import json
from supabase import create_client, Client
# For grabbing Gemini API Key
import os
from dotenv import load_dotenv

# Importing Gemini
import google.generativeai as genai
import typing_extensions as typing
import anthropic

# Load API key from .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")

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

client = anthropic.Anthropic(
    api_key=CLAUDE_API_KEY
)

# default values for inputs
description = "This application has no description"
user_stories = "There are currently no user stories"
tasks = "There are currently no tasks"
meeting_input = "There is no meeting input"

# Generates updates user stories and tasks in an array of two JSON files, [{}, {}]. The first JSON file is the user stories
# The second JSON file are the tasks
def gemini(isTextBox: bool, meeting_input, description, user_stories, tasks):
    system = f"""
You are a product manager that is managing the user stories and the tasks for a project. 

You will be given 3 inputs: USER STORIES, TASKS, and MEETING NOTES. Your goal is to update the USER STORIES and TASKS given these MEETING NOTES.

STORY OUTPUT DESCRIPTION:
id: an integer. This represents the id of the user story. If you create a new task, set the a number < 0, so id < 0.
story: a string. This should be in the format of a user story. ie: "As a user, I would like to..."
title: a string no more than 50 characters. This should be a brief description of the user story.
points: an integer from 1 to 21. Lower values are easier, higher values are more difficult. Each value should be a value from the Fibonacci Sequence (1, 3, 5, 8, 13, 21)
new: True or False. If you created a user story instead of modifying one, store True. If you modified, store False.

TASK OUTPUT DESCRIPTION:
task_id: an integer. Do not the value of task_id if you modify a task. If you create a new task, set the task_id = 0.
story_id: an integer. ALWAYS assign story_id to an id from USER STORIES. You can create your own user story and use the story_id from that user story. 
name: a string no more than 100 characters. This should be a brief description of the task at hand.
status: 0, 1, or 2. 0 = to do. 1 = in progress. 2 = done.
dependencies: an array of integers. If the current task relies on another task being completed first, put the value of the task_id that this current task depends on in the array.
priority: an integer from 1 to 10. Lower value = high priority. Higher value = not as important.
difficulty: an integer from 1 to 21. Lower values are easier, higher values are more difficult. Each value should be a value from the Fibonacci Sequence (1, 3, 5, 8, 13, 21)
new: True or False. If you created a user story instead of modifying one, store True. If you modified, store False.

ONLY RETURN THE USER STORIES AND/OR TASKS THAT YOU HAVE MODIFIED OR CREATED.

###EXAMPLE:
USER STORIES: [{{"id": 1, "title": Add Items to Cart", "story": "As a user of the online store, I want to easily add items I find to my cart so that I can review and purchase them without interrupting my browsing experience.", "points": 21}}, {{"id": 3, "title": "Save Cart for Later", "story": "As a user, I would like to be able to save the cart if I do not want to check out now.", "points": 8}}]
TASKS: [{{"task_id": 1, "story_id": 1, "name": "Create an "Add to Cart" button", "difficulty": 5, "priority": 1, "status": 1, "dependencies": []}}, {{"task_id": 2, "story_id": 1, "name": "Validate that the correct item details are added to the cart.", "difficulty": 3, "priority": 2, "status": 0, "dependencies": [1]}}]
MEETING NOTES: I just met with the client. The client wants us to add a feature to check out items. 

RESPONSE: {{"stories": [{{"id": 0, "title": "Check out Cart", "story": "As a user of the online store, I would like to check out and buy items from the cart", "points": 13, "new": True]}}, "tasks": [{{"task_id": 0, "name": "Set up payment processing", "difficulty": 13, "priority": 3, "status": 0, "dependencies": [], "new": True}}, ...<fill in other tasks here>]}}
###END EXAMPLE""".strip()

    input_string = """
        Use the following JSON schema for your output:
        {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
            "name": {
            "type": "string"
            },
            "task_id": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
            },
            "story_id": {
            "type": "integer"
            },
            "dependencies": {
            "type": "array",
            "items": {
                "type": "integer"
            }
            },
            "difficulty": {
            "type": "integer"
            },
            "priority": {
            "type": "integer"
            },
            "status": {
            "type": "integer"
            },
            "new": {
            "type": "boolean"
            }
        },
        "required": ["name", "task_id", "story_id", "dependencies", "difficulty", "priority", "status", "new"]
        }
    """

    user_input = f"""
PROJECT DESCRIPTION: {description}
USER STORIES: {user_stories}
TASKS: {tasks}
MEETING NOTES: {meeting_input}""".strip()

    if isTextBox:
        input_string += "\n This is the transcription/summary of the meeting: \n" + meeting_input
        input_string += "If there are no previous user stories, you should create user stories and tasks needed before adding things from the meeting."

    else:
        myfile = genai.upload_file(meeting_input)
        result = model.generate_content(["give me a summary of the meeting recording including status updates, what was completed, what is in progress, and what new tasks there should be", myfile])
        meeting_input = result.text
        return gemini(True, meeting_input, description, user_stories, tasks)

    for i in range(3):
        message = client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1024,
            system=(system + input_string),
            messages=[
                {
                    "role": "user", "content": user_input,
                    
                },
                {
                    "role": "assistant", "content": "RESPONSE:"
                }
            ]
        )
        # replace : "  and ,"   with : '   and ,"
        text = message.content[0].text.strip()
        text = text[text.index("{"):len(text) - text[::-1].index("}")]
        text = text.replace(": '", ': "')
        text = text.replace("',", '",')
        text = text.replace("'}", '"}')
        text = text.replace("True", "true")
        text = text.replace("False", "false")
        try:
            res = json.loads(text)
            print("SUCCESS: " +text)
            return res
        except:
            print("FAIL: " +text)
            continue
    return {"error": "failed"}

# Testing gemini function
desc = ("This is an app that allows users to find restaurants near to their current location. Users can use this app to "
     "search for restaurants based off of location, cusine, distance, ratings, etc. The user can view restaurant details and "
     "save restaurants to their account")
stories = [{"id": 1, "points": 8, "story": "As a user I want to be able to search for restaurants based on name, cuisine, rating, and distance from me. I want to find restaurants that are near my current location.", "title": "Search for Restaurants"}, {"id": 2, "points": 3, "story": "as a logged in user, i want to be able to save restaurants to my profile where i can view them in a saved restaurants page", "title": "Save Restaurants"}, {"id": 3, "points": 5, "story": "as a user i want to be able to filter search results by distance, rating, cuisine.", "title": "Filter Search Results"}, {"id": 8, "points": 5, "story": "As a user, I want to be able to view restaurant details such as opening hours, address, phone number, and menu when I select a restaurant from the search results.", "title": "View Restaurant Details"}]
tasks = [{'task_id': 29, 'story_id': 1, 'name': 'Create an "Add to Cart" button', 'difficulty': 5, 'priority': 1, 'status': 1, 'dependencies': []}, {"dependencies": [], "difficulty": 13, "task_id": 1, "name": "Implement restaurant search functionality", "priority": 10, "status": 0, "stor": 1}, {"dependencies": [1], "difficulty": 8, "task_id": 2, "name": "Display search results", "priority": 9, "status": 0, "story_id": 1}, {"dependencies": [], "difficulty": 13, "task_id": 3, "name": "Implement user location services", "priority": 8, "status": 0, "story_id": 1}, {"dependencies": [3], "difficulty": 8, "task_id": 4, "name": "Implement user authentication", "priority": 6, "status": 0, "story_id": 2}, {"dependencies": [2], "difficulty": 5, "task_id": 5, "name": "Implement saved restaurants functionality", "priority": 5, "status": 0, "story_id": 2}, {"dependencies": [3, 4], "difficulty": 3, "task_id": 6, "name": "Create saved restaurants page", "priority": 5, "status": 0, "story_id": 2}, {"dependencies": [4], "difficulty": 8, "task_id": 7, "name": "Implement search filters", "priority": 7, "status": 0, "story_id": 3}, {"dependencies": [2], "difficulty": 8, "task_id": 9, "priority": 7, "status": 0, "story_id": 8}]
# tasks = [{'task_id': 1, 'story_id': 1, 'name': 'Create an "Add to Cart" button', 'difficulty': 5, 'priority': 1, 'status': 1, 'dependencies': []}, {'task_id': 2, 'story_id': 1, 'name': 'Validate that the correct item details are added to the cart.', 'difficulty': 3, 'priority': 2, 'status': 0, 'dependencies': [1]}]
# result = gemini(True, "We have finished all tasks regarding search capabilities but our client wants to add a new feature where a logged in user can write and post reviews through our site", desc, json.dumps(stories), json.dumps(tasks))
# result = gemini(False, "meeting.txt", desc, json.dumps(stories), json.dumps(tasks))
# print(json.loads(result[0].text.strip()))
# print(result)

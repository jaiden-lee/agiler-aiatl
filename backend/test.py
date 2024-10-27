import json
test = """
{
    "stories": [{
        "id": -1,
        "title": "Checkout Cart Items",
        "story": "As a user of the online store, I want to securely check out and purchase items from my cart so that I can complete my shopping transaction.",
        "points": 13,
        "new": true
    }],
    "tasks": [
        {
            "task_id": 0,
            "story_id": -1,
            "name": "Implement secure payment gateway integration",
            "difficulty": 13,
            "priority": 1,
            "status": 0,
            "dependencies": [1, 2],
            "new": true
        },
        {
            "task_id": 0,
            "story_id": -1,
            "name": "Create checkout form with shipping and billing information",
            "difficulty": 8,
            "priority": 2,
            "status": 0,
            "dependencies": [1, 2],
            "new": true
        },
        {
            "task_id": 0,
            "story_id": -1,
            "name": "Implement order confirmation and receipt generation",
            "difficulty": 5,
            "priority": 3,
            "status": 0,
            "dependencies": [1, 2],
            "new": true
        },
        {
            "task_id": 0,
            "story_id": -1,
            "name": "Add order summary display with total cost calculation",
            "difficulty": 3,
            "priority": 4,
            "status": 0,
            "dependencies": [1, 2],
            "new": true
        }
    ]
}""".strip()
print(json.loads(test))
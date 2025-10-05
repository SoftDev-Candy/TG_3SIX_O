import requests
import json

data1 = {
    "id": "2",
    "owner_id": "1",
    "title": "big delay",
    "description": "omg two ferraris just crashed",
    "location": "2",
    "severity": "8"
}

with open("C:/Users/Kubaw/Downloads/test_photo.jpg", "rb") as f:
    files = {
        "dist_data": (None, json.dumps(data1), "application/json"),
        "file": ("C:/Users/Kubaw/Downloads/test_photo.jpg", f, "image/jpeg")}
    r = requests.post("http://127.0.0.1:8000/submit-distruption/", files=files)
#r = requests.post("http://127.0.0.1:8000/submit-distruption/", json=data1,)
print(r.json())
print("finish")

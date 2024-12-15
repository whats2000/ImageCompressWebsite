import os
import json
from datetime import datetime, timedelta

IMAGE_TIMESTAMPS_FILE = "image_timestamps.json"

def load_image_timestamps() -> dict:
    if os.path.exists(IMAGE_TIMESTAMPS_FILE):
        with open(IMAGE_TIMESTAMPS_FILE, 'r') as f:
            return json.load(f)
    return {}


def save_image_timestamps(timestamps: dict):
    with open(IMAGE_TIMESTAMPS_FILE, 'w') as f:
        json.dump(timestamps, f, indent=4)


def cleanup_images(deletion_interval_seconds: int):
    timestamps = load_image_timestamps()
    now = datetime.now()
    images_to_delete = []

    for filepath, timestamp_str in timestamps.items():
        try:
            timestamp = datetime.fromisoformat(timestamp_str)
            if now - timestamp > timedelta(seconds=deletion_interval_seconds):
                images_to_delete.append(filepath)
        except ValueError:
             print(f"Invalid timestamp format: {timestamp_str} for file: {filepath}")
             images_to_delete.append(filepath)
    
    for filepath in images_to_delete:
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                print(f"Deleted image: {filepath}")
        except Exception as e:
            print(f"Error deleting image {filepath}: {e}")
        finally:
            timestamps.pop(filepath, None)

    save_image_timestamps(timestamps)

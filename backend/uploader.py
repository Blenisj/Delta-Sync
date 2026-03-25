import os
import time
import json
import requests
import glob

# --- CONFIG ---
WATCH_DIR = os.path.abspath(os.getcwd()).encode("unicode_escape").decode()
FIREBASE_URL = "https://deltasync-c17bc-default-rtdb.firebaseio.com/laps_v2.json"

def upload_to_firebase(file_path):
    try:
        with open(file_path, 'r') as f:
            payload = json.load(f)
            
        print(f"Uploading {os.path.basename(file_path)}...")
        
        response = requests.post(FIREBASE_URL, json=payload)
        
        if response.status_code == 200:
            print("Success! Deleting local file.")
            os.remove(file_path) 
        else:
            print(f"Failed to upload. Status code: {response.status_code}")
            
    except PermissionError:
        # Assetto Corsa is currently writing to the file. 
        # Skip it quietly and try again on the next loop.
        pass
    except json.JSONDecodeError:
        # File is empty or half-written. Skip it.
        pass
    except Exception as e:
        print(f"Error reading or uploading file: {e}")

print("DeltaSync Sidecar running. Waiting for completed laps...")

while True:
    search_pattern = os.path.join(WATCH_DIR, "telemetry_*.json")
    files = glob.glob(search_pattern)
    
    for file_path in files:
        upload_to_firebase(file_path)
        
    time.sleep(2)
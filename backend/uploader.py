import os
import time
import json
import requests
import glob
import socket
import sys

# --- THE HIGHLANDER LOCK ---
# This guarantees only ONE sidecar can run at a time.
try:
    lock_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    lock_socket.bind(('127.0.0.1', 47123))
except socket.error:
    # Port is taken, which means an older uploader is already running. Kill this clone.
    sys.exit()

WATCH_DIR = os.path.dirname(os.path.abspath(__file__))
FIREBASE_URL = "https://deltasync-c17bc-default-rtdb.firebaseio.com/laps_v2.json"

def upload_to_firebase(file_path):
    try:
        with open(file_path, 'r') as f:
            payload = json.load(f)
            
        response = requests.post(FIREBASE_URL, json=payload)
        
        if response.status_code == 200:
            os.remove(file_path) 
            
    except PermissionError:
        pass # File is locked, try again later
    except json.JSONDecodeError:
        pass # File is incomplete, skip it
    except Exception as e:
        print(f"Error: {e}")

print("DeltaSync Sidecar running. Waiting for completed laps...")

while True:
    # --- THE KILL SWITCH ---
    # Check if Assetto Corsa told us to shut down
    flag_path = os.path.join(WATCH_DIR, "kill_uploader.flag")
    if os.path.exists(flag_path):
        os.remove(flag_path) # Clean up the flag
        print("Kill flag detected. Shutting down sidecar.")
        sys.exit() # Kills this python instance completely
    # -----------------------

    search_pattern = os.path.join(WATCH_DIR, "telemetry_*.json")
    files = glob.glob(search_pattern)
    
    for file_path in files:
        upload_to_firebase(file_path)
        
    time.sleep(2)
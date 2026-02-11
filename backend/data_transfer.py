# to do:
# 1.) check for telemetry data JSON
# 2.) connect to Firestore database
# 3.) parse and format JSON for sending
# 4.) send data
# 5.) delete data JSON* ()
# 6.) confirm success through pop-up window.

import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials
import os
import json
import ctypes

cred = credentials.Certificate("accessKey.json")

firebase_admin.initialize_app(cred)
db = firestore.client()

# Check to see if file exists. If not, end script.
def checkForFile():
    file_path = "telemetry_log.json"
    if os.path.exists(file_path):
        print("File exists")
        jsonFile = open(file_path)
        formatData(jsonFile)
    else:
        print("File doesn't exist")

# Reads the file (if found) and formats it for the database
def formatData(_file):
    txt = _file.read()
    obj = json.loads(txt)
    data = {
        "metadata": {
            "lap_time": obj["metadata"]["best_lap_time_ms"],
            "track": obj["metadata"]["track_name"],
            "car": obj["metadata"]["car_name"],
            "timestamp": obj["metadata"]["last_save_timestamp"],
            "samples": obj["metadata"]["samples_logged"]
        },
        "telemetry": obj["telemetry"]
    }
    sendData(data)

def sendData(_data):
    try:
        data_ref = db.collection("main").document()
        data_ref.set(_data)
        confirmWindow()
    except Exception as e:
        ctypes.windll.user32.MessageBoxW(0, "Error while sending data: ".format(e), "ERROR", 1)
    

def confirmWindow():
    ctypes.windll.user32.MessageBoxW(0, "Data sent successfully.", "Notice", 1)

checkForFile()
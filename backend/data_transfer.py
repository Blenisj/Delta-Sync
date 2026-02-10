# to do:
# 1.) check for telemetry data JSON
# 2.) connect to Firestore database
# 3.) parse and format JSON for sending
# 4.) send data
# 5.) delete data JSON*
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

def checkForFile():
    file_path = "telemetry_log.json"
    if os.path.exists(file_path):
        print("File exists")
        jsonFile = open(file_path)
        formatData(jsonFile)
    else:
        print("File doesn't exist")

def getDatabase():
    return

def formatData(_file):
    txt = _file.read()
    obj = json.loads(txt)
    #print(obj["metadata"]["track_name"])
    ctypes.windll.user32.MessageBoxW(0, "If you see this, then the batch file worked. :D", obj["metadata"]["track_name"], 1)
    return

def sendData():
    return

def confirmWindow():
    return

checkForFile()
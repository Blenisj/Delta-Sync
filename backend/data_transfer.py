# to do:
# 1.) check for telemetry data JSON
# 2.) connect to Firestore database
# 3.) parse and format JSON for sending
# 4.) send data
# 5.) delete data JSON*
# 6.) confirm success through pop-up window.

# import firebase_admin
# from firebase_admin import firestore
# from firebase_admin import credentials
import os
import json

# cred = credentials.ApplicationDefault()

# firebase_admin.initialize_app(cred)
# db = firestore.client()

def checkForFile():
    file_path = "telemetry_log.json"
    if os.path.exists(file_path):
        print("File exists")
    else:
        print("File doesn't exist")

def getDatabase():
    return

def formatData():
    return

def sendData():
    return

def confirmWindow():
    return

checkForFile()
import ac
import acsys
import json
import os
import time
import collections  # This is the key to fixing the random order
import subprocess

APP_NAME = "DeltaSync"

# Store data in memory before writing
telemetry_data = []
last_save_time = 0
save_interval = 5

# Sampling
last_sample_time = 0
sample_interval = 0.25

# Session metadata
car_name = ""
track_name = ""
session_id = ""
session_best_lap = 0 

# Lap tracking
current_lap_index = 0

def _safe_name(raw: str) -> str:
    """Sanitize car/track names for filenames."""
    if not raw:
        return "unknown"
    return "".join(c if c.isalnum() or c in "-_" else "_" for c in raw)

def get_log_filename(lap_num):
    """Generates a unique filename per lap."""
    base_dir = os.path.dirname(__file__)
    safe_car = _safe_name(car_name)
    safe_track = _safe_name(track_name)
    
    filename = "telemetry_{}_{}_{}_Lap{}.json".format(
        safe_track, safe_car, session_id, int(lap_num)
    )
    return os.path.join(base_dir, filename)

def save_telemetry(lap_num, final_time=None):
    """Writes the current buffer to disk."""
    global last_save_time, session_best_lap
    
    log_file = get_log_filename(lap_num)
    
    try:
        best_lap_ms = session_best_lap

        # FORCE ORDER: Use OrderedDict to ensure keys stay in place
        metadata = collections.OrderedDict()
        metadata["car_name"] = car_name
        metadata["track_name"] = track_name
        metadata["session_id"] = session_id
        metadata["lap_number"] = int(lap_num)
        # Includes the specific lap time you asked for
        metadata["lap_duration_ms"] = int(final_time) if final_time and final_time > 0 else None
        metadata["best_lap_time_ms"] = int(best_lap_ms) if best_lap_ms > 0 else None
        metadata["samples_logged"] = len(telemetry_data)
        metadata["last_save_timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S")

        # Create the final output object as an OrderedDict
        # This guarantees 'metadata' is written before 'telemetry'
        output = collections.OrderedDict()
        output["metadata"] = metadata
        output["telemetry"] = telemetry_data

        with open(log_file, "w") as f:
            json.dump(output, f, indent=2)

        last_save_time = time.time()
        
    except Exception as e:
        ac.log("DeltaSync save error: {}".format(e))

def acMain(ac_version):
    global appWindow, speed_label, car_name, track_name, session_id, current_lap_index, session_best_lap

    appWindow = ac.newApp(APP_NAME)
    ac.setSize(appWindow, 200, 100)
    ac.setTitle(appWindow, "Delta Sync")

    speed_label = ac.addLabel(appWindow, "Speed: 0 km/h")
    ac.setPosition(speed_label, 10, 30)

    try:
        car_name = ac.getCarName(0)
        track_name = ac.getTrackName(0)
    except:
        car_name = "unknown"
        track_name = "unknown"

    session_best_lap = 0
    session_id = time.strftime("%Y%m%d_%H%M%S")
    
    try:
        current_lap_index = int(ac.getCarState(0, acsys.CS.LapCount))
    except:
        current_lap_index = 0

    ac.log("DeltaSync: initialized. Session ID: {}".format(session_id))

    # --- AUTO-LAUNCH SIDECAR ---
    try:
        base_dir = os.path.dirname(__file__)
        uploader_path = os.path.join(base_dir, "uploader.py")
        
        # 0x00000008 is a Windows flag that hides the black terminal window!
        subprocess.Popen(["python", uploader_path], creationflags=0x00000008)
        ac.log("DeltaSync: Auto-launched background uploader.")
    except Exception as e:
        ac.log("DeltaSync: Failed to launch uploader. Error: {}".format(e))
    # ---------------------------

    return APP_NAME

def acUpdate(deltaT):
    global last_sample_time, telemetry_data, current_lap_index, session_best_lap

    last_sample_time += deltaT

    if last_sample_time < sample_interval:
        return
    last_sample_time = 0

    # 1. Get Data
    try:
        speed = ac.getCarState(0, acsys.CS.SpeedKMH)
        gear = ac.getCarState(0, acsys.CS.Gear)
        throttle = ac.getCarState(0, acsys.CS.Gas)
        brake = ac.getCarState(0, acsys.CS.Brake)
        actual_lap = int(ac.getCarState(0, acsys.CS.LapCount))
    except:
        return 

    if gear == 0:
        gear_text = "R"
    elif gear == 1:
        gear_text = "N"
    else:
        gear_text = str(gear - 1)

    ac.setText(speed_label, "Spd:{:.0f} | Lap:{}".format(speed, actual_lap))

    # 2. LAP CHANGE DETECTION
    if actual_lap > current_lap_index:
        
        try:
            finished_lap_time = ac.getCarState(0, acsys.CS.LastLap)
        except:
            finished_lap_time = 0

        # Best Lap Logic
        if finished_lap_time > 0:
            if session_best_lap == 0 or finished_lap_time < session_best_lap:
                session_best_lap = finished_lap_time
                ac.log("DeltaSync: New Best Lap Detected: {} ms".format(session_best_lap))

        ac.log("DeltaSync: Lap {} completed. Saving.".format(current_lap_index))
        
        # Save completed lap with time
        save_telemetry(current_lap_index, final_time=finished_lap_time)
        
        # Reset for new lap
        telemetry_data = []
        current_lap_index = actual_lap

    # 3. Record Data
    telemetry_data.append({
        "speed": round(speed, 2),
        "gear": gear_text,
        "throttle": round(throttle, 3),
        "brake": round(brake, 3),
        "lap_progress": round(ac.getCarState(0, acsys.CS.NormalizedSplinePosition), 4)
    })


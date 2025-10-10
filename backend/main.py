import ac
import acsys
import json
import os
import time

#path for the log file
APP_NAME = "DeltaSync"
LOG_FILE = os.path.join(os.path.dirname(__file__), "telemetry_log.json")

#we'll store data in memory before writing
telemetry_data = []
last_save_time = 0
save_interval = 5  # seconds (yes it made alot of stuff in the JSON but it shall look sexy once we make a nice final output)

def acMain(ac_version):
    global appWindow, speed_label
    appWindow = ac.newApp(APP_NAME)
    ac.setSize(appWindow, 200, 100)
    ac.setTitle(appWindow, "Delta Sync")

    speed_label = ac.addLabel(appWindow, "Speed: 0 km/h")
    ac.setPosition(speed_label, 10, 30)

    # create-o file-o if it doesn’t exist-o
    if not os.path.exists(LOG_FILE):
        with open(LOG_FILE, "w") as f:
            json.dump([], f, indent=2)

    return APP_NAME

def acUpdate(deltaT):
    global last_save_time
    speed = ac.getCarState(0, acsys.CS.SpeedKMH)
    rpm = ac.getCarState(0, acsys.CS.RPM)
    gear = ac.getCarState(0, acsys.CS.Gear)
    throttle = ac.getCarState(0, acsys.CS.Gas)
    brake = ac.getCarState(0, acsys.CS.Brake)
    steer = ac.getCarState(0, acsys.CS.Steer)
    clutch = ac.getCarState(0, acsys.CS.Clutch)

    steering_deg = steer * 450  # assuming 900° wheel rotation which is usually the max for quite literally every car. It comes up to insane values like 20k but every sim I noticed measures that max value even if you're on controller

    # gear formatting (Initial-D type shi)
    if gear == 0:
        gear_text = "R"
    elif gear == 1:
        gear_text = "N"
    else:
        gear_text = str(gear - 1)

    # update UI
    ac.setText(
        speed_label,
        "Spd:{:.0f} | RPM:{:.0f} | G:{} | Th:{:.0%} | Br:{:.0%} | Cl:{:.0%} | St:{:.0f}°".format(
            speed, rpm, gear_text, throttle, brake, clutch, steering_deg
        )
    )

    # record telemetry data and become Fernando Alonso
    telemetry_data.append({
        "time": time.strftime("%H:%M:%S"),
        "speed": round(speed, 2),
        "rpm": int(rpm),
        "gear": gear_text,
        "throttle": round(throttle, 3),
        "brake": round(brake, 3),
        "clutch": round(clutch, 3),
        "steer": round(steer, 3),
        "steer_deg": round(steering_deg, 1)
    })

    # save every few seconds (in case of an AC crash, very common especially if you don't have CSP or some PP filter is fucking with ur AC config)
    if time.time() - last_save_time > save_interval:
        try:
            with open(LOG_FILE, "w") as f:
                json.dump(telemetry_data, f, indent=2)
            last_save_time = time.time()
        except Exception as e:
            ac.log("DeltaSync error: {}".format(e))

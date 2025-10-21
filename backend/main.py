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
save_interval = 10  # seconds (yes it made alot of stuff in the JSON but it shall look sexy once we make a nice final output)

# Potential fix to reducing the JSON file size by 67 percent (siiiix seveennnnnnnnn)
last_sample_time = 0
sample_interval = .25  # seconds (10 samples per second)


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
    global last_save_time, last_sample_time

    # accumulate time
    last_sample_time += deltaT

    # only log when enough time has passed
    if last_sample_time < sample_interval:
        return
    last_sample_time = 0

    speed = ac.getCarState(0, acsys.CS.SpeedKMH)
    gear = ac.getCarState(0, acsys.CS.Gear)
    throttle = ac.getCarState(0, acsys.CS.Gas)
    brake = ac.getCarState(0, acsys.CS.Brake)


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
        "Spd:{:.0f} | G:{} | Th:{:.0%} | Br:{:.0%}".format(
            speed, gear_text, throttle, brake,
        )
    )

    # record telemetry data and become Fernando Alonso
    telemetry_data.append({
        "speed": round(speed, 2),
        "gear": gear_text,
        "throttle": round(throttle, 3),
        "brake": round(brake, 3),
    })

    # save every few seconds (in case of an AC crash, very common especially if you don't have CSP or some PP filter is fucking with ur AC config)
    if time.time() - last_save_time > save_interval:
        try:
            with open(LOG_FILE, "w") as f:
                json.dump(telemetry_data, f, indent=2)
            last_save_time = time.time()
        except Exception as e:
            ac.log("DeltaSync error: {}".format(e))

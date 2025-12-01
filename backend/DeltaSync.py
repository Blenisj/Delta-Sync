import ac
import acsys
import json
import os
import time

APP_NAME = "DeltaSync"

# we'll set LOG_FILE dynamically each session
LOG_FILE = ""

# we'll store data in memory before writing
telemetry_data = []
last_save_time = 0
save_interval = 10  # seconds

# sampling interval to keep file size reasonable
last_sample_time = 0
sample_interval = 0.25  # seconds

# session-level metadata
car_name = ""
track_name = ""


def _safe_name(raw: str) -> str:
    """Sanitize car/track names for filenames."""
    if not raw:
        return "unknown"
    return "".join(c if c.isalnum() or c in "-_" else "_" for c in raw)


def acMain(ac_version):
    global appWindow, speed_label, car_name, track_name, LOG_FILE

    appWindow = ac.newApp(APP_NAME)
    ac.setSize(appWindow, 200, 100)
    ac.setTitle(appWindow, "Delta Sync")

    speed_label = ac.addLabel(appWindow, "Speed: 0 km/h")
    ac.setPosition(speed_label, 10, 30)

    # grab car & track info for this session
    try:
        car_name = ac.getCarName(0)
        track_name = ac.getTrackName(0)
    except Exception as e:
        ac.log("DeltaSync metadata error (car/track): {}".format(e))
        car_name = ""
        track_name = ""

    # build a unique filename for this session
    base_dir = os.path.dirname(__file__)
    safe_car = _safe_name(car_name)
    safe_track = _safe_name(track_name)
    timestamp = time.strftime("%Y%m%d_%H%M%S")

    filename = "telemetry_{}_{}_{}.json".format(safe_track, safe_car, timestamp)
    LOG_FILE = os.path.join(base_dir, filename)

    ac.log("DeltaSync: logging to {}".format(LOG_FILE))

    # initialize file with empty structure
    try:
        if not os.path.exists(LOG_FILE):
            with open(LOG_FILE, "w") as f:
                json.dump({"metadata": {}, "telemetry": []}, f, indent=2)
    except Exception as e:
        ac.log("DeltaSync init file error: {}".format(e))

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

    # save every few seconds (in case of an AC crash)
    if time.time() - last_save_time > save_interval:
        try:
            # get best lap (ms) from AC
            try:
                best_lap_ms = ac.getCarState(0, acsys.CS.BestLap)
            except Exception as e:
                ac.log("DeltaSync metadata error (best lap): {}".format(e))
                best_lap_ms = -1

            metadata = {
                "car_name": car_name,
                "track_name": track_name,
                "best_lap_time_ms": int(best_lap_ms) if best_lap_ms >= 0 else None,
                "samples_logged": len(telemetry_data),
                "last_save_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            }

            output = {
                "metadata": metadata,
                "telemetry": telemetry_data,
            }

            with open(LOG_FILE, "w") as f:
                json.dump(output, f, indent=2)

            last_save_time = time.time()
        except Exception as e:
            ac.log("DeltaSync error: {}".format(e))

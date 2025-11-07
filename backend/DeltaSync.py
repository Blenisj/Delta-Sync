import ac
import acsys
import json
import os
import time

APP_NAME = "DeltaSync"
LOG_FILE = os.path.join(os.path.dirname(__file__), "telemetry_log.json")

telemetry_data = []
lap_meta = {}
last_sample_time = 0
sample_interval = 0.25

current_lap = -1
lap_start_time = 0
lap_active = False
distance_travelled = 0


def acMain(ac_version):
    global appWindow, speed_label
    appWindow = ac.newApp(APP_NAME)
    ac.setSize(appWindow, 200, 100)
    ac.setTitle(appWindow, "Delta Sync")

    speed_label = ac.addLabel(appWindow, "Speed: 0 km/h")
    ac.setPosition(speed_label, 10, 30)

    # Initialize empty log file if not present
    if not os.path.exists(LOG_FILE):
        with open(LOG_FILE, "w") as f:
            json.dump([], f, indent=2)

    return APP_NAME


def acUpdate(deltaT):
    global last_sample_time, current_lap, lap_start_time, lap_active, distance_travelled

    last_sample_time += deltaT
    if last_sample_time < sample_interval:
        return
    last_sample_time = 0

    lap_count = ac.getCarState(0, acsys.CS.LapCount)
    speed = ac.getCarState(0, acsys.CS.SpeedKMH)
    gear = ac.getCarState(0, acsys.CS.Gear)
    throttle = ac.getCarState(0, acsys.CS.Gas)
    brake = ac.getCarState(0, acsys.CS.Brake)
    norm_pos = ac.getCarState(0, acsys.CS.NormalizedSplinePosition)
    distance_travelled += (speed / 3.6) * deltaT

    # Detect new lap start
    if lap_count != current_lap:
        if lap_active:
            # End previous lap
            lap_time = time.time() - lap_start_time
            lap_meta["lapTime"] = round(lap_time, 3)
            lap_meta["distance"] = round(distance_travelled, 2)

            # Sector breakdown
            sectors = []
            for i in range(1, 4):
                sector_distance = distance_travelled / 3
                sector_start = (i - 1) * sector_distance
                sector_end = i * sector_distance
                sector_data = [
                    d for d in telemetry_data
                    if sector_start <= d["distance"] <= sector_end
                ]
                avg_speed = (
                    sum([d["speed"] for d in sector_data]) / len(sector_data)
                    if sector_data else 0
                )
                sectors.append({
                    "sector": i,
                    "avgSpeed": round(avg_speed, 2)
                })
            lap_meta["sectors"] = sectors

            # Save to JSON
            try:
                with open(LOG_FILE, "w") as f:
                    json.dump({
                        "lapMeta": lap_meta,
                        "telemetry": telemetry_data
                    }, f, indent=2)
            except Exception as e:
                ac.log(f"DeltaSync save error: {e}")

        # Start new lap
        current_lap = lap_count
        lap_start_time = time.time()
        lap_active = True
        distance_travelled = 0
        telemetry_data.clear()
        lap_meta.clear()
        return

    # Only log while lap is active
    if lap_active:
        distance_travelled += (speed / 3.6) * deltaT

        # Determine gear text
        if gear == 0:
            gear_text = "R"
        elif gear == 1:
            gear_text = "N"
        else:
            gear_text = str(gear - 1)

        ac.setText(
            speed_label,
            f"Spd:{speed:.0f} | G:{gear_text} | Th:{throttle:.0%} | Br:{brake:.0%}"
        )

        # Log data with distance
        telemetry_data.append({
            "distance": round(distance_travelled, 2),
            "speed": round(speed, 2),
            "gear": gear_text,
            "throttle": round(throttle, 3),
            "brake": round(brake, 3),
        })

def acShutdown():
    ac.log("DeltaSync shutting down cleanly.")

import ac
import acsys

def acMain(ac_version):
    appWindow = ac.newApp("TelemetryUploader")
    ac.setSize(appWindow, 200, 100)
    ac.setTitle(appWindow, "Telemetry Uploader")

    global speed_label
    speed_label = ac.addLabel(appWindow, "Speed: 0 km/h")
    ac.setPosition(speed_label, 10, 30)

    return "TelemetryUploader"

def acUpdate(deltaT):
    speed = ac.getCarState(0, acsys.CS.SpeedKMH)
    ac.setText(speed_label, "Speed: {:.1f} km/h".format(speed))
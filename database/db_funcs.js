import { db } from "./connect.js"
import { collection, getDocs } from "firebase/firestore"

export async function getAll() {
    const querySnapshot = await getDocs(collection(db, "main"));
    return querySnapshot.docs.flatMap((doc) => {
        const data = doc.data();

        // Support both schemas:
        const laps = Array.isArray(data?.laps) ? data.laps : [data];

        return laps.map((lap, index) => {
            const metadata = lap?.metadata ?? lap ?? {};
            return {
                id: laps.length > 1 ? `${doc.id}-${index}` : doc.id,
                trackName: metadata.track_name,
                carModel: metadata.car_name,
                lapTime: metadata.lap_duration_ms ?? metadata.best_lap_time_ms,
                userName: lap?.userName || "Test User",
                userInitials: lap?.userInitials || ":)",
                metadata,
                ...lap,
            };
        });
    });
}


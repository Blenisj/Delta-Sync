import { db } from "./connect.js"
import { collection, getDocs } from "firebase/firestore"

export async function getAll() {
    
    let arr = [];
    const querySnapshot = await getDocs(collection(db, "main"));
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return{
            id: doc.id,
            trackName: data.metadata.track_name,
            carModel: data.metadata.car_name,
            lapTime: data.metadata.lap_duration_ms,
            userName: "Test User",
            userInitials: ":)",
            ...data
        }
    })
}


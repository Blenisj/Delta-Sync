import { db } from "./connect.js"
import { collection, getDocs } from "firebase/firestore"

export async function getAll() {
    let arr = [];
    const querySnapshot = await getDocs(collection(db, "main"));
    querySnapshot.forEach((doc) => {
        arr.push(doc.data());
    })
    return arr;
}
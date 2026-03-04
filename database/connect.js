import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

//to do: put this config in a separate file.
const firebaseConfig = {
    apiKey: "AIzaSyBE1ChYTYX51x3GJty9ilx2U5PPyJCodpM",

  authDomain: "deltasync-c17bc.firebaseapp.com",

  projectId: "deltasync-c17bc",

  storageBucket: "deltasync-c17bc.firebasestorage.app",

  messagingSenderId: "146451232667",

  appId: "1:146451232667:web:a3ee49ba9ed5349f0e133e",

  measurementId: "G-DEHG04VCCH"

};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

console.log(db);
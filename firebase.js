

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js"
import {getDatabase, ref, set, get, onValue} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js"
const firebaseConfig = {
    apiKey: "AIzaSyBvEXT5k4kvaqq3jW394Fq5ueom4CxMF2o",
    authDomain: "puntajes-kutral.firebaseapp.com",
    databaseURL: "https://puntajes-kutral-default-rtdb.firebaseio.com",
    projectId: "puntajes-kutral",
    storageBucket: "puntajes-kutral.firebasestorage.app",
    messagingSenderId: "1048990383919",
    appId: "1:1048990383919:web:18ccbea65e0b16435febda"
};
const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
export { ref, set, get, onValue}


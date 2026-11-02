
import { initializeApp } from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue,
    set
} from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";


// =====================================
// FIREBASE CONFIGURATION
// =====================================

const firebaseConfig = {
    apiKey: "AIzaSyCGXOcVwkVLe3QazRQTyc2awzY3vIS69ss",
    authDomain: "physic-smoke-alarm.firebaseapp.com",
    databaseURL: "https://physic-smoke-alarm-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "physic-smoke-alarm",
    storageBucket: "physic-smoke-alarm.firebasestorage.app",
    messagingSenderId: "987509235278",
    appId: "1:987509235278:web:c7a5444ff4852cd0246d1f",
    measurementId: "G-8EPQ3DHF6N"
};

// =====================================
// INITIALIZE FIREBASE
// =====================================

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


// Firebase references
const fanRef = ref(database, "Web/FanMode");
const smokeRef = ref(database, "Esp32/SmokeSensor");


// HTML elements
const smokeBox = document.getElementById("smokeBox");
const smokeStatus = document.getElementById("smokeStatus");

const modeStatus = document.getElementById("modeStatus");
const modeButtons = document.querySelectorAll(".mode-btn");

const connectionStatus =
    document.getElementById("connectionStatus");


// Mode names
const modeNames = [
    "AUTO",
    "ALWAYS ON",
    "ALWAYS OFF"
];


// =====================================
// FAN MODE DISPLAY
// =====================================

function updateFanDisplay(mode) {

    if (!Number.isInteger(mode) || mode < 0 || mode > 2) {
        modeStatus.textContent = "Invalid mode";
        return;
    }

    modeStatus.textContent = modeNames[mode];

    modeButtons.forEach(button => {

        const buttonMode = Number(button.dataset.mode);

        button.classList.toggle(
            "active",
            buttonMode === mode
        );

        button.setAttribute(
            "aria-pressed",
            buttonMode === mode
        );
    });
}


// =====================================
// FAN MODE CONTROL
// =====================================

modeButtons.forEach(button => {

    button.addEventListener("click", async () => {

        const mode = Number(button.dataset.mode);

        try {
            await set(fanRef, mode);
        }
        catch (error) {
            console.error("Fan mode update failed:", error);
            connectionStatus.textContent =
                "Failed to update fan mode.";
        }

    });

});


// =====================================
// FIREBASE -> WEBSITE FAN SYNC
// =====================================

onValue(fanRef, snapshot => {

    const mode = snapshot.val();

    if (mode === null) {
        modeStatus.textContent = "Not configured";
        return;
    }

    updateFanDisplay(mode);

}, error => {

    console.error("Fan listener error:", error);

});


// =====================================
// FIREBASE -> WEBSITE SMOKE DISPLAY
// =====================================

onValue(smokeRef, snapshot => {

    const smoke = snapshot.val();

    if (typeof smoke !== "boolean") {
        smokeStatus.textContent = "NO DATA";
        smokeBox.className = "smoke-box";
        return;
    }

    if (smoke) {

        smokeStatus.textContent = "SMOKE DETECTED";
        smokeBox.className = "smoke-box danger";

    } else {

        smokeStatus.textContent = "CLEAR";
        smokeBox.className = "smoke-box clear";

    }

}, error => {

    console.error("Smoke listener error:", error);

});


// =====================================
// CONNECTION STATUS
// =====================================

import { onValue as listenValue } from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const connectedRef = ref(database, ".info/connected");

listenValue(connectedRef, snapshot => {

    if (snapshot.val() === true) {
        connectionStatus.textContent = "Connected to Firebase";
    } else {
        connectionStatus.textContent = "Disconnected from Firebase";
    }

});

// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBjDElF__Bcgo137GGf6hPRXhEp4BatD10",
    authDomain: "recaudaciones-26766.firebaseapp.com",
    projectId: "recaudaciones-26766",
    storageBucket: "recaudaciones-26766.appspot.com",
    messagingSenderId: "793331710217",
    appId: "1:793331710217:web:93d036faa48032a6f53bd8"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Variables de estado
let currentNfcId = null;

// Leer NFC
document.getElementById('start-nfc').addEventListener('click', async () => {
    if ('NDEFReader' in window) {
        try {
            const ndef = new NDEFReader();
            await ndef.scan();
            ndef.onreading = async (event) => {
                const message = event.message.records[0];
                if (message.recordType === 'text') {
                    currentNfcId = new TextDecoder().decode(message.data);
                    checkUserRegistration(currentNfcId);
                }
            };
        } catch (error) {
            console.error("Error al leer NFC:", error);
        }
    } else {
        alert("Tu navegador no soporta NFC.");
    }
});

// Verificar si el usuario está registrado
async function checkUserRegistration(nfcId) {
    const userRef = ref(db, `usuarios/${nfcId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
        showMeetings(nfcId);
    } else {
        document.getElementById('nfc-section').style.display = 'none';
        document.getElementById('register-section').style.display = 'block';
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            registerUser(nfcId);
        });
    }
}

// Registrar nuevo usuario
async function registerUser(nfcId) {
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const legajo = document.getElementById('legajo').value;
    const puesto = document.getElementById('puesto').value;

    await set(ref(db, `usuarios/${nfcId}`), { nombre, apellido, legajo, puesto });
    alert('Usuario registrado con éxito.');
    showMeetings(nfcId);
}

// Mostrar reuniones
async function showMeetings(nfcId) {
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('meeting-section').style.display = 'block';

    const meetingsRef = ref(db, 'reuniones');
    const snapshot = await get(meetingsRef);
    const meetings = snapshot.val();

    const meetingList = document.getElementById('meeting-list');
    meetingList.innerHTML = '';
    for (const id in meetings) {
        const li = document.createElement('li');
        li.textContent = meetings[id].titulo;
        li.addEventListener('click', async () => {
            await update(ref(db, `reuniones/${id}/participantes`), { [nfcId]: true });
            showWelcomeMessage();
        });
        meetingList.appendChild(li);
    }
}

// Mostrar mensaje de bienvenida y cerrar sesión
function showWelcomeMessage() {
    document.getElementById('meeting-section').style.display = 'none';
    document.getElementById('welcome-section').style.display = 'block';

    setTimeout(() => {
        document.getElementById('welcome-section').style.display = 'none';
        document.getElementById('nfc-section').style.display = 'block';
        currentNfcId = null;
    }, 5000);
}

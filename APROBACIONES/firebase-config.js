
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-storage.js'; // Asegúrate de importar 'getStorage'

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBjDElF__Bcgo137GGf6hPRXhEp4BatD10",
    authDomain: "recaudaciones-26766.firebaseapp.com",
    projectId: "recaudaciones-26766",
    storageBucket: "recaudaciones-26766.appspot.com",
    messagingSenderId: "793331710217",
    appId: "1:793331710217:web:93d036faa48032a6f53bd8"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar las instancias necesarias
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // Exporta el storage

import { db, auth, storage } from './firebase-config.js';
import { collection, addDoc, getDocs, updateDoc, doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-storage.js';

const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const requestsContainer = document.getElementById('requests-container');
const approvalsSection = document.getElementById('approvals');
const registerSection = document.getElementById('register');
const loginSection = document.getElementById('login');
const createRequestForm = document.getElementById('create-request-form'); // Formulario para crear solicitud

let currentUser = null;

// Mostrar y ocultar formularios
function showRegister() {
    loginSection.classList.add('hidden');
    registerSection.classList.remove('hidden');
}

function showLogin() {
    registerSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
}

window.showRegister = showRegister;  // Asigna showRegister al objeto global
window.showLogin = showLogin;        // Asigna showLogin al objeto global

// Registro de usuario
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const legajo = document.getElementById('legajo').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        alert(`Usuario registrado: ${name}`);
        registerSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
    } catch (error) {
        console.error('Error al registrar:', error);
        alert('Error al registrar: ' + error.message);
    }
});

// Inicio de sesión
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email-login').value;
    const password = document.getElementById('password-login').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        currentUser = user;
        loginSection.classList.add('hidden');
        approvalsSection.classList.remove('hidden');
        loadRequests();
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        alert('Error al iniciar sesión: ' + error.message);
    }
});

// Obtener datos del usuario
async function getUserData() {
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    return userDoc.data();
}

// Crear nueva solicitud
async function createRequest() {
    if (!currentUser) {
      alert('Debes iniciar sesión primero.');
      return;
    }

    // Obtener los valores del formulario
    const tipoGasto = document.getElementById('expense-type').value;
const factura = document.getElementById('invoice-upload').files[0]; // Para archivos, usamos .files[]
const descripcion = document.getElementById('expense-description').value;


    const request = {
      title: `Solicitud creada por ${currentUser.email}`,
      tipoGasto,
      factura,
      descripcion,
      stages: {
        necesidad: { approved: false, approvedBy: null, timestamp: null },
        salida: { approved: false, approvedBy: null, timestamp: null },
        director: { approved: false, approvedBy: null, timestamp: null },
      },
      completed: false,
      createdBy: currentUser.email,
      legajo: currentUser.email.split('@')[0], // Simulación del legajo
      branch: 'Sucursal 1' // Puedes agregar un campo de sucursal también si lo necesitas
    };
  
    try {
      await addDoc(collection(db, 'requests'), request);
      alert('Solicitud creada exitosamente.');
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      alert('Error al crear solicitud: ' + error.message);
    }
}

// Hacer la función accesible globalmente
window.createRequest = createRequest;  // Asegúrate de que la función esté accesible globalmente


// Cargar solicitudes
async function loadRequests() {
    onSnapshot(collection(db, 'requests'), (snapshot) => {
        requestsContainer.innerHTML = '';
        snapshot.forEach((doc) => {
            const request = doc.data();
            displayRequest(doc.id, request);
        });
    });
}

function displayRequest(id, request) {
    const div = document.createElement('div');
    div.className = 'request';
    div.innerHTML = `
      <h3>${request.title}</h3> <!-- Usa 'title' si es lo que quieres mostrar -->
      <div>
        <strong>Necesidad del gasto:</strong> ${
          request.stages.necesidad.approved
            ? `Aprobado por ${request.stages.necesidad.approvedBy} el ${new Date(
                request.stages.necesidad.timestamp
              ).toLocaleString()}`
            : `<button onclick="approveStage('${id}', 'necesidad')">Aprobar</button>`
        }
      </div>
      <div>
        <strong>Salida del efectivo:</strong> ${
          request.stages.salida.approved
            ? `Aprobado por ${request.stages.salida.approvedBy} el ${new Date(
                request.stages.salida.timestamp
              ).toLocaleString()}`
            : `<button onclick="approveStage('${id}', 'salida')">Aprobar</button>`
        }
      </div>
      <div>
        <strong>Ok de un director:</strong> ${
          request.stages.director.approved
            ? `Aprobado por ${request.stages.director.approvedBy} el ${new Date(
                request.stages.director.timestamp
              ).toLocaleString()}`
            : `<button onclick="approveStage('${id}', 'director')">Aprobar</button>`
        }
      </div>
      ${
        request.completed
          ? '<button class="completed">Aprobado</button>'
          : ''
      }
    `;
    requestsContainer.appendChild(div);
  }
  

// Aprobar una etapa
async function approveStage(id, stage) {
    const legajosPermitidos = {
        necesidad: ['192134', '192135'],
        salida: ['192136', '192137'],
        director: ['192138', '192139', '192140'],
    };

    const userLegajo = currentUser.email.split('@')[0]; // Simulación del legajo

    if (!legajosPermitidos[stage].includes(userLegajo)) {
        alert('No tienes permiso para aprobar esta etapa.');
        return;
    }

    try {
        const requestRef = doc(db, 'requests', id);
        await updateDoc(requestRef, {
            [`stages.${stage}.approved`]: true,
            [`stages.${stage}.approvedBy`]: userLegajo,
            [`stages.${stage}.timestamp`]: new Date().toISOString(),
        });

        alert(`Etapa ${stage} aprobada.`);
    } catch (error) {
        console.error('Error al aprobar:', error);
        alert('Error al aprobar: ' + error.message);
    }
}

window.approveStage = approveStage;


        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
        import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
// Configuración de Firebase
const firebaseConfig = {
    apiKey: "process.env.FIREBASE_API_KEY",
    authDomain: "recaudaciones-26766.firebaseapp.com",
    projectId: "recaudaciones-26766",
    storageBucket: "recaudaciones-26766.appspot.com",
    messagingSenderId: "793331710217",
    appId: "1:793331710217:web:93d036faa48032a6f53bd8"
};

// Inicializa Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Agregar empleado
document.getElementById("employeeForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const hireDate = document.getElementById("hireDate").value;
    const position = document.getElementById("position").value;
    const assignmentDate = document.getElementById("assignmentDate").value;
    const branch = document.getElementById("branch").value;

    // Guardar en Firebase
    db.collection("employees").add({
        name: name,
        hireDate: hireDate,
        positions: [{
            branch: branch,
            position: position,
            assignmentDate: assignmentDate,
        }]
    })
    .then((docRef) => {
        console.log("Empleado agregado con ID: ", docRef.id);
        addEmployeeToTable(docRef.id, name, hireDate, position, assignmentDate, branch);
    })
    .catch((error) => {
        console.error("Error al agregar empleado: ", error);
    });

    document.getElementById("employeeForm").reset();
});

function addEmployeeToTable(id, name, hireDate, position, assignmentDate, branch) {
    const employeeTable = document.getElementById("employeeTable").querySelector("tbody");

    const newRow = employeeTable.insertRow();
    newRow.setAttribute('data-id', id);

    newRow.insertCell(0).textContent = name;
    newRow.insertCell(1).textContent = new Date(hireDate).toLocaleDateString();
    newRow.insertCell(2).textContent = position;
    newRow.insertCell(3).textContent = new Date(assignmentDate).toLocaleDateString();
    newRow.insertCell(4).textContent = branch;
    newRow.insertCell(5).textContent = calculateDuration(new Date(assignmentDate));
    newRow.insertCell(6).textContent = calculateDuration(new Date(hireDate));

    const actionsCell = newRow.insertCell(7);
    const editButton = document.createElement("button");
    editButton.textContent = "Editar";
    editButton.addEventListener("click", () => editRow(newRow));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Eliminar";
    deleteButton.addEventListener("click", () => deleteEmployee(newRow));

    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);
}

function deleteEmployee(row) {
    const employeeId = row.getAttribute('data-id');
    db.collection("employees").doc(employeeId).delete().then(() => {
        console.log("Empleado eliminado");
        row.remove();
    }).catch((error) => {
        console.error("Error al eliminar empleado: ", error);
    });
}

function editRow(row) {
    const employeeId = row.getAttribute('data-id');
    const name = row.cells[0].textContent;
    const hireDate = row.cells[1].textContent;
    const position = row.cells[2].textContent;
    const assignmentDate = row.cells[3].textContent;
    const branch = row.cells[4].textContent;

    // Rellenar el formulario con los datos existentes
    document.getElementById("name").value = name;
    document.getElementById("hireDate").value = formatDateForInput(hireDate);
    document.getElementById("position").value = position;
    document.getElementById("assignmentDate").value = formatDateForInput(assignmentDate);
    document.getElementById("branch").value = branch;

    // Eliminar la fila actual y actualizar en Firebase
    row.remove();
    updateEmployeeInFirebase(employeeId);
}

function updateEmployeeInFirebase(employeeId) {
    const name = document.getElementById("name").value;
    const hireDate = document.getElementById("hireDate").value;
    const position = document.getElementById("position").value;
    const assignmentDate = document.getElementById("assignmentDate").value;
    const branch = document.getElementById("branch").value;

    db.collection("employees").doc(employeeId).update({
        name: name,
        positions: firebase.firestore.FieldValue.arrayUnion({
            branch: branch,
            position: position,
            assignmentDate: assignmentDate
        })
    })
    .then(() => {
        console.log("Empleado actualizado");
    })
    .catch((error) => {
        console.error("Error al actualizar empleado: ", error);
    });
}

function calculateDuration(startDate) {
    const now = new Date();
    const duration = new Date(now - startDate);
    const years = duration.getUTCFullYear() - 1970; // 1970 es el origen del tiempo en JS
    const months = duration.getUTCMonth();
    return `${years} años y ${months} meses`;
}

function formatDateForInput(dateString) {
    const parts = dateString.split('/');
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
}

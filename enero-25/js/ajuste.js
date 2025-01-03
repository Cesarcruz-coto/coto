import { apis } from './api.js'; // Importación de la API (si es necesario)

const apiUrl = apis.apiAjusteHistorico;
let movimientos = [];
let movimientosCompensados = [];
let movimientosNoCompensados = [];
let totalAConciliar = 0;
let totalCompensados = 0;
let totalPendientes = 0;

let paginaActual = 1;
const itemsPorPagina = 20;

// Función para cargar los datos de la API usando fetch
async function fetchMovimientos() {
    try {
        const response = await fetch(apiUrl);
        movimientos = await response.json();
        procesarMovimientos(movimientos);
        mostrarPagina('compensados', 1);
        mostrarPagina('noCompensados', 1);
        actualizarResumen();
        configurarControlesDePaginacion();
    } catch (error) {
        console.error("Error al cargar los datos: ", error);
    }
}

// Función para convertir el importe a un número
function convertirImporte(importe) {
    return parseFloat(importe.replace(/[^0-9.-]+/g, ''));
}

// Función para procesar y compensar los movimientos
function procesarMovimientos(movs) {
    let movimientosAConciliar = movs.filter(mov => {
        return (
            (mov.Ajuste === "Ajuste Faltante - Tesorero" || mov.Ajuste === "Ajuste Faltante - Cajeros") &&
            mov.Total !== null
        );
    });
    totalAConciliar = movimientosAConciliar.length;

    // Marcar todos los movimientos como no compensados inicialmente
    movs.forEach(mov => mov.compensado = false);

    movimientosAConciliar.forEach(movAConciliar => {
        if (movAConciliar.compensado) return;

        let tipoCompensado = (movAConciliar.Ajuste === "Ajuste Faltante - Tesorero" || movAConciliar.Ajuste === "Ajuste Faltante - Cajeros")
            ? "Ajuste Sobrante - Tesorero" : "Ajuste Sobrante - Cajeros";

        const movConciliado = movs.find(mov =>
            (mov.Ajuste === tipoCompensado) &&
            !mov.compensado &&
            mov.Suc === movAConciliar.Suc &&
            convertirImporte(mov.Total) === -convertirImporte(movAConciliar.Total)
        );

        if (movConciliado) {
            movAConciliar.compensado = true;
            movConciliado.compensado = true;
            movimientosCompensados.push({ movAConciliar, movConciliado });
            totalCompensados++;
        } else {
            movimientosNoCompensados.push(movAConciliar);
            totalPendientes++;
        }
    });
}

// Función para mostrar una página específica
function mostrarPagina(type, pagina) {
    const div = document.getElementById(type === 'compensados' ? 'compensados-lista' : 'noCompensados-lista');
    const movimientos = type === 'compensados' ? movimientosCompensados : movimientosNoCompensados;

    const inicio = (pagina - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const items = movimientos.slice(inicio, fin);

    div.innerHTML = '';
    if (items.length > 0) {
        items.forEach(par => {
            const movInfo = type === 'compensados' ? `
                <div class="row-eo">
                    <div class="card-eo">
                        <p><strong>Sucursal:</strong> ${par.movAConciliar.Suc}</p>
                        <p><strong>Fecha:</strong> ${par.movAConciliar.Fecha}</p>
                        <p><strong>Importe:</strong> ${par.movAConciliar.Total}</p>
                        <p><strong>Ajuste:</strong> ${par.movAConciliar.Ajuste}</p>
                        <p><strong>Mov:</strong> ${par.movAConciliar.Mov}</p>
                        <button class="ver-obs-eo" onclick="toggleObservacion(this)">VER OBS.</button>
                        <div class="observacion-eo">${par.movAConciliar.Observacion}</div>
                    </div>
                    <div class="card-eo">
                        <p><strong>Sucursal:</strong> ${par.movConciliado.Suc}</p>
                        <p><strong>Fecha:</strong> ${par.movConciliado.Fecha}</p>
                        <p><strong>Importe:</strong> ${par.movConciliado.Total}</p>
                        <p><strong>Ajuste:</strong> ${par.movConciliado.Ajuste}</p>
                        <p><strong>Mov:</strong> ${par.movConciliado.Mov}</p>
                        <button class="ver-obs-eo" onclick="toggleObservacion(this)">VER OBS.</button>
                        <div class="observacion-eo">${par.movConciliado.Observacion}</div>
                    </div>
                </div>
            ` : `
                <div class="row-eo">
                    <div class="card-eo">
                        <p><strong>Sucursal:</strong> ${par.Suc}</p>
                        <p><strong>Fecha:</strong> ${par.Fecha}</p>
                        <p><strong>Importe:</strong> ${par.Total}</p>
                        <p><strong>Ajuste:</strong> ${par.Ajuste}</p>
                        <p><strong>Mov:</strong> ${par.Mov}</p>
                        <button class="ver-obs-eo" onclick="toggleObservacion(this)">VER OBS.</button>
                        <div class="observacion-eo">${par.Observacion}</div>
                    </div>
                </div>
            `;
            div.innerHTML += movInfo;
        });
    } else {
        div.innerHTML = '<p>No hay movimientos en esta categoría.</p>';
    }
}

// Función para actualizar el resumen
function actualizarResumen() {
    document.getElementById('totalAConciliar').textContent = totalAConciliar;
    document.getElementById('totalCompensados').textContent = totalCompensados;
    document.getElementById('totalPendientes').textContent = totalPendientes;
}

// Función para mostrar/ocultar observación
function toggleObservacion(button) {
    const observacionDiv = button.nextElementSibling;
    observacionDiv.style.display = observacionDiv.style.display === 'none' ? 'block' : 'none';
}

// Configurar controles de paginación
function configurarControlesDePaginacion() {
    const botones = document.querySelectorAll('.paginacion-botones button');
    botones.forEach(boton => {
        boton.addEventListener('click', (event) => {
            const target = event.target.dataset.type;
            if (target === 'prev') {
                paginaActual = Math.max(paginaActual - 1, 1);
            } else if (target === 'next') {
                paginaActual++;
            }
            mostrarPagina('compensados', paginaActual);
            mostrarPagina('noCompensados', paginaActual);
        });
    });
}

// Función para mostrar la pestaña activa
function showTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById(tab + '-tab').classList.add('active');
}

// Cargar los datos al inicio
fetchMovimientos();
window.toggleObservacion = toggleObservacion;
window.showTab = showTab;

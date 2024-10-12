const apiUrl = 'https://recaudaciones.s3.us-east-2.amazonaws.com/DATOS-AGOSTO-24/ERROROPERATIVO.json';
const itemsPerPage = 20;
let currentPageCompensados = 1;
let currentPageNoCompensados = 1;
let movimientosCompensados = [];
let movimientosNoCompensados = [];
let totalAConciliar = 0;
let totalCompensados = 0;
let totalPendientes = 0;

// Función para cargar los datos de la API usando fetch
async function fetchMovimientos() {
    try {
        const response = await fetch(apiUrl);
        const movimientos = await response.json();
        procesarMovimientos(movimientos);
        renderPage('compensados');
        renderPage('noCompensados');
        actualizarResumen();
    } catch (error) {
        console.error("Error al cargar los datos: ", error);
    }
}

// Función para convertir el importe a un número
function convertirImporte(importe) {
    return parseFloat(importe.replace(/[^0-9.-]+/g, ''));
}

// Función para procesar y compensar los movimientos
function procesarMovimientos(movimientos) {
    let movimientosAConciliar = movimientos.filter(mov => mov.TAjuste === 'Error Operativo Sin Resolver');
    totalAConciliar = movimientosAConciliar.length;

    // Marcar todos los movimientos como no compensados inicialmente
    movimientos.forEach(mov => mov.compensado = false);

    movimientosAConciliar.forEach(movAConciliar => {
        // Si el movimiento ya fue compensado, lo ignoramos
        if (movAConciliar.compensado) return;

        const movConciliado = movimientos.find(mov => 
            (mov.TAjuste === 'Error Operativo Resuelto' || mov.TAjuste === 'Error Operativo Caja Resuelto') &&
            !mov.compensado && // Buscar solo los que no han sido compensados
            mov.Suc === movAConciliar.Suc &&
            convertirImporte(mov.Importe) === -convertirImporte(movAConciliar.Importe)
        );

        if (movConciliado) {
            // Marcar ambos movimientos como compensados
            movAConciliar.compensado = true;
            movConciliado.compensado = true;
            movimientosCompensados.push({ movAConciliar, movConciliado });
            totalCompensados++;
        } else {
            // Si no se encuentra un movimiento compensado, agregar a los pendientes
            movimientosNoCompensados.push(movAConciliar);
            totalPendientes++;
        }
    });
}

// Función para mostrar una página específica
function renderPage(type) {
    const div = document.getElementById(type === 'compensados' ? 'compensados' : 'noCompensados');
    div.innerHTML = '';
    const currentPage = type === 'compensados' ? currentPageCompensados : currentPageNoCompensados;
    const movimientos = type === 'compensados' ? movimientosCompensados : movimientosNoCompensados;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = currentPage * itemsPerPage;

    const movimientosPage = movimientos.slice(startIndex, endIndex);

    if (movimientosPage.length > 0) {
        movimientosPage.forEach(par => {
            const movInfo = type === 'compensados' ? `
                <div class="row-eo">
                    <div class="card-eo">
                        <p><strong>Sucursal:</strong> ${par.movAConciliar.Suc}</p>
                        <p><strong>Importe:</strong> ${par.movAConciliar.Importe}</p>
                        <p><strong>T. Ajuste:</strong> ${par.movAConciliar.TAjuste}</p>
                        <p><strong>Ajuste:</strong> ${par.movAConciliar.Ajus}</p>
                        <p><strong>Fecha:</strong> ${par.movAConciliar.Fecha}</p>
                        <button class="ver-obs-eo" onclick="toggleObservacion(this)">VER OBS.</button>
                        <div class="observacion-eo">${par.movAConciliar.Observacion}</div>
                    </div>
                    <div class="card-eo">
                        <p><strong>Sucursal:</strong> ${par.movConciliado.Suc}</p>
                        <p><strong>Importe:</strong> ${par.movConciliado.Importe}</p>
                        <p><strong>T. Ajuste:</strong> ${par.movConciliado.TAjuste}</p>
                        <p><strong>Ajuste:</strong> ${par.movConciliado.Ajus}</p>
                        <p><strong>Fecha:</strong> ${par.movConciliado.Fecha}</p>
                        <button class="ver-obs-eo" onclick="toggleObservacion(this)">VER OBS.</button>
                        <div class="observacion-eo">${par.movConciliado.Observacion}</div>
                    </div>
                </div>
            ` : `
                <div class="row-eo">
                    <div class="card-eo">
                        <p><strong>Sucursal:</strong> ${par.Suc}</p>
                        <p><strong>Importe:</strong> ${par.Importe}</p>
                        <p><strong>T.Ajuste:</strong> ${par.TAjuste}</p>
                        <p><strong>Ajus:</strong> ${par.Ajus}</p>
                        <p><strong>Fecha:</strong> ${par.Fecha}</p>
                        <button class="ver-obs-eo" onclick="toggleObservacion(this)">VER OBS.</button>
                        <div class="observacion-eo">${par.Observacion}</div>
                    </div>
                </div>
            `;
            div.innerHTML += movInfo;
        });
    } else {
        div.innerHTML = '<p>No hay movimientos en esta página.</p>';
    }

    actualizarBotonesPaginacion(type);
}

// Función para actualizar los botones de paginación
function actualizarBotonesPaginacion(type) {
    const currentPage = type === 'compensados' ? currentPageCompensados : currentPageNoCompensados;
    const movimientos = type === 'compensados' ? movimientosCompensados : movimientosNoCompensados;

    const totalPages = Math.ceil(movimientos.length / itemsPerPage);
    const prevButton = document.getElementById(type === 'compensados' ? 'prevPageCompensados' : 'prevPageNoCompensados');
    const nextButton = document.getElementById(type === 'compensados' ? 'nextPageCompensados' : 'nextPageNoCompensados');

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

// Funciones para cambiar de página
function prevPage(type) {
    if (type === 'compensados') {
        if (currentPageCompensados > 1) {
            currentPageCompensados--;
            renderPage('compensados');
        }
    } else {
        if (currentPageNoCompensados > 1) {
            currentPageNoCompensados--;
            renderPage('noCompensados');
        }
    }
}

function nextPage(type) {
    const totalPages = Math.ceil((type === 'compensados' ? movimientosCompensados : movimientosNoCompensados).length / itemsPerPage);
    if (type === 'compensados') {
        if (currentPageCompensados < totalPages) {
            currentPageCompensados++;
            renderPage('compensados');
        }
    } else {
        if (currentPageNoCompensados < totalPages) {
            currentPageNoCompensados++;
            renderPage('noCompensados');
        }
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

// Función para exportar los movimientos no compensados a Excel
function exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(movimientosNoCompensados.map(mov => ({
        Sucursal: mov.Suc,
        Fecha: mov.Fecha,
        Ajuste: mov.Ajus,
        Importe: mov.Importe,
        TipoAjuste: mov.TAjuste,
        Observacion: mov.Observacion
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos No Compensados");
    XLSX.writeFile(wb, "Movimientos_No_Compensados.xlsx");
}

// Función para mostrar la pestaña activa
function showTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById(tab + '-tab').classList.add('active');
}

// Función para buscar movimientos no compensados por sucursal
function buscarNoCompensados() {
    const searchTerm = document.getElementById('searchInputNoCompensados').value.toLowerCase();
    
    // Filtrar movimientos que coincidan con el nombre de la sucursal
    const filteredMovimientos = movimientosNoCompensados.filter(mov => 
        mov.Suc && mov.Suc.toLowerCase().includes(searchTerm)
    );

    // Renderizar los movimientos filtrados
    renderMovimientosFiltrados(filteredMovimientos);
}

// Función para renderizar los movimientos filtrados
function renderMovimientosFiltrados(movimientosFiltrados) {
    const div = document.getElementById('noCompensados');
    div.innerHTML = '';

    if (movimientosFiltrados.length > 0) {
        movimientosFiltrados.forEach(mov => {
            const movInfo = `
                <div class="row-eo">
                    <div class="card-eo">
                        <p><strong>Sucursal:</strong> ${mov.Suc}</p>
                        <p><strong>Importe:</strong> ${mov.Importe}</p>
                        <p><strong>T.Ajuste:</strong> ${mov.TAjuste}</p>
                        <p><strong>Ajus:</strong> ${mov.Ajus}</p>
                        <p><strong>Fecha:</strong> ${mov.Fecha}</p>
                        <button class="ver-obs-eo" onclick="toggleObservacion(this)">VER OBS.</button>
                        <div class="observacion-eo">${mov.Observacion}</div>
                    </div>
                </div>
            `;
            div.innerHTML += movInfo;
        });
    } else {
        div.innerHTML = '<p>No hay movimientos que coincidan con el término de búsqueda.</p>';
    }
}


// Cargar los datos al inicio
fetchMovimientos();

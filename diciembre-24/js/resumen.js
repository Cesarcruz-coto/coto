import { apis } from './api.js';
// API URLs para movimientos actuales, julio, y agosto (movimientos a conciliar)
const urlMovimientosAConciliarActual = apis.apiMovimientosActual; // MES ULTIMO

// Variables de datos para cada mes (movimientos a conciliar)
let pendientesConciliarActual = 0;
let importeNoCompensadosConciliarActual = 0;

let listaPendientesConciliarActual = [];

// Función para obtener datos de todas las APIs y actualizar el gráfico (movimientos a conciliar)
async function obtenerMovimientosConciliar() {
    try {
        // Obtener datos de todas las APIs en paralelo
        const [datosActual] = await Promise.all([
            fetch(urlMovimientosAConciliarActual).then(response => response.json())
        ]);

        // Procesar los movimientos de cada mes
        analizarMovimientosConciliar(datosActual, 'actual');

        // Actualizar resumen
        actualizarResumenMovimientosConciliar();
    } catch (error) {
        console.error("Error al cargar los datos: ", error);
    }
}

// Función para procesar movimientos y calcular los pendientes (movimientos a conciliar)
function analizarMovimientosConciliar(movimientos, mes) {
    let movimientosAConciliar = movimientos.filter(mov => mov.TAjuste === 'Movimiento A Conciliar');

    movimientos.forEach(mov => mov.compensado = false); // Marcar como no compensado inicialmente

    movimientosAConciliar.forEach(movAConciliar => {
        const movConciliado = movimientos.find(mov => 
            (mov.TAjuste === 'Movimiento Conciliado' || mov.TAjuste === 'Movimiento De Caja Conciliado') &&
            !mov.compensado &&
            mov.Suc === movAConciliar.Suc &&
            convertirMontoConciliar(mov.Importe) === -convertirMontoConciliar(movAConciliar.Importe)
        );

        if (movConciliado) {
            movAConciliar.compensado = true;
            movConciliado.compensado = true;
        } else {
            if (mes === 'actual') {
                listaPendientesConciliarActual.push(movAConciliar);
                pendientesConciliarActual++;
            }
        }
    });

    // Calcular el importe total de no compensados solo para el mes actual
    if (mes === 'actual') {
        importeNoCompensadosConciliarActual = listaPendientesConciliarActual.reduce((total, mov) => {
            return total + convertirMontoConciliar(mov.Importe);
        }, 0);
    }
}

// Función para convertir el string del importe a número
function convertirMontoConciliar(importe) {
    return parseFloat(importe.replace(/[^0-9,-]+/g, "").replace(',', '.'));
}

// Función para actualizar el resumen de movimientos (movimientos a conciliar)
function actualizarResumenMovimientosConciliar() {
    const sumaImportesErroresActual = importeNoCompensadosConciliarActual;

    document.getElementById('total-pendientes-conciliar').textContent = pendientesConciliarActual;

    const importeNoCompensadosFormatted = `$ ${sumaImportesErroresActual.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const iconClass = sumaImportesErroresActual > 0 ? 'fa-arrow-trend-down' : 'fa-arrow-trend-up';
    const iconColor = sumaImportesErroresActual > 0 ? '#b50000' : '#256528';

    document.getElementById('total-importe-no-compensados-conciliar').innerHTML = `
        <i class="fa-solid ${iconClass}" style="color: ${iconColor};"></i>
        <span style="color: ${iconColor};">${importeNoCompensadosFormatted}</span>
    `;
}

// Llamada inicial para obtener los datos al cargar la página (movimientos a conciliar)
obtenerMovimientosConciliar();


// ------------------------

// API URLs para errores operativos actuales, julio, y agosto (errores operativos)
const urlErroresOperativosActual = apis.apiErroresActual; // MES ULTIMO

// Variables de datos para cada mes (errores operativos)
let pendientesErroresActual = 0;
let importeNoCompensadosErroresActual = 0;

let listaPendientesErroresActual = [];

// Función para obtener datos de todas las APIs y actualizar el gráfico (errores operativos)
async function obtenerMovimientosErrores() {
    try {
        // Obtener datos de todas las APIs en paralelo
        const [datosActual] = await Promise.all([
            fetch(urlErroresOperativosActual).then(response => response.json())
        ]);

        // Procesar los movimientos de cada mes
        analizarMovimientosErrores(datosActual, 'actual');

        // Actualizar resumen
        actualizarResumenMovimientosErrores();
    } catch (error) {
        console.error("Error al cargar los datos: ", error);
    }
}

// Función para procesar movimientos y calcular los pendientes (errores operativos)
function analizarMovimientosErrores(movimientos, mes) {
    let movimientosAConciliar = movimientos.filter(mov => mov.TAjuste === 'Error Operativo Sin Resolver');

    movimientos.forEach(mov => mov.compensado = false); // Marcar como no compensado inicialmente

    movimientosAConciliar.forEach(movAConciliar => {
        const movConciliado = movimientos.find(mov => 
            (mov.TAjuste === 'Error Operativo Resuelto' || mov.TAjuste === 'Error Operativo Caja Resuelto') &&
            !mov.compensado &&
            mov.Suc === movAConciliar.Suc &&
            convertirMontoErrores(mov.Importe) === -convertirMontoErrores(movAConciliar.Importe)
        );

        if (movConciliado) {
            movAConciliar.compensado = true;
            movConciliado.compensado = true;
        } else {
            if (mes === 'actual') {
                listaPendientesErroresActual.push(movAConciliar);
                pendientesErroresActual++;
            }
        }
    });

    // Calcular el importe total de no compensados solo para el mes actual
    if (mes === 'actual') {
        importeNoCompensadosErroresActual = listaPendientesErroresActual.reduce((total, mov) => {
            return total + convertirMontoErrores(mov.Importe);
        }, 0);
    }
}

// Función para convertir el string del importe a número
function convertirMontoErrores(importe) {
    return parseFloat(importe.replace(/[^0-9,-]+/g, "").replace(',', '.'));
}

// Función para actualizar el resumen de movimientos (errores operativos)
function actualizarResumenMovimientosErrores() {
    const sumaImportesErroresActual = importeNoCompensadosErroresActual;

    document.getElementById('total-pendientes-errores').textContent = pendientesErroresActual;

    const importeNoCompensadosFormatted = `$ ${sumaImportesErroresActual.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const iconClass = sumaImportesErroresActual > 0 ? 'fa-arrow-trend-down' : 'fa-arrow-trend-up';
    const iconColor = sumaImportesErroresActual > 0 ? '#b50000' : '#256528';

    document.getElementById('total-importe-no-compensados-errores').innerHTML = `
        <i class="fa-solid ${iconClass}" style="color: ${iconColor};"></i>
        <span style="color: ${iconColor};">${importeNoCompensadosFormatted}</span>
    `;
}

// Llamada inicial para obtener los datos al cargar la página (errores operativos)
obtenerMovimientosErrores();

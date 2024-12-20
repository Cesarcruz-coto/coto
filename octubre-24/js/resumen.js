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

     // Mostrar barra de carga si es el mes actual
     if (mes === 'actual') {
        mostrarBarraDeCarga(movimientos); // Llamada a la nueva función
    }

    // Calcular y mostrar la cantidad de conciliados si es el mes actual
    if (mes === 'actual') {
        mostrarAjustesConciliados(movimientos); // Llamada a la nueva función
    }

    // Calcular el importe total de no compensados solo para el mes actual
    if (mes === 'actual') {
        importeNoCompensadosConciliarActual = listaPendientesConciliarActual.reduce((total, mov) => {
            return total + convertirMontoConciliar(mov.Importe);
        }, 0);
    }
}

 // Función para calcular y mostrar la cantidad de ajustes conciliados
function mostrarAjustesConciliados(movimientos) {
    // Filtrar los movimientos compensados
    const movimientosConciliados = movimientos.filter(mov =>
        mov.compensado === true &&
        (mov.TAjuste === 'Movimiento Conciliado' || mov.TAjuste === 'Movimiento De Caja Conciliado')
    );

    // Calcular la cantidad de conciliados
    const cantidadConciliados = movimientosConciliados.length;

    // Actualizar el DOM
    document.getElementById('total-conciliados').textContent = cantidadConciliados;
}

// Función para mostrar la barra de carga con el porcentaje de ajustes compensados
function mostrarBarraDeCarga(movimientos) {
    // Calcular el total de movimientos relevantes (conciliados y pendientes)
    const totalMovimientos = movimientos.filter(mov =>
        mov.TAjuste === 'Movimiento A Conciliar' || 
        mov.TAjuste === 'Movimiento Conciliado' ||
        mov.TAjuste === 'Movimiento De Caja Conciliado'
    ).length;

    // Calcular el total de movimientos compensados
    const totalCompensados = movimientos.filter(mov => mov.compensado === true).length;

    // Calcular el porcentaje
    const porcentajeCompensados = totalMovimientos > 0 ? (totalCompensados / totalMovimientos) * 100 : 0;

    // Actualizar la barra de carga en el DOM
    const barraCarga = document.getElementById('barra-carga-compensados');
    barraCarga.innerHTML = `
        <span style="width: ${porcentajeCompensados}%;display: flex;
    height: 100%;
    animation: progressbar 4s ease-in-out;
    background-color: #311b92d1;
    text-align: center;
    color: white;
    border-radius: 5px;
    font-size: .8em;
    justify-content: center;
    align-items: center;">
            <p id="total-conciliados" style="padding:0 5px">0</p> Movimientos trazables <p id="total-conciliados" style="padding:0 5px">-</p> <b>${porcentajeCompensados.toFixed(2)}%</b>
        </span>
    `;

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

// Mostrar barra de carga si es el mes actual
     if (mes === 'actual') {
        mostrarBarraDeCargaErrores(movimientos); // Llamada a la nueva función
    }

    // Calcular y mostrar la cantidad de conciliados si es el mes actual
    if (mes === 'actual') {
        mostrarAjustesConciliadosErrores(movimientos); // Llamada a la nueva función
    }

    // Calcular el importe total de no compensados solo para el mes actual
    if (mes === 'actual') {
        importeNoCompensadosErroresActual = listaPendientesErroresActual.reduce((total, mov) => {
            return total + convertirMontoErrores(mov.Importe);
        }, 0);
    }
}

// Función para calcular y mostrar la cantidad de ajustes conciliados
function mostrarAjustesConciliadosErrores(movimientos) {
    // Filtrar los movimientos compensados
    const movimientosConciliados = movimientos.filter(mov =>
        mov.compensado === true &&
        (mov.TAjuste === 'Error Operativo Resuelto' || mov.TAjuste === 'Error Operativo Caja Resuelto')
    );

    // Calcular la cantidad de conciliados
    const cantidadConciliados = movimientosConciliados.length;

    // Actualizar el DOM
    document.getElementById('total-conciliados-errores').textContent = cantidadConciliados;
}

// Función para mostrar la barra de carga con el porcentaje de ajustes compensados
function mostrarBarraDeCargaErrores(movimientos) {
    // Calcular el total de movimientos relevantes (conciliados y pendientes)
    const totalMovimientos = movimientos.filter(mov =>
        mov.TAjuste === 'Error Operativo Sin Resolver' || 
        mov.TAjuste === 'Error Operativo Resuelto' ||
        mov.TAjuste === 'Error Operativo Caja Resuelto'
    ).length;

    // Calcular el total de movimientos compensados
    const totalCompensados = movimientos.filter(mov => mov.compensado === true).length;

    // Calcular el porcentaje
    const porcentajeCompensadosErrores = totalMovimientos > 0 ? (totalCompensados / totalMovimientos) * 100 : 0;

    // Actualizar la barra de carga en el DOM
    const barraCargaErrores = document.getElementById('barra-carga-compensados-errores');
    barraCargaErrores.innerHTML = `
        <span style="width: ${porcentajeCompensadosErrores}%;display: flex;
    height: 100%;
    animation: progressbar 4s ease-in-out;
    background-color: #311b92d1;
    text-align: center;
    color: white;
    border-radius: 5px;
    font-size: .8em;
    justify-content: center;
    align-items: center;">
            <p id="total-conciliados-errores" style="padding:0 5px">0</p> Movimientos trazables <p id="total-conciliados-errores" style="padding:0 5px">-</p> <b>${porcentajeCompensadosErrores.toFixed(2)}%</b>
        </span>
    `;

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
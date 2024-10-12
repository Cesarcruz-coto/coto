// API URL para movimientos actuales
const urlMovimientosActualFallo = 'https://app.sheetlabs.com/COTO/COTOFALLOSF'; // MES ULTIMO

// Variables de datos
let totalAjustes = 0;
let importeTotalAjustes = 0;
let falloFaltantes = [];  // Almacena los fallos faltantes
let falloSobrantes = [];   // Almacena los fallos sobrantes

// Función para obtener datos de la API y actualizar el resumen
async function obtenerFalloMovimientos() {
    try {
        // Obtener datos de la API
        const datosActual = await fetch(urlMovimientosActualFallo).then(response => response.json());

        // Procesar los movimientos del mes actual
        analizarFalloMovimientos(datosActual);

        // Actualizar resumen
        actualizarFalloResumen();
    } catch (error) {
        console.error("Error al cargar los datos: ", error);
    }
}

// Función para procesar los ajustes por tipo
//function analizarFalloMovimientos(movimientos) {
    // Filtrar los ajustes "Fallo Sobrantes - Cajeros" y "Fallo Faltante - Cajeros"
    //falloSobrantes = movimientos.filter(mov => mov.TAjuste === 'Fallo De Cajas - Sobrante');
    //falloFaltantes = movimientos.filter(mov => mov.TAjuste === 'Fallo De Caja - Faltante');

    function analizarFalloMovimientos(movimientos) {
        // Filtrar los ajustes "Fallo Sobrantes - Cajeros" y "Fallo Faltante - Cajeros"
        falloSobrantes = movimientos.filter(mov => mov.TAjuste === 'Fallo De Cajas - Sobrante' && 
            !(mov.Observacion && mov.Observacion.toLowerCase().includes("deja vuelto")));
        falloFaltantes = movimientos.filter(mov => mov.TAjuste === 'Fallo De Caja - Faltante' && 
            !(mov.Observacion && mov.Observacion.toLowerCase().includes("deja vuelto")));

    // Contar la cantidad de ajustes y sumar los importes para ambos tipos
    totalAjustes = falloSobrantes.length + falloFaltantes.length;
    importeTotalAjustes = falloSobrantes.reduce((total, mov) => total + convertirMonto(mov.Importe), 0) +
                          falloFaltantes.reduce((total, mov) => total + convertirMonto(mov.Importe), 0);
}

// Función para convertir el string del importe a número
function convertirMonto(importe) {
    return parseFloat(importe.replace(/[^0-9,-]+/g, "").replace(',', '.'));
}

// Función para formatear el importe
function formatCurrency(value) {
    return `$ ${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Función para actualizar el resumen de movimientos
function actualizarFalloResumen() {
    const isImportePositive = importeTotalAjustes < 0;
    const icon = isImportePositive ? 
        '<i class="fa-solid fa-arrow-trend-up" style="color: #2E7D32;"></i>' : 
        '<i class="fa-solid fa-arrow-trend-down" style="color: #D50000;"></i>';
    const formattedImporteTotal = formatCurrency(importeTotalAjustes);

    // Mostrar el total de ajustes
    document.getElementById('total-ajustes-resumen').innerHTML = `${totalAjustes}`;

    // Mostrar el importe total de ajustes
    document.getElementById('importe-total-ajustes-resumen').innerHTML = `
        ${icon} <span style="font-weight: bold; color:${isImportePositive ? '#2E7D32' : '#D50000'}">${formattedImporteTotal}</span>
    `;

    // Crear el contenido del tooltip
    const tooltipContent = `
        <strong><i class="fa-brands fa-confluence"></i> Faltante:</strong> ${falloFaltantes.length} - ${formatCurrency(falloFaltantes.reduce((total, mov) => total + convertirMonto(mov.Importe), 0))}<br><br>
        <strong><i class="fa-brands fa-confluence"></i> Sobrante:</strong> ${falloSobrantes.length} - ${formatCurrency(falloSobrantes.reduce((total, mov) => total + convertirMonto(mov.Importe), 0))}
    `;

    // Tooltip
    const tooltip = document.getElementById('tooltip');
    const containers = document.querySelectorAll('.tooltip-container');

    containers.forEach(container => {
        container.addEventListener('mouseenter', () => {
            tooltip.innerHTML = tooltipContent;
            tooltip.style.display = 'block';
            const rect = container.getBoundingClientRect();
            tooltip.style.left = `${rect.left}px`;
            tooltip.style.top = `${rect.bottom + window.scrollY}px`;
        });

        container.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    });
}

// Llamada inicial para obtener los datos al cargar la página
obtenerFalloMovimientos();

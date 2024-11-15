import { apis } from './api.js';
const codigos = [3, 2, 1]; // Lista de códigos

// Función principal para obtener y procesar los fallos
async function obtenerFallosDeCodigo() {
    try {
        const respuesta = await fetch(apis.apiFallosActual);
        if (!respuesta.ok) throw new Error('Error en la respuesta de la API');
        const datos = await respuesta.json();

        const resumen = {
            3: { total: 0, faltantes: 0, sobrantes: 0, fallos: [] },
            2: { total: 0, faltantes: 0, sobrantes: 0, fallos: [] },
            1: { total: 0, faltantes: 0, sobrantes: 0, fallos: [] }
        };

        // Procesar cada movimiento
        datos.forEach(mov => {
            const importe = parseFloat(mov.Importe.replace(/\./g, '').replace('$', '').replace(',', '.').trim());
            const codigoData = obtenerCodigo(importe, mov.Motivo);

            // Solo se procesan los códigos 3, 2 y 1
            if (codigos.includes(codigoData.codigo)) {
                agregarFallo(resumen, codigoData.codigo, mov, importe);
            }
        });

        mostrarResumen(resumen); // Pasar el resumen
        renderizarGraficoFallos(resumen); // Renderizar el gráfico de fallos

    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

// Función para agregar un fallo al resumen
function agregarFallo(resumen, codigo, mov, importe) {
    resumen[codigo].total += 1;
    resumen[codigo].fallos.push(mov);
    if (mov.TAjuste === 'Fallo De Caja - Faltante') {
        resumen[codigo].faltantes += importe;
    } else if (mov.TAjuste === 'Fallo De Cajas - Sobrante') {
        resumen[codigo].sobrantes += importe;
    }
}

// Mostrar el resumen en los divs
const mostrarResumen = (resumen) => {
    let totalFallos = 0;
    let totalFaltantes = 0;
    let totalSobrantes = 0;

    codigos.forEach(codigo => {
        const div = document.getElementById(`resumen-codigo-${codigo}`);
        if (div) {
            const iconoFaltante = '<i class="fa-solid fa-arrow-trend-down" style="color: #D50000;"></i>';
            const iconoSobrante = '<i class="fa-solid fa-arrow-trend-up" style="color: #2E7D32;"></i>';

            const faltantesHTML = `<span style="color: #D50000;">${iconoFaltante} $${resumen[codigo].faltantes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;
            const sobrantesHTML = `<span style="color: #2E7D32;">${iconoSobrante} $${resumen[codigo].sobrantes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;

            const enlaceDetalle = `<a href="#" onclick="abrirPanelDetalle('${codigo}')">Ver fallos</a>`;

            div.innerHTML = `
                <h3>Codigo ${codigo} - ${resumen[codigo].total} Fallos - ${enlaceDetalle}</h3>
                <p>${faltantesHTML} - ${sobrantesHTML}</p>
            `;

            // Guardar los fallos detallados para usarlos en el panel
            div.dataset.fallos = JSON.stringify(resumen[codigo].fallos);

            // Acumular totales generales
            totalFallos += resumen[codigo].total;
            totalFaltantes += resumen[codigo].faltantes;
            totalSobrantes += resumen[codigo].sobrantes;
        }

    });

    // Actualizar el div para mostrar el total de fallos
    const divTotalFallos = document.getElementById('resumen-codigo-digital');
    if (divTotalFallos) {
        const iconoFaltante = '<i class="fa-solid fa-arrow-trend-down" style="color: #D50000;"></i>';
        const iconoSobrante = '<i class="fa-solid fa-arrow-trend-up" style="color: #2E7D32;"></i>';

        // Establecer el color dependiendo del importe
        const colorFaltante = totalFaltantes > 0 ? '#D50000' : '#000'; // Rojo si hay faltantes, negro si no
        const colorSobrante = totalSobrantes > 0 ? '#2E7D32' : '#000'; // Verde si hay sobrantes, negro si no

        divTotalFallos.innerHTML = `
    <div class="comparison"> Evolutivo</div>
                            <div class="title-fallos">
                                <h2>Fallos por Codigo</h2>
                            </div>
        <div class="contenedor-movimientos-fallos">
    <div class="icono-fallos">
        <b>${totalFallos}</b>
    </div>
    <div class="info-movimientos">
        <div class="importe-movimientos">
            <b style="color: ${colorFaltante}; font-size: 0.9em;">${iconoFaltante} $${totalFaltantes.toLocaleString('es-ES', {
            minimumFractionDigits:
                2, maximumFractionDigits: 2
        })} - <b style="color: ${colorSobrante};">${iconoSobrante}
                    $${totalSobrantes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></b>
            <div class="comparison-fallos">Prom. mes previo <b id="diferencia-porcentaje-total"></b></div>
        </div>
    </div>
</div>`;
    }
}

function renderizarGraficoFallos(resumen) {
    // Datos fijos para los fallos de 2023
    const datosFijos2023 = {
        'Ene': 1300,
        'Feb': 1100,
        'Mar': 972,
        'Abr': 878,
        'May': 1039,
        'Jun': 969,
        'Jul': 1026,
        'Ago': 1106,
        'Sep': 1063,
        'Oct': 708,
        'Nov': 820
    };

    // Datos fijos para los fallos de 2024
    const datosFijos2024 = {
        'Ene': 418,
        'Feb': 453,
        'Mar': 459,
        'Abr': 495,
        'May': 469,
        'Jun': 555,
        'Jul': 640,
        'Ago': 360,
        'Sep': 358,
        'Oct': 474
    };

    const codigos = Object.keys(resumen);

    // Total de fallos para el mes actual en 2024
    const totalFallosMesActual2024 = codigos.reduce((total, codigo) => total + resumen[codigo].total, 0);
    const fallosPorMes2024 = Object.values(datosFijos2024).concat(totalFallosMesActual2024);
    const fallosPorMes2023 = Object.values(datosFijos2023);

    const meses = Object.keys(datosFijos2024).concat("Nov");

    const percentageDifferencesFallos = fallosPorMes2024.map((current, index) => {
        const previous = fallosPorMes2023[index];
        const difference = ((current - previous) / previous) * 100;
        return difference.toFixed(2) + '%';
    });

    // Función para calcular la diferencia porcentual
    function calcularDiferenciaPorcentual(mesActual, mesAnterior) {
        if (mesAnterior === 0) {
            return mesActual > 0 ? '∞%' : '0%';
        }

        // Calcular la diferencia porcentual
        const diferencia = ((mesActual - mesAnterior) / mesAnterior) * 100;

        // Formatear la diferencia con el signo + o -
        const diferenciaFormateada = diferencia > 0 ? `+${diferencia.toFixed(2)}%` : `${diferencia.toFixed(2)}%`;

        return diferenciaFormateada;
    }

    // Accedes al total de fallos del mes anterior desde datosFijos2024 (esto depende de cómo lo obtienes)
    const mesAnterior = datosFijos2024['Oct'];  // Asumiendo que 'SEP' es el mes anterior

    // Calcular la diferencia porcentual
    const diferencia = calcularDiferenciaPorcentual(totalFallosMesActual2024, mesAnterior);

    // Mostrar la diferencia porcentual en el div con el id 'diferencia-porcentaje-total'
    document.getElementById('diferencia-porcentaje-total').innerHTML = ` ${diferencia}`;


    console.log(percentageDifferencesFallos);

    const opciones = {
        chart: {
            height: 300,
            type: 'area',
            zoom: { enabled: false },
            toolbar: { show: false },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 1000,
                animateGradually: { enabled: true, delay: 150 },
                dynamicAnimation: { speed: 1000 }
            },
        },
        dataLabels: { enabled: false },
        stroke: {
            curve: 'straight', // Cambia a 'smooth' para una transición más suave entre los puntos
            width: [3, 3],
            dashArray: [4, 0]
        },
        markers: {
            size: 4,
            colors: ['#c9c9c9', '#311b92'], // Color de los puntos para la línea del año anterior
            strokeColors: '#fff',
            strokeWidth: 4,
            hover: {
                size: 8
            }
        },
        xaxis: {
            categories: meses,
            labels: { show: true },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        grid: {
            show: true,
            borderColor: '#e0e0e0',
            strokeDashArray: 5,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: false } }
        },
        legend: { show: false },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function (value, { seriesIndex, dataPointIndex }) {
                    let result = `${value}`;
                    if (seriesIndex === 1) {
                        const percentage = percentageDifferencesFallos[dataPointIndex];
                        console.log(`Tooltip para 2024 - Mes: ${meses[dataPointIndex]}, Valor: ${value}, Porcentaje: ${percentage}`);
                        result += ` (${percentage})`;
                    }
                    return result;
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.8,
                opacityTo: 0.6,
                stops: [0, 90, 100]
            }
        },
        colors: ['#bdbdbd', '#311b92'],
        series: [
            { name: '2023', data: fallosPorMes2023 },
            { name: '2024', data: fallosPorMes2024 }
        ]
    };

    const chart = new ApexCharts(document.querySelector("#grafico-fallos"), opciones);
    chart.render();
}



// Función para abrir el panel de detalles con el resumen
window.abrirPanelDetalle = (codigo) => {
    event.preventDefault();  // Si el panel se abre a través de un enlace <a> con href="#"

    const div = document.getElementById(`resumen-codigo-${codigo}`);
    const fallos = JSON.parse(div.dataset.fallos || '[]');

    const panel = document.getElementById('detalle-fallo-panel');
    const contenido = document.getElementById('detalle-fallo-contenido');

    // Crear el contenido del detalle
    contenido.innerHTML = `
        <h3>Detalle de los Fallos - Código ${codigo}</h3>
        <div class="header-ii">
            <div>Suc</div>
            <div>Fecha</div>
            <div>Fallo</div>
            <div>Importe</div>
            <div>Obs.</div>
        </div>
        <div>
            ${fallos.map(fallo => {
        const importe = parseFloat(fallo.Importe.replace(/\./g, '').replace('$', '').replace(',', '.').trim());
        const codigoData = obtenerCodigo(importe, fallo.Motivo);

        const observacionCorta = fallo.Observacion && fallo.Observacion.length > 11
            ? `${fallo.Observacion.slice(0, 11)}... <br><span class="ver-mas">ver más</span>`
            : fallo.Observacion || 'Sin observación';

        return `
                    <div class="row fade-in">
                        <div>${fallo.Suc}</div>
                        <div>${fallo.Fecha}</div>
                        <div>${fallo.TAjuste}</div>
                        <div>$${importe.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br>
                            <p><i class="fa-solid ${codigoData.icono}" style="color:${codigoData.color}"></i> Código ${codigoData.codigo}</p>
                        </div>
                        <div>
                            <span class="observacion-corta">${observacionCorta}</span>
                            <span class="observacion-completa" style="display:none;">${fallo.Observacion}</span>
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
        <button id="cerrar-detalle" onclick="cerrarPanelDetalle()">&times;</button>
    `;

    // Agregar eventos de "ver más"
    const verMasLinks = contenido.querySelectorAll('.ver-mas');
    verMasLinks.forEach(link => {
        link.addEventListener('click', function () {
            const observacionCompleta = this.parentElement.nextElementSibling;
            this.parentElement.style.display = 'none';
            observacionCompleta.style.display = 'inline';
        });
    });

    // Mostrar el panel eliminando la clase 'oculto' y agregando 'mostrar'
    panel.classList.remove('oculto');
    panel.classList.add('mostrar');
};

// Función para cerrar el panel de detalles
window.cerrarPanelDetalle = () => {
    const panel = document.getElementById('detalle-fallo-panel');
    panel.classList.remove('mostrar');
    panel.classList.add('oculto');
};

// Función para obtener el código según el importe y motivo
const obtenerCodigo = (importe, motivo) => {
    if (Math.abs(importe) >= 15000) return { codigo: 3, icono: 'fa-exclamation-triangle', color: 'red' };
    if (Math.abs(importe) >= 7500) return { codigo: 2, icono: 'fa-exclamation-circle', color: '#FFB900' };
    if (Math.abs(importe) >= 3000) return { codigo: 1, icono: 'fa-info-circle', color: '#009812' };
    return { codigo: 0, icono: '', color: '' };
};

// Ejecutar la función después de que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    obtenerFallosDeCodigo(); // Llamar a la función al cargar el documento
});


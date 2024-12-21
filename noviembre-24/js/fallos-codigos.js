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
        renderizarGraficoCodigo3(resumen); // Renderizar el gráfico específico para código 3
        renderizarGraficoCodigo2(resumen); // Renderizar el gráfico específico para código 2
        renderizarGraficoCodigo1(resumen); // Renderizar el gráfico específico para código 1

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
            const iconoFaltante = '<i class="fa-solid fa-arrow-trend-down" style="color: #b50000;"></i>';
            const iconoSobrante = '<i class="fa-solid fa-arrow-trend-up" style="color: #256528;"></i>';

            const faltantesHTML = `<span style="color: #b50000;">${iconoFaltante} $${resumen[codigo].faltantes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;
            const sobrantesHTML = `<span style="color: #256528;">${iconoSobrante} $${resumen[codigo].sobrantes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;

            const enlaceDetalle = `<a href="#" onclick="abrirPanelDetalle('${codigo}')">Ver fallos</a>`;

            div.innerHTML = `
                <h3>Codigo ${codigo} | ${resumen[codigo].total} Fallos | ${enlaceDetalle}</h3>
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
        const iconoFaltante = '<i class="fa-solid fa-arrow-trend-down" style="color: #b50000;"></i>';
        const iconoSobrante = '<i class="fa-solid fa-arrow-trend-up" style="color: #256528;"></i>';

        // Establecer el color dependiendo del importe
        const colorFaltante = totalFaltantes > 0 ? '#b50000' : '#000'; // Rojo si hay faltantes, negro si no
        const colorSobrante = totalSobrantes > 0 ? '#256528' : '#000'; // Verde si hay sobrantes, negro si no

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
            <div class="comparison-fallos">Prom. Mes Anterior <b id="diferencia-porcentaje-total"></b></div>
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
            height: 340,
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

function renderizarGraficoCodigo3(resumen) {
    // Datos de fallos específicos para código 3
    const datosCodigo3 = resumen[3] || { total: 0, fallos: [] };

    // Datos fijos para los meses (puedes adaptarlo según los datos reales)
    const datosMensuales2023 = {
        'Ene': 100,
        'Feb': 104,
        'Mar': 73,
        'Abr': 87,
        'May': 126,
        'Jun': 101,
        'Jul': 100,
        'Ago': 107,
        'Sep': 119,
        'Oct': 136,
        'Nov': 133
    };

    const datosMensuales2024 = {
        'Ene': 104,
        'Feb': 125,
        'Mar': 125,
        'Abr': 135,
        'May': 141,
        'Jun': 151,
        'Jul': 174,
        'Ago': 49,
        'Sep': 54,
        'Oct': 64,
        'Nov': datosCodigo3.total // Fallos reales para noviembre
    };

    const meses = Object.keys(datosMensuales2024);

    // Datos para el gráfico
    const fallosPorMes2023 = Object.values(datosMensuales2023);
    const fallosPorMes2024 = Object.values(datosMensuales2024);

    // Calcular la diferencia porcentual
    const diferenciasPorcentuales = meses.map((mes, index) => {
        const valor2023 = fallosPorMes2023[index] || 0;
        const valor2024 = fallosPorMes2024[index] || 0;
        if (valor2023 === 0) return "N/A"; // Evitar divisiones por cero
        const diferencia = ((valor2024 - valor2023) / valor2023) * 100;
        return diferencia.toFixed(2); // Limitar a dos decimales
    });

    const opciones = {
        chart: {
            height: 340,
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
        series: [
            { name: '2023', data: fallosPorMes2023 },
            { name: '2024', data: fallosPorMes2024 }
        ],
        dataLabels: { enabled: false },
        stroke: {
            curve: 'straight',
            width: [3, 3],
            dashArray: [4, 0]
        },
        markers: {
            size: 4,
            colors: ['#c9c9c9', '#311b92'],
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
                    if (seriesIndex === 1) { // Mostrar solo para 2024
                        const diferencia = diferenciasPorcentuales[dataPointIndex];
                        return `${value} fallos (${diferencia}% respecto a 2023)`;
                    }
                    return `${value} fallos`; // Para 2023
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
    };

    // Renderizar el gráfico
    const chartDiv = document.querySelector("#grafico-codigo-3");
    const chart = new ApexCharts(chartDiv, opciones);
    chart.render();
}


function renderizarGraficoCodigo2(resumen) {
    // Datos de fallos específicos para código 2
    const datosCodigo2 = resumen[2] || { total: 0, fallos: [] };

    // Datos fijos para los meses
    const datosMensuales2023 = {
        'Ene': 289,
        'Feb': 124,
        'Mar': 76,
        'Abr': 117,
        'May': 142,
        'Jun': 130,
        'Jul': 128,
        'Ago': 147,
        'Sep': 136,
        'Oct': 111,
        'Nov': 102
    };

    const datosMensuales2024 = {
        'Ene': 106,
        'Feb': 122,
        'Mar': 120,
        'Abr': 134,
        'May': 94,
        'Jun': 136,
        'Jul': 150,
        'Ago': 165,
        'Sep': 143,
        'Oct': 21,
        'Nov': datosCodigo2.total // Fallos reales para noviembre
    };

    const meses = Object.keys(datosMensuales2024);

    // Datos para el gráfico
    const fallosPorMes2023 = Object.values(datosMensuales2023);
    const fallosPorMes2024 = Object.values(datosMensuales2024);

    // Calcular la diferencia porcentual
    const diferenciasPorcentuales = meses.map((mes, index) => {
        const valor2023 = fallosPorMes2023[index] || 0;
        const valor2024 = fallosPorMes2024[index] || 0;
        if (valor2023 === 0) return "N/A"; // Evitar divisiones por cero
        const diferencia = ((valor2024 - valor2023) / valor2023) * 100;
        return diferencia.toFixed(2); // Limitar a dos decimales
    });

    const opciones = {
        chart: {
            height: 340,
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
        series: [
            { name: '2023', data: fallosPorMes2023 },
            { name: '2024', data: fallosPorMes2024 }
        ],
        dataLabels: { enabled: false },
        stroke: {
            curve: 'straight',
            width: [3, 3],
            dashArray: [4, 0]
        },
        markers: {
            size: 4,
            colors: ['#c9c9c9', '#311b92'],
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
                    if (seriesIndex === 1) { // Mostrar solo para 2024
                        const diferencia = diferenciasPorcentuales[dataPointIndex];
                        return `${value} fallos (${diferencia}% respecto a 2023)`;
                    }
                    return `${value} fallos`; // Para 2023
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
    };

    // Renderizar el gráfico
    const chartDiv = document.querySelector("#grafico-codigo-2");
    const chart = new ApexCharts(chartDiv, opciones);
    chart.render();
}


function renderizarGraficoCodigo1(resumen) {
    // Datos de fallos específicos para código 1
    const datosCodigo1 = resumen[1] || { total: 0, fallos: [] };

    // Datos fijos para los meses
    const datosMensuales2023 = {
        'Ene': 911,
        'Feb': 744,
        'Mar': 462,
        'Abr': 674,
        'May': 771,
        'Jun': 738,
        'Jul': 798,
        'Ago': 852,
        'Sep': 808,
        'Oct': 461,
        'Nov': 506
    };

    const datosMensuales2024 = {
        'Ene': 208,
        'Feb': 212,
        'Mar': 211,
        'Abr': 226,
        'May': 234,
        'Jun': 268,
        'Jul': 316,
        'Ago': 146,
        'Sep': 161,
        'Oct': 209,
        'Nov': datosCodigo1.total // Fallos reales para noviembre
    };

    const meses = Object.keys(datosMensuales2024);

    // Datos para el gráfico
    const fallosPorMes2023 = Object.values(datosMensuales2023);
    const fallosPorMes2024 = Object.values(datosMensuales2024);

    // Calcular la diferencia porcentual
    const diferenciasPorcentuales = meses.map((mes, index) => {
        const valor2023 = fallosPorMes2023[index] || 0;
        const valor2024 = fallosPorMes2024[index] || 0;
        if (valor2023 === 0) return "N/A"; // Evitar divisiones por cero
        const diferencia = ((valor2024 - valor2023) / valor2023) * 100;
        return diferencia.toFixed(2); // Limitar a dos decimales
    });

    const opciones = {
        chart: {
            height: 340,
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
        series: [
            { name: '2023', data: fallosPorMes2023 },
            { name: '2024', data: fallosPorMes2024 }
        ],
        dataLabels: { enabled: false },
        stroke: {
            curve: 'straight',
            width: [3, 3],
            dashArray: [4, 0]
        },
        markers: {
            size: 4,
            colors: ['#c9c9c9', '#311b92'],
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
                    if (seriesIndex === 1) { // Mostrar solo para 2024
                        const diferencia = diferenciasPorcentuales[dataPointIndex];
                        return `${value} fallos (${diferencia}% respecto a 2023)`;
                    }
                    return `${value} fallos`; // Para 2023
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
    };

    // Renderizar el gráfico
    const chartDiv = document.querySelector("#grafico-codigo-1");
    const chart = new ApexCharts(chartDiv, opciones);
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

function openTab(event, tabId) {
    // Ocultar todas las pestañas
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';  // Ocultar contenido de todas las pestañas
    });

    // Desactivar todos los botones
    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(link => link.classList.remove('active'));

    // Mostrar la pestaña seleccionada
    const tabToShow = document.getElementById(tabId);
    if (tabToShow) {
        tabToShow.classList.add('active');
        tabToShow.style.display = 'block'; // Mostrar la pestaña seleccionada
    } else {
        console.error(`No se encontró el tab con id: ${tabId}`);
        return;
    }

    // Activar el botón seleccionado
    event.currentTarget.classList.add('active');
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Por defecto, activar la pestaña "General"
    const defaultTab = document.getElementById('tab-general');
    if (defaultTab) {
        defaultTab.classList.add('active');
        defaultTab.style.display = 'block'; // Mostrar el contenido por defecto
    }

    // Activar el botón correspondiente a la pestaña "General"
    const defaultButton = document.querySelector('.tab-link[onclick="openTab(event, \'tab-general\')"]');
    if (defaultButton) {
        defaultButton.classList.add('active');
    }
});

// Exponer la función openTab al ámbito global
window.openTab = openTab;

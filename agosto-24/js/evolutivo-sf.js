// URL de la API
import { apis } from './api.js';
const apiURL = apis.apiAjusteSFActual;

// Datos fijos por mes
const monthlyData = {
    'Enero': 1970,
    'Febrero': 1817,
    'Marzo': 1862,
    'Abril': 2286,
    'Mayo': 2053,
    'Junio': 1304,
    'Julio': 594
};

// Lista de sucursales de no venta
const sucursalesNoVenta = [50, 79, 93, 193, 229, 231, 507];

// Variables globales para los datos
let cmovimientos = [];
let totalImporte = 0;
let importeAgosto;
let cantidadAjustesNoVenta = 0;
let ajusteNoVenta = 0;
let cantidadAjustesVenta = 0;
let ajusteVenta = 0;
let diferencia = 0;  // Definir la variable globalmente
let porcentajeCambio = 0;  // Definir la variable globalmente
let months = Object.keys(monthlyData); // Obtener los nombres de los meses
let signo = "";  // Definir la variable globalmente
let sumaAjustes = 0;  // Definir la variable globalmente

// Variables adicionales para la clasificación de ajustes de ventas
let cantidadProsegur = 0;
let importeProsegur = 0;

let cantidadRedondeo = 0;
let importeRedondeo = 0;

let cantidadOperativo = 0;
let importeOperativo = 0;

// Función para formatear números en el formato de moneda deseado
function formatCurrency(value) {
    return `$ ${value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Función para formatear números como enteros o decimales simples
function formatNumber(value) {
    return value.toLocaleString('es-ES');
}

// Función para clasificar ajustes de ventas según la observación
function clasificarAjustes(ajuste, observacion) {
    observacion = observacion.toLowerCase(); // Convertir a minúsculas para evitar problemas con la comparación

    // Clasificación Prosegur
    if (observacion.includes('prosegur') || observacion.includes('recuento') || observacion.includes('juncadella')) {
        cantidadProsegur++;
        importeProsegur += ajuste;
    }
    // Clasificación Redondeo
    else if (observacion.includes('redondeo') || observacion.includes('vuelto') || observacion.includes('gasto') || observacion.includes('gastos') || observacion.includes('gastoa') || observacion.includes('cambio')) {
        cantidadRedondeo++;
        importeRedondeo += ajuste;
    }
    // Clasificación Operativo (restante)
    else if (observacion.includes('reverso') || observacion.includes('fallo') || observacion.includes('cashback')) {
        cantidadOperativo++;
        importeOperativo += ajuste;
    } else {
        cantidadOperativo++;
        importeOperativo += ajuste;
    }
}

// Obtener los datos de la API
fetch(apiURL)
    .then(response => response.json())
    .then(data => {
        // Procesar los datos de la API
        data.forEach(item => {
            let ajuste = parseFloat(item.Total.replace(/[^0-9,-]+/g, "").replace(',', '.')); // Asegurar el formato correcto del importe
            sumaAjustes++; // Incrementar la cantidad de ajustes
            totalImporte += ajuste; // Sumar el importe total

            // Verificar si el ajuste pertenece a una sucursal de no venta
            if (sucursalesNoVenta.includes(parseInt(item.Suc))) { // Asegúrate de que 'Suc' sea el identificador correcto en los datos
                ajusteNoVenta += ajuste;
                cantidadAjustesNoVenta++;
            } else {
                ajusteVenta += ajuste;
                cantidadAjustesVenta++;

                // Clasificar ajustes de venta en función del campo Observacion
                clasificarAjustes(ajuste, item.Observacion); // item.Observacion sería el campo de observación en la API
            }
        });

        // Asignar el importe del último mes (Agosto) y actualizar datos fijos
        importeAgosto = totalImporte;
        cmovimientos = [...Object.values(monthlyData), sumaAjustes]; // Combinar datos fijos con la suma de ajustes de la API

        // Calcular la diferencia en porcentaje con respecto al mes anterior (Julio)
        diferencia = cmovimientos[cmovimientos.length - 1] - cmovimientos[cmovimientos.length - 2];
        porcentajeCambio = ((diferencia / cmovimientos[cmovimientos.length - 2]) * 100).toFixed(2);

        signo = diferencia > 0 ? "+" : "";

        // Mostrar la cantidad total de ajustes
        document.getElementById('total-adjustments').innerText = formatNumber(sumaAjustes);

        // Mostrar los resultados de las clasificaciones en la interfaz con estilos solo para los importes
        document.getElementById('prosegur-total').innerHTML = `
Prosegur: ${cantidadProsegur} Ajustes <br> 
<i class="fa-solid ${importeProsegur > 0 ? 'fa-arrow-trend-down' : 'fa-arrow-trend-up'}" style="color: ${importeProsegur > 0 ? '#D50000' : '#2E7D32'};"></i>
<span style="color: ${importeProsegur > 0 ? '#D50000' : '#2E7D32'};">${formatCurrency(importeProsegur)}</span>
`;

        document.getElementById('redondeo-total').innerHTML = `
Redondeo: ${cantidadRedondeo} Ajustes <br> 
<i class="fa-solid ${importeRedondeo > 0 ? 'fa-arrow-trend-down' : 'fa-arrow-trend-up'}" style="color: ${importeRedondeo > 0 ? '#D50000' : '#2E7D32'};"></i>
<span style="color: ${importeRedondeo > 0 ? '#D50000' : '#2E7D32'};">${formatCurrency(importeRedondeo)}</span>
`;

        document.getElementById('operativo-total').innerHTML = `
Operativo: ${cantidadOperativo} Ajustes <br> 
<i class="fa-solid ${importeOperativo > 0 ? 'fa-arrow-trend-down' : 'fa-arrow-trend-up'}" style="color: ${importeOperativo > 0 ? '#D50000' : '#2E7D32'};"></i>
<span style="color: ${importeOperativo > 0 ? '#D50000' : '#2E7D32'};">${formatCurrency(importeOperativo)}</span>
`;

        // Determinar el icono y el color para suc-no-venta-total
        const isNoVentaPositive = ajusteNoVenta < 0; // Cambiar la condición
        const noVentaIcon = isNoVentaPositive ?
            '<i class="fa-solid fa-arrow-trend-up" style="color: #2E7D32;"></i>' :
            '<i class="fa-solid fa-arrow-trend-down" style="color: #D50000;"></i>';
        const formattedAjusteNoVenta = formatCurrency(ajusteNoVenta);

        // Mostrar la cantidad de ajustes y el total de ajustes por sucursal de no venta
        document.getElementById('suc-no-venta-total').innerHTML = `SUC No Venta: ${cantidadAjustesNoVenta} Ajustes <br>${noVentaIcon} <span style="font-weight: bold; color:${isNoVentaPositive ? '#2E7D32' : '#D50000'}">${formattedAjusteNoVenta}</span>`;

        // Determinar el icono y el color para suc-venta-total
        const isVentaPositive = ajusteVenta < 0; // Cambiar la condición
        const ventaIcon = isVentaPositive ?
            '<i class="fa-solid fa-arrow-trend-up" style="color: #2E7D32;"></i>' :
            '<i class="fa-solid fa-arrow-trend-down" style="color: #D50000;"></i>';
        const formattedAjusteVenta = formatCurrency(ajusteVenta);

        // Mostrar la cantidad de ajustes y el total de ajustes por sucursal de venta
        document.getElementById('suc-venta-total').innerHTML = `SUC Venta: ${cantidadAjustesVenta} Ajustes <br>${ventaIcon} <span style="font-weight: bold; color:${isVentaPositive ? '#2E7D32' : '#D50000'}">${formattedAjusteVenta}</span>`;

        // Determinar el icono y el color basados en el signo del importe total
        const isTotalPositive = totalImporte < 0; // Cambiar la condición
        const totalIcon = isTotalPositive ?
            '<i class="fa-solid fa-arrow-trend-up" style="color: #2E7D32;"></i>' :
            '<i class="fa-solid fa-arrow-trend-down" style="color: #D50000;"></i>';
        const formattedTotal = formatCurrency(totalImporte);

        // Mostrar el importe total
        document.querySelector('.total-error-importe-sf').innerHTML = `${totalIcon} <span style="font-weight: bold; color:${isTotalPositive ? '#2E7D32' : '#D50000'}">${formattedTotal}</span>`;

        // Mostrar la comparación en porcentaje
        document.getElementById('change-percentage').innerText = `${signo}${porcentajeCambio}%`;

        // Cargar el gráfico
        loadChart();
    })
    .catch(error => console.error('Error al obtener los datos:', error));


// Función para inicializar o actualizar el gráfico con ApexCharts
function loadChart() {

    const monthAbbreviations = months.map(month => {
        return month.slice(0, 3); // Abreviar los primeros 3 caracteres de cada mes
    });

    var options = {
        series: [{
            name: 'Cantidad de Ajustes',
            data: cmovimientos
        }],
        chart: {
            height: 300,

            type: 'area',
            zoom: { enabled: false },
            toolbar: { show: false },
            animations: {
                enabled: true,     // Asegúrate de que esté en true
                easing: 'easeinout',  // Cambia a 'easeinout' para una transición más suave
                speed: 5000,       // Incrementa el tiempo de animación si es necesario
                animateGradually: {
                    enabled: true,
                    delay: 150      // Retardo entre la aparición de cada punto
                },
                dynamicAnimation: {
                    speed: 1000    // Duración de la animación dinámica (cuando cambia el gráfico)
                }
            },
        },
        dataLabels: { enabled: false },
        stroke: {
            curve: 'straight',
            width: 3,
        },
        markers: {
            size: 4, // Tamaño de los puntos
            colors: ['#D50000'], // Color de los puntos
            strokeColors: '#fff', // Color del borde de los puntos
            strokeWidth: 4,
            hover: {
                size: 8 // Tamaño del punto al pasar el mouse
            }
        },
        xaxis: {
            categories: [...monthAbbreviations, 'Ago'],
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
            strokeDashArray: 5, // Líneas en puntos
            xaxis: {
                lines: {
                    show: true // Solo líneas verticales
                }
            },
            yaxis: {
                lines: {
                    show: false // Solo líneas verticales
                }
            }
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function (value) {
                    return `${value}`;
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
        colors: ['#D50000'],

        // Anotaciones de texto dentro del gráfico
        annotations: {
            points: [
                {
                    x: 'Jun', // Asegúrate de que el valor coincida con las categorías abreviadas
                    y: 1304, // Verifica que este valor esté dentro del rango de los datos
                    marker: {
                        size: 0,
                        fillColor: '#D50000',
                        strokeColor: '#D50000',
                        shape: 'circle'
                    },
                    label: {
                        borderColor: '#D50000',
                        offsetY: -10,
                        style: {
                            color: '#fff',
                            background: '#D50000'
                        },
                        text: 'Norma 91 - Movimientos Compensatorios'
                    }
                }
            ]
        }
    };

    var chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
}


function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Introducción
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 255); // Color azul para el título
    doc.text("Informe de Ajustes por Mes", 10, 20);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Color negro para el texto
    doc.text("Este informe proporciona un análisis exhaustivo de los ajustes efectuados en las sucursales durante el período actual. El documento está estructurado para ofrecer una visión clara y detallada de las modificaciones, diferenciando entre ajustes realizados en sucursales de venta y aquellas de no venta. Además, incluye una comparación con el mes anterior, facilitando una perspectiva completa de las tendencias y cambios en las operaciones.", 10, 30, { maxWidth: 180 });
    // Datos generales
    doc.setFontSize(13);
    doc.setTextColor(0, 102, 204); // Color azul para los subtítulos
    doc.text("Datos Generales", 10, 60);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Color azul para los subtítulos
    doc.text("El informe detalla los ajustes acumulados, proporcionando datos precisos sobre el número total de ajustes y el monto asociado a cada categoría de sucursales. Se presenta una comparación exhaustiva entre las sucursales de venta y las de no venta, destacando las variaciones y patrones significativos que han emergido durante el período de análisis.", 10, 70, { maxWidth: 180 });
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Color negro para el texto
    doc.text(`Cantidad Total de Ajustes: ${formatNumber(sumaAjustes)}`, 10, 95, { maxWidth: 180 });
    doc.text(`Importe Total: ${formatCurrency(totalImporte)}`, 10, 100, { maxWidth: 180 });
    doc.text(`Ajustes de Sucursales No Venta: ${cantidadAjustesNoVenta}`, 10, 105, { maxWidth: 180 });
    doc.text(`Total Ajustes No Venta: ${formatCurrency(ajusteNoVenta)}`, 10, 110, { maxWidth: 180 });
    doc.text(`Ajustes de Sucursales Venta: ${cantidadAjustesVenta}`, 10, 115, { maxWidth: 180 });
    doc.text(`Total Ajustes Venta: ${formatCurrency(ajusteVenta)}`, 10, 120, { maxWidth: 180 });

    // Comparación con el mes anterior
    doc.setFontSize(13);
    doc.setTextColor(0, 102, 204); // Color azul para los subtítulos
    doc.text("Comparación con el Mes Anterior", 10, 135);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Color negro para el texto
    doc.text(`Cambio con respecto al mes anterior: ${porcentajeCambio}%`, 10, 145, { maxWidth: 180 });

    // Capturar gráfico usando html2canvas
    html2canvas(document.querySelector("#chart")).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, 'PNG', 10, 155, 190, 100); // Ajusta las dimensiones según sea necesario

        // Análisis final
        doc.setFontSize(13);
        doc.setTextColor(0, 102, 204); // Color azul para los subtítulos
        doc.text("Análisis Final", 10, 260);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0); // Color negro para el texto
        doc.text("En el análisis final, se observa que los ajustes han tenido un impacto significativo en el total acumulado. El comportamiento de los ajustes en las sucursales de venta y no venta ha mostrado variaciones importantes, lo que debe ser considerado para la planificación futura.", 10, 270, { maxWidth: 180 });

        // Guardar el PDF
        doc.save("Informe_Ajustes.pdf");
    });
}

// Añadir el event listener al botón
document.getElementById('generate-pdf').addEventListener('click', generatePDF);

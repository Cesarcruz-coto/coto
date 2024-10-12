async function cargarGastos(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error("Error al cargar los gastos:", error);
        return [];
    }
}

// Función que procesa los gastos y calcula el total
function procesarGastos(gastosFiltrados) {
    // Calcular el importe total
    const totalGastosSucursal = gastosFiltrados.reduce((total, gasto) => {
        if (gasto.Total) {
            const valor = gasto.Total.replace('$', '').replace('.', '').replace(',', '.');
            const numero = parseFloat(valor);
            return total + (isNaN(numero) ? 0 : numero);
        }
        return total;
    }, 0);
    
    return totalGastosSucursal;
}


function calcularDiferencias(totales) {
    const diferencias = [];
    for (let i = 1; i < totales.length; i++) {
        const diferencia = ((totales[i] - totales[i - 1]) / totales[i - 1]) * 100;
        diferencias.push(diferencia);
    }
    diferencias.unshift(0); // Agregar un 0% para el primer mes
    return diferencias;
}

function formatCurrency(value) {
    return `$ ${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function generarGrafico(totales) {
    const diferencias = calcularDiferencias(totales); // Calcular diferencias porcentuales

    var options = {
        series: [{
            name: 'Total Gastos',
            data: totales // Valores de los meses
        }],
        chart: {
            height: 200,
            
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
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.8,
                opacityTo: 0.6,
                stops: [0, 90, 100]
            }
        },
        stroke: {
            curve: 'straight',
            width: 3, // Grosor de la línea
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
        xaxis: {
            categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'], // Nombres de los meses abreviados
            labels: {
                show: true // Mostrar etiquetas de los meses
            },
            axisBorder: {
                show: false // Eliminar el borde del eje x
            },
            axisTicks: {
                show: false // Eliminar las marcas del eje x
            }
        },
        yaxis: {
            title: {
                text: ''
            },
            labels: {
                formatter: function (value) {
                    return formatCurrency(value);
                },
                show: false // Eliminar etiquetas del eje y
            },
            axisBorder: {
                show: false // Eliminar el borde del eje y
            },
            axisTicks: {
                show: false // Eliminar las marcas del eje y
            }
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function (value) {
                    return formatCurrency(value); // Usar la función formatCurrency para el tooltip
                }
            }
        },
        colors: ['#450091'], // Color de la línea del gráfico
        dataLabels: {
            enabled: false // Deshabilitar etiquetas de datos en la línea
        },
        annotations: {
            points: [] // Inicializa puntos de anotaciones
        }
    };

    // Agregar anotaciones de las diferencias porcentuales y totales
    for (let i = 0; i < diferencias.length; i++) {
        const textoDiferencia = diferencias[i].toFixed(2) + '%';
        options.annotations.points.push({
            x: options.xaxis.categories[i], // Mes correspondiente
            y: totales[i], // Valor del mes
            marker: {
                size: 8, // Tamaño del marcador
                fillColor: '#450091', // Cambiar a cualquier color deseado
                strokeColor: '#fff', // Color del borde del marcador
                strokeWidth: 4, // Grosor del borde del marcador
            },
            label: {
                text: `${textoDiferencia}`, // Texto de la diferencia
                style: {
                    color: '#000',
                    background: '#fff',
                    border: '1px solid #000',
                    fontSize: '12px',
                    whiteSpace: 'nowrap' // Evitar el ajuste de línea
                }
            }
        });
    }

    var chart = new ApexCharts(document.querySelector("#chartGastos"), options);
    chart.render();
}

async function cargarYMostrarGastos() {
    const urlMesActual = 'https://recaudaciones.s3.us-east-2.amazonaws.com/DATOS-AGOSTO-24/GASTOSUC.json';
    const gastosMesActual = await cargarGastos(urlMesActual);

    // Datos fijos para los meses de enero a septiembre
    const totalEnero = 121361354.00; // Reemplaza con el total real de enero
    const totalFebrero = 116995940.00; // Reemplaza con el total real de febrero
    const totalMarzo = 124213343.00; // Reemplaza con el total real de marzo
    const totalAbril = 126031472.00; // Reemplaza con el total real de abril
    const totalMayo = 151567979.00; // Reemplaza con el total real de mayo
    const totalJunio = 123899209.29; // Reemplaza con el total real de junio
    const totalJulio = 140745488.00; // Reemplaza con el total real de julio
    const totalMesActual = procesarGastos(gastosMesActual);

    // Generar el gráfico con los totales
    generarGrafico([
        totalEnero,
        totalFebrero,
        totalMarzo,
        totalAbril,
        totalMayo,
        totalJunio,
        totalJulio,
        totalMesActual
    ]);
}

// Inicializar la carga y el gráfico
cargarYMostrarGastos();

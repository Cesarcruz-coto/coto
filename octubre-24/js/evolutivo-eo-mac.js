import { apis } from './api.js';
const apiErroresActual = apis.apiErroresActual;
const apiErroresJulio = apis.apiErroresJulio;
const apiErroresAgosto = apis.apiErroresAgosto;

const apiMovimientosActual = apis.apiMovimientosActual;
const apiMovimientosJulio = apis.apiMovimientosJulio;
const apiMovimientosAgosto = apis.apiMovimientosAgosto;


// Obtener los datos de las APIs
const obtenerDatos = async () => {
    try {
        // Fetching data from the APIs
        const [dataErroresActual, dataErroresJulio, dataErroresAgosto] = await Promise.all([
            fetch(apiErroresActual).then(res => res.json()),
            fetch(apiErroresJulio).then(res => res.json()),
            fetch(apiErroresAgosto).then(res => res.json())
        ]);

        const [dataMovimientosActual, dataMovimientosJulio, dataMovimientosAgosto] = await Promise.all([
            fetch(apiMovimientosActual).then(res => res.json()),
            fetch(apiMovimientosJulio).then(res => res.json()),
            fetch(apiMovimientosAgosto).then(res => res.json())
        ]);

        // Calcular datos de errores
        const calcularDatosErrores = (data) => {
            let cantidadErrores = 0;
            let sumaImportesErrores = 0;
            let sumaImportesErroresResueltos = 0;

            data.forEach(item => {
                const importe = parseFloat(item.Importe.replace(/[^0-9,-]+/g, "").replace(',', '.'));
                if (item.TAjuste === "Error Operativo Sin Resolver") {
                    cantidadErrores++;
                    sumaImportesErrores += importe;
                } else if (item.TAjuste === "Error Operativo Resuelto" || item.TAjuste === "Error Operativo Caja Resuelto") {
                    sumaImportesErroresResueltos += importe;
                }
            });

            return { cantidadErrores, sumaImportesErrores, sumaImportesErroresResueltos };
        };

        const { cantidadErrores: cantidadErroresActual, sumaImportesErrores: sumaImportesErroresActual, sumaImportesErroresResueltos: sumaImportesErroresResueltosActual } = calcularDatosErrores(dataErroresActual);
        const { cantidadErrores: cantidadErroresJulio } = calcularDatosErrores(dataErroresJulio);
        const { cantidadErrores: cantidadErroresAgosto } = calcularDatosErrores(dataErroresAgosto);

        // Calcular datos de movimientos
        const calcularDatosMovimientos = (data) => {
            let cantidadMovimientos = 0;
            let sumaImportes = 0;
            let sumaImportesMovimientosConciliados = 0;

            data.forEach(item => {
                const importe = parseFloat(item.Importe.replace(/[^0-9,-]+/g, "").replace(',', '.'));
                if (item.TAjuste === "Movimiento A Conciliar") {
                    cantidadMovimientos++;
                    sumaImportes += importe;
                } else if (item.TAjuste === "Movimiento Conciliado" || item.TAjuste === "Movimiento De Caja Conciliado") {
                    sumaImportesMovimientosConciliados += importe;
                }
            });

            return { cantidadMovimientos, sumaImportes, sumaImportesMovimientosConciliados };
        };

        const { cantidadMovimientos: cantidadMovimientosActual, sumaImportes: sumaImportesActual, sumaImportesMovimientosConciliados: sumaImportesMovimientosConciliadosActual } = calcularDatosMovimientos(dataMovimientosActual);
        const { cantidadMovimientos: cantidadMovimientosJulio } = calcularDatosMovimientos(dataMovimientosJulio);
        const { cantidadMovimientos: cantidadMovimientosAgosto } = calcularDatosMovimientos(dataMovimientosAgosto);

        // Actualizar la interfaz de usuario
        document.getElementById('total-errors').innerHTML = `${cantidadErroresActual}`;
        document.getElementById('total-error-importes').innerHTML = `
            <i class="fa-solid ${sumaImportesErroresActual > 0 ? 'fa-arrow-trend-down' : 'fa-arrow-trend-up'}" style="color: ${sumaImportesErroresActual > 0 ? '#D50000' : '#2E7D32'};"></i>
            <span style="color: ${sumaImportesErroresActual > 0 ? '#D50000' : '#2E7D32'};">$ ${sumaImportesErroresActual.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        `;
        document.getElementById('total-error-resuelto-importes').innerHTML = `
            <i class="fa-solid ${sumaImportesErroresResueltosActual > 0 ? 'fa-arrow-trend-down' : 'fa-arrow-trend-up'}" style="color: ${sumaImportesErroresResueltosActual > 0 ? '#D50000' : '#2E7D32'};"></i>
            <span style="color: ${sumaImportesErroresResueltosActual > 0 ? '#D50000' : '#2E7D32'};">$ ${sumaImportesErroresResueltosActual.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        `;
        document.getElementById('total-movimientos-i').innerText = cantidadMovimientosActual;
        document.getElementById('total-importes').innerHTML = `
            <i class="fa-solid ${sumaImportesActual > 0 ? 'fa-arrow-trend-down' : 'fa-arrow-trend-up'}" style="color: ${sumaImportesActual > 0 ? '#D50000' : '#2E7D32'};"></i>
            <span style="color: ${sumaImportesActual > 0 ? '#D50000' : '#2E7D32'};">$ ${sumaImportesActual.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        `;
        document.getElementById('total-movimientos-conciliados-importes').innerHTML = `
            <i class="fa-solid ${sumaImportesMovimientosConciliadosActual > 0 ? 'fa-arrow-trend-down' : 'fa-arrow-trend-up'}" style="color: ${sumaImportesMovimientosConciliadosActual > 0 ? '#D50000' : '#2E7D32'};"></i>
            <span style="color: ${sumaImportesMovimientosConciliadosActual > 0 ? '#D50000' : '#2E7D32'};">$ ${sumaImportesMovimientosConciliadosActual.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        `;

        // Calcular y mostrar la comparación en porcentaje
        const diferenciaErrores = cantidadErroresActual - cantidadErroresAgosto;
        const porcentajeCambioErrores = ((diferenciaErrores / cantidadErroresAgosto) * 100).toFixed(2);
        const signoErrores = diferenciaErrores > 0 ? "+" : "";
        document.getElementById('comparison').innerText = `${signoErrores} ${porcentajeCambioErrores}%`;

        const diferenciaMovimientos = cantidadMovimientosActual - cantidadMovimientosAgosto;
        const porcentajeCambioMovimientos = ((diferenciaMovimientos / cantidadMovimientosAgosto) * 100).toFixed(2);
        const signoMovimientos = diferenciaMovimientos > 0 ? "+" : "";
        document.getElementById('comparison-movimientos').innerText = `${signoMovimientos} ${porcentajeCambioMovimientos}%`;

        // Mostrar gráficos con ApexCharts
        const errorChartOptions = {
            series: [{
                name: '2024',
                data: [
                    calcularDatosErrores(dataErroresJulio).cantidadErrores,
                    calcularDatosErrores(dataErroresAgosto).cantidadErrores,
                    cantidadErroresActual
                ],
            },
            {
                name: '2023',
                data: [2780, 2444, 3154] // Datos para AGO, SEP, OCT
            }],
            chart: {
                type: 'area',
                
                height: 150,
                animations: {
                    enabled: true,     // Asegúrate de que esté en true
                    easing: 'easeinout',  // Cambia a 'easeinout' para una transición más suave
                    speed: 3000,       // Incrementa el tiempo de animación si es necesario
                    animateGradually: {
                        enabled: true,
                        delay: 150      // Retardo entre la aparición de cada punto
                    },
                    dynamicAnimation: {
                        speed: 1000    // Duración de la animación dinámica (cuando cambia el gráfico)
                    }
                },   
            },
            xaxis: {
                categories: ['Ago', 'Sep', 'Oct'],
                labels: {
                    show: false // Ocultar etiquetas del eje x
                },
                axisBorder: {
                    show: false // Eliminar la línea debajo del eje X
                },
                axisTicks: {
                    show: false
                }
            },
            yaxis: {
                labels: {
                    show: false, // Ocultar etiquetas del eje y
                    formatter: function(value) {
                        return `${value}`;
                    }
                },
                axisBorder: {
                    show: false // Eliminar la línea debajo del eje X
                },
                axisTicks: {
                    show: false
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'straight',
                width: 3
            },
            markers: {
                size: 4, // Tamaño de los puntos
                colors: ['#D50000', '#007bff'], // Color de los puntos
                strokeColors: '#fff', // Color del borde de los puntos
                strokeWidth: 4,
                hover: {
                    size: 8 // Tamaño del punto al pasar el mouse
                }
            },
            legend: {
                show: false
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
            colors: ['#D50000', '#007bff'],
            grid: {
                show: true,
                borderColor: '#e0e0e0',
                strokeDashArray: 5,
                xaxis: {
                    lines: {
                        show: true
                    }
                },
                yaxis: {
                    lines: {
                        show: false
                    }
                }
            },
            tooltip: {
                theme: 'dark'
            },
            toolbar: {
                show: false // Ocultar menú de descarga
            }
        };
        

        const movimientoChartOptions = {
            series: [{
                name: '2024',
                data: [
                    calcularDatosMovimientos(dataMovimientosJulio).cantidadMovimientos,
                    calcularDatosMovimientos(dataMovimientosAgosto).cantidadMovimientos,
                    cantidadMovimientosActual
                ]
            },
            {
                name: '2023',
                data: [789, 650, 832] // Datos para AGO, SEP, OCT
            }
        ],
            chart: {
                type: 'area',
                
                height: 150,
                animations: {
                    enabled: true,     // Asegúrate de que esté en true
                    easing: 'easeinout',  // Cambia a 'easeinout' para una transición más suave
                    speed: 3000,       // Incrementa el tiempo de animación si es necesario
                    animateGradually: {
                        enabled: true,
                        delay: 150      // Retardo entre la aparición de cada punto
                    },
                    dynamicAnimation: {
                        speed: 1000    // Duración de la animación dinámica (cuando cambia el gráfico)
                    }
                },   
            },
            xaxis: {
                categories: ['Ago', 'Sep', 'Oct'],
                labels: {
                    show: false // Ocultar etiquetas del eje x
                },
                axisBorder: {
                    show: false // Eliminar la línea debajo del eje X
                },
                axisTicks: {
                    show: false
                }
            },
            yaxis: {
                labels: {
                    show: false, // Ocultar etiquetas del eje y
                    formatter: function(value) {
                        return `${value}`;
                    }
                },
                axisBorder: {
                    show: false // Eliminar la línea debajo del eje X
                },
                axisTicks: {
                    show: false
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'straight',
                width: 3
            },
            legend: {
                show: false
            },
            markers: {
                size: 4, // Tamaño de los puntos
                colors: ['#D50000', '#007bff'], // Color de los puntos
                strokeColors: '#fff', // Color del borde de los puntos
                strokeWidth: 4,
                hover: {
                    size: 8 // Tamaño del punto al pasar el mouse
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
            colors: ['#D50000', '#007bff'],
            grid: {
                show: true,
                borderColor: '#e0e0e0',
                strokeDashArray: 5,
                xaxis: {
                    lines: {
                        show: true
                    }
                },
                yaxis: {
                    lines: {
                        show: false
                    }
                }
            },
            tooltip: {
                theme: 'dark'
            },
            toolbar: {
                show: false // Ocultar menú de descarga
            }
        };

        // Renderizar los gráficos
        const errorChart = new ApexCharts(document.querySelector("#errorChart"), errorChartOptions);
        errorChart.render();

        const movimientoChart = new ApexCharts(document.querySelector("#movimientoChart"), movimientoChartOptions);
        movimientoChart.render();
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
};

// Ejecutar la función para obtener y mostrar datos
obtenerDatos();

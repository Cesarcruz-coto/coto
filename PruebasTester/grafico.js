var options = {
    series: [{
        name: "2020",
        data: [10000, 41000, 35000, 51000, 49000, 62000, 69000, 91000, 148000, 85000, 75000, 100000] // Datos para 2020
    },
    {
        name: "2021",
        data: [250000, 48000, 40000, 60000, 55000, 70000, 80000, 95000, 150000, 90000, 85000, 110000] // Datos para 2021
    },
    {
        name: "2022",
        data: [250000, 48000, 40000, 60000, 55000, 70000, 80000, 95000, 150000, 90000, 85000, 110000] // Datos para 2022
    },
    {
        name: "2023",
        data: [250000, 48000, 40000, 60000, 55000, 70000, 80000, 95000, 150000, 90000, 85000, 110000] // Datos para 2023
    },
    {
        name: "2024",
        data: [250000, 48000, 40000, 60000, 55000, 70000, 80000, 95000, 150000, 90000, 85000, 110000] // Datos para 2024
    }],
    chart: {
        height: 500,
        type: 'line',
        zoom: {
            enabled: false
        }
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'straight'
    },
    title: {
        text: 'Grafico',
        align: 'left'
    },
    grid: {
        row: {
            colors: ['#f3f3f3', 'transparent'],
            opacity: 0.5
        }
    },
    xaxis: {
        categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], // Meses en el eje X
    },
    yaxis: {
        show: false // Desactiva el eje Y
    }
};

var chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();

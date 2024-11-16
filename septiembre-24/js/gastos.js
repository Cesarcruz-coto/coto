import { apis } from './api.js';

// Función para parsear valores monetarios
const parseCurrency = (value) => {
    return parseFloat(value.replace('$', '').replace(/\./g, '').replace(',', '.')) || 0;
};

// Función para parsear fechas en formato DD/MM/YYYY a objetos Date
const parseFecha = (fechaStr) => {
    const [dia, mes, anio] = fechaStr.split('/');
    return new Date(`${anio}-${mes}-${dia}`);
};

// Función para crear opciones del select
const crearOpcionesSelect = (sucursales, selectElement) => {
    const fragment = document.createDocumentFragment();
    sucursales.forEach(sucursal => {
        const option = document.createElement('option');
        option.value = sucursal;
        option.textContent = sucursal;
        fragment.appendChild(option);
    });
    selectElement.appendChild(fragment);
};

// Función para mostrar el ranking de sucursales
const mostrarRankingSucursales = (data) => {
    const rankingList = document.getElementById('ranking-list');

    // Limpiar el contenido anterior, excepto el encabezado
    rankingList.innerHTML = `
        <div class="gasto-header">
            <span>#</span>
            <span>Suc</span>
            <span>Total Gastos</span>
            <span>Gasto Principal</span>
            <span>% del Total</span>
        </div>
    `;

    // Inicializar acumuladores para los gastos por sucursal y su gasto principal
    const totalGastosPorSucursal = {};
    const gastoPrincipalPorSucursal = {};

    data.forEach(({ SUCGCIA: sucursal, Total: totalStr, Descr: descripcion }) => {
        const total = parseCurrency(totalStr);

        // Acumular el total por sucursal
        totalGastosPorSucursal[sucursal] = (totalGastosPorSucursal[sucursal] || 0) + total;

        // Acumular el gasto por descripción
        gastoPrincipalPorSucursal[sucursal] = gastoPrincipalPorSucursal[sucursal] || {};
        gastoPrincipalPorSucursal[sucursal][descripcion] = (gastoPrincipalPorSucursal[sucursal][descripcion] || 0) + total;
    });

    // Calcular el total general de gastos
    const totalGastosGeneral = Object.values(totalGastosPorSucursal).reduce((acc, val) => acc + val, 0);

    // Crear un array de ranking ordenado
    const rankingArray = Object.entries(totalGastosPorSucursal)
        .map(([sucursal, total]) => ({
            sucursal,
            total,
            gastoPrincipal: Object.entries(gastoPrincipalPorSucursal[sucursal])
                .reduce((a, b) => (a[1] > b[1] ? a : b))[0]
        }))
        .sort((a, b) => b.total - a.total);

    // Crear y agregar elementos al DOM
    const fragment = document.createDocumentFragment();
    rankingArray.forEach(({ sucursal, total, gastoPrincipal }, index) => {
        // Calcular el porcentaje respecto al total general
        const porcentaje = totalGastosGeneral > 0 ? ((total / totalGastosGeneral) * 100).toFixed(2) : '0.00';

        const li = document.createElement('div');
        li.className = 'gasto-item';
        li.innerHTML = `
            <span>${index + 1}</span>
            <span>${sucursal}</span>
            <span>$ ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span>${gastoPrincipal}</span>
            <span>${porcentaje}%</span>
        `;
        fragment.appendChild(li);
    });

    rankingList.appendChild(fragment);
};


const cargarGastos = async () => {
    try {
        const response = await fetch(apis.apiGastosActual);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const sucursalSelect = document.getElementById('sucursal-select');
        const sucursales = [...new Set(data.map(gasto => gasto.SUCGCIA))].sort((a, b) => a - b);
        crearOpcionesSelect(sucursales, sucursalSelect);

        sucursalSelect.addEventListener('change', () => {
            const sucursalSeleccionada = sucursalSelect.value;
            mostrarGastosPorSucursal(data, sucursalSeleccionada);
        });
        actualizarTotales(data);
        actualizarPromedioGastos(data);
        actualizarPorcentajeCrecimiento(data);
        mostrarGastosPorSucursal(data, 'todas');
        mostrarRankingSucursales(data);
        obtenerSucursalMayorGasto(data);
    } catch (error) {
        console.error("Error al cargar los gastos:", error);
        // Opcional: Mostrar mensaje de error en la UI
    }
};

const obtenerSucursalMayorGasto = (data) => {
    // Calcular el total de gastos por sucursal
    const totalGastosPorSucursal = {};

    data.forEach(({ SUCGCIA: sucursal, Total: totalStr }) => {
        const total = parseCurrency(totalStr);
        totalGastosPorSucursal[sucursal] = (totalGastosPorSucursal[sucursal] || 0) + total;
    });

    // Encontrar la sucursal con el mayor gasto
    const sucursalMayorGasto = Object.entries(totalGastosPorSucursal)
        .reduce((max, current) => current[1] > max[1] ? current : max, ['', 0]);

    const [sucursal, totalGasto] = sucursalMayorGasto;

    // Actualizar el div con el nombre de la sucursal y el importe del gasto
    document.getElementById('sucursal-mayor-gasto').textContent = `${sucursal}`;
    document.getElementById('importe-mayor-gasto').innerHTML = `
        <span style="color: ${totalGasto < 0 ? '#256528' : '#b50000'};">
            <i class="fa-solid ${totalGasto < 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}"></i>
            <b>$ ${totalGasto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
        </span>
    `;
};


const actualizarTotales = (data) => {
    // Calcular el total de la cantidad de gastos y el importe total de gastos
    const totalGastos = data.reduce((total, gasto) => total + parseCurrency(gasto.Total), 0);
    const cantidadGastos = data.length;

    // Actualizar los divs con los valores calculados
    document.getElementById('total-gastos').textContent = cantidadGastos;
    // Para total-gasto-importe
document.getElementById('total-gasto-importe').innerHTML = `<span style="color: ${totalGastos < 0 ? '#256528' : '#b50000'};">
  <i class="fa-solid ${totalGastos < 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}"></i>
  $ ${totalGastos.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</span>
`;

};

const actualizarPorcentajeCrecimiento = (data) => {
    // Dato fijo: importe del mes anterior
    const gastoMesAnterior = 148319559.43;

    // Calcular el total de gastos del mes actual
    const totalGastos = data.reduce((acc, { Total }) => acc + parseCurrency(Total), 0);

    // Calcular el porcentaje de crecimiento respecto al mes anterior
    const porcentajeCrecimiento = ((totalGastos - gastoMesAnterior) / gastoMesAnterior) * 100;

    // Actualizar el div con el porcentaje de crecimiento
    // Para porcentajeee-gastos
const porcentajeGastosElement = document.getElementById('porcentajeee-gastos');

// Establece el contenido y el color según el valor
porcentajeGastosElement.textContent = porcentajeCrecimiento.toFixed(2) + '%';
porcentajeGastosElement.style.color = porcentajeCrecimiento < 0 ? '#256528' : '#b50000';

};

const actualizarPromedioGastos = (data) => {
    // Calcular el total de gastos y la cantidad de sucursales
    const totalGastosPorSucursal = {};
    
    data.forEach(({ SUCGCIA: sucursal, Total: totalStr }) => {
        const total = parseCurrency(totalStr);
        totalGastosPorSucursal[sucursal] = (totalGastosPorSucursal[sucursal] || 0) + total;
    });

    const totalSucursales = Object.keys(totalGastosPorSucursal).length;
    const totalGastos = Object.values(totalGastosPorSucursal).reduce((acc, val) => acc + val, 0);

    // Calcular el promedio de gastos por sucursal
    const promedioGastos = totalSucursales > 0 ? (totalGastos / totalSucursales) : 0;

    // Actualizar los divs con el promedio
    document.getElementById('promedio-gastos').textContent = totalSucursales;
    // Para promedio-gasto-importe
// Para promedio-gasto-importe
document.getElementById('promedio-gasto-importe').innerHTML = `<span style="color: ${promedioGastos < 0 ? '#256528' : '#b50000'};">
    <i class="fa-solid ${promedioGastos < 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}"></i>
    $ ${promedioGastos.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  </span>
`;

};

const mostrarGastosPorSucursal = (data, sucursalSeleccionada) => {
    const gastosDiv = document.getElementById('top-gastos');
    const resumenList = document.getElementById('resumen-list');
    const nombreSucursal = document.getElementById('nombre-sucursal');
    const porcentajeGastosDiv = document.getElementById('porcentaje-gastos');
    const totalSucursalDiv = document.getElementById('total-sucursal');
    const cargarMasBtn = document.getElementById('mostrar-mas-i');

    // Limpiar los contenidos anteriores
    gastosDiv.innerHTML = '';
    resumenList.innerHTML = '';
    porcentajeGastosDiv.innerHTML = '';
    totalSucursalDiv.innerHTML = '';

    const gastosFiltrados = sucursalSeleccionada !== 'todas'
        ? data.filter(gasto => gasto.SUCGCIA === sucursalSeleccionada)
        : data;

    nombreSucursal.textContent = sucursalSeleccionada === 'todas' ? 'Todas' : sucursalSeleccionada;

    const totalGastos = data.reduce((total, gasto) => total + parseCurrency(gasto.Total), 0);
    const totalGastosSucursal = gastosFiltrados.reduce((total, gasto) => total + parseCurrency(gasto.Total), 0);

    porcentajeGastosDiv.textContent = totalGastos > 0
        ? `El gasto de esta sucursal representa el ${(totalGastosSucursal / totalGastos * 100).toFixed(2)}% del total.`
        : "No hay gastos registrados.";

    totalSucursalDiv.textContent = `Total gastos de la sucursal: $ ${totalGastosSucursal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Calcular resumenPorDescripcion
const resumenPorDescripcion = gastosFiltrados.reduce((acc, { Descr: descr, Total: totalStr, SUCGCIA: Sucursal }) => {
    const total = parseCurrency(totalStr);
    acc[descr] = acc[descr] || { total: 0, detalles: [] }; // Almacena total y detalles
    acc[descr].total += total;

    // Agregar detalles por sucursal
    acc[descr].detalles.push({ sucursal: Sucursal, monto: total}); // Asegúrate de que `Sucursal` es el nombre correcto

    return acc;
}, {});

// Convertir resumenPorDescripcion en un array de [descripcion, { total, detalles }] y ordenarlo
const resumenArray = Object.entries(resumenPorDescripcion).sort((a, b) => b[1].total - a[1].total);

// Mapa de descripciones a iconos de Font Awesome
const iconMap = {
    "Gtos. Manten. Ordinario": "fa-tools",
    "Gtos. Varios Administración": "fa-briefcase",
    "Viáticos Extraordinarios": "fa-plane",
    "Viaticos y Movilidad": "fa-car",
    "Gtos. Adicionales Serv. Medic": "fa-heartbeat",
    "Mantenimiento de Rodados": "fa-truck-pickup",
    "Combustibles y Lubricantes": "fa-gas-pump",
    "Gtos. Peaje y Estacionamiento": "fa-parking",
    "Otros Serv. Contratados": "fa-handshake",
    "Gtos. Manteni. Extraordinarios": "fa-exclamation-circle",
    "Serv. y Atencion Medica": "fa-user-md",
    "Fletes y Acarreos": "fa-truck",
    "Servicio de Vigilancia": "fa-shield-alt",
    "Fletes de Envio-Suc. y Domicil": "fa-shipping-fast",
    "Tasa por Seguridad e Higiene": "fa-lock",
    "Ropa y Elementos de Trabajo": "fa-tshirt",
    "Alq. Pagados": "fa-file-invoice",
    "Gtos. de Comedor": "fa-utensils",
    "Consumos Varios": "fa-ellipsis-h",
    "Consumos Insumos Elaboración": "fa-industry",
    "Otros Gtos. de Personal": "fa-users",
    "Gtos. de Capacitacion": "fa-chalkboard-teacher",
    "Multas e Infracciones en Sucur": "fa-gavel",
    "Gtos. Analisis Bacteriológico": "fa-flask",
    "Gtos. de Repuestos": "fa-cogs",
    "Papeleria y Utiles de Oficina": "fa-pencil-alt"
};

// Crear fragmento para el resumen ordenado
const resumenFragment = document.createDocumentFragment();
resumenArray.forEach(([descr, { total, detalles }]) => {
    const porcentajeGasto = ((total / totalGastosSucursal) * 100).toFixed(2);
    const li = crearResumenItem(descr, total, porcentajeGasto, iconMap, detalles);
    resumenFragment.appendChild(li);
});
resumenList.appendChild(resumenFragment);

// Función para crear un elemento de resumen
function crearResumenItem(descr, total, porcentajeGasto, iconMap, detalles) {
    const li = document.createElement('li');
    li.className = 'gasto-resumen-item';
    const icon = iconMap[descr] ? `<i class="fa ${iconMap[descr]}"></i>` : '';

    li.innerHTML = `
    <div class="divfg">
        <span class="gasto-descripcion">${icon} ${descr}</span>
        <span class="gasto-total">$ ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span class="gasto-porcentaje">${porcentajeGasto}%</span>
        <span class="gasto-porcentaje"><button class="toggle-detail"><i class="fa fa-eye"></i> Ver</button></span>
        </div>
        <div class="sucursal-detail" style="display:none;"></div>
    `;

    // Evento de clic para mostrar/ocultar detalles de sucursales
    const toggleBtn = li.querySelector('.toggle-detail');
    const detailDiv = li.querySelector('.sucursal-detail');

    toggleBtn.addEventListener('click', () => {
        if (detailDiv.style.display === 'none') {
            mostrarDetallesSucursales(detalles, detailDiv); // Llenar detalles
            detailDiv.style.display = 'block'; // Mostrar el div
            toggleBtn.innerHTML = `<i class="fa fa-eye-slash"></i> Ocultar`; // Cambiar ícono y texto
        } else {
            detailDiv.style.display = 'none'; // Ocultar el div
            toggleBtn.innerHTML = `<i class="fa fa-eye"></i> Ver`; // Cambiar ícono y texto
        }
    });

    return li; // Retornar el elemento li completo
}


// Función para mostrar detalles de las sucursales agrupadas por tipo de gasto (descripción)
function mostrarDetallesSucursales(detalles, detailDiv) {
    // Limpiar el div antes de agregar nuevos detalles
    detailDiv.innerHTML = '';

    // Crear un objeto para agrupar los gastos por sucursal
    const sucursalResumen = detalles.reduce((acc, { sucursal, monto }) => {
        acc[sucursal] = acc[sucursal] || { count: 0, total: 0, items: [] }; // Inicializa si no existe
        acc[sucursal].count += 1; // Incrementa el contador de gastos
        acc[sucursal].total += monto; // Acumula el monto total
        acc[sucursal].items.push({ monto, sucursal }); // Guarda cada gasto individual
        return acc;
    }, {});

    // Convertir el resumen a un array y ordenar por sucursal numéricamente
    const sucursalArray = Object.entries(sucursalResumen).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

    // Mostrar los resultados ordenados
    sucursalArray.forEach(([sucursal, { count, total, items }]) => {
        // Crear un nuevo div para cada sucursal
        const div = document.createElement('div');
        div.classList.add('sucursal-detail-suc'); // Añadir clase para estilos
        
        // Asignar el contenido al div con un ícono de mostrar/ocultar detalles
        div.innerHTML = `
        <div class="sucursal-detail-one">
            <div>Suc. ${sucursal}</div> 
            <div>Cant. Gastos: ${count}</div> 
            <div>Importe: $ ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div><button class="toggle-detail-sucursal"><i class="fa fa-eye"></i> Ver</button></div>
        </div>
        <div class="detalle-gastos" style="display:none;"></div> <!-- Div para los detalles individuales -->
        `;

        // Añadir evento de clic para mostrar/ocultar detalles de la sucursal
        const toggleBtn = div.querySelector('.toggle-detail-sucursal');
        const detalleDiv = div.querySelector('.detalle-gastos');

        toggleBtn.addEventListener('click', () => {
            if (detalleDiv.style.display === 'none') {
                detalleDiv.style.display = 'block'; // Mostrar detalles
                toggleBtn.innerHTML = `<i class="fa fa-eye-slash"></i> Ocultar`; // Cambiar ícono
                mostrarGastosIndividuales(items, detalleDiv); // Mostrar los detalles de cada gasto individual
            } else {
                detalleDiv.style.display = 'none'; // Ocultar detalles
                toggleBtn.innerHTML = `<i class="fa fa-eye"></i> Ver`; // Cambiar ícono
            }
        });
        // Añadir el div al contenedor detailDiv
        detailDiv.appendChild(div);
    });
}

function mostrarGastosIndividuales(gastos, detalleDiv) {
    // Limpiar el div antes de agregar los detalles
    detalleDiv.innerHTML = '';
    // Crear un fragmento para los gastos individuales
    const fragment = document.createDocumentFragment();
    // Agregar cada gasto individualmente
    gastos.forEach(({ sucursal, monto}) => { // Asegúrate de que Fecha esté en el objeto
        const gastoDiv = document.createElement('div');
        gastoDiv.className = 'gasto-item';
        gastoDiv.innerHTML = `
            <span>Sucursal ${sucursal}</span>
            <span>Importe $ ${monto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        `;
        fragment.appendChild(gastoDiv);
    });

    // Agregar el fragmento al contenedor de detalles
    detalleDiv.appendChild(fragment);
}

    // Crear y agregar la cabecera de gastos
    const headerDiv = document.createElement('div');
    headerDiv.className = 'gasto-header';
    headerDiv.innerHTML = `
        <span>Suc</span>
        <span>Fecha</span>
        <span>Factura</span>
        <span>Descripcion</span>
        <span>Total</span>
    `;
    gastosDiv.appendChild(headerDiv);

    // Ordenar los gastos filtrados por FechaFactura de más nueva a más vieja
    gastosFiltrados.sort((a, b) => parseFecha(b.FechaFactura) - parseFecha(a.FechaFactura));

    let contador = 0;
    const limite = 30;

    const mostrarGastosLimitados = () => {
        const gastosParaMostrar = gastosFiltrados.slice(contador, contador + limite);
        const fragment = document.createDocumentFragment();

        gastosParaMostrar.forEach(({ SUCGCIA, FechaFactura, Factura, Descr, Total }) => {
            const gastoDiv = document.createElement('div');
            gastoDiv.className = 'gasto-item';
            gastoDiv.innerHTML = `
                <span>${SUCGCIA}</span>
                <span>${FechaFactura}</span>
                <span>${Factura}</span>
                <span>${Descr}</span>
                <span>$ ${parseCurrency(Total).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            `;
            fragment.appendChild(gastoDiv);
        });

        gastosDiv.appendChild(fragment);
        contador += gastosParaMostrar.length;

        if (contador >= gastosFiltrados.length) {
            cargarMasBtn.style.display = 'none';
        }
    };

    mostrarGastosLimitados();
    cargarMasBtn.onclick = mostrarGastosLimitados;
};


// Función para mostrar el tab correspondiente
const showTab = (tabId) => {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });

    // Mostrar el tab correspondiente
    const tabToShow = document.getElementById(tabId);
    tabToShow.classList.add('active');
    tabToShow.style.display = 'block';

    // Desactivar todos los botones
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Activar el botón correspondiente
    const activeButton = document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    showTab('columna-gastos');
    cargarGastos();
});

// Exponer la función showTab al ámbito global
window.showTab = showTab;

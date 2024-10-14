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

// Función para crear un elemento de lista de resumen
const crearResumenItem = (descr, total, porcentaje, iconMap) => {
    const li = document.createElement('li');
    li.className = 'gasto-resumen-item';

    const icon = iconMap[descr] ? `<i class="fas ${iconMap[descr]}"></i>` : '';

    li.innerHTML = `
        <span class="gasto-descripcion">${icon} ${descr}</span>
        <span class="gasto-total">$ ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span class="gasto-porcentaje">${porcentaje}%</span>
    `;
    return li;
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

    // Calcular el total de gastos por sucursal y encontrar el gasto principal
    const totalGastosPorSucursal = {};
    const gastoPrincipalPorSucursal = {};

    data.forEach(({ SUCGCIA: sucursal, Total: totalStr, Descr: descripcion }) => {
        const total = parseCurrency(totalStr);

        // Acumular el total por sucursal
        totalGastosPorSucursal[sucursal] = (totalGastosPorSucursal[sucursal] || 0) + total;

        // Acumular el total por descripción dentro de la sucursal
        gastoPrincipalPorSucursal[sucursal] = gastoPrincipalPorSucursal[sucursal] || {};
        gastoPrincipalPorSucursal[sucursal][descripcion] = (gastoPrincipalPorSucursal[sucursal][descripcion] || 0) + total;
    });

    // Calcular el total de todos los gastos para los porcentajes
    const totalGastosGeneral = Object.values(totalGastosPorSucursal).reduce((acc, val) => acc + val, 0);

    // Convertir el objeto a un array para poder ordenarlo
    const rankingArray = Object.entries(totalGastosPorSucursal)
        .map(([sucursal, total]) => ({ sucursal, total }))
        .sort((a, b) => b.total - a.total);

    // Crear y agregar elementos al DOM
    const fragment = document.createDocumentFragment();
    rankingArray.forEach((item, index) => {
        const { sucursal, total } = item;

        // Encontrar la descripción con el mayor gasto en la sucursal
        const gastosPorDescripcion = gastoPrincipalPorSucursal[sucursal];
        const gastoPrincipal = Object.entries(gastosPorDescripcion).reduce((a, b) => a[1] > b[1] ? a : b)[0];

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

        mostrarGastosPorSucursal(data, 'todas');

        // Mostrar el ranking de sucursales
        mostrarRankingSucursales(data);
    } catch (error) {
        console.error("Error al cargar los gastos:", error);
        // Opcional: Mostrar mensaje de error en la UI
    }
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
    const resumenPorDescripcion = gastosFiltrados.reduce((acc, { Descr: descr, Total: totalStr }) => {
        const total = parseCurrency(totalStr);
        acc[descr] = (acc[descr] || 0) + total;
        return acc;
    }, {});

    // Convertir resumenPorDescripcion en un array de [descripcion, total] y ordenarlo
    const resumenArray = Object.entries(resumenPorDescripcion).sort((a, b) => b[1] - a[1]);

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
    resumenArray.forEach(([descr, total]) => {
        const porcentajeGasto = ((total / totalGastosSucursal) * 100).toFixed(2);
        const li = crearResumenItem(descr, total, porcentajeGasto, iconMap);
        resumenFragment.appendChild(li);
    });
    resumenList.appendChild(resumenFragment);

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

// Función para parsear valores monetarios
function parseCurrency(value) {
    return parseFloat(value.replace('$', '').replace(/\./g, '').replace(',', '.')) || 0;
}

// Función para crear opciones del select
function crearOpcionesSelect(sucursales, selectElement) {
    const fragment = document.createDocumentFragment();
    sucursales.forEach(sucursal => {
        const option = document.createElement('option');
        option.value = sucursal;
        option.textContent = sucursal;
        fragment.appendChild(option);
    });
    selectElement.appendChild(fragment);
}

// Función para crear un elemento de lista de resumen
function crearResumenItem(descr, total, porcentaje, iconMap) {
    const li = document.createElement('li');
    li.className = 'gasto-resumen-item';
    
    const icon = iconMap[descr] ? `<i class="fas ${iconMap[descr]}"></i>` : '';
    
    li.innerHTML = `
        <span class="gasto-descripcion">${icon} ${descr}</span>
        <span class="gasto-total">$ ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span class="gasto-porcentaje">${porcentaje}%</span>
    `;
    return li;
}

// Función para mostrar el ranking de sucursales
function mostrarRankingSucursales(data) {
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
    
    data.forEach(gasto => {
        const sucursal = gasto.SUCGCIA;
        const total = parseCurrency(gasto.Total);
        const descripcion = gasto.Descr;
        
        // Acumular el total por sucursal
        if (!totalGastosPorSucursal[sucursal]) {
            totalGastosPorSucursal[sucursal] = 0;
        }
        totalGastosPorSucursal[sucursal] += total;
        
        // Acumular el total por descripción dentro de la sucursal
        if (!gastoPrincipalPorSucursal[sucursal]) {
            gastoPrincipalPorSucursal[sucursal] = {};
        }
        if (!gastoPrincipalPorSucursal[sucursal][descripcion]) {
            gastoPrincipalPorSucursal[sucursal][descripcion] = 0;
        }
        gastoPrincipalPorSucursal[sucursal][descripcion] += total;
    });
    
    // Calcular el total de todos los gastos para los porcentajes
    const totalGastosGeneral = Object.values(totalGastosPorSucursal).reduce((acc, val) => acc + val, 0);
    
    // Convertir el objeto a un array para poder ordenarlo
    const rankingArray = Object.entries(totalGastosPorSucursal).map(([sucursal, total]) => ({
        sucursal,
        total
    }));
    
    // Ordenar el array de mayor a menor gasto
    rankingArray.sort((a, b) => b.total - a.total);
    
    // Crear y agregar elementos al DOM
    const fragment = document.createDocumentFragment();
    rankingArray.forEach((item, index) => {
        const sucursal = item.sucursal;
        const total = item.total;
        
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
}

async function cargarGastos() {
    try {
        const response = await fetch('https://recaudaciones.s3.us-east-2.amazonaws.com/DATOS-AGOSTO-24/GASTOSUC.json');
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
}

function mostrarGastosPorSucursal(data, sucursalSeleccionada) {
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

    let gastosFiltrados = data;
    if (sucursalSeleccionada !== 'todas') {
        gastosFiltrados = data.filter(gasto => gasto.SUCGCIA === sucursalSeleccionada);
    }

    nombreSucursal.textContent = sucursalSeleccionada === 'todas' ? 'Todas' : sucursalSeleccionada;

    const totalGastos = data.reduce((total, gasto) => {
        return total + parseCurrency(gasto.Total);
    }, 0);

    const totalGastosSucursal = gastosFiltrados.reduce((total, gasto) => {
        return total + parseCurrency(gasto.Total);
    }, 0);

    if (totalGastos > 0) {
        const porcentaje = ((totalGastosSucursal / totalGastos) * 100).toFixed(2);
        porcentajeGastosDiv.textContent = `El gasto de esta sucursal representa el ${porcentaje}% del total.`;
    } else {
        porcentajeGastosDiv.textContent = "No hay gastos registrados.";
    }

    const totalGastosSucursalFormatted = `$ ${totalGastosSucursal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    totalSucursalDiv.textContent = `Total gastos de la sucursal: ${totalGastosSucursalFormatted}`;

    // Calcular resumenPorDescripcion
const resumenPorDescripcion = gastosFiltrados.reduce((acc, gasto) => {
    const descr = gasto.Descr;
    const total = parseCurrency(gasto.Total);
    acc[descr] = (acc[descr] || 0) + total; // Sumar el total al acumulado por descripción
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
for (const [descr, total] of resumenArray) {
    const porcentajeGasto = ((total / totalGastosSucursal) * 100).toFixed(2);

    const li = crearResumenItem(descr, total, porcentajeGasto, iconMap);
    resumenFragment.appendChild(li);
}
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

    let contador = 0;
    const limite = 30;

    const mostrarGastosLimitados = () => {
        const gastosParaMostrar = gastosFiltrados.slice(contador, contador + limite);
        gastosParaMostrar.forEach(gasto => {
            const gastoDiv = document.createElement('div');
            gastoDiv.className = 'gasto-item';
            gastoDiv.innerHTML = `
                <span>${gasto.SUCGCIA}</span>
                <span>${gasto.FechaFactura}</span>
                <span>${gasto.Factura}</span>
                <span>${gasto.Descr}</span>
                <span>${gasto.Total}</span>
            `;
            gastosDiv.appendChild(gastoDiv);
        });
        contador += gastosParaMostrar.length;
        if (contador >= gastosFiltrados.length) {
            cargarMasBtn.style.display = 'none';
        }
    };

    mostrarGastosLimitados();
    cargarMasBtn.onclick = mostrarGastosLimitados;
}

// Función para mostrar el tab correspondiente
function showTab(tabId) {
    // Primero ocultamos todos los contenidos
    let tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.classList.remove('active');  // Eliminar clase 'active' de todos los contenidos
        tab.style.display = 'none';      // Ocultar todos los contenidos
    });

    // Luego mostramos el tab correspondiente
    let tabToShow = document.getElementById(tabId);
    tabToShow.classList.add('active');  // Mostrar solo el tab seleccionado
    tabToShow.style.display = 'block'; // Aseguramos que el contenido se muestre

    // Aseguramos que el botón correspondiente esté activado
    let buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => {
        button.classList.remove('active');  // Eliminar clase 'active' de todos los botones
    });

    // Activar el botón de la pestaña correspondiente
    let activeButton = document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`);
    activeButton.classList.add('active');  // Activar el botón del tab seleccionado
}

// Mostrar el tab de Ranking de Sucursales de forma predeterminada
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar el tab de Ranking de Sucursales como predeterminado
    showTab('columna-gastos');
});



// Inicializar el proceso cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarGastos);

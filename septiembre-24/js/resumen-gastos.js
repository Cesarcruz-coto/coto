async function cargarGastos() {
    try {
        const response = await fetch('https://cesarcruz-coto.github.io/coto/DATOS-SEPTIEMBRE-24/GASTOSUC.json');
        const data = await response.json();
        
        mostrarGastosPorSucursal(data, 'todas');
    } catch (error) {
        console.error("Error al cargar los gastos:", error);
    }
}

function formatCurrency(value) {
    return `$ ${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function mostrarGastosPorSucursal(data, sucursalSeleccionada) {
    const totalPendientesErrores = document.getElementById('total-pendientes-gastos');
    const totalImporteNoCompensadosErrores = document.getElementById('total-importe-no-compensados-gastos');

    // Limpiar los contenidos anteriores
    totalPendientesErrores.textContent = ''; // Limpiar el total de pendientes
    totalImporteNoCompensadosErrores.innerHTML = ''; // Limpiar el importe

    let gastosFiltrados = data;
    if (sucursalSeleccionada !== 'todas') {
        gastosFiltrados = data.filter(gasto => gasto.SUCGCIA === sucursalSeleccionada);
    }

    // Calcular la cantidad de gastos
    const cantidadGastos = gastosFiltrados.length;
    totalPendientesErrores.textContent = cantidadGastos; // Mostrar cantidad de gastos

    // Calcular el importe total
    const totalGastosSucursal = gastosFiltrados.reduce((total, gasto) => {
        if (gasto.Total) {
            const valor = gasto.Total.replace('$', '').replace('.', '').replace(',', '.');
            const numero = parseFloat(valor);
            return total + (isNaN(numero) ? 0 : numero);
        }
        return total;
    }, 0);

    // Lógica para determinar el icono y color
    const isImportePositive = totalGastosSucursal >= 0; // Si es positivo, el color es rojo con flecha hacia abajo
    const icon = isImportePositive ? 
        '<i class="fa-solid fa-arrow-trend-down" style="color: #D50000;"></i>' :  // Rojo con flecha hacia abajo
        '<i class="fa-solid fa-arrow-trend-up" style="color: #2E7D32;"></i>';     // Verde con flecha hacia arriba
    
    const formattedImporteTotal = formatCurrency(totalGastosSucursal);
    const textColor = isImportePositive ? 'color: #D50000;' : 'color: #2E7D32;'; // Rojo si positivo, verde si negativo

    // Mostrar importe total con icono y color de texto
    totalImporteNoCompensadosErrores.innerHTML = `<span style="${textColor}">${icon} ${formattedImporteTotal}</span>`;
}

// Inicializar el proceso
cargarGastos();

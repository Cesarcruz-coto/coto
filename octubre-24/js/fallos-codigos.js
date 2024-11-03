import { apis } from './api.js';
const codigos = [3, 2, 1, 'digital']; // Agregamos el nuevo código "digital"

// Función principal para obtener y procesar los fallos
async function obtenerFallosDeCodigo() {
    try {
        const respuesta = await fetch(apis.apiFallosActual);
        const datos = await respuesta.json();

        // Inicializar un objeto para almacenar los resultados
        const resumen = {
            3: { total: 0, faltantes: 0, sobrantes: 0, fallos: [] },
            2: { total: 0, faltantes: 0, sobrantes: 0, fallos: [] },
            1: { total: 0, faltantes: 0, sobrantes: 0, fallos: [] },
            digital: { total: 0, faltantes: 0, sobrantes: 0, fallos: [] } // Nuevo código digital
        };

        // Procesar cada movimiento
        datos.forEach(mov => {
            const importe = parseFloat(mov.Importe.replace(/[^0-9,-]+/g, '').replace(',', '.'));
            const codigoData = obtenerCodigo(importe, mov.Motivo);

            if (codigos.includes(codigoData.codigo)) {
                resumen[codigoData.codigo].total += 1;
                resumen[codigoData.codigo].fallos.push(mov); // Guardar cada fallo en el resumen
                if (mov.TAjuste === 'Fallo De Caja - Faltante') {
                    resumen[codigoData.codigo].faltantes += importe;
                } else if (mov.TAjuste === 'Fallo De Cajas - Sobrante') {
                    resumen[codigoData.codigo].sobrantes += importe;
                }
            }
        });

        // Mostrar los resultados en los divs
        mostrarResumen(resumen);

    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

// Mostrar el resumen en los divs
const mostrarResumen = (resumen) => {
    codigos.forEach(codigo => {
        const div = document.getElementById(`resumen-codigo-${codigo}`);
        if (div) {
            const iconoFaltante = '<i class="fa-solid fa-arrow-trend-down" style="color: #D50000;"></i>';
            const iconoSobrante = '<i class="fa-solid fa-arrow-trend-up" style="color: #2E7D32;"></i>';

            const faltantesHTML = `<span style="color: #D50000;">${iconoFaltante} $${resumen[codigo].faltantes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;
            const sobrantesHTML = `<span style="color: #2E7D32;">${iconoSobrante} $${resumen[codigo].sobrantes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;

            const enlaceDetalle = `<a href="#" onclick="abrirPanelDetalle('${codigo}')">Ver detalles</a>`;

            div.innerHTML = `
                <h3>Código ${codigo}</h3>
                <p>Total de fallos: ${resumen[codigo].total}</p>
                <p>Faltantes: ${faltantesHTML}</p>
                <p>Sobrantes: ${sobrantesHTML}</p>
                <p>${enlaceDetalle}</p>
            `;

            // Guardar los fallos detallados para usarlos en el panel
            div.dataset.fallos = JSON.stringify(resumen[codigo].fallos);
        }
    });
}

// Función para abrir el panel de detalles con el resumen
window.abrirPanelDetalle = (codigo) => {
    const div = document.getElementById(`resumen-codigo-${codigo}`);
    const fallos = JSON.parse(div.dataset.fallos || '[]');

    const panel = document.getElementById('detalle-fallo-panel');
    const contenido = document.getElementById('detalle-fallo-contenido');

    // Crear el contenido del detalle
    contenido.innerHTML = `
        <h3>Detalle de los Fallos - Código ${codigo}</h3>
        <div class="header-ii">
        <div>Suc</div>
        <div>Empleado</div>
            <div>Fecha</div>
            <div>Fallo</div>
            <div>Importe</div>
            <div>Obs.</div>
            
        </div>
        <div>
            ${fallos.map(fallo => {
                const importe = parseFloat(fallo.Importe.replace(/[^0-9,-]+/g, '').replace(',', '.'));
                const codigoData = obtenerCodigo(importe, fallo.Motivo); // Asegúrate de que 'motivo' se pase aquí si es necesario

                const observacionCorta = fallo.Observacion && fallo.Observacion.length > 11
                    ? `${fallo.Observacion.slice(0, 11)}... <br><span class="ver-mas">ver más</span>`
                    : fallo.Observacion || 'Sin observación';

                return `
                    <div class="row fade-in">
                    <div>${fallo.Suc}</div>
                    <div>${fallo.Empleado}</div>
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
        <button id="cerrar-detalle" onclick="cerrarPanelDetalle()">&times; Cerrar</button>
    `;

    // Agregar eventos de "ver más"
    const verMasLinks = contenido.querySelectorAll('.ver-mas');
    verMasLinks.forEach(link => {
        link.addEventListener('click', function() {
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
    if (motivo && motivo.toLowerCase().includes('pedido')) return { codigo: 'digital', icono: 'fa-solid fa-truck-fast', color: '#4A90E2' };
    if (Math.abs(importe) >= 15000) return { codigo: 3, icono: 'fa-exclamation-triangle', color: 'red' };
    if (Math.abs(importe) >= 7500) return { codigo: 2, icono: 'fa-exclamation-circle', color: '#FFB900' };
    if (Math.abs(importe) >= 3000) return { codigo: 1, icono: 'fa-info-circle', color: '#0061fe' };
    return { codigo: 0, icono: '', color: '' };
};

// Ejecutar la función después de que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    obtenerFallosDeCodigo(); // Llamar a la función al cargar el documento
});

async function obtenerAjustesPorIncidencia() {
    try {
        const respuesta = await fetch('https://sheetlabs.com/COTO/COTOERROROP');
        const datos = await respuesta.json();

        // Filtramos los ajustes por incidencia Ms
        const incidenciasMs = datos.filter(mov => mov.TAjuste === "Ajuste Por Incidencia Ms");

        const incidenciasDiv = document.getElementById('incidencias-ms');
        let sumaImportes = 0;

        // Iteramos directamente sobre las incidencias
        incidenciasMs.forEach(mov => {
            const importe = parseFloat(mov.Importe.replace(/[^0-9,-]+/g, '').replace(',', '.'));
            sumaImportes += importe;

            // Creación de la fila para cada incidencia
            const row = document.createElement('div');
            row.className = 'row-i fade-in'; // Animación

            // Determinación de icono y colores según el importe
            let iconoImporte = '';
            let colorIcono = '';
            let colorTexto = '';
            if (importe < 0) {
                iconoImporte = 'fa-arrow-trend-up';
                colorIcono = '#2E7D32'; // Verde para ícono
                colorTexto = '#2E7D32'; // Verde para texto negativo
            } else {
                iconoImporte = 'fa-arrow-trend-down';
                colorIcono = '#D50000'; // Rojo para ícono
                colorTexto = '#D50000'; // Rojo para texto positivo
            }

            // Inserción del contenido HTML dinámico
            row.innerHTML = `
                <div><i class="fa-solid fa-cart-shopping" style="color:orange"></i> ${mov.Suc}</div>
                <div> <p style="color:${colorTexto}"><i class="fa-solid ${iconoImporte}" style="color:${colorIcono}"></i> $${importe.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
                <div>${mov.Fecha}</div>
            `;

            incidenciasDiv.appendChild(row);
        });

        console.log(`Total importe de todas las incidencias: $${sumaImportes.toFixed(2)}`);

        // Ahora manejamos el efecto de desplazamiento con JavaScript
        let isPaused = false; // Variable para saber si está en pausa
        let offset = 0; // Desplazamiento inicial
        const speed = 3; // Velocidad de desplazamiento (ajústala según sea necesario)

        function scroll() {
            if (!isPaused) {
                // Actualizamos el desplazamiento usando `transform`
                offset -= speed;
                incidenciasDiv.style.transform = `translateX(${offset}px)`;
                
                // Si el contenedor se desplazó completamente, lo reiniciamos
                if (Math.abs(offset) >= incidenciasDiv.scrollWidth) {
                    offset = incidenciasDiv.clientWidth; // Reinicia el scroll
                }
            }
            requestAnimationFrame(scroll); // Volvemos a llamar a la función en el próximo frame
        }

        // Pausar y reanudar el scroll con los eventos de mouse
        incidenciasDiv.addEventListener('mouseenter', () => {
            isPaused = true; // Pausar la animación al pasar el mouse
        });

        incidenciasDiv.addEventListener('mouseleave', () => {
            isPaused = false; // Reanudar la animación al sacar el mouse
        });

        // Iniciar el scroll
        requestAnimationFrame(scroll);

    } catch (error) {
        console.error('Error al obtener los datos de incidencias:', error);
    }
}

// Llamamos a la función para obtener y mostrar los datos
obtenerAjustesPorIncidencia();

async function obtenerTopFallosDeCaja() {
    try {
        const respuesta = await fetch('https://recaudaciones.s3.us-east-2.amazonaws.com/DATOS-SEPTIEMBRE-24/FALLOSOBRANTEFALTANTE.json');
        const datos = await respuesta.json();

        //const fallos = datos.filter(mov => mov.TAjuste.includes("Fallo De Caja"));

        const fallos = datos.filter(mov => 
            mov.TAjuste.includes("Fallo De Caja") && 
            !(mov.Observacion && mov.Observacion.toLowerCase().includes("deja vuelto"))
        );
        //const fechas = fallos.map(mov => new Date(mov.Fecha.split('/').reverse().join('-')));
        //const [fechaMasAntigua, fechaMasActual] = [new Date(Math.min(...fechas)), new Date(Math.max(...fechas))];

        //document.getElementById('fechas').textContent = `${fechaMasAntigua.toLocaleDateString('es-ES')} - ${fechaMasActual.toLocaleDateString('es-ES')}`;

        // Crear lista de sucursales
        const sucursales = [...new Set(fallos.map(mov => parseInt(mov.Suc)))];

        // Ordenar sucursales de manera ascendente
        sucursales.sort((a, b) => a - b); // Para orden ascendente

        // Si necesitas orden descendente, usa la siguiente línea en su lugar:
        // sucursales.sort((a, b) => b - a); // Para orden descendente

        const selectSucursal = document.getElementById('sucursal-select');
        sucursales.forEach(suc => {
            const option = document.createElement('option');
            option.value = suc;
            option.textContent = suc;
            selectSucursal.appendChild(option);
        });


        const fallosPorSucursal = fallos.reduce((acc, mov) => {
            const importe = parseFloat(mov.Importe.replace(/[^0-9,-]+/g, '').replace(',', '.'));
            acc[mov.Suc] = acc[mov.Suc] || { totalFallos: 0, totalImporte: 0, empleados: {} };
            acc[mov.Suc].totalFallos++;
            acc[mov.Suc].totalImporte += importe;
            acc[mov.Suc].empleados[mov.Empleado] = acc[mov.Suc].empleados[mov.Empleado] || { fallosEmpleado: 0, totalImporteEmpleado: 0 };
            acc[mov.Suc].empleados[mov.Empleado].fallosEmpleado++;
            acc[mov.Suc].empleados[mov.Empleado].totalImporteEmpleado += importe;
            return acc;
        }, {});

        const sucursalesOrdenadas = Object.entries(fallosPorSucursal).flatMap(([sucursal, data]) =>
            Object.entries(data.empleados).map(([empleado, empData]) => ({
                sucursal, empleado, totalFallos: data.totalFallos, totalImporte: data.totalImporte,
                fallosEmpleado: empData.fallosEmpleado, totalImporteEmpleado: empData.totalImporteEmpleado
            }))
        );

        // Identificar la sucursal con más fallos
        const sucursalMasFallos = Object.entries(fallosPorSucursal).reduce((max, [sucursal, data]) =>
            data.totalFallos > max.totalFallos ? { sucursal, ...data } : max, { sucursal: null, totalFallos: 0 }).sucursal;

        let index = 0, cantidadAMostrar = 500;
        const topFallosDiv = document.getElementById('top-fallos');
        const botonMostrarMas = document.getElementById('mostrar-mas-i');

        const obtenerCodigo = (importe) => Math.abs(importe) >= 15000 ? { codigo: 3, icono: 'fa-exclamation-triangle', color: 'red' }
            : Math.abs(importe) >= 7500 ? { codigo: 2, icono: 'fa-exclamation-circle', color: '#FFB900' }
                : Math.abs(importe) >= 3000 ? { codigo: 1, icono: 'fa-info-circle', color: '#0061fe' }
                    : { codigo: 0, icono: '', color: '' };

        const mostrarFallos = (filtroSucursal) => {
            topFallosDiv.innerHTML = ''; // Limpiar los fallos actuales
            index = 0; // Reiniciar el índice
            const fallosFiltrados = filtroSucursal === 'todas' ? sucursalesOrdenadas : sucursalesOrdenadas.filter(item => item.sucursal === filtroSucursal);

            const mostrarMasFallos = () => {
                const final = Math.min(index + cantidadAMostrar, fallosFiltrados.length);
                for (; index < final; index++) {
                    const { sucursal, empleado, totalFallos, totalImporte, fallosEmpleado, totalImporteEmpleado } = fallosFiltrados[index];
                    const textoEmpleado = fallosEmpleado > 5 ? 'R. Capacitación' : fallosEmpleado >= 3 ? 'R. Observación' : '';
                    const textoSucursal = totalFallos > 60 ? 'R. Auditoría' : totalFallos >= 40 ? 'R. Observación' : '';
                    const iconoImporte = totalImporte >= 0 ? 'fa-arrow-trend-down' : 'fa-arrow-trend-up';
                    const colorIcono = totalImporte >= 0 ? 'red' : '#2E7D32';

                    const row = document.createElement('div');
                    row.className = 'row fade-in';
                    row.innerHTML = `
                        <div>${index + 1}</div>
                        <div>${sucursal} ${textoSucursal && `<img src="../img/18-34-10-554_512.webp" alt="Alerta"> <p>${textoSucursal}</p>`}</div>
                        <div>${totalFallos} <p><i class="fa-solid ${iconoImporte}" style="color:${colorIcono}"></i> $${totalImporte.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
                        <div>${empleado} ${textoEmpleado && `<img src="../img/18-34-10-554_512.webp" alt="Alerta"> <p>${textoEmpleado}</p>`}</div>
                        <div>${fallosEmpleado} <p><i class="fa-solid ${iconoImporte}" style="color:${colorIcono}"></i> $${totalImporteEmpleado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
                        <div><a href="#" class="ver-obs" data-sucursal="${sucursal}" data-empleado="${empleado}">Ver Obs.</a></div>
                    `;
                    topFallosDiv.appendChild(row);
                }
                if (index >= fallosFiltrados.length) botonMostrarMas.style.display = 'none';
            };

            mostrarMasFallos();
            botonMostrarMas.addEventListener('click', mostrarMasFallos);
        };

        const mostrarResumenSucursal = (sucursalSeleccionada) => {
            const resumenSucursalDiv = document.getElementById('resumen-sucursal');

            if (!sucursalSeleccionada || !fallosPorSucursal[sucursalSeleccionada]) {
                resumenSucursalDiv.innerHTML = ''; // Limpiar si no hay sucursal seleccionada o datos
                return;
            }

            const resumenData = fallosPorSucursal[sucursalSeleccionada];

            // Obtener códigos de fallos y legajos
            const codigos = {
                codigo3: { cantidad: 0, legajos: [], importes: [] },
                codigo2: { cantidad: 0, legajos: [], importes: [] },
                codigo1: { cantidad: 0, legajos: [], importes: [] }
            };

            for (const mov of datos.filter(mov => mov.Suc === sucursalSeleccionada)) {
                const importe = parseFloat(mov.Importe.replace(/[^0-9,-]+/g, '').replace(',', '.'));
                const codigoData = obtenerCodigo(importe);
                const codigoKey = `codigo${codigoData.codigo}`;

                if (codigoKey in codigos) {
                    codigos[codigoKey].cantidad++;
                    codigos[codigoKey].legajos.push(mov.Empleado);
                    codigos[codigoKey].importes.push(importe);
                }
            }

            // Obtener el top 3 de empleados con más fallos
            const top3Empleados = Object.entries(resumenData.empleados)
                .sort(([, a], [, b]) => b.fallosEmpleado - a.fallosEmpleado)
                .slice(0, 3);

            // Mostrar resumen con botón de observaciones
            resumenSucursalDiv.innerHTML = `
                <div class="card-container">
                    <!-- Card 1: Resumen Sucursal -->
                    <div class="card">
                        <h2><i class="fas fa-store"></i> Sucursal ${sucursalSeleccionada}</h2>
                        <p>Cantidad de Fallos: <b>${resumenData.totalFallos}</b></p>
                        <p>Importe Total: <b>$${resumenData.totalImporte.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></p>
                    </div>
        
                    <!-- Card 2: Top empleados con más Fallos -->
                    <div class="card">
                        <h2><i class="fas fa-user"></i> Top empleados con más Fallos</h2>
                        
                            ${top3Empleados.map(([empleado, empData]) => `
                               <div class="codigo-detalle">
                                    <div><i class="fa-solid fa-circle-user"></i> ${empleado}</div>
                                    <div>${empData.fallosEmpleado} fallos - $${empData.totalImporteEmpleado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    <div><a href="#" class="ver-obs" data-sucursal="${sucursalSeleccionada}" data-empleado="${empleado}">Ver Obs.</a></div>
                                 </div>
                            `).join('')}
                       
                    </div>
        
                    <!-- Card 3: Total de errores por código -->
                    <div class="card">
                        <h2><i class="fas fa-exclamation-triangle"></i> Total de errores por código</h2>
                        <div class="codigo-grid">
                            ${Object.entries(codigos).map(([codigoKey, { cantidad, legajos, importes }]) => `
                                <div class="codigo-column">
                                    <div class="codigo-header">${codigoKey} - ${cantidad} errores</div>
                                    ${legajos.map((legajo, index) => `
                                        <div class="codigo-detalle">
                                            <div><i class="fa-solid fa-circle-user"></i> ${legajo}</div>
                                            <div>$${importes[index].toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                            <div><a href="#" class="ver-obs" data-sucursal="${sucursalSeleccionada}" data-empleado="${legajo}">Ver Obs.</a></div>
                                        </div>
                                    `).join('')}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

            // Agregar evento de "Ver Observaciones" en empleados del top y en códigos
            const verObsLinks = resumenSucursalDiv.querySelectorAll('.ver-obs');
            verObsLinks.forEach(link => {
                link.addEventListener('click', function (event) {
                    event.preventDefault();
                    const sucursal = event.target.getAttribute('data-sucursal');
                    const empleado = event.target.getAttribute('data-empleado');

                    const observaciones = datos.filter(mov => mov.Suc === sucursal && mov.Empleado === empleado);

                    const observacionDiv = document.getElementById('observacion');
                    observacionDiv.innerHTML = `
                        <button id="cerrar-observacion" class="cerrar-observacion">&times;</button>
                        <h2>LEGAJO: ${empleado}</h2>
                        <h3>SUC. ${sucursal}</h3>
                        <div class="header-ii">
                            <div>Fecha</div>
                            <div>Fallo</div>
                            <div>Importe</div>
                            <div>Observación</div>
                            <div>Código</div>
                        </div>
                        <div>
                            ${observaciones.map(obs => {
                        const observacionCorta = obs.Observacion && obs.Observacion.length > 11
                            ? `${obs.Observacion.slice(0, 11)}... <br><span class="ver-mas">ver más</span>`
                            : obs.Observacion || 'Sin observación';

                        const importe = parseFloat(obs.Importe.replace(/[^0-9,-]+/g, '').replace(',', '.'));
                        const codigoData = obtenerCodigo(importe);

                        return `
                                    <div class="row fade-in">
                                        <div>${obs.Fecha}</div>
                                        <div>${obs.TAjuste}</div>
                                        <div>$${importe.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br><p><i class="fa-solid ${codigoData.icono}" style="color:${codigoData.color}"></i> Código ${codigoData.codigo}</p></div>
                                        <div><span class="observacion-corta">${observacionCorta}</span><span class="observacion-completa" style="display:none;">${obs.Observacion}</span></div>
                                    </div>
                                `;
                    }).join('')}
                        </div>
                    `;

                    observacionDiv.classList.add('mostrar');

                    const verMasLinks = observacionDiv.querySelectorAll('.ver-mas');
                    verMasLinks.forEach(link => {
                        link.addEventListener('click', function () {
                            const observacionCompleta = this.parentElement.nextElementSibling;
                            this.parentElement.style.display = 'none';
                            observacionCompleta.style.display = 'inline';
                        });
                    });
                });
            });
        };





        mostrarFallos(sucursalMasFallos); // Mostrar la sucursal con más fallos al cargar
        mostrarResumenSucursal(sucursalMasFallos); // Mostrar resumen de la sucursal con más fallos al cargar

        // Evento para cambiar la sucursal
        selectSucursal.addEventListener('change', (event) => {
            const sucursalSeleccionada = event.target.value;
            mostrarFallos(sucursalSeleccionada);
            mostrarResumenSucursal(sucursalSeleccionada); // Mostrar resumen de la sucursal seleccionada
        });

        // Evento para ver observaciones
        topFallosDiv.addEventListener('click', function (event) {
            if (event.target.classList.contains('ver-obs')) {
                event.preventDefault();

                const sucursal = event.target.getAttribute('data-sucursal');
                const empleado = event.target.getAttribute('data-empleado');

                const observaciones = datos.filter(mov => mov.Suc === sucursal && mov.Empleado === empleado);

                const observacionDiv = document.getElementById('observacion');
                observacionDiv.innerHTML = `
                    <button id="cerrar-observacion" class="cerrar-observacion">&times;</button>
                    <h2>LEGAJO: ${empleado}</h2>
                    <h3>SUC. ${sucursal}</h3>
                    <div class="header-ii">
                        <div>Fecha</div>
                        <div>Fallo</div>
                        <div>Importe</div>
                        <div>Observación</div>
                        <div>Código</div>
                    </div>
                    <div>
                        ${observaciones.map(obs => {
                    const observacionCorta = obs.Observacion && obs.Observacion.length > 11
                        ? `${obs.Observacion.slice(0, 11)}... <br><span class="ver-mas">ver más</span>`
                        : obs.Observacion || 'Sin observación';

                    const importe = parseFloat(obs.Importe.replace(/[^0-9,-]+/g, '').replace(',', '.'));
                    const codigoData = obtenerCodigo(importe);

                    return `
                                <div class="row fade-in">
                                    <div>${obs.Fecha}</div>
                                    <div>${obs.TAjuste}</div>
                                    <div>$${importe.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br><p><i class="fa-solid ${codigoData.icono}" style="color:${codigoData.color}"></i> Código ${codigoData.codigo}</p></div>
                                    <div><span class="observacion-corta">${observacionCorta}</span><span class="observacion-completa" style="display:none;">${obs.Observacion}</span></div>
                                </div>
                            `;
                }).join('')}
                    </div>
                `;

                // Mostrar el div deslizante
                observacionDiv.classList.add('mostrar');

                // Agregar eventos de "ver más"
                const verMasLinks = observacionDiv.querySelectorAll('.ver-mas');
                verMasLinks.forEach(link => {
                    link.addEventListener('click', function () {
                        const observacionCompleta = this.parentElement.nextElementSibling;
                        this.parentElement.style.display = 'none';
                        observacionCompleta.style.display = 'inline';
                    });
                });
            }
        });

        document.getElementById('observacion').addEventListener('click', function (event) {
            if (event.target.id === 'cerrar-observacion') {
                document.getElementById('observacion').classList.remove('mostrar');
            }
        });

        document.getElementById('enlace-exportar-fallos').addEventListener('click', (event) => {
            event.preventDefault(); // Evita el comportamiento por defecto del enlace
            exportarFallosAExcel();
        });

        function exportarFallosAExcel() {
            const ws = XLSX.utils.json_to_sheet(sucursalesOrdenadas);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Top Fallos');
            XLSX.writeFile(wb, 'TopFallos.xlsx');
        }



    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

obtenerTopFallosDeCaja();

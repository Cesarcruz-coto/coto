async function obtenerErroresOperativos() {
    try {
        const respuesta = await fetch('https://recaudaciones.s3.us-east-2.amazonaws.com/DATOS-SEPTIEMBRE-24/ERROROPERATIVO.json');
        const datos = await respuesta.json();

        const erroresSinResolver = datos.filter(mov => mov.TAjuste === "Error Operativo Sin Resolver");

        //const fechas = erroresSinResolver.map(mov => {
            //const [day, month, year] = mov.Fecha.split('/');
            //return new Date(`${year}-${month}-${day}`);
        //});
        //const fechaMasAntigua = new Date(Math.min(...fechas));
        //const fechaMasActual = new Date(Math.max(...fechas));

        //document.getElementById('fechas').textContent = `${fechaMasAntigua.toLocaleDateString('es-ES')} - ${fechaMasActual.toLocaleDateString('es-ES')}`;

        const erroresPorSucursal = erroresSinResolver.reduce((acc, mov) => {
            const importe = parseFloat(mov.Importe.replace(/[^0-9,-]+/g, '').replace(',', '.'));

            if (!acc[mov.Suc]) {
                acc[mov.Suc] = {
                    totalErrores: 0,
                    totalImporte: 0,
                    empleados: {}
                };
            }
            acc[mov.Suc].totalErrores += 1;
            acc[mov.Suc].totalImporte += importe;

            if (!acc[mov.Suc].empleados[mov.Empleado]) {
                acc[mov.Suc].empleados[mov.Empleado] = {
                    erroresEmpleado: 0,
                    totalImporteEmpleado: 0
                };
            }
            acc[mov.Suc].empleados[mov.Empleado].erroresEmpleado += 1;
            acc[mov.Suc].empleados[mov.Empleado].totalImporteEmpleado += importe;

            return acc;
        }, {});

        const sucursalesOrdenadas = Object.entries(erroresPorSucursal)
            .map(([sucursal, data]) => {
                const empleadoConMasErrores = Object.entries(data.empleados)
                    .sort((a, b) => b[1].erroresEmpleado - a[1].erroresEmpleado)[0];

                return {
                    sucursal,
                    totalErrores: data.totalErrores,
                    totalImporte: data.totalImporte,
                    empleado: empleadoConMasErrores[0],
                    erroresEmpleado: empleadoConMasErrores[1].erroresEmpleado,
                    totalImporteEmpleado: empleadoConMasErrores[1].totalImporteEmpleado
                };
            })
            .sort((a, b) => b.totalErrores - a.totalErrores);

        let index = 0;
        const cantidadAMostrar = 10;
        const topErroresDiv = document.getElementById('top-errores');
        const botonMostrarMas = document.getElementById('mostrar-mas');

        function mostrarMasErrores() {
            const final = Math.min(index + cantidadAMostrar, sucursalesOrdenadas.length);

            for (; index < final; index++) {
                const item = sucursalesOrdenadas[index];
                const row = document.createElement('div');
                row.className = 'row fade-in';

                let textoEmpleado = '';
                if (item.erroresEmpleado > 5) {
                    textoEmpleado = 'R. Capacitación';
                } else if (item.erroresEmpleado >= 3) {
                    textoEmpleado = 'R. Observación';
                }

                let textoSucursal = '';
                if (item.totalErrores > 60) {
                    textoSucursal = 'R. Auditoría';
                } else if (item.totalErrores >= 40) {
                    textoSucursal = 'R. Observación';
                }

                let iconoImporte = '';
                let colorIcono = '';
                if (item.totalImporte >= 0) {
                    iconoImporte = 'fa-arrow-trend-down';
                    colorIcono = 'red';
                } else {
                    iconoImporte = 'fa-arrow-trend-up';
                    colorIcono = '#2E7D32';
                }

                let iconoImporteEmpleado = '';
                let colorIconoEmpleado = '';
                if (item.totalImporteEmpleado < 0) {
                    iconoImporteEmpleado = 'fa-arrow-trend-up';
                    colorIconoEmpleado = '#2E7D32';
                } else {
                    iconoImporteEmpleado = 'fa-arrow-trend-down';
                    colorIconoEmpleado = 'red';
                }

                row.innerHTML = `
                    <div>${index + 1}</div>
                    <div>${item.sucursal} ${textoSucursal ? `<img src="../img/18-34-10-554_512.webp" alt="Animación de alerta"> <p>${textoSucursal}</p>` : ''}</div>
                    <div>${item.totalErrores} <p><i class="fa-solid ${iconoImporte}" style="color:${colorIcono}"></i> $${item.totalImporte.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
                    <div>${item.empleado} ${textoEmpleado ? `<img src="../img/18-34-10-554_512.webp" alt="Animación de alerta"> <p>${textoEmpleado}</p>` : ''}</div>
                    <div>${item.erroresEmpleado} <p><i class="fa-solid ${iconoImporteEmpleado}" style="color:${colorIconoEmpleado}"></i> $${item.totalImporteEmpleado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
                    <div><a href="#" class="ver-obs" data-sucursal="${item.sucursal}" data-empleado="${item.empleado}">Ver Obs.</a></div>
                `;

                topErroresDiv.appendChild(row);
            }

            if (index >= sucursalesOrdenadas.length) {
                botonMostrarMas.style.display = 'none';
            }
        }

        mostrarMasErrores();

        botonMostrarMas.addEventListener('click', mostrarMasErrores);

        topErroresDiv.addEventListener('click', function(event) {
            if (event.target.classList.contains('ver-obs')) {
                event.preventDefault();

                const sucursal = event.target.getAttribute('data-sucursal');
                const empleado = event.target.getAttribute('data-empleado');

                const observaciones = datos.filter(mov => 
                    mov.Suc === sucursal && 
                    mov.Empleado === empleado && 
                    mov.TAjuste === "Error Operativo Sin Resolver"
                );

                const observacionDiv = document.getElementById('observacion');
                observacionDiv.innerHTML = `
                    <button id="cerrar-observacion" class="cerrar-observacion">&times;</button>
                    <h2>LEGAJO: ${empleado}</h2>
                    <h3>SUC. ${sucursal}</h3>
                    <div class="header-ii">
                        <div>Fecha</div>
                        <div>Error</div>
                        <div>Importe</div>
                        <div>Observación</div>
                    </div>
                    <div>
                        ${observaciones.map(obs => {
                            const observacionCorta = obs.Observacion && obs.Observacion.length > 11
                                ? `${obs.Observacion.slice(0, 11)}... <br><span class="ver-mas">ver más</span>`
                                : obs.Observacion || 'Sin observación';

                            return `
                                <div class="row fade-in">
                                    <div>${obs.Fecha}</div>
                                    <div>${obs.TAjuste}</div>
                                    <div>$${parseFloat(obs.Importe.replace(/[^0-9,-]+/g, '').replace(',', '.')).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    <div><span class="observacion-corta">${observacionCorta}</span><span class="observacion-completa" style="display:none;">${obs.Observacion}</span></div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;

                observacionDiv.classList.add('mostrar');

                const verMasLinks = observacionDiv.querySelectorAll('.ver-mas');
                verMasLinks.forEach(link => {
                    link.addEventListener('click', function() {
                        const observacionCompleta = this.parentElement.nextElementSibling;
                        this.parentElement.style.display = 'none';
                        observacionCompleta.style.display = 'inline';
                    });
                });
            }
        });

        document.getElementById('observacion').addEventListener('click', function(event) {
            if (event.target.id === 'cerrar-observacion') {
                document.getElementById('observacion').classList.remove('mostrar');
            }
        });

        document.getElementById('enlace-exportar-errores').addEventListener('click', (event) => {
            event.preventDefault();
            exportarErroresAExcel();
        });

        function exportarErroresAExcel() {
            const ws = XLSX.utils.json_to_sheet(sucursalesOrdenadas);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Top Errores');
            XLSX.writeFile(wb, 'TopErrores.xlsx');
        }

    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

obtenerErroresOperativos();

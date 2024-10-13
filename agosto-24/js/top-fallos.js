import { apis } from './api.js';
async function obtenerTopFallosDeCaja() {
    try {
        const respuesta = await fetch(apis.apiFallosActual);
        const datos = await respuesta.json();

        //const fallosFaltante = datos.filter(mov => mov.TAjuste === "Fallo De Caja - Faltante");
        //const fallosSobrante = datos.filter(mov => mov.TAjuste === "Fallo De Cajas - Sobrante");

        const fallosFaltante = datos.filter(mov => mov.TAjuste === "Fallo De Caja - Faltante" && 
            !(mov.Observacion && mov.Observacion.toLowerCase().includes("deja vuelto")));
        const fallosSobrante = datos.filter(mov => mov.TAjuste === "Fallo De Cajas - Sobrante" && 
            !(mov.Observacion && mov.Observacion.toLowerCase().includes("deja vuelto")));

        // const fechas = [...fallosFaltante, ...fallosSobrante].map(mov => {
            // const [day, month, year] = mov.Fecha.split('/');
            // return new Date(`${year}-${month}-${day}`);
        // });

        // const fechaMasAntigua = new Date(Math.min(...fechas));
        // const fechaMasActual = new Date(Math.max(...fechas));

        // document.getElementById('fechas').textContent = `${fechaMasAntigua.toLocaleDateString('es-ES')} - ${fechaMasActual.toLocaleDateString('es-ES')}`;

        const fallosPorSucursal = [...fallosFaltante, ...fallosSobrante].reduce((acc, mov) => {
            const importe = parseFloat(mov.Importe.replace(/[^0-9,-]+/g, '').replace(',', '.'));

            if (!acc[mov.Suc]) {
                acc[mov.Suc] = {
                    totalFallos: 0,
                    totalImporte: 0,
                    empleados: {}
                };
            }
            acc[mov.Suc].totalFallos += 1;
            acc[mov.Suc].totalImporte += importe;

            if (!acc[mov.Suc].empleados[mov.Empleado]) {
                acc[mov.Suc].empleados[mov.Empleado] = {
                    fallosEmpleado: 0,
                    totalImporteEmpleado: 0
                };
            }
            acc[mov.Suc].empleados[mov.Empleado].fallosEmpleado += 1;
            acc[mov.Suc].empleados[mov.Empleado].totalImporteEmpleado += importe;

            return acc;
        }, {});

        const sucursalesOrdenadas = Object.entries(fallosPorSucursal)
            .map(([sucursal, data]) => {
                const empleadoConMasFallos = Object.entries(data.empleados)
                    .sort((a, b) => b[1].fallosEmpleado - a[1].fallosEmpleado)[0];

                return {
                    sucursal,
                    totalFallos: data.totalFallos,
                    totalImporte: data.totalImporte,
                    empleado: empleadoConMasFallos[0],
                    fallosEmpleado: empleadoConMasFallos[1].fallosEmpleado,
                    totalImporteEmpleado: empleadoConMasFallos[1].totalImporteEmpleado
                };
            })
            .sort((a, b) => b.totalFallos - a.totalFallos);

        let index = 0;
        const cantidadAMostrar = 10;
        const topFallosDiv = document.getElementById('top-fallos');
        const botonMostrarMas = document.getElementById('mostrar-mas-i');

        function obtenerCodigo(importe) {
            if (Math.abs(importe) >= 15000) {
                return { codigo: 3, icono: 'fa-exclamation-triangle', color: 'red' };
            } else if (Math.abs(importe) >= 7500) {
                return { codigo: 2, icono: 'fa-exclamation-circle', color: '#FFB900' };
            } else if (Math.abs(importe) >= 3000) {
                return { codigo: 1, icono: 'fa-info-circle', color: '#0061fe' };
            } else {
                return { codigo: 0, icono: '', color: '' };
            }
        }

        function mostrarMasFallos() {
            const final = Math.min(index + cantidadAMostrar, sucursalesOrdenadas.length);

            for (; index < final; index++) {
                const item = sucursalesOrdenadas[index];
                const row = document.createElement('div');
                row.className = 'row fade-in';

                let textoEmpleado = '';
                if (item.fallosEmpleado > 5) {
                    textoEmpleado = 'R. Capacitación';
                } else if (item.fallosEmpleado >= 3) {
                    textoEmpleado = 'R. Observación';
                }

                let textoSucursal = '';
                if (item.totalFallos > 60) {
                    textoSucursal = 'R. Auditoría';
                } else if (item.totalFallos >= 40) {
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

                row.innerHTML = `
<div>${index + 1}</div>
<div>${item.sucursal} ${textoSucursal ? `<img src="../img/18-34-10-554_512.webp" alt="Animación de alerta"> <p>${textoSucursal}</p>` : ''}</div>
<div>${item.totalFallos} <p><i class="fa-solid ${iconoImporte}" style="color:${colorIcono}"></i> $${item.totalImporte.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
<div>${item.empleado} ${textoEmpleado ? `<img src="../img/18-34-10-554_512.webp" alt="Animación de alerta"> <p>${textoEmpleado}</p>` : ''}</div>
<div>${item.fallosEmpleado} <p><i class="fa-solid ${iconoImporte}" style="color:${colorIcono}"></i> $${item.totalImporteEmpleado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
<div><a href="#" class="ver-obs" data-sucursal="${item.sucursal}" data-empleado="${item.empleado}">Ver Obs.</a></div>
`;

                topFallosDiv.appendChild(row);
            }

            if (index >= sucursalesOrdenadas.length) {
                botonMostrarMas.style.display = 'none';
            }
        }

        mostrarMasFallos();

        botonMostrarMas.addEventListener('click', mostrarMasFallos);

        topFallosDiv.addEventListener('click', function(event) {
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

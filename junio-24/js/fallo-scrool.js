const codigos = [3]; // Solo nos interesa el código 3

// Función principal para obtener y procesar los fallos
async function obtenerFallosDeCodigo() {
    try {
        const respuesta = await fetch('https://cesarcruz-coto.github.io/coto/DATOS-JUNIO-24/FALLOSOBRANTEFALTANTE.json');
        const datos = await respuesta.json();

        // Filtrar solo los fallos con código 3
        const fallosCodigo3 = datos.filter(mov => {
            const importe = parseFloat(mov.Importe.replace(/[^0-9,-]+/g, '').replace(',', '.'));
            const codigoData = obtenerCodigo(importe);
            return codigoData.codigo === 3;
        });

        console.log('Fallos con código 3:', fallosCodigo3);

        if (fallosCodigo3.length === 0) {
            console.log('No hay fallos con código 3 para mostrar notificaciones.');
            return;
        }

        // Encontrar la fecha más reciente entre los fallos con código 3
        const fechaMasReciente = obtenerFechaMasReciente(fallosCodigo3);
        console.log('Fecha más reciente:', fechaMasReciente);

        // Filtrar solo los fallos con código 3 que sean de la fecha más reciente
        const fallosMasRecientes = fallosCodigo3.filter(mov => {
            const fechaConvertida = convertirFecha(mov.Fecha);
            const fechaISO = fechaConvertida.toISOString().split('T')[0]; // Convertir fecha a YYYY-MM-DD para comparar
            return fechaISO === fechaMasReciente;
        });

        console.log('Fallos más recientes:', fallosMasRecientes);

        // Mostrar notificaciones para los fallos más recientes con código 3
        mostrarNotificaciones(fallosMasRecientes);

    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

// Mostrar las notificaciones para los fallos más recientes con código 3
const mostrarNotificaciones = (fallos) => {
    if (!('Notification' in window)) {
        console.error('Este navegador no soporta notificaciones.');
        return;
    }

    fallos.forEach((mov) => {
        const importe = parseFloat(mov.Importe.replace(/[^0-9,-]+/g, '').replace(',', '.'));
        const observacion = mov.Observacion || 'Sin observación';

        // Verificar si las notificaciones están permitidas
        if (Notification.permission === "granted") {
            new Notification(`Fallo Código 3`, {
                body: `Sucursal: ${mov.Suc}\nFecha: ${mov.Fecha}\nEmpleado: ${mov.Empleado}\nImporte: $${importe.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\nObservación: ${observacion}`,
                icon: `/ico/favicon-32x32.png`, // Ruta absoluta con extensión correcta
            });
        } else {
            console.warn('Permiso para notificaciones no concedido.');
        }
    });
}

// Obtener la fecha más reciente de los fallos con código 3
const obtenerFechaMasReciente = (fallos) => {
    const fechas = fallos.map(mov => convertirFecha(mov.Fecha));
    const fechaMasReciente = new Date(Math.max.apply(null, fechas)); // Obtener la fecha más reciente
    return fechaMasReciente.toISOString().split('T')[0]; // Formato YYYY-MM-DD
}

// Convertir la fecha del formato DD/MM/YYYY a un objeto Date
const convertirFecha = (fechaString) => {
    const partes = fechaString.split('/'); // Dividir la fecha en [Día, Mes, Año]
    const dia = parseInt(partes[0], 10);   // Día
    const mes = parseInt(partes[1], 10) - 1; // Mes (restar 1 porque los meses en Date son 0-11)
    const anio = parseInt(partes[2], 10);  // Año
    return new Date(anio, mes, dia);       // Crear un objeto Date
}

// Función para obtener el código según el importe
const obtenerCodigo = (importe) => {
    if (Math.abs(importe) >= 15000) return { codigo: 3, icono: 'fa-exclamation-triangle', color: 'red' };
    if (Math.abs(importe) >= 7500) return { codigo: 2, icono: 'fa-exclamation-circle', color: '#FFB900' };
    if (Math.abs(importe) >= 3000) return { codigo: 1, icono: 'fa-info-circle', color: '#0061fe' };
    return { codigo: 0, icono: '', color: '' };
};

// Ejecutar la función después de que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    registrarServiceWorker();
    solicitarPermisoNotificaciones();
});

// Registrar el Service Worker (opcional, pero recomendado para notificaciones en segundo plano)
const registrarServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registrado con éxito:', registration);
            })
            .catch(error => {
                console.error('Error al registrar el Service Worker:', error);
            });
    } else {
        console.warn('Service Workers no están soportados en este navegador.');
    }
}

// Solicitar permiso para mostrar notificaciones
const solicitarPermisoNotificaciones = () => {
    if (!('Notification' in window)) {
        console.error('Este navegador no soporta notificaciones.');
        return;
    }

    if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Permiso para notificaciones concedido.");
                obtenerFallosDeCodigo(); // Llamar la función para obtener los fallos después de conceder el permiso
                // Opcional: Configurar actualizaciones periódicas
                setInterval(obtenerFallosDeCodigo, 5 * 60 * 1000); // Cada 5 minutos
            } else {
                console.warn("Permiso para notificaciones denegado.");
            }
        });
    } else if (Notification.permission === "granted") {
        obtenerFallosDeCodigo();
        // Opcional: Configurar actualizaciones periódicas
        setInterval(obtenerFallosDeCodigo, 5 * 60 * 1000); // Cada 5 minutos
    } else {
        console.warn("Permiso para notificaciones denegado.");
    }
};

// Archivo sw.js (debes crearlo en la raíz de tu proyecto)
/*
self.addEventListener('push', event => {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: data.icon,
        // Puedes agregar más opciones aquí
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
*/

// Prueba básica de notificaciones (puedes eliminarla después de verificar que todo funciona)
/*
document.addEventListener('DOMContentLoaded', () => {
    if (!('Notification' in window)) {
        console.error('Este navegador no soporta notificaciones.');
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            new Notification('Prueba de Notificación', {
                body: 'Esta es una notificación de prueba en móvil.',
                icon: '/ico/favicon-32x32.png',
            });
        }
    });
});
*/
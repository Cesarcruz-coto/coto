// script.js
document.addEventListener('DOMContentLoaded', function () {
    var currentPage = window.location.pathname.split('/').pop(); // Obtiene el nombre del archivo actual

    var menuItems = document.querySelectorAll('.sidebar li'); // Selecciona todos los elementos <li> dentro de la sidebar

    menuItems.forEach(function (item) {
        var link = item.querySelector('a').getAttribute('href'); // Obtiene el href del enlace dentro del <li>

        if (currentPage === link) {
            item.classList.add('active'); // Añade la clase 'active' al <li> correspondiente
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    var loader = document.getElementById('loader');
    var content = document.getElementById('container-main');
    var progress = document.getElementById('progress');

    // Tiempo en milisegundos que deseas mostrar el loader
    var loaderTime = 3000; // 3000 ms = 3 segundos

    function hideLoader() {
        loader.style.opacity = 0;
        setTimeout(function () {
            loader.style.display = 'none';
            content.style.display = 'flex';
        }, 300); // Asegúrate de que el fade-out de la opacidad esté completo antes de ocultar el loader
    }

    // Simular la carga de contenido
    var progressValue = 0;
    var interval = setInterval(function () {
        progressValue += 10;
        progress.textContent = progressValue + '%';
        if (progressValue >= 100) {
            clearInterval(interval);
        }
    }, 100); // Aumenta el progreso cada 100ms

    // Ocultar el loader después del tiempo especificado
    setTimeout(hideLoader, loaderTime);
});

document.addEventListener('DOMContentLoaded', function() {
    const dropdownContent = document.getElementById('dropdown-content');
    const selectedMonthDisplay = document.getElementById('selected-month-display'); // Elemento para mostrar el mes seleccionado

    const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const now = new Date();
    const currentMonth = now.getMonth(); // 0-indexed (0 = Enero)
    const currentYear = now.getFullYear().toString().slice(-2); // Últimos 2 dígitos del año

    const startMonth = months.indexOf('junio'); // Mes de inicio

    for (let i = startMonth; i <= currentMonth; i++) {
        const monthLink = document.createElement('a');
        monthLink.href = '#';
        monthLink.textContent = months[i];

        // Añadimos evento de clic para generar la URL dinámica
        monthLink.addEventListener('click', function() {
            const selectedMonth = months[i];

            // Obtener el nombre de la página actual
            const currentPath = window.location.pathname;
            const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1);

            // Generar la nueva URL manteniendo el mismo nombre de página
            const url = `../${selectedMonth}-${currentYear}/${currentPage}`; // Utiliza el nombre de la página actual
            window.location.href = url; // Redirecciona a la URL generada
        });

        dropdownContent.appendChild(monthLink);
    }

    // Extraer el mes y año de la URL después de que la página se carga
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');

    if (pathParts.length > 1) {
        const folderName = pathParts[pathParts.length - 2]; // Obtener el nombre de la carpeta (mes-año)

        // Separar el mes y el año
        const [monthName, year] = folderName.split('-'); // 'septiembre-24' => ['septiembre', '24']

        // Obtener el índice del mes en el array 'months'
        const monthIndex = months.indexOf(monthName);

        // Crear una nueva fecha con el mes y el año
        if (monthIndex !== -1) {
            const date = new Date(`20${year}`, monthIndex); // Año completo '2024'
            const shortDate = date.toLocaleDateString('es-ES', { year: '2-digit', month: 'short' }); // Fecha corta en español (ej: 'sep. 24')

            // Mostrar la fecha corta en el elemento seleccionado
            selectedMonthDisplay.innerHTML = `<i class="fa-solid fa-chart-simple"></i> ${shortDate} <i class="fa-solid fa-angle-down" style="color:#e3d9d9;margin-left:10px"></i>`;
        }
    }
});

function toggleMenu() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    
    hamburger.classList.toggle('active');
    sidebar.classList.toggle('active');
}

// Mostrar/ocultar formulario
                document.getElementById('toggle-feedback-button').addEventListener('click', function () {
                    var formContainer = document.getElementById('feedback-container');
                    formContainer.classList.toggle('show');
                });

                // Cerrar formulario al presionar la "X"
                document.getElementById('close-feedback-button').addEventListener('click', function () {
                    var formContainer = document.getElementById('feedback-container');
                    formContainer.classList.remove('show');
                });

                // Manejo del envío del formulario
                var form = document.getElementById('feedback-form');
                form.addEventListener("submit", e => {
                    e.preventDefault();
                    var alertSuccess = document.getElementById('feedback-success-alert');
                    var alertError = document.getElementById('feedback-error-alert');
                    var loading = document.getElementById('feedback-loading');
                    var formContainer = document.getElementById('feedback-container');

                    // Esconder el formulario y mostrar el mensaje de "Enviando feedback"
                    form.style.display = 'none';
                    alertSuccess.style.display = 'none';
                    alertError.style.display = 'none';
                    loading.style.display = 'block';

                    // Enviar datos del formulario
                    fetch(form.action, {
                        method: "POST",
                        body: new FormData(form),
                    }).then(
                        response => response.json()
                    ).then((json) => {
                        // Ocultar "Enviando feedback" y mostrar alerta de éxito
                        loading.style.display = 'none';
                        alertSuccess.style.display = 'block';

                        // Esperar unos segundos antes de cerrar el formulario
                        setTimeout(() => {
                            formContainer.classList.remove('show');
                            form.style.display = 'block'; // Volver a mostrar el formulario para la próxima vez
                            form.reset(); // Resetear formulario
                        }, 3000); // 3 segundos antes de cerrar
                    }).catch((error) => {
                        // Ocultar "Enviando feedback" y mostrar alerta de error
                        loading.style.display = 'none';
                        alertError.style.display = 'block';

                        // Esperar unos segundos antes de cerrar el formulario
                        setTimeout(() => {
                            formContainer.classList.remove('show');
                            form.style.display = 'block'; // Volver a mostrar el formulario para la próxima vez
                        }, 3000); // 3 segundos antes de cerrar
                    });
                });

                //document.getElementById("MenuToggleTotal").addEventListener("click", function () {
                    //const MenuForm = document.getElementById("MenuToggleTotalForm");
                    //if (MenuForm.style.display === "none") {
                       // MenuForm.style.display = "block";
                     // this.textContent = "Tesoreria";
                    //} else {
                    //  MenuForm.style.display = "none";
                     // this.textContent = "Tesoreria";
                  //  }
                 // });

                 // document.getElementById("MenuToggleTotalCajas").addEventListener("click", function () {
                 //   const MenuForm = document.getElementById("MenuToggleTotalFormCajas");
                 //   if (MenuForm.style.display === "none") {
                 //       MenuForm.style.display = "block";
                 //     this.textContent = "Cajas";
                 //   } else {
                 //     MenuForm.style.display = "none";
                  //    this.textContent = "Cajas";
                 //   }
                 // });
document.addEventListener("DOMContentLoaded", function () {
    const dropdownContent = document.getElementById("dropdown-content");
    const selectedMonthDisplay = document.getElementById("selected-month-display");
    const months = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonthIndex = currentDate.getMonth();

    const calendarMonthsContainer = document.querySelector(".calendar-months");
    const yearDisplay = document.getElementById("current-year-display");
    const prevYearButton = document.getElementById("prev-year");
    const nextYearButton = document.getElementById("next-year");

    // Archivos de scripts
    const scriptFiles = [
        "scripts.js",
        "api.js",
        "top-axi.js",
        "resumen.js",
        "resumen-fallo.js",
        "top-eo.js",
        "evolutivo-sf.js",
        "fallos-codigos.js",
        "evolutivo-eo-mac.js",
        "top-fallos.js"
    ];

    // Actualizar el encabezado del año
    function updateYearDisplay() {
        yearDisplay.textContent = currentYear;
    }

    // Generar botones de meses
    function generateMonths() {
        calendarMonthsContainer.innerHTML = ""; // Limpiar contenido previo
        months.forEach((month, index) => {
            const monthButton = document.createElement("button");
            monthButton.textContent = month;
            monthButton.classList.add("month-button");
            monthButton.dataset.monthIndex = index;

            // Evento al hacer clic
            monthButton.addEventListener("click", function () {
                const selectedMonth = month.toLowerCase();
                const folder = `/${selectedMonth}-${currentYear.toString().slice(-2)}/js/`;

                // Actualizar scripts dinámicos
                updateScripts(folder);

                // Mostrar selección
                selectedMonthDisplay.innerHTML = `
                    <i class="fa-solid fa-chart-simple"></i> ${month} (${currentYear})
                    <i class="fa-solid fa-angle-down"></i>
                `;
            });

            calendarMonthsContainer.appendChild(monthButton);
        });
    }

    // Cargar scripts dinámicos
    function updateScripts(folder) {
        // Eliminar scripts previos cargados dinámicamente
        const existingScripts = document.querySelectorAll('script[data-dynamic]');
        existingScripts.forEach(script => script.remove());

        // Cargar nuevos scripts
        scriptFiles.forEach(file => {
            const script = document.createElement("script");
            script.src = `${folder}${file}`;
            script.setAttribute("data-dynamic", "true");
            script.type = "module"; // Asume que son módulos
            script.async = true;
            script.onload = () => console.log(`Cargado: ${file} desde ${folder}`);
            script.onerror = () => console.error(`Error al cargar: ${file} desde ${folder}`);
            document.body.appendChild(script);
        });
    }

    // Navegación de años
    prevYearButton.addEventListener("click", function () {
        currentYear--;
        updateYearDisplay();
    });

    nextYearButton.addEventListener("click", function () {
        currentYear++;
        updateYearDisplay();
    });

    // Mostrar u ocultar el menú
    selectedMonthDisplay.addEventListener("click", function (event) {
        event.stopPropagation();
        dropdownContent.classList.toggle("show");
    });

    document.addEventListener("click", function () {
        dropdownContent.classList.remove("show");
    });

    // Inicializar calendario
    function initCalendar() {
        updateYearDisplay();
        generateMonths();

        // Cargar por defecto el mes actual
        const currentMonth = months[currentMonthIndex].toLowerCase();
        const folder = `/${currentMonth}-${currentYear.toString().slice(-2)}/js/`;

        // Actualizar scripts para el mes actual
        updateScripts(folder);

        // Mostrar selección inicial
        selectedMonthDisplay.innerHTML = `
            <i class="fa-solid fa-chart-simple"></i> ${months[currentMonthIndex]} (${currentYear})
            <i class="fa-solid fa-angle-down"></i>
        `;
    }

    initCalendar();
});

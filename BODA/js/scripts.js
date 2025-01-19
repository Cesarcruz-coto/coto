const textElement = document.getElementById("text");
const cartaElement = document.querySelector(".carta");
const text = "Dos almas se unirán para escribir su historia de amor...";
const typingSpeed = 100; // Velocidad de escritura en milisegundos

let index = 0;

function typeEffect() {
  if (index < text.length) {
    textElement.innerHTML += text.charAt(index); // Agrega una letra al texto
    index++;
    setTimeout(typeEffect, typingSpeed); // Llama a la función nuevamente
  } else {
    // Espera un momento después de escribir el texto antes de ocultarlo
    setTimeout(() => {
      textElement.parentElement.style.display = "none"; // Oculta el contenedor del texto
      cartaElement.style.display = "block"; // Muestra el contenedor de la carta
    }, 1000); // Tiempo de espera antes de mostrar la carta (1 segundo)
  }
}

// Inicia el efecto de escritura
typeEffect();


function abrirInvitacion() {
  alert("¡Abriste la invitación!");
}


function abrirInvitacion() {
    const inicio = document.getElementById('inicio');
    const contenido = document.getElementById('contenido');
  
    if (inicio && contenido) {
      // Añade la clase para el efecto de desvanecimiento
      inicio.classList.add('oculto');
  
      // Espera a que termine la animación antes de mostrar el contenido
      setTimeout(() => {
        inicio.style.display = 'none'; // Oculta completamente el div
        contenido.classList.add('activo'); // Muestra el contenido
      }, 1000); // El tiempo debe coincidir con la duración de la transición en CSS (1s)
    } else {
      console.error('No se encontraron los elementos con los IDs "inicio" o "contenido".');
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".slide");
    let currentIndex = 0;
  
    function cambiarSlide() {
      // Quita las clases activa e inactiva de todos los slides
      slides.forEach((slide, index) => {
        slide.classList.remove("activa", "inactiva");
        if (index === currentIndex) {
          slide.classList.add("activa");
        } else {
          slide.classList.add("inactiva");
        }
      });
  
      // Avanza al siguiente slide
      currentIndex = (currentIndex + 1) % slides.length; // Reinicia al llegar al final
    }
  
    // Cambia el slide automáticamente cada 5 segundos
    setInterval(cambiarSlide, 5000);
  
    // Inicia el primer slide visible
    cambiarSlide();
  });
  

  // Configura la fecha objetivo para la cuenta regresiva
const fechaObjetivo = new Date("2025-03-16T00:00:00").getTime(); // Cambia la fecha aquí

function iniciarContador() {
  const contadorDiv = document.getElementById("contador");

  if (!contadorDiv) {
    console.error("El elemento con ID 'contador' no se encontró.");
    return;
  }

  function actualizarContador() {
    const ahora = new Date().getTime();
    const diferencia = fechaObjetivo - ahora;

    if (diferencia <= 0) {
      // Si el tiempo ha llegado, muestra un mensaje
      contadorDiv.innerHTML = "<p>¡Llegó el gran día!</p>";
      clearInterval(intervalo);
      return;
    }

    // Calcula los días, horas, minutos y segundos restantes
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

    // Actualiza el contenido del div
    contadorDiv.innerHTML = `
      <div class="tiempo">
        <span class="valor">${dias}</span>
        <span class="unidad">Días</span>
      </div>
      <div class="tiempo">
        <span class="valor">${horas}</span>
        <span class="unidad">Horas</span>
      </div>
      <div class="tiempo">
        <span class="valor">${minutos}</span>
        <span class="unidad">Minutos</span>
      </div>
      <div class="tiempo">
        <span class="valor">${segundos}</span>
        <span class="unidad">Segundos</span>
      </div>
    `;
  }

  // Actualiza el contador cada segundo
  const intervalo = setInterval(actualizarContador, 1000);

  // Llama a la función una vez para evitar esperar el primer segundo
  actualizarContador();
}

// Inicia el contador al cargar la página
document.addEventListener("DOMContentLoaded", iniciarContador);

  // Selección de elementos
const enlacesMapa = document.querySelectorAll(".btn-mapa"); // Todos los enlaces con mapas
const modal = document.getElementById("modal");
const iframeMapa = document.getElementById("iframeMapa");
const cerrarModal = document.getElementById("cerrarModal");

// Direcciones de Google Maps (personaliza estas URLs con tus ubicaciones)
const mapas = {
  direccion1: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.166940869526!2d-58.388961788458595!3d-34.59993987284296!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccac7755e2d11%3A0x4fb49906009ff6fa!2sUruguay%20753%2C%20C1015ABO%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires!5e0!3m2!1sen!2sar!4v1737308946047!5m2!1sen!2sar",
  direccion2: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3272.813216516703!2d-58.37333238844682!3d-34.886036372741216!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a32aacc41697d5%3A0xef5c08d53f3056b!2sGdor.%20Arias%203302%2C%20B1856HQZ%20Glew%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1sen!2sar!4v1737309631684!5m2!1sen!2sar"
};

// Abrir el modal con el mapa correspondiente
enlacesMapa.forEach((enlace) => {
  enlace.addEventListener("click", (e) => {
    e.preventDefault(); // Evita el comportamiento por defecto del enlace
    const mapaID = enlace.getAttribute("data-mapa"); // Obtiene el ID del mapa desde el atributo data-mapa
    iframeMapa.src = mapas[mapaID]; // Cambia el src del iframe al mapa correspondiente
    modal.classList.add("mostrar"); // Muestra el modal
  });
});

// Cerrar el modal al presionar el botón de cerrar
cerrarModal.addEventListener("click", () => {
  modal.classList.remove("mostrar"); // Oculta el modal
  iframeMapa.src = ""; // Limpia el iframe para evitar cargar el mapa innecesariamente
});

// Cerrar el modal al hacer clic fuera del contenido
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("mostrar");
    iframeMapa.src = ""; // Limpia el iframe
  }
});

    // Función para copiar al portapapeles
    function copyToClipboard(selector) {
      const textElement = document.querySelector(selector);
      const text = textElement.textContent;

      // Crear un elemento de texto temporal
      const tempInput = document.createElement("textarea");
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);

      alert(`Copiado al portapapeles: ${text}`);
    }

    // Abre el modal cuando se haga clic en el enlace
document.getElementById("openModal").onclick = function(event) {
    event.preventDefault();
    document.getElementById("modalbox-asistencia").style.display = "block";
};

// Cierra el modal cuando se hace clic en la "X"
document.getElementById("closeModal").onclick = function() {
    document.getElementById("modalbox-asistencia").style.display = "none";
};

    // Manejo del envío del formulario
var form = document.getElementById('feedback-form');
form.addEventListener("submit", function(e) {
    e.preventDefault();  // Evitar el comportamiento por defecto (la redirección al API)

    // Obtener las alertas y contenedores
    var alertSuccess = document.getElementById('feedback-success-alert');
    var alertError = document.getElementById('feedback-error-alert');
    var loading = document.getElementById('feedback-loading');
    var formContainer = document.getElementById('feedback-container');

    // Esconder el formulario y mostrar el mensaje de "Enviando respuesta"
    form.style.display = 'none';
    alertSuccess.style.display = 'none';  // Esconder alerta de éxito
    alertError.style.display = 'none';   // Esconder alerta de error
    loading.style.display = 'block';  // Mostrar mensaje de "Enviando respuesta"

    // Enviar datos del formulario usando fetch
    fetch(form.action, {
        method: "POST",
        body: new FormData(form),  // Enviar los datos del formulario
    }).then(response => {
        // Comprobar si la respuesta es correcta
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return response.json();  // Procesar la respuesta JSON
    }).then((json) => {
        // Ocultar "Enviando respuesta" y mostrar alerta de éxito
        loading.style.display = 'none';
        alertSuccess.style.display = 'block';

        // Esperar unos segundos antes de volver a mostrar el formulario
        setTimeout(() => {
            form.style.display = 'block';  // Mostrar el formulario nuevamente
            form.reset();  // Resetear el formulario
        }, 3000); // 3 segundos antes de mostrar el formulario nuevamente
    }).catch((error) => {
        // Ocultar "Enviando respuesta" y mostrar alerta de error
        loading.style.display = 'none';
        alertError.style.display = 'block';

        // Esperar unos segundos antes de volver a mostrar el formulario
        setTimeout(() => {
            form.style.display = 'block';  // Mostrar el formulario nuevamente
        }, 3000); // 3 segundos antes de mostrar el formulario nuevamente
    });
});


  
  function abrirGoogleCalendar() {
    window.open('https://calendar.google.com/', '_blank');
  }
  
  function mostrarMapa(lugar) {
    const url = lugar === 'ceremonia'
      ? 'https://maps.google.com/'
      : 'https://maps.google.com/';
    window.open(url, '_blank');
  }
  
  function verReferencias() {
    window.open('https://www.google.com/search?q=vestimenta+sport+elegante', '_blank');
  }
  
  function abrirSpotify() {
    window.open('https://spotify.com', '_blank');
  }
  
  function verHashtag() {
    window.open('https://instagram.com/explore/tags/noscasamos', '_blank');
  }
  
  function mostrarRegalos() {
    alert('Información bancaria y QR aquí.');
  }
  
  function confirmarAsistencia(event) {
    event.preventDefault();
    alert('Gracias por confirmar tu asistencia.');
  }
  
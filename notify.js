// script.js
document.addEventListener("DOMContentLoaded", () => {
    const notificationBtn = document.querySelector(".notification-btn");
    const notificationPanel = document.getElementById("notification-panel");
    const notificationCount = document.getElementById("notification-count");
    const notificationList = document.getElementById("notification-list");
    const noNotifications = document.querySelector(".no-notifications");
  
    let notifications = []; // Almacena las notificaciones
  
    // Muestra u oculta el panel deslizante
    notificationBtn.addEventListener("click", () => {
      notificationPanel.classList.toggle("show"); // Desliza el panel
      if (notificationPanel.classList.contains("show")) {
        markAsRead();
      }
    });
  
    // Agrega una nueva notificación
    function addNotification(message, date, title) {
      notifications.push({ message, date, title, read: false });
      updateNotifications();
    }
  
    // Actualiza la lista de notificaciones
    function updateNotifications() {
      notificationList.innerHTML = ""; // Limpia la lista
      const unreadCount = notifications.filter((n) => !n.read).length;
  
      if (notifications.length === 0) {
        noNotifications.style.display = "block";
      } else {
        noNotifications.style.display = "none";
        notifications.forEach((n) => {
          const li = document.createElement("li");
          li.style.padding = "10px";
          li.style.borderBottom = "1px dashed #222";
          
          // Contenedor de la notificación
          const dateElement = document.createElement("div");
          dateElement.style.fontSize = "12px";
          dateElement.style.color = "#777";
          dateElement.textContent = n.date; // Muestra la fecha
          li.appendChild(dateElement);
          
          const titleElement = document.createElement("div");
          titleElement.style.fontWeight = "bold";
          titleElement.style.marginTop = "5px";
          titleElement.textContent = n.title; // Muestra el título
          li.appendChild(titleElement);
          
          const messageElement = document.createElement("div");
          messageElement.style.marginTop = "5px";
          messageElement.textContent = n.message; // Muestra el mensaje
          li.appendChild(messageElement);
  
          li.style.fontWeight = n.read ? "normal" : "bold"; // Si está leída, normal, sino en negrita
          notificationList.appendChild(li);
        });
      }
  
      // Actualiza el contador
      notificationCount.textContent = unreadCount;
      notificationCount.style.display = unreadCount > 0 ? "inline-block" : "none";
    }
  
    // Marca todas las notificaciones como leídas
    function markAsRead() {
      notifications = notifications.map((n) => ({ ...n, read: true }));
      updateNotifications();
    }
  
    // Función para cargar las notificaciones desde la API
    async function loadNotifications() {
      try {
        const response = await fetch("https://app.sheetlabs.com/TREE/notify");
        const data = await response.json();
        
        // Verificamos si la respuesta es un array de notificaciones
        if (Array.isArray(data)) {
          data.forEach(notification => {
            addNotification(notification.mensaje, notification.fecha, notification.titulo);
          });
        }
      } catch (error) {
        console.error("Error al cargar las notificaciones:", error);
      }
    }
  
    // Cargar las notificaciones al iniciar
    loadNotifications();
  });
  
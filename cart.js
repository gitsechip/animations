// cart.js

import { productosGlobal, cargarProductos } from 'https://gitsechip.github.io/animations/data.js';

// Variables globales para el carrito
let cart = [];
let catalogo = [];

// Configuración de Toastr (si no está configurado en shop.js)
toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": true,
  "progressBar": true,
  "positionClass": "toast-top-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "3000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
};

// Al cargar la página, cargamos el catálogo y el carrito desde Local Storage
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM completamente cargado y parseado - cart.js");
  // Cargar catálogo de productos
  await cargarProductos();
  catalogo = productosGlobal;

  cargarCarritoDesdeLocalStorage();
  actualizarBadge();
  renderCartItems();

  // Escuchar cambios en el almacenamiento para sincronizar entre pestañas
  window.addEventListener('storage', (event) => {
    if (event.key === 'carrito') {
      cargarCarritoDesdeLocalStorage();
      actualizarBadge();
      renderCartItems();
    }
  });
});

// Función para agregar un producto al carrito
export function addToCart(productId) {
  console.log(`Añadiendo al carrito: ${productId}`);
  const productoEncontrado = catalogo.find(p => p.id === productId);
  if (productoEncontrado) {
    const itemEnCarrito = cart.find(item => item.id === productId);
    if (itemEnCarrito) {
      if (itemEnCarrito.cantidad < productoEncontrado.stock) {
        itemEnCarrito.cantidad += 1;
        toastr.info(`${productoEncontrado.titulo} añadido al carrito.`);
      } else {
        toastr.warning("Has alcanzado el límite de stock disponible para este producto.");
        return;
      }
    } else {
      cart.push({ ...productoEncontrado, cantidad: 1 });
      toastr.success(`${productoEncontrado.titulo} añadido al carrito.`);
    }
    guardarCarritoEnLocalStorage();
    actualizarBadge();
    renderCartItems();
  }
}

// Función para eliminar un producto del carrito
export function removeFromCart(productId) {
  console.log(`Eliminando del carrito: ${productId}`);
  const index = cart.findIndex(item => item.id === productId);
  if (index !== -1) {
    const removedItem = cart.splice(index, 1)[0];
    guardarCarritoEnLocalStorage();
    actualizarBadge();
    renderCartItems();
    toastr.error(`${removedItem.titulo} eliminado del carrito.`);
  }
}

// Función para incrementar la cantidad de un producto
export function incrementQuantity(productId) {
  console.log(`Incrementando cantidad de: ${productId}`);
  const item = cart.find(item => item.id === productId);
  if (item) {
    if (item.cantidad < item.stock) {
      item.cantidad += 1;
      guardarCarritoEnLocalStorage();
      actualizarBadge();
      renderCartItems();
      toastr.info(`Cantidad de ${item.titulo} actualizada.`);
    } else {
      toastr.warning("Has alcanzado el límite de stock disponible para este producto.");
    }
  }
}

// Función para decrementar la cantidad de un producto
export function decrementQuantity(productId) {
  console.log(`Decrementando cantidad de: ${productId}`);
  const item = cart.find(item => item.id === productId);
  if (item) {
    if (item.cantidad > 1) {
      item.cantidad -= 1;
      guardarCarritoEnLocalStorage();
      actualizarBadge();
      renderCartItems();
      toastr.info(`Cantidad de ${item.titulo} actualizada.`);
    } else {
      // Si la cantidad es 1, eliminar el producto del carrito
      removeFromCart(productId);
    }
  }
}

// Función para actualizar el contador del badge del carrito
function actualizarBadge() {
  const cartCount = document.getElementById("cartCount");
  let totalItems = 0;
  cart.forEach(item => {
    totalItems += item.cantidad;
  });
  cartCount.textContent = totalItems;
}

// Función para renderizar los productos en el modal del carrito
function renderCartItems() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const cartItemCount = document.getElementById("cartItemCount");
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>El carrito está vacío.</p>";
    cartTotal.textContent = "$0.00";
    cartItemCount.textContent = "0";
    return;
  }

  let total = 0;
  cart.forEach(item => {
    total += item.precio * item.cantidad;

    const itemRow = document.createElement("div");
    itemRow.classList.add("d-flex", "align-items-center", "mb-3", "flex-nowrap", "product-row", "animate__animated", "animate__fadeInRight");

    const img = document.createElement("img");
    img.src = item.imagen;
    img.alt = item.titulo;
    img.classList.add("me-3", "mb-2");
    img.style.width = "80px";
    img.style.height = "80px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "5px";
    img.loading = "lazy";

    const detailsDiv = document.createElement("div");
    detailsDiv.classList.add("flex-grow-1", "mb-2");

    const title = document.createElement("h5");
    title.classList.add("mb-1");
    title.textContent = item.titulo;

    const desc = document.createElement("p");
    desc.classList.add("mb-1", "text-muted");
    desc.style.fontSize = "0.9rem";
    desc.textContent = item.descripcion;

    const price = document.createElement("p");
    price.classList.add("mb-0");
    price.innerHTML = `<strong>${item.precio} ${item.moneda}</strong>`;

    // Controles de cantidad y eliminación
    const controlsDiv = document.createElement("div");
    controlsDiv.classList.add("d-flex", "align-items-center", "mt-2", "controls-container", "flex-wrap", "animate__animated", "animate__fadeIn");

    const decrementBtn = document.createElement("button");
    decrementBtn.classList.add("btn", "btn-sm", "btn-outline-secondary", "me-1");
    decrementBtn.innerHTML = '<i class="bi bi-dash"></i>';
    decrementBtn.onclick = () => decrementQuantity(item.id);
    decrementBtn.setAttribute("aria-label", `Decrementar cantidad de ${item.titulo}`);

    const cantidadSpan = document.createElement("span");
    cantidadSpan.classList.add("mx-2");
    cantidadSpan.textContent = item.cantidad;

    const incrementBtn = document.createElement("button");
    incrementBtn.classList.add("btn", "btn-sm", "btn-outline-secondary", "me-3");
    incrementBtn.innerHTML = '<i class="bi bi-plus"></i>';
    incrementBtn.onclick = () => incrementQuantity(item.id);
    incrementBtn.setAttribute("aria-label", `Incrementar cantidad de ${item.titulo}`);

    const removeBtn = document.createElement("button");
    removeBtn.classList.add("btn", "btn-sm", "btn-outline-danger");
    removeBtn.innerHTML = '<i class="bi bi-trash"></i>';
    removeBtn.onclick = () => removeFromCart(item.id);
    removeBtn.setAttribute("aria-label", `Eliminar ${item.titulo} del carrito`);

    controlsDiv.appendChild(decrementBtn);
    controlsDiv.appendChild(cantidadSpan);
    controlsDiv.appendChild(incrementBtn);
    controlsDiv.appendChild(removeBtn);

    detailsDiv.appendChild(title);
    detailsDiv.appendChild(desc);
    detailsDiv.appendChild(price);
    detailsDiv.appendChild(controlsDiv);

    itemRow.appendChild(img);
    itemRow.appendChild(detailsDiv);

    cartItems.appendChild(itemRow);
  });

  cartTotal.textContent = `$${total.toFixed(2)}`;
  cartItemCount.textContent = cart.length;
}

// Función para guardar el carrito en Local Storage
function guardarCarritoEnLocalStorage() {
  localStorage.setItem("carrito", JSON.stringify(cart));
}

// Función para cargar el carrito desde Local Storage
function cargarCarritoDesdeLocalStorage() {
  const carritoGuardado = localStorage.getItem("carrito");
  if (carritoGuardado) {
    try {
      cart = JSON.parse(carritoGuardado);
    } catch (error) {
      console.error("Error al parsear el carrito desde Local Storage:", error);
      cart = [];
    }
  }
}

// Función para mostrar notificaciones con Toastr
function mostrarNotificacion(mensaje, tipo = 'info') {
  switch(tipo) {
    case 'success':
      toastr.success(mensaje);
      break;
    case 'error':
      toastr.error(mensaje);
      break;
    case 'warning':
      toastr.warning(mensaje);
      break;
    case 'info':
    default:
      toastr.info(mensaje);
      break;
  }
}

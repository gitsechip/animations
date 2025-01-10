// cart.js

import { productosGlobal, cargarProductos } from 'https://gitsechip.github.io/animations/data.js';

// Variables globales para el carrito
let cart = [];
let catalogo = [];

// Función para mostrar notificaciones Toast
function mostrarNotificacion(mensaje, tipo = 'success') {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    console.error("Elemento con ID 'toastContainer' no encontrado en el DOM.");
    return;
  }

  const toastEl = document.createElement('div');
  toastEl.classList.add('toast', 'align-items-center', 'text-bg-' + tipo, 'border-0');
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${mensaje}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
    </div>
  `;

  toastContainer.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();

  // Eliminar el toast del DOM después de que se oculta
  toastEl.addEventListener('hidden.bs.toast', () => {
    toastEl.remove();
  });
}

// Al cargar la página, cargamos el catálogo y el carrito desde Local Storage
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM completamente cargado y parseado - cart.js");
  // Cargar catálogo de productos
  await cargarProductos();
  catalogo = productosGlobal;
  console.log("Catalogo cargado:", catalogo);

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
        mostrarNotificacion("Producto agregado al carrito", 'success');
      } else {
        mostrarNotificacion("Has alcanzado el límite de stock disponible para este producto.", 'warning');
        return;
      }
    } else {
      cart.push({ ...productoEncontrado, cantidad: 1 });
      mostrarNotificacion("Producto agregado al carrito", 'success');
    }
    guardarCarritoEnLocalStorage();
    actualizarBadge();
    renderCartItems();
  } else {
    console.error(`Producto con ID ${productId} no encontrado en el catálogo.`);
    mostrarNotificacion("Producto no encontrado.", 'danger');
  }
}

// Función para eliminar un producto del carrito
export function removeFromCart(productId) {
  console.log(`Eliminando del carrito: ${productId}`);
  const index = cart.findIndex(item => item.id === productId);
  if (index !== -1) {
    cart.splice(index, 1);
    guardarCarritoEnLocalStorage();
    actualizarBadge();
    renderCartItems();
    mostrarNotificacion("Producto eliminado del carrito", 'warning');
  } else {
    console.error(`Producto con ID ${productId} no está en el carrito.`);
    mostrarNotificacion("Producto no encontrado en el carrito.", 'danger');
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
      mostrarNotificacion("Cantidad actualizada", 'info');
    } else {
      mostrarNotificacion("Has alcanzado el límite de stock disponible para este producto.", 'warning');
    }
  } else {
    console.error(`Producto con ID ${productId} no está en el carrito.`);
    mostrarNotificacion("Producto no encontrado en el carrito.", 'danger');
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
      mostrarNotificacion("Cantidad actualizada", 'info');
    } else {
      // Si la cantidad es 1, eliminar el producto del carrito
      removeFromCart(productId);
    }
  } else {
    console.error(`Producto con ID ${productId} no está en el carrito.`);
    mostrarNotificacion("Producto no encontrado en el carrito.", 'danger');
  }
}

// Función para actualizar el contador del badge del carrito
function actualizarBadge() {
  const cartCount = document.getElementById("cartCount");
  if (!cartCount) {
    console.error("Elemento con ID 'cartCount' no encontrado en el DOM.");
    return;
  }
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

  if (!cartItems) {
    console.error("Elemento con ID 'cartItems' no encontrado en el DOM.");
    return;
  }
  if (!cartTotal) {
    console.error("Elemento con ID 'cartTotal' no encontrado en el DOM.");
    return;
  }
  if (!cartItemCount) {
    console.error("Elemento con ID 'cartItemCount' no encontrado en el DOM.");
    return;
  }

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
    itemRow.classList.add("d-flex", "align-items-center", "mb-3", "flex-nowrap", "product-row");

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
    controlsDiv.classList.add("d-flex", "align-items-center", "mt-2", "controls-container", "flex-wrap");

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
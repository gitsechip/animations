// cart.js

// Carrito en memoria
let cart = [];

// Catálogo temporal (lo llenamos en shop.js luego de fetch, para poderlo usar aquí)
let catalogo = [];

// Al cargar la página, guardamos el fetch de productos en 'catalogo'
document.addEventListener("DOMContentLoaded", () => {
  fetch("https://gitsechip.github.io/animations/productos.json")
    .then(response => response.json())
    .then(data => {
      catalogo = data; // Guardamos el array de productos en la variable global 'catalogo'
    })
    .catch(error => console.error("Error al cargar productos:", error));
});

// Función para agregar al carrito
function addToCart(productId) {
  // Buscar el producto en 'catalogo'
  const productoEncontrado = catalogo.find(p => p.id === productId);
  if (productoEncontrado) {
    // Verificar si ya existe en el carrito
    const itemEnCarrito = cart.find(item => item.id === productId);
    if (itemEnCarrito) {
      // Si ya existe, aumentar la cantidad
      itemEnCarrito.cantidad += 1;
    } else {
      // Si no existe, agregar con cantidad = 1
      cart.push({ ...productoEncontrado, cantidad: 1 });
    }
    actualizarBadge();
    renderCartItems();
  }
}

// Actualizar el badge con la cantidad total de productos
function actualizarBadge() {
  const cartCount = document.getElementById("cartCount");
  let totalItems = 0;
  cart.forEach(item => {
    totalItems += item.cantidad;
  });
  cartCount.textContent = totalItems;
}

// Renderizar los productos en el modal
function renderCartItems() {
  const cartItems = document.getElementById("cartItems");
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>El carrito está vacío.</p>";
    return;
  }

  cart.forEach(item => {
    const itemRow = document.createElement("div");
    itemRow.classList.add("d-flex", "justify-content-between", "align-items-center", "mb-2");
    itemRow.innerHTML = `
      <div>
        <strong>${item.titulo}</strong> 
        <span class="text-muted"> x ${item.cantidad}</span>
      </div>
      <div>
        ${item.precio} ${item.moneda} 
        <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeFromCart(${item.id})">
          Eliminar
        </button>
      </div>
    `;
    cartItems.appendChild(itemRow);
  });
}

// Eliminar un producto del carrito
function removeFromCart(productId) {
  const index = cart.findIndex(item => item.id === productId);
  if (index !== -1) {
    cart.splice(index, 1);
    actualizarBadge();
    renderCartItems();
  }
}
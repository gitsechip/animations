// cart.js
// Importar catálogo y Firebase
import { productosGlobal, cargarProductos } from 'https://gitsechip.github.io/animations/data.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC-TQ1IW3vhShutRxNuurxvDcUTCaRH7Mo",
  authDomain: "colmena-4eb03.firebaseapp.com",
  projectId: "colmena-4eb03",
  storageBucket: "colmena-4eb03.firebasestorage.app",
  messagingSenderId: "268420003210",
  appId: "1:268420003210:web:8de26ac4a9216a364a0473",
  measurementId: "G-KRYL9PMTP8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Variables globales
let cart = [];
let catalogo = [];
let unsubscribeCartListener = null;

// 1. Función de notificaciones (sin cambios)
export function mostrarNotificacion(mensaje, tipo = 'success') {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;

  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center text-bg-${tipo} border-0`;
  toastEl.setAttribute('role', 'alert');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${mensaje}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  toastContainer.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();

  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

// 2. Funciones de Firestore
async function guardarCarritoEnFirestore() {
  try {
    const user = auth.currentUser;
    if (!user) return;

    await setDoc(doc(db, 'users', user.uid), {
      cart: cart,
      lastUpdated: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error Firestore:', error);
    mostrarNotificacion('Error sincronizando carrito', 'danger');
  }
}

async function cargarCarritoDesdeFirestore() {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const docSnap = await getDoc(doc(db, 'users', user.uid));
    if (docSnap.exists() && docSnap.data().cart) {
      cart = docSnap.data().cart;
      guardarCarritoEnLocalStorage();
    }
  } catch (error) {
    console.error('Error cargando Firestore:', error);
  }
}

function setupCartListener() {
  const user = auth.currentUser;
  if (!user) return;

  unsubscribeCartListener = onSnapshot(doc(db, 'users', user.uid), (doc) => {
    if (doc.exists() && doc.data().cart) {
      cart = doc.data().cart;
      guardarCarritoEnLocalStorage();
      actualizarBadge();
      renderCartItems();
    }
  });
}

function mergeCarts(localCart, remoteCart) {
  const merged = [...localCart];
  remoteCart.forEach(remoteItem => {
    const existente = merged.find(item => item.key === remoteItem.key);
    existente ? existente.cantidad = Math.max(existente.cantidad, remoteItem.cantidad) : merged.push(remoteItem);
  });
  return merged;
}

// 3. Funciones principales del carrito (modificadas)
function generateCartItemKey(productId, options) {
  return `${productId}|${Object.keys(options).sort().map(k => `${k}:${options[k]}`).join('|')}`;
}

export function addToCart(productId, selectedOptions = {}) {
  const producto = catalogo.find(p => p.id === productId);
  if (!producto) {
    mostrarNotificacion("Producto no encontrado", 'danger');
    return;
  }

  const itemKey = generateCartItemKey(productId, selectedOptions);
  const itemExistente = cart.find(item => item.key === itemKey);

  if (itemExistente) {
    if (itemExistente.cantidad >= producto.stock) {
      mostrarNotificacion("Stock máximo alcanzado", 'warning');
      return;
    }
    itemExistente.cantidad += 1;
  } else {
    cart.push({
      key: itemKey,
      ...producto,
      cantidad: 1,
      options: selectedOptions
    });
  }

  guardarCarritoEnLocalStorage();
  guardarCarritoEnFirestore();
  actualizarBadge();
  renderCartItems();
  mostrarNotificacion("Producto agregado", 'success');
}

export function removeFromCart(productKey) {
  const index = cart.findIndex(item => item.key === productKey);
  if (index === -1) return;

  cart.splice(index, 1);
  guardarCarritoEnLocalStorage();
  guardarCarritoEnFirestore();
  actualizarBadge();
  renderCartItems();
  mostrarNotificacion("Producto eliminado", 'warning');
}

export function incrementQuantity(productKey) {
  const item = cart.find(item => item.key === productKey);
  if (!item) return;

  const producto = catalogo.find(p => p.id === item.id);
  if (item.cantidad >= producto.stock) {
    mostrarNotificacion("Stock máximo alcanzado", 'warning');
    return;
  }

  item.cantidad += 1;
  guardarCarritoEnLocalStorage();
  guardarCarritoEnFirestore();
  actualizarBadge();
  renderCartItems();
}

export function decrementQuantity(productKey) {
  const item = cart.find(item => item.key === productKey);
  if (!item) return;

  if (item.cantidad > 1) {
    item.cantidad -= 1;
  } else {
    removeFromCart(productKey);
    return;
  }

  guardarCarritoEnLocalStorage();
  guardarCarritoEnFirestore();
  actualizarBadge();
  renderCartItems();
}

// 4. Funciones de renderizado (sin cambios)
function actualizarBadge() {
  const cartCount = document.querySelector(".js-cartCount");
  if (!cartCount) return;
  cartCount.textContent = cart.reduce((total, item) => total + item.cantidad, 0);
}

export function renderCartItems() {
  const cartItems = document.querySelector(".js-cartItems");
  const cartTotal = document.getElementById("cartTotal");
  if (!cartItems || !cartTotal) return;

  cartItems.innerHTML = '';
  if (cart.length === 0) {
    cartItems.innerHTML = "<p>El carrito está vacío</p>";
    cartTotal.textContent = "$0.00";
    return;
  }

  let total = 0;
  cart.forEach(item => {
    total += item.precio * item.cantidad;
    const itemHTML = `
      <div class="d-flex align-items-center mb-3">
        <img src="${item.imagen}" alt="${item.titulo}" class="me-3" style="width:80px;height:80px;object-fit:cover;">
        <div class="flex-grow-1">
          <h5 class="mb-1">${item.titulo}</h5>
          <p class="mb-1 text-muted small">${item.descripcion}</p>
          ${Object.entries(item.options).map(([k, v]) => `<small>${k}: ${v}</small>`).join(' ')}
          <div class="d-flex align-items-center mt-2">
            <button class="btn btn-sm btn-outline-secondary me-1" onclick="decrementQuantity('${item.key}')">-</button>
            <span class="mx-2">${item.cantidad}</span>
            <button class="btn btn-sm btn-outline-secondary me-3" onclick="incrementQuantity('${item.key}')">+</button>
            <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart('${item.key}')">🗑️</button>
          </div>
        </div>
      </div>
    `;
    cartItems.insertAdjacentHTML('beforeend', itemHTML);
  });

  cartTotal.textContent = `$${total.toFixed(2)}`;
}

// 5. Funciones auxiliares (sin cambios)
function guardarCarritoEnLocalStorage() {
  localStorage.setItem("carrito", JSON.stringify(cart));
}

function cargarCarritoDesdeLocalStorage() {
  const guardado = localStorage.getItem("carrito");
  cart = guardado ? JSON.parse(guardado) : [];
}

export function clearCart() {
  cart = [];
  guardarCarritoEnLocalStorage();
  guardarCarritoEnFirestore();
  actualizarBadge();
  renderCartItems();
}

// 6. Inicialización completa
document.addEventListener("DOMContentLoaded", async () => {
  await cargarProductos();
  catalogo = productosGlobal;

  onAuthStateChanged(auth, async (user) => {
    if (unsubscribeCartListener) unsubscribeCartListener();
    
    if (user) {
      await cargarCarritoDesdeFirestore();
      setupCartListener();
      
      const localCart = JSON.parse(localStorage.getItem('carrito') || '[]');
      cart = mergeCarts(localCart, cart);
      guardarCarritoEnFirestore();
    } else {
      cargarCarritoDesdeLocalStorage();
    }
    
    actualizarBadge();
    renderCartItems();
  });

  window.addEventListener('storage', (event) => {
    if (event.key === 'carrito') {
      cargarCarritoDesdeLocalStorage();
      actualizarBadge();
      renderCartItems();
    }
  });
});
// shop.js

import { cargarProductos, productosGlobal } from 'https://gitsechip.github.io/animations/data.js';
import { addToCart } from 'https://gitsechip.github.io/animations/cart.js';

let paginaActual = 1;
const productosPorPagina = 6;
let productosFiltrados = [];

const productList = document.getElementById("productList");
const pagination = document.getElementById("pagination");

const searchFormDesktop = document.getElementById("searchFormDesktop");
const searchInputDesktop = document.getElementById("searchInputDesktop");
const searchButtonDesktop = document.getElementById("searchButtonDesktop");
const searchFormMobile = document.getElementById("searchFormMobile");
const searchInputMobile = document.getElementById("searchInputMobile");
const searchButtonMobile = document.getElementById("searchButtonMobile");

// Verificar si los elementos del DOM fueron encontrados
if (!productList) {
  console.error("Elemento con ID 'productList' no encontrado en el DOM.");
}

if (!pagination) {
  console.error("Elemento con ID 'pagination' no encontrado en el DOM.");
}

if (!searchFormDesktop || !searchInputDesktop || !searchButtonDesktop) {
  console.error("Elementos del formulario de búsqueda de desktop no encontrados.");
}

if (!searchFormMobile || !searchInputMobile || !searchButtonMobile) {
  console.error("Elementos del formulario de búsqueda móvil no encontrados.");
}

// Evento para cargar productos al iniciar
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM completamente cargado y parseado - shop.js");
  await cargarProductos(); // Asegurarse de que productosGlobal esté cargado
  console.log("ProductosGlobal después de cargar:", productosGlobal);
  if (productosGlobal.length === 0) {
    alert("No se cargaron productos. Verifica el archivo productos.json.");
  }
  productosFiltrados = [...productosGlobal];
  filtrarYRenderizar();
});

// Función para filtrar y renderizar productos
function filtrarYRenderizar() {
  renderProducts(productosFiltrados, paginaActual);
  renderPagination(productosFiltrados);
}

// Función para renderizar productos con paginación
function renderProducts(productos, pagina) {
  console.log(`Renderizando productos para la página ${pagina}`);
  const inicio = (pagina - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const productosPagina = productos.slice(inicio, fin);

  if (!productList) {
    console.error("Elemento 'productList' no está disponible.");
    return;
  }

  productList.innerHTML = "";

  if (productosPagina.length === 0) {
    productList.innerHTML = "<p class='text-center w-100'>No se encontraron productos con la búsqueda realizada.</p>";
    return;
  }

  productosPagina.forEach(producto => {
    const col = document.createElement("div");
    col.classList.add("col-md-4", "mb-4");

    // Crear tarjeta de producto de forma segura
    const card = document.createElement("div");
    card.classList.add("card", "product-card", "h-100");

    const link = document.createElement("a");
    link.href = `detalle.html?id=${producto.id}`;
    link.style.textDecoration = "none";
    link.style.color = "inherit";
    link.setAttribute("aria-label", `Ver detalles de ${producto.titulo}`);

    const img = document.createElement("img");
    img.src = producto.imagen;
    img.classList.add("card-img-top", "product-img");
    img.alt = producto.titulo;
    img.loading = "lazy";

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "d-flex", "flex-column", "flex-grow-1");

    const title = document.createElement("h5");
    title.classList.add("product-title");
    title.textContent = producto.titulo;

    const desc = document.createElement("p");
    desc.classList.add("product-desc");
    desc.textContent = producto.descripcion;

    const price = document.createElement("p");
    price.classList.add("product-price");
    price.textContent = `${producto.precio} ${producto.moneda}`;

    cardBody.appendChild(title);
    cardBody.appendChild(desc);
    cardBody.appendChild(price);
    link.appendChild(img);
    link.appendChild(cardBody);
    card.appendChild(link);

    const cardFooter = document.createElement("div");
    cardFooter.classList.add("card-body");

    const addButton = document.createElement("button");
    addButton.classList.add("btn", "btn-primary", "w-100");
    addButton.textContent = "Agregar al Carrito";
    addButton.onclick = (e) => {
      addToCart(producto.id);
      e.stopPropagation();
    };
    addButton.setAttribute("aria-label", `Agregar ${producto.titulo} al carrito`);

    cardFooter.appendChild(addButton);
    card.appendChild(cardFooter);
    col.appendChild(card);
    productList.appendChild(col);
  });
}

// Función para renderizar paginación
function renderPagination(productos) {
  console.log("Renderizando paginación");
  if (!pagination) {
    console.error("Elemento 'pagination' no está disponible.");
    return;
  }
  pagination.innerHTML = "";

  const totalPaginas = Math.ceil(productos.length / productosPorPagina);
  if (totalPaginas <= 1) return;

  for (let i = 1; i <= totalPaginas; i++) {
    const li = document.createElement("li");
    li.classList.add("page-item", i === paginaActual ? "active" : "");
    li.innerHTML = `<button class="page-link" aria-label="Página ${i}">${i}</button>`;
    li.addEventListener("click", () => {
      console.log(`Navegando a la página ${i}`);
      paginaActual = i;
      renderProducts(productos, paginaActual);
      renderPagination(productos);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pagination.appendChild(li);
  }
}

// Función para manejar la búsqueda
function handleSearch(event) {
  event.preventDefault();
  const queryDesktop = searchInputDesktop.value.trim().toLowerCase();
  const queryMobile = searchInputMobile.value.trim().toLowerCase();
  const query = queryDesktop || queryMobile;

  if (query === "") {
    productosFiltrados = [...productosGlobal];
  } else {
    productosFiltrados = productosGlobal.filter(producto => {
      const nombre = producto.titulo.toLowerCase();
      const categorias = producto.categorias ? producto.categorias.map(cat => cat.toLowerCase()) : [];
      return nombre.includes(query) || categorias.some(cat => cat.includes(query));
    });
  }

  paginaActual = 1;
  filtrarYRenderizar();

  // Mostrar notificación usando alert (funcionalidad original)
  if (query !== "") {
    alert(`Mostrando resultados para "${query}"`);
  } else {
    alert("Mostrando todos los productos");
  }
}

// Asignar eventos a los formularios de búsqueda
if (searchFormDesktop && searchButtonDesktop) {
  searchFormDesktop.addEventListener("submit", handleSearch);
  searchButtonDesktop.addEventListener("click", handleSearch);
} else {
  console.error("Formularios de búsqueda de desktop no están disponibles.");
}

if (searchFormMobile && searchButtonMobile) {
  searchFormMobile.addEventListener("submit", handleSearch);
  searchButtonMobile.addEventListener("click", handleSearch);
} else {
  console.error("Formularios de búsqueda móvil no están disponibles.");
}
// shop.js

import { cargarProductos, productosGlobal } from 'https://gitsechip.github.io/animations/data.js';
import { addToCart } from 'https://gitsechip.github.io/animations/cart.js';

let categoriaSeleccionada = null;
let colorSeleccionado = null;
let featureSeleccionada = null;
let priceSeleccionado = null;
let sortSeleccionado = null;

// Rangos de precio predefinidos
const rangosPrecios = [
  { etiqueta: "Menos de $500", min: 0, max: 500 },
  { etiqueta: "$500 - $1000", min: 500, max: 1000 },
  { etiqueta: "Más de $1000", min: 1000, max: Infinity }
];

// Paginación
let paginaActual = 1;
const productosPorPagina = 6;

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM completamente cargado y parseado - shop.js");
  const productList = document.getElementById("productList");
  const pagination = document.getElementById("pagination");

  // Referencias a botones y dropdowns
  const filterCategoryBtn = document.getElementById("filterCategory");
  const categoryDropdown = document.getElementById("categoryDropdown");
  const categoryList = document.getElementById("categoryList");
  const filterCategoryValue = document.getElementById("filterCategoryValue");

  const filterColorBtn = document.getElementById("filterColor");
  const colorDropdown = document.getElementById("colorDropdown");
  const colorList = document.getElementById("colorList");
  const filterColorValue = document.getElementById("filterColorValue");

  const filterFeaturesBtn = document.getElementById("filterFeatures");
  const featuresDropdown = document.getElementById("featuresDropdown");
  const featuresList = document.getElementById("featuresList");
  const filterFeaturesValue = document.getElementById("filterFeaturesValue");

  const filterPriceBtn = document.getElementById("filterPrice");
  const priceDropdown = document.getElementById("priceDropdown");
  const priceList = document.getElementById("priceList");
  const filterPriceValue = document.getElementById("filterPriceValue");

  const filterSortBtn = document.getElementById("filterSort");
  const sortDropdown = document.getElementById("sortDropdown");
  const sortList = document.getElementById("sortList");
  const filterSortValue = document.getElementById("filterSortValue");

  // Cargar productos
  const productos = await cargarProductos();
  renderProducts(productos, paginaActual);
  generarOpcionesFiltro(productos);
  generarOpcionesPrecio();

  // Generar opciones de orden
  const sortOptions = ["Menor Precio", "Mayor Precio", "Alfabético A-Z"];
  sortOptions.forEach(opt => {
    const li = document.createElement("li");
    li.textContent = opt;
    li.setAttribute("data-sort", opt);
    li.tabIndex = 0;
    li.setAttribute("role", "menuitem");
    sortList.appendChild(li);
  });

  // Paginación inicial
  renderPagination(productos);

  // 4. Mostrar/Ocultar dropdowns
  filterCategoryBtn.addEventListener("click", () => {
    toggleDropdown(categoryDropdown, filterCategoryBtn);
  });
  filterColorBtn.addEventListener("click", () => {
    toggleDropdown(colorDropdown, filterColorBtn);
  });
  filterFeaturesBtn.addEventListener("click", () => {
    toggleDropdown(featuresDropdown, filterFeaturesBtn);
  });
  filterPriceBtn.addEventListener("click", () => {
    toggleDropdown(priceDropdown, filterPriceBtn);
  });
  filterSortBtn.addEventListener("click", () => {
    toggleDropdown(sortDropdown, filterSortBtn);
  });

  // Cerrar dropdowns al hacer clic fuera
  document.addEventListener("click", e => {
    if (!e.target.closest(".filter-pill") && !e.target.closest(".dropdown-filter")) {
      closeAllDropdowns();
    }
  });

  function toggleDropdown(dropdown, button) {
    closeAllDropdowns();
    const isActive = dropdown.classList.contains('active');
    if (!isActive) {
      dropdown.classList.add('active');
      button.setAttribute("aria-expanded", "true");
    } else {
      dropdown.classList.remove('active');
      button.setAttribute("aria-expanded", "false");
    }
  }

  function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll(".dropdown-filter");
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove('active');
    });
    const buttons = document.querySelectorAll(".filter-pill");
    buttons.forEach(btn => {
      btn.setAttribute("aria-expanded", "false");
    });
  }

  // 5. Seleccionar categoría
  categoryList.addEventListener("click", e => {
    const cat = e.target.getAttribute("data-category");
    if (cat) {
      categoriaSeleccionada = (cat === "all") ? null : cat;
      filterCategoryValue.textContent = categoriaSeleccionada ? formatearTexto(categoriaSeleccionada) : "Todas las Categorías";
      closeAllDropdowns();
      paginaActual = 1;
      filtrarYRenderizar();
    }
  });

  // 6. Seleccionar color
  colorList.addEventListener("click", e => {
    const c = e.target.getAttribute("data-color");
    if (c) {
      colorSeleccionado = (c === "all") ? null : c;
      filterColorValue.textContent = colorSeleccionado ? formatearTexto(colorSeleccionado) : "Todos los Colores";
      closeAllDropdowns();
      paginaActual = 1;
      filtrarYRenderizar();
    }
  });

  // 7. Seleccionar feature
  featuresList.addEventListener("click", e => {
    const f = e.target.getAttribute("data-feature");
    if (f) {
      featureSeleccionada = (f === "all") ? null : f;
      filterFeaturesValue.textContent = featureSeleccionada ? formatearTexto(featureSeleccionada) : "Todas las Características";
      closeAllDropdowns();
      paginaActual = 1;
      filtrarYRenderizar();
    }
  });

  // 8. Seleccionar precio
  priceList.addEventListener("click", e => {
    const min = e.target.getAttribute("data-precio-min");
    const max = e.target.getAttribute("data-precio-max");
    if (min !== null && max !== null) {
      if (min === "0" && max === "Infinity") {
        priceSeleccionado = null;
        filterPriceValue.textContent = "Todos los Precios";
      } else {
        priceSeleccionado = { min: Number(min), max: Number(max) };
        filterPriceValue.textContent = e.target.textContent;
      }
      closeAllDropdowns();
      paginaActual = 1;
      filtrarYRenderizar();
    }
  });

  // 9. Seleccionar orden
  sortList.addEventListener("click", e => {
    const s = e.target.getAttribute("data-sort");
    if (s) {
      sortSeleccionado = s;
      filterSortValue.textContent = sortSeleccionado;
      closeAllDropdowns();
      paginaActual = 1;
      filtrarYRenderizar();
    }
  });

  // 10. Unificar filtros y renderizar
  function filtrarYRenderizar() {
    let productosFiltrados = [...productosGlobal];

    // Filtrar por categoría
    if (categoriaSeleccionada) {
      productosFiltrados = productosFiltrados.filter(p =>
        p.categorias && p.categorias.includes(categoriaSeleccionada)
      );
    }

    // Filtrar por color
    if (colorSeleccionado) {
      productosFiltrados = productosFiltrados.filter(
        p => p.color === colorSeleccionado
      );
    }

    // Filtrar por feature
    if (featureSeleccionada) {
      productosFiltrados = productosFiltrados.filter(
        p => p.features && p.features.includes(featureSeleccionada)
      );
    }

    // Filtrar por rango de precio
    if (priceSeleccionado) {
      productosFiltrados = productosFiltrados.filter(
        p => p.precio >= priceSeleccionado.min && p.precio <= priceSeleccionado.max
      );
    }

    // Ordenar
    if (sortSeleccionado) {
      if (sortSeleccionado === "Menor Precio") {
        productosFiltrados.sort((a, b) => a.precio - b.precio);
      } else if (sortSeleccionado === "Mayor Precio") {
        productosFiltrados.sort((a, b) => b.precio - a.precio);
      } else if (sortSeleccionado === "Alfabético A-Z") {
        productosFiltrados.sort((a, b) => a.titulo.localeCompare(b.titulo));
      }
    }

    renderProducts(productosFiltrados, paginaActual);
    renderPagination(productosFiltrados);
  }

  // 11. Renderizar productos con paginación
  function renderProducts(productos, pagina) {
    const inicio = (pagina - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productos.slice(inicio, fin);
    const totalPaginas = Math.ceil(productos.length / productosPorPagina);

    const productList = document.getElementById("productList");
    productList.innerHTML = "";

    if (productosPagina.length === 0) {
      productList.innerHTML = "<p class='text-center w-100'>No se encontraron productos con los filtros seleccionados.</p>";
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

  // 12. Renderizar paginación
  function renderPagination(productos) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const totalPaginas = Math.ceil(productos.length / productosPorPagina);
    if (totalPaginas <= 1) return;

    for (let i = 1; i <= totalPaginas; i++) {
      const li = document.createElement("li");
      li.classList.add("page-item", i === paginaActual ? "active" : "");
      li.innerHTML = `<button class="page-link" aria-label="Página ${i}">${i}</button>`;
      li.addEventListener("click", () => {
        paginaActual = i;
        renderProducts(productos, paginaActual);
        renderPagination(productos);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      pagination.appendChild(li);
    }
  }

  // 13. Generar opciones de filtro únicas
  function generarOpcionesFiltro(productos) {
    const categoriasUnicas = [...new Set(productos.flatMap(p => p.categorias || []))];
    const coloresUnicos = [...new Set(productos.map(p => p.color).filter(Boolean))];
    const featuresUnicas = [...new Set(productos.flatMap(p => p.features || []))];

    // Insertar "Mostrar todo" al inicio
    categoryList.innerHTML = `<li data-category="all" tabindex="0">Mostrar todo</li>`;
    colorList.innerHTML = `<li data-color="all" tabindex="0">Mostrar todo</li>`;
    featuresList.innerHTML = `<li data-feature="all" tabindex="0">Mostrar todo</li>`;

    // Llenar categorías
    if (categoriasUnicas.length === 0) {
      categoryList.innerHTML += `<li class="text-muted" tabindex="0">No hay categorías</li>`;
    } else {
      categoriasUnicas.forEach(cat => {
        const li = document.createElement("li");
        li.textContent = formatearTexto(cat);
        li.setAttribute("data-category", cat);
        li.tabIndex = 0;
        li.setAttribute("role", "menuitem");
        categoryList.appendChild(li);
      });
    }

    // Llenar colores
    if (coloresUnicos.length === 0) {
      colorList.innerHTML += `<li class="text-muted" tabindex="0">No hay colores</li>`;
    } else {
      coloresUnicos.forEach(col => {
        const li = document.createElement("li");
        li.textContent = formatearTexto(col);
        li.setAttribute("data-color", col);
        li.tabIndex = 0;
        li.setAttribute("role", "menuitem");
        colorList.appendChild(li);
      });
    }

    // Llenar features
    if (featuresUnicas.length === 0) {
      featuresList.innerHTML += `<li class="text-muted" tabindex="0">No hay características</li>`;
    } else {
      featuresUnicas.forEach(f => {
        const li = document.createElement("li");
        li.textContent = formatearTexto(f);
        li.setAttribute("data-feature", f);
        li.tabIndex = 0;
        li.setAttribute("role", "menuitem");
        featuresList.appendChild(li);
      });
    }
  }

  // 14. Generar opciones de precio
  function generarOpcionesPrecio() {
    // Insertar "Mostrar todo" al inicio
    priceList.innerHTML = `<li data-precio-min="0" data-precio-max="Infinity" tabindex="0">Mostrar todo</li>`;

    rangosPrecios.forEach(rango => {
      const li = document.createElement("li");
      li.textContent = rango.etiqueta;
      li.setAttribute("data-precio-min", rango.min);
      li.setAttribute("data-precio-max", rango.max);
      li.tabIndex = 0;
      li.setAttribute("role", "menuitem");
      priceList.appendChild(li);
    });
  }

  // 15. Formatear texto (agregar espacios antes de mayúsculas y capitalizar)
  function formatearTexto(texto) {
    return texto.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
});

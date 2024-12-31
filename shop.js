// shop.js
document.addEventListener("DOMContentLoaded", () => {
    const productList = document.getElementById("productList");
  
    // Cargar productos desde el JSON
    fetch("https://dl.dropboxusercontent.com/scl/fi/s6acm1jzsne7hpsf0g9tk/productos.json?rlkey=300xbepk8iy9koledu6emxirv&st=2sha71lg&raw=1")
      .then(response => response.json())
      .then(data => {
        // data es un array de objetos de producto
        data.forEach(producto => {
          // Crear tarjeta con Bootstrap
          const col = document.createElement("div");
          col.classList.add("col-md-4", "mb-4");
  
          col.innerHTML = `
            <div class="card product-card h-100">
              <img
                src="${producto.imagen}"
                class="card-img-top"
                alt="${producto.titulo}"
                style="max-height: 200px; object-fit: cover;"
              />
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${producto.titulo}</h5>
                <p class="card-text">${producto.descripcion}</p>
                <p class="card-text fw-bold">
                  ${producto.precio} ${producto.moneda}
                </p>
                <!-- Ejemplo de tallas (si existieran) -->
                ${
                  producto.tallas && producto.tallas.length > 0
                    ? `<p><strong>Tallas:</strong> ${producto.tallas.join(", ")}</p>`
                    : ""
                }
                <button
                  class="btn btn-primary mt-auto"
                  onclick="addToCart(${producto.id})"
                >
                  Agregar al Carrito
                </button>
              </div>
            </div>
          `;
  
          productList.appendChild(col);
        });
      })
      .catch(error => console.error("Error al cargar productos:", error));
  });
  
  
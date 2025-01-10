// data.js

export let productosGlobal = [];

export async function cargarProductos() {
  const url = "https://gitsechip.github.io/animations/productos.json"; // Ruta correcta
  try {
    const response = await fetch(url);
    console.log(`Fetching productos from ${url}`);
    if (!response.ok) {
      throw new Error("Error en la respuesta de la red");
    }
    const data = await response.json();
    console.log("Productos cargados en data.js:", data);
    productosGlobal = data;
    return data;
  } catch (error) {
    console.error("Error al cargar productos:", error);
    toastr.error("Hubo un problema al cargar los productos. Por favor, intenta nuevamente más tarde.");
    return [];
  }
}

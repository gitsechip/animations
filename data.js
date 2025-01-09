// data.js

export let productosGlobal = [];

export async function cargarProductos() {
  const url = "https://gitsechip.github.io/animations/productos.json";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error en la respuesta de la red");
    }
    const data = await response.json();
    productosGlobal = data;
    return data;
  } catch (error) {
    console.error("Error al cargar productos:", error);
    alert("Hubo un problema al cargar los productos. Por favor, intenta nuevamente más tarde.");
    return [];
  }
}

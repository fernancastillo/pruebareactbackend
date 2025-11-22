import { dataService } from '../dataService';

export const getProductosConStockActual = async (productosBase = null) => {
  try {
    const carrito = JSON.parse(localStorage.getItem('junimoCart')) || [];

    let productos = productosBase;
    if (!productos || productos.length === 0) {
      try {
        productos = await dataService.getProductos();
      } catch (error) {
        console.error('Error obteniendo productos desde BD:', error);
        productos = [];
      }
    }

    if (!Array.isArray(productos)) {
      productos = [];
    }

    const productosConStockActual = productos.map(producto => {
      const stockBase = producto.stock || producto.stockActual || 0;
      const itemEnCarrito = carrito.find(item => item.codigo === producto.codigo);
      const stockReservado = itemEnCarrito ? itemEnCarrito.cantidad : 0;
      const stock_disponible = Math.max(0, stockBase - stockReservado);

      return {
        ...producto,
        stock_disponible
      };
    });

    return productosConStockActual;
  } catch (error) {
    console.error('Error al calcular stock:', error);
    return [];
  }
};

export const verificarStockDisponible = async (productoCodigo, cantidadDeseada = 1) => {
  try {
    const productos = await getProductosConStockActual();
    const producto = productos.find(p => p.codigo === productoCodigo);

    const disponible = producto ? producto.stock_disponible >= cantidadDeseada : false;

    return disponible;
  } catch (error) {
    console.error('Error verificando stock:', error);
    return false;
  }
};

export const actualizarStockEnProductos = async () => {
  try {
    window.dispatchEvent(new Event('stockUpdated'));
    return true;
  } catch (error) {
    console.error('Error actualizando stock:', error);
    return false;
  }
};

export const obtenerStockDisponible = async (productoCodigo) => {
  try {
    const productos = await getProductosConStockActual();
    const producto = productos.find(p => p.codigo === productoCodigo);
    return producto ? producto.stock_disponible : 0;
  } catch (error) {
    console.error('Error obteniendo stock:', error);
    return 0;
  }
};

export const reiniciarStockDesdeBase = async () => {
  try {
    const productosBase = await dataService.getProductos();

    localStorage.setItem('app_productos', JSON.stringify(productosBase));

    window.dispatchEvent(new Event('stockUpdated'));
    window.dispatchEvent(new Event('cartUpdated'));

    return productosBase;
  } catch (error) {
    console.error('Error reiniciando stock:', error);
    return [];
  }
};

export const debugStock = async () => {
  try {
    const carrito = JSON.parse(localStorage.getItem('junimoCart')) || [];
    const productosBD = await dataService.getProductos();
    const productosConStock = await getProductosConStockActual(productosBD);

    return productosConStock;
  } catch (error) {
    console.error('Error en debug:', error);
    return [];
  }
};
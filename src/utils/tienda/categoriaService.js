import { dataService } from '../dataService';

// Función para calcular porcentaje de descuento
export const calcularPorcentajeDescuento = (precioOriginal, precioOferta) => {
  if (!precioOriginal || !precioOferta || precioOriginal <= precioOferta) {
    return 0;
  }

  const descuento = ((precioOriginal - precioOferta) / precioOriginal) * 100;
  return Math.round(descuento);
};

// Función para adaptar productos desde BD
const adaptarProductosDesdeBD = (productosBD) => {
  return productosBD.map(producto => {
    // Extraer nombre de categoría si es objeto
    let categoriaNombre = producto.categoria;
    if (typeof producto.categoria === 'object' && producto.categoria !== null) {
      categoriaNombre = producto.categoria.nombre || producto.categoria.name || 'Sin categoría';
    }

    // Adaptar nombres de campos de stock
    const stock = producto.stock || producto.stockActual || 0;
    const stockCritico = producto.stock_critico || producto.stockCritico || 5;

    // Asegurar que la imagen tenga una ruta válida
    let imagen = producto.imagen || producto.img || producto.url_imagen;
    if (!imagen) {
      imagen = '/src/assets/placeholder-producto.png';
    }

    return {
      ...producto,
      imagen: imagen,
      categoria: categoriaNombre,
      stock: stock,
      stock_critico: stockCritico,
      stock_disponible: stock,
      enOferta: false,
      precioOferta: null,
      descuento: 0
    };
  });
};

// Función para cargar categorías y productos desde la base de datos
export const loadCategoriesAndProducts = async () => {
  try {
    // Obtener productos desde la base de datos
    const productosDesdeBD = await dataService.getProductos();

    if (!productosDesdeBD || productosDesdeBD.length === 0) {
      return [];
    }

    // Adaptar productos al formato que espera la aplicación
    const productosAdaptados = adaptarProductosDesdeBD(productosDesdeBD);

    // Obtener categorías únicas de los productos
    const categoriasUnicas = [...new Set(productosAdaptados.map(product => product.categoria))];

    // Crear array de categorías con información adicional
    const categoriasConInfo = categoriasUnicas.map(categoria => {
      const productosCategoria = productosAdaptados.filter(product => product.categoria === categoria);
      return {
        nombre: categoria,
        cantidadProductos: productosCategoria.length,
        productos: productosCategoria
      };
    });

    return categoriasConInfo;

  } catch (error) {
    console.error('Error cargando categorías:', error);
    return [];
  }
};

// Función para obtener productos por categoría
export const getProductosPorCategoria = (categoriaNombre, categorias) => {
  const categoria = categorias.find(cat => cat.nombre === categoriaNombre);
  return categoria ? categoria.productos : [];
};

// Función para obtener todas las categorías desde la base de datos
export const getCategoriasDesdeBD = async () => {
  try {
    const categoriasBD = await dataService.getCategorias();

    // Extraer solo los nombres de las categorías
    const nombresCategorias = categoriasBD.map(cat => {
      if (typeof cat === 'object' && cat !== null) {
        return cat.nombre || cat.name || String(cat);
      }
      return String(cat);
    });

    return [...new Set(nombresCategorias)];
  } catch (error) {
    console.error('Error obteniendo categorías desde BD:', error);
    return [];
  }
};
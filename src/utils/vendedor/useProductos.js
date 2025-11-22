import { useState, useEffect } from 'react';
import { dataService } from '../dataService';

const normalizarProductos = (productosBD) => {
    if (!Array.isArray(productosBD)) return [];

    return productosBD.map(producto => {
        const stockActual = producto.stockActual || producto.stock || producto.stock_actual || 0;
        const stockCritico = producto.stockCritico || producto.stock_critico || 5;

        let categoriaNombre = 'Sin categoría';
        if (producto.categoria) {
            if (typeof producto.categoria === 'object') {
                categoriaNombre = producto.categoria.nombre || 'Sin categoría';
            } else {
                categoriaNombre = producto.categoria;
            }
        }

        return {
            codigo: producto.codigo || producto.codigo_producto || '',
            nombre: producto.nombre || '',
            descripcion: producto.descripcion || '',
            categoria: categoriaNombre,
            precio: producto.precio || 0,
            stockActual: stockActual,
            stockCritico: stockCritico,
            imagen: producto.imagen || '',
            stock: stockActual,
            stock_critico: stockCritico,
            categoriaObj: producto.categoria
        };
    });
};

export const useProductos = () => {
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriasCompletas, setCategoriasCompletas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProducto, setEditingProducto] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);

    const [filtros, setFiltros] = useState({
        codigo: '',
        nombre: '',
        categoria: '',
        estadoStock: '',
        precioMin: '',
        precioMax: '',
        stockMin: '',
        ordenarPor: 'nombre'
    });

    useEffect(() => {
        loadProductos();
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [productos, filtros]);

    const loadProductos = async () => {
        try {
            setLoading(true);
            setError(null);

            const [productosResponse, categoriasResponse] = await Promise.all([
                dataService.getProductos(),
                dataService.getCategorias()
            ]);

            const productosNormalizados = normalizarProductos(productosResponse);

            setProductos(productosNormalizados);

            if (categoriasResponse && Array.isArray(categoriasResponse)) {
                const nombresCategorias = categoriasResponse.map(cat => cat.nombre);
                setCategorias(nombresCategorias);
                setCategoriasCompletas(categoriasResponse);
            } else {
                const categoriasBase = [
                    'Accesorios',
                    'Decoración',
                    'Guías',
                    'Juego De Mesa',
                    'Mods Digitales',
                    'Peluches',
                    'Polera Personalizada'
                ];
                setCategorias(categoriasBase);
            }

        } catch (error) {
            setError(`Error al cargar productos: ${error.message}`);
            setProductos([]);
            setCategorias([]);
            setCategoriasCompletas([]);
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        if (!Array.isArray(productos)) {
            setProductosFiltrados([]);
            return;
        }

        let productosFiltrados = [...productos];

        if (filtros.codigo) {
            productosFiltrados = productosFiltrados.filter(p =>
                p.codigo && p.codigo.toLowerCase().includes(filtros.codigo.toLowerCase())
            );
        }

        if (filtros.nombre) {
            productosFiltrados = productosFiltrados.filter(p =>
                p.nombre && p.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())
            );
        }

        if (filtros.categoria) {
            productosFiltrados = productosFiltrados.filter(p =>
                p.categoria === filtros.categoria
            );
        }

        if (filtros.estadoStock) {
            switch (filtros.estadoStock) {
                case 'sin-stock':
                    productosFiltrados = productosFiltrados.filter(p => p.stock === 0);
                    break;
                case 'critico':
                    productosFiltrados = productosFiltrados.filter(p =>
                        p.stock > 0 && p.stock <= p.stock_critico
                    );
                    break;
                case 'normal':
                    productosFiltrados = productosFiltrados.filter(p =>
                        p.stock > p.stock_critico
                    );
                    break;
            }
        }

        if (filtros.precioMin) {
            productosFiltrados = productosFiltrados.filter(p =>
                p.precio >= parseFloat(filtros.precioMin)
            );
        }

        if (filtros.precioMax) {
            productosFiltrados = productosFiltrados.filter(p =>
                p.precio <= parseFloat(filtros.precioMax)
            );
        }

        if (filtros.stockMin) {
            productosFiltrados = productosFiltrados.filter(p =>
                p.stock >= parseInt(filtros.stockMin)
            );
        }

        productosFiltrados = ordenarProductos(productosFiltrados, filtros.ordenarPor);

        setProductosFiltrados(productosFiltrados);
    };

    const ordenarProductos = (productos, criterio) => {
        if (!Array.isArray(productos)) return [];

        const productosOrdenados = [...productos];

        switch (criterio) {
            case 'nombre':
                return productosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre));
            case 'nombre-desc':
                return productosOrdenados.sort((a, b) => b.nombre.localeCompare(a.nombre));
            case 'precio-asc':
                return productosOrdenados.sort((a, b) => a.precio - b.precio);
            case 'precio-desc':
                return productosOrdenados.sort((a, b) => b.precio - a.precio);
            case 'stock-asc':
                return productosOrdenados.sort((a, b) => a.stock - b.stock);
            case 'stock-desc':
                return productosOrdenados.sort((a, b) => b.stock - a.stock);
            case 'codigo':
                return productosOrdenados.sort((a, b) => a.codigo.localeCompare(b.codigo));
            default:
                return productosOrdenados;
        }
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLimpiarFiltros = () => {
        setFiltros({
            codigo: '',
            nombre: '',
            categoria: '',
            estadoStock: '',
            precioMin: '',
            precioMax: '',
            stockMin: '',
            ordenarPor: 'nombre'
        });
    };

    const handleEdit = (producto) => {
        setEditingProducto(producto);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProducto(null);
    };

    return {
        productos,
        productosFiltrados,
        categorias,
        loading,
        error,
        editingProducto,
        showModal,
        filtros,
        handleEdit,
        handleCloseModal,
        handleFiltroChange,
        handleLimpiarFiltros,
        refreshData: loadProductos
    };
};
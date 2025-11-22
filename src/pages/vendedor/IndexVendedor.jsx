import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { authService } from '../../utils/tienda/authService';
import { dataService } from '../../utils/dataService';

const IndexVendedor = () => {
    const currentUser = authService.getCurrentUser();
    const [estadisticas, setEstadisticas] = useState({
        totalProductos: 0,
        totalOrdenes: 0,
        ordenesPendientes: 0,
        productosStockBajo: 0
    });
    const [cargando, setCargando] = useState(true);

    const normalizarProductos = (productosBD) => {
        if (!Array.isArray(productosBD)) return [];

        return productosBD.map(producto => {
            const stockActual = producto.stockActual || producto.stock || producto.stock_actual || 0;
            const stockCritico = producto.stockCritico || producto.stock_critico || 5;
            const categoria = typeof producto.categoria === 'object'
                ? (producto.categoria.nombre || producto.categoria.name || 'Sin categoría')
                : (producto.categoria || 'Sin categoría');

            return {
                codigo: producto.codigo || producto.codigo_producto || '',
                nombre: producto.nombre || '',
                descripcion: producto.descripcion || '',
                categoria: categoria,
                precio: producto.precio || 0,
                stockActual: stockActual,
                stockCritico: stockCritico,
                imagen: producto.imagen || '',
                stock: stockActual,
                stock_critico: stockCritico
            };
        });
    };

    useEffect(() => {
        const cargarEstadisticas = async () => {
            try {
                const [productosResponse, ordenesResponse] = await Promise.all([
                    dataService.getProductos(),
                    dataService.getOrdenes()
                ]);

                const productosBD = Array.isArray(productosResponse) ? productosResponse : [];
                const ordenes = Array.isArray(ordenesResponse) ? ordenesResponse : [];

                const productos = normalizarProductos(productosBD);

                // Calcular productos con stock bajo (menor o igual a stock crítico)
                const productosStockBajo = productos.filter(p => {
                    const stock = p.stockActual || p.stock || 0;
                    const stockCritico = p.stockCritico || p.stock_critico || 5;
                    return stock <= stockCritico;
                });

                const ordenesPendientes = ordenes.filter(o =>
                    o.estadoEnvio && (
                        o.estadoEnvio.toLowerCase() === 'pendiente' ||
                        o.estadoEnvio.toLowerCase() === 'procesando'
                    )
                ).length;

                setEstadisticas({
                    totalProductos: productos.length,
                    totalOrdenes: ordenes.length,
                    ordenesPendientes: ordenesPendientes,
                    productosStockBajo: productosStockBajo.length
                });

            } catch (error) {
                console.error('Error cargando estadísticas:', error);
                setEstadisticas({
                    totalProductos: 0,
                    totalOrdenes: 0,
                    ordenesPendientes: 0,
                    productosStockBajo: 0
                });
            } finally {
                setCargando(false);
            }
        };

        cargarEstadisticas();
    }, []);

    if (cargando) {
        return (
            <Container className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-dark">Cargando estadísticas...</p>
            </Container>
        );
    }

    return (
        <Container>
            {/* Header de Bienvenida */}
            <Row className="mb-5">
                <Col>
                    <div className="text-center">
                        <h1
                            className="display-5 fw-bold mb-3 text-white" 
                            style={{ fontFamily: "'Indie Flower', cursive", textShadow:'2px 2px 4px rgba(0,0,0,0.7)'}}
                        >
                            ¡Bienvenido, {currentUser?.nombre || 'Vendedor'}!
                        </h1>
                        <p className="lead text-white">
                            Gestiona tus productos y órdenes desde tu panel de control
                        </p>
                    </div>
                </Col>
            </Row>

            {/* Tarjetas de Acceso Rápido - Misma altura */}
            <Row className="mb-5">
                <Col md={4} className="mb-4 d-flex">
                    <Card
                        className="shadow-sm border-0 flex-fill d-flex flex-column"
                        style={{ backgroundColor: '#87CEEB' }}
                    >
                        <Card.Body className="text-center p-4 d-flex flex-column">
                            <i className="bi-box display-4 text-dark mb-3"></i>
                            <Card.Title
                                className="h5 fw-bold mb-3 text-dark flex-grow-0"
                                style={{ fontFamily: "'Indie Flower', cursive" }}
                            >
                                Gestión de Productos
                            </Card.Title>
                            <Card.Text className="text-dark mb-4 flex-grow-1">
                                Administra tu inventario, precios y disponibilidad de productos
                            </Card.Text>
                            <Button
                                as={Link}
                                to="/vendedor/productos"
                                style={{ backgroundColor: '#dedd8ff5', borderColor: '#dedd8ff5', color: '#000000' }}
                                className="rounded-pill mt-auto"
                            >
                                Ver Productos
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4} className="mb-4 d-flex">
                    <Card
                        className="shadow-sm border-0 flex-fill d-flex flex-column"
                        style={{ backgroundColor: '#87CEEB' }}
                    >
                        <Card.Body className="text-center p-4 d-flex flex-column">
                            <i className="bi-clipboard display-4 text-dark mb-3"></i>
                            <Card.Title
                                className="h5 fw-bold mb-3 text-dark flex-grow-0"
                                style={{ fontFamily: "'Indie Flower', cursive" }}
                            >
                                Órdenes de Venta
                            </Card.Title>
                            <Card.Text className="text-dark mb-4 flex-grow-1">
                                Revisa y gestiona las órdenes de tus clientes
                            </Card.Text>
                            <Button
                                as={Link}
                                to="/vendedor/ordenes"
                                style={{ backgroundColor: '#dedd8ff5', borderColor: '#dedd8ff5', color: '#000000' }}
                                className="rounded-pill mt-auto"
                            >
                                Ver Órdenes
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4} className="mb-4 d-flex">
                    <Card
                        className="shadow-sm border-0 flex-fill d-flex flex-column"
                        style={{ backgroundColor: '#87CEEB' }}
                    >
                        <Card.Body className="text-center p-4 d-flex flex-column">
                            <i className="bi-person display-4 text-dark mb-3"></i>
                            <Card.Title
                                className="h5 fw-bold mb-3 text-dark flex-grow-0"
                                style={{ fontFamily: "'Indie Flower', cursive" }}
                            >
                                Mi Perfil
                            </Card.Title>
                            <Card.Text className="text-dark mb-4 flex-grow-1">
                                Actualiza tu información personal y configuración
                            </Card.Text>
                            <Button
                                as={Link}
                                to="/vendedor/perfil"
                                style={{ backgroundColor: '#dedd8ff5', borderColor: '#dedd8ff5', color: '#000000' }}
                                className="rounded-pill mt-auto"
                            >
                                Mi Perfil
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Estadísticas de Productos y Órdenes - DEBAJO de las cards */}
            <Row className="mb-5">
                <Col lg={3} md={6} className="mb-4">
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="text-center p-4">
                            <i className="bi-box display-6 text-primary mb-3"></i>
                            <Card.Title
                                className="h5 fw-bold mb-2 text-dark"
                                style={{ fontFamily: "'Indie Flower', cursive" }}
                            >
                                Total Productos
                            </Card.Title>
                            <div className="display-6 fw-bold text-primary mb-2">
                                {estadisticas.totalProductos}
                            </div>
                            <small className="text-muted">Productos en inventario</small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6} className="mb-4">
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="text-center p-4">
                            <i className="bi-exclamation-triangle display-6 text-warning mb-3"></i>
                            <Card.Title
                                className="h5 fw-bold mb-2 text-dark"
                                style={{ fontFamily: "'Indie Flower', cursive" }}
                            >
                                Stock Bajo
                            </Card.Title>
                            <div className="display-6 fw-bold text-warning mb-2">
                                {estadisticas.productosStockBajo}
                            </div>
                            <small className="text-muted">Productos con stock bajo</small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6} className="mb-4">
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="text-center p-4">
                            <i className="bi-clipboard display-6 text-success mb-3"></i>
                            <Card.Title
                                className="h5 fw-bold mb-2 text-dark"
                                style={{ fontFamily: "'Indie Flower', cursive" }}
                            >
                                Total Órdenes
                            </Card.Title>
                            <div className="display-6 fw-bold text-success mb-2">
                                {estadisticas.totalOrdenes}
                            </div>
                            <small className="text-muted">Órdenes totales</small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6} className="mb-4">
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="text-center p-4">
                            <i className="bi-clock display-6 text-info mb-3"></i>
                            <Card.Title
                                className="h5 fw-bold mb-2 text-dark"
                                style={{ fontFamily: "'Indie Flower', cursive" }}
                            >
                                Pendientes
                            </Card.Title>
                            <div className="display-6 fw-bold text-info mb-2">
                                {estadisticas.ordenesPendientes}
                            </div>
                            <small className="text-muted">Órdenes por enviar</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default IndexVendedor;
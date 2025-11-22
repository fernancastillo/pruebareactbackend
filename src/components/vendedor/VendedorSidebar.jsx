import React, { useState } from 'react';
import { Nav, Card, Modal, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../utils/tienda/authService';

const VendedorSidebar = () => {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();

    const menuItems = [
        { path: '/vendedor', icon: 'bi-house-fill', label: 'Inicio', exact: true },
        { path: '/vendedor/productos', icon: 'bi-box-seam', label: 'Productos' },
        { path: '/vendedor/ordenes', icon: 'bi-clipboard-check', label: 'Órdenes' },
        { path: '/vendedor/perfil', icon: 'bi-person-circle', label: 'Perfil' },
    ];

    const isActive = (path, exact = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        authService.logout();
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        handleLogout();
    };

    return (
        <>
            <Card
                className="vh-100 rounded-0 border-0 position-fixed"
                style={{
                    backgroundColor: '#dedd8ff5',
                    width: '200px',
                    left: 0,
                    top: 0
                }}
            >
                <Card.Body className="p-0 d-flex flex-column h-100">
                    {/* Header del Sidebar */}
                    <div className="p-3 border-bottom border-dark">
                        <div className="text-dark">
                            <h6 className="mb-0 fw-bold" style={{ fontFamily: "'Indie Flower', cursive" }}>
                                Panel Vendedor
                            </h6>
                            <small className="text-dark">
                                Hola, {currentUser?.nombre || 'Vendedor'}
                            </small>
                        </div>
                    </div>

                    {/* Menú de Navegación */}
                    <Nav className="flex-column flex-grow-1 p-3">
                        {menuItems.map((item) => (
                            <Nav.Link
                                key={item.path}
                                as={Link}
                                to={item.path}
                                className={`d-flex align-items-center mb-2 rounded ${isActive(item.path, item.exact)
                                        ? 'bg-dark text-white'
                                        : 'text-dark hover-custom'
                                    }`}
                                style={{
                                    textDecoration: 'none',
                                    padding: '0.75rem 1rem',
                                    transition: 'all 0.3s ease',
                                    fontFamily: "'Lato', sans-serif"
                                }}
                            >
                                <i className={`${item.icon} fs-5`}></i>
                                <span className="ms-2 fw-medium">{item.label}</span>
                            </Nav.Link>
                        ))}
                    </Nav>

                    {/* Cerrar Sesión */}
                    <div className="p-3 border-top border-dark">
                        <Nav.Link
                            onClick={handleLogoutClick}
                            className="d-flex align-items-center rounded text-danger hover-custom"
                            style={{
                                textDecoration: 'none',
                                padding: '0.75rem 1rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                fontFamily: "'Lato', sans-serif",
                                fontWeight: 'bold'
                            }}
                        >
                            <i className="bi-box-arrow-right fs-5"></i>
                            <span className="ms-2">Cerrar Sesión</span>
                        </Nav.Link>
                    </div>
                </Card.Body>
            </Card>

            {/* Modal de Confirmación de Cierre de Sesión */}
            <Modal
                show={showLogoutModal}
                onHide={() => setShowLogoutModal(false)}
                centered
                size="sm"
            >
                <Modal.Header
                    className="border-3 border-dark"
                    style={{
                        backgroundColor: '#87CEEB',
                    }}
                >
                    <Modal.Title className="fw-bold text-center w-100" style={{ color: '#000000' }}>
                        <span style={{ fontFamily: "'Indie Flower', cursive", fontSize: '1.5rem' }}>
                            <i className="bi-box-arrow-right me-2"></i>
                            Cerrar Sesión
                        </span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    className="text-center py-4"
                    style={{
                        backgroundColor: '#87CEEB',
                    }}
                >
                    <div className="mb-3">
                        <i className="bi-question-circle display-4 text-dark mb-3"></i>
                        <h6
                            className="fw-bold mb-3 text-dark"
                            style={{ fontFamily: "'Lato', sans-serif" }}
                        >
                            ¿Estás seguro de que quieres cerrar sesión?
                        </h6>
                        <p
                            className="text-dark mb-0"
                            style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.9rem' }}
                        >
                            Serás redirigido a la página de inicio.
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer
                    className="border-3 border-dark justify-content-center"
                    style={{
                        backgroundColor: '#87CEEB',
                    }}
                >
                    <Button
                        variant="outline-dark"
                        onClick={() => setShowLogoutModal(false)}
                        className="rounded-pill px-4 py-2 border-2 fw-bold me-2"
                        style={{
                            fontFamily: "'Lato', sans-serif"
                        }}
                    >
                        <i className="bi-x-circle me-2"></i>
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={confirmLogout}
                        className="rounded-pill px-4 py-2 border-2 fw-bold"
                        style={{
                            fontFamily: "'Lato', sans-serif"
                        }}
                    >
                        <i className="bi-box-arrow-right me-2"></i>
                        Sí, Cerrar Sesión
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default VendedorSidebar;
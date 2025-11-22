import React, { useState } from 'react';
import { Navbar, Nav, Container, Modal, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../utils/tienda/authService';

const VendedorMobileNavbar = () => {
    const [expanded, setExpanded] = useState(false);
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
        setExpanded(false);
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        handleLogout();
    };

    const handleNavClick = () => {
        setExpanded(false);
    };

    return (
        <>
            <Navbar
                expanded={expanded}
                onToggle={() => setExpanded(!expanded)}
                style={{
                    backgroundColor: '#dedd8ff5',
                    zIndex: 1030
                }}
                variant="dark"
                fixed="top"
                className="d-md-none border-bottom border-dark shadow-sm"
                expand="md"
            >
                <Container fluid>
                    <Navbar.Brand
                        as={Link}
                        to="/vendedor"
                        className="d-flex align-items-center text-dark"
                        style={{ fontFamily: "'Indie Flower', cursive" }}
                        onClick={handleNavClick}
                    >
                        <i className="bi-shop me-2 fs-5"></i>
                        <span className="fw-bold">Panel Vendedor</span>
                    </Navbar.Brand>

                    <Navbar.Toggle
                        aria-controls="basic-navbar-nav"
                        className="border-1 border-dark"
                        style={{ backgroundColor: 'transparent' }}
                    >
                        <i className={`bi ${expanded ? 'bi-x-lg' : 'bi-list'} fs-6 text-dark`}></i>
                    </Navbar.Toggle>

                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="w-100">
                            <div className="d-flex flex-column w-100">
                                <div className="d-flex flex-wrap justify-content-around w-100 py-2">
                                    {menuItems.map((item) => (
                                        <Nav.Link
                                            key={item.path}
                                            as={Link}
                                            to={item.path}
                                            className={`d-flex flex-column align-items-center mx-2 py-2 px-3 rounded-2 text-decoration-none ${isActive(item.path, item.exact)
                                                    ? 'bg-dark text-white shadow-sm'
                                                    : 'text-dark'
                                                }`}
                                            style={{
                                                fontFamily: "'Lato', sans-serif",
                                                fontWeight: '500',
                                                transition: 'all 0.2s ease',
                                                minWidth: '80px'
                                            }}
                                            onClick={handleNavClick}
                                        >
                                            <i className={`${item.icon} fs-5 mb-1`}></i>
                                            <small className="text-center">{item.label}</small>
                                        </Nav.Link>
                                    ))}

                                    {/* Cerrar Sesión */}
                                    <Nav.Link
                                        onClick={handleLogoutClick}
                                        className="d-flex flex-column align-items-center mx-2 py-2 px-3 rounded-2 text-decoration-none text-danger"
                                        style={{
                                            fontFamily: "'Lato', sans-serif",
                                            fontWeight: '600',
                                            transition: 'all 0.2s ease',
                                            backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                            minWidth: '80px'
                                        }}
                                    >
                                        <i className="bi-box-arrow-right fs-5 mb-1"></i>
                                        <small className="text-center">Salir</small>
                                    </Nav.Link>
                                </div>

                                {/* Información del usuario */}
                                <div className="text-center mt-2 p-2 border-top border-dark">
                                    <small className="text-muted">
                                        <i className="bi-person me-1"></i>
                                        {currentUser?.nombre || 'Vendedor'}
                                    </small>
                                </div>
                            </div>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

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

export default VendedorMobileNavbar;
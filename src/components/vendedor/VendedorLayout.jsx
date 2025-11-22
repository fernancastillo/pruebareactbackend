import React from 'react';
import { Container } from 'react-bootstrap';
import VendedorSidebar from './VendedorSidebar';
import VendedorMobileNavbar from './VendedorMobileNavbar';

const VendedorLayout = ({ children }) => {
    return (
        <div
            className="d-flex flex-column min-vh-100" // Cambiado a min-vh-100
            style={{
                backgroundImage: 'url("/src/assets/tienda/fondostardew.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed', // Esto ayuda con el scroll
                backgroundRepeat: 'no-repeat',
                fontFamily: "'Lato', sans-serif",
                minHeight: '100vh' // Asegura que siempre ocupe al menos toda la pantalla
            }}
        >
            {/* Mobile Navbar */}
            <VendedorMobileNavbar />

            {/* Contenedor principal con sidebar fijo y contenido */}
            <div className="d-flex flex-grow-1">
                {/* Sidebar para desktop - fijo */}
                <div className="d-none d-md-block">
                    <VendedorSidebar />
                </div>

                {/* Contenido principal con margen para el sidebar */}
                <div
                    className="flex-grow-1"
                    style={{
                        marginLeft: '220px', // Aumentado de 200px a 220px para más separación
                        minHeight: '100vh'
                    }}
                >
                    {/* Espacio para el navbar mobile */}
                    <div className="d-md-none" style={{ height: '70px' }}></div>

                    {/* Contenido de la página */}
                    <div className="p-4"> {/* Mantenemos el padding interno */}
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendedorLayout;
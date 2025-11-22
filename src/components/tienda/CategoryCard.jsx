import React from 'react';
import { Col, Card, Button, Badge } from 'react-bootstrap';

const CategoryCard = ({ categoria, onCategoryClick }) => {
  return (
    <Col xl={3} lg={4} md={6} className="mb-4">
      <Card
        className="h-100 category-card shadow-sm border-0"
        style={{
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backgroundColor: '#87CEEB',
          backdropFilter: 'blur(10px)',
          border: '2px solid #000000'
        }}
        onClick={() => onCategoryClick(categoria)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        }}
      >
        <Card.Body className="text-center p-4 d-flex flex-column justify-content-center">
          <Card.Title
            className="fw-bold mb-2 text-black"
            style={{
              fontFamily: "'Indie Flower', cursive",
              fontSize: '1.5rem'
            }}
          >
            {categoria.nombre}
          </Card.Title>

          <div className="mb-3">
            <Badge
              style={{
                backgroundColor: '#dedd8ff5',
                color: '#000000',
                border: 'none'
              }}
              className="fs-6 me-1"
            >
              {categoria.cantidadProductos} producto{categoria.cantidadProductos !== 1 ? 's' : ''}
            </Badge>

            {/* Mostrar badge de ofertas si hay productos en oferta */}
            {categoria.ofertasEnCategoria > 0 && (
              <Badge
                bg="danger"
                className="fs-6"
              >
                {categoria.ofertasEnCategoria} oferta{categoria.ofertasEnCategoria !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <Button
            style={{
              backgroundColor: '#dedd8ff5',
              color: '#000000',
              border: '2px solid #000000',
              fontWeight: 'bold'
            }}
            className="mt-2"
          >
            Explorar
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default CategoryCard;
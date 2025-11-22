// En src/pages/vendedor/IndexVendedor.jsx
import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const IndexVendedor = () => {
  return (
    <Container className="my-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Panel del Vendedor</h1>
          <p className="text-center">Bienvenido a tu panel de control</p>
        </Col>
      </Row>
      
      <Row>
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <Card.Title>Gestión de Productos</Card.Title>
              <Card.Text>
                Administra tus productos y stock
              </Card.Text>
              <Button as={Link} to="/admin/productos" variant="primary">
                Ver Productos
              </Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <Card.Title>Órdenes</Card.Title>
              <Card.Text>
                Revisa y gestiona las órdenes de venta
              </Card.Text>
              <Button as={Link} to="/admin/ordenes" variant="primary">
                Ver Órdenes
              </Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <Card.Title>Perfil</Card.Title>
              <Card.Text>
                Actualiza tu información personal
              </Card.Text>
              <Button as={Link} to="/admin/perfil" variant="primary">
                Mi Perfil
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default IndexVendedor;
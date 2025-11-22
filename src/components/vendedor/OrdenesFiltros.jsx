import { Card, Row, Col, Form, Button } from 'react-bootstrap';

const OrdenesFiltros = ({ filtros, onFiltroChange, onLimpiarFiltros, resultados }) => {
    return (
        <Card className="shadow-sm border-0 mb-4" style={{ backgroundColor: '#ffffff' }}> {/* Cambiado a blanco */}
            <Card.Header className="border-0 bg-transparent">
                <h6 className="m-0 fw-bold text-dark" style={{ fontFamily: "'Indie Flower', cursive" }}>
                    Filtros de Búsqueda
                </h6>
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Número de Orden</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej: SO1001"
                                name="numeroOrden"
                                value={filtros.numeroOrden}
                                onChange={onFiltroChange}
                                className="border-2 border-dark"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-semibold text-dark">RUN</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej: 20694795"
                                name="run"
                                value={filtros.run}
                                onChange={onFiltroChange}
                                className="border-2 border-dark"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Estado</Form.Label>
                            <Form.Select
                                name="estado"
                                value={filtros.estado}
                                onChange={onFiltroChange}
                                className="border-2 border-dark"
                            >
                                <option value="">Todos los estados</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Enviado">Enviado</option>
                                <option value="Entregado">Entregado</option>
                                <option value="Cancelado">Cancelado</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Fecha</Form.Label>
                            <Form.Control
                                type="date"
                                name="fecha"
                                value={filtros.fecha}
                                onChange={onFiltroChange}
                                className="border-2 border-dark"
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <div className="mt-3 d-flex justify-content-between align-items-center">
                    <Button
                        variant="outline-dark"
                        onClick={onLimpiarFiltros}
                        className="border-2 fw-semibold"
                    >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Limpiar Filtros
                    </Button>
                    <span className="text-dark fw-semibold">
                        {resultados.filtradas} de {resultados.totales} órdenes encontradas
                    </span>
                </div>
            </Card.Body>
        </Card>
    );
};

export default OrdenesFiltros;
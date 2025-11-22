import { Card, Row, Col, Form, Button } from 'react-bootstrap';

const ProductosFiltros = ({ filtros, onFiltroChange, onLimpiarFiltros, resultados, categorias }) => {
    return (
        <Card className="shadow-sm border-0 mb-4" style={{ backgroundColor: '#ffffff' }}>
            <Card.Header className="border-0 bg-transparent">
                <h6 className="m-0 fw-bold text-dark" style={{ fontFamily: "'Indie Flower', cursive" }}>
                    Filtros de Búsqueda
                </h6>
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Código</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej: PROD001"
                                name="codigo"
                                value={filtros.codigo}
                                onChange={onFiltroChange}
                                className="border-2 border-dark"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej: Laptop Gamer"
                                name="nombre"
                                value={filtros.nombre}
                                onChange={onFiltroChange}
                                className="border-2 border-dark"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Categoría</Form.Label>
                            <Form.Select
                                name="categoria"
                                value={filtros.categoria}
                                onChange={onFiltroChange}
                                className="border-2 border-dark"
                            >
                                <option value="">Todas las categorías</option>
                                {categorias.map(categoria => (
                                    <option key={categoria} value={categoria}>
                                        {categoria}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Estado de Stock</Form.Label>
                            <Form.Select
                                name="estadoStock"
                                value={filtros.estadoStock}
                                onChange={onFiltroChange}
                                className="border-2 border-dark"
                            >
                                <option value="">Todos los estados</option>
                                <option value="normal">Stock Normal</option>
                                <option value="critico">Stock Crítico</option>
                                <option value="sin-stock">Sin Stock</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mt-2">
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Precio Mínimo</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Ej: 10000"
                                name="precioMin"
                                value={filtros.precioMin}
                                onChange={onFiltroChange}
                                min="0"
                                className="border-2 border-dark"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Precio Máximo</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Ej: 500000"
                                name="precioMax"
                                value={filtros.precioMax}
                                onChange={onFiltroChange}
                                min="0"
                                className="border-2 border-dark"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Stock Mínimo</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Ej: 5"
                                name="stockMin"
                                value={filtros.stockMin}
                                onChange={onFiltroChange}
                                min="0"
                                className="border-2 border-dark"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Ordenar por</Form.Label>
                            <Form.Select
                                name="ordenarPor"
                                value={filtros.ordenarPor}
                                onChange={onFiltroChange}
                                className="border-2 border-dark"
                            >
                                <option value="nombre">Nombre (A-Z)</option>
                                <option value="nombre-desc">Nombre (Z-A)</option>
                                <option value="precio-asc">Precio (Menor a Mayor)</option>
                                <option value="precio-desc">Precio (Mayor a Menor)</option>
                                <option value="stock-asc">Stock (Menor a Mayor)</option>
                                <option value="stock-desc">Stock (Mayor a Menor)</option>
                                <option value="codigo">Código</option>
                            </Form.Select>
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
                        {resultados.filtrados} de {resultados.totales} productos encontrados
                    </span>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductosFiltros;
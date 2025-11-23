import React, { useState } from 'react';
import { Modal, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import paypalLogo from '../../assets/tienda/paypallogo.png'; 
import credito from '../../assets/tienda/credito.png';

const PaymentMethodModal = ({
    show,
    onHide,
    onMethodSelect,
    totalFinal
}) => {
    const [selectedMethod, setSelectedMethod] = useState('');

    const paymentMethods = [
        {
            id: 'paypal',
            name: 'PayPal',
            description: 'Paga rápido y seguro con tu cuenta PayPal',
            icon: (
                <img
                    src={paypalLogo}
                    alt="PayPal"
                    style={{
                        width: '120px',
                        height: 'auto',
                        maxHeight: '40px',
                        objectFit: 'contain'
                    }}
                />
            ),
            color: '#0070BA',
            recommended: true
        },
        {
            id: 'creditcard',
            name: 'Tarjeta de Crédito',
            description: 'Paga con tu tarjeta de crédito',
            icon: (
                <img
                    src={credito}
                    alt="Credito"
                    style={{
                        width: '120px',
                        height: 'auto',
                        maxHeight: '40px',
                        objectFit: 'contain'
                    }}
                />
            ),
            color: '#28a745'
        }
    ];

    const handleContinue = () => {
        if (!selectedMethod) return;
        onMethodSelect(selectedMethod);
    };

    const handleMethodSelect = (methodId) => setSelectedMethod(methodId);

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            style={{ fontFamily: "'Lato', sans-serif" }}
        >
            <Modal.Header className="border-3 border-dark" style={{ backgroundColor: '#87CEEB' }}>
                <Modal.Title className="fw-bold w-100 text-center" style={{ color: '#000000' }}>
                    <span style={{ fontFamily: "'Indie Flower', cursive", fontSize: '1.8rem' }}>
                        Seleccionar Método de Pago
                    </span>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ backgroundColor: '#87CEEB' }}>
                <div className="text-center mb-4">
                    <div className="p-3 rounded-3 border-3 border-dark d-inline-block" style={{ backgroundColor: '#90EE90', color: '#000000' }}>
                        <h5 className="fw-bold mb-1">Total a Pagar</h5>
                        <div className="fs-3 fw-bold">${totalFinal.toLocaleString('es-CL')}</div>
                    </div>
                </div>

                <Alert variant="info" className="border-3 border-dark rounded-3 mb-4" style={{ backgroundColor: '#dedd8ff5', color: '#000000', fontWeight: '600' }}>
                    <div className="text-center">
                        <strong> Recomendación:</strong> PayPal ofrece procesamiento más rápido.
                    </div>
                </Alert>

                <Row className="g-3">
                    {paymentMethods.map((method) => (
                        <Col md={6} key={method.id}>
                            <Card
                                className={`h-100 border-3 ${selectedMethod === method.id ? 'border-primary' : 'border-dark'}`}
                                style={{
                                    backgroundColor: selectedMethod === method.id ? '#e3f2fd' : '#FFFFFF',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => handleMethodSelect(method.id)}
                            >
                                <Card.Body className="text-center">
                                    <div
                                        className="mb-2 d-flex justify-content-center align-items-center"
                                        style={{
                                            height: '60px',
                                            color: method.color
                                        }}
                                    >
                                        {method.id === 'paypal' ? (
                                            method.icon
                                        ) : (
                                            <span className="display-4">{method.icon}</span>
                                        )}
                                    </div>
                                    <Card.Title className="fw-bold" style={{ color: '#000000' }}>
                                        {method.name}
                                        {method.recommended && <span className="badge bg-success ms-2">Recomendado</span>}
                                    </Card.Title>
                                    <Card.Text className="small" style={{ color: '#000000' }}>
                                        {method.description}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <div className="p-2 rounded-3 border-2 border-dark small text-center mt-4" style={{ backgroundColor: '#dedd8ff5', color: '#000000' }}>
                    🔒 Todos los métodos de pago son 100% seguros. Tus datos están protegidos.
                </div>
            </Modal.Body>

            <Modal.Footer className="border-3 border-dark" style={{ backgroundColor: '#87CEEB' }}>
                <Button
                    variant="outline-secondary"
                    onClick={onHide}
                    className="rounded-pill px-4 py-2 border-3 border-dark fw-bold"
                    style={{ backgroundColor: '#dedd8ff5', color: '#000000', minWidth: '120px' }}
                >
                    Cancelar
                </Button>
                <Button
                    variant="success"
                    onClick={handleContinue}
                    className="rounded-pill px-4 py-2 border-3 border-dark fw-bold"
                    style={{ background: 'linear-gradient(135deg, #28a745, #20c997)', color: '#FFFFFF', minWidth: '140px', border: 'none' }}
                    disabled={!selectedMethod}
                >
                    Continuar con {selectedMethod === 'paypal' ? 'PayPal' : selectedMethod === 'creditcard' ? 'Tarjeta' : ''} →
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PaymentMethodModal;
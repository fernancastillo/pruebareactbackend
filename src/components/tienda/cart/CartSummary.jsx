import React, { useState } from 'react';
import { Card, Button, Alert, Badge, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { cartService } from '../../../utils/tienda/cartService';
import CreditCardModal from '../CreditCardModal';
import PayPalModal from '../PayPalModal';
import PaymentMethodModal from '../PaymentMethodModal';

const CartSummary = ({ cartItems, total, onCheckout, user }) => {
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState('');
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);
  const [showPayPalModal, setShowPayPalModal] = useState(false);

  // Cálculos del carrito
  const hasLowStock = cartItems.some(item => {
    const stockReal = JSON.parse(localStorage.getItem('app_productos'))?.find(p => p.codigo === item.codigo)?.stock || item.stock;
    return item.cantidad > stockReal;
  });

  const isCartEmpty = cartItems.length === 0;
  const envio = cartService.calculateShipping(total);
  const hasDuocDiscount = cartService.hasDuocDiscount(user);
  const duocDiscount = hasDuocDiscount ? cartService.calculateDuocDiscount(total) : 0;
  const subtotal = total;
  const codeDiscount = appliedDiscount ? cartService.calculateDiscount(subtotal, appliedDiscount.code) : 0;
  const totalFinal = cartService.calculateFinalTotal(subtotal, envio, duocDiscount, appliedDiscount?.code);

  // Manejo de códigos de descuento
  const handleApplyDiscount = () => {
    if (!discountCode.trim()) {
      setDiscountError('Por favor ingresa un código');
      return;
    }

    const discountInfo = cartService.validateDiscountCode(discountCode);
    if (discountInfo) {
      setAppliedDiscount({ code: discountCode, info: discountInfo });
      setDiscountError('');
    } else {
      setDiscountError('Código inválido');
      setAppliedDiscount(null);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
  };

  // Flujo de pago directo
  const handleDirectPayment = () => {
    if (!user) {
      alert('🔐 Por favor inicia sesión para continuar con la compra');
      return;
    }

    if (isCartEmpty) {
      alert('🛒 Tu carrito está vacío');
      return;
    }

    if (hasLowStock) {
      alert('⚠️ Algunos productos tienen stock insuficiente. Por favor actualiza las cantidades antes de pagar.');
      return;
    }

    // Ir directamente a seleccionar método de pago
    setShowPaymentMethodModal(true);
  };

  const handlePaymentMethodSelect = (method) => {
    setShowPaymentMethodModal(false);

    if (method === 'paypal') {
      setShowPayPalModal(true);
    } else if (method === 'creditcard') {
      setShowCreditCardModal(true);
    }
  };

  const handleCreditCardSuccess = (paymentData) => {
    setShowCreditCardModal(false);
    if (onCheckout) {
      onCheckout(totalFinal, appliedDiscount?.code, { 
        ...paymentData, 
        paymentMethod: 'creditcard' 
      });
    }
  };

  const handlePayPalSuccess = (paymentData) => {
    setShowPayPalModal(false);
    if (onCheckout) {
      onCheckout(totalFinal, appliedDiscount?.code, { 
        ...paymentData, 
        paymentMethod: 'paypal' 
      });
    }
  };

  return (
    <>
      {/* Resumen del Pedido */}
      <Card 
        className="shadow-lg border-3 border-dark rounded-4" 
        style={{ 
          backgroundColor: '#87CEEB', 
          fontFamily: "'Lato', sans-serif" 
        }}
      >
        <Card.Header 
          className="border-3 border-dark rounded-top-4" 
          style={{ 
            background: 'linear-gradient(135deg, #87CEEB, #5F9EA0)' 
          }}
        >
          <h5 
            className="mb-0 text-center fw-bold" 
            style={{ 
              fontFamily: "'Indie Flower', cursive", 
              color: '#000000', 
              fontSize: '1.5rem' 
            }}
          >
            Resumen del Pedido
          </h5>
        </Card.Header>
        
        <Card.Body>
          {/* Alertas informativas */}
          {hasLowStock && (
            <Alert 
              variant="warning" 
              className="small border-3 border-dark rounded-3" 
              style={{ 
                backgroundColor: '#dedd8ff5', 
                color: '#000000', 
                fontWeight: '600' 
              }}
            >
              ⚠️ Revisa el stock de algunos productos antes de pagar
            </Alert>
          )}
          
          {hasDuocDiscount && (
            <Alert 
              variant="info" 
              className="small border-3 border-dark rounded-3" 
              style={{ 
                backgroundColor: '#90EE90', 
                color: '#000000', 
                fontWeight: '600' 
              }}
            >
              🎓 Descuento DUOC 20% aplicado
            </Alert>
          )}

          {/* Código de descuento */}
          <div className="mb-3">
            <label 
              className="form-label fw-bold mb-2" 
              style={{ color: '#000000' }}
            >
              Código de Descuento
            </label>
            
            {!appliedDiscount ? (
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Ingresa código ej: SV2500"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  className="border-3 border-dark fw-bold"
                  style={{ 
                    color: '#000000', 
                    backgroundColor: '#FFFFFF' 
                  }}
                  onKeyPress={(e) => { 
                    if (e.key === 'Enter') handleApplyDiscount(); 
                  }}
                />
                <Button 
                  variant="outline-dark" 
                  className="border-3 border-dark fw-bold" 
                  style={{ 
                    backgroundColor: '#dedd8ff5', 
                    color: '#000000' 
                  }} 
                  onClick={handleApplyDiscount}
                >
                  Aplicar
                </Button>
              </InputGroup>
            ) : (
              <div 
                className="d-flex justify-content-between align-items-center p-2 rounded-3 border-3 border-success" 
                style={{ 
                  backgroundColor: '#90EE90', 
                  color: '#000000' 
                }}
              >
                <div>
                  <Badge 
                    bg="success" 
                    className="me-2 border-2 border-dark" 
                    style={{ 
                      backgroundColor: '#28a745', 
                      color: '#FFFFFF' 
                    }}
                  >
                    ✅
                  </Badge>
                  <span className="fw-bold">{appliedDiscount.code}</span>
                </div>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  className="border-2 border-dark" 
                  style={{ 
                    backgroundColor: '#dedd8ff5', 
                    color: '#000000' 
                  }} 
                  onClick={handleRemoveDiscount}
                >
                  ✕
                </Button>
              </div>
            )}
            
            {discountError && (
              <div className="text-danger small mt-1 fw-bold">
                {discountError}
              </div>
            )}
          </div>

          {/* Desglose de precios */}
          <div className="d-flex justify-content-between mb-2 fw-semibold" style={{ color: '#000000' }}>
            <span>Productos ({cartItems.reduce((sum, item) => sum + item.cantidad, 0)})</span>
            <span>${subtotal.toLocaleString('es-CL')}</span>
          </div>
          
          {hasDuocDiscount && (
            <div className="d-flex justify-content-between mb-2 fw-semibold" style={{ color: '#000000' }}>
              <span>Descuento DUOC</span>
              <span style={{ color: '#FF6B6B' }}>
                -${duocDiscount.toLocaleString('es-CL')}
              </span>
            </div>
          )}
          
          {appliedDiscount && (
            <div className="d-flex justify-content-between mb-2 fw-semibold" style={{ color: '#000000' }}>
              <span>Descuento {appliedDiscount.code}</span>
              <span style={{ color: '#FF6B6B' }}>
                -${codeDiscount.toLocaleString('es-CL')}
              </span>
            </div>
          )}
          
          <div className="d-flex justify-content-between mb-2 fw-semibold" style={{ color: '#000000' }}>
            <span>Envío</span>
            <span>
              {envio === 0 ? 'Gratis' : `$${envio.toLocaleString('es-CL')}`}
            </span>
          </div>
          
          <hr style={{ 
            borderColor: '#000000', 
            opacity: '0.6', 
            borderWidth: '2px' 
          }} />
          
          <div 
            className="d-flex justify-content-between mb-3 fw-bold" 
            style={{ 
              fontSize: '1.2rem', 
              color: '#000000' 
            }}
          >
            <strong>Total Final</strong>
            <strong>${totalFinal.toLocaleString('es-CL')}</strong>
          </div>

          {/* Información para usuarios no logueados */}
          {!user && (
            <Alert 
              variant="info" 
              className="small border-3 border-dark rounded-3" 
              style={{ 
                backgroundColor: '#dedd8ff5', 
                color: '#000000', 
                fontWeight: '600' 
              }}
            >
              🔐 Inicia sesión para proceder con la compra
            </Alert>
          )}

          {/* Botones de acción */}
          <div className="d-grid gap-2">
            <Button
              variant="success"
              size="lg"
              className="border-3 border-dark rounded-pill fw-bold py-3"
              style={{ 
                background: 'linear-gradient(135deg, #28a745, #20c997)', 
                color: '#FFFFFF', 
                transition: 'all 0.3s ease', 
                border: 'none',
                fontSize: '1.1rem'
              }}
              onClick={handleDirectPayment}
              disabled={isCartEmpty || !user || hasLowStock}
              onMouseEnter={(e) => {
                if (!isCartEmpty && user && !hasLowStock) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isCartEmpty && user && !hasLowStock) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {!user ? '🔐 Inicia Sesión para Pagar' :
               hasLowStock ? '⚠️ Revisa Stock Antes de Pagar' :
               isCartEmpty ? '🛒 Carrito Vacío' :
               `💳 Pagar Ahora - $${totalFinal.toLocaleString('es-CL')}`}
            </Button>
            
            {isCartEmpty && (
              <Button 
                as={Link} 
                to="/productos" 
                variant="outline-dark" 
                className="rounded-pill fw-bold py-2 border-3" 
                style={{ 
                  backgroundColor: '#dedd8ff5', 
                  color: '#000000' 
                }}
              >
                🛍️ Seguir Comprando
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Modales de pago */}
      <PaymentMethodModal 
        show={showPaymentMethodModal} 
        onHide={() => setShowPaymentMethodModal(false)} 
        onMethodSelect={handlePaymentMethodSelect} 
        totalFinal={totalFinal} 
      />
      
      <CreditCardModal 
        show={showCreditCardModal} 
        onHide={() => setShowCreditCardModal(false)} 
        onPaymentSuccess={handleCreditCardSuccess} 
        totalFinal={totalFinal} 
        discountCode={appliedDiscount?.code} 
      />
      
      <PayPalModal 
        show={showPayPalModal} 
        onHide={() => setShowPayPalModal(false)} 
        amount={totalFinal} 
        onPaymentSuccess={handlePayPalSuccess} 
      />
    </>
  );
};

export default CartSummary;
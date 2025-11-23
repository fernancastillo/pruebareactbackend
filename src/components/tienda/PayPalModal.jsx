import React, { useEffect, useRef, useState } from "react";
import { Modal, Spinner, Alert, Button } from "react-bootstrap";
import { loadPayPalSDK, initializePayPalButtons } from "../../utils/tienda/paypalService";

const PayPalModal = ({ show, onHide, amount = 0, onPaymentSuccess }) => {
  const paypalRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!show) {
      // Resetear estado cuando el modal se cierra
      setError(null);
      setLoading(true);
      return;
    }

    let isMounted = true;
    let paypalButtons = null;

    const initializePayPal = async () => {
      try {
        setLoading(true);
        setError(null);

        // Limpiar contenedor
        if (paypalRef.current) {
          paypalRef.current.innerHTML = "";
          paypalRef.current.style.minHeight = "200px";
        }

        // Pequeño delay para asegurar que el DOM esté listo
        await new Promise(resolve => setTimeout(resolve, 300));

        // Cargar SDK
        await loadPayPalSDK();

        if (!isMounted || !paypalRef.current) return;

        // Inicializar botones
        paypalButtons = initializePayPalButtons(paypalRef.current, {
          amount: amount,
          onSuccess: (details) => {
            console.log("✅ Pago exitoso:", details);
            if (onPaymentSuccess) onPaymentSuccess(details);
            onHide();
          },
          onError: (err) => {
            console.error("❌ Error PayPal:", err);
            setError(`Error en el pago: ${err.message || 'Por favor intenta nuevamente'}`);
          },
          onCancel: () => {
            setError("Pago cancelado. Puedes intentar nuevamente cuando lo desees.");
          }
        });

        // Verificar si los botones se renderizaron
        setTimeout(() => {
          if (isMounted && paypalRef.current && paypalRef.current.children.length === 0) {
            console.warn("⚠️ Los botones de PayPal no se renderizaron");
            setError("Los botones de pago no se cargaron. Por favor, intenta recargar.");
          }
        }, 2000);

      } catch (err) {
        console.error("❌ Error inicializando PayPal:", err);
        if (isMounted) {
          setError(`Error al cargar PayPal: ${err.message || 'Verifica tu conexión a internet'}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializePayPal();

    return () => {
      isMounted = false;
      // Limpiar botones al desmontar
      if (paypalRef.current) {
        paypalRef.current.innerHTML = "";
      }
    };
  }, [show, amount, onPaymentSuccess, onHide, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setLoading(true);
  };

  const handleClose = () => {
    setError(null);
    setLoading(true);
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      size="lg"
      backdrop="static"
    >
      <Modal.Header closeButton className="border-3 border-dark" style={{ backgroundColor: '#87CEEB' }}>
        <Modal.Title className="fw-bold" style={{ color: '#000000' }}>
          <span style={{ fontFamily: "'Indie Flower', cursive" }}>
            Pago con PayPal
          </span>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="text-center" style={{ backgroundColor: '#87CEEB', minHeight: '300px' }}>
        <div className="mb-3">
          <h5 style={{ color: '#000000' }}>Total a pagar: <strong>${amount.toFixed(2)} USD</strong></h5>
        </div>

        {error && (
          <Alert variant="danger" className="border-3 border-dark">
            <div className="fw-bold">{error}</div>
            <Button 
              variant="outline-danger" 
              size="sm" 
              className="mt-2"
              onClick={handleRetry}
            >
              🔄 Reintentar
            </Button>
          </Alert>
        )}

        {loading && !error && (
          <div className="d-flex flex-column align-items-center justify-content-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 mb-0" style={{ color: '#000000' }}>Cargando PayPal...</p>
          </div>
        )}

        {/* Contenedor de PayPal - CRÍTICO */}
        <div 
          ref={paypalRef} 
          id="paypal-button-container"
          style={{ 
            minHeight: '200px',
            display: loading ? 'none' : 'block'
          }}
        />
        
        {!loading && !error && paypalRef.current && paypalRef.current.children.length === 0 && (
          <Alert variant="warning" className="mt-3">
            <small>Si no ves los botones de PayPal, recarga la página o intenta en otro navegador.</small>
          </Alert>
        )}
      </Modal.Body>
      
      <Modal.Footer className="border-3 border-dark" style={{ backgroundColor: '#87CEEB' }}>
        <Button 
          variant="secondary" 
          onClick={handleClose}
          className="rounded-pill px-4 py-2 border-3 border-dark fw-bold"
          style={{ backgroundColor: '#dedd8ff5', color: '#000000' }}
        >
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PayPalModal;
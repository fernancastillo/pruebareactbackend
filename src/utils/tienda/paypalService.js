// paypalService.js - VERSIÓN MEJORADA
export const PAYPAL_CLIENT_ID = "Aaw7pZ4FqgDTjGxyGsh3RJjG0Uyi3n8PVmaYD-sEOC0i4UyMyRLF4Axfr9SzDTwv_IluN7-DQD9pramB";

let paypalSDKLoadingPromise = null;

export const loadPayPalSDK = () => {
  // Si ya está cargado, retornar inmediatamente
  if (window.paypal) {
    return Promise.resolve(window.paypal);
  }

  // Si ya está en proceso de carga, retornar esa promesa
  if (paypalSDKLoadingPromise) {
    return paypalSDKLoadingPromise;
  }

  paypalSDKLoadingPromise = new Promise((resolve, reject) => {
    // Limpiar scripts anteriores de PayPal
    const existingScripts = document.querySelectorAll('script[src*="paypal.com/sdk/js"]');
    existingScripts.forEach(script => script.remove());

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
    script.async = true;
    script.setAttribute('data-sdk-integration-source', 'button-factory');

    script.onload = () => {
      console.log("✅ PayPal SDK cargado correctamente");
      if (window.paypal) {
        resolve(window.paypal);
      } else {
        reject(new Error("PayPal no está disponible en window"));
      }
    };

    script.onerror = (error) => {
      console.error("❌ Error cargando PayPal SDK:", error);
      paypalSDKLoadingPromise = null;
      reject(new Error("No se pudo cargar el SDK de PayPal"));
    };

    // Agregar al head en lugar del body para mejor compatibilidad
    document.head.appendChild(script);
  });

  return paypalSDKLoadingPromise;
};

export const initializePayPalButtons = (container, { amount, onSuccess, onError, onCancel }) => {
  if (!window.paypal) {
    onError("PayPal SDK no está disponible");
    return;
  }

  if (!container) {
    onError("Contenedor de PayPal no encontrado");
    return;
  }

  // Limpiar contenedor completamente
  container.innerHTML = "";
  container.style.minHeight = "200px";
  container.style.display = "block";

  try {
    return window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
        height: 48
      },
      
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: amount.toFixed(2),
                currency_code: "USD"
              },
              description: "Compra en Junimo Store"
            },
          ],
          application_context: {
            shipping_preference: "NO_SHIPPING"
          }
        });
      },

      onApprove: async (data, actions) => {
        try {
          console.log("📦 Orden aprobada, capturando pago...", data);
          const details = await actions.order.capture();
          console.log("✅ Pago capturado exitosamente:", details);
          onSuccess(details);
        } catch (err) {
          console.error("❌ Error capturando pago:", err);
          onError(err);
        }
      },

      onError: (err) => {
        console.error("❌ Error en botones PayPal:", err);
        onError(err);
      },

      onCancel: (data) => {
        console.log("⚠️ Pago cancelado por el usuario:", data);
        onCancel(data);
      },

      onInit: (data, actions) => {
        console.log("✅ Botones PayPal inicializados correctamente");
      }

    }).render(container);
  } catch (error) {
    console.error("❌ Error renderizando botones PayPal:", error);
    onError(error);
  }
};
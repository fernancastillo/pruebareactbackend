// src/utils/vendedor/boletaUtils.js
import { formatCurrency, formatDate } from './dashboardUtils';

/**
 * Función auxiliar para descargar archivos
 */
const descargarArchivo = (contenido, nombreArchivo, tipoMIME) => {
    try {
        const blob = new Blob([contenido], { type: tipoMIME });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error al descargar archivo:', error);
        throw new Error('No se pudo descargar el archivo');
    }
};

/**
 * Genera HTML simple para la boleta (versión vendedor - solo lectura)
 */
const generarHTMLBoleta = (orden) => {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boleta ${orden.numeroOrden} - Junimo Store</title>
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            margin: 20px; 
            color: #333;
            line-height: 1.4;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #4CAF50; 
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .store-name { 
            color: #4CAF50; 
            font-size: 24px; 
            font-weight: bold;
            margin: 0;
        }
        .store-subtitle {
            color: #666;
            font-size: 14px;
            margin: 5px 0;
        }
        .boleta-info { 
            margin: 15px 0; 
            background: #f9f9f9; 
            padding: 15px; 
            border-radius: 5px;
        }
        .info-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 5px 0;
        }
        .info-label { 
            font-weight: bold; 
            color: #555;
        }
        .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
        }
        .table th { 
            background: #4CAF50; 
            color: white; 
            padding: 10px; 
            text-align: left;
        }
        .table td { 
            padding: 10px; 
            border-bottom: 1px solid #ddd;
        }
        .table tr:nth-child(even) { 
            background: #f9f9f9;
        }
        .total { 
            text-align: right; 
            font-size: 18px; 
            font-weight: bold; 
            margin-top: 20px;
            color: #4CAF50;
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            color: #666; 
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }
        .estado-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12px;
        }
        .estado-pendiente { background-color: #ffeaa7; color: #000; }
        .estado-enviado { background-color: #a3e1f4; color: #000; }
        .estado-entregado { background-color: #a3e4a3; color: #000; }
        .estado-cancelado { background-color: #f8a4a4; color: #000; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="store-name">JUNIMO STORE</h1>
        <p class="store-subtitle">Tienda Oficial de Stardew Valley</p>
    </div>
    
    <div class="boleta-info">
        <h2>BOLETA ELECTRÓNICA</h2>
        <div class="info-row">
            <span class="info-label">Número de Orden:</span>
            <span>${orden.numeroOrden}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Fecha:</span>
            <span>${formatDate(orden.fecha)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">RUN Cliente:</span>
            <span>${orden.run}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Estado:</span>
            <span class="estado-badge estado-${orden.estadoEnvio?.toLowerCase()}">${orden.estadoEnvio}</span>
        </div>
    </div>

    <h3>DETALLES DE PRODUCTOS</h3>
    <table class="table">
        <thead>
            <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
            ${orden.productos.map(producto => `
                <tr>
                    <td>${producto.codigo}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.cantidad}</td>
                    <td>${formatCurrency(producto.precio)}</td>
                    <td>${formatCurrency(producto.precio * producto.cantidad)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="total">
        TOTAL: ${formatCurrency(orden.total)}
    </div>

    <div class="footer">
        <p>¡Gracias por su compra en Junimo Store!</p>
        <p>Boleta generada el ${new Date().toLocaleDateString('es-CL')} - VERSIÓN VENDEDOR</p>
        <p><em>Esta boleta es de solo lectura para fines de consulta</em></p>
    </div>
</body>
</html>
  `.trim();
};

/**
 * Genera una boleta en formato HTML que se puede imprimir (VERSIÓN VENDEDOR)
 */
export const generarBoletaOrden = (orden) => {
    try {
        const contenidoHTML = generarHTMLBoleta(orden);
        descargarArchivo(contenidoHTML, `boleta_${orden.numeroOrden}.html`, 'text/html');
        return true;
    } catch (error) {
        console.error('Error al generar boleta HTML:', error);
        throw new Error('No se pudo generar la boleta en formato HTML');
    }
};

/**
 * Genera boleta en formato CSV (VERSIÓN VENDEDOR)
 */
export const generarBoletaCSV = (orden) => {
    try {
        const headers = [
            'JUNIMO STORE - BOLETA ELECTRÓNICA (VENDEDOR)',
            `Número: ${orden.numeroOrden}`,
            `Fecha: ${formatDate(orden.fecha)}`,
            `RUN Cliente: ${orden.run}`,
            `Estado: ${orden.estadoEnvio}`,
            ''
        ];

        const productosHeaders = ['Código', 'Producto', 'Cantidad', 'Precio Unitario', 'Subtotal'];

        const productosRows = orden.productos.map(producto => [
            producto.codigo,
            `"${producto.nombre}"`,
            producto.cantidad,
            formatCurrency(producto.precio),
            formatCurrency(producto.precio * producto.cantidad)
        ]);

        const totalRow = ['', '', '', 'TOTAL:', formatCurrency(orden.total)];
        const footer = [
            '',
            '¡Gracias por su compra en Junimo Store!',
            'Tienda Oficial de Stardew Valley',
            `Boleta generada el ${new Date().toLocaleDateString('es-CL')}`,
            'VERSIÓN VENDEDOR - SOLO LECTURA'
        ];

        const contenido = [
            ...headers,
            'DETALLES DE PRODUCTOS:',
            productosHeaders.join(','),
            ...productosRows.map(row => row.join(',')),
            totalRow.join(','),
            ...footer
        ].join('\n');

        descargarArchivo('\uFEFF' + contenido, `boleta_${orden.numeroOrden}.csv`, 'text/csv;charset=utf-8');
        return true;
    } catch (error) {
        console.error('Error al generar boleta CSV:', error);
        throw new Error('No se pudo generar la boleta en formato CSV');
    }
};

/**
 * Genera boleta en formato de texto plano (VERSIÓN VENDEDOR)
 */
export const generarBoletaTexto = (orden) => {
    try {
        const contenido = `
JUNIMO STORE - VERSIÓN VENDEDOR
Tienda Oficial de Stardew Valley
=================================

BOLETA ELECTRÓNICA (SOLO LECTURA)
N°: ${orden.numeroOrden}
Fecha: ${formatDate(orden.fecha)}
RUN Cliente: ${orden.run}
Estado: ${orden.estadoEnvio}

DETALLES DE PRODUCTOS:
${orden.productos.map(producto =>
            `• ${producto.codigo} - ${producto.nombre}
   Cantidad: ${producto.cantidad} x ${formatCurrency(producto.precio)} = ${formatCurrency(producto.precio * producto.cantidad)}`
        ).join('\n\n')}

=================================
TOTAL: ${formatCurrency(orden.total)}

¡Gracias por su compra en Junimo Store!
Boleta generada el ${new Date().toLocaleDateString('es-CL')}
VERSIÓN VENDEDOR - SOLO CONSULTA
    `.trim();

        descargarArchivo(contenido, `boleta_${orden.numeroOrden}.txt`, 'text/plain');
        return true;
    } catch (error) {
        console.error('Error al generar boleta texto:', error);
        throw new Error('No se pudo generar la boleta en formato texto');
    }
};
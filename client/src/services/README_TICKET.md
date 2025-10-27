# TicketService - Servicio de Impresión de Facturas

Este servicio genera facturas autoimpresoras en formato PDF optimizado para impresoras térmicas de 50mm.

## Características

- ✅ Formato optimizado para impresoras térmicas de 50mm
- ✅ Generación automática de PDF con jsPDF
- ✅ Auto-impresión al generar el ticket
- ✅ Soporte para múltiples items
- ✅ Cálculo automático de IVA (10%, 5% y exento)
- ✅ Formato de números con separadores de miles (estilo Paraguay)
- ✅ Manejo de textos largos con división automática

## Estructura del Ticket

El ticket sigue el formato estándar de facturas paraguayas e incluye:

1. **Encabezado de la Empresa**
   - Nombre de fantasía (negrita, centrado)
   - Empresa contable (cursiva, centrado)
   - RUC
   - Dirección
   - Teléfono
   - Rubro

2. **Información del Cliente**
   - Fecha/Hora de la venta
   - Nombre del cliente
   - RUC del cliente
   - Dirección del cliente
   - Teléfono del cliente
   - Vendedor

3. **Información de la Venta**
   - Forma de venta
   - Tipo de factura (negrita)
   - Timbrado
   - Fecha inicio de vigencia

4. **Número de Factura**
   - Formato: dsuc_dcaja_factura

5. **Detalle de Items**
   - Código
   - Cantidad
   - Mercadería
   - Precio unitario
   - Porcentaje de IVA
   - Subtotal

6. **Totales**
   - Total general

7. **Liquidación del IVA**
   - Gravadas 10%
   - Gravadas 5%
   - Exenta
   - I.V.A. 10%
   - I.V.A. 5%
   - Total I.V.A.

## Uso

### Importar el servicio

```typescript
import ticketService from './services/ticketService';
import type { DatosFactura } from './types/ticket.types';
```

### Preparar los datos

```typescript
const datosFactura: DatosFactura = {
    // Datos de la empresa
    nombreFantasia: "Mi Empresa S.A.",
    empresaContable: "Empresa Contable",
    ruc: "80012345-6",
    direccion: "Av. Principal 1234, Asunción",
    telefono: "021-123456",
    rubro: "Comercio al por menor",

    // Datos de la venta
    fechaHora: new Date(),
    cliente: "Cliente Ejemplo",
    rucCliente: "80098765-4",
    direccionCliente: "Calle Secundaria 567",
    telefonoCliente: "021-654321",
    vendedor: "Juan Pérez",
    formaVenta: "Contado",
    tipoFactura: "Contado",
    timbrado: "12345678",
    fechaInicioVigencia: new Date("2024-01-01"),
    nroFactura: "001-001-0000123",

    // Items
    items: [
        {
            codigo: 1001,
            mercaderia: "Producto A",
            precio: 50000,
            cantidad: 2,
            porcentajeImpuesto: 10,
            subtotal: 100000
        }
    ],

    // Totales
    total: 100000,
    gravada10: 100000,
    gravada5: 0,
    exenta: 0,
    iva10: 9091,
    iva5: 0,
    totalIva: 9091
};
```

### Generar el ticket

```typescript
async function imprimirFactura() {
    try {
        await ticketService.generarTicket(datosFactura);
        console.log('Ticket generado exitosamente');
    } catch (error) {
        console.error('Error al generar el ticket:', error);
    }
}
```

### Uso en un componente React

```typescript
import { useState } from 'react';
import ticketService from './services/ticketService';
import type { DatosFactura } from './types/ticket.types';

function FacturaComponent() {
    const [loading, setLoading] = useState(false);

    const handleImprimir = async () => {
        setLoading(true);
        try {
            const datos: DatosFactura = {
                // ... tus datos aquí
            };
            
            await ticketService.generarTicket(datos);
            alert('Ticket generado exitosamente');
        } catch (error) {
            console.error('Error:', error);
            alert('Error al generar el ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button onClick={handleImprimir} disabled={loading}>
            {loading ? 'Generando...' : 'Imprimir Factura'}
        </button>
    );
}
```

## Cálculo del IVA

Para calcular correctamente los valores de IVA:

```typescript
// IVA 10%
const iva10 = gravada10 / 11;

// IVA 5%
const iva5 = gravada5 / 21;

// Total IVA
const totalIva = iva10 + iva5;
```

## Notas Importantes

1. **Formato de números**: El servicio usa el formato paraguayo (es-PY) con separadores de miles.

2. **Ancho del ticket**: El ticket está optimizado para 50mm de ancho.

3. **Auto-impresión**: Al generar el ticket, se abre automáticamente una ventana del navegador con el diálogo de impresión.

4. **Textos largos**: Los textos que exceden el ancho disponible se dividen automáticamente en múltiples líneas.

5. **Tipos de datos**: 
   - RUC y timbrado son strings (no números)
   - Fechas son objetos Date
   - Precios y totales son números

## Ejemplo Completo

Ver el archivo `ticketService.example.ts` para un ejemplo completo de uso.

## Dependencias

- **jsPDF**: Librería para generación de PDFs (ya instalada en el proyecto)

## Mantenimiento

Para modificar el formato del ticket, edita los métodos privados en `ticketService.ts`:

- `dibujarEncabezado()`: Encabezado de la empresa
- `dibujarInfoCliente()`: Información del cliente
- `dibujarInfoVenta()`: Información de la venta
- `dibujarNumeroFactura()`: Número de factura
- `dibujarEncabezadoTabla()`: Encabezado de la tabla de items
- `dibujarItems()`: Items de la factura
- `dibujarTotales()`: Total general
- `dibujarLiquidacionIVA()`: Liquidación del IVA

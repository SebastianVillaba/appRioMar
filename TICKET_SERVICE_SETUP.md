# Configuración del Servicio de Tickets (TicketService)

## ✅ Instalación Completada

El servicio de generación de tickets para facturas autoimpresoras ha sido implementado exitosamente en el proyecto.

## 📁 Archivos Creados

### Servicios y Tipos
- ✅ `client/src/services/ticketService.ts` - Servicio principal de generación de tickets
- ✅ `client/src/types/ticket.types.ts` - Tipos TypeScript actualizados
- ✅ `client/src/services/index.ts` - Exportaciones centralizadas

### Utilidades
- ✅ `client/src/utils/facturaCalculos.ts` - Funciones de cálculo de IVA y totales

### Componentes y Hooks
- ✅ `client/src/components/ImprimirFacturaButton.tsx` - Componente botón para imprimir
- ✅ `client/src/hooks/useTicketService.ts` - Hook personalizado con manejo de estado

### Ejemplos
- ✅ `client/src/services/ticketService.example.ts` - Ejemplo básico de uso
- ✅ `client/src/examples/FacturaCompleteExample.tsx` - Ejemplo completo con UI

### Documentación
- ✅ `client/src/services/README_TICKET.md` - Documentación completa del servicio

## 🚀 Uso Rápido

### Opción 1: Uso directo del servicio

```typescript
import ticketService from './services/ticketService';
import { crearDatosFactura, generarNumeroFactura } from './utils/facturaCalculos';

const datosFactura = crearDatosFactura({
    nombreFantasia: "Mi Empresa",
    empresaContable: "Empresa S.A.",
    ruc: "80012345-6",
    // ... otros datos
    items: [
        {
            codigo: 1001,
            mercaderia: "Producto A",
            precio: 50000,
            cantidad: 2,
            porcentajeImpuesto: 10,
            subtotal: 100000
        }
    ]
});

await ticketService.generarTicket(datosFactura);
```

### Opción 2: Uso con el hook personalizado

```typescript
import { useTicketService } from './hooks/useTicketService';

function MiComponente() {
    const { generarTicket, loading, error } = useTicketService();

    const handleImprimir = async () => {
        await generarTicket(datosFactura);
    };

    return (
        <button onClick={handleImprimir} disabled={loading}>
            {loading ? 'Generando...' : 'Imprimir'}
        </button>
    );
}
```

### Opción 3: Uso del componente botón

```typescript
import ImprimirFacturaButton from './components/ImprimirFacturaButton';

function MiComponente() {
    return (
        <ImprimirFacturaButton 
            datosFactura={datosFactura}
            variant="contained"
            color="primary"
        />
    );
}
```

## 📋 Características Implementadas

✅ **Formato de 50mm** - Optimizado para impresoras térmicas
✅ **Cálculo automático de IVA** - 10%, 5% y exento
✅ **Formato paraguayo** - Números con separadores de miles
✅ **Auto-impresión** - Abre automáticamente el diálogo de impresión
✅ **Manejo de textos largos** - División automática en múltiples líneas
✅ **TypeScript completo** - Tipos seguros en todo el código
✅ **Componentes React** - Listos para usar con Material-UI
✅ **Hooks personalizados** - Con manejo de estado y errores

## 🎨 Formato del Ticket

El ticket incluye todas las secciones requeridas según las imágenes de Crystal Report:

1. **Encabezado de la Empresa**
   - Nombre de fantasía (negrita, centrado)
   - Empresa contable (cursiva, centrado)
   - RUC, Dirección, Teléfono, Rubro

2. **Información del Cliente**
   - Fecha/Hora
   - Cliente, RUC, Dirección, Teléfono
   - Vendedor

3. **Información de la Venta**
   - Forma de venta
   - Tipo de factura (negrita)
   - Timbrado
   - Fecha inicio vigencia

4. **Número de Factura**
   - Formato: dsuc_dcaja_factura

5. **Tabla de Items**
   - Código, Cantidad, Mercadería
   - Precio unitario, IVA%, Subtotal

6. **Totales**
   - Total general en Guaraníes

7. **Liquidación del IVA**
   - Gravadas 10%, 5%, Exenta
   - I.V.A. 10%, 5%
   - Total I.V.A.

## 🔧 Dependencias

- **jsPDF** (v3.0.3) - Ya instalada ✅

No se requieren instalaciones adicionales.

## 📖 Documentación Adicional

Para más detalles, consulta:
- `client/src/services/README_TICKET.md` - Documentación completa
- `client/src/services/ticketService.example.ts` - Ejemplo básico
- `client/src/examples/FacturaCompleteExample.tsx` - Ejemplo con UI completa

## 🧪 Prueba del Servicio

Para probar el servicio, puedes:

1. **Importar el ejemplo en tu componente:**
```typescript
import { generarTicketEjemplo } from './services/ticketService.example';

// Llamar la función
generarTicketEjemplo();
```

2. **Usar el componente de ejemplo:**
```typescript
import FacturaCompleteExample from './examples/FacturaCompleteExample';

// Renderizar el componente
<FacturaCompleteExample />
```

## 💡 Consejos de Uso

1. **Cálculos automáticos**: Usa `crearDatosFactura()` para calcular automáticamente los totales de IVA
2. **Números de factura**: Usa `generarNumeroFactura(sucursal, caja, numero)` para formato estándar
3. **Formateo de moneda**: Usa `formatearMoneda(monto)` para mostrar valores en la UI
4. **Manejo de errores**: Usa el hook `useTicketService` para manejo automático de errores

## 🎯 Próximos Pasos

1. Integra el servicio en tus componentes de venta
2. Personaliza los estilos del ticket según tus necesidades
3. Configura tu impresora térmica para el formato de 50mm
4. Prueba la impresión con datos reales

## 📞 Soporte

Si encuentras algún problema o necesitas personalizar el formato del ticket, 
revisa el código en `ticketService.ts` y ajusta los métodos privados según tus necesidades.

---

**Estado**: ✅ Implementación Completa
**Fecha**: Octubre 2025
**Versión**: 1.0.0

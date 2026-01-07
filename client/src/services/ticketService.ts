import type { ItemFactura, DatosFactura } from "../types/ticket.types";
import jsPDF from "jspdf";

class TicketService {

    private readonly ANCHO_TICKET = 80 // Ancho del ticket para impresoras térmicas de 80mm
    private readonly MARGEN_IZQ = 2 // Margen izquierdo en mm
    private readonly MARGEN_DER = 2 // Margen derecho en mm
    private posY = 8 // Posición Y inicial

    // Posiciones de columnas para la tabla de items (optimizado para 80mm)
    private readonly COL_CANT = 4      // Columna Cantidad
    private readonly COL_DESC = 12     // Columna Descripción  
    private readonly COL_PRECIO = 48   // Columna Precio Unitario
    private readonly COL_IVA = 62      // Columna % IVA
    private readonly COL_SUBTOTAL = 78 // Columna Subtotal (alineado derecha)

    /**
     * Generar la factura para impresora térmica 80mm e imprime automaticamente
     */

    public async generarTicket(datos: DatosFactura): Promise<void> {
        // Calcular altura estimada del documento
        const alturaEstimada = this.calcularAlturaDocumento(datos);

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [this.ANCHO_TICKET, alturaEstimada]
        });

        this.posY = 8;

        // Dibujar el encabezado
        this.dibujarEncabezado(doc, datos);

        // Dibujar información del cliente
        this.dibujarInfoCliente(doc, datos);

        // Dibujar información de la venta
        this.dibujarInfoVenta(doc, datos);

        // Dibujar número de factura
        this.dibujarNumeroFactura(doc, datos);

        // Dibujar encabezado de tabla de items
        this.dibujarEncabezadoTabla(doc);

        // Dibujar items
        this.dibujarItems(doc, datos.items);

        // Dibujar totales
        this.dibujarTotales(doc, datos);

        // Dibujar liquidación del IVA
        this.dibujarLiquidacionIVA(doc, datos);

        // Pie de página
        this.dibujarPiePagina(doc);

        // Abrir el PDF en una nueva ventana para imprimir
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    }

    /**
     * Calcula la altura estimada del documento basado en el contenido
     */
    private calcularAlturaDocumento(datos: DatosFactura): number {
        let altura = 80; // Base para encabezado, info cliente, info venta
        altura += datos.items.length * 12; // Estimado por item
        altura += 85; // Totales, IVA y pie de página
        return Math.max(altura, 150); // Mínimo 150mm
    }

    /**
     * Dibuja el encabezado del reporte
     */
    private dibujarEncabezado(doc: jsPDF, datos: DatosFactura): void {
        const centroX = this.ANCHO_TICKET / 2;

        // Nombre fantasia - negrita, grande y centrado
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        const nombreFantasia = this.truncarTexto(datos.nombreFantasia, 40);
        doc.text(nombreFantasia, centroX, this.posY, { align: 'center' });
        this.posY += 5;

        // Empresa contable - cursiva y centrado
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        const empresaContable = this.truncarTexto(datos.empresaContable, 45);
        doc.text(empresaContable, centroX, this.posY, { align: 'center' });
        this.posY += 6;

        // RUC - centrado y destacado
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`RUC: ${datos.ruc}`, centroX, this.posY, { align: 'center' });
        this.posY += 5;

        // Dirección    
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        const lineasDireccion = this.dividirTexto(datos.direccion, 45);
        for (const linea of lineasDireccion) {
            doc.text(linea, centroX, this.posY, { align: 'center' });
            this.posY += 4;
        }

        // Teléfono
        doc.text(`Tel.: ${datos.telefono}`, centroX, this.posY, { align: 'center' });
        this.posY += 4;

        // Rubro
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        doc.text(datos.rubro, centroX, this.posY, { align: 'center' });
        this.posY += 5;

        // Línea separadora doble para encabezado
        this.dibujarLineaDoble(doc);
    }


    /**
     * Dibuja la información del cliente
    */
    private dibujarInfoCliente(doc: jsPDF, datos: DatosFactura): void {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        // Fecha/Hora - alineado a la izquierda
        const fechaFormateada = this.formatearFecha(datos.fechaHora);
        doc.text(`Fecha: ${fechaFormateada}`, this.MARGEN_IZQ, this.posY);
        this.posY += 4;

        // Cliente con etiqueta en negrita
        doc.setFont("helvetica", "bold");
        doc.text('Cliente:', this.MARGEN_IZQ, this.posY);
        doc.setFont("helvetica", "normal");
        const lineasCliente = this.dividirTexto(datos.cliente, 55);
        doc.text(lineasCliente[0] || '', this.MARGEN_IZQ + 14, this.posY);
        this.posY += 4;

        // Líneas adicionales del nombre del cliente
        for (let i = 1; i < lineasCliente.length; i++) {
            doc.text(lineasCliente[i], this.MARGEN_IZQ + 14, this.posY);
            this.posY += 4;
        }

        // RUC Cliente
        doc.setFont("helvetica", "bold");
        doc.text('RUC:', this.MARGEN_IZQ, this.posY);
        doc.setFont("helvetica", "normal");
        doc.text(datos.rucCliente, this.MARGEN_IZQ + 10, this.posY);
        this.posY += 4;

        // Dirección Cliente
        doc.setFont("helvetica", "bold");
        doc.text('Dir.:', this.MARGEN_IZQ, this.posY);
        doc.setFont("helvetica", "normal");
        const lineasDirCliente = this.dividirTexto(datos.direccionCliente, 55);
        doc.text(lineasDirCliente[0] || '', this.MARGEN_IZQ + 10, this.posY);
        this.posY += 4;

        for (let i = 1; i < lineasDirCliente.length; i++) {
            doc.text(lineasDirCliente[i], this.MARGEN_IZQ + 10, this.posY);
            this.posY += 4;
        }

        // Teléfono Cliente
        if (datos.telefonoCliente) {
            doc.text(`Tel.: ${datos.telefonoCliente}`, this.MARGEN_IZQ, this.posY);
            this.posY += 4;
        }

        // Vendedor
        doc.text(`Vendedor: ${datos.vendedor}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        this.dibujarLinea(doc);
    }

    /**
     * Dibuja la información de la venta
     */
    private dibujarInfoVenta(doc: jsPDF, datos: DatosFactura): void {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        // Condición de Venta
        doc.setFont("helvetica", "bold");
        doc.text('Cond. Venta:', this.MARGEN_IZQ, this.posY);
        doc.setFont("helvetica", "normal");
        doc.text(datos.formaVenta, this.MARGEN_IZQ + 18, this.posY);
        this.posY += 4;

        // Timbrado y Vigencia en la misma línea
        doc.setFont("helvetica", "bold");
        doc.text('Timbrado:', this.MARGEN_IZQ, this.posY);
        doc.setFont("helvetica", "normal");
        doc.text(datos.timbrado, this.MARGEN_IZQ + 14, this.posY);
        this.posY += 4;

        // Fecha Inicio Vigencia
        const fechaVigencia = this.formatearFechaSoloFecha(datos.fechaInicioVigencia);
        doc.text(`Inicio Vigencia: ${fechaVigencia}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        this.dibujarLinea(doc);
    }

    /**
     * Dibuja el número de factura de forma prominente
    */
    private dibujarNumeroFactura(doc: jsPDF, datos: DatosFactura): void {
        const centroX = this.ANCHO_TICKET / 2;

        this.posY += 2;

        // Número de factura - grande y destacado
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`Nº ${datos.nroFactura}`, centroX, this.posY, { align: 'center' });
        this.posY += 4;

        this.dibujarLineaDoble(doc);
    }

    /**
     * Dibuja el encabezado de la tabla de items - optimizado para 80mm
    */
    private dibujarEncabezadoTabla(doc: jsPDF): void {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);

        // Encabezados de columnas con mejor distribución
        doc.text('Cant.', this.COL_CANT, this.posY);
        doc.text('Descripción', this.COL_DESC, this.posY);
        doc.text('P.Unit.', this.COL_PRECIO, this.posY);
        doc.text('IVA', this.COL_IVA, this.posY);
        doc.text('Subtotal', this.COL_SUBTOTAL, this.posY, { align: 'right' });
        this.posY += 4;

        this.dibujarLinea(doc);
    }

    /**
     * Dibuja los items de la factura - optimizado para 80mm
    */
    private dibujarItems(doc: jsPDF, items: ItemFactura[]): void {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);

        items.forEach(item => {
            // Primera línea: Código del producto
            doc.setFont("helvetica", "bold");
            doc.setFontSize(6);
            doc.text(`Cód: ${item.codigo}`, this.COL_DESC, this.posY);
            this.posY += 3;

            // Segunda línea: Cantidad, Descripción, Precio, IVA, Subtotal
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);

            // Cantidad
            doc.text(item.cantidad.toString(), this.COL_CANT, this.posY);

            // Descripción (puede ocupar varias líneas)
            const lineasMercaderia = this.dividirTexto(item.mercaderia, 22);
            doc.text(lineasMercaderia[0], this.COL_DESC, this.posY);

            // Precio unitario
            doc.text(this.formatearNumero(item.precio, 0), this.COL_PRECIO, this.posY);

            // % IVA
            doc.text(`${item.porcentajeImpuesto}%`, this.COL_IVA, this.posY);

            // Subtotal - alineado a la derecha
            const subtotalStr = this.formatearNumero(item.subtotal, 0);
            doc.text(subtotalStr, this.COL_SUBTOTAL, this.posY, { align: 'right' });
            this.posY += 4;

            // Líneas adicionales de descripción si existen
            for (let i = 1; i < lineasMercaderia.length; i++) {
                doc.text(lineasMercaderia[i], this.COL_DESC, this.posY);
                this.posY += 3;
            }

            this.posY += 1; // Espacio entre items
        });

        this.dibujarLinea(doc);
    }

    /**
     * Dibuja los totales de forma destacada
     */
    private dibujarTotales(doc: jsPDF, datos: DatosFactura): void {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);

        const totalStr = this.formatearNumero(datos.total, 0);
        doc.text('TOTAL Gs.:', this.MARGEN_IZQ, this.posY);
        doc.text(totalStr, this.COL_SUBTOTAL, this.posY, { align: 'right' });
        this.posY += 6;

        this.dibujarLineaDoble(doc);
    }

    /**
     * Dibuja la liquidación del IVA en formato de tabla
    */
    private dibujarLiquidacionIVA(doc: jsPDF, datos: DatosFactura): void {
        const centroX = this.ANCHO_TICKET / 2;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text('LIQUIDACIÓN DEL IVA', centroX, this.posY, { align: 'center' });
        this.posY += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);

        // Formato de tabla para liquidación
        const colLabel = this.MARGEN_IZQ;
        const colValor = this.COL_SUBTOTAL;

        // Gravadas 10%
        doc.text('Gravadas 10%:', colLabel, this.posY);
        doc.text(this.formatearNumero(datos.gravada10, 0), colValor, this.posY, { align: 'right' });
        this.posY += 4;

        // Gravadas 5%
        doc.text('Gravadas 5%:', colLabel, this.posY);
        doc.text(this.formatearNumero(datos.gravada5, 0), colValor, this.posY, { align: 'right' });
        this.posY += 4;

        // Exenta
        doc.text('Exentas:', colLabel, this.posY);
        doc.text(this.formatearNumero(datos.exenta, 0), colValor, this.posY, { align: 'right' });
        this.posY += 5;

        this.dibujarLinea(doc);

        // IVA 10%
        doc.text('IVA 10%:', colLabel, this.posY);
        doc.text(this.formatearNumero(datos.iva10, 0), colValor, this.posY, { align: 'right' });
        this.posY += 4;

        // IVA 5%
        doc.text('IVA 5%:', colLabel, this.posY);
        doc.text(this.formatearNumero(datos.iva5, 0), colValor, this.posY, { align: 'right' });
        this.posY += 4;

        // Total IVA - destacado
        doc.setFont("helvetica", "bold");
        doc.text('TOTAL IVA:', colLabel, this.posY);
        doc.text(this.formatearNumero(datos.totalIva, 0), colValor, this.posY, { align: 'right' });
        this.posY += 5;
    }

    /**
     * Dibuja el pie de página
     */
    private dibujarPiePagina(doc: jsPDF): void {
        this.dibujarLinea(doc);

        const centroX = this.ANCHO_TICKET / 2;

        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        doc.text('*** GRACIAS POR SU COMPRA ***', centroX, this.posY, { align: 'center' });
        this.posY += 4;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6);
        doc.text('Original: Cliente | Duplicado: Archivo Tributario', centroX, this.posY, { align: 'center' });
        this.posY += 8;
    }

    /**
     * Formatea fecha completa con hora
    */
    private formatearFecha(fecha: Date | string): string {
        const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;

        if (isNaN(fechaObj.getTime())) {
            return 'Fecha no válida';
        }

        const dia = fechaObj.getDate().toString().padStart(2, '0');
        const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
        const anio = fechaObj.getFullYear();
        const horas = fechaObj.getHours().toString().padStart(2, '0');
        const minutos = fechaObj.getMinutes().toString().padStart(2, '0');
        return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
    }

    /**
     * Formatea fecha sin hora
    */
    private formatearFechaSoloFecha(fecha: Date | string): string {
        const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;

        if (isNaN(fechaObj.getTime())) {
            return 'Fecha no válida';
        }

        const dia = fechaObj.getDate().toString().padStart(2, '0');
        const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
        const anio = fechaObj.getFullYear();
        return `${dia}/${mes}/${anio}`;
    }

    /**
     * Dibuja una línea separadora simple
     */
    private dibujarLinea(doc: jsPDF): void {
        doc.setDrawColor(0);
        doc.setLineWidth(0.3);
        doc.line(this.MARGEN_IZQ, this.posY, this.ANCHO_TICKET - this.MARGEN_DER, this.posY);
        this.posY += 4;
    }

    /**
     * Dibuja una línea separadora doble (para secciones importantes)
     */
    private dibujarLineaDoble(doc: jsPDF): void {
        doc.setDrawColor(0);
        doc.setLineWidth(0.3);
        doc.line(this.MARGEN_IZQ, this.posY, this.ANCHO_TICKET - this.MARGEN_DER, this.posY);
        this.posY += 1;
        doc.line(this.MARGEN_IZQ, this.posY, this.ANCHO_TICKET - this.MARGEN_DER, this.posY);
        this.posY += 4;
    }

    /**
     * Formatea números con separadores de miles
     */
    private formatearNumero(numero: number, decimales: number = 0): string {
        return new Intl.NumberFormat('es-PY', {
            minimumFractionDigits: decimales,
            maximumFractionDigits: decimales
        }).format(numero);
    }

    /**
     * Trunca texto si excede el límite
     */
    private truncarTexto(texto: string, maxLength: number): string {
        if (!texto) return '';
        return texto.length > maxLength ? texto.substring(0, maxLength - 3) + '...' : texto;
    }

    /**
     * Divide texto en múltiples líneas
     */
    private dividirTexto(texto: string, maxLength: number): string[] {
        if (!texto) return [''];

        const palabras = texto.split(' ');
        const lineas: string[] = [];
        let lineaActual = '';

        palabras.forEach(palabra => {
            if ((lineaActual + palabra).length <= maxLength) {
                lineaActual += (lineaActual ? ' ' : '') + palabra;
            } else {
                if (lineaActual) lineas.push(lineaActual);
                lineaActual = palabra;
            }
        });

        if (lineaActual) lineas.push(lineaActual);
        return lineas;
    }
}

// Exportar instancia única del servicio
export const ticketService = new TicketService();
export default ticketService;
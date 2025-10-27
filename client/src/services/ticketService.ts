import type { ItemFactura, DatosFactura } from "../types/ticket.types";
import jsPDF from "jspdf";

class TicketService {

    private readonly ANCHO_TICKET = 50 // Ancho del ticket para impresoras de 50mm
    private readonly MARGEN_IZQ = 0.5
    private posY = 10 // Posición Y incial

    /**
     * Generar el ticket e imprime automaticamente
     */

    public async generarTicket(datos: DatosFactura): Promise<void> {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [this.ANCHO_TICKET, 297]
        });

        this.posY = 10;

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
        this.dibujarLinea(doc);
        
        // Abrir el PDF en una nueva ventana para imprimir
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    }

    /**
     * Dibuja el encabezado del reporte
     */
    private dibujarEncabezado(doc: jsPDF, datos: DatosFactura): void {
        // Nombre fantasia - negrita y centrado
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const nombreFantasia = this.truncarTexto(datos.nombreFantasia, 35);
        doc.text(nombreFantasia, this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
        this.posY += 4;

        // Empresa contable - cursiva y centrado
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        const empresaContable = this.truncarTexto(datos.empresaContable, 35);
        doc.text(empresaContable, this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
        this.posY += 5;

        // RUC
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`RUC: ${datos.ruc}`, this.MARGEN_IZQ, this.posY);
        this.posY += 4;

        // Dirección
        const lineasDireccion = this.dividirTexto(datos.direccion, 25);
        for (let linea = 0; linea < lineasDireccion.length; linea++) {
            if (linea === 0) {
                doc.text(`Dirección: ${lineasDireccion[linea]}`, this.MARGEN_IZQ, this.posY);
                this.posY += 4;
            }
            else {
                doc.text(lineasDireccion[linea], this.MARGEN_IZQ, this.posY);
                this.posY += 4;
            }
        }   

        // Teléfono y Rubro en la misma línea
        doc.text(`Telef.: ${datos.telefono}`, this.MARGEN_IZQ, this.posY);
        this.posY += 4;
        doc.text(datos.rubro, this.MARGEN_IZQ, this.posY);
        this.posY += 5;

        // Línea separadora
        this.dibujarLinea(doc);
    }

    
    /**
     * Dibuja la información del cliente
    */
    private dibujarInfoCliente(doc: jsPDF, datos: DatosFactura): void {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        // Fecha/Hora
        const fechaFormateada = this.formatearFecha(datos.fechaHora);
        doc.text(`Fecha/Hora: ${fechaFormateada}`, this.MARGEN_IZQ, this.posY);
        this.posY += 4;

        // Cliente
        const lineasCliente = this.dividirTexto(datos.cliente, 35);
        for (let linea = 0; linea < lineasCliente.length; linea++) {
            if (linea === 0) {
                doc.text(`Cliente: ${lineasCliente[linea]}`, this.MARGEN_IZQ, this.posY);
                this.posY += 4;
            }
            else {
                doc.text(lineasCliente[linea], this.MARGEN_IZQ, this.posY);
                this.posY += 4;
            }
        }
        
        // RUC Cliente
        doc.text(`RUC: ${datos.rucCliente}`, this.MARGEN_IZQ, this.posY);
        this.posY += 4;
        
        // Dirección Cliente
        const lineasDirCliente = this.dividirTexto(datos.direccionCliente, 25);
        for (let linea = 0; linea < lineasDirCliente.length; linea++) {
            if (linea === 0) {
                doc.text(`Dirección: ${lineasDirCliente[linea]}`, this.MARGEN_IZQ, this.posY);
                this.posY += 4;
            }
            else {
                doc.text(lineasDirCliente[linea], this.MARGEN_IZQ, this.posY);
                this.posY += 4;
            }
        }
        
        // Teléfono Cliente
        doc.text(`Telef.: ${datos.telefonoCliente}`, this.MARGEN_IZQ, this.posY);
        this.posY += 4;
        
        // Vendedor
        doc.text(`Vendedor/a: ${datos.vendedor}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;
        
        this.dibujarLinea(doc);
    }
    
    /**
     * Dibuja la información de la venta
     */
    private dibujarInfoVenta(doc: jsPDF, datos: DatosFactura): void {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        
        // Forma de Venta
        doc.text(`Forma de Venta: ${datos.formaVenta}`, this.MARGEN_IZQ, this.posY);
        this.posY += 4;
        
        // Tipo de Factura - negrita
        doc.setFont("helvetica", "bold");
        doc.text(`Tipo de Factura: ${datos.tipoFactura}`, this.MARGEN_IZQ, this.posY);
        this.posY += 4;
        
        // Timbrado
        doc.setFont("helvetica", "normal");
        doc.text(`Timbrado: ${datos.timbrado}`, this.MARGEN_IZQ, this.posY);
        this.posY += 4;
        
        // Fecha Inicio Vigencia
        const fechaVigencia = this.formatearFecha(datos.fechaInicioVigencia);
        doc.text(`Fecha Inicio Vigencia: ${fechaVigencia}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;
        
        this.dibujarLinea(doc);
    }
    
    /**
     * Dibuja el número de factura
    */
    private dibujarNumeroFactura(doc: jsPDF, datos: DatosFactura): void {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(`Nro.Factura: ${datos.nroFactura}`, this.MARGEN_IZQ, this.posY);
        this.posY += 5;
        
        this.dibujarLinea(doc);
    }
    
    /**
     * Dibuja el encabezado de la tabla de items
    */
   private dibujarEncabezadoTabla(doc: jsPDF): void {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        
        // Encabezados de columnas
        doc.text('Cant.', this.MARGEN_IZQ, this.posY);
        doc.text('Mercaderia', this.MARGEN_IZQ + 8, this.posY);
        doc.text('Prec.Unit.', this.MARGEN_IZQ + 24, this.posY);
        doc.text('SubtTotal', this.MARGEN_IZQ + 37, this.posY);
        this.posY += 4;
        
        this.dibujarLinea(doc);
    }
    
    /**
     * Dibuja los items de la factura
    */
   private dibujarItems(doc: jsPDF, items: ItemFactura[]): void {
       doc.setFont("helvetica", "normal");
       doc.setFontSize(7);
       
       items.forEach(item => {
           // Código
            doc.text(item.codigo.toString(), this.MARGEN_IZQ, this.posY);
            this.posY += 3;
            
            // Cantidad, Mercadería y Precio
            doc.text(item.cantidad.toString(), this.MARGEN_IZQ, this.posY);
            
            // Dividir mercadería si es muy larga
            const lineasMercaderia = this.dividirTexto(item.mercaderia, 10);
            lineasMercaderia.forEach((linea, index) => {
                if (index === 0) {
                    doc.text(linea, this.MARGEN_IZQ + 8, this.posY);
                    doc.text(this.formatearNumero(item.precio, 0), this.MARGEN_IZQ + 25, this.posY);
                } else {
                    this.posY += 3;
                    doc.text(linea, this.MARGEN_IZQ + 8, this.posY);
                }
            });

            // IVA
            doc.text(`${item.porcentajeImpuesto}%`, this.MARGEN_IZQ + 31, this.posY);
            
            // Subtotal - alineado a la derecha
            const subtotalStr = this.formatearNumero(item.subtotal, 0);
            doc.text(subtotalStr, this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
            this.posY += 4;
        });
        
        this.dibujarLinea(doc);
    }
    
    /**
     * Dibuja los totales
     */
    private dibujarTotales(doc: jsPDF, datos: DatosFactura): void {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        
        const totalStr = this.formatearNumero(datos.total, 0);
        doc.text('TOTAL Gs.:', this.MARGEN_IZQ, this.posY);
        doc.text(totalStr, this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
        this.posY += 5;
        
        this.dibujarLinea(doc);
    }
    
    /**
     * Dibuja la liquidación del IVA
    */
   private dibujarLiquidacionIVA(doc: jsPDF, datos: DatosFactura): void {
       doc.setFont("helvetica", "bold");
       doc.setFontSize(8);
       doc.text('Liquidación del IVA', this.ANCHO_TICKET / 2, this.posY, { align: 'center' });
       this.posY += 4;
       
       doc.setFont("helvetica", "normal");
       doc.setFontSize(7);
       
       // Gravadas 10%
       const grav10Str = this.formatearNumero(datos.gravada10, 0);
       doc.text(`Gravadas 10%: `, this.MARGEN_IZQ, this.posY);
       doc.text(grav10Str, this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
       this.posY += 3;
       
       // Gravadas 5%
       const grav5Str = this.formatearNumero(datos.gravada5, 0);
       doc.text(`Gravadas 5%: `, this.MARGEN_IZQ, this.posY);
       doc.text(grav5Str, this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
       this.posY += 3;
       
       // Exenta
       const exentaStr = this.formatearNumero(datos.exenta, 0);
       doc.text(`Exenta: `, this.MARGEN_IZQ, this.posY);
       doc.text(exentaStr, this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
       this.posY += 4;
       
       this.dibujarLinea(doc);
       
       // IVA 10%
       const iva10Str = this.formatearNumero(datos.iva10, 0);
       doc.text(`I.V.A. 10%: `, this.MARGEN_IZQ, this.posY);
       doc.text(iva10Str, this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
       this.posY += 3;
       
       // IVA 5%
       const iva5Str = this.formatearNumero(datos.iva5, 0);
       doc.text(`I.V.A. 5%: `, this.MARGEN_IZQ, this.posY);
       doc.text(iva5Str, this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
       this.posY += 3;
       
       // Total IVA
       doc.setFont("helvetica", "bold");
       const totalIvaStr = this.formatearNumero(datos.totalIva, 0);
       doc.text(`Total I.V.A.: `, this.MARGEN_IZQ, this.posY);
       doc.text(totalIvaStr, this.ANCHO_TICKET - this.MARGEN_IZQ, this.posY, { align: 'right' });
       this.posY += 5;
    }
    
    /**
     * Formatea fecha a string
    */
    private formatearFecha(fecha: Date): string {
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const anio = fecha.getFullYear();
        const horas = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');
        return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
    }
    /**
     * Dibuja una línea separadora
     */
    private dibujarLinea(doc: jsPDF): void {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('------------------------------------------------', this.MARGEN_IZQ, this.posY);
        this.posY += 5;
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
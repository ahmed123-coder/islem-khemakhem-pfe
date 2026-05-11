import { prisma } from './prisma';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

export class BillingService {
  /**
   * Generates a unique invoice number: INV-YYYYMM-XXXX
   */
  static async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const prefix = `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const count = await prisma.invoice.count({
      where: {
        invoiceNumber: { startsWith: prefix }
      }
    });
    return `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }

  /**
   * Creates an invoice for an order (subscription)
   */
  static async createInvoiceForOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        serviceTier: { include: { service: true } },
        client: true
      }
    });

    if (!order) return null;

    const invoiceNumber = await this.generateInvoiceNumber();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15); // 15 days payment term

    return await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: order.clientId,
        orderId: order.id,
        amount: order.serviceTier.price,
        status: order.status === 'ACTIVE' ? 'PAID' : 'PENDING',
        dueDate,
        paidAt: order.status === 'ACTIVE' ? new Date() : null
      }
    });
  }

  /**
   * Generates a PDF buffer for an invoice using the Facturevierge template
   */
  static async generateInvoicePDF(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: true,
        order: {
          include: {
            serviceTier: { include: { service: true } }
          }
        }
      }
    });

    if (!invoice) throw new Error('Invoice not found');

    // Load template
    const templatePath = path.join(process.cwd(), 'public', 'Facturevierge.jpg.pdf');
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const blue = rgb(0.11, 0.25, 0.48); // #1B3F7A
    const black = rgb(0, 0, 0);
    const gray = rgb(0.4, 0.4, 0.4);

    // Helper: y from top (pdf-lib uses bottom-left origin)
    const y = (fromTop: number) => height - fromTop;

    // --- Numéro de facture ---
    page.drawText(invoice.invoiceNumber, {
      x: 370, y: y(97), size: 10, font: fontBold, color: blue
    });

    // --- Dates ---
    page.drawText(new Date(invoice.issueDate).toLocaleDateString('fr-FR'), {
      x: 370, y: y(110), size: 9, font, color: black
    });
    page.drawText(new Date(invoice.dueDate).toLocaleDateString('fr-FR'), {
      x: 370, y: y(122), size: 9, font, color: black
    });

    // --- Client ---
    const clientName = `${invoice.client.firstName || ''} ${invoice.client.name || ''}`.trim() || invoice.client.email;
    page.drawText(clientName, {
      x: 30, y: y(152), size: 10, font: fontBold, color: black
    });
    page.drawText(invoice.client.email, {
      x: 30, y: y(164), size: 9, font, color: gray
    });
    if (invoice.client.phone) {
      page.drawText(invoice.client.phone, {
        x: 30, y: y(176), size: 9, font, color: gray
      });
    }
    if (invoice.client.address) {
      page.drawText(invoice.client.address, {
        x: 30, y: y(188), size: 9, font, color: gray
      });
    }

    // --- Ligne de service ---
    const serviceName = invoice.order?.serviceTier?.service?.name || 'Prestation de conseil';
    const tierType = invoice.order?.serviceTier?.tierType || 'Standard';
    page.drawText(serviceName, {
      x: 30, y: y(232), size: 9, font, color: black
    });
    page.drawText(tierType, {
      x: 200, y: y(232), size: 9, font, color: black
    });
    page.drawText('1', {
      x: 330, y: y(232), size: 9, font, color: black
    });
    page.drawText(`${invoice.amount.toFixed(2)} TND`, {
      x: 430, y: y(232), size: 9, font: fontBold, color: black
    });

    // --- Total ---
    page.drawText(`${invoice.amount.toFixed(2)} TND`, {
      x: 430, y: y(270), size: 11, font: fontBold, color: blue
    });

    // --- Statut ---
    const statusColor = invoice.status === 'PAID' ? rgb(0.1, 0.6, 0.2) : invoice.status === 'PENDING' ? rgb(0.8, 0.5, 0) : rgb(0.8, 0.1, 0.1);
    const statusLabel = invoice.status === 'PAID' ? 'PAYÉ' : invoice.status === 'PENDING' ? 'EN ATTENTE' : 'NON PAYÉ';
    page.drawText(statusLabel, {
      x: 430, y: y(285), size: 9, font: fontBold, color: statusColor
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Subscription Monitoring
   * Normally runs as a daily cron job
   */
  static async monitorAndRenewSubscriptions() {
    const today = new Date();
    
    // Find active orders whose "expiration" (typically 30 days after creation or last renewal) is nearing.
    // For this context, let's assume monthly cycles.
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(today.getDate() - 30);

    const subscriptionsToRenew = await prisma.order.findMany({
      where: {
        status: 'ACTIVE',
        createdAt: { lt: oneMonthAgo },
        // Check if no invoice was created in the last 28 days
        NOT: {
          invoices: {
            some: {
              issueDate: { gt: new Date(new Date().setDate(new Date().getDate() - 28)) }
            }
          }
        }
      }
    });

    for (const sub of subscriptionsToRenew) {
      await this.createInvoiceForOrder(sub.id);
    }
  }
}

import { prisma } from './prisma';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
   * Generates a PDF buffer for an invoice
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

    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(43, 90, 142); // Private Blue
    doc.text('CONSULTPRO EXPERTIES', 20, 20);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Facture N°: ${invoice.invoiceNumber}`, 20, 35);
    doc.text(`Date d'émission: ${new Date(invoice.issueDate).toLocaleDateString('fr-FR')}`, 20, 40);
    doc.text(`Date d'échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`, 20, 45);
    doc.text(`Statut du paiement: ${invoice.status}`, 20, 50);

    // Client Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Facturer à:', 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(invoice.client.name || invoice.client.email, 20, 70);
    doc.text(invoice.client.email, 20, 75);
    if (invoice.client.address) doc.text(invoice.client.address, 20, 80);

    // Table
    const tableData = [
      [
        invoice.order?.serviceTier.service.name || 'Prestation de service de conseil',
        invoice.order?.serviceTier.tierType || 'Standard',
        '1',
        `${invoice.amount} €`
      ]
    ];

    // Note: in jspdf-autotable, it's often imported as doc.autoTable
    if (doc.autoTable) {
        doc.autoTable({
          startY: 90,
          head: [['Description', 'Catégorie Pack', 'Quantité', 'Prix HT']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [43, 90, 142] },
          styles: { fontSize: 9 }
        });
    }

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 120;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`MONTANT TOTAL TTC: ${invoice.amount} EUR`, 140, finalY);

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Merci de votre confiance. Pour toute question, contactez-nous à support@consultpro.com', 105, 280, { align: 'center' });

    return Buffer.from(doc.output('arraybuffer'));
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

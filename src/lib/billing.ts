import { prisma } from './prisma';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export class BillingService {
  static async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const prefix = `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const count = await prisma.invoice.count({
      where: { invoiceNumber: { startsWith: prefix } }
    });
    return `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }

  static async createInvoiceForOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { serviceTier: { include: { service: true } }, client: true }
    });
    if (!order) return null;
    const invoiceNumber = await this.generateInvoiceNumber();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);
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

  static numberToWords(num: number): string {
    if (num === 0) return 'Zéro';
    const units = ['', 'Un', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf', 'Dix', 'Onze', 'Douze', 'Treize', 'Quatorze', 'Quinze', 'Seize', 'Dix-sept', 'Dix-huit', 'Dix-neuf'];
    const tens = ['', '', 'Vingt', 'Trente', 'Quarante', 'Cinquante', 'Soixante', 'Soixante-dix', 'Quatre-vingt', 'Quatre-vingt-dix'];
    const convertBelow1000 = (n: number): string => {
      if (n === 0) return '';
      let res = '';
      if (n >= 100) { const c = Math.floor(n / 100); res += (c > 1 ? units[c] + ' ' : '') + 'Cent '; n %= 100; }
      if (n >= 20) { const t = Math.floor(n / 10); res += tens[t] + (n % 10 > 0 ? '-' + units[n % 10] : '') + ' '; }
      else if (n > 0) res += units[n] + ' ';
      return res;
    };
    let result = '';
    const milliards = Math.floor(num / 1e9);
    num %= 1e9;
    const millions = Math.floor(num / 1e6);
    num %= 1e6;
    const milliers = Math.floor(num / 1000);
    num %= 1000;
    if (milliards > 0) result += (milliards > 1 ? convertBelow1000(milliards) : '') + 'Milliard ';
    if (millions > 0) result += (millions > 1 ? convertBelow1000(millions) : '') + 'Million ';
    if (milliers > 0) result += (milliers > 1 ? convertBelow1000(milliers) : '') + 'Mille ';
    result += convertBelow1000(num);
    return result.trim() + ' Dinars';
  }

  static async generateInvoicePDF(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: true,
        order: { include: { serviceTier: { include: { service: true } } } }
      }
    });
    if (!invoice) throw new Error('Invoice not found');

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const blue = rgb(0.11, 0.25, 0.48);
    const black = rgb(0, 0, 0);
    const gray = rgb(0.4, 0.4, 0.4);
    const lightGray = rgb(0.9, 0.9, 0.9);
    const white = rgb(1, 1, 1);

    const y = (fromTop: number) => height - fromTop;
    const amount = Number(invoice.amount);
    const vatRate = 0.19;
    const ht = amount / (1 + vatRate);
    const vat = amount - ht;
    const serviceName = invoice.order?.serviceTier?.service?.name || 'Prestation de conseil';
    const tierType = invoice.order?.serviceTier?.tierType || 'Standard';

    // ── Header ──
    page.drawRectangle({ x: 0, y: height - 140, width, height: 140, color: blue });
    page.drawText('DSL CONSULTING', { x: 40, y: y(45), size: 22, font: fontBold, color: white });
    page.drawText('Business Consulting & Management Solutions', { x: 40, y: y(70), size: 10, font, color: rgb(0.8, 0.85, 0.95) });
    page.drawText('FACTURE', { x: width - 160, y: y(45), size: 24, font: fontBold, color: white });

    // ── Invoice Meta ──
    const metaX = width - 200;
    page.drawText('N° Facture', { x: metaX, y: y(170), size: 8, font, color: gray });
    page.drawText(invoice.invoiceNumber, { x: metaX + 90, y: y(170), size: 9, font: fontBold, color: black });
    page.drawText('Date d\'émission', { x: metaX, y: y(185), size: 8, font, color: gray });
    page.drawText(new Date(invoice.issueDate).toLocaleDateString('fr-FR'), { x: metaX + 90, y: y(185), size: 9, font, color: black });
    page.drawText('Date d\'échéance', { x: metaX, y: y(200), size: 8, font, color: gray });
    page.drawText(new Date(invoice.dueDate).toLocaleDateString('fr-FR'), { x: metaX + 90, y: y(200), size: 9, font, color: black });

    // ── Client Block ──
    page.drawText('FACTURER À', { x: 40, y: y(170), size: 9, font: fontBold, color: blue });
    const clientName = `${invoice.client.firstName || ''} ${invoice.client.name || ''}`.trim() || invoice.client.email;
    page.drawText(clientName, { x: 40, y: y(185), size: 10, font: fontBold, color: black });
    page.drawText(invoice.client.email, { x: 40, y: y(200), size: 9, font, color: gray });
    if (invoice.client.phone) page.drawText(invoice.client.phone, { x: 40, y: y(215), size: 9, font, color: gray });
    if (invoice.client.address) page.drawText(invoice.client.address, { x: 40, y: y(228), size: 9, font, color: gray });

    // ── Separator ──
    page.drawLine({ start: { x: 40, y: y(250) }, end: { x: width - 40, y: y(250) }, thickness: 1, color: lightGray });

    // ── Table Header ──
    const rowY = y(265);
    const rowH = 22;
    const cols = [
      { x: 40, label: 'DESCRIPTION' },
      { x: 320, label: 'QTÉ' },
      { x: 420, label: 'PRIX UNITAIRE' },
      { x: 510, label: 'TOTAL' },
    ];
    page.drawRectangle({ x: 40, y: rowY - rowH, width: width - 80, height: rowH, color: blue });
    cols.forEach(c => page.drawText(c.label, { x: c.x, y: rowY - 15, size: 8, font: fontBold, color: white }));

    // ── Service Line ──
    const lineY2 = rowY - rowH - 12;
    page.drawLine({ start: { x: 40, y: lineY2 - 30 }, end: { x: width - 40, y: lineY2 - 30 }, thickness: 1, color: lightGray });
    page.drawText(serviceName + ' (' + tierType + ')', { x: 40, y: lineY2 - 10, size: 9, font: fontBold, color: black });
    page.drawText('1', { x: 320, y: lineY2 - 10, size: 9, font, color: black });
    page.drawText(ht.toFixed(2) + ' TND', { x: 420, y: lineY2 - 10, size: 9, font, color: black });
    page.drawText(amount.toFixed(2) + ' TND', { x: 510, y: lineY2 - 10, size: 9, font: fontBold, color: black });

    // ── Totals ──
    const totalsX = 380;
    const totalsStart = lineY2 - 55;
    const rowSpacing = 18;

    page.drawText('Honoraires (HT)', { x: totalsX, y: totalsStart, size: 9, font, color: gray });
    page.drawText(ht.toFixed(2) + ' TND', { x: 510, y: totalsStart, size: 9, font, color: black });
    page.drawText('TVA 19%', { x: totalsX, y: totalsStart - rowSpacing, size: 9, font, color: gray });
    page.drawText(vat.toFixed(2) + ' TND', { x: 510, y: totalsStart - rowSpacing, size: 9, font, color: black });
    page.drawLine({ start: { x: totalsX, y: totalsStart - rowSpacing * 2 + 6 }, end: { x: width - 40, y: totalsStart - rowSpacing * 2 + 6 }, thickness: 1, color: lightGray });
    page.drawText('Total TTC', { x: totalsX, y: totalsStart - rowSpacing * 2 - 2, size: 11, font: fontBold, color: blue });
    page.drawText(amount.toFixed(2) + ' TND', { x: 510, y: totalsStart - rowSpacing * 2 - 2, size: 11, font: fontBold, color: blue });

    // ── Status ──
    const statusY = totalsStart - rowSpacing * 3 - 15;
    const statusColor = invoice.status === 'PAID' ? rgb(0.1, 0.6, 0.2) : invoice.status === 'PENDING' ? rgb(0.8, 0.5, 0) : rgb(0.8, 0.1, 0.1);
    const statusLabel = invoice.status === 'PAID' ? 'PAYÉE' : invoice.status === 'PENDING' ? 'EN ATTENTE DE PAIEMENT' : 'NON PAYÉE';
    page.drawText('Statut : ' + statusLabel, { x: 40, y: statusY, size: 10, font: fontBold, color: statusColor });

    // ── Amount in Words ──
    page.drawText('Arrêtée la présente facture à la somme de :', { x: 40, y: statusY - 25, size: 9, font, color: gray });
    page.drawText(this.numberToWords(amount), { x: 40, y: statusY - 40, size: 10, font: fontBold, color: black });

    // ── Payment Info ──
    page.drawLine({ start: { x: 40, y: statusY - 60 }, end: { x: width - 40, y: statusY - 60 }, thickness: 1, color: lightGray });
    page.drawText('Modalités de paiement', { x: 40, y: statusY - 75, size: 9, font: fontBold, color: blue });
    page.drawText('Virement bancaire · Carte bancaire · Espèces', { x: 40, y: statusY - 90, size: 8, font, color: gray });
    page.drawText('Échéance : ' + new Date(invoice.dueDate).toLocaleDateString('fr-FR'), { x: 40, y: statusY - 103, size: 8, font, color: gray });

    // ── Footer ──
    page.drawLine({ start: { x: 40, y: 60 }, end: { x: width - 40, y: 60 }, thickness: 1, color: lightGray });
    page.drawText('DSL Consulting · business@dsl-consulting.com · www.dsl-consulting.com', { x: 40, y: 40, size: 8, font, color: gray });
    page.drawText('RC: Tunis · MF: 1234567 · Tél: +216 00 000 000', { x: 40, y: 28, size: 8, font, color: gray });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  static async monitorAndRenewSubscriptions() {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(today.getDate() - 30);
    const subscriptionsToRenew = await prisma.order.findMany({
      where: {
        status: 'ACTIVE',
        createdAt: { lt: oneMonthAgo },
        NOT: { invoices: { some: { issueDate: { gt: new Date(new Date().setDate(new Date().getDate() - 28)) } } } }
      }
    });
    for (const sub of subscriptionsToRenew) {
      await this.createInvoiceForOrder(sub.id);
    }
  }
}

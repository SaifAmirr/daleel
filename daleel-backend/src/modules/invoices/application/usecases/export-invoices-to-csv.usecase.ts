import { Injectable } from '@nestjs/common';
import { stringify } from 'csv-stringify/sync';
import { Invoice } from '../../domain/model/invoice.entity';

@Injectable()
export class ExportInvoicesToCsvUsecase {
  execute(invoices: Invoice[], fileName?: string): { csv: string; fileName: string } {
    if (!invoices || invoices.length === 0) {
      throw new Error('No invoices to export');
    }

    // Prepare headers
    const headers = ['Invoice Date', 'Invoice Number', 'Issuer Name', 'Receiver Name', 'Total Amount (EGP)', 'Created At'];
    
    // Prepare data rows
    const rows = invoices.map((invoice) => [
      this.formatDate(invoice.invoiceDate),
      invoice.invoiceNumber || '',
      invoice.issuerName || '',
      invoice.receiverName || '',
      Number(invoice.totalAmount || 0).toFixed(2),
      this.formatDate(invoice.createdAt),
    ]);

    // Convert to CSV using stringify
    const csv = stringify([headers, ...rows]);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const defaultFileName = fileName || `invoices-export-${timestamp}.csv`;

    return {
      csv,
      fileName: defaultFileName,
    };
  }

  private formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

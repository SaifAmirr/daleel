import { Body, Controller, Post, Response } from "@nestjs/common";
import { CreateInvoiceUsecase } from "../../application/usecases/create-invoice-usecase";
import { GetBusinessInvoicesUsecase } from "../../application/usecases/get-business-invoices-usecase";
import { GetQuarterlyInvoicesUsecase } from "../../application/usecases/get-quarterly-invoices-usecase";
import { ExportInvoicesToCsvUsecase } from "../../application/usecases/export-invoices-to-csv.usecase";
import { CreateInvoiceDTO } from "../../application/dtos/create-invoice-dto";
import { Invoice } from "../../domain/model/invoice.entity";
import { YearlyInvoicesResponse } from "../../application/dtos/quarterly-invoices-dto";

@Controller('invoices')
export class InvoiceController {

    constructor(
        private readonly createInvoiceUsecase: CreateInvoiceUsecase,
        private readonly getBusinessInvoicesUsecase: GetBusinessInvoicesUsecase,
        private readonly getQuarterlyInvoicesUsecase: GetQuarterlyInvoicesUsecase,
        private readonly exportInvoicesToCsvUsecase: ExportInvoicesToCsvUsecase,
    ) {}
    
    @Post('add')
    async createInvoice(@Body() dto: CreateInvoiceDTO): Promise<Invoice> {
        return this.createInvoiceUsecase.execute(dto);
    }

    @Post('business-invoices')
    async getBusinessInvoices(@Body('businessId') businessId: string): Promise<Invoice[]> {
        return this.getBusinessInvoicesUsecase.execute(businessId);
    }

    @Post('quarterly-invoices')
    async getQuarterlyInvoices(@Body() body: { businessId: string; year?: number }): Promise<YearlyInvoicesResponse> {
        return this.getQuarterlyInvoicesUsecase.execute(body.businessId, body.year);
    }

    @Post('export-csv')
    async exportInvoicesToCsv(
        @Body('invoices') invoices: Invoice[],
        @Response() res: any
    ) {
        try {
            console.log('Exporting invoices:', invoices);
            
            if (!invoices || invoices.length === 0) {
                return res.status(400).json({ error: 'No invoices provided' });
            }

            const result = this.exportInvoicesToCsvUsecase.execute(invoices);

            console.log('CSV generated successfully, file:', result.fileName);
            
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
            res.setHeader('Content-Length', Buffer.byteLength(result.csv, 'utf8'));
            res.send(result.csv);
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            res.status(400).json({ error: error.message });
        }
    }
}

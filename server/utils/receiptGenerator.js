import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, Header, ImageRun, Footer } from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateWordReceipt = async (transaction) => {
    const { type, referenceId, amount, currency, user, date, details } = transaction;

    const formattedDate = new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    // Load Logo
    let logoBuffer;
    try {
        const logoPath = path.join(__dirname, '../assets/logo.png');
        if (fs.existsSync(logoPath)) {
            logoBuffer = fs.readFileSync(logoPath);
        }
    } catch (e) {
        console.error("Error loading logo:", e);
    }

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1000,
                        right: 1500,
                        bottom: 1000,
                        left: 1500,
                    },
                },
            },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            children: [
                                logoBuffer ? new ImageRun({
                                    data: logoBuffer,
                                    transformation: {
                                        width: 100,
                                        height: 100,
                                    },
                                }) : new TextRun({ text: "BODIPO BUSINESS", bold: true, size: 32 }),
                            ],
                            alignment: AlignmentType.LEFT
                        }),
                        new Paragraph({ text: "" }) // Spacer
                    ],
                }),
            },
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "FACTURA / RECIBO",
                            bold: true,
                            size: 32, // 16pt
                            color: "0F766E",
                        }),
                    ],
                    alignment: AlignmentType.RIGHT,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: `Nº Referencia: ${transaction._id}`, size: 20, color: "666666" }),
                        new TextRun({ text: `\nFecha: ${formattedDate}`, size: 20, color: "666666" }.toString()),
                    ],
                    alignment: AlignmentType.RIGHT,
                    spacing: { after: 400 }
                }),

                // Client Info Grid
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                        insideVertical: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE },
                    },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        new Paragraph({ children: [new TextRun({ text: "CLIENTE:", bold: true, color: "0F766E" })] }),
                                        new Paragraph({ text: user?.name || "Cliente General" }),
                                        new Paragraph({ text: user?.phone || "" }),
                                        new Paragraph({ text: user?.email || "" }),
                                    ],
                                    width: { size: 50, type: WidthType.PERCENTAGE }
                                }),
                                new TableCell({
                                    children: [
                                        new Paragraph({ children: [new TextRun({ text: "DETALLES DE OPERACIÓN:", bold: true, color: "0F766E" })] }),
                                        new Paragraph({ text: type === 'SHIPMENT' ? 'Envío de Paquetería' : type === 'TRANSFER' ? 'Envío de Dinero' : 'Compra' }),
                                        new Paragraph({ text: type === 'SHIPMENT' ? `Rastreo: ${details?.trackingNumber || 'N/A'}` : type === 'TRANSFER' ? `Dest: ${details?.beneficiary || 'N/A'}` : '' }),
                                    ],
                                    width: { size: 50, type: WidthType.PERCENTAGE }
                                }),
                            ],
                        }),
                    ],
                }),

                new Paragraph({ text: "", spacing: { after: 400 } }),

                // Items Table
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        // Header
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({ children: [new TextRun({ text: "CANT.", bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                                    shading: { fill: "0F766E" },
                                    width: { size: 10, type: WidthType.PERCENTAGE }
                                }),
                                new TableCell({
                                    children: [new Paragraph({ children: [new TextRun({ text: "DESCRIPCIÓN", bold: true, color: "FFFFFF" })], alignment: AlignmentType.LEFT })],
                                    shading: { fill: "0F766E" },
                                    width: { size: 50, type: WidthType.PERCENTAGE }
                                }),
                                new TableCell({
                                    children: [new Paragraph({ children: [new TextRun({ text: "PRECIO UNIT.", bold: true, color: "FFFFFF" })], alignment: AlignmentType.RIGHT })],
                                    shading: { fill: "0F766E" },
                                    width: { size: 20, type: WidthType.PERCENTAGE }
                                }),
                                new TableCell({
                                    children: [new Paragraph({ children: [new TextRun({ text: "IMPORTE", bold: true, color: "FFFFFF" })], alignment: AlignmentType.RIGHT })],
                                    shading: { fill: "0F766E" },
                                    width: { size: 20, type: WidthType.PERCENTAGE }
                                }),
                            ],
                        }),
                        // Row 1
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "1", alignment: AlignmentType.CENTER })] }),
                                new TableCell({
                                    children: [new Paragraph({
                                        text: details?.description || (type === 'SHIPMENT' ? `Envío ${details?.origin} -> ${details?.destination} (${details?.weight}kg)` : `Transferencia a ${details?.beneficiary}`)
                                    })]
                                }),
                                new TableCell({ children: [new Paragraph({ text: `${amount}`, alignment: AlignmentType.RIGHT })] }),
                                new TableCell({ children: [new Paragraph({ text: `${amount} ${currency || 'EUR'}`, alignment: AlignmentType.RIGHT })] }),
                            ],
                        }),
                    ],
                }),

                new Paragraph({ text: "", spacing: { after: 200 } }),

                // Total Table
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                        insideVertical: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE },
                    },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "" })], width: { size: 60, type: WidthType.PERCENTAGE } }),
                                new TableCell({
                                    children: [new Paragraph({ text: "TOTAL:", bold: true, size: 24, alignment: AlignmentType.RIGHT })],
                                    width: { size: 20, type: WidthType.PERCENTAGE },
                                    shading: { fill: "EEEEEE" }
                                }),
                                new TableCell({
                                    children: [new Paragraph({ text: `${amount} ${currency || 'EUR'}`, bold: true, size: 24, alignment: AlignmentType.RIGHT })],
                                    width: { size: 20, type: WidthType.PERCENTAGE },
                                    shading: { fill: "EEEEEE" }
                                }),
                            ],
                        }),
                    ],
                }),

                new Paragraph({ text: "", spacing: { after: 800 } }),

            ],
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "BODIPO BUSINESS - Tu mejor opción",
                                    bold: true,
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),
                    ],
                }),
            },
        }],
    });

    return await Packer.toBuffer(doc);
};

import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, Header, ImageRun, Footer, VerticalAlign } from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateWordReceipt = async (transaction) => {
    const { type, referenceId, amount, currency, user, date, details } = transaction;

    const formattedDate = new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
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

    // Load Stamp/Seal (circular footer logo)
    let stampBuffer;
    try {
        const stampPath = path.join(__dirname, '../assets/template.png');
        if (fs.existsSync(stampPath)) {
            stampBuffer = fs.readFileSync(stampPath);
        }
    } catch (e) {
        console.error("Error loading stamp:", e);
    }

    // Build description for item
    let description = '';
    if (type === 'SHIPMENT') {
        description = `Envío de paquetería desde ${details?.origin || 'N/A'} hasta ${details?.destination || 'N/A'}`;
        if (details?.weight) {
            description += ` (${details.weight}kg)`;
        }
        if (details?.trackingNumber) {
            description += `\nNº Rastreo: ${details.trackingNumber}`;
        }
    } else if (type === 'TRANSFER') {
        description = `Envío de dinero a ${details?.beneficiary || 'N/A'}`;
    } else {
        description = details?.description || 'Servicio';
    }

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1000,
                        right: 1000,
                        bottom: 1000,
                        left: 1000,
                    },
                },
            },
            children: [
                // Logo and Company Name
                new Paragraph({
                    children: [
                        logoBuffer ? new ImageRun({
                            data: logoBuffer,
                            transformation: {
                                width: 80,
                                height: 80,
                            },
                        }) : new TextRun({ text: "bb", bold: true, size: 48 }),
                    ],
                    spacing: { after: 100 }
                }),
                new Paragraph({
                    children: [new TextRun({ text: "BODIPO BUSINESS", size: 20 })],
                    spacing: { after: 400 }
                }),

                // Client Information Fields
                new Paragraph({
                    children: [new TextRun({ text: `NOMBRE: ${user?.name || 'N/A'}`, size: 20 })],
                    spacing: { after: 200 }
                }),

                // Contact, Location, Date in one line
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
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: `CONTACTO: ${user?.phone || 'N/A'}`, size: 20 })]
                                    })],
                                    width: { size: 33, type: WidthType.PERCENTAGE },
                                    borders: {
                                        top: { style: BorderStyle.NONE },
                                        bottom: { style: BorderStyle.NONE },
                                        left: { style: BorderStyle.NONE },
                                        right: { style: BorderStyle.NONE },
                                    }
                                }),
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: `UBICACION: ${details?.origin || user?.address || 'N/A'}`, size: 20 })]
                                    })],
                                    width: { size: 34, type: WidthType.PERCENTAGE },
                                    borders: {
                                        top: { style: BorderStyle.NONE },
                                        bottom: { style: BorderStyle.NONE },
                                        left: { style: BorderStyle.NONE },
                                        right: { style: BorderStyle.NONE },
                                    }
                                }),
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: `FECHA: ${formattedDate}`, size: 20 })]
                                    })],
                                    width: { size: 33, type: WidthType.PERCENTAGE },
                                    borders: {
                                        top: { style: BorderStyle.NONE },
                                        bottom: { style: BorderStyle.NONE },
                                        left: { style: BorderStyle.NONE },
                                        right: { style: BorderStyle.NONE },
                                    }
                                }),
                            ],
                        }),
                    ],
                }),

                new Paragraph({ text: "", spacing: { after: 300 } }),

                // Items Table
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        // Header Row
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: "CANT.", bold: true, size: 20, color: "FFFFFF" })],
                                        alignment: AlignmentType.CENTER
                                    })],
                                    shading: { fill: "5F9EA0" }, // Teal/gray color
                                    width: { size: 10, type: WidthType.PERCENTAGE },
                                    verticalAlign: VerticalAlign.CENTER
                                }),
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: "DESCRIPCION", bold: true, size: 20, color: "FFFFFF" })],
                                        alignment: AlignmentType.CENTER
                                    })],
                                    shading: { fill: "5F9EA0" },
                                    width: { size: 50, type: WidthType.PERCENTAGE },
                                    verticalAlign: VerticalAlign.CENTER
                                }),
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: "PRECIO UNIT.", bold: true, size: 20, color: "FFFFFF" })],
                                        alignment: AlignmentType.CENTER
                                    })],
                                    shading: { fill: "5F9EA0" },
                                    width: { size: 20, type: WidthType.PERCENTAGE },
                                    verticalAlign: VerticalAlign.CENTER
                                }),
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: "IMPORTE", bold: true, size: 20, color: "FFFFFF" })],
                                        alignment: AlignmentType.CENTER
                                    })],
                                    shading: { fill: "5F9EA0" },
                                    width: { size: 20, type: WidthType.PERCENTAGE },
                                    verticalAlign: VerticalAlign.CENTER
                                }),
                            ],
                        }),
                        // Item Row 1 (actual data)
                        new TableRow({
                            height: { value: 800, rule: 'atLeast' },
                            children: [
                                new TableCell({
                                    children: [new Paragraph({ text: "1", alignment: AlignmentType.CENTER, size: 20 })],
                                    verticalAlign: VerticalAlign.CENTER
                                }),
                                new TableCell({
                                    children: [new Paragraph({ text: description, size: 20 })],
                                    verticalAlign: VerticalAlign.CENTER
                                }),
                                new TableCell({
                                    children: [new Paragraph({ text: `${amount}`, alignment: AlignmentType.RIGHT, size: 20 })],
                                    verticalAlign: VerticalAlign.CENTER
                                }),
                                new TableCell({
                                    children: [new Paragraph({ text: `${amount} ${currency || 'EUR'}`, alignment: AlignmentType.RIGHT, size: 20 })],
                                    verticalAlign: VerticalAlign.CENTER
                                }),
                            ],
                        }),
                        // Empty Row 2
                        new TableRow({
                            height: { value: 800, rule: 'atLeast' },
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "" })], verticalAlign: VerticalAlign.CENTER }),
                                new TableCell({ children: [new Paragraph({ text: "" })], verticalAlign: VerticalAlign.CENTER }),
                                new TableCell({ children: [new Paragraph({ text: "" })], verticalAlign: VerticalAlign.CENTER }),
                                new TableCell({ children: [new Paragraph({ text: "" })], verticalAlign: VerticalAlign.CENTER }),
                            ],
                        }),
                        // Empty Row 3
                        new TableRow({
                            height: { value: 800, rule: 'atLeast' },
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "" })], verticalAlign: VerticalAlign.CENTER }),
                                new TableCell({ children: [new Paragraph({ text: "" })], verticalAlign: VerticalAlign.CENTER }),
                                new TableCell({ children: [new Paragraph({ text: "" })], verticalAlign: VerticalAlign.CENTER }),
                                new TableCell({ children: [new Paragraph({ text: "" })], verticalAlign: VerticalAlign.CENTER }),
                            ],
                        }),
                    ],
                }),

                new Paragraph({ text: "", spacing: { after: 200 } }),

                // Total
                new Paragraph({
                    children: [
                        new TextRun({ text: `TOTAL: ${amount} ${currency || 'EUR'}`, bold: true, size: 24 })
                    ],
                    alignment: AlignmentType.RIGHT,
                    spacing: { after: 400 },
                    border: {
                        top: { color: "5F9EA0", size: 6, style: BorderStyle.SINGLE },
                    }
                }),

                new Paragraph({ text: "", spacing: { after: 600 } }),

                // Footer with stamp
                new Paragraph({
                    children: [
                        stampBuffer ? new ImageRun({
                            data: stampBuffer,
                            transformation: {
                                width: 120,
                                height: 120,
                            },
                        }) : new TextRun({ text: "BODIPO\nSOMOS TU MEJOR OPCIÓN", bold: true, size: 20 }),
                    ],
                    alignment: AlignmentType.RIGHT
                }),
            ],
        }],
    });

    return await Packer.toBuffer(doc);
};

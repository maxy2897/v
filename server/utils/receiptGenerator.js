import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, ImageRun, VerticalAlign } from 'docx';
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

    // Load Stamp/Seal
    let stampBuffer;
    try {
        const stampPath = path.join(__dirname, '../assets/template.png');
        if (fs.existsSync(stampPath)) {
            stampBuffer = fs.readFileSync(stampPath);
        }
    } catch (e) {
        console.error("Error loading stamp:", e);
    }

    // Build description
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
                        right: 1200,
                        bottom: 1000,
                        left: 1200,
                    },
                },
            },
            children: [
                // Logo
                new Paragraph({
                    children: [
                        logoBuffer ? new ImageRun({
                            data: logoBuffer,
                            transformation: {
                                width: 70,
                                height: 70,
                            },
                        }) : new TextRun({ text: "bb", bold: true, size: 48, color: "0F766E" }),
                    ],
                    spacing: { after: 50 }
                }),

                // Company Name
                new Paragraph({
                    children: [new TextRun({ text: "BODIPO BUSINESS", size: 18 })],
                    spacing: { after: 600 }
                }),

                // REMITENTE Section
                new Paragraph({
                    children: [new TextRun({ text: "REMITENTE:", bold: true, size: 20 })],
                    spacing: { after: 150 }
                }),

                new Paragraph({
                    children: [new TextRun({ text: `NOMBRE: ${user?.name || ''}`, size: 20 })],
                    spacing: { after: 150 }
                }),

                // Contact, Location, Date
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
                                        children: [new TextRun({ text: `CONTACTO: ${user?.phone || ''}`, size: 20 })]
                                    })],
                                    width: { size: 40, type: WidthType.PERCENTAGE },
                                    borders: {
                                        top: { style: BorderStyle.NONE },
                                        bottom: { style: BorderStyle.NONE },
                                        left: { style: BorderStyle.NONE },
                                        right: { style: BorderStyle.NONE },
                                    }
                                }),
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: `UBICACION: ${details?.origin || ''}`, size: 20 })]
                                    })],
                                    width: { size: 40, type: WidthType.PERCENTAGE },
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
                                    width: { size: 20, type: WidthType.PERCENTAGE },
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

                new Paragraph({ text: "", spacing: { after: 400 } }),

                // DESTINATARIO Section
                new Paragraph({
                    children: [new TextRun({ text: "DESTINATARIO:", bold: true, size: 20 })],
                    spacing: { after: 150 }
                }),

                new Paragraph({
                    children: [new TextRun({ text: `NOMBRE: ${details?.recipient?.name || ''}`, size: 20 })],
                    spacing: { after: 150 }
                }),

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
                                        children: [new TextRun({ text: `CONTACTO: ${details?.recipient?.phone || ''}`, size: 20 })]
                                    })],
                                    width: { size: 40, type: WidthType.PERCENTAGE },
                                    borders: {
                                        top: { style: BorderStyle.NONE },
                                        bottom: { style: BorderStyle.NONE },
                                        left: { style: BorderStyle.NONE },
                                        right: { style: BorderStyle.NONE },
                                    }
                                }),
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: `UBICACION: ${details?.destination || ''}`, size: 20 })]
                                    })],
                                    width: { size: 60, type: WidthType.PERCENTAGE },
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

                new Paragraph({ text: "", spacing: { after: 400 } }),

                // Items Table (con 3 filas exactamente como en el modelo)
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        // Header
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: "CANT.", bold: true, size: 20, color: "FFFFFF" })],
                                        alignment: AlignmentType.CENTER
                                    })],
                                    shading: { fill: "5F9EA0" },
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
                        // Fila 1 - con datos
                        new TableRow({
                            height: { value: 1000, rule: 'atLeast' },
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
                                    children: [new Paragraph({ text: `${amount} ${currency || 'EUR'}`, alignment: AlignmentType.RIGHT, size: 20 })],
                                    verticalAlign: VerticalAlign.CENTER
                                }),
                                new TableCell({
                                    children: [new Paragraph({ text: `${amount} ${currency || 'EUR'}`, alignment: AlignmentType.RIGHT, size: 20 })],
                                    verticalAlign: VerticalAlign.CENTER
                                }),
                            ],
                        }),
                        // Fila 2 - vacía
                        new TableRow({
                            height: { value: 1000, rule: 'atLeast' },
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "" })], verticalAlign: VerticalAlign.CENTER }),
                                new TableCell({ children: [new Paragraph({ text: "" })], verticalAlign: VerticalAlign.CENTER }),
                                new TableCell({ children: [new Paragraph({ text: "" })], verticalAlign: VerticalAlign.CENTER }),
                                new TableCell({ children: [new Paragraph({ text: "" })], verticalAlign: VerticalAlign.CENTER }),
                            ],
                        }),
                        // Fila 3 - vacía
                        new TableRow({
                            height: { value: 1000, rule: 'atLeast' },
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "" })], verticalAlign: VerticalAlign.CENTER }),
                                new TableCell({ children: [new Paragraph({ text: "" })], verticalAlign: VerticalAlign.CENTER }),
                                new TableCell({ children: [new Paragraph({ text: "" })], verticalAlign: VerticalAlign.CENTER }),
                                new TableCell({ children: [new Paragraph({ text: "" })], verticalAlign: VerticalAlign.CENTER }),
                            ],
                        }),
                    ],
                }),

                new Paragraph({ text: "", spacing: { after: 300 } }),

                // TOTAL
                new Paragraph({
                    children: [
                        new TextRun({ text: `TOTAL: ${amount} ${currency || 'EUR'}`, bold: true, size: 24 })
                    ],
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 200, after: 800 },
                    border: {
                        top: { color: "000000", size: 6, style: BorderStyle.SINGLE },
                    }
                }),

                // Sello circular
                new Paragraph({
                    children: [
                        stampBuffer ? new ImageRun({
                            data: stampBuffer,
                            transformation: {
                                width: 100,
                                height: 100,
                            },
                        }) : new TextRun({ text: "" }),
                    ],
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 400 }
                }),
            ],
        }],
    });

    return await Packer.toBuffer(doc);
};

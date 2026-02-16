import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatePDFReceipt = async (transaction) => {
    const { type, referenceId, amount, currency, user, details, createdAt } = transaction;

    // Use createdAt from MongoDB (auto-generated timestamp)
    const dateToUse = transaction.date || createdAt || new Date();

    const formattedDate = new Date(dateToUse).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', reject);

            // Logo
            const logoPath = path.join(__dirname, '../assets/logo.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 50, 50, { width: 80 });
            }

            // Company name below logo
            doc.fontSize(12)
                .text('BODIPO BUSINESS', 50, 140);

            doc.moveDown(2);

            // REMITENTE Section
            doc.fontSize(12)
                .font('Helvetica-Bold')
                .text('REMITENTE:', 50);

            doc.moveDown(0.5);

            doc.fontSize(10)
                .font('Helvetica')
                .text(`NOMBRE: ${user?.name || ''}`, 50);

            doc.moveDown(0.3);

            // Contact, Location, Date in one line
            const y1 = doc.y;
            doc.text(`CONTACTO: ${user?.phone || ''}`, 50, y1);
            doc.text(`UBICACION: ${details?.origin || ''}`, 220, y1);
            doc.text(`FECHA: ${formattedDate}`, 420, y1);

            doc.moveDown(2);

            // DESTINATARIO Section
            doc.fontSize(12)
                .font('Helvetica-Bold')
                .text('DESTINATARIO:', 50);

            doc.moveDown(0.5);

            doc.fontSize(10)
                .font('Helvetica')
                .text(`NOMBRE: ${details?.recipient?.name || ''}`, 50);

            doc.moveDown(0.3);

            // Contact and Location
            const y2 = doc.y;
            doc.text(`CONTACTO: ${details?.recipient?.phone || ''}`, 50, y2);
            doc.text(`UBICACION: ${details?.destination || ''}`, 220, y2);

            doc.moveDown(2);

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

            // Table
            const tableTop = doc.y;
            const col1X = 50;
            const col2X = 100;
            const col3X = 330;
            const col4X = 450;
            const rowHeight = 60;

            // Table Header
            doc.rect(col1X, tableTop, 495, 25).fillAndStroke('#5F9EA0', '#5F9EA0');

            doc.fillColor('white')
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('CANT.', col1X + 5, tableTop + 7, { width: 40, align: 'center' })
                .text('DESCRIPCION', col2X + 5, tableTop + 7, { width: 220, align: 'center' })
                .text('PRECIO UNIT.', col3X + 5, tableTop + 7, { width: 110, align: 'center' })
                .text('IMPORTE', col4X + 5, tableTop + 7, { width: 90, align: 'center' });

            // Row 1 - Data
            const row1Y = tableTop + 25;
            doc.rect(col1X, row1Y, 495, rowHeight).stroke();
            doc.rect(col1X, row1Y, 50, rowHeight).stroke();
            doc.rect(col2X, row1Y, 230, rowHeight).stroke();
            doc.rect(col3X, row1Y, 120, rowHeight).stroke();
            doc.rect(col4X, row1Y, 95, rowHeight).stroke();

            doc.fillColor('black')
                .fontSize(10)
                .font('Helvetica')
                .text('1', col1X + 5, row1Y + 20, { width: 40, align: 'center' })
                .text(description, col2X + 5, row1Y + 10, { width: 220 })
                .text(`${amount} ${currency || 'EUR'}`, col3X + 5, row1Y + 20, { width: 110, align: 'right' })
                .text(`${amount} ${currency || 'EUR'}`, col4X + 5, row1Y + 20, { width: 85, align: 'right' });

            // Row 2 - Empty
            const row2Y = row1Y + rowHeight;
            doc.rect(col1X, row2Y, 50, rowHeight).stroke();
            doc.rect(col2X, row2Y, 230, rowHeight).stroke();
            doc.rect(col3X, row2Y, 120, rowHeight).stroke();
            doc.rect(col4X, row2Y, 95, rowHeight).stroke();

            // Row 3 - Empty
            const row3Y = row2Y + rowHeight;
            doc.rect(col1X, row3Y, 50, rowHeight).stroke();
            doc.rect(col2X, row3Y, 230, rowHeight).stroke();
            doc.rect(col3X, row3Y, 120, rowHeight).stroke();
            doc.rect(col4X, row3Y, 95, rowHeight).stroke();

            // TOTAL
            const totalY = row3Y + rowHeight + 20;
            doc.moveTo(50, totalY).lineTo(545, totalY).stroke();

            doc.fontSize(14)
                .font('Helvetica-Bold')
                .text(`TOTAL: ${amount} ${currency || 'EUR'}`, 50, totalY + 10, { width: 495, align: 'right' });

            // Stamp/Seal (larger)
            const stampPath = path.join(__dirname, '../assets/template.png');
            if (fs.existsSync(stampPath)) {
                doc.image(stampPath, 445, totalY + 50, { width: 150 }); // Increased from 100 to 150
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

// Keep old name for compatibility
export const generateWordReceipt = generatePDFReceipt;

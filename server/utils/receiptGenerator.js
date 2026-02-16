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

            // Logo bb (top left)
            const logoPath = path.join(__dirname, '../assets/logo.png');
            if (fs.existsSync(logoPath)) {
                try {
                    doc.image(logoPath, 50, 50, { width: 100, height: 100 });
                } catch (logoError) {
                    console.error('Error loading logo:', logoError);
                }
            }

            // BODIPO BUSINESS (below logo, left aligned)
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .text('BODIPO BUSINESS', 50, 160);

            doc.moveDown(3);

            // REM ITENTE Section
            const startY = doc.y;

            doc.fontSize(12)
                .font('Helvetica-Bold')
                .text('REMITENTE:', 50, startY);

            doc.moveDown(0.8);

            // NOMBRE
            doc.fontSize(11)
                .font('Helvetica')
                .text('NOMBRE:', 50, doc.y);

            doc.moveDown(0.5);

            doc.fontSize(11)
                .text(user?.name || '', 50, doc.y);

            doc.moveDown(1);

            // CONTACTO, UBICACION, FECHA in one row
            const infoRow = doc.y;
            doc.fontSize(11)
                .text('CONTACTO:', 50, infoRow);
            doc.text('UBICACION:', 220, infoRow);
            doc.text('FECHA:', 420, infoRow);

            doc.moveDown(0.5);

            const dataRow = doc.y;
            doc.text(user?.phone || '', 50, dataRow);
            doc.text(details?.origin || '', 220, dataRow);
            doc.text(formattedDate, 420, dataRow);

            doc.moveDown(2);

            // DESTINATARIO Section
            doc.fontSize(12)
                .font('Helvetica-Bold')
                .text('DESTINATARIO:', 50, doc.y);

            doc.moveDown(0.8);

            // NOMBRE
            doc.fontSize(11)
                .font('Helvetica')
                .text('NOMBRE:', 50, doc.y);

            doc.moveDown(0.5);

            doc.fontSize(11)
                .text(details?.recipient?.name || '', 50, doc.y);

            doc.moveDown(1);

            // CONTACTO and UBICACION
            const destInfoRow = doc.y;
            doc.fontSize(11)
                .text('CONTACTO:', 50, destInfoRow);
            doc.text('UBICACION:', 220, destInfoRow);

            doc.moveDown(0.5);

            const destDataRow = doc.y;
            doc.text(details?.recipient?.phone || '', 50, destDataRow);
            doc.text(details?.destination || '', 220, destDataRow);

            doc.moveDown(2.5);

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
            const col2X = 110;
            const col3X = 340;
            const col4X = 450;
            const rowHeight = 50;

            // Table Header with teal/green color
            doc.rect(col1X, tableTop, 495, 30).fillAndStroke('#5F9EA0', '#5F9EA0');

            doc.fillColor('white')
                .fontSize(11)
                .font('Helvetica-Bold')
                .text('CANT.', col1X + 10, tableTop + 10, { width: 50 })
                .text('DESCRIPCION', col2X + 10, tableTop + 10, { width: 220 })
                .text('PRECIO UNIT.', col3X + 5, tableTop + 10, { width: 100 })
                .text('IMPORTE', col4X + 5, tableTop + 10, { width: 90 });

            // Row 1 - Data
            const row1Y = tableTop + 30;
            doc.rect(col1X, row1Y, 60, rowHeight).stroke();
            doc.rect(col2X, row1Y, 230, rowHeight).stroke();
            doc.rect(col3X, row1Y, 110, rowHeight).stroke();
            doc.rect(col4X, row1Y, 95, rowHeight).stroke();

            doc.fillColor('black')
                .fontSize(10)
                .font('Helvetica')
                .text('1', col1X + 20, row1Y + 15, { width: 30 })
                .text(description, col2X + 5, row1Y + 10, { width: 220 })
                .text(`${amount} ${currency || 'EUR'}`, col3X + 10, row1Y + 15, { width: 90, align: 'right' })
                .text(`${amount} ${currency || 'EUR'}`, col4X + 5, row1Y + 15, { width: 85, align: 'right' });

            // Row 2 - Empty
            const row2Y = row1Y + rowHeight;
            doc.rect(col1X, row2Y, 60, rowHeight).stroke();
            doc.rect(col2X, row2Y, 230, rowHeight).stroke();
            doc.rect(col3X, row2Y, 110, rowHeight).stroke();
            doc.rect(col4X, row2Y, 95, rowHeight).stroke();

            // Row 3 - Empty  
            const row3Y = row2Y + rowHeight;
            doc.rect(col1X, row3Y, 60, rowHeight).stroke();
            doc.rect(col2X, row3Y, 230, rowHeight).stroke();
            doc.rect(col3X, row3Y, 110, rowHeight).stroke();
            doc.rect(col4X, row3Y, 95, rowHeight).stroke();

            // TOTAL
            const totalY = row3Y + rowHeight + 25;

            // Line above total
            doc.moveTo(50, totalY - 5).lineTo(545, totalY - 5).stroke();

            doc.fontSize(14)
                .font('Helvetica-Bold')
                .text('TOTAL:', 380, totalY);

            doc.fontSize(14)
                .text(`${amount} ${currency || 'EUR'}`, 450, totalY, { width: 95, align: 'right' });

            // Stamp/Seal (bottom right, larger)
            const stampPath = path.join(__dirname, '../assets/template.png');
            if (fs.existsSync(stampPath)) {
                try {
                    doc.image(stampPath, 420, totalY + 40, { width: 120, height: 120 });
                } catch (stampError) {
                    console.error('Error loading stamp:', stampError);
                }
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

// Keep old name for compatibility
export const generateWordReceipt = generatePDFReceipt;

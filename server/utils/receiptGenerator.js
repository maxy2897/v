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
            // If bulk, show 'Varios' or the first recipient
            const firstRecipient = type === 'SHIPMENT_BULK' && details?.shipments?.length > 0
                ? details.shipments[0].recipient
                : (details?.recipient || {});

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
                .text(firstRecipient.name || (type === 'SHIPMENT_BULK' ? 'Múltiples Destinatarios' : ''), 50, doc.y);

            doc.moveDown(1);

            // CONTACTO and UBICACION
            const destInfoRow = doc.y;
            doc.fontSize(11)
                .text('CONTACTO:', 50, destInfoRow);
            doc.text('UBICACION:', 220, destInfoRow);

            doc.moveDown(0.5);

            const destDataRow = doc.y;
            doc.text(firstRecipient.phone || '', 50, destDataRow);
            doc.text(details?.destination || (type === 'SHIPMENT_BULK' ? 'Varios' : ''), 220, destDataRow);

            doc.moveDown(2.5);

            // Prepare items for table
            let items = [];
            if (type === 'SHIPMENT_BULK' && details?.shipments) {
                items = details.shipments.map((s, index) => ({
                    index: index + 1,
                    description: `Envío a ${s.destination} (${s.weight}kg) - ${s.trackingNumber}`,
                    price: s.price,
                    currency: s.currency || currency || 'EUR' // Fallback
                }));
            } else {
                // Build description for single item
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

                items.push({
                    index: 1,
                    description: description,
                    price: amount,
                    currency: currency || 'EUR'
                });
            }

            // Table
            let currentY = doc.y;
            const col1X = 50;
            const col2X = 110;
            const col3X = 340;
            const col4X = 450;
            const rowHeight = 50;

            // Table Header with teal/green color
            doc.rect(col1X, currentY, 495, 30).fillAndStroke('#5F9EA0', '#5F9EA0');

            doc.fillColor('white')
                .fontSize(11)
                .font('Helvetica-Bold')
                .text('CANT.', col1X + 10, currentY + 10, { width: 50 })
                .text('DESCRIPCION', col2X + 10, currentY + 10, { width: 220 })
                .text('PRECIO UNIT.', col3X + 5, currentY + 10, { width: 100 })
                .text('IMPORTE', col4X + 5, currentY + 10, { width: 90 });

            currentY += 30;

            // Draw Rows
            doc.fillColor('black');

            items.forEach((item) => {
                // Check for page break if needed (omitted for brevity, assume receipt fits on 1 page for now)

                doc.rect(col1X, currentY, 60, rowHeight).stroke();
                doc.rect(col2X, currentY, 230, rowHeight).stroke();
                doc.rect(col3X, currentY, 110, rowHeight).stroke();
                doc.rect(col4X, currentY, 95, rowHeight).stroke();

                doc.fontSize(10)
                    .font('Helvetica')
                    .text(item.index.toString(), col1X + 20, currentY + 15, { width: 30 })
                    .text(item.description, col2X + 5, currentY + 10, { width: 220 })
                    .text(`${item.price} ${item.currency}`, col3X + 10, currentY + 15, { width: 90, align: 'right' })
                    .text(`${item.price} ${item.currency}`, col4X + 5, currentY + 15, { width: 85, align: 'right' });

                currentY += rowHeight;
            });

            // Fill remaining empty rows if less than 3 items to maintain look?
            // Optional, but let's just leave it dynamic.

            // TOTAL
            const totalY = currentY + 25;

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

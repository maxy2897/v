import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatePath = path.join(__dirname, 'server', 'assets', 'Facturas bb b.docx');

mammoth.convertToHtml({ path: templatePath })
    .then(result => {
        console.log('=== HTML CONTENT ===');
        console.log(result.value);
        console.log('=== END ===');
    })
    .catch(err => {
        console.error('Error:', err);
    });

import fs from 'fs';

const adminCode = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');
const settingsCode = fs.readFileSync('src/context/SettingsContext.tsx', 'utf-8');

// Regex for keys like t('key') or t('key', {params})
const regex = /t\(['"](admin\.[^'"]+)['"](?:,.*?)?\)/g;
const usedKeys = new Set();
let m;
while ((m = regex.exec(adminCode)) !== null) {
    usedKeys.add(m[1]);
}

const blocks = {
    es: settingsCode.substring(settingsCode.indexOf('es: {'), settingsCode.indexOf('en: {')),
    en: settingsCode.substring(settingsCode.indexOf('en: {'), settingsCode.indexOf('fr: {')),
    fr: settingsCode.substring(settingsCode.indexOf('fr: {'))
};

for (const [lang, block] of Object.entries(blocks)) {
    console.log(`--- Missing in ${lang.toUpperCase()} ---`);
    const missing = [];
    for (const key of usedKeys) {
        // Look for literal 'key': in the block
        if (!block.includes(`'${key}':`)) {
            missing.push(key);
        }
    }
    console.log(JSON.stringify(missing, null, 2));
}

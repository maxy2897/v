import mongoose from 'mongoose';

const ConfigSchema = new mongoose.Schema({
    customLogoUrl: { type: String, default: "" },
    logoText: { type: String, default: "bb" },
    rates: {
        air: {
            es_gq: { type: Number, default: 11 }, // Spain -> GQ Air
            gq_es: { type: Number, default: 15 }, // GQ -> Spain Docs
            cm_gq: { type: Number, default: 3000 } // Cameroon -> GQ
        },
        sea: {
            es_gq: { type: Number, default: 4 },  // Spain -> GQ Sea
        },
        bulto: {
            kg23: { type: Number, default: 220 },
            kg32: { type: Number, default: 310 }
        },
        exchange: {
            eur_xaf: { type: Number, default: 600 }, // 1 EUR = 600 XAF
            xaf_eur: { type: Number, default: 730 }  // 730 XAF = 1 EUR
        }
    },
    dates: {
        nextAirDeparture: { type: Date },
        nextSeaDeparture: { type: Date }
    },
    content: {
        hero: {
            title: { type: String, default: "Tu conexión segura entre España y Guinea Ecuatorial" },
            subtitle: { type: String, default: "Servicios logísticos integrales, envíos aéreos y marítimos, y soluciones empresariales adaptadas a tus necesidades." },
            ctaPrimary: { type: String, default: "Calcular Envío" },
            ctaSecondary: { type: String, default: "Contactar" },
            heroImage: { type: String, default: "" },
            moneyTransferImage: { type: String, default: "" }
        },
        social: {
            tiktok: { type: String, default: "" },
            whatsapp: { type: String, default: "" },
            instagram: { type: String, default: "" },
            facebook: { type: String, default: "" }
        },
        schedule: {
            block1: {
                month: { type: String, default: "DICIEMBRE" },
                days: { type: String, default: "12 y 19" }
            },
            block2: {
                month: { type: String, default: "ENERO" },
                days: { type: String, default: "2, 17 y 30" }
            },
            block3: {
                month: { type: String, default: "FEBRERO" },
                days: { type: String, default: "13 y 27" }
            },
            block4: {
                month: { type: String, default: "MARZO" },
                days: { type: String, default: "13 y 27" }
            }
        }
    },
    contact: {
        phones: {
            es: { type: String, default: "+34 600 000 000" },
            gq: { type: String, default: "+240 222 000 000" },
            cm: { type: String, default: "+237 687528854" }
        },
        addresses: {
            es: { type: String, default: "Calle Ejemplo, 123, Madrid" },
            gq: { type: String, default: "Barrio Ejemplo, Malabo" }
        }
    },
    bank: {
        accountNumber: { type: String, default: "" },
        iban: { type: String, default: "" },
        bizum: { type: String, default: "" },
        holder: { type: String, default: "" }
    },
    discounts: {
        active: { type: Boolean, default: false },
        percentage: { type: Number, default: 0 },
        message: { type: String, default: "" }
    },
    starRates: {
        air_es_gq: { type: String, default: '11€/Kg' },
        sea_es_gq: { type: String, default: '4€/Kg' },
        kg_cm_gq: { type: String, default: '3000 XAF' },
        docs_gq_es: { type: String, default: '15€' },
        bulto_23kg: { type: String, default: '220€' },
        bulto_32kg: { type: String, default: '310€' }
    },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Config', ConfigSchema);

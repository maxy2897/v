import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Language = 'es' | 'en' | 'fr';

interface SettingsContextType {
    theme: Theme;
    language: Language;
    toggleTheme: () => void;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    // Dynamic Config
    appConfig: DynamicConfig | null;
    refreshConfig: () => Promise<void>;
    updateConfig: (newConfig: Partial<DynamicConfig>) => Promise<void>;
}

export interface DynamicConfig {
    rates: {
        air: { es_gq: number; gq_es: number; cm_gq: number };
        sea: { es_gq: number };
        exchange: { eur_xaf: number; xaf_eur: number };
    };
    dates: {
        nextAirDeparture?: string;
        nextSeaDeparture?: string;
    };
    content: {
        hero: {
            title: string;
            subtitle: string;
            ctaPrimary: string;
            ctaSecondary: string;
        };
        social: {
            tiktok: string;
            whatsapp: string;
            instagram: string;
            facebook: string;
        };
        schedule: {
            block1: { month: string; days: string };
            block2: { month: string; days: string };
            block3: { month: string; days: string };
            block4: { month: string; days: string };
        };
    };
    contact: {
        phones: { es: string; gq: string; cm: string };
        addresses: { es: string; gq: string };
    };
    bank: {
        accountNumber: string;
        iban: string;
        bizum: string;
        holder: string;
    };
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
    es: {
        // Navigation
        'nav.calendar': 'Calendario',
        'nav.rates': 'Envíos',
        'nav.money_transfer': 'Money Transfer',
        'nav.store': 'Tienda',
        'nav.tracking': 'Rastrear Paquete',
        'nav.services': 'Servicios',
        'nav.login': 'Iniciar Sesión',
        'nav.register': 'Registrarse',
        'nav.dashboard': 'Perfil',
        'nav.logout': 'Cerrar Sesión',
        'nav.settings': 'Ajustes',

        // Home Hero
        'home.hero.title': 'Servicio Internacional',
        'home.hero.title_highlight': 'de Envíos de Paquetes.',
        'home.hero.subtitle': 'Deja tus gestiones en nuestras manos y olvídate del estrés.',
        'home.hero.cta_ship': 'Realizar Envío',
        'home.hero.cta_contact': 'Contactar',
        'home.hero.cta_register': 'Regístrate',
        'home.hero.star_service': 'Servicio Estrella',
        'home.hero.route': 'España ➔ Guinea',

        // Home Money Transfer
        'home.money.badge': 'Servicio Financiero',
        'home.money.title': 'Mueve tu dinero',
        'home.money.title_highlight': 'al mundo con nosotros.',
        'home.money.desc': 'Envía y recibe dinero de forma segura, rápida y con las mejores tasas del mercado. Conectamos tus finanzas con el resto del mundo.',
        'home.money.cta': 'Money Transfer',

        // Home Social
        'home.social.follow': 'Síguenos en nuestras redes',

        // Home Membership
        'home.member.title': '¿Todavía no eres miembro?',
        'home.member.subtitle': 'Regístrate gratis y desbloquea beneficios exclusivos en envíos por volumen',
        'home.member.cta': 'Regístrate o Inicia Sesión',

        // Money Transfer
        'transfer.badge': 'Servicio Financiero Bodipo',
        'transfer.title': 'Mueve tu dinero',
        'transfer.title_highlight': 'al mundo con nosotros.',
        'transfer.tab.es_gq': 'EURO a CFA',
        'transfer.tab.gq_es': 'CFA a EURO',
        'transfer.tab.cm_gq': 'Camerún a Guinea',
        'transfer.sender.title': 'Datos del Remitente',
        'transfer.sender.name': 'Nombre Completo',
        'transfer.sender.id': 'ID / Pasaporte',
        'transfer.sender.phone': 'Teléfono',
        'transfer.bene.title': 'Datos del Beneficiario',
        'transfer.bene.name': 'Nombre Completo',
        'transfer.bene.id_passport': 'ID / Pasaporte Beneficiario',
        'transfer.bene.phone': 'Número de Teléfono',
        'transfer.bene.iban': 'IBAN Destino',
        'transfer.bene.bizum': 'Número de Bizum',
        'transfer.amount.label': 'Cantidad a Enviar',
        'transfer.amount.receive_label': 'Recibirá aproximadamente',
        'transfer.amount.total_label': 'Costo total con cargo 4%',
        'transfer.tasa': 'Tasa',
        'transfer.cargo': 'Cargo por servicio',
        'transfer.slogan': 'Del mundo hasta Guinea con Nosotros',
        'transfer.proof.label': 'Subir Comprobante de Operación',
        'transfer.proof.cta': 'Adjunta imagen o PDF del ingreso',
        'transfer.proof.select': 'Seleccionar archivo',
        'transfer.cta.submit': 'Notificar Envío de Dinero',
        'transfer.cta.processing': 'Procesando...',
        'transfer.accounts.title': 'Cuentas para Transferencias',
        'transfer.accounts.guinea.bank': 'Ecobank Equatorial Guinea',
        'transfer.accounts.spain.bank': 'España (Revolut)',
        'transfer.accounts.cameroon.bank': 'Sede Camerún',
        'transfer.accounts.name_label': 'Titular',
        'transfer.accounts.iban_label': 'IBAN / Número de cuenta',
        'transfer.accounts.swift_label': 'Código SWIFT',
        'transfer.info.text': 'Puedes mover tu dinero desde Guinea Ecuatorial hasta el mundo.',
        'transfer.alert.success': '¡Solicitud enviada con éxito! Procesaremos su transferencia en breve.',
        'transfer.alert.error': 'Error: ',
        'transfer.alert.required': 'Por favor complete todos los campos requeridos y adjunte el comprobante.',

        // Calculator
        'calc.badge': 'Envíos Oficiales 2026',
        'calc.title': 'Calcula tu',
        'calc.title_highlight': 'Envío',
        'calc.origin.label': 'País de Origen',
        'calc.origin.es': 'España',
        'calc.origin.cm': 'Camerún',
        'calc.origin.gq': 'Guinea',
        'calc.mode.kg': 'Kilos',
        'calc.mode.bulto': 'Bultos',
        'calc.mode.doc': 'Documentos',
        'calc.service.label': 'Tipo de Servicio',
        'calc.service.air': 'Aéreo',
        'calc.service.sea': 'Marítimo (BIO)',
        'calc.service.sea_warn': '⚠️ Tiempo estimado: 25-30 días',
        'calc.dest.label': 'Destino',
        'calc.dest.malabo': 'Malabo',
        'calc.dest.bata': 'Bata',
        'calc.weight.label': 'Peso Total (kg)',
        'calc.bulto.label': 'Selecciona tu Bulto',
        'calc.doc.title': 'Envíos de Documentos',
        'calc.doc.flat_rate': 'Tarifa Plana',
        'calc.doc.route': 'Ruta Directa: 🇬🇶 Guinea Ecuatorial -> 🇪🇸 España',
        'calc.cta.view_cost': 'Ver Coste Envío',
        'calc.result.badge': 'Importe de Envío',
        'calc.result.pay_options': 'Opciones de Pago Disponibles',
        'calc.result.pay_origin': 'Pagar en',
        'calc.result.pay_almacen': 'Pagar en Guinea (Efectivo en almacén)',
        'calc.result.pay_ecobank': 'Pagar en Guinea (Ingreso Ecobank)',
        'calc.result.cta_register': 'Registrar Paquete',
        'calc.form.title': 'Datos del Remitente',
        'calc.form.subtitle': 'Generar comprobante oficial',
        'calc.form.name': 'Nombre Completo',
        'calc.form.phone': 'Teléfono',
        'calc.form.id': 'DNI / DIP',
        'calc.form.pay_confirm': 'Confirmar Método de Pago',
        'calc.form.pay_in': 'Pagar en',
        'calc.form.pay_almacen_short': 'En Almacén',
        'calc.form.pay_ecobank_short': 'Vía Ecobank',
        'calc.form.cta_finish': 'Finalizar y Registrar',
        'calc.form.processing': 'Procesando...',
        'calc.success.badge': 'Registro Exitoso',
        'calc.success.hello': 'Hola',
        'calc.success.completed': 'registro completado',
        'calc.success.tracking_label': 'Código de Rastreo',
        'calc.success.copy': 'Copiar Código',
        'calc.success.pay_location': 'Lugar de Pago',
        'calc.success.new_calc': 'Nuevo Envío',
        'calc.alert.params': 'Por favor, rellena todos los datos personales.',
        'calc.alert.copied': 'Código copiado al portapapeles',
        'calc.sender_info': 'Datos del Remitente',
        'calc.recipient_info': 'Datos del Destinatario',


        // Services
        'services.routes_badge': 'Rutas Disponibles 2026',
        'services.title': 'Conectamos',
        'services.title_highlight': 'Naciones',
        'services.main.badge': 'Servicio Principal',
        'services.main.name': 'España a Guinea Ecuatorial',
        'services.main.desc': 'Envíos desde 11€/Kg. Salidas semanales.',
        'services.regional.badge': 'Conexión Regional',
        'services.regional.name': 'Camerún a Guinea Ecuatorial',
        'services.regional.desc': 'Logística rápida desde nuestra sede en Yaoundé.',
        'services.national.badge': 'Nacional G.E.',
        'services.national.name': 'Malabo ↔ Bata',
        'services.national.desc': 'Envíos interurbanos diarios garantizados.',
        'services.rates.title': 'Tarifas Estrella',

        // Tracking
        'track.title': 'Rastrea tu paquete',
        'track.subtitle': 'Introduce el código generado al registrar tu paquete',
        'track.placeholder': 'Ej: BB-7X9K2',
        'track.cta': 'Rastrear',
        'track.result.id_label': 'Código',
        'track.result.status_main': 'Procesando Recepción',
        'track.result.status_badge': 'Estado General',
        'track.result.status_loc': 'En Almacén Madrid',
        'track.step.registered': 'Paquete Registrado',
        'track.step.pending': 'En espera de expedición',
        'track.step.transit': 'Tránsito Internacional',
        'track.step.arrival': 'Llegada a Destino',
        'track.loc.madrid': 'Centro Bodipo Madrid',
        'track.loc.alcala': 'Almacén Alcala',
        'track.loc.barajas': 'Aeropuerto Barajas',
        'track.loc.customs': 'Aduanas Malabo/Bata',
        'track.date.ongoing': 'En curso',

        // Dashboard
        'dash.title': 'Mi Dashboard',
        'dash.welcome': 'Bienvenido',
        'dash.btn.logout': 'Cerrar Sesión',
        'dash.profile.title': 'Mi Perfil',
        'dash.profile.edit': 'Editar',
        'dash.profile.cancel': 'Cancelar',
        'dash.profile.username': 'Nombre de Usuario',
        'dash.profile.name': 'Nombre Completo',
        'dash.profile.email': 'Email',
        'dash.profile.phone': 'Teléfono',
        'dash.profile.address': 'Dirección',
        'dash.profile.save': 'Guardar Cambios',
        'dash.profile.saving': 'Guardando...',
        'dash.profile.not_specified': 'No especificado',
        'dash.profile.discount_title': 'Descuento Activo',
        'dash.profile.discount_desc': 'En tu próximo envío',
        'dash.ship.title': 'Mis Envíos',
        'dash.invoices.title': 'Mis Facturas',
        'dash.invoices.loading': 'Cargando facturas...',
        'dash.invoices.no_invoices': 'No hay facturas disponibles',
        'dash.invoices.shipment': 'Envío',
        'dash.invoices.transfer': 'Transferencia',
        'dash.invoices.download': 'Descargar Factura',
        'dash.invoices.ship_to': 'ENVÍO A',
        'dash.invoices.transfer_to': 'TRANSFERENCIA A',
        'dash.ship.loading': 'Cargando envíos...',
        'dash.ship.no_shipments': 'No tienes envíos registrados',
        'dash.ship.empty_desc': 'Tus envíos aparecerán aquí una vez que los registres',
        'dash.ship.tracking_label': 'Número de Rastreo',
        'dash.ship.origin': 'Origen',
        'dash.ship.dest': 'Destino',
        'dash.ship.weight': 'Peso',
        'dash.ship.price': 'Precio',
        'dash.ship.description': 'Descripción',
        'dash.ship.created': 'Creado',
        'dash.alert.update_success': 'Perfil actualizado exitosamente',
        'dash.alert.update_error': 'Error al actualizar perfil',
        'dash.status.delivered': 'Entregado',
        'dash.status.transit': 'En Tránsito',
        'dash.status.customs': 'En Aduana',
        'dash.search_placeholder': 'Buscar por código, origen, destino...',

        // Schedule
        'schedule.title': 'Calendario de',
        'schedule.title_highlight': 'Expediciones',
        'schedule.status_operating': 'Estado: Operativo 2026',
        'schedule.current_month_label': 'Mes en curso',
        'schedule.next_departure': 'Próxima Salida',
        'schedule.service_type': 'Tipo de Servicio',
        'schedule.destination': 'Destino',
        'schedule.book_slot': 'Reservar slot',
        'schedule.docs_title': 'Documentos G.E. -> ES',
        'schedule.docs_desc': 'Salidas semanales. Consultar anuncio en WhatsApp.',
        'schedule.docs_rate': '15€ Tarifa Fija',
        'schedule.notice_title': 'Aviso Importante para Envíos',
        'schedule.notice_desc': 'Los paquetes deben estar en nuestros almacenes a más tardar el día anterior a la salida a las 15:00 para garantizar su embarque.',
        'schedule.overview_title': 'Programación 2026 - Vista General',
        'schedule.current_month_badge': 'Mes Actual',
        'schedule.programming_badge': 'Programación',

        // AIChat
        'chat.welcome': '¡Hola! Bienvenido al asistente virtual de Bodipo. Estoy aquí para ayudarle.',
        'chat.error': 'Lo siento, no puedo conectar con la IA. Por favor, revisa que la clave VITE_GEMINI_API_KEY esté bien configurada en Vercel o contáctanos por teléfono.',
        'chat.cta': 'Chat de Ayuda',
        'chat.online': 'En Línea',
        'chat.close': 'Cerrar chat',
        'chat.send': 'Enviar mensaje',
        'chat.placeholder': 'Escribe tu consulta...',
        'chat.system': 'Bodipo Intelligence System',

        // Login
        'login.title': 'Iniciar Sesión',
        'login.welcome': 'Bienvenido de vuelta',
        'login.email': 'Correo Electrónico',
        'login.password': 'Contraseña',
        'login.forgot': '¿Olvidaste tu contraseña?',
        'login.btn': 'Entrar',
        'login.no_account': '¿No tienes cuenta?',
        'login.register_link': 'Regístrate',
        'login.error.fields': 'Por favor completa todos los campos',
        'login.error.general': 'Error al iniciar sesión',
        'login.loading': 'Iniciando sesión...',

        // Register
        'register.title': 'Club BodipoBusiness',
        'register.subtitle': 'Beneficios Exclusivos',
        'register.promo': 'Regístrate hoy y recibe un 10% de descuento inmediato en tu próximo envío.',
        'register.name': 'Nombre Completo',
        'register.email': 'Correo Electrónico',
        'register.password': 'Contraseña',
        'register.phone': 'Teléfono',
        'register.address': 'Dirección',
        'register.privacy_accept': 'Acepto las políticas de privacidad de BODIPO BUSINESS',
        'register.btn': 'Crear Cuenta',
        'register.loading': 'Creando cuenta...',
        'register.success': '¡Registro exitoso! Bienvenido a Bodipo Business',
        'register.error.privacy': 'Debes aceptar la política de privacidad',
        'register.error.fields': 'Por favor completa todos los campos requeridos',
        'register.error.password': 'La contraseña debe tener al menos 6 caracteres',
        'register.error.general': 'Error al registrar usuario',

        // Store
        'store.badge': 'Bodipo Official Merch',
        'store.title': 'Bodipo',
        'store.title_highlight': 'Collection.',
        'store.desc': 'Nuestra ropa no es solo moda, es una declaración de intenciones. Calidad premium con envío internacional incluido.',
        'store.price_final': 'Precio Final',
        'store.envio_incluido': 'Envío Incluido',
        'store.stock': 'Stock Disponible',
        'store.zoom': 'Click para ampliar',
        'store.buy_wa': 'Comprar vía WhatsApp',
        'store.safe_payments': 'Pagos Seguros',
        'store.office_pickup': 'Recogida en Oficina',

        // Privacy
        'privacy.title': 'Política de Privacidad',
        'privacy.last_update': 'Última actualización: Enero 2026',
        'privacy.back': 'Volver al Inicio',
        'privacy.sec1_title': '1. Responsable del Tratamiento',
        'privacy.sec1_content': 'El responsable del tratamiento de los datos personales recogidos a través de la aplicación y sitio web BODIPO BUSINESS es BODIPO BUSINESS, con actividad en la República de Guinea Ecuatorial.',
        'privacy.sec2_title': '2. Datos Personales Recopilados',
        'privacy.sec2_content': 'BODIPO BUSINESS podrá recopilar los siguientes datos personales:',
        'privacy.sec3_title': '3. Finalidad del Tratamiento de los Datos',
        'privacy.sec3_content': 'Los datos personales serán tratados con las siguientes finalidades:',
        'privacy.sec4_title': '4. Base Legal del Tratamiento',
        'privacy.sec5_title': '5. Conservación de los Datos',
        'privacy.sec6_title': '6. Cesión de Datos a Terceros',
        'privacy.sec7_title': '7. Seguridad de los Datos',
        'privacy.sec8_title': '8. Derechos del Usuario',
        'privacy.sec9_title': '9. Datos de Menores',
        'privacy.sec10_title': '10. Uso de Cookies y Tecnologías Similares',
        'privacy.sec11_title': '11. Modificaciones de la Política de Privacidad',
        'privacy.sec12_title': '12. Legislación Aplicable',
        'privacy.list_personal_data': 'Nombre, apellidos, teléfono, correo electrónico, dirección física.',
        'privacy.list_purposes': 'Gestionar pedidos, atender consultas, cumplir obligaciones legales.',
        'privacy.list_rights': 'Acceso, rectificación, eliminación y oposición.',

        // Client
        'client.welcome': 'Bienvenido a Bodipo',
        'client.premium_area': 'Premium Logistics Area',
        'client.footer_title': 'Únete a la élite logística.',
        'client.footer_desc': 'Gestiona tus envíos con prioridad absoluta y ventajas exclusivas.',

        // Shared/Footer
        'footer.rights': 'Todos los derechos reservados',
        'theme.dark': 'Modo Oscuro',
        'theme.light': 'Modo Claro',
        'btn.back': 'Volver atrás',
        'btn.forward': 'Ir adelante',

        // New Footer Keys
        'footer.logistics_desc': 'Logística de excelencia conectando España 🇪🇸, Camerún 🇨🇲 y Guinea Ecuatorial 🇬🇶. Operaciones diarias con los más altos estándares de seguridad.',
        'footer.admin_access': 'Acceso Admin',
        'footer.direct_contact': 'Contacto Directo',
        'footer.spain': 'España',
        'footer.cameroon': 'Camerún',
        'footer.guinea': 'Guinea Ecuatorial',
        'footer.logistics_services': 'Servicios Logísticos',
        'footer.calc_rates': 'Calculadora de Tarifas',
        'footer.calendar': 'Calendario Mensual',
        'footer.tracking': 'Rastreo en Tiempo Real',
        'footer.advisor': 'Asesor de Servicios',
        'footer.locations': 'BODIPO BUSINESS S.L.',
        'footer.loc.madrid': 'Alcalá de Henares, Madrid 🇪🇸',
        'footer.loc.yaounde': 'Universidad Católica, Yaoundé 🇨🇲',
        'footer.loc.gq': 'Malabo & Bata, G.E. 🇬🇶',
        'footer.copyright': '© 2026 BODIPO BUSINESS S.L.',
    },
    en: {
        // Navigation
        'nav.calendar': 'Calendar',
        'nav.rates': 'Shipments',
        'nav.money_transfer': 'Money Transfer',
        'nav.store': 'Store',
        'nav.tracking': 'Track Package',
        'nav.services': 'Services',
        'nav.login': 'Login',
        'nav.register': 'Register',
        'nav.dashboard': 'Profile',
        'nav.logout': 'Logout',
        'nav.settings': 'Settings',

        // Home Hero
        'home.hero.title': 'International Package',
        'home.hero.title_highlight': 'Shipping Service.',
        'home.hero.subtitle': 'Leave your management in our hands and forget about stress.',
        'home.hero.cta_ship': 'Ship Now',
        'home.hero.cta_contact': 'Contact Us',
        'home.hero.cta_register': 'Register',
        'home.hero.star_service': 'Star Service',
        'home.hero.route': 'Spain ➔ Guinea',

        // Home Money Transfer
        'home.money.badge': 'Financial Service',
        'home.money.title': 'Move your money',
        'home.money.title_highlight': 'to the world with us.',
        'home.money.desc': 'Send and receive money safely, quickly and with the best rates in the market. We connect your finances with the rest of the world.',
        'home.money.cta': 'Money Transfer',

        // Home Social
        'home.social.follow': 'Follow us on social media',

        // Home Membership
        'home.member.title': 'Not a member yet?',
        'home.member.subtitle': 'Register for free and unlock exclusive benefits on volume shipments',
        'home.member.cta': 'Register or Login',

        // Money Transfer
        'transfer.badge': 'Bodipo Financial Service',
        'transfer.title': 'Move your money',
        'transfer.title_highlight': 'globally with us.',
        'transfer.tab.es_gq': 'EURO to CFA',
        'transfer.tab.gq_es': 'CFA to EURO',
        'transfer.tab.cm_gq': 'Cameroon to Guinea',
        'transfer.sender.title': 'Sender Information',
        'transfer.sender.name': 'Full Name',
        'transfer.sender.id': 'ID / Passport',
        'transfer.sender.phone': 'Phone',
        'transfer.bene.title': 'Beneficiary Information',
        'transfer.bene.name': 'Full Name',
        'transfer.bene.id_passport': 'ID / Passport Beneficiary',
        'transfer.bene.phone': 'Phone Number',
        'transfer.bene.iban': 'Destination IBAN',
        'transfer.bene.bizum': 'Bizum Number',
        'transfer.amount.label': 'Amount to Send',
        'transfer.amount.receive_label': 'Will receive approximately',
        'transfer.amount.total_label': 'Total cost with 4% fee',
        'transfer.tasa': 'Rate',
        'transfer.cargo': 'Service fee',
        'transfer.slogan': 'From the world to Guinea with Us',
        'transfer.proof.label': 'Upload Proof of Operation',
        'transfer.proof.cta': 'Attach image or PDF of the deposit',
        'transfer.proof.select': 'Select file',
        'transfer.cta.submit': 'Notify Money Transfer',
        'transfer.cta.processing': 'Processing...',
        'transfer.accounts.title': 'Transfer Accounts',
        'transfer.accounts.guinea.bank': 'Ecobank Equatorial Guinea',
        'transfer.accounts.spain.bank': 'Spain (Revolut)',
        'transfer.accounts.cameroon.bank': 'Cameroon Headquarters',
        'transfer.accounts.name_label': 'Holder',
        'transfer.accounts.iban_label': 'IBAN / Account Number',
        'transfer.accounts.swift_label': 'SWIFT Code',
        'transfer.info.text': 'You can move your money from Equatorial Guinea to the world.',
        'transfer.alert.success': 'Request sent successfully! We will process your transfer shortly.',
        'transfer.alert.error': 'Error: ',
        'transfer.alert.required': 'Please complete all required fields and attach proof.',

        // Calculator
        'calc.badge': 'Official Shipments 2026',
        'calc.title': 'Calculate your',
        'calc.title_highlight': 'Shipment',
        'calc.origin.label': 'Country of Origin',
        'calc.origin.es': 'Spain',
        'calc.origin.cm': 'Cameroon',
        'calc.origin.gq': 'Guinea',
        'calc.mode.kg': 'Kilos',
        'calc.mode.bulto': 'Packages',
        'calc.mode.doc': 'Documents',
        'calc.service.label': 'Service Type',
        'calc.service.air': 'Air',
        'calc.service.sea': 'Sea (BIO)',
        'calc.service.sea_warn': '⚠️ Estimated time: 25-30 days',
        'calc.dest.label': 'Destination',
        'calc.dest.malabo': 'Malabo',
        'calc.dest.bata': 'Bata',
        'calc.weight.label': 'Total Weight (kg)',
        'calc.bulto.label': 'Select your Package',
        'calc.doc.title': 'Document Shipments',
        'calc.doc.flat_rate': 'Flat Rate',
        'calc.doc.route': 'Direct Route: 🇬🇶 Guinea Ecuatorial -> 🇪🇸 Spain',
        'calc.cta.view_cost': 'View Shipping Cost',
        'calc.result.badge': 'Shipping Amount',
        'calc.result.pay_options': 'Available Payment Options',
        'calc.result.pay_origin': 'Pay in',
        'calc.result.pay_almacen': 'Pay in Guinea (Cash at warehouse)',
        'calc.result.pay_ecobank': 'Pay in Guinea (Ecobank Deposit)',
        'calc.result.cta_register': 'Register Package',
        'calc.form.title': 'Sender Information',
        'calc.form.subtitle': 'Generate official receipt',
        'calc.form.name': 'Full Name',
        'calc.form.phone': 'Phone',
        'calc.form.id': 'DNI / DIP',
        'calc.form.pay_confirm': 'Confirm Payment Method',
        'calc.form.pay_in': 'Pay in',
        'calc.form.pay_almacen_short': 'At Warehouse',
        'calc.form.pay_ecobank_short': 'Via Ecobank',
        'calc.form.cta_finish': 'Finish and Register',
        'calc.form.processing': 'Processing...',
        'calc.success.badge': 'Successful Registration',
        'calc.success.hello': 'Hello',
        'calc.success.completed': 'registration completed',
        'calc.success.tracking_label': 'Tracking Code',
        'calc.success.copy': 'Copy Code',
        'calc.success.pay_location': 'Payment Location',
        'calc.success.new_calc': 'New Shipment',
        'calc.alert.params': 'Please fill in all personal data.',
        'calc.alert.copied': 'Code copied to clipboard',
        'calc.sender_info': 'Sender Information',
        'calc.recipient_info': 'Recipient Information',


        // Services
        'services.routes_badge': 'Available Routes 2026',
        'services.title': 'Connecting',
        'services.title_highlight': 'Nations',
        'services.main.badge': 'Main Service',
        'services.main.name': 'Spain to Equatorial Guinea',
        'services.main.desc': 'Shipments from 11€/Kg. Weekly departures.',
        'services.regional.badge': 'Regional Connection',
        'services.regional.name': 'Cameroon to Equatorial Guinea',
        'services.regional.desc': 'Fast logistics from our headquarters in Yaoundé.',
        'services.national.badge': 'National E.G.',
        'services.national.name': 'Malabo ↔ Bata',
        'services.national.desc': 'Guaranteed daily intercity shipments.',
        'services.rates.title': 'Star Rates',

        // Tracking
        'track.title': 'Track your package',
        'track.subtitle': 'Enter the code generated when registering your package',
        'track.placeholder': 'Ex: BB-7X9K2',
        'track.cta': 'Track',
        'track.result.id_label': 'Code',
        'track.result.status_main': 'Processing Reception',
        'track.result.status_badge': 'Overall Status',
        'track.result.status_loc': 'In Madrid Warehouse',
        'track.step.registered': 'Package Registered',
        'track.step.pending': 'Awaiting Dispatch',
        'track.step.transit': 'International Transit',
        'track.step.arrival': 'Arrival at Destination',
        'track.loc.madrid': 'Bodipo Madrid Center',
        'track.loc.alcala': 'Alcala Warehouse',
        'track.loc.barajas': 'Barajas Airport',
        'track.loc.customs': 'Malabo/Bata Customs',
        'track.date.ongoing': 'Ongoing',

        // Dashboard
        'dash.title': 'My Dashboard',
        'dash.welcome': 'Welcome',
        'dash.btn.logout': 'Logout',
        'dash.profile.title': 'My Profile',
        'dash.profile.edit': 'Edit',
        'dash.profile.cancel': 'Cancel',
        'dash.profile.username': 'Username',
        'dash.profile.name': 'Full Name',
        'dash.profile.email': 'Email',
        'dash.profile.phone': 'Phone',
        'dash.profile.address': 'Address',
        'dash.profile.save': 'Save Changes',
        'dash.profile.not_specified': 'Not specified',
        'dash.profile.discount_title': 'Active Discount',
        'dash.profile.discount_desc': 'On your next shipment',
        'dash.ship.title': 'My Shipments',
        'dash.invoices.title': 'My Invoices',
        'dash.invoices.loading': 'Loading invoices...',
        'dash.invoices.no_invoices': 'No invoices available',
        'dash.invoices.shipment': 'Shipment',
        'dash.invoices.transfer': 'Transfer',
        'dash.invoices.download': 'Download Invoice',
        'dash.invoices.ship_to': 'SHIPMENT TO',
        'dash.invoices.transfer_to': 'TRANSFER TO',
        'dash.ship.loading': 'Loading shipments...',
        'dash.ship.no_shipments': 'No registered shipments',
        'dash.ship.empty_desc': 'Your shipments will appear here once you register them',
        'dash.ship.tracking_label': 'Tracking Number',
        'dash.ship.origin': 'Origin',
        'dash.ship.dest': 'Destination',
        'dash.ship.weight': 'Weight',
        'dash.ship.price': 'Price',
        'dash.ship.description': 'Description',
        'dash.ship.created': 'Created',
        'dash.alert.update_success': 'Profile updated successfully',
        'dash.alert.update_error': 'Error updating profile',
        'dash.status.delivered': 'Delivered',
        'dash.status.transit': 'In Transit',
        'dash.status.customs': 'In Customs',
        'dash.search_placeholder': 'Search by code, origin, destination...',

        // Schedule
        'schedule.title': 'Shipping',
        'schedule.title_highlight': 'Schedule',
        'schedule.status_operating': 'Status: Operating 2026',
        'schedule.current_month_label': 'Current Month',
        'schedule.next_departure': 'Next Departure',
        'schedule.service_type': 'Service Type',
        'schedule.destination': 'Destination',
        'schedule.book_slot': 'Book slot',
        'schedule.docs_title': 'E.G. -> ES Documents',
        'schedule.docs_desc': 'Weekly departures. Check WhatsApp announcement.',
        'schedule.docs_rate': '15€ Flat Rate',
        'schedule.notice_title': 'Important Shipping Notice',
        'schedule.notice_desc': 'Packages must be in our warehouses no later than the day before departure at 15:00 to guarantee shipment.',
        'schedule.overview_title': '2026 Programming - Overview',
        'schedule.current_month_badge': 'Current Month',
        'schedule.programming_badge': 'Programming',

        // AIChat
        'chat.welcome': 'Hello! Welcome to the Bodipo virtual assistant. I am here to help you.',
        'chat.error': 'I am sorry, I cannot answer right now. Please contact us via our phone numbers or social media.',
        'chat.cta': 'Help Chat',
        'chat.online': 'Online',
        'chat.close': 'Close chat',
        'chat.send': 'Send message',
        'chat.placeholder': 'Type your inquiry...',
        'chat.system': 'Bodipo Intelligence System',

        // Login
        'login.title': 'Login',
        'login.welcome': 'Welcome back',
        'login.email': 'Email Address',
        'login.password': 'Password',
        'login.forgot': 'Forgot your password?',
        'login.btn': 'Enter',
        'login.no_account': 'Don\'t have an account?',
        'login.register_link': 'Register',
        'login.error.fields': 'Please fill in all fields',
        'login.error.general': 'Error logging in',
        'login.loading': 'Logging in...',

        // Register
        'register.title': 'BodipoBusiness Club',
        'register.subtitle': 'Exclusive Benefits',
        'register.promo': 'Register today and receive an immediate 10% discount on your next shipment.',
        'register.name': 'Full Name',
        'register.email': 'Email Address',
        'register.password': 'Password',
        'register.phone': 'Phone Number',
        'register.address': 'Address',
        'register.privacy_accept': 'I accept BODIPO BUSINESS privacy policies',
        'register.btn': 'Create Account',
        'register.loading': 'Creating account...',
        'register.success': 'Registration successful! Welcome to Bodipo Business',
        'register.error.privacy': 'You must accept the privacy policy',
        'register.error.fields': 'Please fill in all required fields',
        'register.error.password': 'Password must be at least 6 characters long',
        'register.error.general': 'Error registering user',

        // Store
        'store.badge': 'Bodipo Official Merch',
        'store.title': 'Bodipo',
        'store.title_highlight': 'Collection.',
        'store.desc': 'Our clothing is not just fashion, it\'s a statement. Premium quality with international shipping included.',
        'store.price_final': 'Final Price',
        'store.envio_incluido': 'Shipping Included',
        'store.stock': 'Available Stock',
        'store.zoom': 'Click to enlarge',
        'store.buy_wa': 'Buy via WhatsApp',
        'store.safe_payments': 'Safe Payments',
        'store.office_pickup': 'Office Pickup',

        // Privacy
        'privacy.title': 'Privacy Policy',
        'privacy.last_update': 'Last update: January 2026',
        'privacy.back': 'Back to Home',
        'privacy.sec1_title': '1. Data Controller',
        'privacy.sec1_content': 'The body responsible for the processing of personal data collected through the BODIPO BUSINESS application and website is BODIPO BUSINESS, operating in the Republic of Equatorial Guinea.',
        'privacy.sec2_title': '2. Personal Data Collected',
        'privacy.sec2_content': 'BODIPO BUSINESS may collect the following personal data:',
        'privacy.sec3_title': '3. Purpose of Data Processing',
        'privacy.sec3_content': 'Personal data will be processed for the following purposes:',
        'privacy.sec4_title': '4. Legal Basis for Processing',
        'privacy.sec5_title': '5. Data Retention',
        'privacy.sec6_title': '6. Disclosure of Data to Third Parties',
        'privacy.sec7_title': '7. Data Security',
        'privacy.sec8_title': '8. User Rights',
        'privacy.sec9_title': '9. Minors\' Data',
        'privacy.sec10_title': '10. Use of Cookies and Similar Technologies',
        'privacy.sec11_title': '11. Modifications to the Privacy Policy',
        'privacy.sec12_title': '12. Applicable Law',
        'privacy.list_personal_data': 'First and last name, phone number, email address, physical address.',
        'privacy.list_purposes': 'Manage orders, answer inquiries, comply with legal obligations.',
        'privacy.list_rights': 'Access, rectification, deletion, and opposition.',

        // Client
        'client.welcome': 'Welcome to Bodipo',
        'client.premium_area': 'Premium Logistics Area',
        'client.footer_title': 'Join the logistics elite.',
        'client.footer_desc': 'Manage your shipments with absolute priority and exclusive advantages.',

        // Shared/Footer
        'footer.rights': 'All rights reserved',
        'theme.dark': 'Dark Mode',
        'theme.light': 'Light Mode',
        'btn.back': 'Go back',
        'btn.forward': 'Go forward',

        // New Footer Keys
        'footer.logistics_desc': 'Excellence logistics connecting Spain 🇪🇸, Cameroon 🇨🇲 and Equatorial Guinea 🇬🇶. Daily operations with the highest safety standards.',
        'footer.admin_access': 'Admin Access',
        'footer.direct_contact': 'Direct Contact',
        'footer.spain': 'Spain',
        'footer.cameroon': 'Cameroon',
        'footer.guinea': 'Equatorial Guinea',
        'footer.logistics_services': 'Logistics Services',
        'footer.calc_rates': 'Rate Calculator',
        'footer.calendar': 'Monthly Calendar',
        'footer.tracking': 'Real-Time Tracking',
        'footer.advisor': 'Service Advisor',
        'footer.locations': 'BODIPO BUSINESS S.L.',
        'footer.loc.madrid': 'Alcalá de Henares, Madrid 🇪🇸',
        'footer.loc.yaounde': 'Catholic University, Yaoundé 🇨🇲',
        'footer.loc.gq': 'Malabo & Bata, E.G. 🇬🇶',
        'footer.copyright': '© 2026 BODIPO BUSINESS S.L.',
    },
    fr: {
        // Navigation
        'nav.calendar': 'Calendrier',
        'nav.rates': 'Expéditions',
        'nav.money_transfer': 'Transfert d\'Argent',
        'nav.store': 'Boutique',
        'nav.tracking': 'Suivre Colis',
        'nav.services': 'Services',
        'nav.login': 'Connexion',
        'nav.register': 'S\'inscrire',
        'nav.dashboard': 'Profil',
        'nav.logout': 'Déconnexion',
        'nav.settings': 'Paramètres',

        // Home Hero
        'home.hero.title': 'Service International',
        'home.hero.title_highlight': 'd\'Expédition de Colis.',
        'home.hero.subtitle': 'Laissez vos gestions entre nos mains et oubliez le stress.',
        'home.hero.cta_ship': 'Envoyer Maintenant',
        'home.hero.cta_contact': 'Contactez-nous',
        'home.hero.cta_register': 'S\'inscrire',
        'home.hero.star_service': 'Service Étoile',
        'home.hero.route': 'Espagne ➔ Guinée',

        // Home Money Transfer
        'home.money.badge': 'Service Financier',
        'home.money.title': 'Déplacez votre argent',
        'home.money.title_highlight': 'vers le monde avec nous.',
        'home.money.desc': 'Envoyez et recevez de l\'argent en toute sécurité, rapidement et avec les meilleurs taux du marché. Nous connectons vos finances avec le reste du monde.',
        'home.money.cta': 'Transfert d\'Argent',

        // Home Social
        'home.social.follow': 'Suivez-nous sur les réseaux sociaux',

        // Home Membership
        'home.member.title': 'Pas encore membre ?',
        'home.member.subtitle': 'Inscrivez-vous gratuitement et débloquez des avantages exclusifs sur les envois en volume',
        'home.member.cta': 'S\'inscrire ou Se Connecter',

        // Money Transfer
        'transfer.badge': 'Service Financier Bodipo',
        'transfer.title': 'Déplacez votre argent',
        'transfer.title_highlight': 'dans le monde avec nous.',
        'transfer.tab.es_gq': 'EURO vers CFA',
        'transfer.tab.gq_es': 'CFA vers EURO',
        'transfer.tab.cm_gq': 'Cameroun vers Guinée',
        'transfer.sender.title': 'Informations sur l\'Expéditeur',
        'transfer.sender.name': 'Nom Complet',
        'transfer.sender.id': 'ID / Passeport',
        'transfer.sender.phone': 'Téléphone',
        'transfer.bene.title': 'Informations sur le Bénéficiaire',
        'transfer.bene.name': 'Nom Complet',
        'transfer.bene.id_passport': 'ID / Passeport du Bénéficiaire',
        'transfer.bene.phone': 'Numéro de Téléphone',
        'transfer.bene.iban': 'IBAN de Destination',
        'transfer.bene.bizum': 'Numéro Bizum',
        'transfer.amount.label': 'Montant à Envoyer',
        'transfer.amount.receive_label': 'Recevra environ',
        'transfer.amount.total_label': 'Coût total avec frais de 4%',
        'transfer.tasa': 'Taux',
        'transfer.cargo': 'Frais de service',
        'transfer.slogan': 'Du monde vers la Guinée avec Nous',
        'transfer.proof.label': 'Télécharger la Preuve d\'Opération',
        'transfer.proof.cta': 'Joindre une image ou un PDF du dépôt',
        'transfer.proof.select': 'Sélectionner un fichier',
        'transfer.cta.submit': 'Notifier l\'Envoi d\'Argent',
        'transfer.cta.processing': 'Traitement...',
        'transfer.accounts.title': 'Comptes de Transfert',
        'transfer.accounts.guinea.bank': 'Ecobank Guinée Équatoriale',
        'transfer.accounts.spain.bank': 'Espagne (Revolut)',
        'transfer.accounts.cameroon.bank': 'Siège Cameroun',
        'transfer.accounts.name_label': 'Titulaire',
        'transfer.accounts.iban_label': 'IBAN / Numéro de compte',
        'transfer.accounts.swift_label': 'Code SWIFT',
        'transfer.info.text': 'Vous pouvez déplacer votre argent de la Guinée Équatoriale vers le monde.',
        'transfer.alert.success': 'Demande envoyée avec succès ! Nous traiterons votre transfert sous peu.',
        'transfer.alert.error': 'Erreur: ',
        'transfer.alert.required': 'Veuillez remplir tous les champs obligatoires et joindre une preuve.',

        // Calculator
        'calc.badge': 'Expéditions Officielles 2026',
        'calc.title': 'Calculez votre',
        'calc.title_highlight': 'Expédition',
        'calc.origin.label': 'Pays d\'Origine',
        'calc.origin.es': 'Espagne',
        'calc.origin.cm': 'Cameroun',
        'calc.origin.gq': 'Guinée',
        'calc.mode.kg': 'Kilos',
        'calc.mode.bulto': 'Colis',
        'calc.mode.doc': 'Documents',
        'calc.service.label': 'Type de Service',
        'calc.service.air': 'Aérien',
        'calc.service.sea': 'Maritime (BIO)',
        'calc.service.sea_warn': '⚠️ Temps estimé: 25-30 jours',
        'calc.dest.label': 'Destination',
        'calc.dest.malabo': 'Malabo',
        'calc.dest.bata': 'Bata',
        'calc.weight.label': 'Poids Total (kg)',
        'calc.bulto.label': 'Sélectionnez votre Colis',
        'calc.doc.title': 'Envois de Documents',
        'calc.doc.flat_rate': 'Tarif Fixe',
        'calc.doc.route': 'Route Directe: 🇬🇶 Guinée Équatoriale -> 🇪🇸 Espagne',
        'calc.cta.view_cost': 'Voir le Coût d\'Expédition',
        'calc.result.badge': 'Montant de l\'Expédition',
        'calc.result.pay_options': 'Options de Paiement Disponibles',
        'calc.result.pay_origin': 'Payer en',
        'calc.result.pay_almacen': 'Payer en Guinée (Espèces à l\'entrepôt)',
        'calc.result.pay_ecobank': 'Payer en Guinée (Dépôt Ecobank)',
        'calc.result.cta_register': 'Enregistrer le Colis',
        'calc.form.title': 'Informations sur l\'Expéditeur',
        'calc.form.subtitle': 'Générer un reçu officiel',
        'calc.form.name': 'Nom Complet',
        'calc.form.phone': 'Téléphone',
        'calc.form.id': 'DNI / DIP',
        'calc.form.pay_confirm': 'Confirmer la Méthode de Paiement',
        'calc.form.pay_in': 'Payer en',
        'calc.form.pay_almacen_short': 'À l\'Entrepôt',
        'calc.form.pay_ecobank_short': 'Via Ecobank',
        'calc.form.cta_finish': 'Terminer et Enregistrer',
        'calc.form.processing': 'Traitement...',
        'calc.success.badge': 'Enregistrement Réussi',
        'calc.success.hello': 'Bonjour',
        'calc.success.completed': 'enregistrement terminé',
        'calc.success.tracking_label': 'Code de Suivi',
        'calc.success.copy': 'Copier le Code',
        'calc.success.pay_location': 'Lieu de Paiement',
        'calc.success.new_calc': 'Nouvelle Expédition',
        'calc.alert.params': 'Veuillez remplir toutes les données personnelles.',
        'calc.alert.copied': 'Code copié dans le presse-papiers',
        'calc.sender_info': 'Informations de l\'Expéditeur',
        'calc.recipient_info': 'Informations du Destinataire',


        // Services
        'services.routes_badge': 'Routes Disponibles 2026',
        'services.title': 'Connectons les',
        'services.title_highlight': 'Nations',
        'services.main.badge': 'Service Principal',
        'services.main.name': 'Espagne vers Guinée Équatoriale',
        'services.main.desc': 'Envois à partir de 11€/Kg. Départs hebdomadaires.',
        'services.regional.badge': 'Connexion Régionale',
        'services.regional.name': 'Cameroun vers Guinée Équatoriale',
        'services.regional.desc': 'Logistique rapide depuis notre siège à Yaoundé.',
        'services.national.badge': 'National G.É.',
        'services.national.name': 'Malabo ↔ Bata',
        'services.national.desc': 'Envois interurbains quotidiens garantis.',
        'services.rates.title': 'Tarifs Étoiles',

        // Tracking
        'track.title': 'Suivez votre colis',
        'track.subtitle': 'Entrez le code généré lors de l\'enregistrement de votre colis',
        'track.placeholder': 'Ex : BB-7X9K2',
        'track.cta': 'Suivre',
        'track.result.id_label': 'Code',
        'track.result.status_main': 'Traitement de la Réception',
        'track.result.status_badge': 'État Général',
        'track.result.status_loc': 'À l\'entrepôt de Madrid',
        'track.step.registered': 'Colis Enregistré',
        'track.step.pending': 'En attente d\'expédition',
        'track.step.transit': 'Transit International',
        'track.step.arrival': 'Arrivée à Destination',
        'track.loc.madrid': 'Centre Bodipo Madrid',
        'track.loc.alcala': 'Entrepôt Alcala',
        'track.loc.barajas': 'Aéroport de Barajas',
        'track.loc.customs': 'Douanes Malabo/Bata',
        'track.date.ongoing': 'En cours',

        // Dashboard
        'dash.title': 'Mon Tableau de Bord',
        'dash.welcome': 'Bienvenue',
        'dash.btn.logout': 'Déconnexion',
        'dash.profile.title': 'Mon Profil',
        'dash.profile.edit': 'Modifier',
        'dash.profile.cancel': 'Annuler',
        'dash.profile.username': 'Nom d\'utilisateur',
        'dash.profile.name': 'Nom complet',
        'dash.profile.email': 'E-mail',
        'dash.profile.phone': 'Téléphone',
        'dash.profile.address': 'Adresse',
        'dash.profile.save': 'Enregistrer les modifications',
        'dash.profile.not_specified': 'Non spécifié',
        'dash.profile.discount_title': 'Remise Active',
        'dash.profile.discount_desc': 'Sur votre prochain envoi',
        'dash.ship.title': 'Mes Expéditions',
        'dash.invoices.title': 'Mes Factures',
        'dash.invoices.loading': 'Chargement des factures...',
        'dash.invoices.no_invoices': 'Aucune facture disponible',
        'dash.invoices.shipment': 'Expédition',
        'dash.invoices.transfer': 'Transfert',
        'dash.invoices.download': 'Télécharger la Facture',
        'dash.invoices.ship_to': 'EXPÉDIER À',
        'dash.invoices.transfer_to': 'TRANSFÉRER À',
        'dash.ship.loading': 'Chargement des expéditions...',
        'dash.ship.no_shipments': 'Aucun envoi enregistré',
        'dash.ship.empty_desc': 'Vos envois apparaîtront ici une fois que vous les aurez enregistrés',
        'dash.ship.tracking_label': 'Numéro de suivi',
        'dash.ship.origin': 'Origine',
        'dash.ship.dest': 'Destination',
        'dash.ship.weight': 'Poids',
        'dash.ship.price': 'Prix',
        'dash.ship.description': 'Description',
        'dash.ship.created': 'Créé',
        'dash.alert.update_success': 'Profil mis à jour avec succès',
        'dash.alert.update_error': 'Erreur lors de la mise à jour du profil',
        'dash.status.delivered': 'Livré',
        'dash.status.transit': 'En transit',
        'dash.status.customs': 'À la douane',
        'dash.search_placeholder': 'Rechercher par code, origine, destination...',

        // Schedule
        'schedule.title': 'Calendrier des',
        'schedule.title_highlight': 'Expéditions',
        'schedule.status_operating': 'État : Opérationnel 2026',
        'schedule.current_month_label': 'Mois en cours',
        'schedule.next_departure': 'Prochain départ',
        'schedule.service_type': 'Type de service',
        'schedule.destination': 'Destination',
        'schedule.book_slot': 'Réserver un créneau',
        'schedule.docs_title': 'Documents G.É. -> ES',
        'schedule.docs_desc': 'Départs hebdomadaires. Consultez l\'annonce sur WhatsApp.',
        'schedule.docs_rate': '15€ Tarif Forfaitaire',
        'schedule.notice_title': 'Avis d\'expédition important',
        'schedule.notice_desc': 'Les colis doivent être dans nos entrepôts au plus tard la veille du départ à 15h00 pour garantir l\'embarquement.',
        'schedule.overview_title': 'Programmation 2026 - Vue d\'ensemble',
        'schedule.current_month_badge': 'Mois Actuel',
        'schedule.programming_badge': 'Programmation',

        // AIChat
        'chat.welcome': 'Bonjour ! Bienvenue sur l\'assistant virtuel de Bodipo. Je suis là pour vous aider.',
        'chat.error': 'Nos systèmes traitent des envois hautement prioritaires. Veuillez réessayer dans quelques instants.',
        'chat.cta': 'Chat d\'aide',
        'chat.online': 'En ligne',
        'chat.close': 'Fermer le chat',
        'chat.send': 'Envoyer le message',
        'chat.placeholder': 'Tapez votre demande...',
        'chat.system': 'Bodipo Intelligence System',

        // Login
        'login.title': 'Connexion',
        'login.welcome': 'Bon retour parmi nous',
        'login.email': 'Adresse e-mail',
        'login.password': 'Mot de passe',
        'login.forgot': 'Mot de passe oublié ?',
        'login.btn': 'Entrer',
        'login.no_account': 'Pas de compte ?',
        'login.register_link': 'S\'inscrire',
        'login.error.fields': 'Veuillez remplir tous les champs',
        'login.error.general': 'Erreur lors de la connexion',
        'login.loading': 'Connexion en cours...',

        // Register
        'register.title': 'Club BodipoBusiness',
        'register.subtitle': 'Avantages Exclusifs',
        'register.promo': 'Inscrivez-vous aujourd\'hui et recevez une remise immédiate de 10% sur votre prochain envoi.',
        'register.name': 'Nom complet',
        'register.email': 'Adresse e-mail',
        'register.password': 'Mot de passe',
        'register.phone': 'Numéro de téléphone',
        'register.address': 'Adresse',
        'register.privacy_accept': 'J\'accepte les politiques de confidentialité de BODIPO BUSINESS',
        'register.btn': 'Créer un compte',
        'register.loading': 'Création du compte...',
        'register.success': 'Inscription réussie ! Bienvenue chez Bodipo Business',
        'register.error.privacy': 'Vous devez accepter la politique de confidentialité',
        'register.error.fields': 'Veuillez remplir tous les champs obligatoires',
        'register.error.password': 'Le mot de passe doit comporter au moins 6 caractères',
        'register.error.general': 'Erreur lors de l\'enregistrement de l\'utilisateur',

        // Store
        'store.badge': 'Articles Officiels Bodipo',
        'store.title': 'Collection',
        'store.title_highlight': 'Bodipo.',
        'store.desc': 'Nos vêtements ne sont pas seulement de la mode, c\'est une déclaration. Qualité premium avec livraison internationale incluse.',
        'store.price_final': 'Prix Final',
        'store.envio_incluido': 'Livraison Incluse',
        'store.stock': 'Stock Disponible',
        'store.zoom': 'Cliquez pour agrandir',
        'store.buy_wa': 'Acheter via WhatsApp',
        'store.safe_payments': 'Paiements Sécurisés',
        'store.office_pickup': 'Retrait au Bureau',

        // Privacy
        'privacy.title': 'Politique de Confidentialité',
        'privacy.last_update': 'Dernière mise à jour : Janvier 2026',
        'privacy.back': 'Retour à l\'accueil',
        'privacy.sec1_title': '1. Responsable du Traitement',
        'privacy.sec1_content': 'Le responsable du traitement des données personnelles collectées via l\'application et le site web BODIPO BUSINESS est BODIPO BUSINESS, exerçant son activité en République de Guinée Équatoriale.',
        'privacy.sec2_title': '2. Données Personnelles Collectées',
        'privacy.sec2_content': 'BODIPO BUSINESS peut collecter les données personnelles suivantes :',
        'privacy.sec3_title': '3. Finalité du Traitement des Données',
        'privacy.sec3_content': 'Les données personnelles seront traitées aux fins suivantes :',
        'privacy.sec4_title': '4. Base Légale du Traitement',
        'privacy.sec5_title': '5. Conservation des Données',
        'privacy.sec6_title': '6. Cession de Données à des Tiers',
        'privacy.sec7_title': '7. Sécurité des Données',
        'privacy.sec8_title': '8. Droits de l\'Utilisateur',
        'privacy.sec9_title': '9. Données des Mineurs',
        'privacy.sec10_title': '10. Utilisation de Cookies et Technologies Similaires',
        'privacy.sec11_title': '11. Modifications de la Politique de Confidentialité',
        'privacy.sec12_title': '12. Législation Applicable',
        'privacy.list_personal_data': 'Nom et prénom, numéro de téléphone, adresse e-mail, adresse physique.',
        'privacy.list_purposes': 'Gérer les commandes, répondre aux demandes, respecter les obligations légales.',
        'privacy.list_rights': 'Accès, rectification, suppression et opposition.',

        // Client
        'client.welcome': 'Bienvenue chez Bodipo',
        'client.premium_area': 'Espace Logistique Premium',
        'client.footer_title': 'Rejoignez l\'élite logistique.',
        'client.footer_desc': 'Gérez vos envois avec une priorité absolue et des avantages exclusifs.',

        // Shared/Footer
        'footer.rights': 'Tous droits réservés',
        'theme.dark': 'Mode Sombre',
        'theme.light': 'Mode Clair',
        'btn.back': 'Retour',
        'btn.forward': 'Suivant',

        // New Footer Keys
        'footer.logistics_desc': 'Logistique d\'excellence connectant l\'Espagne 🇪🇸, le Cameroun 🇨🇲 et la Guinée Équatoriale 🇬🇶. Opérations quotidiennes avec les normes de sécurité les plus élevées.',
        'footer.admin_access': 'Accès Admin',
        'footer.direct_contact': 'Contact Direct',
        'footer.spain': 'Espagne',
        'footer.cameroon': 'Cameroun',
        'footer.guinea': 'Guinée Équatoriale',
        'footer.logistics_services': 'Services Logistiques',
        'footer.calc_rates': 'Calculateur de Tarifs',
        'footer.calendar': 'Calendrier Mensuel',
        'footer.tracking': 'Suivi en Temps Réel',
        'footer.advisor': 'Conseiller de Services',
        'footer.locations': 'BODIPO BUSINESS S.L.',
        'footer.loc.madrid': 'Alcalá de Henares, Madrid 🇪🇸',
        'footer.loc.yaounde': 'Université Catholique, Yaoundé 🇨🇲',
        'footer.loc.gq': 'Malabo & Bata, G.E. 🇬🇶',
        'footer.copyright': '© 2026 BODIPO BUSINESS S.L.',
    }
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const stored = localStorage.getItem('theme');
        return (stored === 'dark' || stored === 'light') ? stored : 'light';
    });

    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem('language');
        return (stored === 'es' || stored === 'en' || stored === 'fr') ? stored : 'es';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const [appConfig, setAppConfig] = useState<DynamicConfig | null>(null);

    const refreshConfig = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'}/config`);
            if (res.ok) {
                const data = await res.json();
                setAppConfig(data);
            }
        } catch (error) {
            console.error('Failed to fetch config', error);
        }
    };

    const updateConfig = async (newConfig: Partial<DynamicConfig>) => {
        try {
            const userStr = localStorage.getItem('user');
            const token = userStr ? JSON.parse(userStr).token : '';

            const res = await fetch(`${import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'}/config`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newConfig)
            });

            if (res.ok) {
                const updated = await res.json();
                setAppConfig(updated);
            }
        } catch (error) {
            console.error('Failed to update config', error);
            throw error;
        }
    };

    useEffect(() => {
        refreshConfig();
    }, []);

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    const value = {
        theme,
        language,
        toggleTheme,
        setLanguage,
        t,
        appConfig,
        refreshConfig,
        updateConfig
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

import nodemailer from 'nodemailer';

// Configurar transporter de nodemailer
const createTransporter = () => {
    // Verificar si las credenciales de email están configuradas
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️  EMAIL_USER o EMAIL_PASS no están configurados en .env.local');
        console.warn('⚠️  Los emails no se enviarán hasta que configures las credenciales');
        return null;
    }

    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Generar código de 6 dígitos
export const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Enviar email de verificación
export const sendVerificationEmail = async (email, code) => {
    const transporter = createTransporter();

    if (!transporter) {
        console.log(`📧 [MODO DESARROLLO] Código de verificación para ${email}: ${code}`);
        return { success: true, devMode: true };
    }

    const mailOptions = {
        from: `"Bodipo Business" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verifica tu cuenta - Bodipo Business',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #00151a 0%, #007e85 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .code-box { background: white; border: 2px dashed #007e85; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                    .code { font-size: 32px; font-weight: bold; color: #007e85; letter-spacing: 5px; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚀 Bodipo Business</h1>
                        <p>Verifica tu cuenta</p>
                    </div>
                    <div class="content">
                        <h2>¡Bienvenido a Bodipo Business!</h2>
                        <p>Gracias por registrarte. Para completar tu registro, por favor verifica tu dirección de correo electrónico usando el siguiente código:</p>
                        
                        <div class="code-box">
                            <p style="margin: 0; font-size: 14px; color: #666;">Tu código de verificación es:</p>
                            <div class="code">${code}</div>
                        </div>
                        
                        <p><strong>Este código expirará en 15 minutos.</strong></p>
                        <p>Si no solicitaste este código, puedes ignorar este email de forma segura.</p>
                        
                        <div class="footer">
                            <p>© 2026 Bodipo Business. Todos los derechos reservados.</p>
                            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email de verificación enviado a ${email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        throw new Error('Error al enviar el email de verificación');
    }
};

// Enviar email de recuperación de contraseña
export const sendPasswordResetEmail = async (email, code) => {
    const transporter = createTransporter();

    if (!transporter) {
        console.log(`📧 [MODO DESARROLLO] Código de reset para ${email}: ${code}`);
        return { success: true, devMode: true };
    }

    const mailOptions = {
        from: `"Bodipo Business" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Recuperación de Contraseña - Bodipo Business',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #00151a 0%, #007e85 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .code-box { background: white; border: 2px dashed #dc2626; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                    .code { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 5px; }
                    .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Bodipo Business</h1>
                        <p>Recuperación de Contraseña</p>
                    </div>
                    <div class="content">
                        <h2>Solicitud de Recuperación de Contraseña</h2>
                        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Usa el siguiente código para continuar:</p>
                        
                        <div class="code-box">
                            <p style="margin: 0; font-size: 14px; color: #666;">Tu código de recuperación es:</p>
                            <div class="code">${code}</div>
                        </div>
                        
                        <p><strong>Este código expirará en 15 minutos.</strong></p>
                        
                        <div class="warning">
                            <p style="margin: 0;"><strong>⚠️ Importante:</strong> Si no solicitaste restablecer tu contraseña, ignora este email y tu cuenta permanecerá segura.</p>
                        </div>
                        
                        <div class="footer">
                            <p>© 2026 Bodipo Business. Todos los derechos reservados.</p>
                            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email de recuperación enviado a ${email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        throw new Error('Error al enviar el email de recuperación');
    }
};

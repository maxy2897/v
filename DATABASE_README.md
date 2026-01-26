# 🚀 Bodipo Business - Sistema de Autenticación

Sistema completo de gestión de usuarios y envíos para Bodipo Business con autenticación JWT y MongoDB.

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- Cuenta en MongoDB Atlas (gratuita)
- npm o yarn

## 🔧 Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar MongoDB Atlas

1. **Crear cuenta en MongoDB Atlas**:
   - Ve a https://www.mongodb.com/cloud/atlas
   - Regístrate con tu email
   - Crea un cluster gratuito (M0)

2. **Configurar acceso a la base de datos**:
   - En "Database Access", crea un usuario:
     - Username: `bodipo`
     - Password: `bodipo2026` (o la que prefieras)
   - En "Network Access", añade tu IP o permite acceso desde cualquier lugar:
     - Haz clic en "Add IP Address"
     - Selecciona "Allow Access from Anywhere" (0.0.0.0/0)

3. **Obtener Connection String**:
   - En "Database", haz clic en "Connect"
   - Selecciona "Connect your application"
   - Copia el connection string
   - Reemplaza `<password>` con tu contraseña

4. **Actualizar `.env.local`**:
   ```bash
   GEMINI_API_KEY=tu_api_key_actual
   
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://bodipo:bodipo2026@cluster0.mongodb.net/bodipo-business?retryWrites=true&w=majority
   
   # JWT Configuration
   JWT_SECRET=bodipo_business_secret_key_2026_guinea_ecuatorial
   JWT_EXPIRE=30d
   
   # Server Configuration
   PORT=5000
   ```

### 3. Iniciar la Aplicación

#### Opción 1: Ambos servidores a la vez (Recomendado)
```bash
npm run dev:full
```

#### Opción 2: Servidores por separado
```bash
# Terminal 1 - Frontend (Vite)
npm run dev

# Terminal 2 - Backend (Express)
npm run server
```

## 🌐 Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📚 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual (requiere token)

### Usuarios
- `GET /api/users/profile` - Ver perfil (requiere token)
- `PUT /api/users/profile` - Actualizar perfil (requiere token)
- `GET /api/users/shipments` - Ver envíos (requiere token)
- `POST /api/users/shipments` - Crear envío (requiere token)

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación:

1. Al registrarse o iniciar sesión, recibes un token
2. El token se guarda en `localStorage`
3. Todas las peticiones protegidas incluyen el token en el header:
   ```
   Authorization: Bearer <token>
   ```

## 👤 Flujo de Usuario

### Registro
1. Haz clic en "Registrarse" en el header
2. Completa el formulario con tus datos
3. Acepta la política de privacidad
4. Haz clic en "Crear Cuenta"
5. Automáticamente inicias sesión

### Inicio de Sesión
1. Haz clic en "Iniciar Sesión"
2. Ingresa email y contraseña
3. Haz clic en "Iniciar Sesión"

### Dashboard
1. Una vez autenticado, haz clic en tu nombre en el header
2. Selecciona "Mi Dashboard"
3. Aquí puedes:
   - Ver y editar tu perfil
   - Ver tu descuento del 10%
   - Ver historial de envíos

## 🗂️ Estructura del Proyecto

```
v/
├── server/                    # Backend (Express + MongoDB)
│   ├── config/
│   │   └── db.js             # Configuración de MongoDB
│   ├── middleware/
│   │   └── auth.js           # Middleware JWT
│   ├── models/
│   │   ├── User.js           # Modelo de Usuario
│   │   └── Shipment.js       # Modelo de Envío
│   ├── routes/
│   │   ├── auth.js           # Rutas de autenticación
│   │   └── users.js          # Rutas de usuarios
│   └── server.js             # Servidor principal
├── src/
│   ├── context/
│   │   └── AuthContext.tsx   # Contexto de autenticación
│   └── pages/
│       ├── DashboardPage.tsx # Dashboard de usuario
│       └── PrivacyPage.tsx   # Política de privacidad
├── components/
│   ├── RegisterModal.tsx     # Modal de registro
│   ├── LoginModal.tsx        # Modal de login
│   └── Header.tsx            # Header con auth
├── services/
│   └── api.ts                # Servicio de API
└── .env.local                # Variables de entorno
```

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Tokens JWT con expiración
- ✅ Validación de entrada (frontend y backend)
- ✅ CORS configurado
- ✅ Middleware de autenticación
- ✅ Variables de entorno para datos sensibles

## 🎨 Características

- ✅ Registro de usuarios
- ✅ Inicio de sesión
- ✅ Dashboard personalizado
- ✅ Edición de perfil
- ✅ Gestión de envíos
- ✅ Descuento del 10% para nuevos usuarios
- ✅ Política de privacidad
- ✅ Diseño responsive y moderno

## 🐛 Solución de Problemas

### Error: "Cannot connect to MongoDB"
- Verifica que tu IP esté en la whitelist de MongoDB Atlas
- Comprueba que el connection string sea correcto
- Asegúrate de que la contraseña no contenga caracteres especiales sin codificar

### Error: "Port 5000 already in use"
- Cambia el puerto en `.env.local`:
  ```bash
  PORT=5001
  ```
- Actualiza también la URL en `services/api.ts`

### Los cambios no se reflejan
- Reinicia ambos servidores
- Limpia el caché del navegador
- Verifica que ambos servidores estén corriendo

## 📝 Scripts Disponibles

```bash
npm run dev          # Iniciar solo frontend (Vite)
npm run server       # Iniciar solo backend (Express)
npm run dev:full     # Iniciar ambos servidores
npm run build        # Build de producción
```

## 🚀 Despliegue

### Frontend (Vercel)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático

### Backend (Railway/Render)
1. Conecta tu repositorio
2. Configura las variables de entorno
3. Apunta a `server/server.js`

## 📞 Soporte

Para cualquier problema o pregunta:
- Email: contacto@bodipobusiness.com
- WhatsApp: +34 641 992 110

## 📄 Licencia

© 2026 BODIPO BUSINESS S.A. Todos los derechos reservados.

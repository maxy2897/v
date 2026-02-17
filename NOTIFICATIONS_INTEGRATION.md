# Integración de Notificaciones en AdminPanel

## Pasos para integrar AdminNotifications en AdminPanel.tsx:

### 1. Importar el componente (al inicio del archivo):
```tsx
import { AdminNotifications } from './AdminNotifications';
```

### 2. Actualizar el tipo de activeTab (línea ~50):
Cambiar:
```tsx
const [activeTab, setActiveTab] = useState<'products' | 'branding' | 'reports' | 'config' | 'content' | 'operational' | 'transactions' | 'shipments'>('products');
```

Por:
```tsx
const [activeTab, setActiveTab] = useState<'products' | 'branding' | 'reports' | 'config' | 'content' | 'operational' | 'transactions' | 'shipments' | 'notifications'>('products');
```

### 3. Añadir botón en el sidebar (después del botón de "Envíos", línea ~370):
```tsx
<button
  onClick={() => setActiveTab('notifications')}
  className={`whitespace-nowrap px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'notifications' ? 'bg-teal-500 text-[#00151a]' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
>
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
  Notificaciones
</button>
```

### 4. Añadir el contenido del tab (buscar donde están los otros {activeTab === '...' && ...}):
```tsx
{activeTab === 'notifications' && (
  <AdminNotifications />
)}
```

## Características implementadas:

### Backend:
✅ Modelo de notificaciones con soporte para:
  - Notificaciones globales (todos los usuarios)
  - Notificaciones personales (usuario específico)
  - Sistema de lectura (readBy)
  - Tipos: info, success, warning, shipment_update, delivery, general
  - Fecha de expiración opcional

✅ Rutas API completas:
  - GET /api/notifications - Obtener notificaciones del usuario
  - GET /api/notifications/unread-count - Contador de no leídas
  - POST /api/notifications/:id/read - Marcar como leída
  - POST /api/notifications/read-all - Marcar todas como leídas
  - POST /api/notifications (admin) - Crear notificación
  - GET /api/notifications/admin/all (admin) - Ver todas
  - DELETE /api/notifications/:id (admin) - Eliminar

### Frontend:
✅ NotificationBell en Header:
  - Icono de campana con badge de contador
  - Dropdown con lista de notificaciones
  - Auto-actualización cada 30 segundos
  - Marcar como leída al hacer click
  - Botón "Marcar todas como leídas"

✅ AdminNotifications:
  - Formulario para crear notificaciones globales
  - Lista de todas las notificaciones enviadas
  - Estadísticas de lectura
  - Eliminar notificaciones
  - Tipos de notificación con colores

## Uso:

### Para Usuarios:
- Verán un icono de campana en el header (solo si están autenticados)
- El badge muestra el número de notificaciones no leídas
- Click en la campana abre el dropdown con las notificaciones
- Click en una notificación la marca como leída

### Para Administradores:
- Acceder al AdminPanel → Tab "Notificaciones"
- Click en "Nueva Notificación"
- Llenar el formulario:
  - Título (requerido)
  - Mensaje (requerido)
  - Tipo (general, info, success, warning, etc.)
  - Fecha de expiración (opcional)
- Click en "Enviar Notificación"
- La notificación aparecerá instantáneamente para todos los usuarios conectados

## Ejemplos de uso:

### Notificar llegada de paquete:
- Título: "Tu paquete ha llegado"
- Mensaje: "El paquete con código ABC123 está disponible para recoger en nuestro almacén"
- Tipo: delivery

### Cambio en horarios:
- Título: "Nuevo horario de envíos"
- Mensaje: "A partir del próximo lunes, los envíos saldrán los martes y viernes"
- Tipo: info

### Actualización de envío:
- Título: "Actualización de envío"
- Mensaje: "Tu envío ABC123 está en tránsito y llegará en 2-3 días"
- Tipo: shipment_update

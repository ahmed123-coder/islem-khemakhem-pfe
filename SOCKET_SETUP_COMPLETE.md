# Socket.IO Real-Time Notifications - Setup Complete ✅

## Installation Complete
- ✅ socket.io (server)
- ✅ socket.io-client (client)
- ✅ react-hot-toast (notifications)

## Files Created

### Server-Side
1. **server.js** - Custom Next.js server with Socket.IO
2. **lib/socket.ts** - Server-side Socket.IO utilities
3. **src/lib/emit-notification.ts** - Notification emission helper
4. **src/lib/notification-service.ts** - High-level notification functions

### Client-Side
1. **src/lib/socket-client.ts** - Client Socket.IO connection
2. **src/components/notifications/notifications/notification-provider.tsx** - Global notification listener
3. **src/hooks/use-notifications.ts** - React hook for notifications

## Integration Complete

### API Routes Updated
- ✅ `/api/client/orders/[orderId]/messages` - Emits notification on new client message
- ✅ `/api/consultant/messages` - Emits notification on new consultant message
- ✅ `/api/consultant/reservations` - Emits notification on reservation status update

### Pages Updated
- ✅ `src/app/layout.tsx` - Wrapped with NotificationProvider
- ✅ `src/app/client/orders/[orderId]/page.tsx` - Real-time message & reservation updates

### Package.json Updated
- ✅ `dev` script now uses `node server.js`
- ✅ `start` script uses custom server

## How to Run

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Features Implemented

### 1. Real-Time Messages
- Client sends message → Consultant receives instant notification
- Consultant sends message → Client receives instant notification
- Messages appear in real-time without page refresh

### 2. Real-Time Reservations
- Consultant updates reservation status → Client receives instant notification
- Reservation table updates automatically

### 3. Real-Time Order Updates
- Order status changes → Both parties receive instant notification
- Order details update automatically

## Notification Types

```typescript
// Message Notification
{
  type: 'ORDER_MESSAGE',
  orderId: string,
  title: 'New Message',
  message: 'You have a new message from...',
  timestamp: ISO string
}

// Reservation Update
{
  type: 'RESERVATION_UPDATE',
  orderId: string,
  reservationId: string,
  title: 'Reservation Updated',
  message: 'Your reservation has been...',
  timestamp: ISO string
}

// Order Status Update
{
  type: 'ORDER_STATUS_UPDATE',
  orderId: string,
  title: 'Order Status Updated',
  message: 'Your order status is now...',
  timestamp: ISO string
}
```

## How It Works

### Connection Flow
1. User logs in → userId and role stored in localStorage
2. NotificationProvider initializes socket connection
3. Socket emits 'join' event with userId and role
4. Server adds socket to rooms: `user:${userId}` and `role:${role}`

### Notification Flow
1. Action occurs (message sent, reservation updated, etc.)
2. API route calls notification service function
3. Notification service emits to specific user room
4. Client socket receives notification
5. Toast notification appears
6. Custom event dispatched for page-specific updates
7. Page updates data automatically

## Usage in Other Pages

```typescript
import { initSocketClient, getSocket } from '@/lib/socket-client'

useEffect(() => {
  const userId = localStorage.getItem('userId')
  const role = localStorage.getItem('role')
  
  if (userId && role) {
    initSocketClient(userId, role)
    
    const socket = getSocket()
    if (socket) {
      socket.on('notification', (data) => {
        // Handle notification
        if (data.type === 'YOUR_TYPE') {
          // Update your data
        }
      })
    }
  }

  return () => {
    const socket = getSocket()
    if (socket) {
      socket.off('notification')
    }
  }
}, [])
```

## Emit Notifications from API Routes

```typescript
import { notifyNewMessage, notifyReservationUpdate, notifyOrderStatusUpdate } from '@/lib/notification-service'

// After creating a message
await notifyNewMessage(orderId, senderId, senderType)

// After updating reservation
await notifyReservationUpdate(reservationId, status)

// After updating order status
await notifyOrderStatusUpdate(orderId, status)
```

## Custom Notifications

```typescript
import { emitNotification } from '@/lib/emit-notification'

emitNotification(userId, {
  type: 'CUSTOM_TYPE',
  title: 'Custom Title',
  message: 'Custom message',
  data: { /* any custom data */ },
  timestamp: new Date().toISOString()
})
```

## Testing

1. Open two browser windows (or incognito)
2. Login as client in one, consultant in another
3. Send a message from client → Consultant receives toast notification
4. Update reservation status → Client receives toast notification
5. Check that data updates automatically without refresh

## Next Steps

To add notifications to other pages:
1. Import socket-client utilities
2. Initialize socket in useEffect
3. Listen for specific notification types
4. Update local state when notification received
5. Clean up socket listeners on unmount

## Troubleshooting

- **No notifications?** Check browser console for socket connection errors
- **Connection refused?** Make sure server is running with `npm run dev`
- **Toast not showing?** Verify NotificationProvider is in layout.tsx
- **Data not updating?** Check notification type matches in listener

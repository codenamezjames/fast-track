# Web Push Notifications Setup

This guide explains how to set up and test Web Push notifications in Fast Track.

## Prerequisites

- HTTPS connection (required for service workers and push notifications)
  - In development: Use `localhost` (works without HTTPS)
  - In production: Ensure your domain has a valid SSL certificate
- Modern browser with Push API support (Chrome, Firefox, Safari 16+, Edge)

## Backend Setup

### 1. Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for Web Push. Generate them using:

```bash
cd packages/api
npx web-push generate-vapid-keys
```

This will output:
```
Public Key: BN...
Private Key: Ab...
```

### 2. Configure Backend Environment

Add the VAPID keys to `packages/api/.env`:

```env
VAPID_SUBJECT=mailto:your-email@example.com
VAPID_PUBLIC_KEY=<your-public-key>
VAPID_PRIVATE_KEY=<your-private-key>
```

**Important:** The `VAPID_SUBJECT` should be a `mailto:` or `https://` URL that identifies you.

### 3. Restart Backend

```bash
npm run dev:api
```

The backend will now be able to send push notifications using the `NotificationService`.

## Frontend Setup

### 1. Configure Frontend Environment

Add the **public** VAPID key to `packages/web/.env.local`:

```env
VITE_VAPID_PUBLIC_KEY=<your-public-key>
```

**Note:** Only the public key is needed in the frontend. Never commit this file to version control.

### 2. Build and Run

```bash
npm run dev:web
```

## Testing Web Push Notifications

### 1. Enable Notifications in Profile

1. Navigate to the app in your browser (http://localhost:5173)
2. Login to your account
3. Go to Profile page (bottom navigation)
4. Click "Enable" under Push Notifications
5. Accept the browser permission prompt

### 2. Test Notification

Once enabled, click the "Test Notification" button to verify notifications are working.

### 3. Backend Notification Testing

You can test backend-triggered notifications using the API:

```bash
# Send a test fasting notification
curl -X POST http://localhost:3000/api/test/notification \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "fasting",
    "title": "Almost there!",
    "body": "2 hours to go!"
  }'
```

## Notification Types

The app supports four notification types, each opening a different page when clicked:

| Type | Opens Page | Use Case |
|------|-----------|----------|
| `fasting` | Fasting Timer | 80% and 100% fasting milestones |
| `meal` | Meals | Meal logging reminders |
| `workout` | Workouts | Workout completion reminders |
| `daily-goal` | Dashboard | Daily goal achievements |

## How It Works

### Frontend Flow

1. **Permission Request**: User clicks "Enable" → Browser asks for permission
2. **Service Worker Registration**: PWA registers `sw.ts` service worker
3. **Push Subscription**: Browser creates a unique subscription endpoint
4. **Backend Registration**: Subscription is sent to `/api/push-subscriptions`
5. **Ready**: Backend can now send notifications to this device

### Backend Flow

1. **Background Jobs**: BullMQ runs jobs every minute (fasting) or daily (goals)
2. **Check Conditions**: Jobs check for users who meet notification criteria
3. **Fetch Subscriptions**: Get push subscriptions for eligible users
4. **Send Notification**: Use `web-push` library with VAPID keys
5. **Browser Receives**: Service worker shows notification to user

### Notification Click Flow

1. User clicks notification
2. Service worker's `notificationclick` event fires
3. SW determines page to open based on `notification.data.type`
4. SW focuses existing app window or opens new one
5. User is navigated to relevant page

## Debugging

### Check Service Worker Registration

Open DevTools → Application → Service Workers

- Status should be "activated and running"
- Should show `sw.js` or similar

### Check Push Subscription

In DevTools Console:

```javascript
navigator.serviceWorker.ready.then(reg =>
  reg.pushManager.getSubscription().then(sub =>
    console.log('Subscription:', sub)
  )
)
```

Should show an object with `endpoint`, `keys`, etc.

### Check Backend Logs

The backend logs when notifications are sent:

```
info: Sending notification to user 1
info: Notification sent successfully
```

### Common Issues

**"Push notifications are not supported"**
- Check browser compatibility (must support Push API)
- Ensure running on localhost or HTTPS

**"Permission denied"**
- User explicitly blocked notifications
- Need to unblock in browser settings (chrome://settings/content/notifications)

**"Failed to subscribe"**
- Check VAPID public key is correct in `.env.local`
- Ensure service worker is registered
- Check DevTools Console for errors

**"Notifications not received"**
- Check backend has correct VAPID keys
- Verify subscription exists in database
- Check backend logs for errors
- Ensure background jobs are running (BullMQ + Redis)

## Production Deployment

### Frontend

1. Build the app: `npm run build`
2. Deploy `dist/` folder to your hosting
3. Ensure HTTPS is enabled
4. Set `VITE_VAPID_PUBLIC_KEY` in production environment variables

### Backend

1. Set VAPID keys in production environment
2. Ensure Redis is running (required for BullMQ)
3. Start background workers: `node ace worker:start`
4. Monitor notification delivery in logs

## Browser Support

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 42+ | Full support |
| Firefox | 44+ | Full support |
| Safari | 16+ | iOS 16.4+ required |
| Edge | 17+ | Full support |
| Opera | 29+ | Full support |

## Security Notes

- **VAPID Keys**: Keep private key secret, never commit to git
- **Subscription Endpoints**: Treat as sensitive data
- **HTTPS Required**: Push API only works on secure origins (except localhost)
- **User Consent**: Always request permission before subscribing
- **Unsubscribe**: Provide easy way to disable notifications

## Further Reading

- [Web Push Protocol (RFC 8030)](https://datatracker.ietf.org/doc/html/rfc8030)
- [VAPID (RFC 8292)](https://datatracker.ietf.org/doc/html/rfc8292)
- [MDN: Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [web-push library](https://github.com/web-push-libs/web-push)

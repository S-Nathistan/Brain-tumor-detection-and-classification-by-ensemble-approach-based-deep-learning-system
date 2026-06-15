# Emergency Notifications

The emergency feature uses one business flow for both mobile and web:

1. The mobile Emergency screen and the red-flag Check-In panel send an urgent alert through `POST /mobile/notify`.
2. The backend stores the alert as an emergency chat message for audit/history.
3. The doctor dashboard reads the latest alerts from `GET /dashboard/patient-alerts`.
4. The dashboard layout shows a live popup for the newest alert and keeps the full alert list in the Emergency Alerts page.

## Current Placeholder Behavior

The current implementation is a backend notification placeholder built on the existing chat-message alert stream.

- There is no separate email/SMS/push provider wired yet.
- `POST /mobile/notify` is the integration point where a future notification provider can be attached.
- The dashboard popup uses the existing alert feed, so the demo works even without external messaging services.

## Recommended Next Step

When you are ready to add production notifications, replace the placeholder body in `backend/routers/mobile.py` with an async notification service that can send:

- Email to the assigned doctor
- Push notifications to staff devices
- Optional SMS to caretakers or emergency contacts

Keep the dashboard popup and alert feed unchanged so the business workflow stays the same.
# Deploy Firestore rules to fix "Missing or insufficient permissions"

## Option 1: Firebase Console (recommended)

1. Open **[Firebase Console](https://console.firebase.google.com/)** and select your project.
2. Go to **Build → Firestore Database**.
3. Open the **Rules** tab.
4. Select all existing rules in the editor and delete them.
5. Open the **`firestore.rules`** file in this project folder and copy its **entire** contents.
6. Paste into the Firebase Console Rules editor.
7. Click **Publish**.

## Option 2: Firebase CLI

Only if you use Firebase CLI and have a `firebase.json` that points to `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

If you haven’t linked the project yet:

```bash
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules
```

## After publishing

- Wait a short time for the new rules to apply.
- Refresh your app and try the action that was failing again.
- If it still fails, check the browser console (F12 → Console) for the exact Firestore error and which operation (read/write) and collection is involved.

## Rules summary

The rules in `firestore.rules` allow:

- **users**: Users can read/update/delete only their own document (including location fields).
- **vendors**: Read by any authenticated user; create/update as per your app logic.
- **orders**: Read/create/update by the customer, vendor, or assigned delivery person as defined in the rules.
- **payments** / **subscriptionPayments**: Create/read/update by the relevant customer or vendor.
- **subscriptions**: Create/read/update by the relevant customer or vendor.
- **deliveryTracking**: As defined for delivery role and order assignment.

All operations require **Authentication** (`request.auth != null`).

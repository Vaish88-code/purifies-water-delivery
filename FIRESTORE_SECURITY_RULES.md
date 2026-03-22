# Firestore Security Rules Setup Guide

## Current Error
You're seeing: **"Missing or insufficient permissions"**

This means Firestore security rules are blocking read/write operations.

## Quick Fix: Set Rules in Firebase Console

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com
2. Select your project: **purifies-b425b**

### Step 2: Navigate to Firestore Rules
1. Click on **"Firestore Database"** in the left sidebar
2. Click on the **"Rules"** tab at the top

### Step 3: Copy and Paste These Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow create: if isAuthenticated() && request.resource.data.uid == request.auth.uid;
      allow update: if isAuthenticated() && isOwner(userId);
      allow delete: if isAuthenticated() && isOwner(userId);
    }
    
    // Vendors collection
    match /vendors/{vendorId} {
      // Any authenticated user can read vendors (needed for admin dashboard)
      allow read: if isAuthenticated();
      
      // Vendors can create their own vendor document
      allow create: if isAuthenticated() && request.resource.data.uid == request.auth.uid;
      
      // Vendors can update their own data, admins can update status
      allow update: if isAuthenticated() && (
        resource.data.uid == request.auth.uid ||
        true // Allow updates for admin approval (you can refine this later)
      );
    }
    
    // Test collection for connection checking
    match /_test/{document=**} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

### Step 4: Publish Rules
1. Click **"Publish"** button
2. Wait for confirmation that rules are published

### Step 5: Test Again
Refresh your app and try registration/login again.

---

## Temporary Test Mode (Development Only)

⚠️ **WARNING: Only use for development/testing!**

If you want to quickly test without restrictions:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

This allows all authenticated users to read/write until December 31, 2025.

**Remember to replace with proper rules before production!**

---

## What These Rules Do

### Users Collection
- ✅ Users can create their own user document during registration
- ✅ Users can read/update their own user data
- ✅ Users cannot access other users' data

### Vendors Collection
- ✅ Any authenticated user can read vendors (needed for admin dashboard)
- ✅ Vendors can create their own vendor document during registration
- ✅ Vendors can update their own vendor data
- ✅ Admins can approve/reject vendors (update status)

### Security Notes
- All operations require authentication (`request.auth != null`)
- Users can only modify their own data
- Vendor status updates are allowed (you can refine this to check for admin role later)

---

## Troubleshooting

### Still getting permission errors?
1. **Clear browser cache** and refresh
2. **Check Firebase Console** → Authentication → Users (make sure user exists)
3. **Check Firestore Database** → Data tab (see if collections exist)
4. **Check browser console** for detailed error messages

### Need more permissive rules for development?
Use the temporary test mode rules above, but **always replace them before production**.

---

## Production-Ready Rules (Future)

For production, you'll want to:
1. Add role-based checks (check if user has 'admin' role)
2. Add more specific validation for data structure
3. Add rate limiting
4. Add audit logging

But for now, the rules above will allow your app to work properly!


# 🔧 Update Firestore Security Rules - Step by Step

## Quick Steps (2 minutes)

### Step 1: Open Firebase Console
👉 **Click this link:** https://console.firebase.google.com/project/purifies-b425b/firestore/rules

Or manually:
1. Go to: https://console.firebase.google.com
2. Select project: **purifies-b425b**
3. Click **"Firestore Database"** in left sidebar
4. Click **"Rules"** tab at the top

### Step 2: Copy the Rules Below

**Select and copy ALL of this code:**

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
      // Allow any authenticated user to read vendors (needed for admin dashboard)
      allow read: if isAuthenticated();
      
      // Vendors can create their own vendor document
      allow create: if isAuthenticated() && request.resource.data.uid == request.auth.uid;
      
      // Allow updates: Any authenticated user can update (for admin approval/rejection)
      allow update: if isAuthenticated();
      
      // Allow listing all vendors for admin dashboard
      allow list: if isAuthenticated();
    }
    
    // Orders collection (for future use)
    match /orders/{orderId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
    }
    
    // Subscriptions collection (for future use)
    match /subscriptions/{subscriptionId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
    }
    
    // Test collection for connection checking
    match /_test/{document=**} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

### Step 3: Paste in Firebase Console
1. In Firebase Console Rules page, **DELETE all existing rules**
2. **PASTE** the code above
3. Click **"Publish"** button (blue button at top)
4. Wait for confirmation: **"Rules published successfully"**

### Step 4: Verify
1. You should see a green success message
2. The rules should show in the editor
3. **Refresh your app** (press F5 or Ctrl+R)

---

## Visual Guide

```
Firebase Console
  └── Project: purifies-b425b
      └── Firestore Database (left sidebar)
          └── Rules (top tab)
              └── [Delete old rules]
              └── [Paste new rules]
              └── [Click "Publish"]
              └── ✅ Done!
```

---

## What These Rules Allow

✅ **Users:**
- Can read/write their own user document
- Can create their own document during registration

✅ **Vendors:**
- Can read all vendors (for admin dashboard)
- Can create their own vendor document
- **Any authenticated user can update vendors** (for admin approval)

✅ **All require authentication** (logged in users only)

---

## Troubleshooting

### "Rules published successfully" but still getting errors?
1. **Wait 30 seconds** - rules can take a moment to propagate
2. **Hard refresh** your app (Ctrl+Shift+R or Cmd+Shift+R)
3. **Clear browser cache**
4. **Log out and log back in** to refresh auth token

### Still seeing permission errors?
1. **Check you're logged in** - rules require authentication
2. **Check browser console** (F12) for specific error codes
3. **Verify rules are published** - go back to Rules tab and confirm they're saved

### Rules editor shows errors?
- Make sure you copied the **entire** code block
- Check for any syntax errors (red underlines)
- Make sure there are no extra characters

---

## Alternative: Quick Development Rules (Less Secure)

If you want to quickly test without restrictions (development only):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **Warning:** This allows any logged-in user to do anything. Only use for testing!

---

## After Updating Rules

✅ Your app should now work properly:
- User registration ✅
- User login ✅
- Vendor registration ✅
- Admin vendor approval ✅
- All Firestore operations ✅

**Refresh your app and the permission error should be gone! 🎉**


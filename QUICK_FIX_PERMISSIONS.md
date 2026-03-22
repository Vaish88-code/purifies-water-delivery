# 🔧 Quick Fix: Firestore Permission Error

## The Problem
You're seeing: **"Missing or insufficient permissions"**

This means your Firestore security rules are too restrictive or not set up correctly.

## ✅ Solution: Update Firestore Rules (2 minutes)

### Option 1: Quick Development Rules (Easiest)

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com/project/purifies-b425b/firestore/rules

2. **Replace all existing rules with this:**

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

3. **Click "Publish"**

4. **Refresh your app** - The error should be gone!

---

### Option 2: Production-Ready Rules (Recommended)

Use the rules from the `firestore.rules` file in your project root. These are more secure:

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com/project/purifies-b425b/firestore/rules

2. **Copy the rules from `firestore.rules` file** (or see below)

3. **Paste and click "Publish"**

**Recommended Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow create: if isAuthenticated() && request.resource.data.uid == request.auth.uid;
      allow update: if isAuthenticated() && isOwner(userId);
      allow delete: if isAuthenticated() && isOwner(userId);
    }
    
    // Vendors collection
    match /vendors/{vendorId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.uid == request.auth.uid;
      allow update: if isAuthenticated();
    }
  }
}
```

---

## 📋 Step-by-Step (with screenshots guide)

1. **Navigate to Firebase Console:**
   ```
   https://console.firebase.google.com
   ```

2. **Select your project:**
   - Click on **"purifies-b425b"**

3. **Go to Firestore:**
   - In the left sidebar, click **"Firestore Database"**

4. **Click "Rules" tab:**
   - You'll see the current rules

5. **Replace with new rules:**
   - Delete all existing rules
   - Paste one of the rule sets above
   - Click **"Publish"**

6. **Wait for confirmation:**
   - You should see "Rules published successfully"

7. **Test your app:**
   - Refresh the browser
   - Try registration/login again

---

## ✅ Verification

After updating rules, you should see in browser console:
```
✅ Firebase services initialized successfully
```

And you should be able to:
- ✅ Register new users
- ✅ Login with existing users
- ✅ See user data in Firestore
- ✅ Create vendor documents

---

## 🔍 Still Having Issues?

### Check These:

1. **Are you logged in?**
   - Permission errors only happen when authenticated
   - Try registering a new user first

2. **Are the rules published?**
   - Make sure you clicked "Publish" in Firebase Console
   - Check that there are no syntax errors (red underlines)

3. **Check browser console:**
   - Look for specific error codes
   - Share the exact error message if problems persist

4. **Verify Firestore is enabled:**
   - Firebase Console → Firestore Database
   - Should show "Cloud Firestore" enabled
   - If not, click "Create database" and choose "Start in test mode"

---

## 🎯 What These Rules Do

- **Users can:** Create and manage their own user documents
- **Vendors can:** Create their own vendor documents, read all vendors (for admin dashboard)
- **Admins can:** Update vendor status (approve/reject)
- **All require:** Authentication (user must be logged in)

---

**After fixing, your app should work perfectly! 🎉**


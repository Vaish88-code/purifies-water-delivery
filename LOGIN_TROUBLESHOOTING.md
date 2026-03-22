# 🔐 Login Authentication Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "No account found with this phone number"
**Solution:** 
- You need to **register first** before you can login
- Go to `/register` page and create an account
- Then come back to `/login` and use the same credentials

### Issue 2: "Missing or insufficient permissions"
**Solution:**
- Update Firestore security rules (see `QUICK_FIX_PERMISSIONS.md`)
- Go to Firebase Console → Firestore Database → Rules
- Use the rules from `firestore.rules` file

### Issue 3: "Email/Password authentication is not enabled"
**Solution:**
1. Go to Firebase Console: https://console.firebase.google.com/project/purifies-b425b/authentication/providers
2. Click on **"Email/Password"** provider
3. Enable **"Email/Password"** toggle
4. Click **"Save"**

### Issue 4: Login succeeds but doesn't redirect
**Check:**
- Open browser console (F12)
- Look for error messages
- Check if user data is being fetched from Firestore
- Verify Firestore permissions allow reading user documents

---

## Step-by-Step Debugging

### 1. Check Browser Console
Open browser console (F12) and look for:
- `🔑 Starting login process...`
- `🔐 Attempting login with:`
- `✅ Login successful:` or `❌ Login error:`

### 2. Verify User Exists
- Go to Firebase Console → Authentication → Users
- Check if a user exists with email format: `{phone}@purifies.app`
- Example: If phone is `9876543210`, email should be `9876543210@purifies.app`

### 3. Test Registration First
If you haven't registered yet:
1. Go to `/register`
2. Fill in all fields
3. Register successfully
4. Then try logging in with the same phone and password

### 4. Verify Firestore Rules
Check if Firestore rules allow reading user documents:
```javascript
match /users/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;
}
```

### 5. Check Network Tab
1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Try to login
4. Look for failed requests (red)
5. Check error responses

---

## Quick Test

### Test 1: Register a New User
```
Phone: 9876543210
Password: test123
Category: Customer
```

### Test 2: Login with Registered User
```
Phone: 9876543210
Password: test123
```

### Expected Console Output:
```
🔑 Starting login process...
📞 Phone: 9876543210
🔒 Password length: 7
🔐 Attempting login with: {phone: "9876543210", email: "9876543210@purifies.app"}
✅ Login successful: {uid: "..."}
✅ Authentication successful, fetching user data from Firestore...
✅ User data fetched: {role: "customer", name: "Your Name"}
✅ Auth state changed: User logged in (...)
```

---

## Firebase Console Checklist

✅ **Authentication:**
- [ ] Email/Password provider is enabled
- [ ] Users exist in Authentication tab

✅ **Firestore:**
- [ ] Database is created
- [ ] Security rules are published
- [ ] `users` collection exists
- [ ] User documents exist with correct UID

✅ **Environment Variables:**
- [ ] `.env` file exists
- [ ] All `VITE_FIREBASE_*` variables are set
- [ ] Values are not placeholders

---

## Still Not Working?

1. **Clear browser cache** and reload
2. **Check Firebase Console** for any error messages
3. **Share the exact error message** from browser console
4. **Verify your Firebase project is active** and not on a free plan limit


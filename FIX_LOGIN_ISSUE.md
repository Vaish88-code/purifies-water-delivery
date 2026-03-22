# 🔧 Fix Login Authentication Issue

## Most Common Issue: **User Doesn't Exist Yet**

**You MUST register first before you can login!**

### Step 1: Register a New Account
1. Go to: `http://localhost:8080/register`
2. Fill in all required fields:
   - Full Name
   - Phone Number (10 digits)
   - Password (min 6 characters)
   - Address, State, Pincode
   - Select Category (Customer/Vendor/etc.)
3. Click "Register"

### Step 2: Verify Registration
- Check browser console - you should see:
  ```
  ✅ User created in Firebase Auth
  ✅ User document created in Firestore
  ```

### Step 3: Login with Registered Credentials
1. Go to: `http://localhost:8080/login`
2. Enter the **same phone number and password** you used to register
3. Click "Login"

---

## Issue 2: Email/Password Authentication Not Enabled

### Check and Enable:
1. Go to: https://console.firebase.google.com/project/purifies-b425b/authentication/providers
2. Click on **"Email/Password"** in the providers list
3. **Enable** the "Email/Password" toggle
4. Click **"Save"**
5. Try logging in again

---

## Issue 3: Firestore Permissions (Already Fixed Above)

If you still see permission errors:
1. Go to: https://console.firebase.google.com/project/purifies-b425b/firestore/rules
2. Paste these rules:

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

3. Click **"Publish"**

---

## Quick Test Checklist

✅ **Before Login:**
- [ ] Have you registered an account? (Go to `/register`)
- [ ] Is Email/Password auth enabled in Firebase Console?
- [ ] Are Firestore rules published correctly?

✅ **During Login:**
- [ ] Open browser console (F12) - check for error messages
- [ ] Use the **exact same phone number** you registered with
- [ ] Use the **exact same password** you registered with
- [ ] Phone number must be 10 digits (no spaces, no +91)

✅ **Expected Console Output:**
```
🔑 Starting login process...
📞 Phone: 9876543210
🔒 Password length: 7
🔐 Attempting login with: {phone: "9876543210", email: "9876543210@purifies.app"}
✅ Login successful: {uid: "..."}
✅ Authentication successful, fetching user data from Firestore...
✅ User data fetched: {role: "customer", name: "Your Name"}
```

---

## Common Error Messages

### "No account found with this phone number"
→ **You need to register first!** Go to `/register` and create an account.

### "Incorrect password"
→ Double-check the password. It's case-sensitive.

### "Missing or insufficient permissions"
→ Update Firestore security rules (see Issue 3 above).

### "Email/Password authentication is not enabled"
→ Enable it in Firebase Console (see Issue 2 above).

### "Network error"
→ Check your internet connection. Make sure Firebase services are accessible.

---

## Still Not Working?

1. **Open browser console (F12)** and share the exact error message
2. **Check Firebase Console:**
   - Authentication → Users (does your user exist?)
   - Firestore → Data (does user document exist in `users` collection?)
3. **Clear browser cache** and try again
4. **Try registering a NEW account** with different credentials

---

## Test Credentials (After Registration)

Once you've registered, you can use:
- **Phone:** The 10-digit number you registered with
- **Password:** The password you set during registration

**Note:** There are no default/test credentials. You must register first!


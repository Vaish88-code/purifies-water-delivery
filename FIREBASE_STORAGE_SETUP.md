# 🔧 Firebase Storage Setup & Troubleshooting Guide

## 🎯 Issue: Shop Images Not Uploading

If vendor shop images are not uploading or not visible, follow these steps:

---

## ✅ Step 1: Enable Firebase Storage

1. **Go to Firebase Console:**
   - Open: https://console.firebase.google.com/
   - Select your project: `purifies-b425b`

2. **Navigate to Storage:**
   - Click "Storage" in the left sidebar
   - If Storage is not enabled, click "Get Started"

3. **Choose Storage Location:**
   - Select a location close to your users (e.g., `asia-south1` for India)
   - Click "Next"

4. **Set Security Rules:**
   - Select "Start in test mode" (we'll update rules in Step 2)
   - Click "Done"

5. **Wait for Storage to Initialize:**
   - This may take 1-2 minutes
   - You should see "Files" tab appear

---

## ✅ Step 2: Publish Storage Security Rules

**IMPORTANT:** You MUST publish the storage rules for images to upload!

1. **Open Storage Rules:**
   - Go to: Firebase Console → Storage → Rules tab

2. **Copy Rules from `storage.rules` file:**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // Shop images - vendors can upload/update their own shop images
       match /shop-images/{vendorId}/{imageName} {
         // Allow read: Any authenticated user can view shop images
         allow read: if request.auth != null;
         
         // Allow write (upload/update/delete): Only vendor who owns the image
         allow write: if request.auth != null && request.auth.uid == vendorId;
       }
       
       // Allow authenticated users to read any files (for future use)
       match /{allPaths=**} {
         allow read: if request.auth != null;
         allow write: if false; // Explicitly deny writes to other paths
       }
     }
   }
   ```

3. **Paste into Firebase Console:**
   - Replace all content in the Rules editor
   - Paste the rules above

4. **Publish Rules:**
   - Click "Publish" button (top right)
   - Wait for confirmation: "Rules published successfully"

---

## ✅ Step 3: Verify Environment Variables

Check that your `.env` file has the correct Storage Bucket:

```env
VITE_FIREBASE_STORAGE_BUCKET=purifies-b425b.firebasestorage.app
```

**OR** it might be:
```env
VITE_FIREBASE_STORAGE_BUCKET=purifies-b425b.appspot.com
```

**To find your Storage Bucket:**
1. Go to: Firebase Console → Project Settings → General tab
2. Scroll to "Your apps" section
3. Look for "Storage bucket" or check Storage → Files → URL pattern

---

## ✅ Step 4: Test Image Upload

1. **Open Browser Console:**
   - Press F12 or right-click → Inspect → Console tab

2. **Login as Vendor:**
   - Go to vendor dashboard
   - Scroll to "Shop Details" section

3. **Try Uploading Image:**
   - Click "Edit Shop Details"
   - Select an image file (JPG, PNG, or WebP, max 5MB)
   - Click "Save"

4. **Check Console Logs:**
   - Look for these log messages:
     - `📤 Uploading shop image for vendor: [vendor-uid]`
     - `📤 Uploading to Firebase Storage...`
     - `✅ Image uploaded to Storage successfully`
     - `✅ Image download URL obtained: [url]`
     - `📝 Updating vendor document with: { shopImage: "[url]" }`
     - `✅ Vendor document updated successfully`

5. **If You See Errors:**
   - See "Common Errors & Fixes" section below

---

## 🔍 Common Errors & Fixes

### Error 1: `storage/unauthorized` or `Permission denied`

**Cause:** Storage rules not published or incorrect rules

**Fix:**
1. Go to Firebase Console → Storage → Rules
2. Copy rules from `storage.rules` file (see Step 2 above)
3. Click "Publish"
4. Wait 30 seconds for rules to propagate
5. Try uploading again

---

### Error 2: `storage/quota-exceeded`

**Cause:** Firebase Storage quota exceeded

**Fix:**
1. Check your Firebase usage: Console → Usage and billing
2. Upgrade your plan if needed
3. Or delete old/unused files: Storage → Files

---

### Error 3: `storage/retry-limit-exceeded` or Network Error

**Cause:** Network connectivity issues or file too large

**Fix:**
1. Check your internet connection
2. Try a smaller image file (< 2MB)
3. Try again after a few seconds

---

### Error 4: Image Uploads But Not Visible

**Cause:** Image URL not saved to Firestore or rules blocking read

**Fix:**
1. Check browser console for `✅ Image download URL obtained`
2. Check if vendor document has `shopImage` field:
   - Go to: Firebase Console → Firestore Database → `vendors` collection
   - Open your vendor document
   - Check if `shopImage` field exists with a URL
3. If URL exists but image doesn't load:
   - Verify Storage rules allow read (Step 2)
   - Check if URL is accessible in browser
   - Verify vendor is authenticated

---

### Error 5: `vendor-uid does not match request.auth.uid`

**Cause:** Vendor UID mismatch - vendor document UID doesn't match logged-in user

**Fix:**
1. Check vendor document in Firestore:
   - Collection: `vendors`
   - Document ID should match the logged-in user's UID
2. If mismatch:
   - Delete and recreate vendor registration
   - Or manually update vendor document `uid` field to match user's UID

---

## ✅ Step 5: Verify Image Display on Customer Side

1. **Login as Customer:**
   - Go to customer dashboard
   - Click "Quick Order" or navigate to shop selection

2. **Check Shop Images:**
   - Each shop should display its image (if uploaded)
   - If no image, placeholder icon should appear

3. **Real-Time Updates:**
   - As a vendor, upload/change shop image
   - As a customer, refresh shop selection page
   - New image should appear immediately (if using real-time listener)

---

## 🔍 Debugging Checklist

- [ ] Firebase Storage is enabled in Firebase Console
- [ ] Storage rules are published (not just saved)
- [ ] Storage bucket URL matches `.env` file
- [ ] Vendor is logged in and authenticated
- [ ] Vendor document exists with correct `uid` field
- [ ] Image file is valid (JPG, PNG, WebP, < 5MB)
- [ ] Browser console shows upload progress logs
- [ ] No CORS errors in console
- [ ] Image URL is saved in Firestore vendor document
- [ ] Storage rules allow read for authenticated users
- [ ] Customer can access shop images (read permission)

---

## 📝 Testing Steps

### Test 1: Upload Image
1. Login as vendor
2. Go to Shop Details → Edit
3. Select image from gallery
4. Click Save
5. **Expected:** Image preview appears, upload succeeds, toast shows success

### Test 2: Verify Image in Firestore
1. Open Firebase Console → Firestore Database
2. Navigate to `vendors` collection
3. Find your vendor document
4. **Expected:** `shopImage` field contains a Firebase Storage URL (starts with `https://firebasestorage.googleapis.com/...`)

### Test 3: Verify Image in Storage
1. Open Firebase Console → Storage → Files
2. Navigate to `shop-images/[your-vendor-uid]/`
3. **Expected:** See uploaded image file

### Test 4: Display on Customer Page
1. Login as customer
2. Go to Quick Order / Shop Selection
3. **Expected:** Shop images are visible, or placeholder shown if no image

---

## 🆘 Still Having Issues?

1. **Check Browser Console:**
   - Look for any red error messages
   - Copy error codes and messages
   - Check Network tab for failed requests

2. **Check Firebase Console Logs:**
   - Go to: Firebase Console → Functions → Logs (if using Cloud Functions)
   - Or check Storage → Files for upload errors

3. **Verify Authentication:**
   - Make sure vendor is logged in
   - Check that `user.id` matches vendor document `uid`

4. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache and reload

5. **Test with Different Image:**
   - Try different file formats (JPG, PNG)
   - Try smaller file size (< 1MB)

---

## 📞 Quick Reference

- **Storage Rules File:** `storage.rules`
- **Storage Bucket:** Check Firebase Console → Project Settings
- **Image Path:** `shop-images/{vendorUid}/{timestamp}_{filename}`
- **Max File Size:** 5MB
- **Supported Formats:** JPG, PNG, WebP, GIF
- **Upload Function:** `uploadShopImage()` in `src/lib/firebase/firestore.ts`

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Image uploads without errors in console
- ✅ Success toast appears: "Shop Details Updated"
- ✅ Image visible in vendor dashboard
- ✅ Image visible on customer shop selection page
- ✅ Image URL exists in Firestore vendor document
- ✅ Image file exists in Firebase Storage

---

**Last Updated:** After implementing vendor shop image upload feature

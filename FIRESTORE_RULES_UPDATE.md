# 🔐 Firestore Security Rules - Updated

## ⚠️ IMPORTANT: Update Rules in Firebase Console

The `firestore.rules` file has been updated with the necessary permissions. **You must update the rules in Firebase Console** for the changes to take effect.

---

## 📋 Step-by-Step Instructions

### 1. Open Firebase Console
Go to: https://console.firebase.google.com/

### 2. Select Your Project
- Click on your project: `purifies-b425b`

### 3. Navigate to Firestore Rules
- Click on **"Firestore Database"** in the left sidebar
- Click on the **"Rules"** tab at the top

### 4. Copy and Paste Rules
- Open the `firestore.rules` file from your project
- **Copy ALL the contents** from `firestore.rules`
- **Paste** into the Firebase Console Rules editor
- **Replace** any existing rules

### 5. Publish Rules
- Click the **"Publish"** button
- Wait for confirmation that rules are published

---

## ✅ What Was Fixed

### 1. Users Collection
**Problem:** Vendors couldn't query users with role 'delivery' to find nearby delivery persons.

**Fix:**
- Added rule to allow reading users with role 'delivery'
- Added `allow list` for querying users collection
- This allows vendors to search for delivery persons by pincode

### 2. Orders Collection
**Problem:** 
- Delivery persons couldn't read orders assigned to them
- Delivery persons couldn't update order status

**Fix:**
- Added `deliveryPersonUid == request.auth.uid` to read rule
- Added `deliveryPersonUid == request.auth.uid` to update rule
- This allows delivery persons to see and update their assigned orders

---

## 🔒 Current Security Rules Summary

### Users Collection
- ✅ Users can read/update their own data
- ✅ Authenticated users can read delivery persons (for vendor search)
- ✅ Users can create their own document during registration
- ✅ Authenticated users can list users (for queries)

### Vendors Collection
- ✅ Any authenticated user can read vendors (for shop selection)
- ✅ Vendors can create/update their own vendor document
- ✅ Any authenticated user can update (for admin approval)

### Orders Collection
- ✅ Customers can read/create/update their own orders
- ✅ Vendors can read/update their shop's orders
- ✅ Delivery persons can read/update orders assigned to them
- ✅ Authenticated users can list orders (for queries)

### Subscriptions Collection
- ✅ Authenticated users can read/create/update

---

## 🧪 Testing After Update

After updating the rules, test:

1. **Vendor Dashboard:**
   - ✅ Can see nearby delivery persons
   - ✅ Can accept orders
   - ✅ Can assign delivery person to order

2. **Delivery Person Dashboard:**
   - ✅ Can see assigned orders
   - ✅ Can update order status (start delivery, mark delivered)

3. **Customer Dashboard:**
   - ✅ Can create orders
   - ✅ Can see their orders

---

## 📝 Complete Rules (Copy This)

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
      // Users can read their own data
      allow read: if isAuthenticated() && isOwner(userId);
      
      // Allow authenticated users to read delivery persons (needed for vendor to find nearby delivery persons)
      // This allows querying users with role 'delivery' based on pincode
      allow read: if isAuthenticated() && resource.data.role == 'delivery';
      
      // Users can create their own document during registration
      allow create: if isAuthenticated() && request.resource.data.uid == request.auth.uid;
      
      // Users can update their own data
      allow update: if isAuthenticated() && isOwner(userId);
      
      // Users can delete their own data
      allow delete: if isAuthenticated() && isOwner(userId);
      
      // Allow listing users (needed for querying delivery persons)
      allow list: if isAuthenticated();
    }
    
    // Vendors collection
    match /vendors/{vendorId} {
      // Allow any authenticated user to read vendors (needed for admin dashboard)
      allow read: if isAuthenticated();
      
      // Vendors can create their own vendor document
      allow create: if isAuthenticated() && request.resource.data.uid == request.auth.uid;
      
      // Allow updates: 
      // - Vendor can update their own data (if vendorId matches their uid)
      // - Any authenticated user can update (for admin approval/rejection)
      // Note: vendorId is the document ID which should match the uid field
      allow update: if isAuthenticated();
      
      // Allow listing all vendors for admin dashboard
      allow list: if isAuthenticated();
    }
    
    // Orders collection
    match /orders/{orderId} {
      // Allow read if:
      // - Customer owns the order
      // - Vendor owns the order
      // - Delivery person is assigned to the order
      allow read: if isAuthenticated() && (
        resource.data.customerUid == request.auth.uid ||
        resource.data.vendorUid == request.auth.uid ||
        resource.data.deliveryPersonUid == request.auth.uid
      );
      
      // Customers can create orders (must be authenticated and own the order)
      allow create: if isAuthenticated() && request.resource.data.customerUid == request.auth.uid;
      
      // Allow update if:
      // - Vendor owns the order (to accept/reject/assign delivery person)
      // - Customer owns the order (to cancel)
      // - Delivery person is assigned (to update status: start delivery, mark delivered)
      allow update: if isAuthenticated() && (
        resource.data.vendorUid == request.auth.uid ||
        resource.data.customerUid == request.auth.uid ||
        resource.data.deliveryPersonUid == request.auth.uid
      );
      
      // Allow listing for vendors, customers, and delivery persons to see their orders
      allow list: if isAuthenticated();
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

---

## ⚡ Quick Fix

If you're in a hurry, just copy the rules from the `firestore.rules` file in your project and paste them into Firebase Console → Firestore Database → Rules → Publish.

**The rules are already updated in your local file!** Just need to publish them to Firebase. 🚀


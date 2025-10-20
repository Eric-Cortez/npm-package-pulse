### NPM Package Pulse

#### Overview

NPM Package Pulse lets users review and explore NPM packages with features like authentication, ratings, and reviews.

#### Quick Start

1. **Start Firebase Emulators:**

   ```sh
   firebase emulators:start --project demo-codelab-nextjs
   ```

2. **Set Up Firebase Config:**

   - Copy `lib/firebase/config-copy.js` to `lib/firebase/config.js`.
   - Add values from the Firebase console.

3. **Install and Run:**

   ```sh
   npm install
   npm run dev
   ```

4. **Open in Browser:**
   ```sh
   http://localhost:3000
   ```

#### Environment Variables

Add these to `.env`:

```env
NEXT_PUBLIC_API_KEY=your-firebase-api-key
NEXT_PUBLIC_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_PROJECT_ID=your-project-id
NEXT_PUBLIC_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_APP_ID=your-app-id
```

Restart the server after changes.

#### Firebase Commands

1. **Run Firebase CLI:**

   ```sh
   ./node_modules/firebase-tools/lib/bin/firebase.js
   ```

2. **Check Firebase Version:**

   ```sh
   ./node_modules/firebase-tools/lib/bin/firebase.js --version
   ```

3. **Login to Firebase:**

   ```sh
   ./node_modules/firebase-tools/lib/bin/firebase.js login
   ```

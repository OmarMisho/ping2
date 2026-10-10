# SafeReach Web + Firebase

## Architecture

- Visitor URL: `/c/{ownerId}/{qrId}`
- Visitor authentication: Firebase Anonymous Auth
- Owner authentication: Firebase Auth
- QR records: `qrCodes/{qrId}`
- Chat records: `chats/{chatId}`
- Messages: `chats/{chatId}/messages/{messageId}`
- Visitor limit: 10 messages per chat
- Chat lifetime: 14 days
- Scheduled cleanup: Firebase Cloud Function

## Required QR document

The Flutter owner app creates:

```text
qrCodes/{qrId}
  qrId
  ownerUid
  ownerId
  name
  type
  active
  createdAt
  updatedAt
```

The visitor URL must be:

```text
https://YOUR-PAGES-DOMAIN/c/{ownerId}/{qrId}
```

## Chat document

```text
chats/{chatId}
  ownerUid
  ownerId
  qrId
  qrName
  qrType
  visitorId
  userName
  lastMessage
  lastUpdated
  unread
  unreadCount
  visitorMessageCount
  createdAt
  expiresAt
```

## Local test

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Then test a real QR URL:

```text
/c/{ownerId}/{qrId}
```

Do not test `/chat`; that route is intentionally no longer used.

## Deploy web app to Cloudflare Pages

Build command:

```text
npm run build
```

Output directory:

```text
dist
```

If the GitHub repository contains this project in a subfolder, set that folder as the Cloudflare Pages root directory.

## Firebase deployment

Install Firebase CLI if needed, then from this repository:

```bash
firebase login
firebase use safereach-2a838
firebase deploy --only firestore:rules
```

For scheduled cleanup:

```bash
cd firebase-functions
npm install
cd ..
firebase deploy --only functions:deleteExpiredChats
```

Scheduled Cloud Functions require a Firebase/Google Cloud billing-enabled project.

## Important

The Firestore rules are intentionally not `allow read, write: if true`.

Visitors must authenticate anonymously before resolving a QR. Owner operations are tied to the authenticated Firebase UID.

The 10-message counter is advanced transactionally by the web client and is also constrained by Firestore rules. The scheduled function removes expired chats recursively, including their messages.

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

const db = getFirestore();

exports.deleteExpiredChats = onSchedule(
  {
    schedule: 'every day 03:00',
    timeZone: 'Africa/Cairo',
    region: 'europe-west1',
    memory: '256MiB',
  },
  async () => {
    const now = Timestamp.now();
    const snapshot = await db
      .collection('chats')
      .where('expiresAt', '<=', now)
      .limit(100)
      .get();

    if (snapshot.empty) {
      console.log('No expired chats found.');
      return;
    }

    for (const chatDoc of snapshot.docs) {
      await db.recursiveDelete(chatDoc.ref);
      console.log(`Deleted expired chat ${chatDoc.id}`);
    }

    console.log(`Deleted ${snapshot.size} expired chat(s).`);
  }
);

// The id must match `safeReachChannel` in the Flutter app's main.dart and
// `default_notification_channel_id` in its AndroidManifest. If it drifts, the
// push still arrives but lands on a default low-importance channel, so the
// owner sees it only after unlocking the phone.
const NOTIFICATION_CHANNEL_ID = 'saferch_messages';

/**
 * Pushes a notification to the owner when a visitor sends a message.
 *
 * Triggered per message document rather than per `chats/{chatId}` update: a
 * message write is the only event that means "a visitor spoke", and Firestore
 * invokes this once per created document. Keying off `lastMessage` instead
 * would also fire when the owner reads a chat, because reading writes
 * `unread: false` to the same document.
 */
exports.notifyOwnerOnNewMessage = onDocumentCreated(
  {
    document: 'chats/{chatId}/messages/{messageId}',
    region: 'europe-west1',
    memory: '256MiB',
  },
  async (event) => {
    const message = event.data && event.data.data();
    if (!message) return;

    // Load-bearing, not an optimisation: the owner's own replies are written to
    // this same subcollection with sender 'owner'. Without this filter an owner
    // is notified about their own message.
    if (message.sender !== 'user') {
      return;
    }

    const chatId = event.params.chatId;

    const chatSnapshot = await db.collection('chats').doc(chatId).get();
    if (!chatSnapshot.exists) {
      console.warn(`Chat ${chatId} vanished before notification could be sent.`);
      return;
    }

    const chat = chatSnapshot.data();

    // Defence in depth. The rules already reject writes to an expired chat, but
    // the event can be delivered after expiry, and an alert about a dead chat
    // sends the owner chasing something that is already deleted.
    if (chat.expiresAt instanceof Timestamp && chat.expiresAt.toMillis() <= Date.now()) {
      console.log(`Chat ${chatId} has expired; not notifying.`);
      return;
    }

    const ownerUid = chat.ownerUid;
    if (!ownerUid) {
      console.error(`Chat ${chatId} has no ownerUid; cannot notify.`);
      return;
    }

    const ownerRef = db.collection('owners').doc(ownerUid);
    const ownerSnapshot = await ownerRef.get();

    if (!ownerSnapshot.exists) {
      console.warn(`Owner ${ownerUid} not found.`);
      return;
    }

    const token = ownerSnapshot.get('fcmToken');
    if (!token) {
      // Expected for owners who have not opened the app since push was enabled.
      console.log(`Owner ${ownerUid} has no fcmToken yet.`);
      return;
    }

    const text = typeof message.text === 'string' ? message.text.trim() : '';
    const qrName = typeof chat.qrName === 'string' && chat.qrName ? chat.qrName : 'New';

    const title = `${qrName} - someone needs you`;
    const body = text || 'A visitor started a chat.';

    try {
      await getMessaging().send({
        token,
        notification: { title, body },
        data: { chatId, kind: 'visitor_message' },
        android: {
          priority: 'high',
          notification: {
            channelId: NOTIFICATION_CHANNEL_ID,
            // Repeated alongside the top-level notification because an explicit
            // `android.notification` block takes precedence for the fields it
            // sets. Declaring title/body in both keeps the two from drifting.
            title,
            body,
            sound: 'default',
          },
        },
      });

      console.log(`Notified owner ${ownerUid} about chat ${chatId}.`);
    } catch (error) {
      // A token that FCM has retired is reported, not thrown past us: retrying
      // cannot fix it, and the owner's next sign-in writes a fresh token.
      const stale = [
        'messaging/registration-token-not-registered',
        'messaging/invalid-argument',
      ].includes(error.code);

      if (stale) {
        console.warn(`Clearing stale FCM token for owner ${ownerUid} (${error.code}).`);
        await ownerRef.set({ fcmToken: FieldValue.delete() }, { merge: true });
        return;
      }

      console.error(`Failed to notify owner ${ownerUid}:`, error);
      throw error;
    }
  }
);

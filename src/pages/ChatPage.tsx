import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Message, QrCode } from '../types';
import { isFirebaseConfigured, signInAnonymousUser } from '../firebase';
import {
  createChatSession,
  getQrCode,
  listenToMessages,
  sendMessageAsUser,
} from '../services/firebaseService';
import { MessageCircle, User } from 'lucide-react';
import {
  AppShell,
  AppHeader,
  Brand,
  STROKE,
  PrimaryButton,
  PrivacyNote,
  ProgressBar,
  MessageBubble,
  Composer,
  LimitCard,
  Spinner,
} from '../components/FounderUI';

const MAX_VISITOR_MESSAGES = 10;

const ErrorScreen: React.FC<{ title: string; message: string }> = ({
  title,
  message,
}) => (
  <AppShell>
    <AppHeader brand />
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="w-full text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-card bg-accent-soft flex items-center justify-center mb-5">
          <MessageCircle size={30} strokeWidth={STROKE} className="text-ink" />
        </div>
        <h2 className="text-[20px] font-bold leading-6 text-ink">{title}</h2>
        <p className="text-[14px] leading-5 text-body mt-2">{message}</p>
      </div>
    </div>
  </AppShell>
);

const ChatPage: React.FC = () => {
  const { ownerId, qrId } = useParams<{ ownerId: string; qrId: string }>();

  const [started, setStarted] = useState(false);
  const [qr, setQr] = useState<QrCode | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState('');
  const [visitorMessageCount, setVisitorMessageCount] = useState(0);
  const [starting, setStarting] = useState(false);
  const [loadingQr, setLoadingQr] = useState(true);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadQr = async () => {
      if (!qrId || !ownerId || !isFirebaseConfigured()) {
        setLoadingQr(false);
        return;
      }

      try {
        const result = await getQrCode(qrId);

        if (cancelled) return;

        if (
          !result ||
          !result.active ||
          result.ownerId !== ownerId
        ) {
          setError('This emergency QR code is invalid or inactive.');
        } else {
          setQr(result);
        }
      } catch (err) {
        console.error('Failed to load QR code:', err);
        if (!cancelled) {
          setError('Unable to verify this emergency QR code.');
        }
      } finally {
        if (!cancelled) setLoadingQr(false);
      }
    };

    loadQr();

    return () => {
      cancelled = true;
    };
  }, [ownerId, qrId]);

  useEffect(() => {
    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartChat = async () => {
    if (!ownerId || !qrId || !qr || starting || chatId) return;

    try {
      setStarting(true);
      setError('');

      const user = await signInAnonymousUser();

      const id = await createChatSession(
        qr.ownerUid,
        qr.ownerId,
        qr.qrId,
        qr.name,
        user.uid
      );

      setChatId(id);
      setStarted(true);

      unsubscribeRef.current?.();
      unsubscribeRef.current = listenToMessages(id, (updatedMessages) => {
        setMessages(updatedMessages);
      });
    } catch (err) {
      console.error('Failed to start chat:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to start the chat. Please try again.'
      );
    } finally {
      setStarting(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();

    if (!text || !chatId || visitorMessageCount >= MAX_VISITOR_MESSAGES) {
      return;
    }

    try {
      setError('');
      await sendMessageAsUser(chatId, text);
      setInput('');
      setVisitorMessageCount((count) => count + 1);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Message could not be sent. Please try again.'
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isFirebaseConfigured()) {
    return (
      <ErrorScreen
        title="Service Unavailable"
        message="The emergency messaging service is not currently connected."
      />
    );
  }

  if (loadingQr) {
    return (
      <AppShell>
        <AppHeader brand />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Spinner className="w-6 h-6" />
          <p className="text-[14px] leading-5 text-body">
            Verifying emergency QR code…
          </p>
        </div>
      </AppShell>
    );
  }

  if (!ownerId || !qrId) {
    return (
      <ErrorScreen
        title="Invalid Emergency Link"
        message="This emergency contact link is incomplete."
      />
    );
  }

  if (error && !qr) {
    return <ErrorScreen title="QR Code Unavailable" message={error} />;
  }

  if (!qr) {
    return (
      <ErrorScreen
        title="QR Code Unavailable"
        message="This emergency QR code could not be verified."
      />
    );
  }

  /* ---------------- Pre-start arrival ---------------- */
  if (!started) {
    return (
      <AppShell>
        <header className="flex items-center justify-between px-6 h-[72px] shrink-0">
          <Brand nameSize="sm" />
          <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-[5px] text-[11px] font-semibold leading-[13px] text-amber">
            Private chat
          </span>
        </header>

        <div className="flex-1 flex flex-col justify-between px-6 pt-2.5 pb-6">
          <div className="flex flex-col gap-[22px]">
            <div className="w-16 h-16 rounded-card bg-accent flex items-center justify-center">
              <QrIcon />
            </div>

            <div className="flex flex-col gap-2.5">
              <p className="text-[12px] font-bold leading-[17px] text-amber">
                YOU SCANNED A FOUNDER QR
              </p>
              <h1 className="text-[28px] font-bold leading-8 text-ink">
                {qr.headline}
              </h1>
              <div className="flex items-center gap-2.5 mt-1">
                <User size={20} strokeWidth={STROKE} className="text-ink shrink-0" />
                <span className="text-[15px] font-semibold leading-[22px] text-ink truncate">
                  {qr.name}
                </span>
              </div>
            </div>

            <p className="text-[15px] font-normal leading-[22px] text-body">
              You can contact the owner through this secure anonymous chat.
            </p>

            <PrivacyNote
              tone="yellow"
              icon={<MessageCircle size={16} strokeWidth={STROKE} />}
            >
              This owner allows {MAX_VISITOR_MESSAGES} messages per finder in
              total. Your allowance never resets.
            </PrivacyNote>
          </div>

          <div className="flex flex-col gap-3.5 mt-8">
            <PrimaryButton
              onClick={handleStartChat}
              disabled={starting}
              icon={
                starting ? (
                  <Spinner className="border-ink/25 border-t-ink" />
                ) : (
                  <MessageCircle size={20} strokeWidth={STROKE} />
                )
              }
            >
              {starting ? 'Connecting…' : 'Start text chat'}
            </PrimaryButton>

            <p className="text-[12px] leading-[17px] text-body text-center">
              Anonymous · Maximum {MAX_VISITOR_MESSAGES} messages · Chat expires
              after 14 days
            </p>

            {error && (
              <p className="text-[13px] leading-5 text-center text-amber">
                {error}
              </p>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  /* ---------------- Chat ---------------- */
  const limitReached = visitorMessageCount >= MAX_VISITOR_MESSAGES;
  const remaining = Math.max(0, MAX_VISITOR_MESSAGES - visitorMessageCount);

  return (
    <AppShell className="h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 h-[72px] shrink-0">
        <div className="w-10 h-10 rounded-[14px] bg-accent-soft flex items-center justify-center shrink-0">
          <User size={22} strokeWidth={STROKE} className="text-ink" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <h1 className="text-[17px] font-semibold leading-[21px] text-ink truncate">
            {qr.name}
          </h1>
          <p className="text-[11px] font-normal leading-[13px] text-muted truncate">
            Private text chat · No account needed
          </p>
        </div>
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse-soft" />
          <span className="text-[11px] font-medium leading-4 text-muted">Live</span>
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 pt-2.5">
        <div className="flex flex-col gap-4 pb-4">
          {/* Allowance */}
          <div className="rounded-control bg-accent-soft p-3.5 flex flex-col gap-[9px]">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold leading-4 text-ink">
                {visitorMessageCount} of {MAX_VISITOR_MESSAGES} messages sent
              </p>
              <p className="text-[12px] font-semibold leading-[15px] text-amber">
                {remaining} left
              </p>
            </div>
            <ProgressBar value={visitorMessageCount} max={MAX_VISITOR_MESSAGES} />
            <p className="text-[11px] font-normal leading-4 text-amber">
              One allowance per owner. It never resets, even after another scan.
            </p>
          </div>

          {messages.length > 0 && (
            <p className="text-[11px] leading-4 text-muted text-center">
              View earlier messages
            </p>
          )}

          <div className="flex flex-col gap-3.5">
            {messages.map((msg, index) => {
              const mine = msg.sender === 'user';
              const userIndex = messages
                .slice(0, index + 1)
                .filter((m) => m.sender === 'user').length;
              return (
                <MessageBubble
                  key={msg.id}
                  side={mine ? 'me' : 'them'}
                  text={msg.text}
                  time={new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  meta={
                    mine && userIndex === visitorMessageCount
                      ? `Message ${userIndex} of ${MAX_VISITOR_MESSAGES}`
                      : undefined
                  }
                />
              );
            })}
          </div>

          {limitReached && <LimitCard limit={MAX_VISITOR_MESSAGES} />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Reply controls */}
      <div className="shrink-0 px-6 pb-6 pt-3 bg-white">
        {!limitReached ? (
          <>
            <p className="text-[12px] font-semibold leading-[17px] text-amber mb-3">
              {remaining} message{remaining === 1 ? '' : 's'} left. Include any
              final details.
            </p>
            <Composer
              value={input}
              onChange={setInput}
              onSend={handleSend}
              onKeyDown={handleKeyPress}
            />
            <p className="text-[11px] leading-4 text-body text-center mt-3">
              Only anonymous text is shared.
              <br />
              The owner’s contact details stay private.
            </p>
          </>
        ) : (
          <>
            <Composer locked placeholder="Message allowance used" />
            <p className="text-[11px] leading-4 text-body text-center mt-3">
              You can still read this chat and the owner’s replies.
            </p>
          </>
        )}

        {error && !limitReached && (
          <p className="text-[13px] leading-5 text-center text-amber mt-3">
            {error}
          </p>
        )}
      </div>
    </AppShell>
  );
};

/* Small local QR icon (scan corners). */
const QrIcon: React.FC = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    className="text-ink"
  >
    <path
      d="M11 11V9h3M18 9h3v2M21 23v-2h-3M14 21h-3v2M11 16h10"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ChatPage;

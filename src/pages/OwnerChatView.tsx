import React, { useEffect, useRef, useState } from 'react';
import { ChatSession, Message } from '../types';
import { listenToMessages, sendMessageAsOwner } from '../services/firebaseService';
import { AppHeader, MessageBubble, Composer } from '../components/FounderUI';

interface OwnerChatViewProps {
  chat: ChatSession;
  onBack: () => void;
  onRefresh: () => void;
}

const OwnerChatView: React.FC<OwnerChatViewProps> = ({ chat, onBack, onRefresh }) => {
  const [messages, setMessages] = useState<Message[]>(chat.messages || []);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = listenToMessages(
      chat.id,
      (updatedMessages) => {
        setMessages(updatedMessages);
        onRefresh();
      },
      (listenError) => {
        console.error('Failed to load messages:', listenError);
        setError('Unable to load messages.');
      }
    );
    return unsubscribe;
  }, [chat.id, onRefresh]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    try {
      setSending(true);
      setError('');
      await sendMessageAsOwner(chat.id, text);
      setInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* Header */}
      <AppHeader
        onBack={onBack}
        title={chat.userName}
        subtitle={chat.qrName}
        right={
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-[16px] font-bold text-ink shrink-0">
            {chat.userName.charAt(0).toUpperCase()}
          </div>
        }
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-surface">
        <div className="max-w-2xl mx-auto px-6 py-5 flex flex-col gap-3.5">
          {messages.length === 0 && (
            <p className="text-[12px] leading-4 text-muted text-center py-6">
              No messages yet in this chat.
            </p>
          )}

          {messages.map((msg) => {
            const mine = msg.sender === 'owner';
            return (
              <MessageBubble
                key={msg.id}
                side={mine ? 'me' : 'them'}
                text={msg.text}
                time={new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                meta={mine ? 'You' : chat.userName}
              />
            );
          })}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Reply controls */}
      <div className="shrink-0 bg-white border-t border-line px-6 py-4">
        <div className="max-w-2xl mx-auto">
          {error && (
            <p className="text-[12px] leading-4 text-amber mb-3">{error}</p>
          )}
          <Composer
            value={input}
            onChange={setInput}
            onSend={() => void handleSend()}
            onKeyDown={handleKeyPress}
            placeholder="Type your reply…"
            sending={sending}
          />
        </div>
      </div>
    </div>
  );
};

export default OwnerChatView;
import React, { useEffect, useState } from 'react';
import { ChatSession } from '../types';
import { auth } from '../firebase';
import {
  listenToChats,
  markChatAsRead,
  deleteChat,
} from '../services/firebaseService';
import OwnerChatView from './OwnerChatView';
import { MessageSquare, Trash2 } from 'lucide-react';
import { STROKE } from '../components/FounderUI';

const OwnerChats: React.FC = () => {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const ownerUid = auth.currentUser?.uid;

    if (!ownerUid || auth.currentUser?.isAnonymous) {
      setError('Please sign in as the owner to view chats.');
      return;
    }

    setError('');

    const unsubscribe = listenToChats(
      ownerUid,
      (updatedChats) => setChats(updatedChats),
      (listenError) => {
        console.error('Failed to listen to chats:', listenError);
        setError('Unable to load chats. Check your Firestore index and permissions.');
      }
    );

    return unsubscribe;
  }, []);

  const handleMarkRead = async (chatId: string) => {
    try {
      await markChatAsRead(chatId);
      setChats((current) =>
        current.map((chat) =>
          chat.id === chatId ? { ...chat, unread: false, unreadCount: 0 } : chat
        )
      );
      setSelectedChat((current) =>
        current?.id === chatId
          ? { ...current, unread: false, unreadCount: 0 }
          : current
      );
    } catch (err) {
      console.error('Failed to mark chat as read:', err);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      setChats((current) => current.filter((chat) => chat.id !== chatId));
      if (selectedChat?.id === chatId) setSelectedChat(null);
    } catch (err) {
      console.error('Failed to delete chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete chat.');
    }
  };

  if (selectedChat) {
    return (
      <OwnerChatView
        chat={selectedChat}
        onBack={() => setSelectedChat(null)}
        onRefresh={() => {}}
      />
    );
  }

  const unreadCount = chats.filter((c) => c.unread).length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-line px-6 md:px-10 py-5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-bold leading-6 text-ink">Inbox</h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-accent px-2 py-[2px] text-[10px] font-bold leading-[14px] text-ink">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-[12px] leading-[16px] text-muted mt-0.5">
            {chats.length} conversation{chats.length !== 1 ? 's' : ''} · when a
            finder starts a chat through your QR code, it appears here
          </p>
          {error && (
            <p className="text-[12px] leading-4 text-amber mt-2">{error}</p>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-card bg-accent-soft flex items-center justify-center mb-4">
              <MessageSquare size={28} strokeWidth={STROKE} className="text-ink" />
            </div>
            <h3 className="text-[17px] font-semibold leading-6 text-ink">
              No conversations yet
            </h3>
            <p className="text-[13px] leading-5 text-body mt-1.5 max-w-[260px]">
              When someone starts a chat through your QR code, it will appear
              here.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl w-full px-6 md:px-10 py-4 flex flex-col gap-2.5">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setSelectedChat(chat);
                  if (chat.unread) void handleMarkRead(chat.id);
                }}
                className={`rounded-card border transition-colors cursor-pointer ${
                  chat.unread
                    ? 'border-accent bg-accent-soft/60'
                    : 'border-line bg-white hover:bg-surface'
                }`}
              >
                <div className="flex items-center gap-3.5 p-[14px]">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-[17px] font-bold shrink-0 ${
                      chat.unread ? 'bg-accent text-ink' : 'bg-surface text-body'
                    }`}
                  >
                    {chat.userName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h3
                          className={`text-[15px] font-semibold leading-[21px] truncate ${
                            chat.unread ? 'text-ink' : 'text-body'
                          }`}
                        >
                          {chat.userName}
                        </h3>
                        <p className="text-[11px] font-medium leading-[14px] text-amber truncate">
                          {chat.qrName}
                        </p>
                      </div>
                      <span className="text-[11px] font-medium leading-[14px] text-muted flex-shrink-0">
                        {new Date(chat.lastUpdated).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <p
                      className={`text-[13px] truncate mt-1 ${
                        chat.unread
                          ? 'text-ink font-medium'
                          : 'text-muted'
                      }`}
                    >
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                  </div>

                  {chat.unread && (
                    <span className="w-[9px] h-[9px] bg-accent rounded-full flex-shrink-0" />
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDeleteChat(chat.id);
                    }}
                    className="p-2 text-muted hover:text-amber transition-colors flex-shrink-0"
                    title="Delete chat"
                  >
                    <Trash2 size={18} strokeWidth={STROKE} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerChats;
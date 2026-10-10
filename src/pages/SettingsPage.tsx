import React, { useState, useEffect } from 'react';
import { AppSettings, EmergencyContact } from '../types';
import { getSettings, saveSettings, generateId } from '../storage';
import {
  User,
  Users,
  RotateCcw,
  Info,
  Bell,
  Mail,
  BookOpen,
  Trash2,
  Plus,
  Lock,
  ShieldCheck,
  Phone,
  LifeBuoy,
} from 'lucide-react';
import { Card, PrimaryButton, STROKE } from '../components/FounderUI';

const Toggle: React.FC<{ on: boolean; onClick: () => void }> = ({ on, onClick }) => (
  <button
    onClick={onClick}
    className={`w-[46px] h-[26px] rounded-full transition-colors shrink-0 ${
      on ? 'bg-accent' : 'bg-disabled'
    }`}
    aria-pressed={on}
  >
    <div
      className={`w-[22px] h-[22px] bg-white rounded-full shadow-sm transition-transform ${
        on ? 'translate-x-[22px]' : 'translate-x-[2px]'
      }`}
    />
  </button>
);

const Input: React.FC<
  React.InputHTMLAttributes<HTMLInputElement>
> = ({ className = '', ...rest }) => (
  <input
    {...rest}
    className={`w-full h-[50px] rounded-control bg-surface px-3.5 text-[14px] font-normal leading-5 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent ${className}`}
  />
);

const TextArea: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ className = '', ...rest }) => (
  <textarea
    {...rest}
    className={`w-full rounded-control bg-surface px-3.5 py-3 text-[14px] font-normal leading-5 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none ${className}`}
  />
);

const SectionTitle: React.FC<{
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon, children }) => (
  <h3 className="text-[16px] font-semibold leading-[23px] text-ink flex items-center gap-2.5 mb-4">
    <span className="w-[30px] h-[30px] rounded-[10px] bg-accent-soft flex items-center justify-center text-ink shrink-0">
      {icon}
    </span>
    {children}
  </h3>
);

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [newContact, setNewContact] = useState<EmergencyContact>({
    id: '',
    name: '',
    phone: '',
    relationship: '',
  });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'contacts' | 'support'>('contacts');

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) return;
    const contact: EmergencyContact = {
      ...newContact,
      id: generateId(),
    };
    const updated = {
      ...settings,
      contacts: [...settings.contacts, contact],
    };
    setSettings(updated);
    saveSettings(updated);
    setNewContact({ id: '', name: '', phone: '', relationship: '' });
  };

  const handleRemoveContact = (id: string) => {
    const updated = {
      ...settings,
      contacts: settings.contacts.filter(c => c.id !== id),
    };
    setSettings(updated);
    saveSettings(updated);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-line px-6 md:px-10 py-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-[20px] font-bold leading-6 text-ink">Settings</h1>
          <p className="text-[12px] leading-[16px] text-muted mt-0.5">
            Manage your profile, emergency contacts and app preferences
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="shrink-0 bg-white border-b border-line px-6 md:px-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 py-2">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-4 h-[38px] rounded-full text-[13px] font-semibold transition-colors ${
                activeTab === 'contacts'
                  ? 'bg-accent-soft text-amber'
                  : 'text-muted hover:bg-surface'
              }`}
            >
              Emergency Contacts
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`px-4 h-[38px] rounded-full text-[13px] font-semibold transition-colors ${
                activeTab === 'support'
                  ? 'bg-accent-soft text-amber'
                  : 'text-muted hover:bg-surface'
              }`}
            >
              App Support
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6 md:p-8">
          {activeTab === 'contacts' ? (
            <div className="flex flex-col gap-5">
              {/* Your Profile */}
              <Card className="flex flex-col gap-4">
                <SectionTitle icon={<User size={16} strokeWidth={STROKE} />}>
                  Your Profile
                </SectionTitle>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold leading-4 text-body">
                    Display name
                  </label>
                  <Input
                    type="text"
                    value={settings.ownerName}
                    onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
                    placeholder="Your name as shown to finders"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold leading-4 text-body">
                    Landline / welcome message
                  </label>
                  <TextArea
                    value={settings.emergencyMessage}
                    onChange={(e) => setSettings({ ...settings, emergencyMessage: e.target.value })}
                    rows={2}
                    placeholder="Message shown on the landing page"
                  />
                </div>
              </Card>

              {/* Emergency Contacts */}
              <Card className="flex flex-col gap-4">
                <SectionTitle icon={<Users size={16} strokeWidth={STROKE} />}>
                  Emergency Contacts
                </SectionTitle>

                {settings.contacts.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {settings.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between gap-3 rounded-control bg-surface p-3.5"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                            <Phone size={16} strokeWidth={STROKE} className="text-ink" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-semibold leading-5 text-ink truncate">
                              {contact.name}
                            </p>
                            <p className="text-[12px] leading-[16px] text-muted truncate">
                              {contact.phone}
                              {contact.relationship ? ` · ${contact.relationship}` : ''}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveContact(contact.id)}
                          className="p-2 text-muted hover:text-amber transition-colors shrink-0"
                          title="Remove contact"
                        >
                          <Trash2 size={17} strokeWidth={STROKE} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-control bg-surface p-4">
                    <p className="text-[13px] leading-[19px] text-body">
                      No emergency contacts added yet.
                    </p>
                    <p className="text-[12px] leading-[17px] text-muted mt-0.5">
                      Add trusted people who can be notified in an emergency.
                    </p>
                  </div>
                )}

                {/* Add New Contact */}
                <div className="border-t border-line pt-4 flex flex-col gap-3">
                  <p className="text-[14px] font-semibold leading-[21px] text-ink">
                    Add new contact
                  </p>
                  <div className="flex flex-col md:flex-row gap-2.5">
                    <Input
                      type="text"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      placeholder="Name"
                    />
                    <Input
                      type="tel"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      placeholder="Phone number"
                    />
                    <Input
                      type="text"
                      value={newContact.relationship}
                      onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                      placeholder="Relationship"
                    />
                  </div>
                  <button
                    onClick={handleAddContact}
                    className="self-start inline-flex items-center gap-2 h-[44px] px-5 rounded-control bg-accent text-[14px] font-semibold leading-[18px] text-ink transition hover:brightness-[0.98]"
                  >
                    <Plus size={17} strokeWidth={STROKE} />
                    Add contact
                  </button>
                </div>
              </Card>

              {/* Auto Reply */}
              <Card className="flex flex-col gap-4">
                <SectionTitle icon={<RotateCcw size={16} strokeWidth={STROKE} />}>
                  Auto-reply
                </SectionTitle>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[14px] leading-[21px] text-body">
                    Send an automatic reply to new finders
                  </span>
                  <Toggle
                    on={settings.autoReply}
                    onClick={() => setSettings({ ...settings, autoReply: !settings.autoReply })}
                  />
                </div>
                {settings.autoReply && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold leading-4 text-body">
                      Auto-reply message
                    </label>
                    <TextArea
                      value={settings.autoReplyMessage}
                      onChange={(e) => setSettings({ ...settings, autoReplyMessage: e.target.value })}
                      rows={3}
                      placeholder="Auto-reply message sent to finders"
                    />
                  </div>
                )}
              </Card>

              {/* Save Button */}
              <PrimaryButton onClick={handleSave}>
                {saved ? '✓ Saved Successfully!' : 'Save All Settings'}
              </PrimaryButton>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* App Info */}
              <Card className="flex flex-col gap-3">
                <SectionTitle icon={<Info size={16} strokeWidth={STROKE} />}>
                  About Founder
                </SectionTitle>
                <div className="flex flex-col gap-2.5 text-[13px] leading-[19px] text-body">
                  <p>
                    <span className="font-semibold text-ink">Version:</span>{' '}
                    1.0.0
                  </p>
                  <p>
                    <span className="font-semibold text-ink">Platform:</span>{' '}
                    Web · iOS &amp; Android
                  </p>
                  <p>
                    <span className="font-semibold text-ink">Description:</span>{' '}
                    Founder is a private found-item contact system. A single QR
                    code lets a finder reach you through anonymous text — no
                    name or phone number is ever shown.
                  </p>
                </div>
              </Card>

              {/* Help & Support */}
              <Card className="flex flex-col gap-3.5">
                <SectionTitle icon={<LifeBuoy size={16} strokeWidth={STROKE} />}>
                  Help &amp; Support
                </SectionTitle>
                <div className="flex flex-col gap-2.5">
                  <div className="rounded-control bg-mint p-3.5">
                    <p className="text-[13px] font-semibold leading-4 text-mint-ink mb-1">
                      How it works
                    </p>
                    <p className="text-[12px] leading-[17px] text-body">
                      Share your unique QR code with trusted people. When they
                      scan it, they land on your private chat and can contact
                      you directly.
                    </p>
                  </div>
                  <div className="rounded-control bg-mint p-3.5">
                    <p className="text-[13px] font-semibold leading-4 text-mint-ink mb-1">
                      Managing chats
                    </p>
                    <p className="text-[12px] leading-[17px] text-body">
                      All incoming chats appear in the “Chats” tab. You can
                      reply to messages, mark them as read, or delete
                      conversations.
                    </p>
                  </div>
                  <div className="rounded-control bg-mint p-3.5">
                    <p className="text-[13px] font-semibold leading-4 text-mint-ink mb-1">
                      Finder allowance
                    </p>
                    <p className="text-[12px] leading-[17px] text-body">
                      Each finder can send 10 messages in total. The allowance
                      never resets, even after another scan or a new session.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Notifications */}
              <Card className="flex flex-col gap-4">
                <SectionTitle icon={<Bell size={16} strokeWidth={STROKE} />}>
                  Notifications
                </SectionTitle>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[14px] leading-[21px] text-body">
                    Notify me when a finder sends a message
                  </span>
                  <Toggle
                    on={settings.notificationsEnabled}
                    onClick={() => {
                      const updated = { ...settings, notificationsEnabled: !settings.notificationsEnabled };
                      setSettings(updated);
                      saveSettings(updated);
                    }}
                  />
                </div>
              </Card>

              {/* Privacy */}
              <Card className="flex flex-col gap-3">
                <SectionTitle icon={<ShieldCheck size={16} strokeWidth={STROKE} />}>
                  Privacy
                </SectionTitle>
                <p className="text-[13px] leading-[19px] text-body">
                  Your contact details stay hidden. Finders only ever see a
                  private text conversation, and chat messages are anonymous.
                </p>
              </Card>

              {/* Contact Support */}
              <Card className="flex flex-col gap-3.5">
                <SectionTitle icon={<Mail size={16} strokeWidth={STROKE} />}>
                  Contact Support
                </SectionTitle>
                <p className="text-[13px] leading-[19px] text-body">
                  Need help? Reach out to our support team.
                </p>
                <div className="flex flex-col md:flex-row gap-2.5">
                  <a
                    href="mailto:support@saferch.app"
                    className="inline-flex items-center justify-center gap-2 h-[46px] px-5 rounded-control bg-surface text-[14px] font-semibold text-ink transition hover:bg-line"
                  >
                    <Mail size={17} strokeWidth={STROKE} />
                    Email Support
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center justify-center gap-2 h-[46px] px-5 rounded-control bg-surface text-[14px] font-semibold text-ink transition hover:bg-line"
                  >
                    <BookOpen size={17} strokeWidth={STROKE} />
                    Documentation
                  </a>
                </div>
              </Card>

              {/* Allowance info (read-only) */}
              <div className="rounded-control bg-accent-soft p-3.5 flex items-start gap-2.5">
                <Lock size={16} strokeWidth={STROKE} className="text-ink mt-0.5 shrink-0" />
                <p className="text-[12px] leading-[17px] text-body">
                  This owner plan allows each finder a fixed allowance of 10
                  messages per chat. It can be managed from the Founder mobile
                  app.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
import React from 'react';
import { ScanLine, MessageCircle, User, ShieldCheck } from 'lucide-react';
import {
  AppShell,
  Badge,
  Brand,
  STROKE,
  Card,
  PrivacyNote,
} from '../components/FounderUI';
import { getSettings } from '../storage';

/*
 * Finder browser · QR arrival (generic landing)
 * Figma: 2:19097 / 2:19261
 */
const PublicPage: React.FC = () => {
  const settings = getSettings();

  const steps = [
    'Scan the owner’s Founder QR code.',
    'Start a private text chat.',
    'The owner is notified instantly.',
  ];

  return (
    <AppShell>
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-[72px] shrink-0">
        <Brand nameSize="sm" />
        <Badge>Private chat</Badge>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pt-2.5 pb-6">
        <div className="flex flex-col gap-[22px]">
          {/* Scan confirmation */}
          <div className="w-16 h-16 rounded-card bg-accent flex items-center justify-center">
            <ScanLine size={32} strokeWidth={STROKE} className="text-ink" />
          </div>

          {/* Introduction */}
          <div className="flex flex-col gap-2.5">
            <p className="text-[12px] font-bold leading-[17px] text-amber">
              YOU SCANNED A FOUNDER QR
            </p>
            <h1 className="text-[28px] font-bold leading-8 text-ink whitespace-pre-line">
              {'Found something?\nYou’re in the right place.'}
            </h1>
            <p className="text-[15px] font-normal leading-[22px] text-body">
              Send a text to its owner and help their belongings find a way
              home.
            </p>
          </div>

          {/* Owner's message */}
          <Card className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <MessageCircle
                size={23}
                strokeWidth={STROKE}
                className="text-ink shrink-0"
              />
              <p className="text-[15px] font-semibold leading-[22px] text-ink">
                {settings.emergencyMessage}
              </p>
            </div>
            <p className="text-[12px] font-normal leading-[17px] text-body">
              If you need to reach the owner, they’ll see your message right away.
            </p>
          </Card>

          {/* How it works */}
          <div className="flex flex-col gap-2.5">
            <p className="text-[12px] font-semibold leading-[17px] text-muted">
              HOW IT WORKS
            </p>
            <div className="flex flex-col gap-2.5">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-2.5">
                  <span className="w-[22px] h-[22px] rounded-full bg-accent-soft flex items-center justify-center shrink-0 text-[11px] font-bold text-amber">
                    {index + 1}
                  </span>
                  <span className="text-[13px] leading-[19px] text-body">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Anonymous identity */}
          <div className="flex items-start gap-2.5 rounded-control bg-surface p-3.5">
            <User
              size={18}
              strokeWidth={STROKE}
              className="text-ink mt-0.5 shrink-0"
            />
            <p className="text-[12px] font-normal leading-[17px] text-body">
              No name, phone number, or contact details are shown. Just a private
              text conversation.
            </p>
          </div>

          <PrivacyNote
            tone="yellow"
            icon={<ShieldCheck size={16} strokeWidth={STROKE} />}
          >
            Your messages are private. The owner’s contact details always stay
            hidden.
          </PrivacyNote>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-line pt-4 text-center">
          <p className="text-[11px] leading-4 text-muted">
            Scan the owner’s Founder QR code to start a chat.
          </p>
          <p className="text-[11px] leading-4 text-muted mt-1">
            Powered by Founder
          </p>
        </div>
      </div>
    </AppShell>
  );
};

export default PublicPage;

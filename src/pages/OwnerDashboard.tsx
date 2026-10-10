import React, { useState } from 'react';
import OwnerChats from './OwnerChats';
import SettingsPage from './SettingsPage';
import { MessageSquare, Settings as SettingsIcon } from 'lucide-react';
import { Brand, BottomNav, NavItem, STROKE } from '../components/FounderUI';

type Tab = 'chats' | 'settings';

const OwnerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chats');

  const navItems: NavItem[] = [
    {
      key: 'chats',
      label: 'Chats',
      icon: <MessageSquare size={21} strokeWidth={STROKE} />,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingsIcon size={21} strokeWidth={STROKE} />,
    },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Mobile Top Bar */}
      <div className="md:hidden shrink-0 bg-white border-b border-line px-6 h-[72px] flex items-center justify-between">
        <Brand nameSize="sm" />
        <span className="rounded-full bg-accent-soft px-2.5 py-[5px] text-[11px] font-semibold leading-[13px] text-amber">
          Owner mode
        </span>
      </div>

      {/* Desktop Sidebar + Content */}
      <div className="flex-1 flex min-h-0">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-line shrink-0">
          <div className="px-6 h-[76px] border-b border-line flex items-center">
            <Brand nameSize="sm" />
          </div>

          <nav className="flex-1 p-4 flex flex-col gap-1.5">
            {navItems.map((item) => {
              const active = item.key === activeTab;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key as Tab)}
                  className={`flex items-center gap-3 px-4 h-[46px] rounded-control text-[14px] font-medium transition-colors ${
                    active
                      ? 'bg-accent-soft text-ink'
                      : 'text-body hover:bg-surface'
                  }`}
                >
                  <span className={active ? 'text-ink' : 'text-muted'}>
                    {item.icon}
                  </span>
                  <span className={active ? 'font-semibold' : ''}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Bottom info */}
          <div className="p-4 border-t border-line">
            <div className="rounded-control bg-surface p-4">
              <p className="text-[11px] leading-4 text-body">
                Founder owner dashboard
              </p>
              <p className="text-[11px] leading-4 text-muted mt-1">
                Web · iOS &amp; Android
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-0">
          {activeTab === 'chats' && <OwnerChats />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden shrink-0 bg-white">
        <BottomNav
          items={navItems}
          active={activeTab}
          onChange={(key) => setActiveTab(key as Tab)}
        />
      </div>
    </div>
  );
};

export default OwnerDashboard;
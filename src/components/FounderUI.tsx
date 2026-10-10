import React from "react";
import {
  ScanLine,
  ArrowLeft,
  ArrowUp,
  Lock,
  ShieldCheck,
} from "lucide-react";

/* Icons in the design are drawn with a light ~1px stroke. */
export const STROKE = 1.75;

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

/*
 * The Founder design is a 390px-wide mobile canvas. Finder pages use this
 * centred column; the owner dashboard keeps its own responsive shell.
 */
export const AppShell: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className="min-h-screen w-full bg-white flex justify-center">
    <div
      className={`w-full max-w-[430px] min-h-screen flex flex-col bg-white ${className}`}
    >
      {children}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Brand                                                               */
/* ------------------------------------------------------------------ */

export const BrandMark: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = "",
}) => (
  <div
    className={`rounded-[10px] bg-accent flex items-center justify-center shrink-0 ${className}`}
    style={{ width: size, height: size }}
  >
    <ScanLine
      size={Math.round(size * 0.68)}
      strokeWidth={STROKE}
      className="text-ink"
    />
  </div>
);

export const Brand: React.FC<{
  nameSize?: "sm" | "md";
  markSize?: number;
}> = ({ nameSize = "md", markSize = 32 }) => (
  <div className="flex items-center gap-[9px]">
    <BrandMark size={markSize} />
    <span
      className={
        nameSize === "md"
          ? "font-bold text-[22px] leading-[27px] text-ink"
          : "font-bold text-[19px] leading-[23px] text-ink"
      }
    >
      Founder
    </span>
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-[5px] text-[11px] font-semibold leading-[13px] text-amber">
    {children}
  </span>
);

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

export const IconButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className = "", ...rest }) => (
  <button
    {...rest}
    className={`w-[22px] h-[22px] flex items-center justify-center text-ink transition-opacity hover:opacity-60 disabled:opacity-40 ${className}`}
  >
    {children}
  </button>
);

export const AppHeader: React.FC<{
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  brand?: boolean;
  right?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, onBack, brand, right, className = "" }) => (
  <header
    className={`flex items-center gap-3 px-6 h-[72px] shrink-0 ${className}`}
  >
    {onBack && (
      <IconButton onClick={onBack} aria-label="Back">
        <ArrowLeft size={22} strokeWidth={STROKE} />
      </IconButton>
    )}

    {brand ? (
      <div className="flex-1 min-w-0">
        <Brand nameSize="sm" />
      </div>
    ) : (
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <h1 className="text-[17px] font-semibold leading-[21px] text-ink truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] font-normal leading-[13px] text-muted truncate">
            {subtitle}
          </p>
        )}
      </div>
    )}

    {right}
  </header>
);

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode;
};

export const PrimaryButton: React.FC<ButtonProps> = ({
  children,
  icon,
  className = "",
  ...rest
}) => (
  <button
    {...rest}
    className={`h-[54px] w-full rounded-control bg-accent border border-white/70 inline-flex items-center justify-center gap-2.5 px-4 text-[15px] font-semibold leading-[18px] text-ink transition active:scale-[0.99] hover:brightness-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 ${className}`}
  >
    {icon}
    <span className="truncate">{children}</span>
  </button>
);

export const SecondaryButton: React.FC<ButtonProps> = ({
  children,
  icon,
  className = "",
  ...rest
}) => (
  <button
    {...rest}
    className={`h-[54px] w-full rounded-control bg-white border border-line inline-flex items-center justify-center gap-2.5 px-4 text-[15px] font-semibold leading-[18px] text-ink transition active:scale-[0.99] hover:bg-surface disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
  >
    {icon}
    <span className="truncate">{children}</span>
  </button>
);

export const TextButton: React.FC<ButtonProps> = ({
  children,
  className = "",
  ...rest
}) => (
  <button
    {...rest}
    className={`w-full py-2 text-center text-[14px] font-semibold leading-[21px] text-ink transition-opacity hover:opacity-60 ${className}`}
  >
    {children}
  </button>
);

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`rounded-card border border-line bg-white p-[18px] ${className}`}>
    {children}
  </div>
);

type NoteTone = "neutral" | "green" | "yellow";

export const PrivacyNote: React.FC<{
  children: React.ReactNode;
  icon?: React.ReactNode;
  tone?: NoteTone;
  className?: string;
}> = ({ children, icon, tone = "neutral", className = "" }) => {
  const tones: Record<NoteTone, string> = {
    neutral: "bg-surface text-body",
    green: "bg-mint text-body",
    yellow: "bg-accent-soft text-body",
  };
  return (
    <div
      className={`flex items-start gap-2.5 rounded-control p-3.5 ${tones[tone]} ${className}`}
    >
      <span className="w-[18px] h-[18px] mt-0.5 shrink-0 flex items-center justify-center">
        {icon ?? <ShieldCheck size={16} strokeWidth={STROKE} />}
      </span>
      <p className="text-[12px] font-normal leading-[17px]">{children}</p>
    </div>
  );
};

export const AdPlaceholder: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div
    className={`flex items-center gap-2.5 rounded-chip bg-surface px-3 py-3 ${className}`}
  >
    <div className="w-[30px] h-[28px] rounded-md bg-white flex items-center justify-center shrink-0">
      <span className="text-[10px] font-normal leading-[12px] text-muted">
        AD
      </span>
    </div>
    <div className="flex flex-col gap-0.5 min-w-0">
      <p className="text-[11px] font-semibold leading-4 text-body truncate">
        Space for a sponsor · Free plan
      </p>
      <p className="text-[11px] font-normal leading-4 text-muted truncate">
        Prefer no ads? Explore lifetime Premium.
      </p>
    </div>
  </div>
);

export const ProgressBar: React.FC<{ value: number; max: number }> = ({
  value,
  max,
}) => {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="h-[5px] w-full rounded-full bg-white overflow-hidden">
      <div
        className="h-full rounded-full bg-accent transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

export const Spinner: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <span
    className={`inline-block w-5 h-5 rounded-full border-2 border-ink/25 border-t-ink animate-spin-slow ${className}`}
  />
);

/* ------------------------------------------------------------------ */
/* Chat primitives                                                     */
/* ------------------------------------------------------------------ */

export const MessageBubble: React.FC<{
  side: "me" | "them";
  text: string;
  time?: string;
  meta?: string;
}> = ({ side, text, time, meta }) => {
  const mine = side === "me";
  return (
    <div className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[280px] rounded-[17px] px-3.5 py-3.5 text-[14px] font-normal leading-5 text-ink ${
          mine
            ? "bg-accent-soft rounded-br-[4px]"
            : "bg-surface rounded-bl-[4px]"
        }`}
      >
        {text}
      </div>
      {(time || meta) && (
        <p className="mt-[5px] text-[10px] font-normal leading-[12px] text-muted">
          {[time, meta].filter(Boolean).join(" · ")}
        </p>
      )}
    </div>
  );
};

export const Composer: React.FC<{
  value?: string;
  onChange?: (v: string) => void;
  onSend?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  locked?: boolean;
  sending?: boolean;
}> = ({
  value = "",
  onChange,
  onSend,
  onKeyDown,
  placeholder = "Write a message…",
  disabled,
  locked,
  sending,
}) => (
  <div className="flex items-center gap-2.5">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled || locked}
      className="flex-1 h-[54px] rounded-control bg-surface px-3.5 text-[14px] font-normal leading-5 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-70"
    />
    <button
      type="button"
      onClick={onSend}
      disabled={disabled || locked || !value.trim() || sending}
      title={locked ? "Message allowance used" : "Send"}
      className={`w-[54px] h-[54px] rounded-control flex items-center justify-center shrink-0 transition active:scale-95 disabled:active:scale-100 ${
        locked || disabled
          ? "bg-disabled text-muted"
          : "bg-accent text-ink hover:brightness-[0.98] disabled:opacity-50"
      }`}
    >
      {locked ? (
        <Lock size={20} strokeWidth={STROKE} />
      ) : sending ? (
        <Spinner className="border-ink/25 border-t-ink" />
      ) : (
        <ArrowUp size={22} strokeWidth={STROKE} />
      )}
    </button>
  </div>
);

export const LimitCard: React.FC<{
  limit: number;
  className?: string;
}> = ({ limit, className = "" }) => (
  <div
    className={`rounded-card border border-white bg-surface p-[18px] flex flex-col gap-3 ${className}`}
  >
    <div className="flex items-center gap-2.5">
      <Lock size={19} strokeWidth={STROKE} className="text-ink shrink-0" />
      <h3 className="text-[16px] font-semibold leading-[23px] text-ink">
        Your message limit is reached
      </h3>
    </div>
    <p className="text-[13px] font-normal leading-[19px] text-body">
      You’ve used all {limit} messages allowed by this owner. You can’t message
      this owner again, now or later.
    </p>
    <p className="text-[12px] font-normal leading-[17px] text-body">
      This is not a daily limit. Another scan, a new session, or switching to the
      app won’t reset it.
    </p>
  </div>
);

/* ------------------------------------------------------------------ */
/* Bottom navigation                                                   */
/* ------------------------------------------------------------------ */

export interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

export const BottomNav: React.FC<{
  items: NavItem[];
  active: string;
  onChange: (key: string) => void;
}> = ({ items, active, onChange }) => (
  <nav className="shrink-0 border-t border-line bg-white px-7 pt-2.5 pb-2 flex items-stretch justify-between">
    {items.map((item) => {
      const isActive = item.key === active;
      return (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className="flex-1 flex flex-col items-center gap-1"
        >
          <span
            className={`w-[54px] h-[30px] rounded-full flex items-center justify-center transition-colors ${
              isActive ? "bg-accent-soft" : "bg-white"
            }`}
          >
            {item.icon}
          </span>
          <span
            className={`text-[11px] leading-[13px] ${
              isActive ? "font-bold text-ink" : "font-medium text-muted"
            }`}
          >
            {item.label}
          </span>
        </button>
      );
    })}
  </nav>
);

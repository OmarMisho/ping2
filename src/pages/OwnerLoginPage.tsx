import { useState } from 'react';
import { loginOwner, registerOwner } from '../firebase';
import {
  AppShell,
  AppHeader,
  PrimaryButton,
  TextButton,
  PrivacyNote,
  Spinner,
  STROKE,
} from '../components/FounderUI';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';

export default function OwnerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);

      if (isRegistering) {
        await registerOwner(email, password);
      } else {
        await loginOwner(email, password);
      }

      window.location.href = '/owner';
    } catch (err: any) {
      console.error(err);

      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak.');
      } else {
        setError(err.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <AppHeader brand />

      <div className="flex-1 flex flex-col justify-center px-6 pb-10">
        <div className="flex flex-col gap-2.5 mb-7">
          <p className="text-[12px] font-bold leading-[17px] text-amber">
            OWNER ACCESS
          </p>
          <h1 className="text-[26px] font-bold leading-8 text-ink">
            {isRegistering ? 'Create owner account' : 'Owner login'}
          </h1>
          <p className="text-[15px] font-normal leading-[22px] text-body">
            {isRegistering
              ? 'Manage your Founder QR code and reply to finder chats whenever you’re scanned.'
              : 'Welcome back. Sign in to see your finder chats.'}
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold leading-4 text-body">
              Email
            </span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[54px] rounded-control bg-surface px-3.5 text-[14px] font-normal leading-5 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold leading-4 text-body">
              Password
            </span>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[54px] rounded-control bg-surface px-3.5 text-[14px] font-normal leading-5 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </label>

          {error && (
            <p className="text-[13px] leading-5 text-amber rounded-control bg-accent-soft px-3.5 py-3">
              {error}
            </p>
          )}

          <PrimaryButton
            onClick={handleSubmit}
            disabled={loading}
            icon={
              loading ? (
                <Spinner className="border-ink/25 border-t-ink" />
              ) : isRegistering ? (
                <UserPlus size={20} strokeWidth={STROKE} />
              ) : (
                <LogIn size={20} strokeWidth={STROKE} />
              )
            }
          >
            {loading
              ? 'Please wait…'
              : isRegistering
                ? 'Create account'
                : 'Login'}
          </PrimaryButton>

          <TextButton
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
          >
            {isRegistering
              ? 'Already have an account? Login'
              : 'Create a new owner account'}
          </TextButton>
        </div>

        <div className="mt-9">
          <PrivacyNote
            tone="yellow"
            icon={<ShieldCheck size={16} strokeWidth={STROKE} />}
          >
            Only the account owner can see this dashboard. Finder chats stay
            anonymous and private.
          </PrivacyNote>
        </div>
      </div>
    </AppShell>
  );
}
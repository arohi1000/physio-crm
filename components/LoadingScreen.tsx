/**
 * What the app shows while it asks the API whether the refresh cookie still
 * buys a session. Anything else — the login form, an empty shell — would flash
 * the wrong screen at someone who is in fact signed in.
 */
export function LoadingScreen({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="text-ink-soft flex min-h-dvh items-center justify-center p-4 text-sm"
    >
      <span className="animate-pulse">{message}</span>
    </div>
  );
}

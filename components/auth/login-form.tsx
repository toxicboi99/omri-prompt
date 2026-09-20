'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';

export function LoginForm() {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    const form = new FormData(event.currentTarget);
    const result = await signIn('credentials', {
      email: form.get('email'),
      password: form.get('password'),
      callbackUrl: '/admin',
      redirect: false,
    });
    setPending(false);
    if (!result?.ok) setError('The email or password is incorrect.');
    else window.location.assign(result.url ?? '/admin');
  }

  return <form onSubmit={submit}>
    <label>Email<input name="email" type="email" defaultValue="shaharyan932@gmail.com" autoComplete="email" required/></label>
    <label>Password<input name="password" type="password" autoComplete="current-password" required/></label>
    {error && <p role="alert">{error}</p>}
    <button className="primary-action" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
  </form>;
}

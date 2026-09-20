'use client';

import { signOut } from 'next-auth/react';

export function LogoutButton() {
  return <button className="google-action" type="button" onClick={() => signOut({ callbackUrl: '/login' })}>Log out</button>;
}

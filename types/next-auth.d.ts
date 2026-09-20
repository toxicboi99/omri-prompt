import { Role } from '@prisma/client';
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: { id: string; role: Role } & NonNullable<Session['user']>;
  }
  interface User {
    role: Role;
  }
}

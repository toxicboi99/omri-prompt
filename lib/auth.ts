import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

const providers = [
  CredentialsProvider({
    name: 'Email and password',
    credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
    async authorize(credentials) {
      const email = credentials?.email?.trim().toLowerCase();
      const password = credentials?.password;
      if (!email || !password) return null;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) return null;
      return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
    },
  }),
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })] : []),
];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role === 'ADMIN' ? 'ADMIN' : 'USER';
      }
      return session;
    },
  },
};

export const getCurrentUser = () => getServerSession(authOptions);
export async function requireAdmin() {
  const session = await getCurrentUser();
  if (session?.user.role !== 'ADMIN') redirect('/login');
  return session;
}

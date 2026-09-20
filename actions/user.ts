'use server';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { slugify } from '@/lib/slug';

export async function registerUser(data: FormData) { const name = String(data.get('name') ?? '').trim(); const email = String(data.get('email') ?? '').trim().toLowerCase(); const password = String(data.get('password') ?? ''); if (!email || password.length < 8) throw new Error('Use a valid email and an 8-character password.'); const exists = await prisma.user.findUnique({ where: { email } }); if (exists) throw new Error('An account already exists for this email.'); await prisma.user.create({ data: { name: name || null, email, passwordHash: await bcrypt.hash(password, 12) } }); redirect('/login?registered=1'); }
export async function submitPrompt(data: FormData) { const session = await getCurrentUser(); if (!session?.user.id) redirect('/login?callbackUrl=/submit'); const title = String(data.get('title') ?? '').trim(); const prompt = String(data.get('prompt') ?? '').trim(); const description = String(data.get('description') ?? '').trim(); const category = String(data.get('category') ?? '').trim(); if (title.length < 4 || prompt.length < 20 || description.length < 20 || !category) throw new Error('Complete the required submission fields.'); await prisma.submission.create({ data: { userId: session.user.id, title, prompt, description, category, tags: String(data.get('tags') ?? '').split(',').map((tag) => slugify(tag)).filter(Boolean) } }); redirect('/submissions'); }

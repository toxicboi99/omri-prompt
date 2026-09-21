import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const activitySchema = z.object({
  type: z.enum(['view', 'copy', 'share']),
  anonymousId: z.string().max(128).optional(),
  network: z.string().max(40).optional(),
});

async function saveActivity(promptId: string, type: 'view' | 'copy' | 'share', anonymousId?: string, network?: string) {
  const transaction = () => prisma.$transaction(async (tx) => {
    if (type === 'view') {
      await tx.promptView.create({ data: { promptId, anonymousId } });
      await tx.prompt.update({ where: { id: promptId }, data: { viewCount: { increment: 1 } } });
    } else if (type === 'copy') {
      await tx.promptCopy.create({ data: { promptId, anonymousId } });
      await tx.prompt.update({ where: { id: promptId }, data: { copyCount: { increment: 1 } } });
    } else {
      await tx.promptShare.create({ data: { promptId, anonymousId, network } });
      await tx.prompt.update({ where: { id: promptId }, data: { shareCount: { increment: 1 } } });
    }
    await tx.analyticsEvent.create({ data: { event: `prompt_${type}`, promptId, anonymousId } });
  });

  try {
    await transaction();
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P1017') throw error;
    await prisma.$disconnect();
    await prisma.$connect();
    await transaction();
  }
}

export async function POST(request: Request, context: RouteContext<'/api/prompts/[slug]/activity'>) {
  const input = activitySchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return Response.json({ error: 'Invalid activity payload' }, { status: 400 });
  const { slug } = await context.params;
  const prompt = await prisma.prompt.findUnique({ where: { slug }, select: { id: true } });
  if (!prompt) return Response.json({ error: 'Prompt not found' }, { status: 404 });
  const { type, anonymousId, network } = input.data;
  try {
    await saveActivity(prompt.id, type, anonymousId, network);
  } catch (error) {
    console.error('Unable to record prompt activity', error);
    return Response.json({ error: 'Activity temporarily unavailable' }, { status: 503 });
  }
  return Response.json({ ok: true }, { status: 201 });
}

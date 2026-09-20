import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const activitySchema = z.object({
  type: z.enum(['view', 'copy', 'share']),
  anonymousId: z.string().max(128).optional(),
  network: z.string().max(40).optional(),
});

export async function POST(request: Request, context: RouteContext<'/api/prompts/[slug]/activity'>) {
  const input = activitySchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return Response.json({ error: 'Invalid activity payload' }, { status: 400 });
  const { slug } = await context.params;
  const prompt = await prisma.prompt.findUnique({ where: { slug }, select: { id: true } });
  if (!prompt) return Response.json({ error: 'Prompt not found' }, { status: 404 });
  const { type, anonymousId, network } = input.data;
  await prisma.$transaction(async (tx) => {
    if (type === 'view') {
      await tx.promptView.create({ data: { promptId: prompt.id, anonymousId } });
      await tx.prompt.update({ where: { id: prompt.id }, data: { viewCount: { increment: 1 } } });
    } else if (type === 'copy') {
      await tx.promptCopy.create({ data: { promptId: prompt.id, anonymousId } });
      await tx.prompt.update({ where: { id: prompt.id }, data: { copyCount: { increment: 1 } } });
    } else {
      await tx.promptShare.create({ data: { promptId: prompt.id, anonymousId, network } });
      await tx.prompt.update({ where: { id: prompt.id }, data: { shareCount: { increment: 1 } } });
    }
    await tx.analyticsEvent.create({ data: { event: `prompt_${type}`, promptId: prompt.id, anonymousId } });
  });
  return Response.json({ ok: true }, { status: 201 });
}

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const categories = ['Men', 'Women', 'Couples', 'Friends', 'Family', 'Wedding', 'Fashion', 'Luxury', 'Cars', 'Bikes', 'Travel', 'Fitness', 'Cinematic', 'Street Photography', 'Professional', 'Instagram', 'Profile Pictures', 'Traditional', 'Festival', 'Lifestyle'];
const tags = ['portrait', 'editorial', 'photorealistic', 'fashion', 'lighting', 'travel', 'studio', 'lifestyle', 'cinematic', 'social'];
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'shaharyan932@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Ritesh@143';
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: 'Ritesh Sah', role: 'ADMIN', passwordHash },
    create: { email: adminEmail, name: 'Ritesh Sah', role: 'ADMIN', passwordHash },
  });

  const categoryRows = await Promise.all(categories.map((name, displayOrder) => prisma.category.upsert({
    where: { slug: slugify(name) },
    update: { name, displayOrder },
    create: { name, slug: slugify(name), description: `Curated AI photo prompts for ${name.toLowerCase()} creators.`, displayOrder },
  })));
  const tagRows = await Promise.all(tags.map((name) => prisma.tag.upsert({
    where: { slug: slugify(name) },
    update: { name },
    create: { name, slug: slugify(name) },
  })));

  await Promise.all(Array.from({ length: 100 }, (_, index) => {
    const number = index + 1;
    const category = categoryRows[index % categoryRows.length];
    const title = `${category.name} Portrait ${number}`;
    return prisma.prompt.upsert({
      where: { slug: `${slugify(category.name)}-portrait-${number}` },
      update: { title, categoryId: category.id, status: 'PUBLISHED' },
      create: {
        title,
        slug: `${slugify(category.name)}-portrait-${number}`,
        prompt: `AI photo of a confident ${category.name.toLowerCase()} subject, intentional composition, natural texture, precise lighting, high detail, 4:5 aspect ratio`,
        description: `A ready-to-copy prompt created for ${category.name.toLowerCase()} imagery.`,
        categoryId: category.id,
        authorId: admin.id,
        status: 'PUBLISHED',
        isFeatured: index < 8,
        isTrending: index < 20,
        copyCount: 100 - index,
        tags: { create: [tagRows[index % tagRows.length], tagRows[(index + 3) % tagRows.length]].map((tag) => ({ tag: { connect: { id: tag.id } } })) },
      },
    });
  }));
  const guides = await prisma.blogCategory.upsert({ where: { slug: 'guides' }, update: {}, create: { name: 'Guides', slug: 'guides' } });
  await Promise.all([
    ['Midjourney', 'midjourney', 'A creative image-generation platform known for cinematic, stylized results.', 'https://www.midjourney.com'],
    ['DALL·E', 'dall-e', 'Create precise, imaginative images from natural-language instructions.', 'https://openai.com/dall-e-3'],
    ['Leonardo AI', 'leonardo-ai', 'An image workflow for production-minded creators and teams.', 'https://leonardo.ai'],
    ['Stable Diffusion', 'stable-diffusion', 'A flexible, open image-generation ecosystem.', 'https://stability.ai'],
    ['Adobe Firefly', 'adobe-firefly', 'Generative image tools integrated into Adobe’s creative workflow.', 'https://firefly.adobe.com'],
    ['Ideogram', 'ideogram', 'Image generation with strong typography and design controls.', 'https://ideogram.ai'],
  ].map(([name, slug, description, website], index) => prisma.aITool.upsert({ where: { slug }, update: { name, description, website, isFeatured: index < 3 }, create: { name, slug, description, website, isFeatured: index < 3, features: ['Text to image', 'Prompt support'] } })));
  await Promise.all([
    ['The Complete Guide to AI Photo Prompts', 'complete-guide-ai-photo-prompts', 'A practical framework for describing a subject, visual direction, light, lens, and composition.', '# Start with a visual intention\n\nA strong prompt communicates one clear image idea. Begin with the subject and setting, then layer in light, composition, and a visual reference.\n\n# Refine deliberately\n\nChange one variable at a time so you can understand what improves the result.'],
    ['How to Write Better Portrait Prompts', 'how-to-write-better-portrait-prompts', 'Use specific lighting, expression, lens, and background direction to create believable portraits.', '# Describe the person and moment\n\nChoose a specific expression, wardrobe, location, and light direction instead of a broad list of aesthetic terms.\n\n# Use camera language with purpose\n\nLens and composition guide perspective. Use them to support the image rather than decorate the prompt.'],
    ['AI Photography Styles Worth Exploring', 'ai-photography-styles-worth-exploring', 'A grounded introduction to cinematic, editorial, studio, and documentary visual styles.', '# Pick a visual language\n\nA style should inform the light, framing, color grade, and level of realism.\n\n# Build a reusable vocabulary\n\nSave the directions that give your images a recognizable point of view.'],
  ].map(([title, slug, excerpt, content]) => prisma.blogPost.upsert({ where: { slug }, update: { title, excerpt, content, status: 'PUBLISHED', publishedAt: new Date() }, create: { title, slug, excerpt, content, authorName: 'OMRI Prompt Editorial', categoryId: guides.id, status: 'PUBLISHED', publishedAt: new Date() } })));
  console.log('Seeded 1 admin, 20 categories, 10 tags, 100 prompts, AI tools, and editorial articles.');
}

main().finally(() => prisma.$disconnect());

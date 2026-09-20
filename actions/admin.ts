'use server';
import { Prisma, ContentStatus, Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { slugify } from '@/lib/slug';

const status = (value: FormDataEntryValue | null) => Object.values(ContentStatus).includes(value as ContentStatus) ? value as ContentStatus : 'DRAFT';
function text(data: FormData, key: string) { return String(data.get(key) ?? '').trim(); }
function invalidate() { ['/', '/prompts', '/categories', '/styles', '/blog', '/ai-tools', '/trending', '/new', '/sitemap.xml'].forEach((path) => revalidatePath(path)); }

async function uploadOptionalImage(data: FormData, fieldName: string, altText: string) {
  const fileEntry = data.get(fieldName);
  if (!(fileEntry instanceof File) || fileEntry.size === 0) return null;

  const uploaded = await uploadToCloudinary(fileEntry, altText || 'OMRI Prompt image');
  return {
    url: uploaded.secureUrl,
    publicId: uploaded.publicId,
    width: uploaded.width,
    height: uploaded.height,
    format: uploaded.format,
    altText: uploaded.altText,
  };
}

async function saveImageRecordFromUrl(url: string, altText: string) {
  if (!/^https?:\/\//i.test(url)) return null;

  const publicId = `external-${slugify(url).slice(0, 80) || 'image'}`;
  return prisma.image.upsert({
    where: { publicId },
    update: { url, altText },
    create: {
      publicId,
      url,
      width: 0,
      height: 0,
      format: 'external',
      altText,
    },
  });
}

export async function saveHero(data: FormData) { await requireAdmin(); const value = { title: text(data, 'title'), subtitle: text(data, 'subtitle'), searchPlaceholder: text(data, 'searchPlaceholder'), primaryCtaText: text(data, 'primaryCtaText'), primaryCtaUrl: text(data, 'primaryCtaUrl'), secondaryCtaText: text(data, 'secondaryCtaText'), secondaryCtaUrl: text(data, 'secondaryCtaUrl'), imageUrl: text(data, 'imageUrl'), overlayOpacity: Math.min(100, Math.max(0, Number(data.get('overlayOpacity')) || 35)), alignment: 'left', enabled: data.get('enabled') === 'on' }; await prisma.siteSetting.upsert({ where: { key: 'homepage.hero' }, create: { key: 'homepage.hero', value: JSON.stringify(value) }, update: { value: JSON.stringify(value) } }); revalidatePath('/'); }
export async function createTaxonomy(data: FormData) { await requireAdmin(); const kind = text(data, 'kind'); const name = text(data, 'name'); if (!name) throw new Error('Name is required'); const slug = text(data, 'slug') || slugify(name); const description = text(data, 'description'); const typedUrl = text(data, 'imageUrl'); const uploadedImage = await uploadOptionalImage(data, 'image', `${name} ${kind} artwork`); const payload = { name, slug, description, status: status(data.get('status')), imageUrl: uploadedImage?.url ?? (typedUrl || null) }; if (kind === 'category') await prisma.category.create({ data: { ...payload, description: description || 'Category description' } }); else if (kind === 'style') await prisma.style.create({ data: { ...payload, description: description || 'Style description' } }); else await prisma.tag.create({ data: { name, slug } }); invalidate(); }
export async function deleteTaxonomy(data: FormData) { await requireAdmin(); const kind = text(data, 'kind'); const id = text(data, 'id'); if (kind === 'category') await prisma.category.delete({ where: { id } }); else if (kind === 'style') await prisma.style.delete({ where: { id } }); else await prisma.tag.delete({ where: { id } }); invalidate(); }
export async function savePrompt(data: FormData) { await requireAdmin(); const id = text(data, 'id'); const title = text(data, 'title'); const tags = text(data, 'tags').split(',').map((tag) => tag.trim()).filter(Boolean); const typedImageUrl = text(data, 'imageUrl'); const uploadedImage = await uploadOptionalImage(data, 'image', `${title || 'Prompt'} visual`); let exampleImageId: string | null = null;

  if (uploadedImage) {
    const imageRecord = await prisma.image.upsert({
      where: { publicId: uploadedImage.publicId },
      update: {
        url: uploadedImage.url,
        width: uploadedImage.width,
        height: uploadedImage.height,
        format: uploadedImage.format,
        altText: uploadedImage.altText,
      },
      create: {
        publicId: uploadedImage.publicId,
        url: uploadedImage.url,
        width: uploadedImage.width,
        height: uploadedImage.height,
        format: uploadedImage.format,
        altText: uploadedImage.altText,
      },
    });
    exampleImageId = imageRecord.id;
  } else if (typedImageUrl) {
    const imageRecord = await saveImageRecordFromUrl(typedImageUrl, `${title || 'Prompt'} visual`);
    exampleImageId = imageRecord?.id ?? null;
  }

  const categoryId = text(data, 'categoryId');
  const styleId = text(data, 'styleId');
  const body = {
    title,
    slug: text(data, 'slug') || slugify(title),
    description: text(data, 'description'),
    prompt: text(data, 'prompt'),
    gender: text(data, 'gender') || null,
    location: text(data, 'location') || null,
    occasion: text(data, 'occasion') || null,
    camera: text(data, 'camera') || null,
    lighting: text(data, 'lighting') || null,
    aspectRatio: text(data, 'aspectRatio') || null,
    seoTitle: text(data, 'seoTitle') || null,
    seoDescription: text(data, 'seoDescription') || null,
    status: status(data.get('status')),
    isFeatured: data.get('isFeatured') === 'on',
    isTrending: data.get('isTrending') === 'on',
  };

  if (!body.title || !body.description || !body.prompt || !categoryId || !styleId) throw new Error('Complete all required prompt fields');
  const tagLinks = await Promise.all(tags.map(async (name) => ({ tag: { connectOrCreate: { where: { slug: slugify(name) }, create: { name, slug: slugify(name) } } } })));

  const promptRelationData = {
    category: { connect: { id: categoryId } },
    style: { connect: { id: styleId } },
  };

  if (id) {
    const promptData: Prisma.PromptUpdateInput = {
      ...body,
      ...promptRelationData,
      tags: { deleteMany: {}, create: tagLinks },
    };
    if (exampleImageId) {
      promptData.exampleImage = { connect: { id: exampleImageId } };
    }
    await prisma.prompt.update({ where: { id }, data: promptData });
  } else {
    const promptData: Prisma.PromptCreateInput = {
      ...body,
      ...promptRelationData,
      tags: { create: tagLinks },
    };
    if (exampleImageId) {
      promptData.exampleImage = { connect: { id: exampleImageId } };
    }
    await prisma.prompt.create({ data: promptData });
  }

  invalidate();
}
export async function deletePrompt(data: FormData) { await requireAdmin(); await prisma.prompt.delete({ where: { id: text(data, 'id') } }); invalidate(); }
export async function updateUserRole(data: FormData) { await requireAdmin(); await prisma.user.update({ where: { id: text(data, 'id') }, data: { role: text(data, 'role') === 'ADMIN' ? Role.ADMIN : Role.USER } }); revalidatePath('/admin/users'); }
export async function reviewSubmission(data: FormData) { await requireAdmin(); await prisma.submission.update({ where: { id: text(data, 'id') }, data: { status: text(data, 'decision') === 'approve' ? 'APPROVED' : 'REJECTED', reviewNote: text(data, 'reviewNote') || null } }); revalidatePath('/admin/submissions'); }
export async function saveBlogPost(data: FormData) { await requireAdmin(); const id = text(data, 'id'), title = text(data, 'title'), categoryName = text(data, 'category'); if (!title || !text(data, 'excerpt') || !text(data, 'content')) throw new Error('Title, excerpt, and content are required.'); const category = categoryName ? await prisma.blogCategory.upsert({ where: { slug: slugify(categoryName) }, update: { name: categoryName }, create: { name: categoryName, slug: slugify(categoryName) } }) : null; const body = { title, slug: text(data, 'slug') || slugify(title), excerpt: text(data, 'excerpt'), content: text(data, 'content'), authorName: text(data, 'authorName') || 'OMRI Prompt Editorial', categoryId: category?.id ?? null, featuredImageUrl: text(data, 'featuredImageUrl') || null, seoTitle: text(data, 'seoTitle') || null, seoDescription: text(data, 'seoDescription') || null, status: status(data.get('status')), publishedAt: status(data.get('status')) === 'PUBLISHED' ? new Date() : null }; if (id) await prisma.blogPost.update({ where: { id }, data: body }); else await prisma.blogPost.create({ data: body }); invalidate(); }
export async function deleteBlogPost(data: FormData) { await requireAdmin(); await prisma.blogPost.delete({ where: { id: text(data, 'id') } }); invalidate(); }
export async function saveTool(data: FormData) { await requireAdmin(); const id = text(data, 'id'), name = text(data, 'name'); if (!name || !text(data, 'website')) throw new Error('Name and website are required.'); const body = { name, slug: text(data, 'slug') || slugify(name), description: text(data, 'description'), website: text(data, 'website'), affiliateUrl: text(data, 'affiliateUrl') || null, logoUrl: text(data, 'logoUrl') || null, features: text(data, 'features').split(',').map((x) => x.trim()).filter(Boolean), status: status(data.get('status')), isFeatured: data.get('isFeatured') === 'on' }; if (id) await prisma.aITool.update({ where: { id }, data: body }); else await prisma.aITool.create({ data: body }); invalidate(); }
export async function deleteTool(data: FormData) { await requireAdmin(); await prisma.aITool.delete({ where: { id: text(data, 'id') } }); invalidate(); }
export async function saveAffiliate(data: FormData) { await requireAdmin(); const id = text(data, 'id'), label = text(data, 'label'), url = text(data, 'url'); if (!label || !url) throw new Error('Label and URL are required.'); const body = { label, url, disclosure: text(data, 'disclosure') || 'This link may earn OMRI Prompt a commission.', status: status(data.get('status')) }; if (id) await prisma.affiliateLink.update({ where: { id }, data: body }); else await prisma.affiliateLink.create({ data: body }); revalidatePath('/admin/affiliate'); }
export async function deleteAffiliate(data: FormData) { await requireAdmin(); await prisma.affiliateLink.delete({ where: { id: text(data, 'id') } }); revalidatePath('/admin/affiliate'); }
export async function saveAd(data: FormData) { await requireAdmin(); const id = text(data, 'id'), name = text(data, 'name'), placement = text(data, 'placement'); if (!name || !placement || !text(data, 'configuration')) throw new Error('Name, placement, and configuration are required.'); const body = { name, placement, configuration: text(data, 'configuration'), pageTargeting: text(data, 'pageTargeting') || null, deviceTargeting: text(data, 'deviceTargeting') || null, status: status(data.get('status')) }; if (id) await prisma.adPlacement.update({ where: { id }, data: body }); else await prisma.adPlacement.create({ data: body }); revalidatePath('/admin/ads'); }
export async function deleteAd(data: FormData) { await requireAdmin(); await prisma.adPlacement.delete({ where: { id: text(data, 'id') } }); revalidatePath('/admin/ads'); }
export async function savePremiumProduct(data: FormData) { await requireAdmin(); const id = text(data, 'id'), name = text(data, 'name'); if (!name || Number(data.get('price')) < 0) throw new Error('Name and a valid price are required.'); const body = { name, slug: text(data, 'slug') || slugify(name), description: text(data, 'description'), price: Math.round(Number(data.get('price')) * 100), currency: text(data, 'currency') || 'USD', imageUrl: text(data, 'imageUrl') || null, status: status(data.get('status')) }; if (id) await prisma.premiumProduct.update({ where: { id }, data: body }); else await prisma.premiumProduct.create({ data: body }); revalidatePath('/admin/premium'); }
export async function deletePremiumProduct(data: FormData) { await requireAdmin(); await prisma.premiumProduct.delete({ where: { id: text(data, 'id') } }); revalidatePath('/admin/premium'); }
export async function saveSiteSettings(data: FormData) { await requireAdmin(); const entries = ['site.name', 'site.description', 'site.canonicalUrl', 'site.indexing']; await Promise.all(entries.map((key) => prisma.siteSetting.upsert({ where: { key }, create: { key, value: text(data, key) }, update: { value: text(data, key) } }))); invalidate(); }
export async function saveExternalImage(data: FormData) { await requireAdmin(); const url = text(data, 'url'); if (!/^https:\/\/.+/i.test(url)) throw new Error('Use a valid HTTPS image URL.'); const publicId = text(data, 'publicId') || `external-${slugify(url).slice(0, 80)}`; await prisma.image.create({ data: { publicId, url, width: Number(data.get('width')) || 0, height: Number(data.get('height')) || 0, format: text(data, 'format') || 'external', altText: text(data, 'altText') || 'OMRI Prompt image' } }); revalidatePath('/admin/images'); }
export async function deleteImage(data: FormData) { await requireAdmin(); const id = text(data, 'id'); const usage = await prisma.image.findUnique({ where: { id }, select: { _count: { select: { prompts: true, submissions: true } } } }); if (!usage || usage._count.prompts || usage._count.submissions) throw new Error('This image is currently in use and cannot be deleted.'); await prisma.image.delete({ where: { id } }); revalidatePath('/admin/images'); }

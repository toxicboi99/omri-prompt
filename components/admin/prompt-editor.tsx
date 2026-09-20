import { savePrompt } from '@/actions/admin';
import type { Prompt } from '@prisma/client';

export function PromptEditor({
  prompt,
  categories,
}: {
  prompt?: Prompt & { exampleImage?: { url: string | null } | null };
  categories: { id: string; name: string }[];
}) {
  return (
    <form action={savePrompt} className="form-card admin-form">
      {prompt && <input type="hidden" name="id" value={prompt.id} />}

      <label>
        Title
        <input name="title" required defaultValue={prompt?.title} />
      </label>

      <label>
        Slug
        <input name="slug" defaultValue={prompt?.slug} />
      </label>

      <label>
        Description
        <textarea name="description" required rows={3} defaultValue={prompt?.description} />
      </label>

      <label>
        Prompt
        <textarea name="prompt" required rows={8} defaultValue={prompt?.prompt} />
      </label>

      <div className="form-row">
        <label>
          Category
          <select name="categoryId" required defaultValue={prompt?.categoryId || ''}>
            <option value="" disabled>Select category</option>
            {categories.map((item) => (
              <option value={item.id} key={item.id}>{item.name}</option>
            ))}
          </select>
        </label>

      </div>

      <div className="form-row">
        <label>
          Camera
          <input name="camera" defaultValue={prompt?.camera ?? ''} />
        </label>
        <label>
          Lighting
          <input name="lighting" defaultValue={prompt?.lighting ?? ''} />
        </label>
      </div>

      <div className="form-row">
        <label>
          Aspect ratio
          <input name="aspectRatio" defaultValue={prompt?.aspectRatio ?? ''} />
        </label>
        <label>
          Tags
          <input name="tags" placeholder="portrait, studio" defaultValue="" />
        </label>
      </div>

      <label>
        Preview image upload
        <input type="file" name="image" accept="image/*" />
      </label>

      <label>
        Or image URL
        <input type="url" name="imageUrl" placeholder="https://..." defaultValue="" />
      </label>

      {prompt?.exampleImage?.url ? <small>Current image: {prompt.exampleImage.url}</small> : null}

      <label>
        Status
        <select name="status" defaultValue={prompt?.status ?? 'DRAFT'}>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </label>

      <label className="check">
        <input name="isFeatured" type="checkbox" defaultChecked={prompt?.isFeatured} />
        Featured
      </label>

      <label className="check">
        <input name="isTrending" type="checkbox" defaultChecked={prompt?.isTrending} />
        Trending
      </label>

      <label>
        SEO title
        <input name="seoTitle" defaultValue={prompt?.seoTitle ?? ''} />
      </label>

      <label>
        SEO description
        <textarea name="seoDescription" rows={3} defaultValue={prompt?.seoDescription ?? ''} />
      </label>

      <button className="primary-action">{prompt ? 'Update prompt' : 'Create prompt'}</button>
    </form>
  );
}

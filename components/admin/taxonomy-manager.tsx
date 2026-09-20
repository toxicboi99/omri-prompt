import { createTaxonomy, deleteTaxonomy, updateTaxonomy } from '@/actions/admin';

type Item = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status?: string;
  imageUrl?: string | null;
  _count?: { prompts: number };
};

export function TaxonomyManager({ kind, items }: { kind: 'category' | 'tag'; items: Item[] }) {
  const label = kind[0].toUpperCase() + kind.slice(1);
  const isCategory = kind !== 'tag';

  return (
    <div className="admin-manager">
      <form action={createTaxonomy} className="form-card admin-form">
        <input type="hidden" name="kind" value={kind} />
        <h2>Add {label}</h2>
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Slug <small>Optional — generated from the name.</small>
          <input name="slug" />
        </label>

        {isCategory && (
          <>
            <label>
              Description
              <textarea name="description" required rows={3} />
            </label>
            <label>
              Status
              <select name="status" defaultValue="PUBLISHED">
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
          </>
        )}

        <label>
          Image upload
          <input type="file" name="image" accept="image/*" />
        </label>
        <label>
          Or image URL
          <input type="url" name="imageUrl" placeholder="https://…" />
        </label>
        <button className="primary-action">Create {label}</button>
      </form>

      <div className="admin-table">
        {items.length ? (
          items.map((item) => (
            <div key={item.id}>
              <span>
                <b>{item.name}</b>
                <small>
                  /{item.slug}
                  {item._count ? ` · ${item._count.prompts} prompts` : ''}
                  {item.status ? ` · ${item.status}` : ''}
                </small>
                {item.imageUrl ? <small>Image attached</small> : null}
              </span>

              <details className="taxonomy-inline-editor">
                <summary>Edit</summary>
                <div className="taxonomy-inline-editor__panel">
                  <form action={updateTaxonomy} className="form-card admin-form taxonomy-inline-form">
                    <input type="hidden" name="kind" value={kind} />
                    <input type="hidden" name="id" value={item.id} />

                    <label>
                      Name
                      <input name="name" defaultValue={item.name} required />
                    </label>
                    <label>
                      Slug <small>Optional — generated from the name.</small>
                      <input name="slug" defaultValue={item.slug} />
                    </label>

                    {isCategory && (
                      <>
                        <label>
                          Description
                          <textarea name="description" defaultValue={item.description ?? ''} required rows={3} />
                        </label>
                        <label>
                          Status
                          <select name="status" defaultValue={item.status ?? 'PUBLISHED'}>
                            <option value="PUBLISHED">Published</option>
                            <option value="DRAFT">Draft</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>
                        </label>
                        <label>
                          Replace image
                          <input type="file" name="image" accept="image/*" />
                        </label>
                        <label>
                          Or image URL
                          <input type="url" name="imageUrl" defaultValue={item.imageUrl ?? ''} placeholder="https://…" />
                        </label>
                      </>
                    )}

                    <button className="primary-action" type="submit">
                      Save {label}
                    </button>
                  </form>
                </div>
              </details>

              <form action={deleteTaxonomy}>
                <input type="hidden" name="kind" value={kind} />
                <input type="hidden" name="id" value={item.id} />
                <button type="submit">Delete</button>
              </form>
            </div>
          ))
        ) : (
          <p>No {kind}s yet.</p>
        )}
      </div>
    </div>
  );
}

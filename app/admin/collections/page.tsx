import { photoSource } from "@/lib/storage";
import { Plus, Upload, MoreVertical } from "lucide-react";
import { ProtectedImage } from "@/components/shared/ProtectedImage";

export default async function AdminCollections() {
  const collections = await photoSource.getCollections();

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-fg">Collections</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-surface-85 border border-border-40 px-4 py-2 rounded-xl text-sm font-medium text-fg hover:bg-surface transition-colors">
            <Upload className="w-4 h-4" />
            Upload Photos
          </button>
          <button className="flex items-center gap-2 bg-accent text-accent-fg px-4 py-2 rounded-xl text-sm font-medium hover:scale-105 transition-transform">
            <Plus className="w-4 h-4" />
            New Collection
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border-40 bg-surface/50">
        <table className="w-full text-left text-sm text-muted">
          <thead className="bg-surface-85 text-xs uppercase text-fg">
            <tr>
              <th scope="col" className="px-6 py-4">Cover</th>
              <th scope="col" className="px-6 py-4">Title</th>
              <th scope="col" className="px-6 py-4">Photos</th>
              <th scope="col" className="px-6 py-4">Accent</th>
              <th scope="col" className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection) => (
              <tr key={collection.id} className="border-b border-border-40 last:border-0 hover:bg-surface/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="relative h-12 w-16 overflow-hidden rounded-md">
                    <ProtectedImage
                      src={collection.cover}
                      alt={collection.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-fg">
                  {collection.title}
                  <div className="text-xs text-muted/80 font-normal mt-1">{collection.slug}</div>
                </td>
                <td className="px-6 py-4">{collection.photos.length}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-border-40" 
                      style={{ backgroundColor: collection.accent }} 
                    />
                    {collection.accent}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 hover:bg-surface-85 rounded-lg transition-colors text-muted hover:text-fg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {collections.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted">
                  No collections found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

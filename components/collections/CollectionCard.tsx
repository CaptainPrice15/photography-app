import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/lib/storage/types";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group relative block overflow-hidden rounded-3xl border border-border bg-surface"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={collection.cover}
          alt={collection.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          placeholder="blur"
          blurDataURL={collection.photos[0]?.blurDataURL}
        />
        <div
          className="absolute inset-0 opacity-30 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-50"
          style={{
            background: `radial-gradient(circle at 30% 20%, ${collection.accent}, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-xl font-semibold text-white">{collection.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/75">
          {collection.description}
        </p>
        <p className="mt-2 text-xs font-medium text-white/60">
          {collection.photos.length} photos
        </p>
      </div>
    </Link>
  );
}

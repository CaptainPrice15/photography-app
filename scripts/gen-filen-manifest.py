#!/usr/bin/env python3
"""Generate filen-manifest.json for the Filen /photos folder structure.

The Next.js app (lib/storage/filenSource.ts) auto-discovers image files inside
each /photos/<collection>/ folder. This manifest only supplies collection
metadata (title / description / accent colors). Re-run this script whenever you
add new folders or rename collections, then upload the result to Filen as
/photos/manifest.json.

Usage:
    python scripts/gen-filen-manifest.py
    python scripts/gen-filen-manifest.py --root public/photos --out filen-manifest.json

Only the Python standard library is used.
"""

import argparse
import json
import os
from datetime import datetime, timezone

IMAGE_EXTENSIONS = {
    "jpg", "jpeg", "png", "webp", "avif", "gif",
    "heic", "heif", "tif", "tiff", "bmp", "svg",
}

# Known collection metadata. Add new collections here, or rely on the
# auto-generated fallback (title-cased folder name + neutral accent).
COLLECTION_META = {
    "aurora": {
        "title": "Aurora",
        "description": "Cool teals and greens — northern lights, oceans, and still nights.",
        "accent": "#2dd4bf",
        "accentSoft": "#5eead4",
    },
    "sunset": {
        "title": "Sunset",
        "description": "Warm ambers and roses — golden hour, deserts, and city dusk.",
        "accent": "#f59e0b",
        "accentSoft": "#fbbf24",
    },
    "mono": {
        "title": "Mono",
        "description": "Slate and silver — architecture, fog, and quiet minimalism.",
        "accent": "#64748b",
        "accentSoft": "#94a3b8",
    },
    "bloom": {
        "title": "Bloom",
        "description": "Soft pinks and violets — florals, portraits, and dreamscape.",
        "accent": "#ec4899",
        "accentSoft": "#f472b6",
    },
}

DEFAULT_ACCENT = "#64748b"
DEFAULT_ACCENT_SOFT = "#94a3b8"


def title_case(slug: str) -> str:
    return slug[0].upper() + slug[1:] if slug else slug


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Filen manifest.json")
    parser.add_argument(
        "--root",
        default="public/photos",
        help="Local mirror of the Filen /photos folder (default: public/photos)",
    )
    parser.add_argument(
        "--out",
        default="filen-manifest.json",
        help="Output manifest path (default: filen-manifest.json)",
    )
    args = parser.parse_args()

    root = args.root
    if not os.path.isdir(root):
        raise SystemExit(f"Folder not found: {root}")

    collections = []
    total_photos = 0

    for entry in sorted(os.listdir(root)):
        folder = os.path.join(root, entry)
        if not os.path.isdir(folder) or entry.startswith("."):
            continue

        files = [
            f
            for f in sorted(os.listdir(folder))
            if os.path.isfile(os.path.join(folder, f))
            and f.rsplit(".", 1)[-1].lower() in IMAGE_EXTENSIONS
        ]
        if not files:
            continue

        meta = COLLECTION_META.get(entry, {})
        title = meta.get("title", title_case(entry))
        description = meta.get("description")
        accent = meta.get("accent", DEFAULT_ACCENT)
        accent_soft = meta.get("accentSoft", DEFAULT_ACCENT_SOFT)

        photos = [
            {
                "id": f"{entry}-{i + 1}",
                "src": f"/api/photos/{entry}/{f}",
                "alt": f"{title} photograph {i + 1}",
                "title": f"{title} {i + 1}",
                "collectionId": entry,
                "featured": i < 2,
            }
            for i, f in enumerate(files)
        ]

        collections.append(
            {
                "id": entry,
                "slug": entry,
                "title": title,
                "description": description,
                "cover": f"/api/photos/{entry}/{files[0]}",
                "accent": accent,
                "accentSoft": accent_soft,
                "photos": photos,
            }
        )
        total_photos += len(photos)
        print(f"  * {entry}/ -> {len(files)} photo(s)")

    manifest = {
        "collections": collections,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }

    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2, ensure_ascii=False)
        fh.write("\n")

    print(
        f"\nWrote {args.out}: {len(collections)} collections, "
        f"{total_photos} photos."
    )
    print("Upload this file to Filen at /photos/manifest.json")


if __name__ == "__main__":
    main()

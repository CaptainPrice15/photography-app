"use client";

import Image, { type ImageProps } from "next/image";
import { forwardRef } from "react";

type ProtectedImageProps = ImageProps & {
  /** Disable the copy deterrents (e.g. when the image is itself a link/control). */
  unprotected?: boolean;
  /**
   * When the image sits inside a clickable link, set this so the pointer-down
   * guard doesn't swallow the navigation — only context menu and drag are
   * blocked in that case.
   */
  linkWrapped?: boolean;
};

/**
 * next/image wrapper that blocks casual copying of displayed photos:
 * context menu, drag-to-save, and long-press save are prevented. This is a
 * UI deterrent only — the real protection is the server-side watermark baked
 * into the bytes served by /api/photos (see lib/watermark.ts). Determined users
 * can still bypass this in DevTools; it only stops casual right-click/save.
 */
export const ProtectedImage = forwardRef<HTMLDivElement, ProtectedImageProps>(
  function ProtectedImage(
    { unprotected = false, linkWrapped = false, className, alt, ...props },
    ref
  ) {
    if (unprotected) {
      return <Image className={className} alt={alt || ""} {...props} />;
    }

    const guard = (e: React.SyntheticEvent) => {
      // Allow interaction with nested controls (buttons, links) inside overlays.
      const target = e.target as HTMLElement;
      if (target.closest("button, a, [data-allow-default]")) return;
      e.preventDefault();
    };

    return (
      <div
        ref={ref}
        className={className}
        draggable={false}
        onContextMenu={guard}
        onDragStart={guard}
        onPointerDown={linkWrapped ? undefined : guard}
        style={{ userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}
      >
        <Image
          alt={alt || ""}
          {...props}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>
    );
  }
);

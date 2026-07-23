// Custom image loader for Next.js Image Optimization
// Maps to our /api/photos/[...path] route with format/size negotiation

export default function loader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  const params = new URLSearchParams();
  
  // Determine size bucket based on requested width
  if (width <= 400) params.set("size", "thumb");
  else if (width <= 640) params.set("size", "w640");
  else if (width <= 900) params.set("size", "preview");
  else if (width <= 1200) params.set("size", "w1200");
  else if (width <= 1600) params.set("size", "lightbox");
  else params.set("size", "w1920");
  
  params.set("w", String(width));
  if (quality) params.set("q", String(quality));
  params.set("fm", "auto"); // Let server negotiate based on Accept header
  
  // src is like "/api/photos/slug/photo.jpg" - we need to keep the path
  const url = new URL(src, "http://localhost");
  url.search = params.toString();
  
  return url.pathname + url.search;
}
import Image from "next/image";
import { publicImageSource } from "@/src/lib/validations/image-schema";

export default function ContentImage({ src, title, fallback = "/images/mock-site-review.svg", className = "" }: { src?: string | null; title: string; fallback?: string; className?: string }) {
  return <Image src={publicImageSource(src, fallback)} alt={src ? title : `Illustrative placeholder for ${title}`} width={800} height={500} unoptimized className={`aspect-8/5 w-full rounded-lg bg-paper object-cover ${className}`} />;
}

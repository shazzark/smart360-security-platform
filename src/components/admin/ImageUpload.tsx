"use client";

import Image from "next/image";
import { useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { MAX_IMAGE_BYTES, uploadedImageSchema } from "@/src/lib/validations/image-schema";

export default function ImageUpload({ value, onChange, busy, onBusy, disabled }: { value: string; onChange: (url: string) => void; busy: boolean; onBusy: (busy: boolean) => void; disabled: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  async function upload(file: File | undefined) {
    if (!file) return;
    if (!file.size || file.size > MAX_IMAGE_BYTES || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) { toast.error("Choose a JPEG, PNG, or WebP image no larger than 5MB."); if (fileRef.current) fileRef.current.value = ""; return; }
    onBusy(true);
    const notification = toast.loading("Preparing your image…");
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const data: unknown = await response.json();
      const parsed = z.strictObject({ url: uploadedImageSchema }).safeParse(data);
      if (!response.ok || !parsed.success) {
        const failure = z.object({ error: z.string().max(300) }).safeParse(data);
        throw new Error(failure.success ? failure.data.error : "Image upload failed. Please try again.");
      }
      onChange(parsed.data.url);
      toast.success("Image uploaded", { id: notification, description: "Publish the content to feature it on the website." });
    } catch (error) { toast.error(error instanceof Error ? error.message : "Image upload failed.", { id: notification }); }
    finally { onBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  }
  return <div className="space-y-3"><label htmlFor="content-image" className="block text-sm font-medium">Featured image <span className="font-normal text-slate">(optional)</span></label><p id="content-image-help" className="text-xs leading-6 text-slate">JPEG, PNG, or WebP · Up to 5MB. Use an image you have permission to publish. Published images also appear in the gallery.</p>{/* The file travels through the upload endpoint, never the size-limited Server Action. */}<input ref={fileRef} id="content-image" type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || busy} aria-describedby="content-image-help" onChange={event => void upload(event.target.files?.[0])} className="block min-h-12 w-full min-w-0 rounded-md border border-slate/30 p-2 text-sm file:mr-4 file:rounded-sm file:border-0 file:bg-navy file:px-4 file:py-2 file:font-semibold file:text-white focus-visible:outline-2 focus-visible:outline-gold disabled:opacity-50" /><input type="hidden" name="imageUrl" value={value} />{busy ? <div role="status" className="h-32 animate-pulse rounded-md bg-paper p-5 text-sm text-slate motion-reduce:animate-none">Uploading and validating image…</div> : value ? <div className="overflow-hidden rounded-lg border border-navy/15"><Image src={value} alt="Uploaded content image preview" width={600} height={360} unoptimized className="max-h-64 w-full object-cover" /><div className="flex items-center justify-between gap-4 p-3"><span className="text-xs text-slate">Ready to publish</span><button type="button" disabled={disabled} onClick={() => onChange("")} className="min-h-10 px-3 text-sm font-semibold text-red-700 hover:underline">Remove image</button></div></div> : null}</div>;
}

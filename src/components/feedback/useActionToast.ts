"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type Feedback = { success: boolean; message?: string; errors?: Record<string, string[] | undefined> };
export function useActionToast(state: Feedback, successDescription?: string) {
  const previous = useRef<Feedback | null>(null);
  useEffect(() => {
    if (previous.current === state) return;
    previous.current = state;
    if (state.success) toast.success(state.message || "Saved successfully", { description: successDescription });
    else if (state.message || state.errors) toast.error(state.message || state.errors?._form?.join(" ") || "Please check the highlighted fields and try again.");
  }, [state, successDescription]);
}

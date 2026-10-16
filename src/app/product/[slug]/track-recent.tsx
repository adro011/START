"use client";

import { useEffect } from "react";
import { pushRecent } from "@/components/recently-viewed";

export default function TrackRecent({ slug }: { slug: string }) {
  useEffect(() => {
    pushRecent(slug);
  }, [slug]);
  return null;
}

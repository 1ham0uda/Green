"use client";

import { useEffect, useState } from "react";
import { subscribeToAnnouncement, type Announcement } from "../services/announcement-service";

export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAnnouncement((a) => {
      setAnnouncement(a);
      setReady(true);
    });
    return unsub;
  }, []);

  return { announcement, ready };
}

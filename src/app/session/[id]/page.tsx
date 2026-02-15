"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type SessionItem = {
  item_id: string;
  title: string;
  embed_url: string;
  thumb_url: string;
  duration_seconds: number;
};

type SessionData = {
  session_id: string;
  items: SessionItem[];
  current_index: number;
};

export default function Page() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sid");

  const [session, setSession] = useState<SessionData | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    if (!sessionId) return;

    async function loadSession() {
      const res = await fetch("/api/session/get?id=" + sessionId);
      const data = await res.json();

      if (data && data.ok) {
        setSession(data.session);
        if (typeof data.session.current_index === "number") {
          setCurrentIndex(data.session.current_index);
        } else {
          setCurrentIndex(0);
        }
      }
    }

    loadSession();
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Falta sid en la URL. Ejemplo: /session/id?sid=TU_SESSION_ID
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Cargando sesión...
      </div>
    );
  }

  const currentItem = session.items[currentIndex];

  if (!currentItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        La sesión no tiene items (o el índice está fuera de rango).
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col">
      {/* PLAYER */}
      <div className="w-full aspect-video bg-black">
        <iframe
          key={currentItem.embed_url}
          src={currentItem.embed_url + "?autoplay=1"}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>

      {/* TITLE */}
      <div className="p-4 text-lg font-semibold">{currentItem.title}</div>

      {/* TIMELINE */}
      <div className="flex overflow-x-auto gap-4 p-4">
        {session.items.map((item, index) => (
          <div
            key={item.item_id}
            onClick={() => setCurrentIndex(index)}
            className={
              "min-w-[200px] cursor-pointer transition " +
              (index === currentIndex ? "ring-2 ring-red-500" : "")
            }
          >
            <img
              src={item.thumb_url}
              alt={item.title}
              className="rounded-lg w-full"
            />
            <div className="text-sm mt-2 truncate">{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useSupabase() {
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
      
      if (!session) {
        router.push("/");
      }
    };
    
    getSession();
  }, [supabase, router]);

  return { supabase, session, loading };
}

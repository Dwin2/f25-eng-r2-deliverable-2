"use client";

import { useSupabase } from "./use-supabase";
import { useEffect, useState } from "react";
import type { Database } from "@/lib/schema";

type Species = Database["public"]["Tables"]["species"]["Row"];

export function useSpecies() {
  const { supabase, session, loading } = useSupabase();
  const [species, setSpecies] = useState<Species[]>([]);

  const fetchSpecies = async () => {
    if (!session) return;
    
    const { data: speciesData } = await supabase
      .from("species")
      .select("*")
      .order("id", { ascending: false });
    
    setSpecies(speciesData ?? []);
  };

  const addSpecies = async (speciesData: Omit<Species, "id" | "created_at" | "author">) => {
    if (!session) return { error: "No session" };
    
    const { error } = await supabase.from("species").insert([{
      ...speciesData,
      author: session.user.id
    }]);
    
    if (!error) {
      await fetchSpecies(); // Refresh the list
    }
    
    return { error };
  };

  const updateSpecies = async (id: number, speciesData: Partial<Species>) => {
    if (!session) return { error: "No session" };
    
    const { error } = await supabase
      .from("species")
      .update(speciesData)
      .eq("id", id);
    
    if (!error) {
      await fetchSpecies(); // Refresh the list
    }
    
    return { error };
  };

  const deleteSpecies = async (id: number) => {
    if (!session) return { error: "No session" };
    
    const { error } = await supabase
      .from("species")
      .delete()
      .eq("id", id);
    
    if (!error) {
      await fetchSpecies(); // Refresh the list
    }
    
    return { error };
  };

  useEffect(() => {
    if (session) {
      fetchSpecies();
    }
  }, [session]);

  return {
    species,
    loading,
    fetchSpecies,
    addSpecies,
    updateSpecies,
    deleteSpecies,
    userId: session?.user?.id
  };
}

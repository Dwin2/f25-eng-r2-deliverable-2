"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { useRouter } from "next/navigation";
import SpeciesCard from "./species-card";
import type { Database } from "@/lib/schema";

type Species = Database["public"]["Tables"]["species"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type SpeciesWithAuthor = Species & {
  author_profile: Profile | null;
};

export default function SpeciesSearchList() {
  const [species, setSpecies] = useState<SpeciesWithAuthor[]>([]);
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const fetchAllSpecies = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    const { 
        data: { session } 
    } = await supabase.auth.getSession();
    
    if (!session) return router.push("/");
    
    setUserId(session.user.id);
    const { data: speciesData } = await supabase
      .from("species")
      .select(`
        *,
        author_profile:profiles!species_author_fkey(*)
      `)
      .order("id", { ascending: false });
    setSpecies(speciesData ?? []);
  }, [router]);

  useEffect(() => {
    void fetchAllSpecies();
  }, [fetchAllSpecies]);

  const filteredSpecies = species.filter((s) => {
    const search = searchTerm.toLowerCase();
    /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
    return s.scientific_name.toLowerCase().includes(search) ||
           s.common_name?.toLowerCase().includes(search) ||
           s.description?.toLowerCase().includes(search) ||
           s.kingdom.toLowerCase().includes(search);
    /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */
  });
  return (
    <>
    <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search species..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

    <div className="flex flex-wrap justify-center">
        {filteredSpecies.map((species) => (
          <SpeciesCard 
            key={species.id} 
            species={species} 
            userId={userId} 
            authorProfile={species.author_profile} 
          />
        ))}
      </div>
      </>
  );
}

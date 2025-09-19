"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [sortBy, setSortBy] = useState("latest");
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
  }).sort((a, b) => {
    if (sortBy === "alphabetical") {
      return (a.common_name ?? a.scientific_name).localeCompare(b.common_name ?? b.scientific_name);
    }
    return b.id - a.id; 
  });
  return (
    <>
    <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search species..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="alphabetical">A-Z</SelectItem>
          </SelectContent>
        </Select>
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

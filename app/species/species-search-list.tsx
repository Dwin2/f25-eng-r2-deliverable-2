"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SpeciesCard from "./species-card";
import type { Database } from "@/lib/schema";

type Species = Database["public"]["Tables"]["species"]["Row"];

export default function SpeciesSearchList() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const fetchAllSpecies = async () => {
    const supabase = createBrowserSupabaseClient();
    const { 
        data: { session } 
    } = await supabase.auth.getSession();
    
    if (!session) return router.push("/");
    
    setUserId(session.user.id);
    const { data: speciesData } = await supabase.from("species").select("*").order("id", { ascending: false });
    setSpecies(speciesData ?? []);
  };

  useEffect(() => {
    void fetchAllSpecies();
  }, [router]);

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
        {filteredSpecies.map((species) => <SpeciesCard key={species.id} species={species} userId={userId} />)}
      </div>
      </>
  );
}

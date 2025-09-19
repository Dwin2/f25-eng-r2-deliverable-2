"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import type { Database } from "@/lib/schema";

type Species = Database["public"]["Tables"]["species"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function ViewSpeciesDialog({species, authorProfile }: { species: Species; authorProfile: Profile | null; }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-3 w-full">Learn More</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{species.scientific_name}</DialogTitle>
          <DialogDescription>Detailed species information</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><b>Common Name:</b> {species.common_name ?? "—"}</div>
          <div><b>Kingdom:</b> {species.kingdom}</div>
          <div><b>Total Population:</b> {species.total_population?.toLocaleString() ?? "—"}</div>
          <div><b>Description:</b> {species.description ?? "—"}</div>
          
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-2">
              <b>Author:</b> {authorProfile?.display_name ?? "Unknown"}
            </div>
            {authorProfile?.email && (
              <a 
                href={`mailto:${authorProfile.email}?subject=${species.scientific_name}`}
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                Contact Author
              </a>
            )}
          </div>
        </div>

        <DialogClose asChild>
          <Button variant="secondary" className="mt-4 w-full">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
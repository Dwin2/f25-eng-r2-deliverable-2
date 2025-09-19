import { searchWikipediaSpecies } from "@/lib/services/wikipedia-api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const speciesName = searchParams.get("species");

  if (!speciesName) {
    return NextResponse.json({ error: "Species name is required" }, { status: 400 });
  }

  try {
    const speciesData = await searchWikipediaSpecies(speciesName);
    return NextResponse.json(speciesData);
  } catch (error) {
    console.error("Wikipedia API error:", error);
    return NextResponse.json({ error: "Failed to fetch Wikipedia data" }, { status: 500 });
  }
}

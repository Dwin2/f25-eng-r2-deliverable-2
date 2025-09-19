interface SpeciesData {
  scientificName?: string;
  commonName?: string;
  description?: string;
  totalPopulation?: number;
}

export async function searchWikipediaSpecies(speciesName: string): Promise<SpeciesData | null> {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(speciesName)}&srlimit=1&prop=extracts&exintro=true&explaintext=true&origin=*`;
    const response = await fetch(url);
    const data = await response.json() as { query?: { search?: { pageid: number }[] } };
    const search = data.query?.search?.[0];
    if (!search) return null;
    
    const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&pageids=${search.pageid}&exintro=true&explaintext=true&origin=*`;
    const pageResponse = await fetch(pageUrl);
    const pageData = await pageResponse.json() as { query?: { pages?: Record<string, { extract?: string }> } };
    const page = Object.values(pageData.query?.pages ?? {})[0];
    const text = page?.extract;
    if (!text) return null;
    
    const cleanText = text.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim();
    
    const result: SpeciesData = {
      description: cleanText.substring(0, 500)
    };
    
    const scientificMatch = cleanText.match(/\(([A-Z][a-z]+ [a-z]+)\)/);
    if (scientificMatch?.[1]) {
      result.scientificName = scientificMatch[1];
    }
    
    const commonMatch = cleanText.match(/^([A-Z][a-z]+(?:\s+[a-z]+)*)/);
    if (commonMatch && commonMatch[1] !== result.scientificName) {
      result.commonName = commonMatch[1];
    }
    
    const popMatch = cleanText.match(/population[:\s]*([0-9,]+)/i);
    if (popMatch?.[1]) {
      const pop = parseInt(popMatch[1].replace(/,/g, ''));
      if (pop > 0) result.totalPopulation = pop;
    }
    
    return result;
} 

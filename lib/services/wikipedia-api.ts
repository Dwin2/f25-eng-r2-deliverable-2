interface WikipediaSearchResult {
  pageid: number;
  title: string;
}

interface WikipediaPage {
  extract: string;
}

export async function searchWikipediaSpecies(speciesName: string): Promise<string | null> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(speciesName)}&srlimit=1&prop=extracts&exintro=true&explaintext=true&origin=*`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json() as { query?: { search?: WikipediaSearchResult[] } };
    const search = data.query?.search?.[0];
    if (!search) return null;
    
    const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&pageids=${search.pageid}&exintro=true&explaintext=true&origin=*`;
    const pageResponse = await fetch(pageUrl);
    if (!pageResponse.ok) return null;
    
    const pageData = await pageResponse.json() as { query?: { pages?: Record<string, WikipediaPage> } };
    const page = Object.values(pageData.query?.pages ?? {})[0];
    const extract = page?.extract;
    
    if (!extract) return null;
    
    return extract.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').substring(0, 500).trim();
  } catch {
    return null;
  }
}

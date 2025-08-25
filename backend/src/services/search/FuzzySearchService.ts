import { SearchQuery, SearchResult, SearchOptions } from '@/types/search';

export interface FuzzySearchOptions {
  maxDistance: number;
  minScore: number;
  usePhonetic: boolean;
  useSynonyms: boolean;
}

export interface FuzzyMatch {
  text: string;
  distance: number;
  score: number;
  phonetic?: string;
}

export class FuzzySearchService {
  private readonly options: FuzzySearchOptions;
  private readonly synonyms: Map<string, string[]> = new Map();
  private readonly phoneticCache: Map<string, string> = new Map();

  constructor(options: Partial<FuzzySearchOptions> = {}) {
    this.options = {
      maxDistance: 2,
      minScore: 0.7,
      usePhonetic: true,
      useSynonyms: true,
      ...options
    };
    
    this.initializeSynonyms();
  }

  /**
   * Perform fuzzy search with typo tolerance
   */
  async fuzzySearch(
    query: SearchQuery,
    options: SearchOptions,
    baseResults: SearchResult
  ): Promise<SearchResult> {
    if (!query.text || query.text.length < 2) {
      return baseResults;
    }

    const fuzzyResults = await this.applyFuzzyMatching(baseResults, query.text);
    return this.rankFuzzyResults(fuzzyResults, query.text);
  }

  /**
   * Apply fuzzy matching to search results
   */
  private async applyFuzzyMatching(results: SearchResult, queryText: string): Promise<SearchResult> {
    const fuzzyData = results.data.map(item => ({
      ...item,
      fuzzyScore: this.calculateFuzzyScore(item, queryText)
    }));

    // Filter by minimum score
    const filteredData = fuzzyData.filter(item => item.fuzzyScore >= this.options.minScore);

    return {
      ...results,
      data: filteredData,
      pagination: {
        ...results.pagination,
        total: filteredData.length
      }
    };
  }

  /**
   * Calculate fuzzy score for an item
   */
  private calculateFuzzyScore(item: any, queryText: string): number {
    let maxScore = 0;
    const queryLower = queryText.toLowerCase();

    // Check all string fields
    Object.entries(item).forEach(([key, value]) => {
      if (typeof value === 'string' && value) {
        const fieldScore = this.calculateFieldFuzzyScore(value, queryLower);
        maxScore = Math.max(maxScore, fieldScore);
      }
    });

    return maxScore;
  }

  /**
   * Calculate fuzzy score for a specific field
   */
  private calculateFieldFuzzyScore(fieldValue: string, queryText: string): number {
    const fieldLower = fieldValue.toLowerCase();
    
    // Exact match gets highest score
    if (fieldLower === queryText) {
      return 1.0;
    }

    // Contains match
    if (fieldLower.includes(queryText)) {
      return 0.9;
    }

    // Levenshtein distance
    const distance = this.levenshteinDistance(fieldLower, queryText);
    const maxLength = Math.max(fieldLower.length, queryText.length);
    const distanceScore = 1 - (distance / maxLength);

    // Phonetic matching
    let phoneticScore = 0;
    if (this.options.usePhonetic) {
      const fieldPhonetic = this.getPhoneticCode(fieldLower);
      const queryPhonetic = this.getPhoneticCode(queryText);
      phoneticScore = fieldPhonetic === queryPhonetic ? 0.8 : 0;
    }

    // Synonym matching
    let synonymScore = 0;
    if (this.options.useSynonyms) {
      synonymScore = this.calculateSynonymScore(fieldLower, queryText);
    }

    return Math.max(distanceScore, phoneticScore, synonymScore);
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Get phonetic code using Soundex algorithm
   */
  private getPhoneticCode(text: string): string {
    if (this.phoneticCache.has(text)) {
      return this.phoneticCache.get(text)!;
    }

    const soundex = this.soundex(text);
    this.phoneticCache.set(text, soundex);
    return soundex;
  }

  /**
   * Soundex algorithm implementation
   */
  private soundex(text: string): string {
    const soundexMap: { [key: string]: string } = {
      'b': '1', 'f': '1', 'p': '1', 'v': '1',
      'c': '2', 'g': '2', 'j': '2', 'k': '2', 'q': '2', 's': '2', 'x': '2', 'z': '2',
      'd': '3', 't': '3',
      'l': '4',
      'm': '5', 'n': '5',
      'r': '6'
    };

    if (!text) return '';

    const firstChar = text[0].toUpperCase();
    let code = firstChar;
    let prevCode = soundexMap[text[0].toLowerCase()] || '';

    for (let i = 1; i < text.length && code.length < 4; i++) {
      const char = text[i].toLowerCase();
      const currentCode = soundexMap[char];

      if (currentCode && currentCode !== prevCode) {
        code += currentCode;
      }
      prevCode = currentCode;
    }

    return code.padEnd(4, '0');
  }

  /**
   * Calculate synonym score
   */
  private calculateSynonymScore(fieldValue: string, queryText: string): number {
    const fieldWords = fieldValue.split(/\s+/);
    const queryWords = queryText.split(/\s+/);

    let maxScore = 0;

    for (const fieldWord of fieldWords) {
      for (const queryWord of queryWords) {
        const synonyms = this.synonyms.get(queryWord.toLowerCase()) || [];
        if (synonyms.includes(fieldWord.toLowerCase())) {
          maxScore = Math.max(maxScore, 0.7);
        }
      }
    }

    return maxScore;
  }

  /**
   * Rank fuzzy results by relevance
   */
  private rankFuzzyResults(results: SearchResult, queryText: string): SearchResult {
    const rankedData = results.data.sort((a, b) => {
      const scoreA = a.fuzzyScore || 0;
      const scoreB = b.fuzzyScore || 0;
      return scoreB - scoreA;
    });

    return {
      ...results,
      data: rankedData
    };
  }

  /**
   * Get search suggestions with fuzzy matching
   */
  async getFuzzySuggestions(query: string, suggestions: string[]): Promise<string[]> {
    if (!query || query.length < 2) {
      return suggestions;
    }

    const fuzzySuggestions = suggestions.map(suggestion => ({
      text: suggestion,
      score: this.calculateFieldFuzzyScore(suggestion, query.toLowerCase())
    }));

    return fuzzySuggestions
      .filter(item => item.score >= this.options.minScore)
      .sort((a, b) => b.score - a.score)
      .map(item => item.text)
      .slice(0, 10);
  }

  /**
   * Initialize synonym dictionary
   */
  private initializeSynonyms(): void {
    // Common business synonyms
    this.synonyms.set('company', ['business', 'corporation', 'enterprise', 'firm']);
    this.synonyms.set('contact', ['person', 'individual', 'client', 'customer']);
    this.synonyms.set('deal', ['opportunity', 'sale', 'transaction', 'proposal']);
    this.synonyms.set('lead', ['prospect', 'potential', 'candidate']);
    this.synonyms.set('task', ['action', 'activity', 'assignment', 'job']);
    this.synonyms.set('manager', ['supervisor', 'director', 'lead', 'head']);
    this.synonyms.set('sales', ['revenue', 'income', 'earnings']);
    this.synonyms.set('customer', ['client', 'buyer', 'purchaser']);
    this.synonyms.set('email', ['mail', 'correspondence', 'message']);
    this.synonyms.set('phone', ['telephone', 'call', 'contact']);
  }

  /**
   * Add custom synonyms
   */
  addSynonyms(word: string, synonyms: string[]): void {
    const existing = this.synonyms.get(word.toLowerCase()) || [];
    this.synonyms.set(word.toLowerCase(), [...existing, ...synonyms]);
  }

  /**
   * Get fuzzy search statistics
   */
  getStats(): {
    phoneticCacheSize: number;
    synonymCount: number;
    options: FuzzySearchOptions;
  } {
    return {
      phoneticCacheSize: this.phoneticCache.size,
      synonymCount: this.synonyms.size,
      options: this.options
    };
  }

  /**
   * Clear phonetic cache
   */
  clearPhoneticCache(): void {
    this.phoneticCache.clear();
  }
}

export const fuzzySearchService = new FuzzySearchService();

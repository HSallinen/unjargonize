type Wordlist = Array<string>;

interface Definition {
  definition: string;
  synonyms: Wordlist;
  antonyms: Wordlist;
  example?: string;
}

interface Meaning {
  partOfSpeech: string;
  definitions: Array<Definition>;
  synonyms: Wordlist;
  antonyms: Wordlist;
}

interface WordDefinition {
  word: string;
  meanings: Array<Meaning>;
}

async function apiRunkku(word: string): Promise<Array<WordDefinition>> {
  const response = await fetch(
    'http://api.dictionaryapi.dev/api/v2/entries/en/' + word,
  );

  const data: Array<WordDefinition> = await response.json();
  if (response.ok) {
    const wordDefinitions: Array<WordDefinition> = data.map(definition => {
      return {
        word: definition.word,
        meanings: definition.meanings,
      };
    });

    return wordDefinitions;
  } else {
    // handle the graphql errors
    const error = new Error(
      'tuuba',
      //errors?.map((e: { message: string }) => e.message).join('\n') ?? 'unknown',
    );
    return Promise.reject(error);
  }
}

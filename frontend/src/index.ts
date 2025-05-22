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

const apiURL = 'http://menta.fi/';

function isCommonWord(word: string) {
  return false;
}

async function getRareWords(words: Array<string>) {
  const unCommonWords: { [key: string]: null } = {};

  for (const word of words) {
    if (isCommonWord(word)) {
      continue;
    }
    unCommonWords[word.toLowerCase()] = null;
  }

  //const rareWords = await (await fetch()).json()
  const rareWords = unCommonWords;
  return rareWords;
}

async function main() {
  const text = document.body.innerText;
  const words = text.split(/[\W\d_]+/);

  const rareWords = await getRareWords(words);
  console.log(rareWords);
}

main();

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

async function backstageRunkku(words: Wordlist): Promise<Wordlist> {
  const response = await fetch(apiURL, {
    body: JSON.stringify(words) + '\n',
  });

  if (response.ok) {
    const data: Wordlist = await response.json();
    return data;
  } else {
    const error = new Error('tuuba');
    return Promise.reject(error);
  }
}

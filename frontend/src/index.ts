type Wordlist = { [key: string]: null };

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

async function getRareWords(
  words: Array<string>,
): Promise<{ [key: string]: null }> {
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

function addWord(
  word: string,
  words: { [key: string]: null },
  htmlTag: boolean,
  newHtml: string,
): string {
  if (!htmlTag && word.toLowerCase() in words) {
    newHtml += `<span class="unjargonize-jargon id="unjargonize-jargon-${word}>${word}</span>`;
  } else {
    newHtml += word;
  }
  return newHtml;
}
function replace(words: { [key: string]: null }) {
  const html: string = document.body.innerHTML;
  let htmlTag = false;
  let newHtml = '';
  let word = '';
  for (const char of html.split('')) {
    if (char.match(/[\W\d_]+/)) {
      newHtml = addWord(word, words, htmlTag, newHtml);
      newHtml += char;
      word = '';
      if (char === '<') {
        htmlTag = true;
      }
      if (char === '>') {
        htmlTag = false;
      }
    } else {
      word += char;
    }
  }
  newHtml = addWord(word, words, htmlTag, newHtml);
  document.body.innerHTML = newHtml;
}

async function main() {
  document.body.appendChild(generatePopup('sex'));
  const text = document.body.innerText;
  const words = text.split(/[\W\d_]+/);

  const rareWords = await getRareWords(words);
  replace(rareWords);
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
    const data: Array<string> = await response.json();
    const out: Wordlist = {};
    data.forEach(word => (out[word] = null));
    return out;
  } else {
    const error = new Error('tuuba');
    return Promise.reject(error);
  }
}

function generatePopup(word: string): HTMLDivElement {
  const popup: HTMLIFrameElement = document.createElement('iframe');
  popup.classList.add('jargon-popup');
  popup.src = 'https://en.wiktionary.org/wiki/' + word;
  return popup;
  /*const definitions = await apiRunkku(word);
  const popup: HTMLDivElement = document.createElement('div');
  popup.classList.add('jargon-popup');

  for (const key in definitions) {
    const definition = definitions[key];
    const wordDefinitionDiv: HTMLDivElement = document.createElement('div');
    wordDefinitionDiv.classList.add('jargon-worddefinition');

    //Add title
    const title = document.createElement('h2');
    title.classList.add('jargon-title');
    title.innerText = definition.word;
    wordDefinitionDiv.appendChild(title);

    for (const key in definition.meanings) {
      const meaning = definition.meanings[key];
      const meaningDiv: HTMLDivElement = document.createElement('div');
      meaningDiv.classList.add('jargon-meaning');

      // Add part of speech
      const partOfSpeech = document.createElement('h3');
      partOfSpeech.classList.add('jargon-word-type');
      partOfSpeech.innerText = meaning.partOfSpeech;
      meaningDiv.appendChild(partOfSpeech);

      // Definitions
      const definitionTitle = document.createElement('h3');
      definitionTitle.classList.add('jargon-definition-title');
      definitionTitle.innerText = 'Definitions';
      meaningDiv.appendChild(definitionTitle);
      for (const key in meaning.definitions) {
        const definition = meaning.definitions[key];
        const definitionDiv: HTMLDivElement = document.createElement('div');
        definitionDiv.classList.add('jargon-definition');

        const definitionText = document.createElement('p');
        definitionText.innerText = definition.definition;
        definitionText.classList.add('jargon-definition-text');
        definitionDiv.appendChild(definitionText);

        // Add example if exists
        if (definition.example !== undefined) {
          const exampleText = document.createElement('p');
          exampleText.classList.add('jargon-example-text');
          exampleText.textContent = definition.example;
          definitionDiv.appendChild(exampleText);
        }

        meaningDiv.appendChild(definitionDiv);
      }

      // Synonyms
      const synonymTitle = document.createElement('h3');
      definitionTitle.classList.add('jargon-definition-title');
      definitionTitle.innerText = 'Definitions';
      meaningDiv.appendChild(definitionTitle);
      // Antonyms
      const antonymTitle = document.createElement('h3');
      definitionTitle.classList.add('jargon-definition-title');
      definitionTitle.innerText = 'Definitions';
      meaningDiv.appendChild(definitionTitle);

      wordDefinitionDiv.appendChild(meaningDiv);
    }

    popup.appendChild(wordDefinitionDiv);
  }

  return popup;*/
}

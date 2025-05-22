const apiURL = "menta.fi"

function isCommonWord (word: string) {
  return false
}

async function getRareWords (words: Array<string>) {
  const unCommonWords: {[key: string]: null} = {};

    for (const word of words) {
      if (isCommonWord(word)) {
        continue;
      }
      unCommonWords[word.toLowerCase()] = null
    }
  
  //const rareWords = await (await fetch()).json()
  const rareWords = unCommonWords
  return rareWords
}

async function main () {
  const text = document.body.innerText;
  const words = text.split(/[\W\d_]+/)
  
  const rareWords = await getRareWords(words);
  console.log(rareWords)
}

main();

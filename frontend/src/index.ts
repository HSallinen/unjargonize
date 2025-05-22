const apiURL = "menta.fi"

function isCommonWord (word: string) {
  return false
}

async function getRareWords (words: Array<string>): Promise<{[key: string]: null}> {
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

function addWord(word: string, words: {[key: string]: null}, htmlTag: boolean, newHtml:string): string {
  if (!htmlTag && word.toLowerCase() in words) {
    newHtml += `<span class="unjargonize-jargon id="unjargonize-jargon-${word}>${word}</span>`
  }
  else {
    newHtml += word
  }
  return newHtml
}
function replace (words: {[key: string]: null}) {
  let html: string = document.body.innerHTML
  let htmlTag = false
  let newHtml = ""
  let word = "" 
  for (const char of html.split("")) {
    if (char.match(/[\W\d_]+/)) {
      newHtml = addWord(word, words, htmlTag, newHtml)
      newHtml += char
      word = ""
      if (char === "<") {
        htmlTag = true
      }
      if (char === ">") {
        htmlTag = false
      }
    }
    else {
      word += char
    }
  }
  newHtml = addWord(word, words, htmlTag, newHtml)
  document.body.innerHTML = newHtml
  
}

async function main () {
  const text = document.body.innerText;
  const words = text.split(/[\W\d_]+/)
  
  const rareWords = await getRareWords(words);
  replace(rareWords)
}

main();

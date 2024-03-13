let word = word_list[0].toUpperCase()
let currentInputPos = 0
let currentWordTrial = 0
let inputsRows = []
let inputGroup = document.querySelectorAll(".input-group")
let input = ''
let gameStart = false
const letterBtns = document.querySelectorAll("button.letter")
const gameStartbtn = document.getElementById("game-start-btn")
const gameLevelsContainer = document.getElementById("levels-container")
let levelNum = localStorage.getItem("currentLevel") || '1'
let levelData = {wordTrials: []}
let theme = localStorage.getItem("theme") || "light"
const prefersDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
const lossMsg = document.getElementById("loss-msg")
lossMsg.querySelector("button").addEventListener("click", ()=>lossMsg.classList.remove("showMsg"))
const winMsg = document.getElementById("win-msg")
winMsg.querySelector("button").addEventListener("click", ()=>winMsg.classList.remove("showMsg"))
const themeMenu = document.getElementById("theme-list")

function setlightTheme() {
  theme = "light"
  document.body.classList.remove("dark-theme")
  localStorage.setItem("theme",  theme)
  themeMenu.classList.remove("show")
}

function setDarkTheme() {
  theme = "dark"
  document.body.classList.add("dark-theme")
  localStorage.setItem("theme",  theme)
  themeMenu.classList.remove("show")
}

if (prefersDarkTheme.matches || theme !== "light") {
  setDarkTheme()
}

function toggleTheme() {
  if (!theme || theme === "light") {
    setDarkTheme()
  }else {
    setlightTheme()
  }
}

const themeToggleBtn = document.getElementById("theme-dropdown-toggle")
themeToggleBtn.addEventListener("click", ()=>{
  themeMenu.classList.toggle("show")
})

document.getElementById("light-theme-btn").addEventListener("click", setlightTheme)
document.getElementById("dark-theme-btn").addEventListener("click", setDarkTheme)
prefersDarkTheme.addEventListener("change", (event) => {
  event.target.Matches ? setDarkTheme() : setlightTheme()
})

for (i=0; i<inputGroup.length; i++) {
  inputsRows.push(inputGroup[i].children)
}

let clearBtn = document.getElementById("clearBtn")
clearBtn.addEventListener("click", ()=>{ // Clears all data related to a level
  refreshGameData(true)
  localStorage.removeItem(levelNum)
  levelData = {wordTrials: []}
  clearBtn.blur() // To prevent triggering the button by mistake when Enter key is pressed
})

function generatelevelBtns() { 
  let levelsList = []
  for (let i=0; i<410; i++) {
    let button = document.createElement('button')
    button.addEventListener("click", (event) => {
      levelNum = event.target.textContent
      loadLevel(levelNum)
      event.target.blur() // To prevent triggering the button by mistake when Enter key is pressed
    })
    button.textContent = (i+1).toString()
    levelsList.push(button)
  }
  gameLevelsContainer.append(...levelsList)
}

generatelevelBtns()
levelsToggle.addEventListener("click", (event)=>{
  event.stopPropagation()
  gameLevelsContainer.classList.toggle("show")
})
document.addEventListener("click", ()=>gameLevelsContainer.classList.remove("show"))

function loadLevel() {
  levelsToggle.textContent = "Level " + levelNum + " ▼"
  levelData = JSON.parse(localStorage.getItem(levelNum))
  refreshGameData(true)
  if (levelData) {
    levelData.wordTrials.forEach((wordData) => {
      inputGroup[currentWordTrial].classList.remove("animate-child")
      checkIfWordCorrect(wordData)
    })
  }else {
    levelData = {wordTrials: []}
  }
  localStorage.setItem('currentLevel', levelNum)
}

gameStartbtn.addEventListener("click", () => {
  loadLevel()
  document.body.classList.remove("not-playing")
})

function refreshGameData(newLevel) {
  input = ''
  currentInputPos = 0
  if (newLevel) {
    word = word_list[parseInt(levelNum)-1].toUpperCase()
    gameStart = true
    currentWordTrial = 0
    letterBtns.forEach(button => button.classList = "letter")
    inputGroup.forEach((element) => element.classList.add("animate-child"));
    inputsRows.forEach((children)=>{
      for (let i=0; i<children.length; i++) {
        children[i].value = ''
        children[i].classList = ''
      }
    })
  }
}

function gameOver(gameWon) {
  if (gameWon) {
    winMsg.classList.add("showMsg")
  }else {
    lossMsg.querySelector('p').textContent = "word: " + word
    lossMsg.classList.add("showMsg")
  }
  gameStart = false;
}

function evaluateInput() {
  let wordIsCorrect = checkIfWordCorrect(input)
  levelData.wordTrials.push(input)
  if (wordIsCorrect) {
    gameOver(true)
  }else {
    if (currentWordTrial > 5) gameOver(false);
    refreshGameData();
  }
  localStorage.setItem(levelNum.toString(), JSON.stringify(levelData))
}

function checkIfWordCorrect(wordTrial) {
  let wordList = [...word] // makes it easier to mutate and work with

  // Each string corresponds to the class of the input element at that same pos in a row. 
  let charsClassList = ['deep-blue', 'deep-blue', 'deep-blue', 'deep-blue', 'deep-blue']
  for (let i=0; i< 5; i++) {
    if (wordTrial[i] === wordList[i]) {
      charsClassList[i] = 'green'
      wordList[i] = ''
    }
  }
  for (let i=0; i<5; i++) {
    let index = wordList.indexOf(wordTrial[i])
    if (index > -1 && charsClassList[i] !== "green") { // Not matched letter was found in wrong position
      charsClassList[i] = "pale-orange"
      wordList[index] = ''
    }
  }
  let wordIsCorrect = charsClassList.every((classStr)=>classStr === "green")
  updateDisplay(wordTrial, charsClassList)
  return wordIsCorrect
}

function updateDisplay(inputString, charsClassList) {
  for (let i=0; i<5; i++) {
    inputBox = inputsRows[currentWordTrial].item(i)
    inputBox.classList = charsClassList[i]
    inputBox.value = inputString[i] // incase a level with previously saved data is loaded.
    for (let j=0; j<26; j++){
      let button = letterBtns[j];
      if (inputBox.value === button.textContent) {
        if (button.classList.contains('green')) break; // Green color should always override other colors, followed by orange
        if (button.classList.contains('pale-orange') && charsClassList[i] !== 'green') break;
        button.classList = "letter " + charsClassList[i];
        break;
      }
    }
  }
  currentWordTrial++
}

function addLettertoInput(letter) {
  if (("ABCDEFGHIJKLMNOPQRSTUVWXYZ").includes(letter) && currentInputPos < 5) {
    inputsRows[currentWordTrial][currentInputPos].value = letter;
    currentInputPos++
    input += letter;
  }
}

// Add Event listeners to the onscreen keys/butttons for letter inputs
letterBtns.forEach((button) => {
  button.addEventListener("click", (event)=>{
    if (!gameStart) return;
    let letter = event.target.textContent.toUpperCase()
    if (!gameStart) return
    addLettertoInput(letter)
  })
})

document.addEventListener("keyup", (event)=>{
  if (!gameStart) return;
  if (event.key === "Enter" && currentInputPos === 5) evaluateInput();
  else if (event.key === "Backspace"  && currentInputPos > 0) {
    inputsRows[currentWordTrial][currentInputPos - 1].value = '';
    currentInputPos--
    input = input.slice(0, currentInputPos)
  }else {
    addLettertoInput(event.key.toUpperCase())
  }
});

// Add Event listeners to the onscreen Enter and Backspace keys/butttons
document.querySelectorAll("button.special").forEach((button) => {
  button.addEventListener("click", (event)=>{
    if (!gameStart) return;
    if (event.target.textContent === "ENTER") {
      currentInputPos === 5 && evaluateInput(input);
    }else if ( currentInputPos > 0) {
      inputsRows[currentWordTrial][currentInputPos - 1].value = '';
      currentInputPos--
      input = input.slice(0, currentInputPos)
    }
  })
})

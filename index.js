let word = word_list[0].toUpperCase()
let currentInputPos = 0
let currentWordTrial = 0
let inputsRows = []
let validity = ['deep-blue', 'deep-blue', 'deep-blue', 'deep-blue', 'deep-blue']
let inputGroup = document.querySelectorAll(".input-group")
let input = ''
let gameStart = false
const letterBtns = document.querySelectorAll("button.letter")
const gameStartbtn = document.getElementById("game-start-btn")
const gameLevelsContainer = document.getElementById("levels-container")
let levelNum = localStorage.getItem("currentLevel") || '1'
let levelData = {wordTrials: [], completed: false}
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
clearBtn.addEventListener("click", ()=>{
  refreshGameData(true)
  localStorage.removeItem(levelNum)
  levelData = {...levelData, wordTrials: []}
}
)

function generatelevels() {
  let levelsList = []
  for (let i=0; i<410; i++) {
    let button = document.createElement('button')
    button.addEventListener("click", (event) => {
      levelNum = event.target.textContent
      loadLevel(levelNum)
    })
    button.textContent = (i+1).toString()
    levelsList.push(button)
  }
  gameLevelsContainer.append(...levelsList)
}

generatelevels()
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
    levelData = {wordTrials: [], completed: false}
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

function gameOver() {
  gameStart = false;
  lossMsg.classList.add("showMsg")
}

function evaluateInput() {
  let wordIsCorrect = checkIfWordCorrect(input)
  levelData.wordTrials.push(input)
  if (wordIsCorrect) {
    winMsg.classList.add("showMsg")
    levelData.completed !== true ? levelData.completed = true : null;
  }else {
    if (currentWordTrial > 5) gameOver();
    refreshGameData();
  }
  localStorage.setItem(levelNum.toString(), JSON.stringify(levelData))
}

function checkIfWordCorrect(wordTrial) {
  let wordList = [...word]
  for (let i=0; i< 5; i++) {
    if (wordTrial[i] === wordList[i]) {
      validity[i] = 'green'
      wordList[i] = ''
    }
  }
  for (let i=0; i<5; i++) {
    let index = wordList.indexOf(wordTrial[i])
    if (index > -1 && validity[i] !== "green") { // Not matched letter was found in wrong position
      validity[i] = "pale-orange"
      wordList[index] = ''
    }
  }
  let wordIsCorrect = validity.every((classStr)=>classStr === "green")
  updateDisplay(wordTrial)
  return wordIsCorrect
}

function updateDisplay(inputString) {
  for (let i=0; i<5; i++) {
    inputBox = inputsRows[currentWordTrial].item(i)
    inputBox.classList = validity[i]
    inputBox.value = inputString[i] // incase a new level was loaded
    for (let j=0; j<26; j++){
      let button = letterBtns[j];
      if (inputBox.value === button.textContent) {
        if (button.classList.contains('green')) break;
        if (button.classList.contains('pale-orange') && validity[i] !== 'green') break;
        button.classList = "letter " + validity[i];
        break;
      }
    }
  }
  validity = ['deep-blue', 'deep-blue', 'deep-blue', 'deep-blue', 'deep-blue']
  currentWordTrial++
}

function addLettertoInput(letter) {
  if (("ABCDEFGHIJKLMNOPQRSTUVWXYZ").includes(letter) && currentInputPos < 5) {
    inputsRows[currentWordTrial][currentInputPos].value = letter;
    currentInputPos++
    input += letter;
  }
}

letterBtns.forEach((button) => {
  button.addEventListener("click", (event)=>{
    if (!gameStart || levelData.completed) return;
    let letter = event.target.textContent.toUpperCase()
    if (!gameStart) return
    addLettertoInput(letter)
  })
})

document.addEventListener("keyup", (event)=>{
  if (!gameStart || levelData.completed) return;
  if (event.key === "Enter" && currentInputPos === 5) evaluateInput();
  else if (event.key === "Backspace"  && currentInputPos > 0) {
    inputsRows[currentWordTrial][currentInputPos - 1].value = '';
    currentInputPos--
    input = input.slice(0, currentInputPos)
  }else {
    addLettertoInput(event.key.toUpperCase())
  }
});

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

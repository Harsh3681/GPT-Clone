import bot from './assets/bot.svg';
import user from './assets/user.svg';
import copy from './assets/copy.svg';


const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

// loading bot message using three dots (...)
function loader(element){
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if(element.textContent === '....')
      element.textContent = '';
  }, 300)
}

// function to give typing effect of bot output
function typeText(element, text){
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length){
      element.innerHTML += text.charAt(index);
      index++;
    }
    else
      clearInterval(interval);
  }, 20);
}

// generate unique ID for each message
function generateUniqueId(element){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalNumber = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalNumber}`;
}


// box container around each message
function chatStripe(isAI, value, uniqueId){
  return (
    `
      <div class="wrapper ${isAI && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img 
              src="${isAI ? bot : user}"
              alt="${isAI ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id="${uniqueId}">${value}</div>
          
          ${isAI ? `<div><img src="${copy}" alt="copy" class="copy-icon"></div>` : ''}
          
        </div>
      </div>
    `
  )
}

// submit response
const handleSubmit = async(e) => {
  e.preventDefault();

  const data  = new FormData(form);

  // users chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  form.reset();

  // bot chat stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // scroll on user type
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);


  // fetch data from server (bots response)
  const response = await fetch('https://gptevolve.onrender.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get("prompt")
    })
  })

  clearInterval(loadInterval);

  messageDiv.innerHTML = "";

  if(response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    console.log({parsedData});

    typeText(messageDiv, parsedData);
  }
  else{
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong :(";
    alert(err);
  }

}

// call handleSubmit upon user submit the message
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.key === "Enter")
    handleSubmit(e);
})

// -----------------------------------------------------------------

// Microphone

// Microphone button
const microphoneButton = document.getElementById("microphone");
microphoneButton.addEventListener("click", toggleRecognition);

let recognition;
let isRecognitionActive = false;
let savedTranscription = "";

function startRecognition() {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
          }
      }

      const promptText = document.getElementsByName("prompt")[0]; // Assuming there's only one textarea element
      promptText.value = finalTranscript; // Set the value of "prompt" textarea to the transcribed text
      savedTranscription = finalTranscript; // Save the current transcription
  };

  recognition.onerror = (event) => {
      console.error(event.error);
  };

  recognition.onend = () => {
      console.log("Speech recognition stopped.");
      microphoneButton.classList.remove("active");
      isRecognitionActive = false;
  };

  recognition.start();
  microphoneButton.classList.add("active");
  isRecognitionActive = true;
}


function stopRecognition() {
    if (recognition) {
        recognition.stop();
        savedTranscription = ""; // Clear the saved transcription
    }
}

function toggleRecognition(event) {
  event.preventDefault(); // Prevent the default form submission

  if (!isRecognitionActive) {
      startRecognition();
  } else {
      stopRecognition();
  }
}

form.addEventListener("submit", () => {
    stopRecognition(); // Stop recognition when form is submitted
});

submitButton.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent the default form submission
    form.submit(); // Manually submit the form
});

// -----------------------------------------------------------------

// for copy button

const copyBtn = document.querySelector("#copybtn");
const solution = document.querySelector("#solution");
const modal = document.getElementById("modal");
const closeBtn = document.getElementsByClassName("close")[0];

copyBtn.addEventListener("click", () => {
  const textToCopy = solution.innerText;
  navigator.clipboard.writeText(textToCopy)
  .then(() => {
    modal.style.display = "block";
  })
  .catch((err) => {
    console.error("Failed to copy: ", err);
  });
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
});




/* ------ globals ------ */

const colors = [
  blue = { r: 20, g: 151, b: 172 },
  green = { r: 6, g: 81, b: 27 },
  red = { r: 226, g: 83, b: 47 },
  purple = { r: 27, g: 2, b: 46 },
  white = { r: 255, g: 255, b: 255 },
  roseGold = { r: 71, g: 43, b: 47 },
  orange = { r: 255, g: 162, b: 19 }
];
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const sampleButton = document.getElementById("sample");
const brightnessInput = document.getElementById("brightness");

/* ------ camera/event listeners ------ */

//activate camera feed
activateCamera(video);
video.addEventListener("play", () => {
  renderVideo(canvas, video);
});

sampleButton.addEventListener("click", () => {
  const rgb = getRGBFromCanvas(canvas); //returns rgb object to change color of the light
  setLightState(rgb);//sets light state to the rgb param
});

//event listener for all of the color specific buttons
let cp = document.getElementById("button-row").children;
for (let i = 0; i < cp.length; i++) {
  cp[i].addEventListener("click", (e) => {
    let bl = parseInt(document.getElementById("brightness").value);
    if (bl != null) {
      bl = bl / 100;
      console.log(bl);
      e.preventDefault;
      setLightState(colors[i], bl);
      setBackgroundColor(colors[i]);
    }
  });
}

/* ------ all functions ------ */

function activateCamera(destination) {
  //check if browser supports camera. if the code in the if function is a function in the browser, then access camera
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      //returns a promise so...
      .then((stream) => {
        destination.srcObject = stream; //assign destination input
      });
  }
}

function renderVideo(canvasElement, videoElement) {
  //in order to actually paint on the canvas, you will need to get the context
  const context = canvasElement.getContext("2d");
  context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);//source, draw from, draw to
  setTimeout(() => { //after waiting 200ms, run renderVideo again
    renderVideo(canvasElement, videoElement);
  }, 50);
}

function getRGBFromCanvas(canvasElement) {
  //takes all pictures, adds all r, g, and b and divides it by the number of pixels
  const context = canvasElement.getContext("2d");
  const pixels = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
  const rgb = { r: 0, g: 0, b: 0 };
  let pc = 0;
  //for every pixel in image, there are 4 pieces of data
  for (let i = 0; i < pixels.data.length; i += 4) {
    rgb.r += pixels.data[i];
    rgb.g += pixels.data[i + 1];
    rgb.b += pixels.data[i + 2];
    pc++;
  }
  //set the average r, g, and b and divide by pc
  rgb.r = Math.floor(rgb.r / pc);
  rgb.g = Math.floor(rgb.g / pc);
  rgb.b = Math.floor(rgb.b / pc);
  //send the data back
  return rgb;
}

function setBackgroundColor(rgb) {
  document.body.style.backgroundColor = 'rgb(' + [rgb.r, rgb.g, rgb.b].join(',') + ')';
}

function getHeaders() {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", "Bearer TOKEN-HERE");
  headers.get("X-RateLimit-Remaining");
  return headers;
}

/* ------ Contacts the LIFX API ------ */

function setLightState(rgb, bl) {
  // Get the headers and build the PUT request to update all Lights
  const headers = getHeaders();
  //when we get the headers, make a fetch and pass the url and settings
  fetch('https://api.lifx.com/v1/lights/all/state', {
    method: "PUT",
    headers: headers,
    body: JSON.stringify({
      power: "on",
      brightness: bl,
      color: `rgb:${rgb.r},${rgb.g},${rgb.b}`
    })
  })
    .then(data => data.json())
    .then(json => console.log(json));//to check for what we got
}

//LIFX endpoint will know if the light is on or off
function setPower() {
  const headers = getHeaders();
  fetch('https://api.lifx.com/v1/lights/all/toggle', {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      duration: 1
    })
  })
    .then(data => data.json())
    .then(json => console.log(json));
}

function setBrightnessState(bl) {
  if (bl > 1) {
    alert("must be between 1 and 100 u donkus");
  } else {
    const headers = getHeaders();
    fetch('https://api.lifx.com/v1/lights/all/state', {
      method: "PUT",
      headers: headers,
      body: JSON.stringify({
        brightness: bl
      })
    })
      .then(data => data.json())
      .then(json => console.log(json));
  }
}

//cycles through an array of light states
function cycleLights() {
  const headers = getHeaders();
  fetch('https://api.lifx.com/v1/lights/all/cycle', {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      states: [
        {
          color: 'blue'
        },
        {
          color: 'green'
        },
        {
          color: 'red'
        },
        {
          color: 'purple'
        }
      ],
      defaults: {
        duration: 1.0
      },
      direction: 'forward'
    })
  })
    .then(data => data.json())
    .then(json => console.log(json));
}
const video = document.querySelector("video");

const record = document.querySelector(".record");
const recordIcon = document.querySelector(".record-icon");

const capture = document.querySelector(".capture");
const captureIcon = document.querySelector(".capture-icon");

const filterImages = document.querySelectorAll(".filter-image");
const filterLayer = document.querySelector(".filter-layer");

let canvas = document.createElement("canvas");
let tool = canvas.getContext("2d");

let chosenBgColor;

let recorder;
let chunks = [];
let isRecording = false;

let timer = document.querySelector(".timer");
let timerID;
let counter = 0; // Represents total seconds

let captureImgIntervalID;

const constraints = {
  audio: true,
  video: true,
};

async function recordStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;

    recorder = new MediaRecorder(stream);

    recorder.addEventListener("start", (event) => {
      chunks = [];
    });

    recorder.addEventListener("dataavailable", (event) => {
      chunks.push(event.data);
    });

    recorder.addEventListener("stop", (event) => {
      // conversion of media chunks data to video
      const blob = new Blob(chunks, { type: "video/mp4" });
      const videoURL = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = videoURL;

      const formattedDate = getFormattedDate();

      a.download = `stream ${formattedDate} by captura.mp4`;
      a.click();
    });
  } catch (error) {
    if (error.name === "OverconstrainedError") {
      alert(
        `The resolution ${constraints.video.width.exact}x${constraints.video.height.exact} px is not supported by your device.`
      );
    } else if (error.name === "NotAllowedError") {
      alert(
        "You need to grant this page permission to access your camera and microphone."
      );
    } else {
      console.error(`getUserMedia error: ${error.name}`, error);
      alert("Something went wrong. Please try again later.");
    }
  }
}

record.addEventListener("click", (event) => {
  if (!recorder) {
    return;
  }

  isRecording = !isRecording;

  if (isRecording) {
    recorder.start();
    recordIcon.src = "./icons/record.gif";
    startTimer();
  } else {
    recorder.stop();
    recordIcon.src = "./icons/record.png";
    stopTimer();
  }
});

function startTimer() {
  function displayTimer() {
    let totalSeconds = counter;

    let hours = Number.parseInt(totalSeconds / 3600);
    totalSeconds = totalSeconds % 3600; // remaining value

    let minutes = Number.parseInt(totalSeconds / 60);
    totalSeconds = totalSeconds % 60; // remaining value

    let seconds = totalSeconds;

    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    timer.innerText = `${hours}:${minutes}:${seconds}`;

    counter++;
  }

  timerID = setInterval(displayTimer, 1000);
}

function stopTimer() {
  clearInterval(timerID);
  timer.innerText = "00:00:00";
}

capture.addEventListener("click", (event) => {
  captureIcon.src = "./icons/capture.gif";

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  tool.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

  tool.fillStyle = chosenBgColor;
  tool.fillRect(0, 0, video.videoWidth, video.videoHeight);

  let imageUrl = canvas.toDataURL("image");

  let a = document.createElement("a");
  a.href = imageUrl;

  const formattedDate = getFormattedDate();

  a.download = `image ${formattedDate}.jpg`;
  a.click();

  // clear any previous timeout before setting a new one
  clearTimeout(captureImgIntervalID);

  captureImgIntervalID = setTimeout(() => {
    captureIcon.src = "./icons/capture.png";
  }, 1500);
});

function getFormattedDate() {
  const date = new Date();
  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return `${formattedDate} at ${formattedTime}`;
}

filterImages.forEach((filterImage) => {
  filterImage.addEventListener("click", () => {
    chosenBgColor = window
      .getComputedStyle(filterImage)
      .getPropertyValue("background-color");

    filterLayer.style.backgroundColor = chosenBgColor;
  });
});

recordStream();

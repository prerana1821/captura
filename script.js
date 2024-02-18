const video = document.querySelector("video");

const record = document.querySelector(".record");
const recordIcon = document.querySelector(".record-icon");

const capture = document.querySelector(".capture");
const captureIcon = document.querySelector(".capture-icon");

const filterImages = document.querySelectorAll(".filter-image");
const filterLayer = document.querySelector(".filter-layer");

const shareScreen = document.querySelector(".share-screen");
const shareScreenIcon = document.querySelector(".share-screen-icon");

let screenStream;

let canvas = document.createElement("canvas");
let tool = canvas.getContext("2d");

let chosenBgColor = "transparent";

let recorder;
let chunks = [];
let isRecording = false;

let timer = document.querySelector(".timer");
let timerID;
let counter = 0; // Represents total seconds

let captureImgTimeoutID;

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

      if (db) {
        const videoID = shortid();
        const transaction = db.transaction("video", "readwrite");
        const videoStore = transaction.objectStore("video");

        const videoEntry = {
          id: `video-${videoID}`,
          blobData: blob,
        };

        videoStore.add(videoEntry);
      }
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
    recordIcon.classList.add("scale-record");
    startTimer();
  } else {
    recorder.stop();
    recordIcon.classList.remove("scale-record");
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
  // captureIcon.src = "./icons/capture.gif";

  captureIcon.classList.add("scale-capture");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  tool.drawImage(video, 0, 0, canvas.width, canvas.height);

  tool.fillStyle = chosenBgColor;
  tool.fillRect(0, 0, canvas.width, canvas.height);

  if (db) {
    const imageID = shortid();
    const transaction = db.transaction("image", "readwrite");
    const imageStore = transaction.objectStore("image");
    let imageUrl = canvas.toDataURL("image");

    const imageEntry = {
      id: `image-${imageID}`,
      url: imageUrl,
    };

    imageStore.add(imageEntry);
  }

  // clear any previous timeout before setting a new one
  clearTimeout(captureImgTimeoutID);

  captureImgTimeoutID = setTimeout(() => {
    captureIcon.classList.remove("scale-capture");
  }, 1200);
});

filterImages.forEach((filterImage) => {
  filterImage.addEventListener("click", () => {
    chosenBgColor = window
      .getComputedStyle(filterImage)
      .getPropertyValue("background-color");

    filterLayer.style.backgroundColor = chosenBgColor;
  });
});

async function startScreenSharing() {
  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    // Stop the current video stream (if any)
    const currentStream = video.srcObject;
    if (currentStream instanceof MediaStream) {
      currentStream.getTracks().forEach((track) => track.stop());
      video.parentElement.classList.add("video-stream-center");
    }

    video.srcObject = screenStream;
  } catch (error) {
    console.error(`getDisplayMedia error: ${error.name}`, error);
    alert("Failed to start screen sharing. Please try again later.");
  }
}

shareScreen.addEventListener("click", () => {
  if (screenStream) {
    // Stop screen sharing
    screenStream.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
    // video.parentElement.classList.add("video-stream-center");
    // shareScreenIcon.src = "./icons/screen-share.png";
  } else {
    // Start screen sharing
    startScreenSharing();
    // shareScreenIcon.src = "./icons/screen-share-active.png";
  }
});

recordStream();

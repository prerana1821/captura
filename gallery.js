setTimeout(() => {
  if (db) {
    // videos retrieval
    const videoTransaction = db.transaction("video", "readonly");
    const videoStore = videoTransaction.objectStore("video");
    const videoRequest = videoStore.getAll();

    videoRequest.addEventListener("success", (event) => {
      let videos = videoRequest.result;

      let displayGallery = document.querySelector(".display-gallery");

      videos.forEach((video) => {
        let mediaGallery = document.createElement("div");
        mediaGallery.setAttribute("class", "media-gallery");
        mediaGallery.setAttribute("id", video.id);

        let url = URL.createObjectURL(video.blobData);

        mediaGallery.innerHTML = `
            <div class="media">
                <video src=${url} autoplay loop></video>
            </div>
            <div class="media-actions">
                <div class="download">
                    <img src="./icons/download.png" alt="Download Media" />
                </div>
                <div class="delete">
                    <img src="./icons/delete.png" alt="Delete Media" />
                </div>
            </div>
                `;

        displayGallery.appendChild(mediaGallery);

        let deleteAction = mediaGallery.querySelector(".delete");
        deleteAction.addEventListener("click", deleteMedia);
        let downloadAction = mediaGallery.querySelector(".download");
        downloadAction.addEventListener("click", downloadMedia);
      });
    });

    // images retrieval
    const imageTransaction = db.transaction("image", "readonly");
    const imageStore = imageTransaction.objectStore("image");
    const imageRequest = imageStore.getAll();

    imageRequest.addEventListener("success", (event) => {
      let images = imageRequest.result;

      let displayGallery = document.querySelector(".display-gallery");

      images.forEach((image) => {
        let mediaGallery = document.createElement("div");
        mediaGallery.setAttribute("class", "media-gallery");
        mediaGallery.setAttribute("id", image.id);

        mediaGallery.innerHTML = `
            <div class="media">
                <img src=${image.url} alt=${image.id} />
            </div>
            <div class="media-actions">
                <div class="download">
                    <img src="./icons/download.png" alt="Download Media" />
                </div>
                <div class="delete">
                    <img src="./icons/delete.png" alt="Delete Media" />
                </div>
            </div>
                `;

        displayGallery.appendChild(mediaGallery);

        let deleteAction = mediaGallery.querySelector(".delete");
        deleteAction.addEventListener("click", deleteMedia);
        let downloadAction = mediaGallery.querySelector(".download");
        downloadAction.addEventListener("click", downloadMedia);
      });
    });
  }
}, 100);

function deleteMedia(event) {
  const mediaGallery = event.target.parentNode.parentNode.parentNode;
  const id = mediaGallery.getAttribute("id");
  const type = id.slice(0, 5);
  if (type === "video") {
    let videoDBTransaction = db.transaction("video", "readwrite");
    let videoStore = videoDBTransaction.objectStore("video");
    videoStore.delete(id);
  } else if (type === "image") {
    let imageDBTransaction = db.transaction("image", "readwrite");
    let imageStore = imageDBTransaction.objectStore("image");
    imageStore.delete(id);
  }

  mediaGallery.remove();
}

function downloadMedia(event) {
  const mediaGallery = event.target.parentNode.parentNode.parentNode;
  const id = mediaGallery.getAttribute("id");
  const type = id.slice(0, 5);
  if (type === "video") {
    const videoTransaction = db.transaction("video", "readonly");
    const videoStore = videoTransaction.objectStore("video");
    const videoRequest = videoStore.get(id);

    videoRequest.addEventListener("success", () => {
      let video = videoRequest.result;

      const videoURL = URL.createObjectURL(video.blobData);
      const a = document.createElement("a");
      a.href = videoURL;
      const formattedDate = getFormattedDate();
      a.download = `stream ${formattedDate} by captura.mp4`;
      a.click();
    });
  } else if (type === "image") {
    const imageTransaction = db.transaction("image", "readonly");
    const imageStore = imageTransaction.objectStore("image");

    let imageRequest = imageStore.get(id);

    imageRequest.addEventListener("success", () => {
      let image = imageRequest.result;

      let a = document.createElement("a");
      a.href = image.url;
      const formattedDate = getFormattedDate();
      a.download = `image ${formattedDate}.jpg`;
      a.click();
    });
  }
}

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

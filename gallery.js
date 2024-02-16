setTimeout(() => {
  if (db) {
    // videos retrieval
    const transaction = db.transaction("video", "readonly");
    const videoStore = transaction.objectStore("video");
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
                <div class="dowload">
                    <img src="./icons/download.png" alt="Download Media" />
                </div>
                <div class="delete">
                    <img src="./icons/delete.png" alt="Delete Media" />
                </div>
            </div>
                `;

        displayGallery.appendChild(mediaGallery);
      });
    });
  }
}, 100);

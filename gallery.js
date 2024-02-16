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

    // videos retrieval
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

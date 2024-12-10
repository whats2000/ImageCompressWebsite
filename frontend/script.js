const BACKEND_API_URL = "http://127.0.0.1:5000";
const UPLOAD_FILE_BASE_URL = "http://localhost:63342/ImageCompressWebsite/backend";

let notificationContainer;
let compressionFormatSelect;
let downloadBtn = document.getElementById("downloadBtn");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing functionalities.");

  // Initialize Notifications
  initializeNotifications();

  // Initialize Drag & Drop
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const previewArea = document.getElementById("previewArea");
  const imagePreviews = document.getElementById("imagePreviews");
  const downloadBtn = document.getElementById("downloadBtn");

  // Watermark Controls
  const addWatermarkBtn = document.getElementById("addWatermarkBtn");
  const watermarkText = document.getElementById("watermarkText");
  const watermarkPosition = document.getElementById("watermarkPosition");

  // Compression Format Control
  compressionFormatSelect = document.getElementById("compressionFormat"); // Ensure it's initialized

  // Prevent default drag behaviors
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Add drag & drop handlers
  dropZone.addEventListener("dragenter", highlight);
  dropZone.addEventListener("dragover", highlight);
  dropZone.addEventListener("dragleave", unhighlight);
  dropZone.addEventListener("drop", handleDrop);
  fileInput.addEventListener("change", handleFileSelect);

  function highlight() {
    dropZone.classList.add("drag-active");
  }

  function unhighlight() {
    dropZone.classList.remove("drag-active");
  }

  /**
   * Handle dropped files
   * @param e {DragEvent} - The event object
   */
  function handleDrop(e) {
    const files = e.dataTransfer.files;
    handleFiles(files);
    unhighlight();
  }

  /**
   * Handle selected files from input
   * @param e {InputEvent} - The event object
   */
  function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
  }

  /**
   * Handle uploaded files
   * @param files {FileList} - List of files to handle
   */
  function handleFiles(files) {
    if (files.length === 0) return;

    previewArea.style.display = "block";
    imagePreviews.innerHTML = "";

    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith('image/')) {
        showNotification(`Unsupported file type: ${file.name}. Please upload an image file.`, 'error');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      previewArea.style.display = "none";
      return;
    }

    // Apply dynamic class based on the number of images
    imagePreviews.classList.remove("one-image", "two-images", "three-images", "four-or-more-images");

    switch (validFiles.length) {
      case 1:
        imagePreviews.classList.add("one-image");
        break;
      case 2:
        imagePreviews.classList.add("two-images");
        break;
      case 3:
        imagePreviews.classList.add("three-images");
        break;
      default:
        imagePreviews.classList.add("four-or-more-images");
        break;
    }

    // Prepare to store image IDs returned from the server
    window.uploadedImages = [];

    validFiles.forEach((file) => {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append("file", file);

      // Upload file to server
      fetch(`${BACKEND_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then(
          /**
           * @param {CompressResponse} data
           * @param data {CompressResponse} - Response from the server
           */
          (data) => {
            if (data.success) {
              // Store the image ID for later use
              window.uploadedImages.push({
                imageId: data.image_id,
                fileName: file.name,
                originalUrl: data.original_image_url, // Keep the original URL
                compressedUrl: data.original_image_url // Start with original image
              });

              // display the image preview
              const preview = document.createElement("div");
              preview.className = "image-preview";
              preview.innerHTML = `
                                <img src="${UPLOAD_FILE_BASE_URL}/${data.original_image_url}"
                                     alt="${file.name}"
                                     data-image-id="${data.image_id}"
                                />
                                <p>${file.name}</p>
                            `;
              imagePreviews.appendChild(preview);

              // Enable buttons when all images are uploaded
              if (window.uploadedImages.length === validFiles.length) {
                compressBtn.disabled = false;
                addWatermarkBtn.disabled = false;
                downloadBtn.disabled = false;
              }
            } else {
              showNotification(`Error uploading ${file.name}: ${data.message}`, 'error');
            }
          })
        .catch((error) => {
          console.error("Error uploading image:", error);
          showNotification(`An error occurred while uploading ${file.name}.`, 'error');
        });
    });

    // Enable Download Button
    downloadBtn.disabled = true;
    // Enable Add Watermark Button
    addWatermarkBtn.disabled = false;
  }

  // Initialize Quality Slider
  handleQualitySlider();

  // Handle Add Watermark Button Click
  addWatermarkBtn.addEventListener("click", () => {
    const selectedImages = imagePreviews.querySelectorAll(".image-preview img");
    if (selectedImages.length === 0) {
      showNotification("No images selected for watermark.", 'warning');
      return;
    }

    selectedImages.forEach((img) => {
      const imageId = img.getAttribute("data-image-id");
      const text = watermarkText.value || "Default Watermark";
      const position = watermarkPosition.value;

      addWatermark(imageId, text, position);
    });
  });

  // Compress Button Click
  let compressBtn = document.getElementById("compressBtn");
  compressBtn.addEventListener("click", () => {
    const quality = window.compressionQuality || 80; // Default to 80 if not set (1-100)
    const format = compressionFormatSelect.value; // Get a selected format from global selector
    const imagesToCompress = window.uploadedImages;

    if (!imagesToCompress || imagesToCompress.length === 0) {
      showNotification("No images available for compression.", 'warning');
      return;
    }

    compressImages(imagesToCompress, quality, format);
  });
});

// Add event listener for delete buttons
document.addEventListener('click', (e) => {
  if (e.target.matches('.delete-btn')) {
    const imageId = e.target.getAttribute('data-image-id');
    deleteImage(imageId);
  }
});

downloadBtn.addEventListener("click", () => {
  const imagesToDownload = window.uploadedImages;
  const format = compressionFormatSelect.value; // Get a selected format from global selector

  if (!imagesToDownload || imagesToDownload.length === 0) {
    showNotification("No images available for download.", 'warning');
    return;
  }

  imagesToDownload.forEach((image) => {
    downloadImage(image.imageId, format);
  });
});

// Initialize Notifications
function initializeNotifications() {
  notificationContainer = document.createElement('div');
  notificationContainer.className = 'notification-container';
  document.body.appendChild(notificationContainer);
}

// Show Notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerText = message;

  notificationContainer.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Handle the quality slider for image compression
 */
function handleQualitySlider() {
  const qualitySlider = document.getElementById("qualitySlider");
  const qualityValue = document.getElementById("qualityValue");

  if (!qualitySlider || !qualityValue) {
    console.error("Quality slider elements not found");
    return;
  }

  // Set initial value display
  qualityValue.textContent = `${qualitySlider.value}%`;

  // Add event listener to update value display and log changes
  qualitySlider.addEventListener("input", (event) => {
    const value = event.target.value;
    console.log("Slider value changed:", value);
    qualityValue.textContent = `${value}%`;

    // Optional: Store the value for compression logic
    window.compressionQuality = value / 100;
  });
}

/**
 * Add a watermark to an image using the server API
 * @param imageId {string} - The ID of the image to watermark
 * @param watermarkText {string} - The text to use as watermark
 * @param position {string} - The position of the watermark
 */
function addWatermark(imageId, watermarkText, position) {
  fetch(`${BACKEND_API_URL}/api/watermark`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_id: imageId,
      watermark_text: watermarkText,
      position: position,
    }),
  })
    .then((response) => response.json())
    .then(
      /**
       * @param {WatermarkResponse} data - Response from the server
       */
      (data) => {
        if (data.success) {
          // Update the image in window.uploadedImages
          const image = window.uploadedImages.find((img) => img.imageId === imageId);
          if (image) {
            image.compressedUrl = data.watermarked_image_url;

            // Update the image preview
            const watermarkedImage = document.querySelector(`img[data-image-id="${imageId}"]`);
            if (watermarkedImage) {
              watermarkedImage.src = `${UPLOAD_FILE_BASE_URL}/${data.watermarked_image_url}`;
            }
          }
          showNotification(data.message, 'success');
        } else {
          showNotification("Failed to add watermark: " + data.message, 'error');
        }
      })
    .catch((error) => {
      console.error("Error adding watermark:", error);
      showNotification("An error occurred while adding the watermark.", 'error');
    });
}

/**
 * Compress images using the server API
 * @param images {ProcessedImage[]} - List of image objects
 * @param quality {number} - The quality value for compression (1-100)
 * @param format {string} - The selected compression format
 */
function compressImages(images, quality, format) {
  const compressPromises = images.map((image) => {
    return fetch(`${BACKEND_API_URL}/api/compress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_id: image.imageId,
        compression_format: format, // Use a selected format
        compression_quality: quality, // 1-100
      }),
    })
      .then((response) => response.json())
      .then(
        /**
         * @param {CompressResponse} data
         * @returns {{success}|any|null}
         */
        (data) => {
          if (data.success) {
            // Update an image object with compressed image URL
            image.compressedUrl = data.compressed_image_url;

            // Update the displayed image
            const compressedImage = document.querySelector(`img[data-image-id="${image.imageId}"]`);
            if (compressedImage) {
              compressedImage.src = `${UPLOAD_FILE_BASE_URL}/${data.compressed_image_url}`; // show compressed image
            }
            return data;
          } else {
            showNotification(`Compression failed for ${image.fileName}: ${data.message}`, 'error');
            return null;
          }
        })
      .catch((error) => {
        console.error("Error compressing image:", error);
        showNotification(`An error occurred while compressing ${image.fileName}.`, 'error');
        return null;
      });
  });

  Promise.all(compressPromises).then((results) => {
    // Check if all images have been compressed
    const allCompressed = results.every((result) => result && result.success);

    if (allCompressed) {
      showNotification("All images compressed successfully.", 'success');
      downloadBtn.disabled = false;
    } else {
      showNotification("Some images failed to compress.", 'error');
    }

    // Update image previews with compressed images
    updateImagePreviews();
  });
}

/**
 * Update the image previews with the latest image URLs
 */
function updateImagePreviews() {
  let imagePreviews = document.getElementById("imagePreviews");
  imagePreviews.innerHTML = "";

  window.uploadedImages.forEach((image) => {
    const preview = document.createElement("div");
    preview.className = "image-preview";
    const imageUrl = image.compressedUrl || image.originalUrl;

    preview.innerHTML = `
            <img src="${UPLOAD_FILE_BASE_URL}/${imageUrl}" alt="${image.fileName}" data-image-id="${image.imageId}">
            <p>${image.fileName}</p>
        `;
    imagePreviews.appendChild(preview);
  });
}

/**
 * Download an image using the server API
 * @param imageId {string} - The ID of the image to download
 * @param type {'jpeg'|'webp'} - The type of image to download
 */
function downloadImage(imageId, type) {
  fetch(`${BACKEND_API_URL}/api/download/${encodeURIComponent(imageId)}?type=${type}`)
    .then((response) => {
      if (response.ok) {
        return response.blob();
      } else {
        showNotification("Failed to download image.", 'error');
        return null;
      }
    })
    .then(async (blob) => {
      if (blob) {
        const url = URL.createObjectURL(await blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `image_${imageId}.${type}`; // Use the correct file extension
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    })
    .catch((error) => {
      console.error("Error downloading image:", error);
      showNotification("An error occurred while downloading the image.", 'error');
    });
}

/**
 * Delete an image using the server API
 * @param imageId {string} - The ID of the image to delete
 */
function deleteImage(imageId) {
  fetch(`${BACKEND_API_URL}/api/delete/${encodeURIComponent(imageId)}`, {
    method: 'DELETE',
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        window.uploadedImages = window.uploadedImages.filter(image => image.imageId !== imageId);
        const previewElement = document.querySelector(`.image-preview[data-image-id="${imageId}"]`);
        if (previewElement) {
          previewElement.remove();
        }
        showNotification(data.message, 'success');
      } else {
        showNotification(`Failed to delete image: ${data.message}`, 'error');
      }
    })
    .catch(error => {
      console.error('Error deleting image:', error);
      showNotification('An error occurred while deleting the image.', 'error');
    });
}

// Footer display 
window.addEventListener('scroll', () => {
    const footer = document.getElementById('footer');
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPosition = window.scrollY;
    
    // Show footer when near bottom (within 100px)
    if (windowHeight + scrollPosition >= documentHeight - 100) {
        footer.classList.add('visible');
    } else {
        footer.classList.remove('visible');
    }
});
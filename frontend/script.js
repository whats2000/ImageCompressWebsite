const BACKEND_API_URL = "http://127.0.0.1:5000";
const UPLOAD_FILE_BASE_URL = "http://localhost:63342/ImageCompressWebsite/backend";

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded, initializing functionalities.");

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
            const isValidType = file.type === "image/jpeg" || file.type === "image/webp";
            if (!isValidType) {
                alert(`Unsupported file type: ${file.name}. Please upload JPEG or WebP images.`);
            }
            return isValidType;
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
            fetch(BACKEND_API_URL + "/api/upload", {
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
                                originalUrl: data.original_image_url,
                            });

                            // Display the image preview
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
                                downloadBtn.disabled = true; // Enable after compression
                            }
                        } else {
                            alert(`Error uploading ${file.name}: ${data.message}`);
                        }
                    })
                .catch((error) => {
                    console.error("Error uploading image:", error);
                    alert(`An error occurred while uploading ${file.name}.`);
                });
        });

        // Enable Download Button
        downloadBtn.disabled = false;
        // Enable Add Watermark Button
        addWatermarkBtn.disabled = false;
    }

    // Initialize Quality Slider
    handleQualitySlider();

    // Handle Download Button Click
    downloadBtn.addEventListener("click", () => {
        // Implement download functionality as needed
        alert("Download functionality to be implemented.");
    });

    // Handle Add Watermark Button Click
    addWatermarkBtn.addEventListener("click", () => {
        const selectedImages = imagePreviews.querySelectorAll(".image-preview img");
        if (selectedImages.length === 0) {
            alert("No images selected for watermark.");
            return;
        }

        selectedImages.forEach((img) => {
            const imageId = img.getAttribute("data-image-id");
            const text = watermarkText.value || "Default Watermark";
            const position = watermarkPosition.value;

            addWatermark(imageId, text, position);
        });
    });
});

// Footer
window.addEventListener("scroll", () => {
    const footer = document.getElementById("footer");
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPosition = window.scrollY;

    // Show footer when near bottom (within 100px)
    if (windowHeight + scrollPosition >= documentHeight - 100) {
        footer.classList.add("visible");
    } else {
        footer.classList.remove("visible");
    }
});

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
    fetch(BACKEND_API_URL + "/api/watermark", {
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
                            watermarkedImage.src = data.watermarked_image_url;
                        }
                    }
                    alert(data.message);
                } else {
                    alert("Failed to add watermark: " + data.message);
                }
            })
        .catch((error) => {
            console.error("Error adding watermark:", error);
            alert("An error occurred while adding the watermark.");
        });
}

/**
 * Get the compression format based on the file extension
 * @param fileName {string} - The name of the file
 * @returns {string|string} - The compression format ('jpeg' or 'webp')
 */
function getCompressionFormat(fileName) {
    const extension = fileName.split(".").pop().toLowerCase();
    return extension === "jpg" ? "jpeg" : extension; // Converts 'jpg' to 'jpeg'
}

// Compress Button Reference
const compressBtn = document.getElementById("compressBtn");

// Handle Compress Button Click
compressBtn.addEventListener("click", () => {
    const quality = window.compressionQuality || 80; // Default to 80 if not set (1-100)
    const imagesToCompress = window.uploadedImages;

    if (!imagesToCompress || imagesToCompress.length === 0) {
        alert("No images available for compression.");
        return;
    }

    // Add compression_format to each image
    imagesToCompress.forEach((image) => {
        image.compression_format = getCompressionFormat(image.fileName);
    });

    compressImages(imagesToCompress, quality);
});

/**
 * Compress images using the server API
 * @param images {ProcessedImage[]} - List of image objects
 * @param quality {number} - The quality value for compression (1-100)
 */
function compressImages(images, quality) {
    const compressPromises = images.map((image) => {
        return fetch("/api/compress", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                image_id: image.imageId,
                compression_format: image.compression_format, // 'jpeg' or 'webp'
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
                        return data;
                    } else {
                        alert(`Compression failed for ${image.fileName}: ${data.message}`);
                        return null;
                    }
                })
            .catch((error) => {
                console.error("Error compressing image:", error);
                alert(`An error occurred while compressing ${image.fileName}.`);
                return null;
            });
    });

    Promise.all(compressPromises).then((results) => {
        // Check if all images have been compressed
        const allCompressed = results.every((result) => result && result.success);

        if (allCompressed) {
            alert("All images compressed successfully.");
            downloadBtn.disabled = false;
        } else {
            alert("Some images failed to compress.");
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
            <img src="http://localhost:63342/ImageCompressWebsite/backend/uploads/${imageUrl}" alt="${image.fileName}" data-image-id="${image.imageId}">
            <p>${image.fileName}</p>
        `;
        imagePreviews.appendChild(preview);
    });
}

let downloadBtn = document.getElementById("downloadBtn");
downloadBtn.addEventListener("click", () => {
    const imagesToDownload = window.uploadedImages;

    if (!imagesToDownload || imagesToDownload.length === 0) {
        alert("No images available for download.");
        return;
    }

    imagesToDownload.forEach((image) => {
        downloadImage(image.imageId);
    });
});

/**
 * Download an image using the server API
 * @param imageId {string} - The ID of the image to download
 */
function downloadImage(imageId) {
    fetch(BACKEND_API_URL + `/api/download?image_id=${encodeURIComponent(imageId)}`)
        .then((response) => {
            if (response.ok) {
                return response.blob();
            } else {
                alert("Failed to download image.");
                return null;
            }
        })
        .then(async (blob) => {
            if (blob) {
                const url = URL.createObjectURL(await blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `image_${imageId}.jpg`; // Adjust extension if necessary
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            }
        })
        .catch((error) => {
            console.error("Error downloading image:", error);
            alert("An error occurred while downloading the image.");
        });
}

// Add event listener for delete buttons
document.addEventListener('click', (e) => {
    if (e.target.matches('.delete-btn')) {
        const imageId = e.target.getAttribute('data-image-id');
        deleteImage(imageId);
    }
});

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
                alert(data.message);
            } else {
                alert(`Failed to delete image: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error deleting image:', error);
            alert('An error occurred while deleting the image.');
        });
}


// Function to check processing status of an image
// function checkProcessingStatus(imageId) {
//     fetch(`${backend_api}/api/status/${imageId}`)
//     .then(response => response.json())
//     .then(data => {
//         if (data.success) {
//             // Update UI based on the processing status
//             console.log(`Image ${imageId} status:`, data.status);
//             // Optionally update the image URLs if processing is complete
//             if (data.status === 'compressed' || data.status === 'watermarked') {
//                 const imgElement = document.querySelector(`img[data-image-id="${imageId}"]`);
//                 if (imgElement) {
//                     imgElement.src = data.compressed_image_url || data.watermarked_image_url;
//                 }
//             }
//         } else {
//             console.error('Failed to get status:', data.message);
//         }
//     })
//     .catch(error => {
//         console.error('Error fetching status:', error);
//     });
// }

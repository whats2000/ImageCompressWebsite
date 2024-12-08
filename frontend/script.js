const backend_api = "http://127.0.0.1:5000";

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

    function handleDrop(e) {
        const files = e.dataTransfer.files;
        handleFiles(files);
        unhighlight();
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }

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

        // Apply dynamic class based on number of images
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
            fetch(backend_api + "/api/upload", {
                method: "POST",
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
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
                    <img src="${data.original_image_url}" alt="${file.name}" data-image-id="${data.image_id}">
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

// Quality Slider Functionality
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

function addWatermark(imageId, watermarkText, position) {
    fetch(backend_api + "/api/watermark", {
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
        .then((data) => {
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

// Helper function to get compression format
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
            .then((data) => {
                if (data.success) {
                    // Update image object with compressed image URL
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

function updateImagePreviews() {
    imagePreviews.innerHTML = "";

    window.uploadedImages.forEach((image) => {
        const preview = document.createElement("div");
        preview.className = "image-preview";
        const imageUrl = image.compressedUrl || image.originalUrl;

        preview.innerHTML = `
            <img src="${imageUrl}" alt="${image.fileName}" data-image-id="${image.imageId}">
            <p>${image.fileName}</p>
        `;
        imagePreviews.appendChild(preview);
    });
}

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

function downloadImage(imageId) {
    fetch(backend_api + `/api/download?image_id=${encodeURIComponent(imageId)}`)
        .then((response) => {
            if (response.ok) {
                return response.blob();
            } else {
                alert("Failed to download image.");
                return null;
            }
        })
        .then((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
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

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing functionalities.');

    // Initialize Drag & Drop
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewArea = document.getElementById('previewArea');
    const imagePreviews = document.getElementById('imagePreviews');
    const downloadBtn = document.getElementById('downloadBtn');

    // Watermark Controls
    const addWatermarkBtn = document.getElementById('addWatermarkBtn');
    const watermarkText = document.getElementById('watermarkText');
    const watermarkPosition = document.getElementById('watermarkPosition');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Add drag & drop handlers
    dropZone.addEventListener('dragenter', highlight);
    dropZone.addEventListener('dragover', highlight);
    dropZone.addEventListener('dragleave', unhighlight);
    dropZone.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);

    function highlight() {
        dropZone.classList.add('drag-active');
    }

    function unhighlight() {
        dropZone.classList.remove('drag-active');
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

        previewArea.style.display = 'block';
        imagePreviews.innerHTML = '';

        const validFiles = Array.from(files).filter(file => {
            const isValidType = file.type === 'image/jpeg' || file.type === 'image/webp';
            if (!isValidType) {
                alert(`Unsupported file type: ${file.name}. Please upload JPEG or WebP images.`);
            }
            return isValidType;
        });

        if (validFiles.length === 0) {
            previewArea.style.display = 'none';
            return;
        }

        // Apply dynamic class based on number of images
        imagePreviews.classList.remove('one-image', 'two-images', 'three-images', 'four-or-more-images');

        switch (validFiles.length) {
            case 1:
                imagePreviews.classList.add('one-image');
                break;
            case 2:
                imagePreviews.classList.add('two-images');
                break;
            case 3:
                imagePreviews.classList.add('three-images');
                break;
            default:
                imagePreviews.classList.add('four-or-more-images');
                break;
        }

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'image-preview';
                const uniqueId = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`; // Generate unique ID
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}" data-image-id="${uniqueId}">
                    <p>${file.name}</p>
                `;
                imagePreviews.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });

        // Enable Download Button
        downloadBtn.disabled = false;
        // Enable Add Watermark Button
        addWatermarkBtn.disabled = false;
    }

    // Initialize Quality Slider
    handleQualitySlider();

    // Handle Download Button Click
    downloadBtn.addEventListener('click', () => {
        // Implement download functionality as needed
        alert('Download functionality to be implemented.');
    });

    // Handle Add Watermark Button Click
    addWatermarkBtn.addEventListener('click', () => {
        const selectedImages = imagePreviews.querySelectorAll('.image-preview img');
        if (selectedImages.length === 0) {
            alert('No images selected for watermark.');
            return;
        }

        selectedImages.forEach(img => {
            const imageId = img.getAttribute('data-image-id');
            const text = watermarkText.value || 'Default Watermark';
            const position = watermarkPosition.value;

            addWatermark(imageId, text, position);
        });
    });
});

// Quality Slider Functionality
function handleQualitySlider() {
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');

    if (!qualitySlider || !qualityValue) {
        console.error('Quality slider elements not found');
        return;
    }

    // Set initial value display
    qualityValue.textContent = `${qualitySlider.value}%`;

    // Add event listener to update value display and log changes
    qualitySlider.addEventListener('input', (event) => {
        const value = event.target.value;
        console.log('Slider value changed:', value);
        qualityValue.textContent = `${value}%`;
        
        // Optional: Store the value for compression logic
        window.compressionQuality = value / 100;
    });
}

// Function to add watermark
function addWatermark(imageId, watermarkText, position) {
    fetch('/api/watermark', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            image_id: imageId,
            watermark_text: watermarkText,
            position: position
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the image preview with the watermarked image
            const watermarkedImage = document.querySelector(`img[data-image-id="${imageId}"]`);
            if (watermarkedImage) {
                watermarkedImage.src = data.watermarked_image_url;
            }
            alert(data.message);
        } else {
            alert('Failed to add watermark: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error adding watermark:', error);
        alert('An error occurred while adding the watermark.');
    });
}
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing slider...');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewArea = document.getElementById('previewArea');
    const imagePreviews = document.getElementById('imagePreviews');
    const compressBtn = document.getElementById('compressBtn');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    handleQualitySlider();

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
        unhighlight();
        const files = e.dataTransfer.files;
        handleFiles(files);
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        if (files.length === 0) return;
        
        previewArea.style.display = 'block';
        imagePreviews.innerHTML = '';
    
        Array.from(files).forEach(file => {
            if (file.type === 'image/jpeg' || file.type === 'image/webp') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.createElement('div');
                    preview.className = 'image-preview';
                    preview.innerHTML = `
                        <img src="${e.target.result}" alt="${file.name}">
                        <p>${file.name}</p>
                    `;
                    imagePreviews.appendChild(preview);
                };
                reader.readAsDataURL(file);
            } else {
                alert(`Unsupported file type: ${file.name}. Please upload JPEG or WebP images.`);
            }
        });
    }
    
});

// Footer Control
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

// Quality Slider Functionality
function handleQualitySlider() {
    // Select elements
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');

    // Check if elements exist
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
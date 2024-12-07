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
            if (file.type.startsWith('image/')) {
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
            }
        });
    }

    handleQualitySlider();
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

function handleQualitySlider() {
    // Add debugging to check elements
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');

    if (!qualitySlider || !qualityValue) {
        console.error('Quality slider elements not found');
        return;
    }

    // Set initial value
    qualityValue.textContent = `${qualitySlider.value}%`;

    // Add event listener with debugging
    qualitySlider.addEventListener('input', (event) => {
        console.log('Slider value changed:', event.target.value);
        qualityValue.textContent = `${event.target.value}%`;
    });
}
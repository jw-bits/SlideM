// Configuration
const config = {
    // Directory containing images (relative to index.html)
    imageDir: 'assets/',
    // List of image filenames. 
    // Note: Browser JavaScript cannot automatically list directory contents from the file system 
    // for security reasons. You must list your files here.
    displayDuration: 20000, // 20 seconds
};

const container = document.getElementById('image-container');
let currentIndex = 0;
let currentImageElement = null;

// Transition effects defined in CSS
const transitions = [
    'start-fade',
    'start-slide-left',
    'start-slide-right',
    'start-zoom',
    'start-rotate'
];

function getRandomTransition() {
    const index = Math.floor(Math.random() * transitions.length);
    return transitions[index];
}

function loadMedia(index) {
    const filename = config.images[index];
    const isVideo = filename.toLowerCase().endsWith('.mp4');
    let element;

    if (isVideo) {
        element = document.createElement('video');
        element.muted = true; // Required for autoplay in most browsers
        element.autoplay = true;
        element.loop = true;
        element.playsInline = true;
    } else {
        element = document.createElement('img');
    }
    
    element.src = config.imageDir + filename;
    element.className = 'slide';
    return element;
}

function showNextImage() {
    const nextIndex = (currentIndex + 1) % config.images.length;
    const nextImage = loadMedia(nextIndex);
    
    // Pick a random transition start state
    const transitionClass = getRandomTransition();
    nextImage.classList.add(transitionClass);
    
    container.appendChild(nextImage);

    // Force reflow to ensure the browser registers the starting state before transitioning
    void nextImage.offsetWidth;

    // Activate the new image (removes start state effects via CSS transition to .active)
    nextImage.classList.remove(transitionClass);
    nextImage.classList.add('active');

    // Clean up the old image after transition
    const oldImage = currentImageElement;
    oldImage.classList.add(transitions[0]);
    if (oldImage) {
        // Wait for transition to finish (1s defined in CSS) plus a buffer
        setTimeout(() => {
            if (oldImage.parentNode) {
                oldImage.parentNode.removeChild(oldImage);
            }
        }, 1200); 
    }

    currentImageElement = nextImage;
    currentIndex = nextIndex;
}

async function startApp() {
    try {
        const response = await fetch('images.json');
        config.images = await response.json();
    } catch (error) {
        console.error("Error loading images.json:", error);
        return;
    }

    if (config.images.length === 0) {
        console.error("No images found in images.json");
        return;
    }

    // Show first image immediately without transition
    const firstImg = loadMedia(0);
    firstImg.classList.add('active');
    container.appendChild(firstImg);
    currentImageElement = firstImg;

    // Start the loop
    setInterval(showNextImage, config.displayDuration);
}

// Initialize
document.addEventListener('DOMContentLoaded', startApp);

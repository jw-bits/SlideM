// Configuration
const config = {
    // Directory containing images (relative to index.html)
    imageDir: 'assets/',
    // List of image filenames. 
    // Note: Browser JavaScript cannot automatically list directory contents from the file system 
    // for security reasons. You must list your files here.
    displayDuration: 10000, // 10 seconds
};

const container = document.getElementById('image-container');
let currentIndex = 0;
let currentImageElement = null;
let hasBeenClicked = false;

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
        element.muted = !hasBeenClicked; // Required for autoplay in most browsers
        element.autoplay = true;
        element.loop = false;
        element.setAttribute('playsinline', '');
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

    if (nextImage.tagName === 'VIDEO') {
        nextImage.play().catch(e => console.error("Video play failed:", e));
        nextImage.addEventListener('ended', showNextImage);
    } else {
        setTimeout(showNextImage, config.displayDuration);
    }

    // Force reflow to ensure the browser registers the starting state before transitioning
    void nextImage.offsetWidth;

    // Activate the new image (removes start state effects via CSS transition to .active)
    nextImage.classList.remove(transitionClass);
    nextImage.classList.add('active');

    // Clean up the old image after transition
    const oldImage = currentImageElement;

    if (oldImage) {
        oldImage.classList.remove('active');
        oldImage.classList.add('start-fade');

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

    if (firstImg.tagName === 'VIDEO') {
        firstImg.play().catch(e => console.error("Video play failed:", e));
        firstImg.addEventListener('ended', showNextImage);
    } else {
        setTimeout(showNextImage, config.displayDuration);
    }

    currentImageElement = firstImg;
}

// Initialize
document.addEventListener('DOMContentLoaded', startApp);
document.addEventListener("click", () => {
    hasBeenClicked = true;
});

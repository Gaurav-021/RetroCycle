const fileInput = document.getElementById('file-input');
const video = document.getElementById('video');
const captureButton = document.getElementById('capture-button');
const canvas = document.getElementById('canvas');
const resultImage = document.getElementById('result-image');
const classificationResult = document.getElementById('classification-result');
const sortingScreen = document.getElementById('sorting-screen');
const openPopupButton = document.getElementById('open-popup-button');
const closePopupButton = document.getElementById('close-popup-button');
const character = document.getElementById('pixel-character');

// Image paths for left and right versions of the character
const rightFacingImage = 'static/images/character_right.png';  
const leftFacingImage = 'static/images/character_left.png';

// Get the initial position of the character from its DOM placement
const rect = character.getBoundingClientRect();
let charX = rect.left; // Start X position from current location
let charY = rect.top;  // Start Y position from current location

// Set the initial CSS position to match these coordinates
character.style.left = `${charX}px`;
character.style.top = `${charY}px`;

let walkInterval; // Store interval ID
let lastDirection = 'left'; // Track the last direction

document.addEventListener('click', (event) => {
    // Calculate center position of the character element
    const charWidth = character.offsetWidth;
    const charHeight = character.offsetHeight;

    // Target coordinates adjusted to the center of the character
    const targetX = event.clientX - charWidth / 2;
    const targetY = event.clientY - charHeight / 2 - 75;

    // Determine current direction based on target position relative to the character's current position
    const dx = targetX - charX;
    const currentDirection = dx > 0 ? 'right' : 'left';

    // Update character image immediately based on current direction
    if (currentDirection !== lastDirection) {
        character.src = currentDirection === 'right' ? rightFacingImage : leftFacingImage;
        lastDirection = currentDirection; // Update lastDirection to match the new direction
    }

    // Clear previous movement
    if (walkInterval) {
        clearInterval(walkInterval);
    }

    // Start moving to the new target
    walkToTarget(targetX, targetY);
});

// Function to move character to target position
function walkToTarget(targetX, targetY) {
    const speed = 7; // Adjust speed as desired

    walkInterval = setInterval(() => {
        const dx = targetX - charX;
        const dy = targetY - charY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const currentDirection = dx > 0 ? 'right' : 'left';

        // Only change the image if the direction has changed
        if (currentDirection !== lastDirection) {
            character.src = currentDirection === 'right' ? rightFacingImage : leftFacingImage;
            lastDirection = currentDirection; // Update lastDirection
        }

        // Stop moving if close to target
        if (distance < speed) {
            clearInterval(walkInterval);
            charX = targetX;
            charY = targetY;
            // Ensure the character image reflects the final direction
            character.src = lastDirection === 'right' ? rightFacingImage : leftFacingImage;
        } else {
            // Calculate movement vector
            const moveX = (dx / distance) * speed;
            const moveY = (dy / distance) * speed;

            // Update character position
            charX += moveX;
            charY += moveY;
            character.style.left = `${charX}px`;
            character.style.top = `${charY}px`;
        }
    }, 20); // Adjust interval timing for smoother movement
}

// Open the sorting screen when the button is clicked
openPopupButton.addEventListener('click', () => {
    console.log("Open button clicked");
    sortingScreen.style.display = 'block';
});

closePopupButton.addEventListener('click', () => {
    console.log("Close button clicked");
    sortingScreen.style.display = 'none';
});

// Close the modal when clicking outside of the modal content
window.addEventListener('click', (event) => {
    if (event.target === sortingScreen) {
        sortingScreen.style.display = 'none';
    }
});

// Capture photo from the live feed
captureButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/png');

    // Clear previous result before displaying new one
    resultImage.src = ''; // Clear previous image
    resultImage.src = imageDataUrl;
    resultImage.style.display = 'block';

    sendImageToFlask(imageDataUrl);
});

// Handle file uploads
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return; // Early return if no file is selected

    const reader = new FileReader();
    reader.onload = function(e) {
        // Clear previous result before displaying new one
        resultImage.src = ''; // Clear previous image
        resultImage.src = e.target.result;
        resultImage.style.display = 'block';

        sendFileToFlask(file);
    };

    reader.readAsDataURL(file);
});

// Declare counters
let recyclingCount = 0;
let compostCount = 0;
let trashCount = 0;

// Function to send the image to Flask
function sendImageToFlask(imageDataUrl) {
    fetch('/process_image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageDataUrl }),
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        classificationResult.textContent = data.classification; // Adjust based on your Flask response
        animateBin(data.classification.toLowerCase()); // Call animate function based on classification
        
        // Update the corresponding counter
        if (data.classification.toLowerCase() === 'recycling') {
            recyclingCount++;
            document.getElementById('recycling-count').textContent = recyclingCount;
        } else if (data.classification.toLowerCase() === 'compost') {
            compostCount++;
            document.getElementById('compost-count').textContent = compostCount;
        } else if (data.classification.toLowerCase() === 'trash') {
            trashCount++;
            document.getElementById('trash-count').textContent = trashCount;
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('There was an error processing your image.'); // User feedback
    });
}

// Function to send the file to Flask (optional)
function sendFileToFlask(file) {
    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        classificationResult.textContent = data.classification; // Adjust based on your Flask response
        animateBin(data.classification.toLowerCase()); // Call animate function based on classification
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('There was an error uploading your file.'); // User feedback
    });
}

// Function to animate the bins
function animateBin(bin) {
    const binId = `${bin}-image`; // Get the ID for the corresponding bin image
    const imgElement = document.getElementById(binId); // Get the image element

    // Change the image to open state
    imgElement.src = imgElement.src.replace('_closed', '_open');

    // Increment the respective counter
    increaseCounter(bin);

    // Optionally, you could add a class for additional CSS animations
    imgElement.classList.add('animate');

    // Revert to closed state after animation delay (1000ms = 1 second)
    setTimeout(() => {
        imgElement.src = imgElement.src.replace('_open', '_closed'); // Change back to closed state
        imgElement.classList.remove('animate'); // Remove animation class if used
    }, 1000); // Adjust the duration as needed for your visual preference
}

// Function to increase the appropriate counter
function increaseCounter(bin) {
    const countElement = document.getElementById(`${bin}-count`);
    
    if (countElement) {
        let currentCount = parseInt(countElement.innerText, 10); // Get current count
        currentCount += 1; // Increment count
        countElement.innerText = currentCount; // Update the displayed count
    }
}
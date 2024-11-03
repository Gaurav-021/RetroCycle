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

const achievementCheckpoint = { x: 304.5, y: 180 }; // Fixed coordinates for achievement
let isAchievementAnimating = false;
let allBinsUsedAchievementUnlocked = false;

// Counter declarations
let recyclingCount = 0;
let compostCount = 0;
let trashCount = 0;

// Get the initial position of the character from its DOM placement
const rect = character.getBoundingClientRect();
let charX = rect.left; // Start X position from current location
let charY = rect.top;  // Start Y position from current location

// Set the initial CSS position to match these coordinates
character.style.left = `${charX}px`;
character.style.top = `${charY}px`;

let walkInterval; // Store interval ID
let lastDirection = 'left'; // Track the last direction

// Add a flag to indicate if the modal is open
let isModalOpen = false;

// Open the sorting screen when the button is clicked
openPopupButton.addEventListener('click', () => {
    console.log("Open button clicked");
    sortingScreen.style.display = 'block';
    isModalOpen = true; // Set flag to true when modal is open
    character.style.pointerEvents = 'none'; // Disable character interaction
});

// Close the modal
closePopupButton.addEventListener('click', () => {
    console.log("Close button clicked");
    sortingScreen.style.display = 'none';
    isModalOpen = false; // Set flag to false when modal is closed
    character.style.pointerEvents = 'auto'; // Enable character interaction
});

// Close the modal when clicking outside of the modal content
window.addEventListener('click', (event) => {
    if (event.target === sortingScreen) {
        sortingScreen.style.display = 'none';
        isModalOpen = false; // Set flag to false when modal is closed
        character.style.pointerEvents = 'auto'; // Enable character interaction
    }
});

// Modify the click event listener for the document
document.addEventListener('click', (event) => {
    // Prevent character movement if the modal is open or if an achievement animation is in progress
    if (isModalOpen || isAchievementAnimating) return;

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
// Function to move character to target position and then execute a callback
function walkToTarget(targetX, targetY, callback) {
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

            // Call the callback function after reaching the target
            if (callback) {
                callback();
            }
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

// Function to show achievement message
// Checkpoint coordinates
// Function to show achievement GIF and then message
// Function to show achievement GIF and then message
function showAchievementMessage() {
    // Disable character movement during the achievement animation
    isAchievementAnimating = true;

    // Create GIF container
    const achievementGifContainer = document.createElement('div');
    achievementGifContainer.className = 'achievement-gif-popup'; // Add a class for styling
    achievementGifContainer.style.position = 'absolute';
    achievementGifContainer.style.left = `${achievementCheckpoint.x + 200}px`;
    achievementGifContainer.style.top = `${achievementCheckpoint.y}px`;
    achievementGifContainer.style.opacity = 1;

    // Create GIF element
    const achievementGif = document.createElement('img');
    achievementGif.src = 'static/images/stars.gif'; // Path to your GIF
    achievementGif.alt = 'Achievement GIF';
    achievementGif.style.width = '100px'; // Set size as needed
    achievementGif.style.height = 'auto'; // Maintain aspect ratio
    achievementGifContainer.appendChild(achievementGif);

    document.body.appendChild(achievementGifContainer);

    // Wait for the GIF to finish (you may want to adjust the timing based on your GIF's duration)
    setTimeout(() => {
        // Remove GIF after a delay
        document.body.removeChild(achievementGifContainer);
        
        // Now show the achievement message
        showAchievementText();
    }, 1000); // Adjust this delay to match the length of your GIF
}

function showAchievementText() {
    isModalOpen = false;
    console.log("Close button from achievement clicked");
    // Create achievement message container
    const achievementMessageContainer = document.createElement('div');
    achievementMessageContainer.className = 'achievement-popup'; // Add a class for styling
    achievementMessageContainer.style.position = 'absolute';
    achievementMessageContainer.style.left = `${achievementCheckpoint.x}px`;
    achievementMessageContainer.style.top = `${achievementCheckpoint.y - 35}px`; // Position above the GIF
    achievementMessageContainer.style.opacity = 1;

    // Create achievement message text
    const achievementText = document.createElement('p');
    achievementText.innerText = "Achievement Unlocked: First Recycling Item Collected!";
    achievementMessageContainer.appendChild(achievementText);

    document.body.appendChild(achievementMessageContainer);

    // Animate the message (fade out)
    setTimeout(() => {
        achievementMessageContainer.style.transition = 'opacity 1s';
        achievementMessageContainer.style.opacity = 0;

        // Remove the message after fading out
        setTimeout(() => {
            document.body.removeChild(achievementMessageContainer);

            // Re-enable character movement after the achievement sequence is complete
            isAchievementAnimating = false;
        }, 1000); // Wait for fade out to complete
    }, 1000); // Show message for 1 second before fading out
}


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
        // Increment the global counter based on the bin clicked
        if (bin === 'recycling') {
            recyclingCount++; // Increment recycling count
        } else if (bin === 'compost') {
            compostCount++; // Increment compost count
        } else if (bin === 'trash') {
            trashCount++; // Increment trash count
        }

        // Get the current displayed count, parse it to an integer
        let currentCount = parseInt(countElement.innerText, 10); // Get current count
        currentCount += 1; // Increment displayed count
        countElement.innerText = currentCount; // Update the displayed count

        // Check for the individual recycling achievement
        if (bin === 'recycling' && currentCount === 1) {
            unlockAchievement(); // Unlock achievement for the first recycling item
        }

        // Log the current counts for debugging
        console.log('Current Counts:', {
            recyclingCount,
            compostCount,
            trashCount,
            allBinsUsedAchievementUnlocked
        });

        // Check for the "all bins used" achievement if not already unlocked
        if (!allBinsUsedAchievementUnlocked && recyclingCount >= 1 && compostCount >= 1 && trashCount >= 1) {
            console.log("Unlocking all bins achievement"); // Log before unlocking
            allBinsUsedAchievementUnlocked = true; // Set the flag so it triggers only once
            unlockAllBinsAchievement(); // Call the new achievement function
            console.log("All bins used achievement unlocked"); // Log after unlocking
        }
    }
}

function unlockAllBinsAchievement() {
    // Move character to the achievement checkpoint or a new location if desired
    sortingScreen.style.display = 'none';
    walkToTarget(achievementCheckpoint.x + 1000, achievementCheckpoint.y, () => {
        
        // Show a unique achievement message for the "all bins used" achievement
        showAllBinsAchievementMessage("Achievement Unlocked: First Item in Each Bin!");
    });
}


// Function to unlock achievement
function unlockAchievement() {
    // Close the sorting screen
    sortingScreen.style.display = 'none';

    // Move character to the achievement checkpoint
    walkToTarget(achievementCheckpoint.x, achievementCheckpoint.y, showAchievementMessage);
}

function showAllBinsAchievementMessage(message) {
    // Disable character movement during the achievement animation
    isAchievementAnimating = true;

    // Create GIF container for achievement
    const achievementGifContainer = document.createElement('div');
    achievementGifContainer.className = 'achievement-gif-popup'; // Add a class for styling
    achievementGifContainer.style.position = 'absolute';
    achievementGifContainer.style.left = `${achievementCheckpoint.x + 1230}px`;
    achievementGifContainer.style.top = `${achievementCheckpoint.y}px`;
    achievementGifContainer.style.opacity = 1;

    // Create GIF element
    const achievementGif = document.createElement('img');
    achievementGif.src = 'static/images/stars.gif'; // Path to your GIF for "All Bins Used"
    achievementGif.alt = 'All Bins Achievement GIF';
    achievementGif.style.width = '100px';
    achievementGif.style.height = 'auto';
    achievementGifContainer.appendChild(achievementGif);

    document.body.appendChild(achievementGifContainer);

    // Wait for the GIF to finish
    setTimeout(() => {
        // Remove GIF after a delay
        document.body.removeChild(achievementGifContainer);
        
        // Now show the achievement message
        showAllBinsAchievementText(message);
    }, 1000); // Adjust this delay to match the length of your GIF
}

function showAllBinsAchievementText(message) {
    const achievementMessageContainer = document.createElement('div');
    achievementMessageContainer.className = 'achievement-popup'; // Style class for the popup
    achievementMessageContainer.style.position = 'absolute';
    achievementMessageContainer.style.left = `${achievementCheckpoint.x + 1200}px`;
    achievementMessageContainer.style.top = `${achievementCheckpoint.y - 35}px`; // Adjust as needed
    achievementMessageContainer.style.opacity = 1;

    // Create message text
    const achievementText = document.createElement('p');
    achievementText.innerText = message;
    achievementMessageContainer.appendChild(achievementText);

    document.body.appendChild(achievementMessageContainer);

    // Animate the message (fade out)
    setTimeout(() => {
        achievementMessageContainer.style.transition = 'opacity 1s';
        achievementMessageContainer.style.opacity = 0;

        // Remove the message after fading out
        setTimeout(() => {
            document.body.removeChild(achievementMessageContainer);

            // Re-enable character movement after the achievement sequence is complete
            isAchievementAnimating = false;
        }, 1000); // Wait for fade out to complete
    }, 2000); // Show message for 1 second before fading out
}
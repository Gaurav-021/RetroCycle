const fileInput = document.getElementById('file-input');
const video = document.getElementById('video');
const captureButton = document.getElementById('capture-button');
const canvas = document.getElementById('canvas');
const resultImage = document.getElementById('result-image');
const classificationResult = document.getElementById('classification-result');
const sortingScreen = document.getElementById('sorting-screen');
const openPopupButton = document.getElementById('open-popup-button');
const closePopupButton = document.getElementById('close-popup-button');

// Open the sorting screen when the button is clicked
openPopupButton.addEventListener('click', () => {
    sortingScreen.style.display = 'block';
});

// Close the sorting screen when the close button is clicked
closePopupButton.addEventListener('click', () => {
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

    // Optionally, you could add a class for additional CSS animations
    imgElement.classList.add('animate');

    // Revert to closed state after animation delay (1000ms = 1 second)
    setTimeout(() => {
        imgElement.src = imgElement.src.replace('_open', '_closed'); // Change back to closed state
        imgElement.classList.remove('animate'); // Remove animation class if used
    }, 1000); // Adjust the duration as needed for your visual preference
}

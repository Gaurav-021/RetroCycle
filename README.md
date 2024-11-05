RetroCycle

Project Overview

RetroCycle is an engaging web application that combines education and fun to help people learn proper waste disposal practices. The app uses your live camera feed to detect items of trash and categorizes them into one of three bins: Trash, Recycle, or Compost. The project utilizes a YOLOv8 (You Only Look Once version 8) model trained to recognize various types of waste. With its arcade-style interface, RetroCycle provides a fun and interactive way to encourage better waste sorting habits while keeping track of your progress.

Features
Live Camera Feed: Engage with the app using your webcam. Simply bring trash items into the frame, and the app will detect and classify them.
Real-time Trash Classification: Powered by YOLOv8, the app detects waste items and categorizes them into Trash, Recycle, or Compost in real time.
Score Tracking: RetroCycle tracks your performance, rewarding you for correctly sorting trash into the right bins.
Arcade Theme: RetroCycle features an arcade-inspired design, creating an exciting and playful experience as you sort your waste.
Responsive Design: The website is optimized for both desktop and mobile use, making it easy to play from any device with a camera.

Technologies Used
HTML: For the structure and layout of the website.
CSS: Custom styles to create the retro arcade theme and ensure a responsive design.
JavaScript: For handling the front-end logic, such as webcam interaction, live feed processing, and data handling.
Python: The backend of the application, handling requests and interfacing with the YOLOv8 model.
YOLOv8: A state-of-the-art object detection model used to identify and classify trash, recyclable materials, and compostable items from the camera feed.
Flask: A lightweight Python web framework used for serving the app and handling HTTP requests.

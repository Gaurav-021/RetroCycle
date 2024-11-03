import cv2
import numpy as np
from flask import Flask, render_template, request, jsonify, Response
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)

# Initialize the camera
camera = cv2.VideoCapture(0)

def classify_frame(frame):
    # This function would contain your AI model logic
    # For now, let's just simulate classification by returning a string
    # Convert the frame to a string or label for the classification
    # You would typically call your AI model here and return the classification
    return "Classified as 'Recycling'"  # Placeholder classification

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        
        # Here you would process the frame with your AI detection logic
        classification = classify_frame(frame)

        # Optionally display classification text on the frame
        cv2.putText(frame, classification, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2, cv2.LINE_AA)

        # Encode the frame in JPEG format
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/process_image', methods=['POST'])
def process_image():
    data = request.json['image']
    image_data = data.split(',')[1]
    image = Image.open(BytesIO(base64.b64decode(image_data)))

    # Your image classification logic here
    classification = classify_image(image)

    return jsonify({'classification': classification})

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    image = Image.open(file)

    # Your image classification logic here
    classification = classify_image(image)

    return jsonify({'classification': classification})

def classify_image(image):
    # Replace this with your actual classification logic
    # For now, let's just return a placeholder
    return "Classified as 'Recycling'"  # Replace with actual classification logic

if __name__ == '__main__':
    app.run(debug=True)

# Release the camera when the app is closed
@app.teardown_appcontext
def teardown_camera(exception):
    camera.release()

import cv2
import numpy as np
from flask import Flask, render_template, request, jsonify, Response
import base64
from ultralytics import YOLO

app = Flask(__name__)

# Load the YOLOv8 model
model = YOLO('v8.pt')  # Adjust the model name as needed

# URL of the MJPEG camera feed
MJPEG_URL = 'http://localhost:8080/my_camera'

def gen_frames():
    camera = cv2.VideoCapture(MJPEG_URL)  # Use the MJPEG stream URL
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            # Perform detection
            results = model(frame)

            # Draw the results on the frame
            annotated_frame = results[0].plot()

            ret, buffer = cv2.imencode('.jpg', annotated_frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/process_image', methods=['POST'])
def process_image():
    data = request.json['image']
    header, encoded = data.split(',', 1)
    image_data = base64.b64decode(encoded)
    np_image = np.frombuffer(image_data, np.uint8)
    image = cv2.imdecode(np_image, cv2.IMREAD_COLOR)

    # Perform detection
    results = model(image)
    # Draw the results on the image
    annotated_image = results[0].plot()

    # Convert the processed image to base64 for the response
    _, buffer = cv2.imencode('.jpg', annotated_image)
    encoded_image = base64.b64encode(buffer).decode('utf-8')

    return jsonify({'image': f'data:image/jpeg;base64,{encoded_image}'})

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    in_memory_file = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(in_memory_file, cv2.IMREAD_COLOR)

    # Perform detection
    results = model(image)
    # Draw the results on the image
    annotated_image = results[0].plot()

    # Convert the processed image to base64 for the response
    _, buffer = cv2.imencode('.jpg', annotated_image)
    encoded_image = base64.b64encode(buffer).decode('utf-8')

    return jsonify({'image': f'data:image/jpeg;base64,{encoded_image}'})

if __name__ == '__main__':
    app.run(debug=True)

@app.teardown_appcontext
def teardown_camera(exception):
    cv2.VideoCapture(MJPEG_URL).release()

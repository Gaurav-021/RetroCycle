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

RECYCLABLE = ['cardboard_box', 'can', 'plastic_bottle_cap', 'plastic_bottle', 'reuseable_paper', 'plastic_bag', 'scrap_paper', 'stick', 'plastic_cup', 'snack_bag', 'plastic_box', 'straw', 'plastic_cup_lid', 'scrap_plastic', 'cardboard_bowl', 'plastic_cultery']
COMPOST = ['chemical_plastic_bottle', 'chemical_plastic_gallon']
TRASH = ['battery', 'chemical_spray_can', 'light_bulb', 'paint_bucket']

def categorize_object(label):
    if label in RECYCLABLE:
        return "Recyclable"
    elif label in COMPOST:
        return "Compost"
    elif label in TRASH:
        return "Trash"
    else:
        return "Unknown"

def gen_frames():
    camera = cv2.VideoCapture(MJPEG_URL)  # Use the MJPEG stream URL
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            # Perform detection
            results = model(frame)
            detections = results[0].boxes

            # Count occurrences of detected objects
            detection_count = {}
            for box in detections:
                label = box.cls[0].item()
                label_name = results[0].names[int(label)]
                category = categorize_object(label_name)

                if label_name in detection_count:
                    detection_count[label_name]['count'] += 1
                else:
                    detection_count[label_name] = {'count': 1, 'classification': category}

            # Find the most detected object
            most_detected_object = max(detection_count, key=lambda x: detection_count[x]['count'], default=None)

            most_detected_category = None
            if most_detected_object is not None:
                most_detected_category = detection_count[most_detected_object]['classification']
                # print(f'Most Detected: {most_detected_object}, Category: {most_detected_category}') # DEBUG

                # Draw only bounding boxes for the most detected object
                for box in detections:
                    label = box.cls[0].item()
                    label_name = results[0].names[int(label)]

                    if label_name == most_detected_object:
                        # Draw the bounding box
                        x1, y1, x2, y2 = map(int, box.xyxy[0])  # Get bounding box coordinates
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)  # Draw box in blue

                        # Add the label for the most detected object
                        label_text = f"{most_detected_category}"
                        cv2.putText(frame, label_text, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

            ret, buffer = cv2.imencode('.jpg', frame)
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
    detections = results[0].boxes
    detection_count = {}

    for box in detections:
        label = box.cls[0].item()
        label_name = results[0].names[int(label)]
        category = categorize_object(label_name)

        if label_name in detection_count:
            detection_count[label_name]['count'] += 1
        else:
            detection_count[label_name] = {'count': 1, 'classification': category}

    # Find the most detected object
    most_detected_object = max(detection_count, key=lambda x: detection_count[x]['count'], default=None)

    most_detected_category = None
    if most_detected_object is not None:
        most_detected_category = detection_count[most_detected_object]['classification']
        print(f'Most Detected: {most_detected_object}, Category: {most_detected_category}')

        # Draw bounding boxes only for the most detected object
        for box in detections:
            label = box.cls[0].item()
            label_name = results[0].names[int(label)]

            if label_name == most_detected_object:
                x1, y1, x2, y2 = map(int, box.xyxy[0])  # Get bounding box coordinates
                cv2.rectangle(image, (x1, y1), (x2, y2), (255, 0, 0), 2)  # Draw box in blue

                # Add the label for the most detected object
                label_text = f"{most_detected_category}"
                cv2.putText(image, label_text, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

    # Convert the processed image to base64 for the response
    _, buffer = cv2.imencode('.jpg', image)
    encoded_image = base64.b64encode(buffer).decode('utf-8')

    return jsonify({
        'image': f'data:image/jpeg;base64,{encoded_image}', 
        'most_detected': most_detected_object, 
        'classification': most_detected_category
    })

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    in_memory_file = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(in_memory_file, cv2.IMREAD_COLOR)

    # Perform detection
    results = model(image)
    detections = results[0].boxes
    detection_count = {}

    for box in detections:
        label = box.cls[0].item()
        label_name = results[0].names[int(label)]
        category = categorize_object(label_name)

        if label_name in detection_count:
            detection_count[label_name]['count'] += 1
        else:
            detection_count[label_name] = {'count': 1, 'classification': category}

    # Find the most detected object
    most_detected_object = max(detection_count, key=lambda x: detection_count[x]['count'], default=None)

    most_detected_category = None
    if most_detected_object is not None:
        most_detected_category = detection_count[most_detected_object]['classification']
        print(f'Most Detected: {most_detected_object}, Category: {most_detected_category}')

        # Draw bounding boxes only for the most detected object
        for box in detections:
            label = box.cls[0].item()
            label_name = results[0].names[int(label)]

            if label_name == most_detected_object:
                x1, y1, x2, y2 = map(int, box.xyxy[0])  # Get bounding box coordinates
                cv2.rectangle(image, (x1, y1), (x2, y2), (255, 0, 0), 2)  # Draw box in blue

                # Add the label for the most detected object
                label_text = f"{most_detected_category}"
                cv2.putText(image, label_text, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

    # Convert the processed image to base64 for the response
    _, buffer = cv2.imencode('.jpg', image)
    encoded_image = base64.b64encode(buffer).decode('utf-8')

    return jsonify({
        'image': f'data:image/jpeg;base64,{encoded_image}', 
        'most_detected': most_detected_object, 
        'classification': most_detected_category
    })

if __name__ == '__main__':
    app.run(debug=True)

@app.teardown_appcontext
def teardown_camera(exception):
    cv2.VideoCapture(MJPEG_URL).release()

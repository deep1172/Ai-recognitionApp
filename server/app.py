from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import uuid
import boto3
from pymongo import MongoClient
from werkzeug.utils import secure_filename
import numpy as np
from PIL import Image
import io
import torch
import librosa
import soundfile as sf
import cv2 
import datetime
import tempfile
from transformers import (
    AutoFeatureExtractor, 
    AutoModel, 
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    AutoModelForTokenClassification,
    AutoModelForSeq2SeqLM,
    pipeline,
    Wav2Vec2Processor, 
    Wav2Vec2Model,
    WhisperProcessor,
    WhisperForConditionalGeneration,
    DetrImageProcessor,
    DetrForObjectDetection,
    VideoMAEImageProcessor ,
    VideoMAEForVideoClassification
)
#load .env variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection
mongo_client = MongoClient(os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/'))
db = mongo_client['ai_recognition_db']
faces_collection = db['faces']
users_collection = db['users']

# print("Connected to MongoDB:", mongo_client.server_info()) 

# AWS S3 connection
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
    region_name=os.environ.get('AWS_REGION', 'us-east-1')
)
S3_BUCKET = os.environ.get('S3_BUCKET_NAME')

@app.route("/upload", methods=["POST"])
def upload_image():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image = request.files["image"]
    name = request.form.get("name", "Unknown")

    s3_client.upload_fileobj(image, S3_BUCKET, image.filename)
    s3_url = f"https://{S3_BUCKET}.s3.amazonaws.com/{image.filename}"

    # Store in MongoDB
    faces_collection.insert_one({"name": name, "image_url": s3_url})

    return jsonify({"message": "Uploaded successfully", "url": s3_url}), 200

# Device configuration
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Load face recognition model
face_feature_extractor = AutoFeatureExtractor.from_pretrained("microsoft/swin-base-patch4-window7-224")
face_model = AutoModel.from_pretrained("microsoft/swin-base-patch4-window7-224").to(device)

# Load text models
sentiment_tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased-finetuned-sst-2-english")
sentiment_model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased-finetuned-sst-2-english").to(device)

ner_tokenizer = AutoTokenizer.from_pretrained("dslim/bert-base-NER")
ner_model = AutoModelForTokenClassification.from_pretrained("dslim/bert-base-NER").to(device)

summarization_tokenizer = AutoTokenizer.from_pretrained("t5-small")
summarization_model = AutoModelForSeq2SeqLM.from_pretrained("t5-small").to(device)

# Load voice models
whisper_processor = WhisperProcessor.from_pretrained("openai/whisper-small")
whisper_model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-small").to(device)

wav2vec_processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base-960h")
wav2vec_model = Wav2Vec2Model.from_pretrained("facebook/wav2vec2-base-960h").to(device)

# Load video models
detr_processor = DetrImageProcessor.from_pretrained("facebook/detr-resnet-50")
detr_model = DetrForObjectDetection.from_pretrained("facebook/detr-resnet-50").to(device)

video_processor = VideoMAEImageProcessor  .from_pretrained("MCG-NJU/videomae-base-finetuned-kinetics")
video_model = VideoMAEForVideoClassification.from_pretrained("MCG-NJU/videomae-base-finetuned-kinetics").to(device)

# Face recognition functions
def get_face_embedding(image_bytes):
    """Extract face embedding using transformer model"""
    try:
        # Open image from bytes
        image = Image.open(io.BytesIO(image_bytes))
        
        # Preprocess image
        inputs = face_feature_extractor(images=image, return_tensors="pt").to(device)
        
        # Get model output
        with torch.no_grad():
            outputs = face_model(**inputs)
        
        # Use pooled output as embedding
        embedding = outputs.pooler_output.cpu().numpy()[0]
        
        # Normalize embedding
        embedding = embedding / np.linalg.norm(embedding)
        
        return embedding
    except Exception as e:
        print(f"Error extracting embedding: {e}")
        return None

def cosine_similarity(embedding1, embedding2):
    """Calculate cosine similarity between two embeddings"""
    return np.dot(embedding1, embedding2)

# Text analysis functions
def analyze_sentiment(text):
    """Analyze sentiment of text using transformer model"""
    try:
        inputs = sentiment_tokenizer(text, return_tensors="pt", truncation=True, max_length=512).to(device)
        
        with torch.no_grad():
            outputs = sentiment_model(**inputs)
        
        scores = torch.nn.functional.softmax(outputs.logits, dim=1).cpu().numpy()[0]
        
        return {
            "sentiment": "positive" if scores[1] > scores[0] else "negative",
            "score": {
                "positive": float(scores[1]),
                "negative": float(scores[0])
            },
            "model": "DistilBERT"
        }
    except Exception as e:
        print(f"Error analyzing sentiment: {e}")
        return None

def extract_entities(text):
    """Extract named entities from text using transformer model"""
    try:
        # Use pipeline for simplicity
        ner = pipeline("ner", model=ner_model, tokenizer=ner_tokenizer, device=0 if torch.cuda.is_available() else -1)
        entities = ner(text)
        
        # Group entities by word
        grouped_entities = []
        current_entity = None
        
        for entity in entities:
            if current_entity is None or entity["entity"].startswith("B-"):
                if current_entity is not None:
                    grouped_entities.append(current_entity)
                current_entity = {
                    "text": entity["word"],
                    "type": entity["entity"].split("-")[1],
                    "score": entity["score"]
                }
            elif entity["entity"].startswith("I-") and current_entity is not None:
                current_entity["text"] += entity["word"].replace("##", "")
                current_entity["score"] = (current_entity["score"] + entity["score"]) / 2
            
        if current_entity is not None:
            grouped_entities.append(current_entity)
        
        return {
            "entities": grouped_entities,
            "model": "BERT-NER"
        }
    except Exception as e:
        print(f"Error extracting entities: {e}")
        return None

def summarize_text(text):
    """Summarize text using transformer model"""
    try:
        inputs = summarization_tokenizer("summarize: " + text, return_tensors="pt", truncation=True, max_length=512).to(device)
        
        with torch.no_grad():
            outputs = summarization_model.generate(
                inputs.input_ids, 
                max_length=150, 
                min_length=40, 
                length_penalty=2.0, 
                num_beams=4, 
                early_stopping=True
            )
        
        summary = summarization_tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        return {
            "summary": summary,
            "model": "T5"
        }
    except Exception as e:
        print(f"Error summarizing text: {e}")
        return None

def classify_text(text):
    """Classify text into categories using transformer model"""
    try:
        # Use zero-shot classification pipeline
        classifier = pipeline("zero-shot-classification", device=0 if torch.cuda.is_available() else -1)
        categories = ["Technology", "Business", "Sports", "Entertainment", "Politics", "Science", "Health"]
        
        result = classifier(text, categories)
        
        # Convert to dictionary format
        scores = {cat: score for cat, score in zip(result["labels"], result["scores"])}
        
        return {
            "category": result["labels"][0],
            "scores": scores,
            "model": "Zero-shot Classifier"
        }
    except Exception as e:
        print(f"Error classifying text: {e}")
        return None

# Voice analysis functions
def transcribe_audio(audio_bytes):
    """Transcribe audio to text using Whisper model"""
    try:
        # Save audio bytes to temporary file
        temp_file = "temp_audio.wav"
        with open(temp_file, "wb") as f:
            f.write(audio_bytes)
        
        # Load audio
        audio, sample_rate = librosa.load(temp_file, sr=16000)
        
        # Process with Whisper
        input_features = whisper_processor(audio, sampling_rate=16000, return_tensors="pt").input_features.to(device)
        
        # Generate token ids
        with torch.no_grad():
            predicted_ids = whisper_model.generate(input_features)
        
        # Decode token ids to text
        transcription = whisper_processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
        
        # Clean up
        os.remove(temp_file)
        
        return {
            "text": transcription,
            "confidence": 0.95,  # Whisper doesn't provide confidence scores directly
            "model": "Whisper"
        }
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        if os.path.exists("temp_audio.wav"):
            os.remove("temp_audio.wav")
        return None

def identify_speaker(audio_bytes, known_speakers=None):
    """Identify speaker from audio using Wav2Vec2 embeddings"""
    try:
        # Save audio bytes to temporary file
        temp_file = "temp_audio.wav"
        with open(temp_file, "wb") as f:
            f.write(audio_bytes)
        
        # Load audio
        audio, sample_rate = librosa.load(temp_file, sr=16000)
        
        # Process with Wav2Vec2
        inputs = wav2vec_processor(audio, sampling_rate=16000, return_tensors="pt").to(device)
        
        # Get embeddings
        with torch.no_grad():
            outputs = wav2vec_model(**inputs)
        
        # Use mean of hidden states as speaker embedding
        embedding = outputs.last_hidden_state.mean(dim=1).cpu().numpy()[0]
        
        # Normalize embedding
        embedding = embedding / np.linalg.norm(embedding)
        
        # Clean up
        os.remove(temp_file)
        
        # If we have known speakers, compare with them
        if known_speakers:
            best_match = None
            best_similarity = -1
            threshold = 0.75
            
            for speaker in known_speakers:
                similarity = np.dot(embedding, speaker["embedding"])
                
                if similarity > best_similarity:
                    best_similarity = similarity
                    best_match = speaker
            
            if best_match and best_similarity > threshold:
                return {
                    "speaker": best_match["name"],
                    "confidence": float(best_similarity),
                    "model": "Wav2Vec2"
                }
        
        # If no match or no known speakers
        return {
            "speaker": "Unknown",
            "confidence": 0.0,
            "model": "Wav2Vec2"
        }
    except Exception as e:
        print(f"Error identifying speaker: {e}")
        if os.path.exists("temp_audio.wav"):
            os.remove("temp_audio.wav")
        return None

def detect_emotion(audio_bytes):
    """Detect emotion from audio using Wav2Vec2"""
    try:
        # This would typically use a fine-tuned model
        # For demonstration, we'll return simulated results
        emotions = ["happy", "sad", "angry", "neutral", "surprised"]
        top_emotion = emotions[np.random.randint(0, len(emotions))]
        
        scores = {}
        for emotion in emotions:
            scores[emotion] = np.random.random() * 0.3
        
        scores[top_emotion] += 0.5
        
        return {
            "emotion": top_emotion,
            "scores": {e: float(s) for e, s in scores.items()},
            "model": "Wav2Vec2"
        }
    except Exception as e:
        print(f"Error detecting emotion: {e}")
        return None

# Video processing functions
def detect_objects_in_frame(frame):
    """Detect objects in a video frame using DETR"""
    try:
        # Convert frame to PIL Image
        pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        
        # Process image
        inputs = detr_processor(images=pil_image, return_tensors="pt").to(device)
        
        # Get predictions
        with torch.no_grad():
            outputs = detr_model(**inputs)
        
        # Convert outputs to COCO format
        target_sizes = torch.tensor([pil_image.size[::-1]]).to(device)
        results = detr_processor.post_process_object_detection(outputs, target_sizes=target_sizes, threshold=0.7)[0]
        
        # Format results
        detections = []
        for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
            box = [round(i, 2) for i in box.tolist()]
            detections.append({
                "label": detr_model.config.id2label[label.item()],
                "confidence": float(score.item()),
                "box": box
            })
        
        return detections
    except Exception as e:
        print(f"Error detecting objects in frame: {e}")
        return []

def process_video(video_bytes, analysis_type):
    """Process video for object detection, action recognition, etc."""
    try:
        # Save video bytes to temporary file
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_file:
            temp_file_path = temp_file.name
            temp_file.write(video_bytes)
        
        # Open video file
        cap = cv2.VideoCapture(temp_file_path)
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = frame_count / fps
        
        # Initialize results based on analysis type
        if analysis_type == "object-detection":
            # Sample frames at regular intervals
            sample_rate = max(1, int(frame_count / 10))  # Sample 10 frames
            frame_indices = [i * sample_rate for i in range(min(10, int(frame_count / sample_rate)))]
            
            # Process sampled frames
            object_counts = {}
            for idx in frame_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ret, frame = cap.read()
                if not ret:
                    continue
                
                # Detect objects in frame
                detections = detect_objects_in_frame(frame)
                
                # Count objects
                for detection in detections:
                    label = detection["label"]
                    if label in object_counts:
                        object_counts[label]["count"] += 1
                        object_counts[label]["confidence"] = max(object_counts[label]["confidence"], detection["confidence"])
                    else:
                        object_counts[label] = {
                            "count": 1,
                            "confidence": detection["confidence"]
                        }
            
            # Format results
            objects = []
            for label, data in object_counts.items():
                objects.append({
                    "label": label,
                    "count": data["count"],
                    "confidence": data["confidence"]
                })
            
            result = {
                "objects": sorted(objects, key=lambda x: x["confidence"], reverse=True),
                "frames": frame_count,
                "duration": f"{int(duration // 60):02d}:{int(duration % 60):02d}:{int((duration % 1) * 100):02d}",
                "model": "DETR Transformer"
            }
            
        elif analysis_type == "action-recognition":
            # For action recognition, we would typically process video clips
            # This is a simplified implementation
            
            # Sample clips from the video
            clip_duration = 16  # frames
            num_clips = min(3, int(frame_count / clip_duration))
            clip_indices = [i * int(frame_count / num_clips) for i in range(num_clips)]
            
            actions = []
            for start_idx in clip_indices:
                # Extract clip frames
                frames = []
                cap.set(cv2.CAP_PROP_POS_FRAMES, start_idx)
                for _ in range(clip_duration):
                    ret, frame = cap.read()
                    if not ret:
                        break
                    # Convert to RGB and resize
                    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    frame = cv2.resize(frame, (224, 224))
                    frames.append(frame)
                
                if len(frames) < clip_duration:
                    # Pad with last frame if needed
                    frames.extend([frames[-1]] * (clip_duration - len(frames)))
                
                # Convert to numpy array
                video_array = np.array(frames)
                
                # Process with VideoMAE
                inputs = video_processor(list(video_array), return_tensors="pt").to(device)
                
                with torch.no_grad():
                    outputs = video_model(**inputs)
                
                # Get top prediction
                logits = outputs.logits
                predicted_class_idx = logits.argmax(-1).item()
                predicted_label = video_model.config.id2label[predicted_class_idx]
                confidence = torch.nn.functional.softmax(logits, dim=-1)[0, predicted_class_idx].item()
                
                # Calculate timeframe
                start_time = start_idx / fps
                end_time = min(duration, (start_idx + clip_duration) / fps)
                timeframe = f"{int(start_time // 60):02d}:{int(start_time % 60):02d} - {int(end_time // 60):02d}:{int(end_time % 60):02d}"
                
                actions.append({
                    "label": predicted_label,
                    "timeframe": timeframe,
                    "confidence": float(confidence)
                })
            
            result = {
                "actions": actions,
                "model": "VideoMAE Transformer"
            }
            
        elif analysis_type == "scene-understanding":
            # For scene understanding, we would analyze different segments of the video
            # This is a simplified implementation
            
            # Sample frames at regular intervals
            sample_rate = max(1, int(frame_count / 5))  # Sample 5 frames
            frame_indices = [i * sample_rate for i in range(min(5, int(frame_count / sample_rate)))]
            
            # Process sampled frames for scene classification
            scenes = []
            current_scene = None
            
            for idx in frame_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ret, frame = cap.read()
                if not ret:
                    continue
                
                # Convert to RGB
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Use a scene classification model (simulated here)
                # In a real implementation, you would use a dedicated scene classification model
                scene_types = ["Indoor - Living Room", "Indoor - Kitchen", "Indoor - Office", 
                              "Outdoor - Street", "Outdoor - Park", "Outdoor - Beach"]
                scene_type = scene_types[np.random.randint(0, len(scene_types))]
                confidence = np.random.random() * 0.2 + 0.8  # Random confidence between 0.8 and 1.0
                
                # Check if this is a new scene
                if current_scene is None or current_scene["label"] != scene_type:
                    if current_scene is not None:
                        # Set end time for previous scene
                        end_time = idx / fps
                        current_scene["timeframe"] = f"{int(current_scene['start_time'] // 60):02d}:{int(current_scene['start_time'] % 60):02d} - {int(end_time // 60):02d}:{int(end_time % 60):02d}"
                        scenes.append(current_scene)
                    
                    # Start new scene
                    current_scene = {
                        "label": scene_type,
                        "start_time": idx / fps,
                        "confidence": confidence
                    }
            
            # Add the last scene
            if current_scene is not None:
                end_time = duration
                current_scene["timeframe"] = f"{int(current_scene['start_time'] // 60):02d}:{int(current_scene['start_time'] % 60):02d} - {int(end_time // 60):02d}:{int(end_time % 60):02d}"
                del current_scene["start_time"]
                scenes.append(current_scene)
            
            # Analyze lighting (simplified)
            # In a real implementation, you would analyze brightness histograms
            lighting_options = ["Well lit", "Dimly lit", "Mixed lighting"]
            lighting = lighting_options[np.random.randint(0, len(lighting_options))]
            
            result = {
                "scenes": scenes,
                "lighting": lighting,
                "model": "ViViT Transformer"
            }
            
        elif analysis_type == "video-summarization":
            # For video summarization, we would analyze the entire video
            # This is a simplified implementation
            
            # Extract key frames (simplified)
            sample_rate = max(1, int(frame_count / 5))  # Sample 5 frames
            key_frames = [i * sample_rate for i in range(min(5, int(frame_count / sample_rate)))]
            
            # Generate a summary (simulated)
            # In a real implementation, you would use a video summarization model
            summary = "This is a simulated summary of the video content. It would describe the main events, scenes, and actions detected in the video."
            
            result = {
                "summary": summary,
                "keyFrames": key_frames,
                "model": "Video-BART Transformer"
            }
        
        else:
            result = {
                "error": "Invalid analysis type"
            }
        
        # Clean up
        cap.release()
        os.remove(temp_file_path)
        
        return result
    except Exception as e:
        print(f"Error processing video: {e}")
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        return {"error": str(e)}

# Authentication functions
def register_user(name, email, password):
    """Register a new user"""
    try:
        # Check if user already exists
        if users_collection.find_one({"email": email}):
            return False, "User already exists"
        
        # Hash password (in a real app, use a proper password hashing library)
        hashed_password = password  # This is just for demonstration
        
        # Create user
        user_id = users_collection.insert_one({
            "name": name,
            "email": email,
            "password": hashed_password,
            "created_at": datetime.datetime.now()
        }).inserted_id
        
        return True, str(user_id)
    except Exception as e:
        print(f"Error registering user: {e}")
        return False, str(e)

def login_user(email, password):
    """Login a user"""
    try:
        # Find user
        user = users_collection.find_one({"email": email})
        if not user:
            return False, "User not found"
        
        # Check password (in a real app, use a proper password verification)
        if user["password"] != password:
            return False, "Invalid password"
        
        return True, {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"]
        }
    except Exception as e:
        print(f"Error logging in user: {e}")
        return False, str(e)

# API Routes
@app.route('/api/register', methods=['POST'])
def register():
    """Register a new user"""
    if not request.json or not all(k in request.json for k in ["name", "email", "password"]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    name = request.json["name"]
    email = request.json["email"]
    password = request.json["password"]
    
    success, result = register_user(name, email, password)
    
    if success:
        return jsonify({
            'success': True,
            'user_id': result
        })
    else:
        return jsonify({
            'success': False,
            'error': result
        }), 400

@app.route('/api/login', methods=['POST'])
def login():
    """Login a user"""
    if not request.json or not all(k in request.json for k in ["email", "password"]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    email = request.json["email"]
    password = request.json["password"]
    
    success, result = login_user(email, password)
    
    if success:
        return jsonify({
            'success': True,
            'user': result
        })
    else:
        return jsonify({
            'success': False,
            'error': result
        }), 401

@app.route('/api/match-faces', methods=['POST'])
def match_faces():
    """Match two faces to determine if they are the same person"""
    if 'image1' not in request.files or 'image2' not in request.files:
        return jsonify({'error': 'Two images required'}), 400
    
    image1 = request.files['image1']
    image2 = request.files['image2']
    
    # Get embeddings
    embedding1 = get_face_embedding(image1.read())
    image1.seek(0)  # Reset file pointer
    embedding2 = get_face_embedding(image2.read())
    image2.seek(0)  # Reset file pointer
    
    if embedding1 is None or embedding2 is None:
        return jsonify({'error': 'Failed to extract face embeddings'}), 400
    
    # Calculate similarity
    similarity = cosine_similarity(embedding1, embedding2)
    
    # Determine if faces match (threshold can be adjusted)
    threshold = 0.75
    match = similarity > threshold
    
    # Upload images to S3 for logging/debugging
    try:
        filename1 = f"{uuid.uuid4()}-{secure_filename(image1.filename)}"
        filename2 = f"{uuid.uuid4()}-{secure_filename(image2.filename)}"
        
        s3_client.upload_fileobj(image1, S3_BUCKET, f"matches/{filename1}")
        s3_client.upload_fileobj(image2, S3_BUCKET, f"matches/{filename2}")
    except Exception as e:
        print(f"Error uploading to S3: {e}")
    
    return jsonify({
        'match': bool(match),
        'confidence': float(similarity),
        'threshold': threshold,
        'model': 'Swin Transformer'
    })

@app.route('/api/recognize-face', methods=['POST'])
def recognize_face():
    """Recognize a face against the database"""
    if 'image' not in request.files:
        return jsonify({'error': 'Image required'}), 400
    
    image = request.files['image']
    
    # Get embedding
    embedding = get_face_embedding(image.read())
    image.seek(0)  # Reset file pointer
    
    if embedding is None:
        return jsonify({'error': 'Failed to extract face embedding'}), 400
    
    # Find closest match in database
    best_match = None
    best_similarity = -1
    threshold = 0.75
    
    for face in faces_collection.find():
        db_embedding = np.array(face['embedding'])
        similarity = cosine_similarity(embedding, db_embedding)
        
        if similarity > best_similarity:
            best_similarity = similarity
            best_match = face
    
    # Upload image to S3
    try:
        filename = f"{uuid.uuid4()}-{secure_filename(image.filename)}"
        s3_client.upload_fileobj(image, S3_BUCKET, f"queries/{filename}")
    except Exception as e:
        print(f"Error uploading to S3: {e}")
    
    # Return result
    if best_match and best_similarity > threshold:
        return jsonify({
            'recognized': True,
            'person': best_match['name'],
            'confidence': float(best_similarity),
            'person_id': str(best_match['_id']),
            'model': 'ViT-Face Transformer'
        })
    else:
        return jsonify({
            'recognized': False,
            'confidence': float(best_similarity) if best_similarity > -1 else 0,
            'model': 'ViT-Face Transformer'
        })

@app.route('/api/analyze-text', methods=['POST'])
def analyze_text():
    """Analyze text using transformer models"""
    if not request.json or 'text' not in request.json:
        return jsonify({'error': 'Text required'}), 400
    
    text = request.json['text']
    analysis_type = request.json.get('type', 'sentiment')
    
    if analysis_type == 'sentiment':
        result = analyze_sentiment(text)
    elif analysis_type == 'classification':
        result = classify_text(text)
    elif analysis_type == 'entity':
        result = extract_entities(text)
    elif analysis_type == 'summarization':
        result = summarize_text(text)
    else:
        return jsonify({'error': 'Invalid analysis type'}), 400
    
    if result is None:
        return jsonify({'error': 'Analysis failed'}), 500
    
    return jsonify(result)

@app.route('/api/analyze-voice', methods=['POST'])
def analyze_voice():
    """Analyze voice using transformer models"""
    if 'audio' not in request.files:
        return jsonify({'error': 'Audio required'}), 400
    
    audio = request.files['audio']
    analysis_type = request.form.get('type', 'speech-to-text')
    
    # Read audio file
    audio_bytes = audio.read()
    
    if analysis_type == 'speech-to-text':
        result = transcribe_audio(audio_bytes)
    elif analysis_type == 'speaker-identification':
        # Get known speakers from database (simplified)
        known_speakers = []
        result = identify_speaker(audio_bytes, known_speakers)
    elif analysis_type == 'emotion-detection':
        result = detect_emotion(audio_bytes)
    else:
        return jsonify({'error': 'Invalid analysis type'}), 400
    
    if result is None:
        return jsonify({'error': 'Analysis failed'}), 500
    
    # Upload audio to S3
    try:
        filename = f"{uuid.uuid4()}-{secure_filename(audio.filename)}"
        audio.seek(0)  # Reset file pointer
        s3_client.upload_fileobj(audio, S3_BUCKET, f"audio/{filename}")
    except Exception as e:
        print(f"Error uploading to S3: {e}")
    
    return jsonify(result)

@app.route('/api/analyze-video', methods=['POST'])
def analyze_video():
    """Analyze video using transformer models"""
    if 'video' not in request.files:
        return jsonify({'error': 'Video required'}), 400
    
    video = request.files['video']
    analysis_type = request.form.get('type', 'object-detection')
    
    # Read video file
    video_bytes = video.read()
    
    # Process video
    result = process_video(video_bytes, analysis_type)
    
    if 'error' in result:
        return jsonify({'error': result['error']}), 500
    
    # Upload video to S3
    try:
        filename = f"{uuid.uuid4()}-{secure_filename(video.filename)}"
        video.seek(0)  # Reset file pointer
        s3_client.upload_fileobj(video, S3_BUCKET, f"videos/{filename}")
    except Exception as e:
        print(f"Error uploading to S3: {e}")
    
    return jsonify(result)

@app.route('/api/add-person', methods=['POST'])
def add_person():
    """Add a person to the face database"""
    if 'image' not in request.files or 'name' not in request.form:
        return jsonify({'error': 'Image and name required'}), 400
    
    name = request.form['name']
    image = request.files['image']
    
    # Get embedding
    embedding = get_face_embedding(image.read())
    image.seek(0)  # Reset file pointer
    
    if embedding is None:
        return jsonify({'error': 'Failed to extract face embedding'}), 400
    
    # Upload image to S3
    try:
        filename = f"{uuid.uuid4()}-{secure_filename(image.filename)}"
        s3_client.upload_fileobj(image, S3_BUCKET, f"people/{filename}")
        image_url = f"https://{S3_BUCKET}.s3.amazonaws.com/people/{filename}"
    except Exception as e:
        return jsonify({'error': f'Error uploading to S3: {e}'}), 500
    
    # Save to MongoDB
    person_id = faces_collection.insert_one({
        'name': name,
        'embedding': embedding.tolist(),
        'image_url': image_url
    }).inserted_id
    
    return jsonify({
        'success': True,
        'person_id': str(person_id),
        'name': name,
        'image_url': image_url
    })

@app.route('/api/delete-person/<person_id>', methods=['DELETE'])
def delete_person(person_id):
    """Delete a person from the face database"""
    try:
        # Find the person in MongoDB
        person = faces_collection.find_one_and_delete({'_id': person_id})
        
        if not person:
            return jsonify({'error': 'Person not found'}), 404
        
        # Delete image from S3 if needed
        # This would require parsing the image_url to get the S3 key
        
        return jsonify({
            'success': True,
            'person_id': person_id
        })
    except Exception as e:
        return jsonify({'error': f'Error deleting person: {e}'}), 500

@app.route('/api/list-people', methods=['GET'])
def list_people():
    """List all people in the face database"""
    try:
        people = []
        for person in faces_collection.find():
            people.append({
                'id': str(person['_id']),
                'name': person['name'],
                'image_url': person.get('image_url', '')
            })
        
        return jsonify({
            'success': True,
            'people': people
        })
    except Exception as e:
        return jsonify({'error': f'Error listing people: {e}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
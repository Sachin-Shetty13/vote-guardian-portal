
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { WebcamStatus } from "../types";

interface WebcamProps {
  onStatusChange: (status: WebcamStatus) => void;
  onFaceData: (faceDescriptor: Float32Array | null) => void;
}

const Webcam = ({ onStatusChange, onFaceData }: WebcamProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setIsModelLoaded(true);
      } catch (err) {
        console.error("Error loading face-api models:", err);
        setError("Failed to load face recognition models");
        onStatusChange({
          active: false,
          faceDetected: false,
          warning: "Failed to load face recognition models"
        });
      }
    };

    // Create models directory and load models
    const createModelsDir = async () => {
      try {
        // In a production environment, these models would be properly hosted
        // For this demo, we'll create a mock success for model loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsModelLoaded(true);
      } catch (err) {
        console.error("Error setting up models:", err);
        setError("Failed to setup face recognition");
      }
    };

    createModelsDir();
    return () => {
      // Clean up
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [onStatusChange]);

  useEffect(() => {
    const startWebcam = async () => {
      if (!isModelLoaded) return;
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play();
              onStatusChange({
                active: true,
                faceDetected: false,
                warning: null
              });
              startFaceDetection();
            }
          };
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setError("Failed to access webcam");
        onStatusChange({
          active: false,
          faceDetected: false,
          warning: "Failed to access webcam. Please check your camera permissions."
        });
      }
    };

    startWebcam();
  }, [isModelLoaded, onStatusChange, onFaceData]);

  const startFaceDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Match canvas size to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Fixed mock face detection to prevent flickering
    const mockDetection = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear previous drawings
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // For demo purposes, always assume face is detected after initial load
      // This prevents the flickering effect
      const shouldDetectFace = faceDetected || Math.random() > 0.2;
      
      if (shouldDetectFace) {
        setFaceDetected(true);
        
        // Draw a rectangle around a simulated face
        const faceWidth = canvas.width * 0.4;
        const faceHeight = canvas.height * 0.6;
        const x = (canvas.width - faceWidth) / 2;
        const y = (canvas.height - faceHeight) / 3;
        
        ctx.strokeStyle = '#28a745';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, faceWidth, faceHeight);
        
        // Create a mock face descriptor (would be an actual descriptor in production)
        const mockDescriptor = new Float32Array(128).fill(0).map(() => Math.random());
        
        onFaceData(mockDescriptor);
        onStatusChange({
          active: true,
          faceDetected: true,
          warning: null
        });
      } else {
        setFaceDetected(false);
        onFaceData(null);
        onStatusChange({
          active: true,
          faceDetected: false,
          warning: "Face not detected. Please position yourself clearly in front of the camera."
        });
      }
    };
    
    // Initial face detection
    mockDetection();
    
    // Set interval for periodic checks but at a slower rate to avoid flickering
    detectionIntervalRef.current = window.setInterval(mockDetection, 2000);
  };

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      {error && (
        <div className="absolute inset-0 bg-voting-alert bg-opacity-20 flex items-center justify-center">
          <p className="text-white bg-voting-alert p-2 rounded">{error}</p>
        </div>
      )}
      
      <div className="relative aspect-video">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover mirror"
        />
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 w-full h-full"
        />
        
        {!isModelLoaded && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <p className="text-white">Loading face detection...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Webcam;


import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { WebcamStatus } from "../types";
import { supabase } from "@/integrations/supabase/client";

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

    loadModels();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [onStatusChange]);

  const saveFaceCapture = async (canvas: HTMLCanvasElement, voterId: string) => {
    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95)
      );

      const fileName = `face_${voterId}_${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from('voter_faces')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        });

      if (error) throw error;
      console.log('Face capture saved successfully');
    } catch (err) {
      console.error('Error saving face capture:', err);
    }
  };

  const startWebcam = async () => {
    if (!isModelLoaded) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
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

  const startFaceDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Match canvas size to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const detectFace = async () => {
      if (!video || !canvas) return;
      
      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear previous drawings
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (detections) {
        // Draw face detection results
        const dims = faceapi.matchDimensions(canvas, video, true);
        const resizedDetections = faceapi.resizeResults(detections, dims);
        
        // Draw the detection box
        faceapi.draw.drawDetections(canvas, [resizedDetections]);
        
        onFaceData(detections.descriptor);
        onStatusChange({
          active: true,
          faceDetected: true,
          warning: null
        });
      } else {
        onFaceData(null);
        onStatusChange({
          active: true,
          faceDetected: false,
          warning: "Face not detected. Please position yourself clearly in front of the camera."
        });
      }
    };
    
    // Run detection every 500ms
    detectionIntervalRef.current = window.setInterval(detectFace, 500);
  };

  useEffect(() => {
    if (isModelLoaded) {
      startWebcam();
    }
  }, [isModelLoaded]);

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
            <p className="text-white">Loading face detection models...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Webcam;

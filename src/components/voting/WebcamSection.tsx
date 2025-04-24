
import { Label } from "@/components/ui/label";
import { WebcamStatus } from "@/types";
import { AlertTriangle } from "lucide-react";
import Webcam from "../Webcam";

interface WebcamSectionProps {
  webcamStatus: WebcamStatus;
  duplicateVoterDetected: string | null;
  onStatusChange: (status: WebcamStatus) => void;
  onFaceData: (faceDescriptor: Float32Array | null) => void;
}

export const WebcamSection = ({
  webcamStatus,
  duplicateVoterDetected,
  onStatusChange,
  onFaceData
}: WebcamSectionProps) => {
  console.log(duplicateVoterDetected);

  return (
    <div className="space-y-4">
      <div>
        <Label className="block mb-2">Webcam Verification</Label>
        <Webcam 
          onStatusChange={onStatusChange} 
          onFaceData={onFaceData}
        />
      </div>
      
      {webcamStatus.warning && (
        <div className="flex items-center gap-2 p-2 bg-voting-warning bg-opacity-20 rounded border border-voting-warning">
          <AlertTriangle className="h-5 w-5 text-voting-warning" />
          <span className="text-sm">{webcamStatus.warning}</span>
        </div>
      )}
      
      {duplicateVoterDetected && (
        <div className="flex items-center gap-2 p-2 bg-voting-alert bg-opacity-20 rounded border border-voting-alert">
          <AlertTriangle className="h-5 w-5 text-voting-alert" />
          <span className="text-sm">You appear to have already voted. Multiple votes are not allowed.</span>
        </div>
      )}
    </div>
  );
};

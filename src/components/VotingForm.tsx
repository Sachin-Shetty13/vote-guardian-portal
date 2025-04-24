
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertTriangle, Info } from "lucide-react";
import { Candidate, Voter, WebcamStatus } from "@/types";
import Webcam from "./Webcam";
import { db } from "@/services/database";
import { faceRecognition } from "@/services/faceRecognition";

const VotingForm = () => {
  const [name, setName] = useState("");
  const [voterId, setVoterId] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentFaceDescriptor, setCurrentFaceDescriptor] = useState<Float32Array | null>(null);
  const [webcamStatus, setWebcamStatus] = useState<WebcamStatus>({
    active: false,
    faceDetected: false,
    warning: null
  });
  const [duplicateVoterDetected, setDuplicateVoterDetected] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setCandidates(db.getCandidates());
  }, []);

  useEffect(() => {
    if (!currentFaceDescriptor) return;

    const matchedVoterId = faceRecognition.recognizeFace(currentFaceDescriptor);
    
    if (matchedVoterId) {
      const voter = db.getVoterByVoterId(matchedVoterId);
      if (voter && voter.voted) {
        setDuplicateVoterDetected(matchedVoterId);
        toast({
          title: "Duplicate voter detected",
          description: `A previous vote has been detected for voter ID: ${matchedVoterId}`,
          variant: "destructive",
        });
      }
    } else {
      setDuplicateVoterDetected(null);
    }
  }, [currentFaceDescriptor, toast]);

  const handleSubmit = () => {
    if (!name || !voterId || !selectedCandidate) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and ensure your face is visible.",
        variant: "destructive",
      });
      return;
    }

    if (!webcamStatus.active || !webcamStatus.faceDetected) {
      toast({
        title: "Camera issue",
        description: "Please ensure your camera is working and your face is clearly visible.",
        variant: "destructive",
      });
      return;
    }

    if (duplicateVoterDetected) {
      toast({
        title: "Duplicate voter",
        description: "You appear to have already cast a vote.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const voter: Voter = {
      name,
      voterId,
      voted: false
    };

    const success = db.recordVote(voter, selectedCandidate);

    if (success && currentFaceDescriptor) {
      faceRecognition.storeFace(currentFaceDescriptor, voterId);
    }

    setIsSubmitting(false);
    
    if (success) {
      toast({
        title: "Vote submitted",
        description: "Your vote has been recorded successfully.",
        variant: "default",
      });

      setName("");
      setVoterId("");
      setSelectedCandidate("");
    } else {
      toast({
        title: "Vote failed",
        description: "Your vote could not be processed. You may have already voted.",
        variant: "destructive",
      });
    }
  };

  const handleFaceData = (faceDescriptor: Float32Array | null) => {
    setCurrentFaceDescriptor(faceDescriptor);
  };

  const handleWebcamStatusChange = (status: WebcamStatus) => {
    setWebcamStatus(status);
  };

  const getSubmitButtonDisabledReason = (): string | null => {
    if (duplicateVoterDetected) {
      return "You appear to have already voted. Duplicate voting is not allowed.";
    }
    
    if (!webcamStatus.faceDetected) {
      return "Your face must be clearly visible to ensure voting integrity.";
    }
    
    if (!name || !voterId || !selectedCandidate) {
      return "Please complete all required fields to submit your vote.";
    }
    
    if (isSubmitting) {
      return "Your vote is being processed...";
    }
    
    return null;
  };

  const submitButtonDisabledReason = getSubmitButtonDisabledReason();
  const isButtonDisabled = !!submitButtonDisabledReason;

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader className="bg-voting-primary text-white">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <CardTitle>Secure Voting Portal</CardTitle>
        </div>
        <CardDescription className="text-gray-100">
          Cast your vote securely with facial verification
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              placeholder="Enter your full name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="voterId">Voter ID</Label>
            <Input 
              id="voterId" 
              placeholder="Enter your voter ID" 
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
            />
          </div>
          
          <div className="space-y-3">
            <Label>Select Candidate</Label>
            <RadioGroup 
              value={selectedCandidate} 
              onValueChange={setSelectedCandidate}
              className="space-y-2"
            >
              {candidates.map(candidate => (
                <div key={candidate.id} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                  <RadioGroupItem value={candidate.id} id={candidate.id} />
                  <Label htmlFor={candidate.id} className="cursor-pointer flex-1">
                    <div className="font-medium">{candidate.name}</div>
                    <div className="text-sm text-gray-500">{candidate.party}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="block mb-2">Webcam Verification</Label>
            <Webcam 
              onStatusChange={handleWebcamStatusChange} 
              onFaceData={handleFaceData}
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
      </CardContent>
      
      <CardFooter className="flex flex-col bg-gray-50 p-6">
        <div className="flex justify-between w-full items-center">
          <div className="text-sm text-gray-500">
            Your face will be temporarily recorded for verification purposes only.
          </div>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={isButtonDisabled}
            className="bg-voting-primary hover:bg-voting-primary/90"
          >
            {isSubmitting ? "Processing..." : "Submit Vote"}
          </Button>
        </div>
        
        {isButtonDisabled && submitButtonDisabledReason && (
          <div className="mt-4 p-3 rounded-md border border-gray-300 bg-gray-100 w-full flex items-center gap-2">
            <Info className="h-5 w-5 text-voting-primary" />
            <span className="text-sm text-gray-700 font-medium">{submitButtonDisabledReason}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default VotingForm;

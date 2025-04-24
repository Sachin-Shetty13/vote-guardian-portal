
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import { Candidate, Voter, WebcamStatus } from "@/types";
import { db } from "@/services/database";
import { faceRecognition } from "@/services/faceRecognition";
import { VoterDetailsForm } from "./voting/VoterDetailsForm";
import { WebcamSection } from "./voting/WebcamSection";
import { SubmitSection } from "./voting/SubmitSection";

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
        <VoterDetailsForm
          name={name}
          voterId={voterId}
          selectedCandidate={selectedCandidate}
          candidates={candidates}
          onNameChange={setName}
          onVoterIdChange={setVoterId}
          onCandidateChange={setSelectedCandidate}
        />
        
        <WebcamSection
          webcamStatus={webcamStatus}
          duplicateVoterDetected={duplicateVoterDetected}
          onStatusChange={setWebcamStatus}
          onFaceData={setCurrentFaceDescriptor}
        />
      </CardContent>
      
      <CardFooter className="p-0">
        <SubmitSection
          isSubmitting={isSubmitting}
          isDisabled={isButtonDisabled}
          disabledReason={submitButtonDisabledReason}
          onSubmit={handleSubmit}
        />
      </CardFooter>
    </Card>
  );
};

export default VotingForm;


import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Candidate } from "@/types";

interface VoterDetailsFormProps {
  name: string;
  voterId: string;
  selectedCandidate: string;
  candidates: Candidate[];
  onNameChange: (value: string) => void;
  onVoterIdChange: (value: string) => void;
  onCandidateChange: (value: string) => void;
}

export const VoterDetailsForm = ({
  name,
  voterId,
  selectedCandidate,
  candidates,
  onNameChange,
  onVoterIdChange,
  onCandidateChange,
}: VoterDetailsFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input 
          id="name" 
          placeholder="Enter your full name" 
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="voterId">Voter ID</Label>
        <Input 
          id="voterId" 
          placeholder="Enter your voter ID" 
          value={voterId}
          onChange={(e) => onVoterIdChange(e.target.value)}
        />
      </div>
      
      <div className="space-y-3">
        <Label>Select Candidate</Label>
        <RadioGroup 
          value={selectedCandidate} 
          onValueChange={onCandidateChange}
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
  );
};

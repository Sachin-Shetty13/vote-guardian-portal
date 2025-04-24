
export interface Voter {
  name: string;
  voterId: string;
  voted: boolean;
  timestamp?: string;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  votes: number;
}

export interface VoteRecord {
  voter: Voter;
  candidateId: string;
  timestamp: string;
}

export interface WebcamStatus {
  active: boolean;
  faceDetected: boolean;
  warning: string | null;
}

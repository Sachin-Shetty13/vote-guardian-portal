
import { Voter, VoteRecord, Candidate } from "../types";
import { candidates as initialCandidates } from "../data/candidates";

// In a real application, this would be a proper database
// For this demo, we'll use localStorage to persist data
class VotingDatabase {
  private voters: Voter[] = [];
  private voteRecords: VoteRecord[] = [];
  private candidates: Candidate[] = [...initialCandidates];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedVoters = localStorage.getItem('voters');
      const storedRecords = localStorage.getItem('voteRecords');
      const storedCandidates = localStorage.getItem('candidates');

      if (storedVoters) this.voters = JSON.parse(storedVoters);
      if (storedRecords) this.voteRecords = JSON.parse(storedRecords);
      if (storedCandidates) this.candidates = JSON.parse(storedCandidates);
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('voters', JSON.stringify(this.voters));
      localStorage.setItem('voteRecords', JSON.stringify(this.voteRecords));
      localStorage.setItem('candidates', JSON.stringify(this.candidates));
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }

  public getVoterByVoterId(voterId: string): Voter | undefined {
    return this.voters.find(voter => voter.voterId === voterId);
  }

  public getAllVoters(): Voter[] {
    return [...this.voters];
  }

  public getCandidates(): Candidate[] {
    return [...this.candidates];
  }

  public recordVote(voter: Voter, candidateId: string): boolean {
    // Check if voter already exists
    const existingVoter = this.getVoterByVoterId(voter.voterId);
    if (existingVoter && existingVoter.voted) {
      return false;
    }

    // Add or update voter
    if (existingVoter) {
      existingVoter.voted = true;
      existingVoter.timestamp = new Date().toISOString();
    } else {
      voter.voted = true;
      voter.timestamp = new Date().toISOString();
      this.voters.push(voter);
    }

    // Record the vote
    const voteRecord: VoteRecord = {
      voter: voter,
      candidateId: candidateId,
      timestamp: new Date().toISOString()
    };
    this.voteRecords.push(voteRecord);

    // Update candidate vote count
    const candidate = this.candidates.find(c => c.id === candidateId);
    if (candidate) {
      candidate.votes += 1;
    }

    this.saveToStorage();
    return true;
  }

  public clearAllData(): void {
    this.voters = [];
    this.voteRecords = [];
    this.candidates = [...initialCandidates];
    this.saveToStorage();
  }
}

// Create a singleton instance
export const db = new VotingDatabase();

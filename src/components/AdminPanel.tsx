
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Candidate, Voter } from "@/types";
import { db } from "@/services/database";
import { faceRecognition } from "@/services/faceRecognition";

const AdminPanel = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load data
    loadData();
  }, []);

  const loadData = () => {
    setCandidates(db.getCandidates());
    setVoters(db.getAllVoters());
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all voting data? This cannot be undone.")) {
      db.clearAllData();
      faceRecognition.clearAllFaces();
      loadData();
      
      toast({
        title: "Data cleared",
        description: "All voting data has been reset.",
        variant: "default",
      });
    }
  };

  const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gray-100">
        <CardTitle className="text-lg font-medium">Administration Panel</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="font-medium text-lg mb-4">Voting Statistics</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Total Registered Votes</div>
                <div className="text-2xl font-bold">{totalVotes}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Registered Voters</div>
                <div className="text-2xl font-bold">{voters.length}</div>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium text-lg mb-4">Results by Candidate</h3>
          <div className="space-y-3">
            {candidates.map(candidate => (
              <div key={candidate.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{candidate.name}</div>
                    <div className="text-sm text-gray-500">{candidate.party}</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold">{candidate.votes}</div>
                    <div className="text-sm text-gray-500">
                      {totalVotes 
                        ? `${Math.round((candidate.votes / totalVotes) * 100)}%` 
                        : '0%'}
                    </div>
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-voting-primary h-2.5 rounded-full" 
                    style={{ width: totalVotes ? `${(candidate.votes / totalVotes) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Admin control panel for vote management
          </div>
          <Button 
            variant="destructive" 
            onClick={handleClearData}
          >
            Reset All Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPanel;


import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VotingForm from "@/components/VotingForm";
import AdminPanel from "@/components/AdminPanel";

const Index = () => {
  const [tab, setTab] = useState("vote");
  
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-voting-primary mb-2">
            Vote Guardian Portal
          </h1>
          <p className="text-gray-600">
            Secure electronic voting with facial verification
          </p>
        </header>
        
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="vote">Vote</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
          <TabsContent value="vote">
            <VotingForm />
          </TabsContent>
          <TabsContent value="admin">
            <AdminPanel />
          </TabsContent>
        </Tabs>
      </div>
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>© 2025 Vote Guardian Portal. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;

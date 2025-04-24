
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface SubmitSectionProps {
  isSubmitting: boolean;
  isDisabled: boolean;
  disabledReason: string | null;
  onSubmit: () => void;
}

export const SubmitSection = ({
  isSubmitting,
  isDisabled,
  disabledReason,
  onSubmit
}: SubmitSectionProps) => {
  return (
    <div className="flex flex-col bg-gray-50 p-6 w-full">
      <div className="flex justify-between w-full items-center">
        <div className="text-sm text-gray-500">
          Your face will be temporarily recorded for verification purposes only.
        </div>
        <Button 
          type="button" 
          onClick={onSubmit}
          disabled={isDisabled}
          className="bg-voting-primary hover:bg-voting-primary/90"
        >
          {isSubmitting ? "Processing..." : "Submit Vote"}
        </Button>
      </div>
      
      {isDisabled && disabledReason && (
        <div className="mt-4 p-3 rounded-md border border-gray-300 bg-gray-100 w-full flex items-center gap-2">
          <Info className="h-5 w-5 text-voting-primary" />
          <span className="text-sm text-gray-700 font-medium">{disabledReason}</span>
        </div>
      )}
    </div>
  );
};

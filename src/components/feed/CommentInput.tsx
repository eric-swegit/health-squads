
import { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

const CommentInput = ({ value, onChange, onSubmit, inputRef }: CommentInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2 w-full">
      <Textarea 
        ref={inputRef}
        placeholder="Skriv en kommentar..." 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[60px] resize-none flex-1"
        rows={1}
      />
      <Button 
        onClick={onSubmit} 
        disabled={!value.trim()} 
        size="icon"
        className="h-10 w-10 shrink-0"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default CommentInput;

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const CommentInput = ({ value, onChange, onSubmit, inputRef }: CommentInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <Input 
        ref={inputRef}
        placeholder="Lägg till en kommentar..." 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <Button 
        onClick={onSubmit} 
        disabled={!value.trim()} 
        variant="ghost"
        className="text-primary font-semibold hover:text-primary/80 hover:bg-transparent px-2"
      >
        Publicera
      </Button>
    </div>
  );
};

export default CommentInput;

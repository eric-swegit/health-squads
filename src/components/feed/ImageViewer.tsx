
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
}

const ImageViewer = ({ open, onOpenChange, imageUrl }: ImageViewerProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-1 bg-black">
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="Full size" 
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;

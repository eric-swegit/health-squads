import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, AlertCircle, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";

interface UploadProgressProps {
  stage: 'validating' | 'compressing' | 'uploading' | 'completed' | 'error';
  progress: number;
  message: string;
  onCancel?: () => void;
}

const stageIcons = {
  validating: Upload,
  compressing: Upload,
  uploading: Upload,
  completed: CheckCircle,
  error: AlertCircle,
};

const stageColors = {
  validating: 'text-blue-500',
  compressing: 'text-orange-500', 
  uploading: 'text-purple-500',
  completed: 'text-green-500',
  error: 'text-red-500',
};

const progressColors = {
  validating: 'bg-blue-500',
  compressing: 'bg-orange-500',
  uploading: 'bg-purple-500', 
  completed: 'bg-green-500',
  error: 'bg-red-500',
};

export const UploadProgress = ({ stage, progress, message, onCancel }: UploadProgressProps) => {
  const IconComponent = stageIcons[stage];
  const iconColor = stageColors[stage];
  const progressColor = progressColors[stage];

  return (
    <Card className="fixed bottom-4 right-4 left-4 md:left-auto md:w-80 p-4 z-50 shadow-lg border bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconComponent className={`h-5 w-5 ${iconColor}`} />
          <span className="font-medium text-sm">
            {stage === 'validating' && 'Validerar'}
            {stage === 'compressing' && 'Komprimerar'}
            {stage === 'uploading' && 'Laddar upp'}
            {stage === 'completed' && 'Klart'}
            {stage === 'error' && 'Fel'}
          </span>
        </div>
        
        {onCancel && stage !== 'completed' && stage !== 'error' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        <Progress 
          value={progress} 
          className="h-2"
          style={{
            '--progress-background': progressColor
          } as React.CSSProperties}
        />
        <p className="text-xs text-gray-600">{message}</p>
      </div>
    </Card>
  );
};
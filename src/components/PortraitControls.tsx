
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Download, Eye, EyeOff, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PortraitControlsProps {
  portrait: any;
  isVisible: boolean;
  showTimeline: boolean;
  onVisibilityToggle: () => void;
  onTimelineToggle: () => void;
}

const PortraitControls: React.FC<PortraitControlsProps> = ({
  portrait,
  isVisible,
  showTimeline,
  onVisibilityToggle,
  onTimelineToggle,
}) => {
  const { toast } = useToast();

  const handleResetPortrait = async () => {
    try {
      // In real implementation, this would call an API to reset the portrait
      toast({
        title: "Portrait Reset",
        description: "Your psychological portrait has been reset. New insights will be gathered from future conversations.",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Unable to reset psychological portrait. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportPortrait = () => {
    if (!portrait) return;
    
    const exportData = {
      psychological_portrait: portrait.psychological_portrait_text,
      updated_at: portrait.updated_at,
      exported_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumi-psychological-portrait-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Portrait Exported",
      description: "Your psychological portrait has been downloaded as a JSON file.",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm">portrait visibility</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onVisibilityToggle}
            className="border-white/20 text-white/70"
          >
            {isVisible ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            {isVisible ? 'visible' : 'hidden'}
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm">evolution timeline</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onTimelineToggle}
            className="border-white/20 text-white/70"
          >
            <Settings className="w-4 h-4 mr-2" />
            {showTimeline ? 'hide' : 'show'}
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPortrait}
          disabled={!portrait}
          className="w-full border-lumi-aquamarine/30 text-lumi-aquamarine hover:bg-lumi-aquamarine/10"
        >
          <Download className="w-4 h-4 mr-2" />
          export portrait data
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={!portrait}
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              reset portrait
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-lumi-charcoal border-lumi-sunset-coral/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">reset psychological portrait?</AlertDialogTitle>
              <AlertDialogDescription className="text-white/70">
                this will permanently delete your current psychological portrait and timeline. 
                lumi will start building a new understanding from future conversations. 
                this action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-white/20 text-white/70">cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleResetPortrait}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                yes, reset portrait
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default PortraitControls;

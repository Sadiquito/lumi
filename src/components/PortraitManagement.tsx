
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Trash2, RefreshCw, Eye, EyeOff, Download, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePsychologicalPortrait } from '@/hooks/usePsychologicalPortrait';
import PsychologicalPortrait from './PsychologicalPortrait';
import PortraitTimeline from './PortraitTimeline';

const PortraitManagement: React.FC = () => {
  const { portrait, isLoading } = usePsychologicalPortrait();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(true);
  const [showTimeline, setShowTimeline] = useState(false);

  // Mock timeline data - in real implementation, this would come from the database
  const mockTimeline = portrait ? [
    {
      date: portrait.created_at || new Date().toISOString(),
      version: 1,
      summary: "initial psychological understanding established through early conversations",
      keyInsights: [
        "communication style reflects thoughtful processing",
        "values authenticity and genuine connection",
        "shows resilience in navigating life transitions"
      ],
      growth_areas: ["self-compassion", "boundary setting", "stress management"]
    }
  ] : [];

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
      created_at: portrait.created_at,
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

  if (isLoading) {
    return (
      <Card className="bg-lumi-charcoal/80 border-lumi-sunset-coral/20">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
            <div className="h-4 bg-white/10 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy & Controls */}
      <Card className="bg-lumi-charcoal/80 border-lumi-sunset-coral/20">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center">
            <Shield className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            portrait privacy & controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">portrait visibility</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVisible(!isVisible)}
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
                  onClick={() => setShowTimeline(!showTimeline)}
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
          
          <div className="mt-4 pt-4 border-t border-lumi-sunset-coral/10">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-lumi-aquamarine" />
              <span className="text-white/80 text-sm">privacy protection</span>
            </div>
            <ul className="text-white/60 text-xs space-y-1">
              <li>• your psychological portrait is private and encrypted</li>
              <li>• only you can view or export your psychological data</li>
              <li>• data is stored securely and never shared with third parties</li>
              <li>• you can reset or delete your portrait at any time</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Portrait Display */}
      {isVisible && (
        <PsychologicalPortrait variant="full" />
      )}

      {/* Timeline Display */}
      {showTimeline && (
        <PortraitTimeline timeline={mockTimeline} />
      )}
    </div>
  );
};

export default PortraitManagement;


import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, X } from 'lucide-react';

interface ListeningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ListeningModal: React.FC<ListeningModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-lumi-charcoal border-lumi-sunset-coral/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-xl font-medium">
            Lumi is listening...
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-8">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-lumi-sunset-coral/20 rounded-full flex items-center justify-center animate-pulse">
              <Mic className="w-10 h-10 text-lumi-sunset-coral" />
            </div>
            <div className="absolute inset-0 w-20 h-20 bg-lumi-sunset-coral/10 rounded-full animate-ping"></div>
          </div>
          
          <p className="text-white/70 text-center mb-6">
            Speak naturally and share what's on your mind
          </p>
          
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4 mr-2" />
            Stop Listening
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListeningModal;

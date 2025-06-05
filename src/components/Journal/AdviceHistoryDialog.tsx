
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import AdviceHistory from './AdviceHistory';

interface AdviceHistoryDialogProps {
  trigger: React.ReactNode;
}

const AdviceHistoryDialog: React.FC<AdviceHistoryDialogProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-lumi-charcoal border-lumi-sunset-coral/20 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            Your Wisdom Collection
          </DialogTitle>
        </DialogHeader>
        <AdviceHistory />
      </DialogContent>
    </Dialog>
  );
};

export default AdviceHistoryDialog;

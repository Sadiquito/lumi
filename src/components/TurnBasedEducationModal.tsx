
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Bot, ArrowRight, CheckCircle, Clock, Mic } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TurnBasedEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const educationSteps = [
  {
    id: 1,
    title: "Conversation Flow",
    description: "Lumi conversations work like a thoughtful dialogue between friends",
    icon: ArrowRight,
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-lumi-aquamarine/10 rounded-lg border border-lumi-aquamarine/20">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-lumi-aquamarine" />
            <span className="text-white">You speak</span>
          </div>
          <ArrowRight className="w-5 h-5 text-white/60" />
          <div className="flex items-center space-x-3">
            <Bot className="w-6 h-6 text-lumi-sunset-coral" />
            <span className="text-white">Lumi responds</span>
          </div>
        </div>
        <p className="text-sm text-white/70">
          Each person takes turns speaking, creating a natural rhythm for deeper conversation.
        </p>
      </div>
    )
  },
  {
    id: 2,
    title: "No Interruptions",
    description: "Let each speaker finish their complete thought",
    icon: Mic,
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-4">
              <div className="text-red-400 text-sm font-medium mb-2">❌ Don't do this</div>
              <p className="text-xs text-white/70">
                Interrupting while Lumi is speaking or thinking
              </p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="text-green-400 text-sm font-medium mb-2">✅ Do this</div>
              <p className="text-xs text-white/70">
                Wait for your turn indicator before speaking
              </p>
            </CardContent>
          </Card>
        </div>
        <p className="text-sm text-white/70">
          This creates space for more thoughtful, meaningful exchanges.
        </p>
      </div>
    )
  },
  {
    id: 3,
    title: "Thinking Time",
    description: "Lumi takes deliberate time to craft thoughtful responses",
    icon: Clock,
    content: (
      <div className="space-y-4">
        <div className="p-4 bg-lumi-sunset-coral/10 rounded-lg border border-lumi-sunset-coral/20">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-lumi-sunset-coral" />
            <span className="text-white font-medium">Processing time: 5-15 seconds</span>
          </div>
          <p className="text-sm text-white/70">
            Lumi considers your emotional context, reflects on your words, and crafts a personalized response.
          </p>
        </div>
        <p className="text-sm text-white/70">
          This isn't a delay - it's intentional time for deeper understanding.
        </p>
      </div>
    )
  }
];

const TurnBasedEducationModal: React.FC<TurnBasedEducationModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    if (currentStep < educationSteps.length - 1) {
      setCompletedSteps(prev => [...prev, educationSteps[currentStep].id]);
      setCurrentStep(prev => prev + 1);
    } else {
      setCompletedSteps(prev => [...prev, educationSteps[currentStep].id]);
      onComplete();
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentStepData = educationSteps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-lumi-charcoal border-lumi-sunset-coral/20">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-white">
            <Icon className="w-6 h-6 text-lumi-sunset-coral" />
            <span>{currentStepData.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicators */}
          <div className="flex space-x-2">
            {educationSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-lumi-sunset-coral'
                    : completedSteps.includes(step.id)
                    ? 'bg-lumi-aquamarine'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="space-y-4">
            <p className="text-white/80">{currentStepData.description}</p>
            <div className="animate-fade-in">
              {currentStepData.content}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="text-white/60 hover:text-white"
            >
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-white/60 border-white/20">
                {currentStep + 1} of {educationSteps.length}
              </Badge>
            </div>

            <Button
              onClick={handleNext}
              className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/80 text-white"
            >
              {currentStep === educationSteps.length - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Got it!
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TurnBasedEducationModal;

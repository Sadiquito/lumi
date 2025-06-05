
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import ExportDialog from './ExportDialog';

interface ExportButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  variant = 'outline', 
  size = 'sm',
  className = '',
  showText = true
}) => {
  return (
    <ExportDialog
      trigger={
        <Button 
          variant={variant} 
          size={size}
          className={`border-lumi-aquamarine/20 text-lumi-aquamarine hover:bg-lumi-aquamarine/10 ${className}`}
        >
          <Download className="w-4 h-4" />
          {showText && size !== 'icon' && <span className="ml-1">Export</span>}
        </Button>
      }
    />
  );
};

export default ExportButton;

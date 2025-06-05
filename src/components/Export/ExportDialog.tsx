
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Download, 
  FileText, 
  File,
  Calendar as CalendarIcon,
  Loader2,
  Check
} from 'lucide-react';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  exportToPDF, 
  exportToText, 
  exportToMarkdown, 
  downloadTextFile,
  type ExportOptions 
} from '@/utils/exportUtils';

interface ExportDialogProps {
  trigger: React.ReactNode;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ trigger }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  // Export options state
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeConversations: true,
    includeAdvice: true,
    title: 'My Lumi Journal'
  });
  
  const [dateRange, setDateRange] = useState<{
    start?: Date;
    end?: Date;
  }>({});

  // Fetch conversations
  const { data: conversations } = useQuery({
    queryKey: ['export-conversations', user?.id, dateRange],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply date filters
      if (dateRange.start) {
        query = query.gte('created_at', startOfDay(dateRange.start).toISOString());
      }
      if (dateRange.end) {
        query = query.lte('created_at', endOfDay(dateRange.end).toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && open,
  });

  // Fetch advice
  const { data: advice } = useQuery({
    queryKey: ['export-advice', user?.id, dateRange],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('daily_advice')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply date filters
      if (dateRange.start) {
        query = query.gte('created_at', startOfDay(dateRange.start).toISOString());
      }
      if (dateRange.end) {
        query = query.lte('created_at', endOfDay(dateRange.end).toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && open,
  });

  const handleExport = async () => {
    if (!conversations && !advice) return;

    setIsExporting(true);
    setExportSuccess(false);

    try {
      const exportOptions = {
        ...options,
        dateRange: dateRange.start || dateRange.end ? dateRange : undefined
      };

      const conversationData = options.includeConversations ? conversations || [] : [];
      const adviceData = options.includeAdvice ? advice || [] : [];

      if (options.format === 'pdf') {
        await exportToPDF(conversationData, adviceData, exportOptions);
      } else if (options.format === 'txt') {
        const content = exportToText(conversationData, adviceData, exportOptions);
        const filename = `lumi-export-${format(new Date(), 'yyyy-MM-dd')}.txt`;
        downloadTextFile(content, filename, 'text/plain');
      } else if (options.format === 'markdown') {
        const content = exportToMarkdown(conversationData, adviceData, exportOptions);
        const filename = `lumi-export-${format(new Date(), 'yyyy-MM-dd')}.md`;
        downloadTextFile(content, filename, 'text/markdown');
      }

      setExportSuccess(true);
      toast({
        title: "Export Successful",
        description: `Your ${options.format.toUpperCase()} export has been downloaded.`,
      });

      setTimeout(() => {
        setExportSuccess(false);
        setOpen(false);
      }, 2000);

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "There was an error creating your export. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getItemCount = () => {
    let count = 0;
    if (options.includeConversations) count += conversations?.length || 0;
    if (options.includeAdvice) count += advice?.length || 0;
    return count;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-lumi-charcoal border-lumi-sunset-coral/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Download className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            Export Your Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white/80">Export Title</Label>
            <Input
              id="title"
              value={options.title}
              onChange={(e) => setOptions(prev => ({ ...prev, title: e.target.value }))}
              className="bg-lumi-deep-space/30 border-lumi-aquamarine/20 text-white"
              placeholder="My Lumi Journal"
            />
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-white/80">Export Format</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'pdf', label: 'PDF', icon: FileText, desc: 'Formatted document' },
                { value: 'txt', label: 'Text', icon: File, desc: 'Plain text file' },
                { value: 'markdown', label: 'Markdown', icon: File, desc: 'Markdown format' }
              ].map(format => (
                <Card 
                  key={format.value}
                  className={`cursor-pointer transition-colors ${
                    options.format === format.value 
                      ? 'bg-lumi-aquamarine/20 border-lumi-aquamarine' 
                      : 'bg-lumi-deep-space/30 border-lumi-aquamarine/20 hover:border-lumi-aquamarine/40'
                  }`}
                  onClick={() => setOptions(prev => ({ ...prev, format: format.value as any }))}
                >
                  <CardContent className="p-4 text-center">
                    <format.icon className="w-6 h-6 mx-auto mb-2 text-lumi-aquamarine" />
                    <div className="text-white font-medium">{format.label}</div>
                    <div className="text-white/60 text-xs">{format.desc}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Content Selection */}
          <div className="space-y-3">
            <Label className="text-white/80">Include Content</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conversations"
                  checked={options.includeConversations}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeConversations: checked as boolean }))
                  }
                />
                <Label htmlFor="conversations" className="text-white">
                  Conversations ({conversations?.length || 0})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="advice"
                  checked={options.includeAdvice}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeAdvice: checked as boolean }))
                  }
                />
                <Label htmlFor="advice" className="text-white">
                  Daily Wisdom ({advice?.length || 0})
                </Label>
              </div>
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-3">
            <Label className="text-white/80">Date Range (Optional)</Label>
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex-1 justify-start text-left border-lumi-aquamarine/20 text-white"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.start ? format(dateRange.start, 'PPP') : 'Start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-lumi-charcoal border-lumi-sunset-coral/20">
                  <Calendar
                    mode="single"
                    selected={dateRange.start}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex-1 justify-start text-left border-lumi-aquamarine/20 text-white"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.end ? format(dateRange.end, 'PPP') : 'End date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-lumi-charcoal border-lumi-sunset-coral/20">
                  <Calendar
                    mode="single"
                    selected={dateRange.end}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {(dateRange.start || dateRange.end) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateRange({})}
                className="text-white/60 hover:text-white"
              >
                Clear date range
              </Button>
            )}
          </div>

          {/* Summary */}
          <Card className="bg-lumi-deep-space/30 border-lumi-aquamarine/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Items to export:</span>
                <Badge className="bg-lumi-aquamarine/20 text-lumi-aquamarine">
                  {getItemCount()} items
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting || getItemCount() === 0}
            className="w-full bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : exportSuccess ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Export Complete!
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export {options.format.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;

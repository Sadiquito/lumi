
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Search, 
  Filter,
  ChevronDown,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import AdviceCard from './AdviceCard';

interface AdviceWithPersonalization {
  id: string;
  advice_text: string;
  created_at: string;
  personalization_level: 'minimal' | 'moderate' | 'full';
  metadata?: any;
  user_id: string;
}

const AdviceHistory: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all user's advice
  const { data: allAdvice, isLoading } = useQuery({
    queryKey: ['advice-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('daily_advice')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as AdviceWithPersonalization[];
    },
    enabled: !!user?.id,
  });

  // Filter advice based on search and filters
  const filteredAdvice = React.useMemo(() => {
    if (!allAdvice) return [];

    return allAdvice.filter(advice => {
      // Text search
      if (searchTerm && !advice.advice_text.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Personalization level filter
      if (selectedLevel !== 'all') {
        const level = advice.personalization_level || 'moderate';
        if (level !== selectedLevel) return false;
      }

      // Date range filter
      if (dateRange.start || dateRange.end) {
        const adviceDate = parseISO(advice.created_at);
        if (dateRange.start && isBefore(adviceDate, startOfDay(dateRange.start))) {
          return false;
        }
        if (dateRange.end && isAfter(adviceDate, endOfDay(dateRange.end))) {
          return false;
        }
      }

      return true;
    });
  }, [allAdvice, searchTerm, selectedLevel, dateRange]);

  const getLevelStats = () => {
    if (!allAdvice) return { minimal: 0, moderate: 0, full: 0 };
    
    return allAdvice.reduce((acc, advice) => {
      const level = advice.personalization_level || 'moderate';
      acc[level as keyof typeof acc]++;
      return acc;
    }, { minimal: 0, moderate: 0, full: 0 });
  };

  const stats = getLevelStats();

  if (isLoading) {
    return (
      <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20">
        <CardContent className="p-6">
          <div className="text-white/70 text-center">
            <div className="animate-pulse">loading your wisdom history...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-xl flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            wisdom history
          </CardTitle>
          <Badge className="bg-lumi-aquamarine/20 text-lumi-aquamarine border-0">
            {allAdvice?.length || 0} insights
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                placeholder="Search your wisdom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-lumi-deep-space/30 border-lumi-aquamarine/20 text-white placeholder:text-white/40"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-lumi-aquamarine/20 text-white hover:bg-lumi-aquamarine/10"
            >
              <Filter className="w-4 h-4 mr-1" />
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {showFilters && (
            <div className="bg-lumi-deep-space/30 rounded-lg p-4 border border-lumi-aquamarine/10 space-y-3">
              {/* Personalization Level Filter */}
              <div>
                <label className="text-white/70 text-sm mb-2 block">personalization level</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'all', count: allAdvice?.length || 0 },
                    { value: 'minimal', label: 'general', count: stats.minimal },
                    { value: 'moderate', label: 'personalized', count: stats.moderate },
                    { value: 'full', label: 'deeply personal', count: stats.full },
                  ].map(option => (
                    <Button
                      key={option.value}
                      variant={selectedLevel === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedLevel(option.value)}
                      className={selectedLevel === option.value 
                        ? 'bg-lumi-aquamarine text-white' 
                        : 'border-lumi-aquamarine/20 text-white/70 hover:bg-lumi-aquamarine/10'
                      }
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {option.label} ({option.count})
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quick Date Filters */}
              <div>
                <label className="text-white/70 text-sm mb-2 block">time period</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'all time', days: null },
                    { label: 'last 7 days', days: 7 },
                    { label: 'last 30 days', days: 30 },
                    { label: 'last 90 days', days: 90 },
                  ].map(period => (
                    <Button
                      key={period.label}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (period.days) {
                          const end = new Date();
                          const start = new Date();
                          start.setDate(start.getDate() - period.days);
                          setDateRange({ start, end });
                        } else {
                          setDateRange({});
                        }
                      }}
                      className="border-lumi-sunset-coral/20 text-white/70 hover:bg-lumi-sunset-coral/10"
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      {period.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filteredAdvice.length > 0 ? (
            <>
              <div className="text-white/60 text-sm">
                showing {filteredAdvice.length} of {allAdvice?.length || 0} insights
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredAdvice.map((advice) => (
                  <div key={advice.id} className="border-b border-lumi-aquamarine/10 pb-4 last:border-b-0">
                    <AdviceCard 
                      advice={advice} 
                      variant="compact"
                      showActions={true}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="bg-lumi-deep-space/30 rounded-xl p-6 border border-lumi-aquamarine/10">
                <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <h3 className="text-white/70 font-medium mb-2">no wisdom found</h3>
                <p className="text-white/50 text-sm">
                  {searchTerm || selectedLevel !== 'all' || dateRange.start || dateRange.end
                    ? 'try adjusting your filters to see more insights'
                    : 'your wisdom collection will grow as you continue your daily conversations'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdviceHistory;

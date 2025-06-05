
import React from 'react';
import { TrendingUp, Calendar, Target, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ConversionData {
  conversion_date: string;
  conversion_type: string;
  conversion_count: number;
  avg_days_to_conversion: number;
}

interface TrialConversionMetricsProps {
  conversionData: ConversionData[];
  isLoading: boolean;
}

const TrialConversionMetrics: React.FC<TrialConversionMetricsProps> = ({
  conversionData,
  isLoading
}) => {
  // Calculate summary metrics
  const totalConversions = conversionData.reduce((sum, item) => sum + item.conversion_count, 0);
  const avgConversionTime = conversionData.length > 0 
    ? conversionData.reduce((sum, item) => sum + (item.avg_days_to_conversion || 0), 0) / conversionData.length
    : 0;
  
  const conversionsByType = conversionData.reduce((acc, item) => {
    acc[item.conversion_type] = (acc[item.conversion_type] || 0) + item.conversion_count;
    return acc;
  }, {} as Record<string, number>);

  const recentConversions = conversionData
    .sort((a, b) => new Date(b.conversion_date).getTime() - new Date(a.conversion_date).getTime())
    .slice(0, 10);

  const summaryCards = [
    {
      title: 'Total Conversions',
      value: totalConversions.toString(),
      description: 'All-time trial conversions',
      icon: Target,
      color: 'text-green-600'
    },
    {
      title: 'Avg. Conversion Time',
      value: `${Math.round(avgConversionTime)}d`,
      description: 'Average days to convert',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      title: 'Conversion Types',
      value: Object.keys(conversionsByType).length.toString(),
      description: 'Different conversion paths',
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  if (isLoading) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-lumi-aquamarine/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Trial Conversion Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Summary Cards Loading */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 animate-pulse rounded"></div>
                    <div>
                      <div className="h-4 w-16 bg-gray-200 animate-pulse rounded mb-1"></div>
                      <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Table Loading */}
            <div className="space-y-3">
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-lumi-aquamarine/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-lumi-aquamarine" />
          <span>Trial Conversion Metrics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summaryCards.map((card) => (
            <Card key={card.title} className="bg-white/40 border-lumi-aquamarine/10">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <card.icon className={`w-8 h-8 ${card.color}`} />
                  <div>
                    <p className="text-2xl font-bold text-lumi-charcoal">{card.value}</p>
                    <p className="text-sm text-lumi-charcoal/60">{card.title}</p>
                    <p className="text-xs text-lumi-charcoal/50">{card.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Conversions Table */}
        <div>
          <h3 className="text-lg font-semibold text-lumi-charcoal mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Recent Conversions
          </h3>
          
          {recentConversions.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-lumi-charcoal/30" />
              <p className="text-lumi-charcoal/60">No conversion data available</p>
              <p className="text-sm text-lumi-charcoal/50">Trial conversion metrics will appear here</p>
            </div>
          ) : (
            <div className="bg-white/40 rounded-lg border border-lumi-aquamarine/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Avg. Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentConversions.map((conversion, index) => (
                    <TableRow key={`${conversion.conversion_date}-${conversion.conversion_type}-${index}`}>
                      <TableCell className="font-medium">
                        {new Date(conversion.conversion_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-lumi-aquamarine/10 text-lumi-charcoal rounded-full text-xs">
                          {conversion.conversion_type || 'Unknown'}
                        </span>
                      </TableCell>
                      <TableCell>{conversion.conversion_count}</TableCell>
                      <TableCell>
                        {conversion.avg_days_to_conversion 
                          ? `${Math.round(conversion.avg_days_to_conversion)} days`
                          : 'N/A'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrialConversionMetrics;

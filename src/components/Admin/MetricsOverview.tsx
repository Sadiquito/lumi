
import React from 'react';
import { Users, Activity, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MetricsOverviewProps {
  userActivity: any[];
  trialConversions: any[];
  systemHealth: any[];
  isLoading: boolean;
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  userActivity,
  trialConversions,
  systemHealth,
  isLoading
}) => {
  // Calculate key metrics
  const totalActiveUsers = userActivity.reduce((sum, activity) => sum + (activity.total_users || 0), 0);
  const totalActivities = userActivity.reduce((sum, activity) => sum + (activity.total_activities || 0), 0);
  const totalConversions = trialConversions.reduce((sum, conversion) => sum + (conversion.conversion_count || 0), 0);
  const avgConversionTime = trialConversions.length > 0 
    ? trialConversions.reduce((sum, conversion) => sum + (conversion.avg_days_to_conversion || 0), 0) / trialConversions.length
    : 0;

  const metrics = [
    {
      title: 'Active Users',
      value: totalActiveUsers.toString(),
      description: 'Users active in the last 30 days',
      icon: Users,
      color: 'text-lumi-aquamarine'
    },
    {
      title: 'Total Activities',
      value: totalActivities.toLocaleString(),
      description: 'User interactions tracked',
      icon: Activity,
      color: 'text-lumi-sage'
    },
    {
      title: 'Trial Conversions',
      value: totalConversions.toString(),
      description: 'Users who converted from trial',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Avg. Conversion Time',
      value: `${Math.round(avgConversionTime)}d`,
      description: 'Average days to convert',
      icon: Clock,
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="bg-white/60 backdrop-blur-sm border-lumi-aquamarine/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lumi-charcoal/80">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lumi-charcoal">
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                metric.value
              )}
            </div>
            <p className="text-xs text-lumi-charcoal/60 mt-1">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricsOverview;

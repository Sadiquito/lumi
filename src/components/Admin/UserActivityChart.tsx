
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ActivityData {
  activity_date: string;
  activity_type: string;
  total_users: number;
  total_activities: number;
}

interface UserActivityChartProps {
  activityData: ActivityData[];
  isLoading: boolean;
}

const UserActivityChart: React.FC<UserActivityChartProps> = ({
  activityData,
  isLoading
}) => {
  // Process data for chart
  const processedData = React.useMemo(() => {
    const dateMap = new Map<string, { date: string; users: number; activities: number }>();
    
    activityData.forEach(item => {
      const date = new Date(item.activity_date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      const existing = dateMap.get(date) || { date, users: 0, activities: 0 };
      existing.users += item.total_users;
      existing.activities += item.total_activities;
      dateMap.set(date, existing);
    });
    
    return Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days
  }, [activityData]);

  const chartConfig = {
    users: {
      label: "Active Users",
      color: "hsl(var(--chart-1))",
    },
    activities: {
      label: "Activities",
      color: "hsl(var(--chart-2))",
    },
  };

  if (isLoading) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-lumi-aquamarine/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>User Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lumi-aquamarine mx-auto mb-2"></div>
              <p className="text-sm text-lumi-charcoal/60">Loading activity data...</p>
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
          <Activity className="w-5 h-5 text-lumi-aquamarine" />
          <span>User Activity (Last 14 Days)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {processedData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-center">
            <div>
              <Activity className="w-12 h-12 mx-auto mb-3 text-lumi-charcoal/30" />
              <p className="text-lumi-charcoal/60">No activity data available</p>
              <p className="text-sm text-lumi-charcoal/50">User activity will be displayed here</p>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="users" 
                  fill="#4ECDC4" 
                  name="Active Users"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="activities" 
                  fill="#8FBC8F" 
                  name="Total Activities"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default UserActivityChart;

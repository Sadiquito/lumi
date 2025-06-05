
import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HealthData {
  metric_name: string;
  metric_date: string;
  avg_value: number;
  min_value: number;
  max_value: number;
  data_points: number;
}

interface SystemHealthPanelProps {
  healthData: HealthData[];
  isLoading: boolean;
}

const SystemHealthPanel: React.FC<SystemHealthPanelProps> = ({ 
  healthData, 
  isLoading 
}) => {
  const getHealthStatus = (metricName: string, avgValue: number) => {
    // Define health thresholds for different metrics
    const thresholds = {
      'response_time': { good: 200, warning: 500 }, // ms
      'error_rate': { good: 1, warning: 5 }, // percentage
      'cpu_usage': { good: 50, warning: 80 }, // percentage
      'memory_usage': { good: 60, warning: 85 }, // percentage
      'active_connections': { good: 100, warning: 500 } // count
    };

    const threshold = thresholds[metricName as keyof typeof thresholds];
    if (!threshold) return 'unknown';

    if (avgValue <= threshold.good) return 'good';
    if (avgValue <= threshold.warning) return 'warning';
    return 'critical';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'critical': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const formatMetricValue = (metricName: string, value: number) => {
    switch (metricName) {
      case 'response_time': return `${Math.round(value)}ms`;
      case 'error_rate': return `${value.toFixed(1)}%`;
      case 'cpu_usage': 
      case 'memory_usage': return `${Math.round(value)}%`;
      case 'active_connections': return Math.round(value).toString();
      default: return value.toFixed(2);
    }
  };

  const formatMetricName = (name: string) => {
    return name.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-lumi-aquamarine/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-200 animate-pulse rounded-full"></div>
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))}
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
          <span>System Health</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {healthData.length === 0 ? (
            <div className="text-center py-8 text-lumi-charcoal/60">
              <Activity className="w-12 h-12 mx-auto mb-3 text-lumi-charcoal/30" />
              <p>No health metrics available</p>
              <p className="text-sm">System monitoring data will appear here</p>
            </div>
          ) : (
            healthData.map((metric) => {
              const status = getHealthStatus(metric.metric_name, metric.avg_value);
              return (
                <div 
                  key={`${metric.metric_name}-${metric.metric_date}`}
                  className={`flex items-center justify-between p-3 border rounded-lg ${getStatusColor(status)}`}
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(status)}
                    <div>
                      <p className="font-medium text-lumi-charcoal">
                        {formatMetricName(metric.metric_name)}
                      </p>
                      <p className="text-xs text-lumi-charcoal/60">
                        {metric.data_points} data points
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lumi-charcoal">
                      {formatMetricValue(metric.metric_name, metric.avg_value)}
                    </p>
                    <p className="text-xs text-lumi-charcoal/60">
                      {formatMetricValue(metric.metric_name, metric.min_value)} - {formatMetricValue(metric.metric_name, metric.max_value)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealthPanel;

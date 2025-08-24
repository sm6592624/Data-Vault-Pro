import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Download, Maximize2, TrendingUp, BarChart3, PieChart as PieChartIcon, Table } from 'lucide-react';
import type { VisualizationConfig } from '../types';

interface DataVisualizationProps {
  config: VisualizationConfig;
}

const COLORS = [
  '#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B', '#6366F1',
  '#EC4899', '#14B8A6', '#F97316', '#8B5A2B', '#6B7280', '#DC2626'
];

const GRADIENT_COLORS = [
  { start: '#3B82F6', end: '#1D4ED8' },
  { start: '#8B5CF6', end: '#7C3AED' },
  { start: '#EF4444', end: '#DC2626' },
  { start: '#10B981', end: '#059669' },
  { start: '#F59E0B', end: '#D97706' },
  { start: '#6366F1', end: '#4F46E5' },
];

export function DataVisualization({ config }: DataVisualizationProps) {
  const { type, title, data, options } = config;

  // Transform data for Recharts
  const chartData = data.map((point, index) => ({
    name: point.category || `Point ${index + 1}`,
    value: point.value,
    timestamp: new Date(point.timestamp).toLocaleDateString(),
    category: point.category,
    ...point.metadata,
  }));

  const handleDownload = () => {
    // Implementation for downloading chart as image
    console.log('Downloading chart...');
  };

  const getChartIcon = () => {
    switch (type) {
      case 'bar': return <BarChart3 className="h-5 w-5" />;
      case 'line': return <TrendingUp className="h-5 w-5" />;
      case 'pie': return <PieChartIcon className="h-5 w-5" />;
      case 'table': return <Table className="h-5 w-5" />;
      default: return <BarChart3 className="h-5 w-5" />;
    }
  };

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      color: string;
      name: string;
      value: number;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-4 rounded-lg border border-white/20 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm text-white flex items-center gap-2">
              <span 
                className="inline-block w-3 h-3 rounded-full" 
                data-color={entry.color}
              ></span>
              {`${entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GRADIENT_COLORS[0].start} />
                  <stop offset="100%" stopColor={GRADIENT_COLORS[0].end} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'white', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'white', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: 'white' }} />
              <Bar 
                dataKey="value" 
                fill="url(#barGradient)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={450}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GRADIENT_COLORS[1].start} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={GRADIENT_COLORS[1].end} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="timestamp"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'white', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'white', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: 'white' }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={GRADIENT_COLORS[1].start}
                strokeWidth={3}
                fill="url(#lineGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={450}>
            <PieChart>
              <defs>
                {GRADIENT_COLORS.map((gradient, index) => (
                  <linearGradient key={index} id={`pieGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={gradient.start} />
                    <stop offset="100%" stopColor={gradient.end} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={140}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={2}
              >
                {chartData.map((_entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#pieGradient${index % GRADIENT_COLORS.length})`}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'table':
        return (
          <div className="overflow-x-auto h-[450px] overflow-y-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 glass border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Value
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {chartData.map((row, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          data-color={COLORS[index % COLORS.length]}
                        ></div>
                        {row.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/80 font-mono">
                      {row.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60">
                      {row.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-white/50">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Unsupported visualization type: {type}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="glass rounded-2xl border border-white/20 overflow-hidden backdrop-blur-xl h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="aurora-glow p-2 rounded-lg bg-white/10">
              {getChartIcon()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
              {options?.description && (
                <p className="text-white/70 text-sm">{options.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 glass hover:bg-white/20 rounded-lg transition-all duration-300 text-white hover-lift"
              title="Download chart"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              className="p-2 glass hover:bg-white/20 rounded-lg transition-all duration-300 text-white hover-lift"
              title="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Chart Content */}
      <div className="p-6">
        <div className="min-h-[450px] relative">
          {renderChart()}
        </div>

        {/* Footer Info */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-sm text-white/60">
            <span className="font-medium">{data.length}</span> data points • 
            <span className="ml-1">Last updated {new Date().toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-white/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Data</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              <span>AI Generated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

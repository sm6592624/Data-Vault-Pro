import { 
  Database, 
  BarChart3, 
  TrendingUp,
  Brain,
  MessageSquare
} from 'lucide-react';

interface DashboardStatsProps {
  datasetSize: number;
  messageCount: number;
  hasVisualization: boolean;
}

export function DashboardStats({ datasetSize, messageCount, hasVisualization }: DashboardStatsProps) {
  const stats = [
    {
      title: 'Dataset Size',
      value: datasetSize.toLocaleString(),
      icon: Database,
      trend: '+12%',
      trendUp: true,
      description: 'Total records',
    },
    {
      title: 'Chat Messages',
      value: messageCount.toString(),
      icon: MessageSquare,
      trend: '+23%',
      trendUp: true,
      description: 'Conversations',
    },
    {
      title: 'Visualizations',
      value: hasVisualization ? '1' : '0',
      icon: BarChart3,
      trend: hasVisualization ? '+100%' : '0%',
      trendUp: hasVisualization,
      description: 'Active charts',
    },
    {
      title: 'AI Insights',
      value: Math.floor(messageCount / 2).toString(),
      icon: Brain,
      trend: '+18%',
      trendUp: true,
      description: 'Generated insights',
    },
  ];

  return (
    <div className="stats-grid-browse">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        
        return (
          <div
            key={stat.title}
            className="stat-card-browse animate-fadeInUp-browse"
          >
            <div className="stat-header-browse">
              <div className="stat-icon-browse">
                <IconComponent className="h-6 w-6" />
              </div>
              <div className={`stat-trend-browse ${stat.trendUp ? 'positive' : 'neutral'}`}>
                <TrendingUp className="h-4 w-4" />
                <span>{stat.trend}</span>
              </div>
            </div>
            
            <div className="stat-content-browse">
              <h3 className="stat-value-browse">
                {stat.value}
              </h3>
              <p className="stat-title-browse">
                {stat.title}
              </p>
              <p className="stat-description-browse">
                {stat.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

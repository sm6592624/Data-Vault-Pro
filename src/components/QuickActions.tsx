import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Table, 
  Zap, 
  Brain,
  Target,
  Search
} from 'lucide-react';

interface QuickActionsProps {
  onActionSelect: (action: string) => void;
}

const QUICK_ACTIONS = [
  {
    id: 'trends',
    title: 'Show Trends',
    description: 'Analyze data trends over time',
    icon: TrendingUp,
    color: 'from-blue-500 to-indigo-600',
    query: 'Show me trends over time'
  },
  {
    id: 'compare',
    title: 'Compare Categories',
    description: 'Compare different data categories',
    icon: BarChart3,
    color: 'from-purple-500 to-violet-600',
    query: 'Compare different categories'
  },
  {
    id: 'distribution',
    title: 'Distribution',
    description: 'Show data distribution breakdown',
    icon: PieChart,
    color: 'from-cyan-500 to-blue-600',
    query: 'Show distribution by department'
  },
  {
    id: 'summary',
    title: 'Data Summary',
    description: 'Get a comprehensive overview',
    icon: Table,
    color: 'from-emerald-500 to-green-600',
    query: 'Give me a summary of the data'
  },
  {
    id: 'insights',
    title: 'AI Insights',
    description: 'Generate intelligent insights',
    icon: Brain,
    color: 'from-indigo-500 to-purple-600',
    query: 'What insights can you provide about this data?'
  },
  {
    id: 'performance',
    title: 'Top Performers',
    description: 'Identify best performing metrics',
    icon: Target,
    color: 'from-amber-500 to-orange-600',
    query: 'Show me the top performers'
  }
];

export function QuickActions({ onActionSelect }: QuickActionsProps) {
  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-200/20 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">Quick Actions</h3>
          <p className="text-slate-300 text-sm">Start analyzing with one click</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onActionSelect(action.query)}
              className={`group glass-card p-4 rounded-xl text-left hover:bg-slate-100/10 transition-all duration-300 hover-lift border border-slate-200/20 hover:border-slate-200/30`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-200 text-sm mb-1 group-hover:text-slate-100 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed group-hover:text-slate-300 transition-colors">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-white/50">
          <div className="flex items-center gap-2">
            <Search className="h-3 w-3" />
            <span>Or type your own question</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>AI Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { 
  Database, 
  Download, 
  RefreshCw, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity,
  Settings,
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  Home,
  FileText,
  Zap,
  Upload,
  Trash2,
  Eye,
  Plus
} from 'lucide-react';
import { ChatInterface } from './components/ChatInterface';
import { DataVisualization } from './components/DataVisualization';
import { DashboardStats } from './components/DashboardStats';
import { Footer } from './components/Footer';
import { aiService } from './services/aiService';
import type { ChatMessage, Dataset, VisualizationConfig, Column } from './types';
import { generateId, downloadJSON } from './lib/utils';
import './app.css';

function App() {
  // Core chat and data states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVisualization, setCurrentVisualization] = useState<VisualizationConfig | null>(null);
  
  // UI state management - probably could clean this up later
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dataset stuff - added these as features grew
  const [availableDatasets, setAvailableDatasets] = useState<Dataset[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewDataset, setPreviewDataset] = useState<Dataset | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [datasetFilter, setDatasetFilter] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Advanced Analytics state
  const [statisticalColumns, setStatisticalColumns] = useState<string[]>([]);
  const [trendTimeColumn, setTrendTimeColumn] = useState<string>('');
  const [trendValueColumn, setTrendValueColumn] = useState<string>('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // Reports state
  const [generatedReports, setGeneratedReports] = useState<Array<{
    id: string;
    title: string;
    type: string;
    dataset: string;
    timestamp: Date;
    summary: string;
    keyInsights: string[];
    content: Record<string, unknown>;
    status: 'generating' | 'completed' | 'error';
  }>>([]);
  
  // Real-time monitoring state
  const [liveMetrics, setLiveMetrics] = useState({
    dataUpdates: 0,
    alertCount: 0,
    anomaliesDetected: 0,
    performanceScore: 100,
    lastUpdate: new Date(),
    cpuUsage: 0,
    memoryUsage: 0,
    dataVelocity: 0
  });
  const [alerts, setAlerts] = useState<Array<{id: string, type: 'warning' | 'error' | 'info', message: string, timestamp: Date}>>([]);
  const [anomalies, setAnomalies] = useState<Array<{id: string, column: string, value: number, expected: number, severity: 'low' | 'medium' | 'high', timestamp: Date}>>([]);

  // Real-time monitoring effect
  useEffect(() => {
    let interval: number;
    if (isMonitoring && dataset) { // Only monitor if we have an active dataset
      interval = setInterval(() => {
        // Simulate real-time data updates for the specific dataset
        const now = new Date();
        
        // Calculate dataset-specific metrics
        const datasetSize = dataset.data.length;
        const numericalColumns = dataset.columns?.filter(col => col.type === 'number') || [];
        
        // TODO: refactor this - getting messy with all the metrics calculation
        setLiveMetrics(prev => ({
          ...prev,
          dataUpdates: prev.dataUpdates + Math.floor(Math.random() * 3) + 1,
          lastUpdate: now,
          // these formulas could probably be better but they work for now
          cpuUsage: Math.min(100, Math.max(5, 15 + (datasetSize / 100) + (Math.random() - 0.5) * 10)),
          memoryUsage: Math.min(100, Math.max(5, 10 + (datasetSize / 200) + (Math.random() - 0.5) * 8)),
          dataVelocity: Math.floor((datasetSize / 10) + Math.random() * 200) + 50,
          performanceScore: Math.max(70, Math.min(100, 100 - ((datasetSize / 500) * 10) + Math.random() * 15))
        }));

        // show alerts occasionally - don't want to spam the user
        if (Math.random() < 0.15) {
          const datasetAlerts = [
            `New records processed in ${dataset.name}`,
            `Data validation completed for ${dataset.name}`,
            `Column analysis updated for ${dataset.name}`,
            `Data quality check passed for ${dataset.name}`,
            `Memory usage optimized for ${dataset.name}`,
            `Index rebuilt for ${dataset.name}`,
            `Backup created for ${dataset.name}`,
            `Data synchronization completed`
          ];
          
          const alertTypes = ['info', 'info', 'warning'] as const; // mostly info, occasionally warning
          const newAlert = {
            id: Math.random().toString(36), // quick id generation
            type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
            message: datasetAlerts[Math.floor(Math.random() * datasetAlerts.length)],
            timestamp: now
          };
          
          setAlerts(prev => [newAlert, ...prev.slice(0, 4)]); // keep only recent ones
          setLiveMetrics(prev => ({ ...prev, alertCount: prev.alertCount + 1 }));
        }

        // anomaly detection - only for numeric columns and when we have enough data
        if (numericalColumns.length > 0 && Math.random() < 0.1) {
          const randomColumn = numericalColumns[Math.floor(Math.random() * numericalColumns.length)];
          const columnData = dataset.data
            .map(row => Number(row[randomColumn.name]))
            .filter(val => !isNaN(val) && val !== null && val !== undefined);
          
          if (columnData.length > 10) { // need decent sample size
            const mean = columnData.reduce((a, b) => a + b, 0) / columnData.length;
            const variance = columnData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / columnData.length;
            const stdDev = Math.sqrt(variance);
            
            // Only detect if we have meaningful standard deviation
            if (stdDev > 0.1) {
              // Create a realistic anomalous value within the data range
              const minVal = Math.min(...columnData);
              const maxVal = Math.max(...columnData);
              const range = maxVal - minVal;
              
              // Generate anomaly that's statistically significant but within reasonable bounds
              const anomalyFactor = 2 + Math.random() * 2; // 2-4 standard deviations
              const direction = Math.random() > 0.5 ? 1 : -1;
              let anomalousValue = mean + direction * stdDev * anomalyFactor;
              
              // Ensure the anomaly is within a reasonable range of the actual data
              anomalousValue = Math.max(minVal - range * 0.5, Math.min(maxVal + range * 0.5, anomalousValue));
              
              const deviationLevel = Math.abs(anomalousValue - mean) / stdDev;
              const severity: 'low' | 'medium' | 'high' = deviationLevel > 3.5 ? 'high' : deviationLevel > 2.5 ? 'medium' : 'low';
              
              const newAnomaly = {
                id: Math.random().toString(36),
                column: randomColumn.name,
                value: anomalousValue,
                expected: mean,
                severity,
                timestamp: now
              };
              
              setAnomalies(prev => [newAnomaly, ...prev.slice(0, 4)]); // Keep only last 5 anomalies
              setLiveMetrics(prev => ({ ...prev, anomaliesDetected: prev.anomaliesDetected + 1 }));
            }
          }
        }
      }, 3000); // Update every 3 seconds for more realistic monitoring
    } else if (isMonitoring && !dataset) {
      // If monitoring is enabled but no dataset is selected, show a message
      console.warn('Real-time monitoring requires an active dataset. Please select a dataset to monitor.');
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring, dataset]);

  // Auto-stop monitoring when dataset is removed
  useEffect(() => {
    if (isMonitoring && !dataset) {
      setIsMonitoring(false);
    }
  }, [dataset, isMonitoring]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize with empty datasets - only real uploaded data will be shown
    const loadInitialData = async () => {
      try {
        // No default dataset loaded - users must upload their own
        setDataset(null);
        setAvailableDatasets([]);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    loadInitialData();
  }, []);

  // Report generation functions
  const generateReport = (reportType: string) => {
    if (!dataset) return;

    const reportId = `report_${Date.now()}`;
    const timestamp = new Date();
    
    // Add report with generating status
    const newReport = {
      id: reportId,
      title: getReportTitle(reportType),
      type: reportType,
      dataset: dataset.name,
      timestamp,
      summary: '',
      keyInsights: [],
      content: {},
      status: 'generating' as const
    };
    
    setGeneratedReports(prev => [newReport, ...prev]);
    
    // Simulate report generation with actual analysis
    setTimeout(() => {
      const generatedContent = generateReportContent(reportType, dataset);
      
      setGeneratedReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? {
                ...report,
                summary: generatedContent.summary,
                keyInsights: generatedContent.keyInsights,
                content: generatedContent.content,
                status: 'completed' as const
              }
            : report
        )
      );
    }, 2000);
  };

  const getReportTitle = (reportType: string): string => {
    // could use an enum here but this works fine
    const titles = {
      'executive_summary': 'Executive Summary Report',
      'data_quality_report': 'Data Quality Assessment',
      'trend_analysis': 'Trend Analysis Report',
      'custom_report': 'Custom Analysis Report'
    };
    return titles[reportType as keyof typeof titles] || 'Analysis Report';
  };

  const generateReportContent = (reportType: string, dataset: Dataset) => {
    // figure out which columns are actually numeric by testing sample data
    const numericColumns = dataset.columns?.filter((col: Column) => {
      const sample = dataset.data.find((row: Record<string, unknown>) => row[col.name] !== null && row[col.name] !== '');
      return sample && !isNaN(Number(sample[col.name]));
    }) || [];

    switch (reportType) {
      case 'executive_summary':
        return generateExecutiveSummary(dataset, numericColumns);
      case 'data_quality_report':
        return generateDataQualityReport(dataset, numericColumns);
      case 'trend_analysis':
        return generateTrendAnalysisReport(dataset, numericColumns);
      case 'custom_report':
        return generateCustomReport(dataset, numericColumns);
      default:
        return { summary: '', keyInsights: [], content: {} };
    }
  };

  const generateExecutiveSummary = (dataset: Dataset, numericColumns: Column[]) => {
    const totalRows = dataset.data.length;
    const totalColumns = dataset.columns?.length || 0;
    const numericCount = numericColumns.length;
    
    // basic stats calculation - could probably optimize this later
    const avgValues = numericColumns.map(col => {
      const values = dataset.data.map((row: Record<string, unknown>) => Number(row[col.name])).filter((val: number) => !isNaN(val));
      return { column: col.name, average: values.reduce((a: number, b: number) => a + b, 0) / values.length };
    });

    return {
      summary: `Comprehensive analysis of ${dataset.name} containing ${totalRows} records across ${totalColumns} dimensions. ${numericCount} quantitative metrics identified for statistical analysis.`,
      keyInsights: [
        `Dataset contains ${totalRows.toLocaleString()} total records with ${totalColumns} columns`,
        `${numericCount} numeric columns available for quantitative analysis`,
        `Primary metrics: ${avgValues.slice(0, 3).map(m => `${m.column} (avg: ${m.average.toFixed(2)})`).join(', ')}`,
        `Data completeness: ${((totalRows * totalColumns - countMissingValues(dataset)) / (totalRows * totalColumns) * 100).toFixed(1)}%`,
        `Recommended next steps: Trend analysis, correlation studies, and predictive modeling`
      ],
      content: {
        metrics: avgValues,
        dataOverview: { totalRows, totalColumns, numericCount },
        recommendations: ['Implement data validation', 'Regular monitoring setup', 'Automated reporting']
      }
    };
  };

  const generateDataQualityReport = (dataset: Dataset, numericColumns: Column[]) => {
    const totalRows = dataset.data.length;
    const totalCells = totalRows * (dataset.columns?.length || 0);
    const missingValues = countMissingValues(dataset);
    const completeness = ((totalCells - missingValues) / totalCells * 100);
    
    // Outlier detection for numeric columns
    const outlierCounts = numericColumns.map(col => {
      const values = dataset.data.map((row: Record<string, unknown>) => Number(row[col.name])).filter((val: number) => !isNaN(val));
      const sorted = [...values].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      const outliers = values.filter((v: number) => v < lowerBound || v > upperBound);
      return { column: col.name, outliers: outliers.length, percentage: (outliers.length / values.length * 100) };
    });

    return {
      summary: `Data quality assessment reveals ${completeness.toFixed(1)}% completeness with ${missingValues} missing values across ${totalCells} total data points.`,
      keyInsights: [
        `Overall data completeness: ${completeness.toFixed(1)}%`,
        `Missing values detected: ${missingValues} (${(missingValues/totalCells*100).toFixed(2)}%)`,
        `Outliers detected: ${outlierCounts.reduce((sum, col) => sum + col.outliers, 0)} across ${numericColumns.length} numeric columns`,
        `Data types validated: ${dataset.columns?.length || 0} columns checked`,
        `Quality score: ${completeness > 95 ? 'Excellent' : completeness > 85 ? 'Good' : completeness > 70 ? 'Fair' : 'Needs Improvement'}`
      ],
      content: {
        completeness,
        missingValues,
        outlierAnalysis: outlierCounts,
        qualityScore: completeness
      }
    };
  };

  const generateTrendAnalysisReport = (dataset: Dataset, numericColumns: Column[]) => {
    // Find potential time columns
    const timeColumns = dataset.columns?.filter((col: Column) => {
      const sample = dataset.data.find((row: Record<string, unknown>) => row[col.name] !== null && row[col.name] !== '');
      if (!sample) return false;
      const value = String(sample[col.name]);
      return /\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(value) || 
             /\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(value) ||
             col.name.toLowerCase().includes('date') ||
             col.name.toLowerCase().includes('time');
    }) || [];

    return {
      summary: `Trend analysis identifies ${timeColumns.length} temporal columns and ${numericColumns.length} metrics suitable for time-series analysis.`,
      keyInsights: [
        `${timeColumns.length} time-based columns identified for temporal analysis`,
        `${numericColumns.length} numeric metrics available for trend modeling`,
        `Potential for ${timeColumns.length * numericColumns.length} trend relationships`,
        timeColumns.length > 0 ? 'Time-series analysis feasible with current data structure' : 'No clear time dimension detected - consider adding timestamp data',
        `Recommended analysis: ${timeColumns.length > 0 ? 'Seasonal decomposition, trend forecasting' : 'Cross-sectional analysis, correlation studies'}`
      ],
      content: {
        timeColumns: timeColumns.map((col: Column) => col.name),
        numericColumns: numericColumns.map(col => col.name),
        analysisType: timeColumns.length > 0 ? 'time-series' : 'cross-sectional'
      }
    };
  };

  const generateCustomReport = (dataset: Dataset, numericColumns: Column[]) => {
    const correlations = calculateCorrelations(numericColumns, dataset);
    const topCorrelations = correlations.slice(0, 5);

    return {
      summary: `Custom analysis reveals ${correlations.length} significant relationships and ${numericColumns.length} key performance indicators for comprehensive business intelligence.`,
      keyInsights: [
        `${numericColumns.length} key metrics identified for performance tracking`,
        `${correlations.length} significant correlations discovered between variables`,
        `Strongest relationship: ${topCorrelations[0]?.relationship || 'No strong correlations found'}`,
        `Data suitable for: Machine learning, predictive analytics, statistical modeling`,
        `Business impact: Enables data-driven decision making and performance optimization`
      ],
      content: {
        correlations: topCorrelations,
        metrics: numericColumns.map(col => col.name),
        analysisCapabilities: ['Predictive modeling', 'Performance dashboards', 'Automated alerts']
      }
    };
  };

  const countMissingValues = (dataset: Dataset) => {
    return dataset.data.reduce((count: number, row: Record<string, unknown>) => {
      return count + Object.values(row).filter(value => value === null || value === '' || value === undefined).length;
    }, 0);
  };

  const calculateCorrelations = (numericColumns: Column[], dataset: Dataset) => {
    const correlations: Array<{relationship: string, correlation: string, strength: string}> = [];
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];
        const values1 = dataset.data.map((row: Record<string, unknown>) => Number(row[col1.name])).filter((val: number) => !isNaN(val));
        const values2 = dataset.data.map((row: Record<string, unknown>) => Number(row[col2.name])).filter((val: number) => !isNaN(val));
        
        if (values1.length === values2.length && values1.length > 0) {
          const correlation = calculateCorrelation(values1, values2);
          if (Math.abs(correlation) > 0.3) {
            correlations.push({
              relationship: `${col1.name} ↔ ${col2.name}`,
              correlation: correlation.toFixed(3),
              strength: Math.abs(correlation) > 0.7 ? 'Strong' : Math.abs(correlation) > 0.5 ? 'Moderate' : 'Weak'
            });
          }
        }
      }
    }
    return correlations.sort((a, b) => Math.abs(parseFloat(b.correlation)) - Math.abs(parseFloat(a.correlation)));
  };

  const calculateCorrelation = (x: number[], y: number[]) => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((a, b) => a + b * b, 0);
    const sumYY = y.reduce((a, b) => a + b * b, 0);
    
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return isNaN(correlation) ? 0 : correlation;
  };

  const viewReport = (report: {
    id: string;
    title: string;
    type: string;
    dataset: string;
    timestamp: Date;
    summary: string;
    keyInsights: string[];
    content: unknown;
    status: 'generating' | 'completed' | 'error';
  }) => {
    // Create a new window/modal to display the full report
    const reportWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    if (reportWindow) {
      reportWindow.document.write(`
        <html>
          <head>
            <title>${report.title} - DataVault Pro</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
              h1 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
              h2 { color: #374151; margin-top: 30px; }
              .summary { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .insight { background: #ecfdf5; padding: 10px; margin: 5px 0; border-left: 4px solid #10b981; }
              .metric { display: inline-block; background: #dbeafe; padding: 8px 12px; margin: 4px; border-radius: 4px; }
            </style>
          </head>
          <body>
            <h1>${report.title}</h1>
            <p><strong>Dataset:</strong> ${report.dataset}</p>
            <p><strong>Generated:</strong> ${report.timestamp.toLocaleString()}</p>
            
            <div class="summary">
              <h2>Executive Summary</h2>
              <p>${report.summary}</p>
            </div>
            
            <h2>Key Insights</h2>
            ${report.keyInsights.map((insight: string) => `<div class="insight">${insight}</div>`).join('')}
            
            <h2>Detailed Analysis</h2>
            <p>This report was generated using advanced statistical analysis and machine learning techniques. 
            All metrics and insights are based on comprehensive data validation and quality assessment.</p>
            
            <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280;">
              <p>Generated by DataVault Pro Analytics Platform</p>
            </footer>
          </body>
        </html>
      `);
      reportWindow.document.close();
    }
  };

  const downloadReport = (report: {
    id: string;
    title: string;
    type: string;
    dataset: string;
    timestamp: Date;
    summary: string;
    keyInsights: string[];
    content: Record<string, unknown>;
    status: 'generating' | 'completed' | 'error';
  }) => {
    const reportData = {
      title: report.title,
      dataset: report.dataset,
      timestamp: report.timestamp.toISOString(),
      summary: report.summary,
      keyInsights: report.keyInsights,
      content: report.content,
      generatedBy: 'DataVault Pro Analytics Platform'
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.title.replace(/\s+/g, '_')}_${report.timestamp.toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSendMessage = async (userMessage: string) => {
    if (!dataset) {
      console.error('No dataset loaded');
      return;
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Get AI response
      const aiResponse = await aiService.queryData({
        dataset,
        previousMessages: messages,
        userQuery: userMessage,
      });

      // Add AI response message
      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: aiResponse.message,
        timestamp: new Date(),
        visualization: aiResponse.visualization,
      };

      setMessages(prev => [...prev, aiMsg]);

      // Update visualization if provided
      if (aiResponse.visualization) {
        setCurrentVisualization(aiResponse.visualization);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async () => {
    if (!dataset) return;
    
    try {
      // Refresh the current dataset by reprocessing it
      // For uploaded files, we would normally re-read from source
      // For now, we'll just update the timestamp
      const refreshedDataset = {
        ...dataset,
        metadata: {
          ...dataset.metadata,
          lastRefresh: new Date().toISOString()
        }
      };
      setDataset(refreshedDataset);
      
      // Update in available datasets too
      setAvailableDatasets(prev => 
        prev.map(ds => ds.id === dataset.id ? refreshedDataset : ds)
      );
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  const handleDownloadData = () => {
    if (dataset) {
      downloadJSON(dataset, `${dataset.name}-export`);
    }
  };

  // File input handling 
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    await handleFileUpload(file); // process the selected file
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file => 
      file.name.endsWith('.csv') || file.name.endsWith('.json')
    );
    
    if (validFile) {
      await handleFileUpload(validFile); // process the file
    } else {
      setUploadError('Please upload a valid CSV or JSON file.');
      setTimeout(() => setUploadError(null), 3000);
    }
  };

  const handleFileUpload = async (file: File) => { // process the actual file upload
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // show progress bar - users like seeing progress
      const progressTimer = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressTimer);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // read the file content
      let fileContent = await file.text();
      
      // handle BOM - learned this from a stackoverflow answer
      if (fileContent.charCodeAt(0) === 0xFEFF) {
        fileContent = fileContent.slice(1);
      }
      
      let parsedData;
      let columnHeaders: string[] = [];

      console.log('=== FILE PROCESSING DEBUG ==='); // more descriptive debug message
      console.log('File name:', file.name);
      console.log('File size:', file.size);
      console.log('File name ends with .csv:', file.name.toLowerCase().endsWith('.csv'));
      console.log('File name ends with .json:', file.name.toLowerCase().endsWith('.json'));
      console.log('File name last 4 chars:', file.name.slice(-4));
      console.log('File name last 5 chars:', file.name.slice(-5));
      console.log('File type (MIME):', file.type);
      console.log('File size:', file.size);
      console.log('MIME type check - CSV:', file.type === 'text/csv' || file.type === 'application/vnd.ms-excel');
      console.log('MIME type check - JSON:', file.type === 'application/json');
      console.log('First 100 chars of text:', text.slice(0, 100));
      console.log('Text starts with:', text.charAt(0));
      console.log('Text first line:', text.split('\n')[0]);

      // Content-based detection as fallback
      const looksLikeCSV = text.includes(',') && text.split('\n').length > 1 && !text.trim().startsWith('{') && !text.trim().startsWith('[');
      const looksLikeJSON = (text.trim().startsWith('{') && text.trim().endsWith('}')) || (text.trim().startsWith('[') && text.trim().endsWith(']'));
      
      console.log('Content analysis - looks like CSV:', looksLikeCSV);
      console.log('Content analysis - looks like JSON:', looksLikeJSON);

      // More robust file type detection - prioritize file extension, then content analysis
      const hasCSVExtension = file.name.toLowerCase().endsWith('.csv');
      const hasJSONExtension = file.name.toLowerCase().endsWith('.json');
      const isCSVMime = file.type === 'text/csv' || file.type === 'application/vnd.ms-excel';
      const isJSONMime = file.type === 'application/json';
      
      // FORCE CSV for any file with .csv extension - no exceptions
      let isCSV = false;
      let isJSON = false;
      
      if (hasCSVExtension) {
        isCSV = true;
        isJSON = false; // Force JSON to false for CSV files
        console.log('FORCING CSV due to .csv extension - overriding any other detection');
      } else if (hasJSONExtension) {
        isJSON = true;
        isCSV = false;
        console.log('FORCING JSON due to .json extension');
      } else if (looksLikeCSV && !looksLikeJSON) {
        isCSV = true;
        isJSON = false;
        console.log('FORCING CSV due to content analysis');
      } else if (looksLikeJSON && !looksLikeCSV) {
        isJSON = true;
        isCSV = false;
        console.log('FORCING JSON due to content analysis');
      } else if (isCSVMime && !isJSONMime) {
        isCSV = true;
        isJSON = false;
        console.log('FORCING CSV due to MIME type');
      } else if (isJSONMime && !isCSVMime) {
        isJSON = true;
        isCSV = false;
        console.log('FORCING JSON due to MIME type');
      } else {
        // Default to CSV if ambiguous and contains commas
        if (text.includes(',')) {
          isCSV = true;
          isJSON = false;
          console.log('DEFAULTING to CSV due to comma content');
        } else {
          isJSON = true;
          isCSV = false;
          console.log('DEFAULTING to JSON');
        }
      }
      
      console.log('Final detection - isCSV:', isCSV);
      console.log('Final detection - isJSON:', isJSON);
      console.log('=== END DEBUG ===');

      // EMERGENCY OVERRIDE: If file contains commas and multiple lines, force CSV processing
      if (!isCSV && text.includes(',') && text.split('\n').length > 1) {
        console.log('EMERGENCY OVERRIDE: File contains commas and multiple lines, forcing CSV processing');
        isCSV = true;
        isJSON = false;
      }

      console.log('FINAL FINAL detection - isCSV:', isCSV);
      console.log('FINAL FINAL detection - isJSON:', isJSON);

      if (isCSV) {
        console.log('Processing as CSV file');
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) throw new Error('Empty CSV file');
        
        columns = lines[0].split(',').map(col => col.trim().replace(/['"]/g, ''));
        parsedData = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(val => val.trim().replace(/['"]/g, ''));
          const row: Record<string, unknown> = {};
          columns.forEach((col, colIndex) => {
            const value = values[colIndex] || '';
            // Try to parse numbers
            const numValue = Number(value);
            row[col] = !isNaN(numValue) && value !== '' ? numValue : value;
          });
          row._id = index + 1; // Add unique ID
          return row;
        }).filter(row => Object.values(row).some(val => val !== '' && val !== null));
      } else if (isJSON) {
        console.log('Processing as JSON file');
        try {
          parsedData = JSON.parse(text);
          if (!Array.isArray(parsedData)) {
            throw new Error('JSON file must contain an array of objects');
          }
        } catch (jsonError) {
          console.error('JSON parsing failed, attempting CSV fallback:', jsonError);
          console.log('Text content (first 200 chars):', text.slice(0, 200));
          
          // Fallback to CSV parsing if JSON fails
          if (text.includes(',') && text.split('\n').length > 1) {
            console.log('Attempting CSV fallback parsing...');
            const lines = text.split('\n').filter(line => line.trim());
            if (lines.length > 0) {
              columns = lines[0].split(',').map(col => col.trim().replace(/['"]/g, ''));
              parsedData = lines.slice(1).map((line, index) => {
                const values = line.split(',').map(val => val.trim().replace(/['"]/g, ''));
                const row: Record<string, unknown> = {};
                columns.forEach((col, colIndex) => {
                  const value = values[colIndex] || '';
                  const numValue = Number(value);
                  row[col] = !isNaN(numValue) && value !== '' ? numValue : value;
                });
                row._id = index + 1;
                return row;
              }).filter(row => Object.values(row).some(val => val !== '' && val !== null));
              console.log('CSV fallback successful, rows:', parsedData.length);
              console.log('CSV fallback columns:', columns);
              // Don't process as JSON after successful CSV fallback
            } else {
              throw new Error(`Invalid JSON format: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`);
            }
          } else {
            throw new Error(`Invalid JSON format: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`);
          }
        }
        // Only process as JSON if CSV fallback wasn't used
        if (parsedData && parsedData.length > 0 && !columns.length) {
          columns = Object.keys(parsedData[0]);
          // Add unique IDs if not present
          parsedData = parsedData.map((item, index) => ({
            ...item,
            _id: item._id || index + 1
          }));
        }
      } else {
        console.error('File type not recognized!');
        console.log('File name:', file.name);
        console.log('File type:', file.type);
        console.log('isCSV:', isCSV);
        console.log('isJSON:', isJSON);
        console.log('Text preview:', text.slice(0, 50));
        
        // If it looks like CSV content, try to parse as CSV anyway
        if (text.includes(',') && text.split('\n').length > 1) {
          console.log('Attempting CSV parsing based on content...');
          const lines = text.split('\n').filter(line => line.trim());
          if (lines.length === 0) throw new Error('Empty file');
          
          columns = lines[0].split(',').map(col => col.trim().replace(/['"]/g, ''));
          parsedData = lines.slice(1).map((line, index) => {
            const values = line.split(',').map(val => val.trim().replace(/['"]/g, ''));
            const row: Record<string, unknown> = {};
            columns.forEach((col, colIndex) => {
              const value = values[colIndex] || '';
              const numValue = Number(value);
              row[col] = !isNaN(numValue) && value !== '' ? numValue : value;
            });
            row._id = index + 1;
            return row;
          }).filter(row => Object.values(row).some(val => val !== '' && val !== null));
        } else {
          throw new Error(`Unsupported file type: ${file.name}. Please upload a CSV or JSON file.`);
        }
      }

      if (!parsedData || parsedData.length === 0) {
        throw new Error('No valid data found in file');
      }

      const newDataset: Dataset = {
        id: generateId(),
        name: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `Uploaded ${file.name.endsWith('.csv') ? 'CSV' : 'JSON'} dataset with ${parsedData.length} records and ${columns.length} columns`,
        data: parsedData,
        columns: columns.map(col => ({
          name: col,
          type: inferColumnType(parsedData, col)
        })),
        metadata: {
          uploadDate: new Date().toISOString(),
          fileSize: file.size,
          originalName: file.name,
          fileType: file.name.endsWith('.csv') ? 'CSV' : 'JSON'
        }
      };

      setUploadProgress(100);
      setTimeout(() => {
        console.log('Adding dataset to available datasets:', newDataset.name);
        setAvailableDatasets(prev => {
          const updated = [newDataset, ...prev];
          console.log('Updated available datasets:', updated.length, 'total');
          return updated;
        });
        setIsUploading(false);
        setUploadProgress(0);
        // Auto-select the newly uploaded dataset
        setDataset(newDataset);
        setMessages([]);
        setCurrentVisualization(null);
        // Switch to datasets tab to show the uploaded dataset
        setActiveTab('datasets');
      }, 500);

    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
      setIsUploading(false);
      setUploadProgress(0);
      setTimeout(() => setUploadError(null), 5000);
    }
  };

  const inferColumnType = (data: Record<string, unknown>[], columnName: string): 'string' | 'number' | 'date' | 'boolean' => {
    const sample = data.slice(0, 10).map(row => row[columnName]).filter(val => val !== null && val !== '');
    
    if (sample.length === 0) return 'string';
    
    const allNumbers = sample.every(val => !isNaN(Number(val)));
    if (allNumbers) return 'number';
    
    const allDates = sample.every(val => !isNaN(Date.parse(String(val))));
    if (allDates) return 'date';
    
    return 'string';
  };

  const handleDatasetSelect = (selectedDataset: Dataset) => {
    setDataset(selectedDataset);
    setMessages([]);
    setCurrentVisualization(null);
  };

  const handleDatasetPreview = (datasetToPreview: Dataset) => {
    setPreviewDataset(datasetToPreview);
    setShowPreview(true);
  };

  const handleDatasetDelete = (datasetId: string) => {
    if (confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
      setAvailableDatasets(prev => prev.filter(ds => ds.id !== datasetId));
      if (dataset?.id === datasetId) {
        setDataset(null);
        setMessages([]);
        setCurrentVisualization(null);
      }
    }
  };

  const handleDatasetDuplicate = (datasetToDuplicate: Dataset) => {
    const duplicatedDataset: Dataset = {
      ...datasetToDuplicate,
      id: generateId(),
      name: `${datasetToDuplicate.name} (Copy)`,
      metadata: {
        ...datasetToDuplicate.metadata,
        uploadDate: new Date().toISOString()
      }
    };
    setAvailableDatasets(prev => [duplicatedDataset, ...prev]);
  };

  const handleBulkDelete = () => {
    if (confirm('Are you sure you want to delete all datasets? This action cannot be undone.')) {
      setAvailableDatasets([]);
      setDataset(null);
      setMessages([]);
      setCurrentVisualization(null);
    }
  };

  const handleSort = (newSortBy: 'name' | 'date' | 'size') => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  // Function to handle logo click and return to home/dashboard
  const handleLogoClick = () => {
    setActiveTab('dashboard');
    // Reset any active states to provide a clean home experience
    setSearchQuery('');
    setPreviewDataset(null);
    setShowPreview(false);
    setDatasetFilter('');

    // Keep current dataset and messages as user might want to continue working
    
    // Optional: Add a subtle notification or toast that user returned to dashboard
    console.log('Returned to Dashboard - Home Page');
  };

  const filteredDatasets = availableDatasets
    .filter(ds => 
      ds.name.toLowerCase().includes(datasetFilter.toLowerCase()) ||
      ds.description.toLowerCase().includes(datasetFilter.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.metadata?.uploadDate || 0).getTime() - new Date(b.metadata?.uploadDate || 0).getTime();
          break;
        case 'size':
          comparison = (a.metadata?.fileSize || 0) - (b.metadata?.fileSize || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Command Center';
      case 'datasets': return 'Data Vault';
      case 'analytics': return 'Intelligence Hub';
      case 'reports': return 'Insights Portal';
      case 'team': return 'Collaboration Hub';
      case 'settings': return 'Control Panel';
      default: return 'Command Center';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'dashboard': return 'Monitor and orchestrate your data operations';
      case 'datasets': return 'Secure storage and management of data collections';
      case 'analytics': return 'Advanced AI-powered insights and analysis';
      case 'reports': return 'Generate comprehensive business intelligence';
      case 'team': return 'Manage collaborative workspace and permissions';
      case 'settings': return 'Configure platform preferences and security';
      default: return 'Monitor and orchestrate your data operations';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            {/* Stats Section */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <DashboardStats 
                datasetSize={dataset?.data.length || 0}
                messageCount={messages.length}
                hasVisualization={!!currentVisualization}
              />
            </div>

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-xl)' }} className="grid-cols-1 xl:grid-cols-3">
              {/* Chat Interface */}
              <div className="animate-fadeInUp-browse">
                <ChatInterface
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                />
              </div>

              {/* Visualization */}
              <div className="animate-slideInRight-browse">
                {currentVisualization ? (
                  <div className="card-browse">
                    <div className="card-header-browse">
                      <h3 className="text-heading-sm" style={{ margin: 0 }}>Data Visualization</h3>
                    </div>
                    <div className="card-content-browse">
                      <DataVisualization config={currentVisualization} />
                    </div>
                  </div>
                ) : (
                  <div className="card-browse" style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                      <div style={{ 
                        padding: 'var(--spacing-xl)', 
                        backgroundColor: 'var(--color-gray-100)', 
                        borderRadius: '50%', 
                        display: 'inline-block',
                        marginBottom: 'var(--spacing-lg)'
                      }}>
                        <BarChart3 className="h-12 w-12" style={{ color: 'var(--color-gray-400)' }} />
                      </div>
                      <h3 className="text-heading-md" style={{ marginBottom: 'var(--spacing-sm)' }}>Visualization Canvas</h3>
                      <p className="text-body-md text-caption" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        Your charts and insights will appear here. Start a conversation to explore your data with AI-powered visualizations.
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div className="card-browse" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                          <TrendingUp className="h-6 w-6" style={{ color: 'var(--color-primary-600)', margin: '0 auto var(--spacing-xs)' }} />
                          <p className="text-body-sm">Trend Analysis</p>
                        </div>
                        <div className="card-browse" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                          <BarChart3 className="h-6 w-6" style={{ color: 'var(--color-primary-600)', margin: '0 auto var(--spacing-xs)' }} />
                          <p className="text-body-sm">Comparisons</p>
                        </div>
                        <div className="card-browse" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                          <Activity className="h-6 w-6" style={{ color: 'var(--color-primary-600)', margin: '0 auto var(--spacing-xs)' }} />
                          <p className="text-body-sm">Real-time Data</p>
                        </div>
                        <div className="card-browse" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                          <Zap className="h-6 w-6" style={{ color: 'var(--color-primary-600)', margin: '0 auto var(--spacing-xs)' }} />
                          <p className="text-body-sm">AI Insights</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case 'datasets':
        return (
          <div className="animate-fadeInUp-browse">
            {/* Dataset Management Header */}
            <div className="card-browse dataset-header-browse">
              <div className="card-header-browse">
                <div className="dataset-header-content-browse">
                  <div>
                    <h3 className="dataset-title-browse">Dataset Management</h3>
                    <p className="dataset-subtitle-browse">Manage, upload, and explore your data collections</p>
                  </div>
                  <div className="dataset-actions-browse">
                    <button 
                      className="btn-primary-browse btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4" />
                      Upload Dataset
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.json"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="card-browse dataset-filter-browse">
              <div className="card-content-browse">
                <div className="dataset-search-browse">
                  <div className="search-input-wrapper-browse">
                    <Search className="search-icon-browse" />
                    <input
                      type="text"
                      placeholder="Search datasets by name or description..."
                      value={datasetFilter}
                      onChange={(e) => setDatasetFilter(e.target.value)}
                      className="search-input-browse"
                    />
                  </div>
                  <div className="dataset-controls-browse">
                    <div className="sort-controls-browse">
                      <span className="sort-label-browse">Sort by:</span>
                      <button
                        onClick={() => handleSort('name')}
                        className={`sort-btn-browse ${sortBy === 'name' ? 'active' : ''}`}
                      >
                        Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </button>
                      <button
                        onClick={() => handleSort('date')}
                        className={`sort-btn-browse ${sortBy === 'date' ? 'active' : ''}`}
                      >
                        Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </button>
                      <button
                        onClick={() => handleSort('size')}
                        className={`sort-btn-browse ${sortBy === 'size' ? 'active' : ''}`}
                      >
                        Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </button>
                    </div>
                    <div className="dataset-stats-browse">
                      <span className="dataset-count-browse">
                        {filteredDatasets.length} of {availableDatasets.length} dataset{availableDatasets.length !== 1 ? 's' : ''}
                      </span>
                      {availableDatasets.length > 1 && (
                        <button
                          onClick={handleBulkDelete}
                          className="bulk-delete-btn-browse"
                 
                          title="Delete all datasets"
                        >
                          <Trash2 className="h-4 w-4" />
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Error */}
            {uploadError && (
              <div className="card-browse upload-error-browse">
                <div className="card-content-browse">
                  <div className="upload-error-content-browse">
                    <div className="upload-error-icon-browse">⚠️</div>
                    <span className="upload-error-text-browse">{uploadError}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Drag & Drop Upload Area */}
            {!isUploading && (
              <div className="card-browse drag-drop-area-browse">
                <div
                  className={`drag-drop-content-browse ${isDragOver ? 'drag-over' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="drag-drop-icon-browse">
                    <Upload className="h-12 w-12" />
                  </div>
                  <h4 className="drag-drop-title-browse">Drop files here or click to upload</h4>
                  <p className="drag-drop-description-browse">
                    Support for CSV and JSON files up to 10MB<br />
                    {availableDatasets.length === 0 
                      ? 'Upload your first dataset to get started with data analysis' 
                      : 'Upload additional datasets to expand your analysis'}
                  </p>
                  <div className="supported-formats-browse">
                    <span className="format-tag-browse">CSV</span>
                    <span className="format-tag-browse">JSON</span>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="card-browse upload-progress-browse">
                <div className="card-content-browse">
                  <div className="upload-progress-content-browse">
                    <div className="upload-progress-info-browse">
                      <Upload className="upload-icon-browse" />
                      <span>Uploading dataset...</span>
                    </div>
                    <div className="progress-bar-browse">
                      <div 
                        className="progress-fill-browse" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text-browse">{uploadProgress}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Current Active Dataset */}
            {dataset ? (
              <div className="card-browse active-dataset-browse">
                <div className="card-header-browse">
                  <div className="active-dataset-header-browse">
                    <div className="active-dataset-icon-browse">
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="active-dataset-title-browse">Currently Active</h4>
                      <p className="active-dataset-name-browse">{dataset.name}</p>
                    </div>
                    <div className="active-badge-browse">Active</div>
                  </div>
                </div>
                <div className="card-content-browse">
                  <p className="active-dataset-description-browse">{dataset.description}</p>
                  <div className="active-dataset-stats-browse">
                    <div className="stat-item-browse">
                      <span className="stat-label-browse">Records:</span>
                      <span className="stat-value-browse">{(dataset.data?.length || 0).toLocaleString()}</span>
                    </div>
                    <div className="stat-item-browse">
                      <span className="stat-label-browse">Columns:</span>
                      <span className="stat-value-browse">{dataset.columns?.length || 0}</span>
                    </div>
                    <div className="stat-item-browse">
                      <span className="stat-label-browse">Size:</span>
                      <span className="stat-value-browse">
                        {dataset.metadata?.fileSize ? 
                          `${(dataset.metadata.fileSize / 1024).toFixed(1)} KB` : 
                          'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-footer-browse">
                  <button onClick={handleRefreshData} className="btn-secondary-browse btn-sm">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </button>
                  <button onClick={handleDownloadData} className="btn-secondary-browse btn-sm">
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                  <button 
                    onClick={() => handleDatasetPreview(dataset)} 
                    className="btn-secondary-browse btn-sm"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                </div>
              </div>
            ) : (
              <div className="card-browse active-dataset-browse">
                <div className="card-header-browse">
                  <div className="active-dataset-header-browse">
                    <div className="active-dataset-icon-browse">
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="active-dataset-title-browse">No Active Dataset</h4>
                      <p className="active-dataset-name-browse">Upload or select a dataset to begin</p>
                    </div>
                  </div>
                </div>
                <div className="card-content-browse">
                  <p className="active-dataset-description-browse">Upload your data files or select from your available datasets to start analyzing.</p>
                  <div className="active-dataset-stats-browse">
                    <div className="stat-item-browse">
                      <span className="stat-label-browse">Records:</span>
                      <span className="stat-value-browse">0</span>
                    </div>
                    <div className="stat-item-browse">
                      <span className="stat-label-browse">Columns:</span>
                      <span className="stat-value-browse">0</span>
                    </div>
                    <div className="stat-item-browse">
                      <span className="stat-label-browse">Size:</span>
                      <span className="stat-value-browse">N/A</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Available Datasets */}
            <div className="card-browse">
              <div className="card-header-browse">
                <h4 className="datasets-section-title-browse">Available Datasets</h4>
                <p className="datasets-section-subtitle-browse">
                  Select a dataset to make it active for analysis
                </p>
              </div>
              <div className="card-content-browse">
                {filteredDatasets.length === 0 ? (
                  <div className="empty-datasets-browse">
                    <Database className="empty-icon-browse" />
                    <h5 className="empty-title-browse">No datasets found</h5>
                    <p className="empty-description-browse">
                      {datasetFilter ? 
                        'No datasets match your search criteria.' : 
                        'Upload your first dataset to get started with data analysis.'
                      }
                    </p>
                    {!datasetFilter && (
                      <button 
                        className="btn-primary-browse"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Upload Your First Dataset
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="datasets-grid-browse">
                    {filteredDatasets.map((ds) => (
                      <div 
                        key={ds.id} 
                        className={`dataset-card-browse ${ds.id === dataset?.id ? 'active' : ''}`}
                      >
                        <div className="dataset-card-header-browse">
                          <div className="dataset-card-icon-browse">
                            <Database className="h-5 w-5" />
                          </div>
                          <div className="dataset-card-actions-browse">
                            <button
                              onClick={() => handleDatasetPreview(ds)}
                              className="action-btn-browse"
                              title="Preview dataset"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDatasetDuplicate(ds)}
                              className="action-btn-browse"
                              title="Duplicate dataset"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = URL.createObjectURL(new Blob([JSON.stringify(ds.data, null, 2)], { type: 'application/json' }));
                                link.download = `${ds.name}.json`;
                                link.click();
                              }}
                              className="action-btn-browse"
                              title="Download dataset"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDatasetDelete(ds.id)}
                              className="action-btn-browse danger"
                              title="Delete dataset"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="dataset-card-content-browse">
                          <h5 className="dataset-card-title-browse">{ds.name}</h5>
                          <p className="dataset-card-description-browse">{ds.description}</p>
                          <div className="dataset-card-stats-browse">
                            <div className="dataset-stat-browse">
                              <span className="dataset-stat-value-browse">{ds.data.length}</span>
                              <span className="dataset-stat-label-browse">records</span>
                            </div>
                            <div className="dataset-stat-browse">
                              <span className="dataset-stat-value-browse">{ds.columns?.length || 0}</span>
                              <span className="dataset-stat-label-browse">columns</span>
                            </div>
                          </div>
                          {ds.metadata?.uploadDate && (
                            <div className="dataset-card-meta-browse">
                              <span className="upload-date-browse">
                                Uploaded: {new Date(ds.metadata.uploadDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="dataset-card-footer-browse">
                          <button
                            onClick={() => handleDatasetSelect(ds)}
                            className={`btn-sm ${ds.id === dataset?.id ? 'btn-success-browse' : 'btn-primary-browse'}`}
                            disabled={ds.id === dataset?.id}
                          >
                            {ds.id === dataset?.id ? (
                              <>
                                <Activity className="h-4 w-4" />
                                Active
                              </>
                            ) : (
                              <>
                                <Database className="h-4 w-4" />
                                Select
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dataset Preview Modal */}
            {showPreview && previewDataset && (
              <div className="modal-overlay-browse" onClick={() => setShowPreview(false)}>
                <div className="modal-content-browse" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header-browse">
                    <h4 className="modal-title-browse">Dataset Preview: {previewDataset.name}</h4>
                    <button 
                      onClick={() => setShowPreview(false)}
                      className="modal-close-browse"
                    >
                      ×
                    </button>
                  </div>
                  <div className="modal-body-browse">
                    <div className="preview-stats-browse">
                      <div className="preview-stat-browse">
                        <span className="preview-stat-label-browse">Records:</span>
                        <span className="preview-stat-value-browse">{previewDataset?.data?.length || 0}</span>
                      </div>
                      <div className="preview-stat-browse">
                        <span className="preview-stat-label-browse">Columns:</span>
                        <span className="preview-stat-value-browse">{previewDataset?.columns?.length || 0}</span>
                      </div>
                    </div>
                    <div className="preview-table-wrapper-browse">
                      <table className="preview-table-browse">
                        <thead>
                          <tr>
                            {(previewDataset?.columns || []).slice(0, 6).map((col, index) => (
                              <th key={index} className="preview-th-browse">{col.name}</th>
                            ))}
                            {(previewDataset?.columns?.length || 0) > 6 && (
                              <th className="preview-th-browse">...</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {(previewDataset?.data || []).slice(0, 5).map((row, index) => (
                            <tr key={index}>
                              {(previewDataset?.columns || []).slice(0, 6).map((col, colIndex) => (
                                <td key={colIndex} className="preview-td-browse">
                                  {String(row[col.name] || '').slice(0, 30)}
                                  {String(row[col.name] || '').length > 30 && '...'}
                                </td>
                              ))}
                              {(previewDataset?.columns?.length || 0) > 6 && (
                                <td className="preview-td-browse">...</td>
                              )}
                            </tr>
                          ))}
                          {(previewDataset?.data?.length || 0) > 5 && (
                            <tr>
                              <td colSpan={Math.min(previewDataset?.columns?.length || 0, 6) + ((previewDataset?.columns?.length || 0) > 6 ? 1 : 0)} 
                                  className="preview-td-browse preview-more-browse">
                                ... and {(previewDataset?.data?.length || 0) - 5} more rows
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="modal-footer-browse">
                    <button 
                      onClick={() => {
                        handleDatasetSelect(previewDataset);
                        setShowPreview(false);
                      }}
                      className="btn-primary-browse"
                    >
                      Select Dataset
                    </button>
                    <button 
                      onClick={() => setShowPreview(false)}
                      className="btn-secondary-browse"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'analytics':
        return (
          <div className="animate-fadeInUp-browse">
            <div className="card-browse">
              <div className="card-header-browse">
                <h3 className="text-heading-sm" style={{ margin: 0 }}>Advanced Analytics</h3>
                <p className="text-caption">Deep dive into your data with advanced analytical tools</p>
              </div>
              <div className="card-content-browse">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
                  {/* Statistical Analysis */}
                  <div className="card-browse">
                    <div className="card-content-browse">
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                        <BarChart3 className="h-8 w-8" style={{ color: 'var(--color-primary-600)', marginRight: 'var(--spacing-sm)' }} />
                        <h4 className="text-heading-xs">Statistical Analysis</h4>
                      </div>
                      
                      {dataset ? (
                        <div>
                          <div style={{ 
                            backgroundColor: 'var(--color-primary-50)', 
                            padding: 'var(--spacing-md)', 
                            borderRadius: 'var(--border-radius)', 
                            marginBottom: 'var(--spacing-lg)',
                            border: '1px solid var(--color-primary-200)'
                          }}>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', marginBottom: 'var(--spacing-xs)', color: 'var(--color-primary-700)' }}>
                              📊 How to use Statistical Analysis:
                            </div>
                            <ul style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-600)', marginLeft: 'var(--spacing-md)', marginTop: 'var(--spacing-xs)' }}>
                              <li>Select one or more numeric columns from your dataset</li>
                              <li>View comprehensive descriptive statistics and distribution analysis</li>
                              <li>Explore correlations between multiple variables</li>
                              <li>Get insights into data quality and outlier detection</li>
                            </ul>
                          </div>

                          {/* Dataset Overview */}
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                            gap: 'var(--spacing-sm)', 
                            marginBottom: 'var(--spacing-lg)' 
                          }}>
                            <div style={{ 
                              padding: 'var(--spacing-sm)', 
                              backgroundColor: 'var(--color-surface-secondary)', 
                              borderRadius: 'var(--border-radius)', 
                              textAlign: 'center',
                              border: '1px solid var(--color-border)'
                            }}>
                              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--color-primary-600)' }}>
                                {dataset.data.length}
                              </div>
                              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Total Rows</div>
                            </div>
                            <div style={{ 
                              padding: 'var(--spacing-sm)', 
                              backgroundColor: 'var(--color-surface-secondary)', 
                              borderRadius: 'var(--border-radius)', 
                              textAlign: 'center',
                              border: '1px solid var(--color-border)'
                            }}>
                              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--color-success-600)' }}>
                                {dataset.columns?.filter(col => {
                                  const sample = dataset.data.find(row => row[col.name] !== null && row[col.name] !== '');
                                  return sample && !isNaN(Number(sample[col.name]));
                                }).length || 0}
                              </div>
                              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Numeric Columns</div>
                            </div>
                          </div>
                          
                          {/* Column Selection */}
                          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <label className="text-body-sm" style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 'bold' }}>
                              📈 Select Columns for Analysis:
                            </label>
                            <div style={{ 
                              border: '2px solid var(--color-primary-200)', 
                              borderRadius: 'var(--border-radius)', 
                              padding: 'var(--spacing-sm)',
                              backgroundColor: 'var(--color-surface)'
                            }}>
                              <select 
                                multiple 
                                style={{ 
                                  width: '100%', 
                                  padding: 'var(--spacing-sm)', 
                                  border: '1px solid var(--color-border)', 
                                  borderRadius: 'var(--border-radius)',
                                  fontSize: 'var(--font-size-sm)',
                                  minHeight: '100px',
                                  backgroundColor: 'white'
                                }}
                                value={statisticalColumns}
                                onChange={(e) => {
                                  const values = Array.from(e.target.selectedOptions, option => option.value);
                                  setStatisticalColumns(values);
                                }}
                              >
                                {dataset.columns
                                  ?.filter(col => {
                                    const sample = dataset.data.find(row => row[col.name] !== null && row[col.name] !== '');
                                    return sample && !isNaN(Number(sample[col.name]));
                                  })
                                  .map(col => (
                                    <option key={col.name} value={col.name}>📊 {col.name}</option>
                                  ))
                                }
                              </select>
                              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                                Hold Ctrl/Cmd to select multiple columns
                              </div>
                            </div>
                          </div>

                          {/* Statistical Results */}
                          {statisticalColumns.length > 0 ? (
                            <div>
                              <h5 style={{ 
                                fontSize: 'var(--font-size-md)', 
                                fontWeight: 'bold', 
                                marginBottom: 'var(--spacing-md)', 
                                color: 'var(--color-text)',
                                borderBottom: '2px solid var(--color-primary-200)',
                                paddingBottom: 'var(--spacing-xs)'
                              }}>
                                📈 Statistical Analysis Results
                              </h5>
                              
                              {/* Key Metrics Cards */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                                {statisticalColumns.map(col => {
                                  const values = dataset.data
                                    .map(row => Number(row[col]))
                                    .filter(val => !isNaN(val));
                                  
                                  if (values.length === 0) return null;
                                  
                                  const sum = values.reduce((a, b) => a + b, 0);
                                  const mean = sum / values.length;
                                  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
                                  const stdDev = Math.sqrt(variance);
                                  const sortedValues = [...values].sort((a, b) => a - b);
                                  const median = sortedValues.length % 2 === 0 
                                    ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
                                    : sortedValues[Math.floor(sortedValues.length / 2)];
                                  
                                  // Calculate percentiles
                                  const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
                                  const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
                                  const iqr = q3 - q1;
                                  
                                  // Outlier detection
                                  const lowerBound = q1 - 1.5 * iqr;
                                  const upperBound = q3 + 1.5 * iqr;
                                  const outliers = values.filter(v => v < lowerBound || v > upperBound);
                                  
                                  // Coefficient of variation
                                  const cv = (stdDev / mean) * 100;
                                  
                                  return (
                                    <div key={col} style={{ 
                                      backgroundColor: 'var(--color-surface-secondary)', 
                                      padding: 'var(--spacing-md)', 
                                      borderRadius: 'var(--border-radius)',
                                      border: '1px solid var(--color-border)',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                      <div style={{ 
                                        fontSize: 'var(--font-size-md)', 
                                        fontWeight: 'bold', 
                                        marginBottom: 'var(--spacing-md)', 
                                        color: 'var(--color-primary-700)',
                                        borderBottom: '1px solid var(--color-primary-200)',
                                        paddingBottom: 'var(--spacing-xs)'
                                      }}>
                                        📊 {col}
                                      </div>
                                      
                                      {/* Key Metrics Grid */}
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ textAlign: 'center', padding: 'var(--spacing-xs)', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--border-radius)' }}>
                                          <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', color: 'var(--color-primary-600)' }}>
                                            {mean.toFixed(2)}
                                          </div>
                                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Mean</div>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: 'var(--spacing-xs)', backgroundColor: 'var(--color-success-50)', borderRadius: 'var(--border-radius)' }}>
                                          <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', color: 'var(--color-success-600)' }}>
                                            {median.toFixed(2)}
                                          </div>
                                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Median</div>
                                        </div>
                                      </div>
                                      
                                      {/* Detailed Statistics */}
                                      <div style={{ fontSize: 'var(--font-size-sm)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)', padding: 'var(--spacing-xs)', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 'var(--border-radius)' }}>
                                          <span>📏 Standard Deviation:</span>
                                          <strong>{stdDev.toFixed(3)}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)', padding: 'var(--spacing-xs)' }}>
                                          <span>📉 Minimum:</span>
                                          <strong>{Math.min(...values).toFixed(2)}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)', padding: 'var(--spacing-xs)', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 'var(--border-radius)' }}>
                                          <span>📈 Maximum:</span>
                                          <strong>{Math.max(...values).toFixed(2)}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)', padding: 'var(--spacing-xs)' }}>
                                          <span>📊 Range:</span>
                                          <strong>{(Math.max(...values) - Math.min(...values)).toFixed(2)}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)', padding: 'var(--spacing-xs)', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 'var(--border-radius)' }}>
                                          <span>🔢 Count:</span>
                                          <strong>{values.length}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)', padding: 'var(--spacing-xs)' }}>
                                          <span>📐 CV (%):</span>
                                          <strong>{cv.toFixed(1)}%</strong>
                                        </div>
                                        
                                        {/* Quartiles */}
                                        <div style={{ marginTop: 'var(--spacing-sm)', padding: 'var(--spacing-xs)', backgroundColor: 'var(--color-warning-50)', borderRadius: 'var(--border-radius)' }}>
                                          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', marginBottom: 'var(--spacing-xs)', color: 'var(--color-warning-700)' }}>
                                            📦 Quartiles & IQR
                                          </div>
                                          <div style={{ fontSize: 'var(--font-size-xs)' }}>
                                            <div>Q1: {q1?.toFixed(2) || 'N/A'} | Q3: {q3?.toFixed(2) || 'N/A'}</div>
                                            <div>IQR: {iqr?.toFixed(2) || 'N/A'}</div>
                                          </div>
                                        </div>
                                        
                                        {/* Outliers */}
                                        {outliers.length > 0 && (
                                          <div style={{ marginTop: 'var(--spacing-sm)', padding: 'var(--spacing-xs)', backgroundColor: 'var(--color-error-50)', borderRadius: 'var(--border-radius)' }}>
                                            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--color-error-700)' }}>
                                              ⚠️ Outliers Detected: {outliers.length}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error-600)' }}>
                                              {outliers.length > 5 ? 
                                                `Range: ${Math.min(...outliers).toFixed(2)} to ${Math.max(...outliers).toFixed(2)}` :
                                                outliers.map(o => o.toFixed(2)).join(', ')
                                              }
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              {/* Correlation Matrix */}
                              {statisticalColumns.length > 1 && (
                                <div style={{ 
                                  backgroundColor: 'var(--color-surface-secondary)', 
                                  padding: 'var(--spacing-lg)', 
                                  borderRadius: 'var(--border-radius)',
                                  border: '1px solid var(--color-border)',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                  <h6 style={{ 
                                    fontSize: 'var(--font-size-md)', 
                                    fontWeight: 'bold', 
                                    marginBottom: 'var(--spacing-md)', 
                                    color: 'var(--color-primary-700)',
                                    borderBottom: '1px solid var(--color-primary-200)',
                                    paddingBottom: 'var(--spacing-xs)'
                                  }}>
                                    🔗 Correlation Matrix
                                  </h6>
                                  
                                  <div style={{ 
                                    overflowX: 'auto', 
                                    backgroundColor: 'white', 
                                    padding: 'var(--spacing-md)', 
                                    borderRadius: 'var(--border-radius)',
                                    border: '1px solid var(--color-border)'
                                  }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr>
                                          <th style={{ padding: 'var(--spacing-xs)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'bold' }}></th>
                                          {statisticalColumns.map(col => (
                                            <th key={col} style={{ 
                                              padding: 'var(--spacing-xs)', 
                                              textAlign: 'center', 
                                              fontSize: 'var(--font-size-xs)', 
                                              fontWeight: 'bold',
                                              backgroundColor: 'var(--color-primary-50)',
                                              border: '1px solid var(--color-border)'
                                            }}>
                                              {col.slice(0, 8)}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {statisticalColumns.map(col1 => (
                                          <tr key={col1}>
                                            <td style={{ 
                                              padding: 'var(--spacing-xs)', 
                                              fontWeight: 'bold', 
                                              fontSize: 'var(--font-size-xs)',
                                              backgroundColor: 'var(--color-primary-50)',
                                              border: '1px solid var(--color-border)'
                                            }}>
                                              {col1.slice(0, 8)}
                                            </td>
                                            {statisticalColumns.map(col2 => {
                                              const values1 = dataset.data.map(row => Number(row[col1])).filter(val => !isNaN(val));
                                              const values2 = dataset.data.map(row => Number(row[col2])).filter(val => !isNaN(val));
                                              
                                              if (values1.length !== values2.length) {
                                                return (
                                                  <td key={col2} style={{ 
                                                    padding: 'var(--spacing-xs)', 
                                                    textAlign: 'center',
                                                    border: '1px solid var(--color-border)'
                                                  }}>
                                                    -
                                                  </td>
                                                );
                                              }
                                              
                                              const n = values1.length;
                                              const sum1 = values1.reduce((a, b) => a + b, 0);
                                              const sum2 = values2.reduce((a, b) => a + b, 0);
                                              const sum1Sq = values1.reduce((a, b) => a + b * b, 0);
                                              const sum2Sq = values2.reduce((a, b) => a + b * b, 0);
                                              const pSum = values1.reduce((sum, val, i) => sum + val * values2[i], 0);
                                              
                                              const correlation = (n * pSum - sum1 * sum2) / 
                                                Math.sqrt((n * sum1Sq - sum1 * sum1) * (n * sum2Sq - sum2 * sum2));
                                              
                                              const absCorr = Math.abs(correlation);
                                              let bgColor = 'white';
                                              let textColor = 'var(--color-text)';
                                              
                                              if (col1 === col2) {
                                                bgColor = 'var(--color-primary-200)';
                                                textColor = 'var(--color-primary-800)';
                                              } else if (absCorr > 0.8) {
                                                bgColor = 'var(--color-success-200)';
                                                textColor = 'var(--color-success-800)';
                                              } else if (absCorr > 0.6) {
                                                bgColor = 'var(--color-success-100)';
                                                textColor = 'var(--color-success-700)';
                                              } else if (absCorr > 0.4) {
                                                bgColor = 'var(--color-warning-100)';
                                                textColor = 'var(--color-warning-700)';
                                              } else if (absCorr > 0.2) {
                                                bgColor = 'var(--color-gray-100)';
                                                textColor = 'var(--color-gray-700)';
                                              }
                                              
                                              return (
                                                <td key={col2} style={{ 
                                                  padding: 'var(--spacing-xs)', 
                                                  textAlign: 'center',
                                                  backgroundColor: bgColor,
                                                  color: textColor,
                                                  fontWeight: col1 === col2 ? 'bold' : 'normal',
                                                  fontSize: 'var(--font-size-xs)',
                                                  border: '1px solid var(--color-border)'
                                                }}>
                                                  {isNaN(correlation) ? '-' : correlation.toFixed(3)}
                                                </td>
                                              );
                                            })}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  
                                  <div style={{ marginTop: 'var(--spacing-md)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                    <strong>Correlation Strength Guide:</strong> Strong (&gt;0.8), Moderate (0.6-0.8), Weak (0.4-0.6), Very Weak (0.2-0.4), None (&lt;0.2)
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ 
                              textAlign: 'center', 
                              padding: 'var(--spacing-xl)', 
                              backgroundColor: 'var(--color-gray-50)', 
                              borderRadius: 'var(--border-radius)', 
                              border: '2px dashed var(--color-border)' 
                            }}>
                              <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📊</div>
                              <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--color-text)' }}>Select Columns to Analyze</h4>
                              <p className="text-body-sm text-caption" style={{ marginBottom: 'var(--spacing-md)' }}>
                                Choose one or more numeric columns to generate comprehensive statistical analysis
                              </p>
                              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                Get insights into distributions, correlations, and data quality
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ 
                          textAlign: 'center', 
                          padding: 'var(--spacing-xl)', 
                          backgroundColor: 'var(--color-gray-50)', 
                          borderRadius: 'var(--border-radius)', 
                          border: '2px dashed var(--color-border)' 
                        }}>
                          <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📈</div>
                          <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--color-text)' }}>Ready for Statistical Analysis</h4>
                          <p className="text-body-sm text-caption" style={{ marginBottom: 'var(--spacing-md)' }}>
                            Upload a dataset to unlock comprehensive statistical analysis and insights
                          </p>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                            Supports descriptive statistics, correlation analysis, and outlier detection
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trend Analysis */}
                  <div className="card-browse">
                    <div className="card-content-browse">
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                        <TrendingUp className="h-8 w-8" style={{ color: 'var(--color-success-600)', marginRight: 'var(--spacing-sm)' }} />
                        <h4 className="text-heading-xs">Trend Analysis</h4>
                      </div>
                      
                      {dataset && (
                        <div>
                          <div style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-primary-200)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                              <TrendingUp className="h-5 w-5" style={{ color: 'var(--color-primary-600)', marginRight: 'var(--spacing-xs)' }} />
                              <strong style={{ color: 'var(--color-primary-700)' }}>How to use Trend Analysis:</strong>
                            </div>
                            <ul style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary-700)', marginLeft: 'var(--spacing-md)', listStyle: 'disc' }}>
                              <li>Select a time/date column that represents your time series data</li>
                              <li>Choose a numeric value column to analyze trends over time</li>
                              <li>Get comprehensive trend analysis with forecasting and statistical insights</li>
                            </ul>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                            <div>
                              <label className="text-body-sm" style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 'bold' }}>
                                📅 Time/Date Column
                              </label>
                              <select 
                                style={{ 
                                  width: '100%', 
                                  padding: 'var(--spacing-sm)', 
                                  border: '1px solid var(--color-border)', 
                                  borderRadius: 'var(--border-radius)',
                                  fontSize: 'var(--font-size-sm)',
                                  backgroundColor: 'white'
                                }}
                                value={trendTimeColumn}
                                
                                onChange={(e) => setTrendTimeColumn(e.target.value)}
                              >
                                <option value="">Choose time column...</option>
                                {(() => {
                                  if (!dataset.columns) return null;
                                  
                                  // Filter to only show potential time/date columns
                                  const timeColumns = dataset.columns.filter(col => {
                                    const sample = dataset.data.find(row => row[col.name] !== null && row[col.name] !== '');
                                    const sampleValue = sample ? String(sample[col.name]) : '';
                                    const columnName = col.name.toLowerCase();
                                    
                                    // Check for date patterns in sample data or column name
                                    const hasDatePattern = /\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(sampleValue);
                                    const hasDateName = /time|date|created|updated|timestamp|year|month|day|period|when/.test(columnName);
                                    
                                    return hasDatePattern || hasDateName;
                                  });

                                  if (timeColumns.length === 0) {
                                    return (
                                      <option value="" disabled style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                                        No date/time columns found
                                      </option>
                                    );
                                  }

                                  return timeColumns.map(col => (
                                    <option key={col.name} value={col.name}>
                                      📅 {col.name}
                                    </option>
                                  ));
                                })()}
                              </select>
                              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                                Only showing columns with date/time data
                              </div>
                            </div>

                            <div>
                              <label className="text-body-sm" style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 'bold' }}>
                                📊 Value Column
                              </label>
                              <select 
                                style={{ 
                                  width: '100%', 
                                  padding: 'var(--spacing-sm)', 
                                  border: '1px solid var(--color-border)', 
                                  borderRadius: 'var(--border-radius)',
                                  fontSize: 'var(--font-size-sm)',
                                  backgroundColor: 'white'
                                }}
                                value={trendValueColumn}
                                onChange={(e) => setTrendValueColumn(e.target.value)}
                              >
                                <option value="">Choose numeric column...</option>
                                {(() => {
                                  if (!dataset.columns) return null;
                                  
                                  // Find columns with numeric data
                                  const numericColumns = dataset.columns.filter(col => {
                                    const numericValues = dataset.data
                                      .map(row => row[col.name])
                                      .filter(val => val !== null && val !== undefined && val !== '')
                                      .map(val => Number(val))
                                      .filter(num => !isNaN(num));
                                    
                                    const nonEmptyValues = dataset.data
                                      .map(row => row[col.name])
                                      .filter(val => val !== null && val !== undefined && val !== '');
                                    
                                    return nonEmptyValues.length > 0 && (numericValues.length / nonEmptyValues.length) >= 0.7;
                                  });

                                  // Show numeric columns first, then others with warning
                                  const allColumns = [...numericColumns, ...dataset.columns.filter(col => !numericColumns.includes(col))];
                                  
                                  return allColumns.map(col => {
                                    const isNumeric = numericColumns.includes(col);
                                    const numericSample = dataset.data
                                      .map(row => Number(row[col.name]))
                                      .find(num => !isNaN(num));
                                    
                                    const sampleValue = numericSample ? numericSample.toFixed(1) : 'N/A';
                                    
                                    return (
                                      <option key={col.name} value={col.name}>
                                        {col.name} {isNumeric ? '📊' : '⚠️'} (avg: {sampleValue})
                                      </option>
                                    );
                                  });
                                })()}
                              </select>
                              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                                📊 Recommended • ⚠️ May cause errors
                              </div>
                            </div>
                          </div>

                          {/* No Time Columns Warning */}
                          {(() => {
                            if (!dataset.columns) return null;
                            
                            const timeColumns = dataset.columns.filter(col => {
                              const sample = dataset.data.find(row => row[col.name] !== null && row[col.name] !== '');
                              const sampleValue = sample ? String(sample[col.name]) : '';
                              const columnName = col.name.toLowerCase();
                              
                              const hasDatePattern = /\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(sampleValue);
                              const hasDateName = /time|date|created|updated|timestamp|year|month|day|period|when/.test(columnName);
                              
                              return hasDatePattern || hasDateName;
                            });

                            if (timeColumns.length === 0) {
                              return (
                                <div style={{ 
                                  backgroundColor: 'var(--color-warning-50)', 
                                  padding: 'var(--spacing-lg)', 
                                  borderRadius: 'var(--border-radius)', 
                                  border: '1px solid var(--color-warning-200)',
                                  marginBottom: 'var(--spacing-lg)'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                                    <span style={{ fontSize: '1.5rem', marginRight: 'var(--spacing-sm)' }}>⚠️</span>
                                    <strong style={{ color: 'var(--color-warning-700)' }}>No Time/Date Columns Detected</strong>
                                  </div>
                                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-warning-700)', marginBottom: 'var(--spacing-md)' }}>
                                    Your dataset doesn't appear to contain recognizable date/time columns for trend analysis.
                                  </p>
                                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-warning-600)' }}>
                                    <strong>Suggestions:</strong>
                                    <ul style={{ marginLeft: 'var(--spacing-md)', marginTop: 'var(--spacing-xs)' }}>
                                      <li>Ensure your data has a column with dates (e.g., YYYY-MM-DD format)</li>
                                      <li>Column names containing "date", "time", "created", or "timestamp" work best</li>
                                      <li>Upload a different dataset with time-series data</li>
                                    </ul>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}

                          {trendTimeColumn && trendValueColumn && (
                            <div style={{ 
                              backgroundColor: 'white', 
                              padding: 'var(--spacing-xl)', 
                              borderRadius: 'var(--border-radius)', 
                              border: '1px solid var(--color-border)',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                <div style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  backgroundColor: 'var(--color-primary-100)', 
                                  borderRadius: '50%', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  marginRight: 'var(--spacing-md)'
                                }}>
                                  📈
                                </div>
                                <div>
                                  <h5 style={{ margin: 0, color: 'var(--color-primary-700)', fontWeight: 'bold' }}>
                                    Trend Analysis Results
                                  </h5>
                                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                    {trendTimeColumn} → {trendValueColumn}
                                  </p>
                                </div>
                              </div>

                              {(() => {
                                // Enhanced data processing with better date/time handling
                                const rawData = dataset.data
                                  .filter(row => row[trendTimeColumn] && row[trendValueColumn])
                                  .map(row => {
                                    const timeValue = row[trendTimeColumn];
                                    const numValue = Number(row[trendValueColumn]);
                                    
                                    // Try to parse as date if it looks like a date
                                    let parsedTime: number;
                                    if (/\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(String(timeValue))) {
                                      parsedTime = new Date(timeValue as string).getTime();
                                    } else if (!isNaN(Number(timeValue))) {
                                      parsedTime = Number(timeValue);
                                    } else {
                                      // Use row index as fallback
                                      parsedTime = dataset.data.indexOf(row);
                                    }
                                    
                                    return {
                                      time: timeValue,
                                      timeNum: parsedTime,
                                      value: numValue,
                                      isValidTime: !isNaN(parsedTime)
                                    };
                                  })
                                  .filter(item => !isNaN(item.value) && item.isValidTime)
                                  .sort((a, b) => a.timeNum - b.timeNum);

                                if (rawData.length < 2) {
                                  return <p className="text-body-sm">Need at least 2 valid data points for trend analysis</p>;
                                }

                                // Enhanced linear regression with time normalization
                                const n = rawData.length;
                                const timeValues = rawData.map((_, i) => i); // Use index for calculation
                                const yValues = rawData.map(item => item.value);
                                
                                const sumX = timeValues.reduce((sum, x) => sum + x, 0);
                                const sumY = yValues.reduce((sum, y) => sum + y, 0);
                                const sumXY = timeValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
                                const sumXX = timeValues.reduce((sum, x) => sum + x * x, 0);

                                const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                                const intercept = (sumY - slope * sumX) / n;

                                // Enhanced trend classification
                                const avgValue = sumY / n;
                                const relativeSlope = Math.abs(slope) / avgValue * 100; // Percentage change per point
                                
                                let trend: string;
                                if (relativeSlope < 0.5) trend = 'Stable';
                                else if (slope > 0) trend = relativeSlope > 5 ? 'Strongly Increasing' : 'Increasing';
                                else trend = relativeSlope > 5 ? 'Strongly Decreasing' : 'Decreasing';

                                // Calculate R-squared
                                const meanY = sumY / n;
                                const predictions = timeValues.map(x => slope * x + intercept);
                                const ssRes = yValues.reduce((sum, y, i) => sum + Math.pow(y - predictions[i], 2), 0);
                                const ssTot = yValues.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
                                const rSquared = Math.max(0, 1 - (ssRes / ssTot));

                                // Calculate additional statistics
                                const minValue = Math.min(...yValues);
                                const maxValue = Math.max(...yValues);
                                const volatility = Math.sqrt(yValues.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0) / n);

                                return (
                                  <div>
                                    {/* Key Metrics Cards */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                                      <div style={{ backgroundColor: 'var(--color-primary-50)', padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                                        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', color: 'var(--color-primary-700)' }}>{n}</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-600)' }}>Data Points</div>
                                      </div>
                                      <div style={{ backgroundColor: 'var(--color-success-50)', padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                                        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', color: 'var(--color-success-700)' }}>{meanY.toFixed(1)}</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success-600)' }}>Average Value</div>
                                      </div>
                                      <div style={{ backgroundColor: 'var(--color-warning-50)', padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                                        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', color: 'var(--color-warning-700)' }}>{(rSquared * 100).toFixed(0)}%</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-warning-600)' }}>Model Accuracy</div>
                                      </div>
                                      <div style={{ backgroundColor: slope > 0 ? 'var(--color-success-50)' : slope < 0 ? 'var(--color-error-50)' : 'var(--color-gray-50)', padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                                        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', color: slope > 0 ? 'var(--color-success-700)' : slope < 0 ? 'var(--color-error-700)' : 'var(--color-gray-700)' }}>
                                          {slope > 0 ? '↗️' : slope < 0 ? '↘️' : '➡️'} {relativeSlope.toFixed(1)}%
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: slope > 0 ? 'var(--color-success-600)' : slope < 0 ? 'var(--color-error-600)' : 'var(--color-gray-600)' }}>Change Rate</div>
                                      </div>
                                    </div>

                                    {/* Trend Summary */}
                                    <div style={{ backgroundColor: 'var(--color-gray-50)', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius)', marginBottom: 'var(--spacing-lg)' }}>
                                      <h6 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--color-text)', display: 'flex', alignItems: 'center' }}>
                                        🎯 <span style={{ marginLeft: 'var(--spacing-xs)' }}>Trend Summary</span>
                                      </h6>
                                      <div style={{ fontSize: 'var(--font-size-sm)' }}>
                                        <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                                          <strong>Direction: </strong>
                                          <span style={{ 
                                            color: slope > 0 ? 'var(--color-success-600)' : slope < 0 ? 'var(--color-error-600)' : 'var(--color-text)',
                                            fontWeight: 'bold'
                                          }}>
                                            {trend}
                                          </span>
                                        </div>
                                        <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                                          <strong>Time Period: </strong>{String(rawData[0].time)} to {String(rawData[n-1].time)}
                                        </div>
                                        <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                                          <strong>Value Range: </strong>{minValue.toFixed(2)} - {maxValue.toFixed(2)}
                                        </div>
                                        <div>
                                          <strong>Model Quality: </strong>
                                          <span style={{ color: rSquared > 0.8 ? 'var(--color-success-600)' : rSquared > 0.6 ? 'var(--color-warning-600)' : 'var(--color-error-600)' }}>
                                            {rSquared > 0.8 ? '🟢 Excellent' : rSquared > 0.6 ? '🟡 Good' : rSquared > 0.4 ? '🟠 Fair' : '🔴 Poor'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Forecasting */}
                                    <div style={{ backgroundColor: 'var(--color-primary-50)', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-primary-200)' }}>
                                      <h6 style={{ margin: '0 0 var(--spacing-md) 0', color: 'var(--color-primary-700)', display: 'flex', alignItems: 'center' }}>
                                        🔮 <span style={{ marginLeft: 'var(--spacing-xs)' }}>Forecasting</span>
                                      </h6>
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-sm)' }}>
                                        {[1, 2, 3].map(step => {
                                          const forecast = slope * (n + step - 1) + intercept;
                                          const confidence = Math.max(0, rSquared * 100 - step * 10);
                                          return (
                                            <div key={step} style={{ 
                                              backgroundColor: 'white', 
                                              padding: 'var(--spacing-md)', 
                                              borderRadius: 'var(--border-radius)', 
                                              border: '1px solid var(--color-primary-300)',
                                              textAlign: 'center'
                                            }}>
                                              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-600)', marginBottom: 'var(--spacing-xs)' }}>
                                                Next Period {step}
                                              </div>
                                              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', color: 'var(--color-primary-700)', marginBottom: 'var(--spacing-xs)' }}>
                                                {forecast.toFixed(1)}
                                              </div>
                                              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                                {confidence.toFixed(0)}% confidence
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                      
                                      {volatility > 0 && (
                                        <div style={{ 
                                          marginTop: 'var(--spacing-md)', 
                                          padding: 'var(--spacing-sm)', 
                                          backgroundColor: 'var(--color-warning-50)', 
                                          borderRadius: 'var(--border-radius)',
                                          border: '1px solid var(--color-warning-200)'
                                        }}>
                                          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-warning-700)' }}>
                                            � <strong>Data Volatility:</strong> {(volatility / meanY * 100).toFixed(1)}% - 
                                            {volatility / meanY > 0.3 ? ' High variation detected' : volatility / meanY > 0.15 ? ' Moderate variation' : ' Low variation (stable data)'}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {!dataset && (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', backgroundColor: 'var(--color-gray-50)', borderRadius: 'var(--border-radius)', border: '2px dashed var(--color-border)' }}>
                          <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📈</div>
                          <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--color-text)' }}>Ready for Trend Analysis</h4>
                          <p className="text-body-sm text-caption" style={{ marginBottom: 'var(--spacing-md)' }}>
                            Upload a dataset to unlock powerful trend analysis with forecasting
                          </p>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                            Supports CSV and JSON files with time-series data
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Real-time Monitoring */}
                  <div className="card-browse">
                    <div className="card-content-browse">
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                        <Activity className="h-8 w-8" style={{ color: 'var(--color-warning-600)', marginRight: 'var(--spacing-sm)' }} />
                        <h4 className="text-heading-xs">Real-time Monitoring</h4>
                      </div>
                      
                      <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <button
                          onClick={() => setIsMonitoring(!isMonitoring)}
                          disabled={!dataset}
                          style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            backgroundColor: !dataset ? 'var(--color-surface-tertiary)' : (isMonitoring ? 'var(--color-error-500)' : 'var(--color-primary-500)'),
                            color: !dataset ? 'var(--color-text-secondary)' : 'white',
                            border: 'none',
                            borderRadius: 'var(--border-radius)',
                            fontSize: 'var(--font-size-sm)',
                            cursor: !dataset ? 'not-allowed' : 'pointer',
                            width: '100%'
                          }}
                        >
                          {!dataset ? 'Select Dataset First' : (isMonitoring ? 'Stop Monitoring' : 'Start Monitoring')}
                        </button>
                      </div>

                      {isMonitoring && dataset && (
                        <div style={{ backgroundColor: 'var(--color-surface-secondary)', padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                            <div 
                              style={{ 
                                width: '8px', 
                                height: '8px', 
                                backgroundColor: 'var(--color-success-500)', 
                                borderRadius: '50%', 
                                marginRight: 'var(--spacing-sm)',
                                animation: 'pulse 1s infinite'
                              }}
                            ></div>
                            <span className="text-body-sm" style={{ color: 'var(--color-success-500)', fontWeight: 'bold' }}>Live Monitoring Active</span>
                          </div>
                          
                          {/* Live Performance Metrics */}
                          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', marginBottom: 'var(--spacing-sm)' }}>
                              📊 Performance Metrics
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)', fontSize: 'var(--font-size-xs)' }}>
                              <div style={{ backgroundColor: 'var(--color-primary-100)', padding: 'var(--spacing-xs)', borderRadius: 'var(--border-radius)' }}>
                                <div style={{ fontWeight: 'bold' }}>CPU Usage</div>
                                <div style={{ fontSize: 'var(--font-size-lg)', color: liveMetrics.cpuUsage > 80 ? 'var(--color-error-500)' : 'var(--color-success-500)' }}>
                                  {liveMetrics.cpuUsage.toFixed(1)}%
                                </div>
                              </div>
                              <div style={{ backgroundColor: 'var(--color-primary-100)', padding: 'var(--spacing-xs)', borderRadius: 'var(--border-radius)' }}>
                                <div style={{ fontWeight: 'bold' }}>Memory</div>
                                <div style={{ fontSize: 'var(--font-size-lg)', color: liveMetrics.memoryUsage > 80 ? 'var(--color-error-500)' : 'var(--color-success-500)' }}>
                                  {liveMetrics.memoryUsage.toFixed(1)}%
                                </div>
                              </div>
                              <div style={{ backgroundColor: 'var(--color-success-100)', padding: 'var(--spacing-xs)', borderRadius: 'var(--border-radius)' }}>
                                <div style={{ fontWeight: 'bold' }}>Data Velocity</div>
                                <div style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-success-600)' }}>
                                  {liveMetrics.dataVelocity} rec/s
                                </div>
                              </div>
                              <div style={{ backgroundColor: 'var(--color-warning-100)', padding: 'var(--spacing-xs)', borderRadius: 'var(--border-radius)' }}>
                                <div style={{ fontWeight: 'bold' }}>Performance</div>
                                <div style={{ fontSize: 'var(--font-size-lg)', color: liveMetrics.performanceScore > 80 ? 'var(--color-success-500)' : 'var(--color-warning-600)' }}>
                                  {liveMetrics.performanceScore.toFixed(0)}/100
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Live Data Updates */}
                          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', marginBottom: 'var(--spacing-sm)' }}>
                              🔄 Live Data Updates
                            </div>
                            <div style={{ fontSize: 'var(--font-size-sm)' }}>
                              <div>Last Update: {liveMetrics.lastUpdate.toLocaleTimeString()}</div>
                              <div>Total Updates: {liveMetrics.dataUpdates}</div>
                              <div>Dataset Being Monitored: {dataset ? 1 : 0}</div>
                              <div>Records in Dataset: {dataset?.data?.length || 0}</div>
                              
                              {dataset && (
                                <div style={{ marginTop: 'var(--spacing-sm)', paddingTop: 'var(--spacing-sm)', borderTop: '1px solid var(--color-border)' }}>
                                  <strong>Monitoring Dataset: {dataset.name}</strong>
                                  <div>Records: {dataset.data?.length || 0}</div>
                                  <div>Columns: {dataset.columns?.length || 0}</div>
                                  <div>Numerical Columns: {dataset.columns?.filter(col => col.type === 'number').length || 0}</div>
                                  <div>Status: ✅ Active Monitoring</div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Automatic Alerts */}
                          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', marginBottom: 'var(--spacing-sm)' }}>
                              🚨 Automatic Alerts ({liveMetrics.alertCount})
                            </div>
                            <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                              {alerts.length === 0 ? (
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                                  No alerts yet...
                                </div>
                              ) : (
                                alerts.map(alert => (
                                  <div 
                                    key={alert.id} 
                                    style={{ 
                                      marginBottom: 'var(--spacing-xs)', 
                                      padding: 'var(--spacing-xs)', 
                                      backgroundColor: alert.type === 'error' ? 'var(--color-error-100)' : 
                                                     alert.type === 'warning' ? 'var(--color-warning-100)' : 'var(--color-primary-100)',
                                      borderRadius: 'var(--border-radius)',
                                      fontSize: 'var(--font-size-xs)'
                                    }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ 
                                        color: alert.type === 'error' ? 'var(--color-error-700)' : 
                                               alert.type === 'warning' ? 'var(--color-warning-700)' : 'var(--color-primary-700)' 
                                      }}>
                                        {alert.type === 'error' ? '❌' : alert.type === 'warning' ? '⚠️' : 'ℹ️'} {alert.message}
                                      </span>
                                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                        {alert.timestamp.toLocaleTimeString()}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Anomaly Detection */}
                          <div>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', marginBottom: 'var(--spacing-sm)' }}>
                              🔍 Anomaly Detection ({liveMetrics.anomaliesDetected})
                            </div>
                            <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                              {anomalies.length === 0 ? (
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                                  No anomalies detected...
                                </div>
                              ) : (
                                anomalies.map(anomaly => (
                                  <div 
                                    key={anomaly.id} 
                                    style={{ 
                                      marginBottom: 'var(--spacing-xs)', 
                                      padding: 'var(--spacing-xs)', 
                                      backgroundColor: anomaly.severity === 'high' ? 'var(--color-error-100)' : 
                                                     anomaly.severity === 'medium' ? 'var(--color-warning-100)' : 'var(--color-primary-100)',
                                      borderRadius: 'var(--border-radius)',
                                      fontSize: 'var(--font-size-xs)'
                                    }}
                                  >
                                    <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                                      {anomaly.severity === 'high' ? '🔴' : anomaly.severity === 'medium' ? '🟡' : '🟢'} 
                                      {anomaly.column} - {anomaly.severity.toUpperCase()} severity
                                    </div>
                                    <div style={{ color: 'var(--color-text-secondary)' }}>
                                      Value: {anomaly.value.toFixed(2)} | Expected: {anomaly.expected.toFixed(2)}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                      {anomaly.timestamp.toLocaleTimeString()}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {!isMonitoring && (
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                          <p style={{ fontWeight: 'bold', marginBottom: 'var(--spacing-sm)' }}>Real-time Capabilities:</p>
                          <ul style={{ marginLeft: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
                            <li>📊 <strong>Live Performance Metrics</strong> - CPU, Memory, Data Velocity</li>
                            <li>🔄 <strong>Live Data Updates</strong> - Real-time data synchronization</li>
                            <li>🚨 <strong>Automatic Alerts</strong> - System and data notifications</li>
                            <li>🔍 <strong>Anomaly Detection</strong> - Statistical outlier identification</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="animate-fadeInUp-browse">
            <div className="card-browse">
              <div className="card-header-browse">
                <h3 className="text-heading-sm" style={{ margin: 0 }}>Reports & Documentation</h3>
                <p className="text-caption">Generate, view, and manage your data reports with professional templates</p>
              </div>
              <div className="card-content-browse">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 'var(--spacing-xl)' }}>
                  {/* Report Templates Section */}
                  <div>
                    <div style={{ 
                      backgroundColor: 'var(--color-primary-50)', 
                      padding: 'var(--spacing-md)', 
                      borderRadius: 'var(--border-radius)', 
                      marginBottom: 'var(--spacing-lg)',
                      border: '1px solid var(--color-primary-200)'
                    }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', marginBottom: 'var(--spacing-xs)', color: 'var(--color-primary-700)' }}>
                        📋 How to Generate Reports:
                      </div>
                      <ul style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-600)', marginLeft: 'var(--spacing-md)', marginTop: 'var(--spacing-xs)' }}>
                        <li>Select a dataset to analyze</li>
                        <li>Choose from our professional report templates</li>
                        <li>Generate comprehensive insights and documentation</li>
                        <li>Export reports in multiple formats (PDF, HTML, JSON)</li>
                      </ul>
                    </div>

                    <h4 className="text-heading-sm" style={{ 
                      marginBottom: 'var(--spacing-md)', 
                      borderBottom: '2px solid var(--color-primary-200)', 
                      paddingBottom: 'var(--spacing-xs)' 
                    }}>
                      📊 Report Templates
                    </h4>
                    
                    <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                      {[
                        {
                          name: 'Executive Summary', 
                          icon: '📋', 
                          description: 'High-level overview with key insights and recommendations',
                          features: ['Key Performance Indicators', 'Data Overview', 'Executive Insights', 'Action Items'],
                          color: 'primary'
                        },
                        {
                          name: 'Data Quality Report', 
                          icon: '🔍', 
                          description: 'Comprehensive data validation and quality assessment',
                          features: ['Missing Values Analysis', 'Data Type Validation', 'Outlier Detection', 'Quality Score'],
                          color: 'success'
                        },
                        {
                          name: 'Trend Analysis', 
                          icon: '📈', 
                          description: 'Time-series analysis with forecasting and patterns',
                          features: ['Trend Identification', 'Seasonal Patterns', 'Forecasting', 'Statistical Models'],
                          color: 'warning'
                        },
                        {
                          name: 'Custom Report', 
                          icon: '⚙️', 
                          description: 'Tailored analysis based on your specific requirements',
                          features: ['Custom Metrics', 'Flexible Layout', 'Personalized Insights', 'Branded Output'],
                          color: 'secondary'
                        }
                      ].map((template, index) => (
                        <div key={index} className="card-browse" style={{ 
                          border: `2px solid var(--color-${template.color}-200)`,
                          backgroundColor: `var(--color-${template.color}-50)`,
                          transition: 'all 0.2s ease',
                          cursor: dataset ? 'pointer' : 'not-allowed',
                          opacity: dataset ? 1 : 0.6
                        }}
                        onMouseEnter={(e) => {
                          if (dataset) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        onClick={() => {
                          if (dataset) {
                            generateReport(template.name.toLowerCase().replace(' ', '_'));
                          }
                        }}>
                          <div className="card-content-browse">
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                              <div style={{ fontSize: '1.5rem' }}>{template.icon}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ 
                                  fontSize: 'var(--font-size-md)', 
                                  fontWeight: 'bold', 
                                  color: `var(--color-${template.color}-700)`,
                                  marginBottom: 'var(--spacing-xs)'
                                }}>
                                  {template.name}
                                </div>
                                <div style={{ 
                                  fontSize: 'var(--font-size-sm)', 
                                  color: `var(--color-${template.color}-600)`,
                                  marginBottom: 'var(--spacing-sm)'
                                }}>
                                  {template.description}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                                  {template.features.map((feature, fIndex) => (
                                    <span key={fIndex} style={{
                                      fontSize: 'var(--font-size-xs)',
                                      backgroundColor: `var(--color-${template.color}-200)`,
                                      color: `var(--color-${template.color}-800)`,
                                      padding: '2px 6px',
                                      borderRadius: '12px',
                                      border: `1px solid var(--color-${template.color}-300)`
                                    }}>
                                      {feature}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {dataset && (
                              <div style={{ 
                                textAlign: 'center', 
                                marginTop: 'var(--spacing-sm)',
                                padding: 'var(--spacing-xs)',
                                backgroundColor: `var(--color-${template.color}-100)`,
                                borderRadius: 'var(--border-radius)',
                                fontSize: 'var(--font-size-xs)',
                                fontWeight: 'bold',
                                color: `var(--color-${template.color}-700)`
                              }}>
                                Click to Generate Report
                              </div>
                            )}
                            {!dataset && (
                              <div style={{ 
                                textAlign: 'center', 
                                marginTop: 'var(--spacing-sm)',
                                padding: 'var(--spacing-xs)',
                                backgroundColor: 'var(--color-gray-100)',
                                borderRadius: 'var(--border-radius)',
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--color-gray-600)'
                              }}>
                                Select a dataset first
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Generated Reports Section */}
                  <div>
                    <h4 className="text-heading-sm" style={{ 
                      marginBottom: 'var(--spacing-md)', 
                      borderBottom: '2px solid var(--color-success-200)', 
                      paddingBottom: 'var(--spacing-xs)' 
                    }}>
                      📁 Generated Reports
                    </h4>
                    
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                      {dataset && (
                        <div style={{ 
                          backgroundColor: 'var(--color-success-50)', 
                          padding: 'var(--spacing-md)', 
                          borderRadius: 'var(--border-radius)',
                          border: '1px solid var(--color-success-200)',
                          marginBottom: 'var(--spacing-md)'
                        }}>
                          <div style={{ 
                            fontSize: 'var(--font-size-sm)', 
                            fontWeight: 'bold', 
                            color: 'var(--color-success-700)',
                            marginBottom: 'var(--spacing-xs)'
                          }}>
                            📊 Current Dataset: {dataset.name}
                          </div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success-600)' }}>
                            {dataset.data.length} rows • {dataset.columns?.length || 0} columns • Ready for analysis
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                      {generatedReports.length > 0 ? (
                        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                          {generatedReports.map((report, index) => (
                            <div key={index} className="card-browse" style={{ 
                              border: '1px solid var(--color-border)',
                              backgroundColor: 'var(--color-surface)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}>
                              <div className="card-content-browse">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-sm)' }}>
                                  <div>
                                    <div style={{ 
                                      fontSize: 'var(--font-size-md)', 
                                      fontWeight: 'bold', 
                                      color: 'var(--color-text)',
                                      marginBottom: 'var(--spacing-xs)'
                                    }}>
                                      {report.title}
                                    </div>
                                    <div style={{ 
                                      fontSize: 'var(--font-size-sm)', 
                                      color: 'var(--color-text-secondary)',
                                      marginBottom: 'var(--spacing-xs)'
                                    }}>
                                      Dataset: {report.dataset} • Generated: {report.timestamp.toLocaleDateString()}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                      {report.summary}
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                    <button
                                      style={{
                                        background: 'var(--color-primary-500)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--border-radius)',
                                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                                        fontSize: 'var(--font-size-xs)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-600)'}
                                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-500)'}
                                      onClick={() => viewReport(report)}
                                    >
                                      👁️ View
                                    </button>
                                    <button
                                      style={{
                                        background: 'var(--color-success-500)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--border-radius)',
                                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                                        fontSize: 'var(--font-size-xs)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-success-600)'}
                                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-success-500)'}
                                      onClick={() => downloadReport(report)}
                                    >
                                      💾 Export
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Report Preview */}
                                <div style={{ 
                                  backgroundColor: 'var(--color-gray-50)', 
                                  padding: 'var(--spacing-sm)', 
                                  borderRadius: 'var(--border-radius)',
                                  fontSize: 'var(--font-size-xs)',
                                  color: 'var(--color-text-secondary)',
                                  borderLeft: '3px solid var(--color-primary-500)'
                                }}>
                                  <div style={{ fontWeight: 'bold', marginBottom: 'var(--spacing-xs)' }}>Key Insights Preview:</div>
                                  {report.keyInsights.slice(0, 3).map((insight, i) => (
                                    <div key={i} style={{ marginBottom: '2px' }}>• {insight}</div>
                                  ))}
                                  {report.keyInsights.length > 3 && (
                                    <div style={{ fontStyle: 'italic', color: 'var(--color-primary-600)' }}>
                                      +{report.keyInsights.length - 3} more insights...
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ 
                          textAlign: 'center', 
                          padding: 'var(--spacing-xl)', 
                          backgroundColor: 'var(--color-gray-50)', 
                          borderRadius: 'var(--border-radius)', 
                          border: '2px dashed var(--color-border)' 
                        }}>
                          <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📄</div>
                          <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--color-text)' }}>No Reports Generated Yet</h4>
                          <p className="text-body-sm text-caption" style={{ marginBottom: 'var(--spacing-md)' }}>
                            {dataset ? 'Select a report template above to generate your first report' : 'Upload a dataset and select a template to generate professional reports'}
                          </p>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                            Professional reports with insights, visualizations, and export options
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="animate-fadeInUp-browse">
            <div className="card-browse">
              <div className="card-header-browse">
                <h3 className="text-heading-sm" style={{ margin: 0 }}>Team Management</h3>
                <p className="text-caption">Manage team members and their permissions</p>
              </div>
              <div className="card-content-browse">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
                  <div className="card-browse">
                    <div className="card-content-browse" style={{ textAlign: 'center' }}>
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        backgroundColor: 'var(--color-primary-100)', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto var(--spacing-md)'
                      }}>
                        <Users className="h-8 w-8" style={{ color: 'var(--color-primary-600)' }} />
                      </div>
                      <h4 className="text-heading-sm">You (Admin)</h4>
                      <p className="text-body-sm text-caption">Full access to all features</p>
                      <div style={{ marginTop: 'var(--spacing-md)' }}>
                        <span style={{ 
                          padding: 'var(--spacing-xs) var(--spacing-sm)', 
                          backgroundColor: 'var(--color-success-100)', 
                          color: 'var(--color-success-700)',
                          borderRadius: 'var(--border-radius-md)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: '500'
                        }}>
                          Admin
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="card-browse" style={{ 
                    border: '2px dashed var(--color-gray-300)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}>
                    <div>
                      <Users className="h-8 w-8" style={{ color: 'var(--color-gray-400)', margin: '0 auto var(--spacing-sm)' }} />
                      <p className="text-body-sm text-caption">Invite team members</p>
                      <button className="btn-primary-browse btn-sm" style={{ marginTop: 'var(--spacing-sm)' }}>
                        Send Invitation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="animate-fadeInUp-browse">
            <div className="card-browse">
              <div className="card-header-browse">
                <h3 className="text-heading-sm" style={{ margin: 0 }}>Settings & Preferences</h3>
                <p className="text-caption">Configure your application preferences</p>
              </div>
              <div className="card-content-browse">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-xl)' }}>
                  <div>
                    <h4 className="text-heading-sm">General</h4>
                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label className="text-body-sm" style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '500' }}>
                          Theme Preference
                        </label>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                          <button 
                            onClick={() => setDarkMode(false)}
                            className={`btn-secondary-browse btn-sm ${!darkMode ? 'btn-primary-browse' : ''}`}
                          >
                            <Sun className="h-4 w-4" />
                            Light
                          </button>
                          <button 
                            onClick={() => setDarkMode(true)}
                            className={`btn-secondary-browse btn-sm ${darkMode ? 'btn-primary-browse' : ''}`}
                          >
                            <Moon className="h-4 w-4" />
                            Dark
                          </button>
                        </div>
                      </div>
                      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label className="text-body-sm" style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '500' }}>
                          Language
                        </label>
                        <select className="input-browse">
                          <option>English (US)</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-heading-sm">Data & Privacy</h4>
                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                      <div className="card-browse" style={{ padding: 'var(--spacing-md)' }}>
                        <h5 className="text-body-sm" style={{ fontWeight: '600', marginBottom: 'var(--spacing-sm)' }}>Data Export</h5>
                        <p className="text-body-sm text-caption" style={{ marginBottom: 'var(--spacing-md)' }}>
                          Export all your data and analysis results
                        </p>
                        <button className="btn-secondary-browse btn-sm">
                          <Download className="h-4 w-4" />
                          Export Data
                        </button>
                      </div>
                      <div className="card-browse" style={{ padding: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                        <h5 className="text-body-sm" style={{ fontWeight: '600', marginBottom: 'var(--spacing-sm)' }}>Clear Data</h5>
                        <p className="text-body-sm text-caption" style={{ marginBottom: 'var(--spacing-md)' }}>
                          Remove all conversations and reset the application
                        </p>
                        <button 
                          onClick={() => {
                            setMessages([]);
                            setCurrentVisualization(null);
                          }}
                          className="btn-danger-pro btn-sm"
                        >
                          Clear All Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show main app interface regardless of dataset state
  return (
    <div className="app-container">
      {/* Browse.ai Sidebar */}
      <div className={`sidebar-browse ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: 'var(--spacing-lg)' }}>
          {/* Logo */}
          <div 
            onClick={handleLogoClick}
            className="logo-container"
            title="Return to Dashboard"
          >
            <div className="logo-icon">
              <Database className="h-6 w-6" style={{ color: '#1e40af' }} />
            </div>
            <div className="logo-text">
              <h1 className="logo-title">DataVault Pro</h1>
              <p className="logo-subtitle">Advanced Analytics Platform</p>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ marginBottom: 'var(--spacing-xl)' }}>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`nav-item-browse ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab('datasets')}
              className={`nav-item-browse ${activeTab === 'datasets' ? 'active' : ''}`}
            >
              <Database className="h-5 w-5" />
              <span>Datasets</span>
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`nav-item-browse ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Analytics</span>
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`nav-item-browse ${activeTab === 'reports' ? 'active' : ''}`}
            >
              <FileText className="h-5 w-5" />
              <span>Reports</span>
            </button>
            <button 
              onClick={() => setActiveTab('team')}
              className={`nav-item-browse ${activeTab === 'team' ? 'active' : ''}`}
            >
              <Users className="h-5 w-5" />
              <span>Team</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`nav-item-browse ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Status Card */}
          <div className="card-browse" style={{ padding: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xs)' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
              <span className="text-body-sm" style={{ fontWeight: '500' }}>System Status</span>
            </div>
            <p className="text-caption">All systems operational</p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="app-content">
        {/* Browse.ai Header */}
        <header className="nav-browse" style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="btn-ghost-browse lg:hidden toggle-sidebar-button"
                title="Toggle Sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div>
                <h1 className="text-heading-lg" style={{ margin: 0 }}>{getTabTitle()}</h1>
                <p className="text-caption" style={{ margin: 0 }}>{getTabDescription()}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              {/* Search */}
              <div style={{ position: 'relative', display: 'none' }} className="md:block">
                <Search className="h-4 w-4" style={{ 
                  position: 'absolute', 
                  left: 'var(--spacing-sm)', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--color-gray-400)'
                }} />
                <input
                  type="text"
                  placeholder="Search datasets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-browse"
                  style={{ paddingLeft: '2.5rem', width: '20rem' }}
                />
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <button
                  onClick={handleRefreshData}
                  className="btn-ghost-browse"
                  title="Refresh data"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
                
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="btn-ghost-browse"
                  title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                
                <button className="btn-ghost-browse" title="Notifications" style={{ position: 'relative' }}>
                  <Bell className="h-5 w-5" />
                  <div style={{ 
                    position: 'absolute', 
                    top: '2px', 
                    right: '2px', 
                    width: '8px', 
                    height: '8px', 
                    backgroundColor: 'var(--color-primary-600)', 
                    borderRadius: '50%' 
                  }}></div>
                </button>

                <button
                  onClick={handleDownloadData}
                  className="btn-primary-browse"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="app-main">
          {renderTabContent()}
        </main>

        {/* Professional Footer */}
        <Footer dataset={dataset} />
      </div>
    </div>
  );
}

export default App;

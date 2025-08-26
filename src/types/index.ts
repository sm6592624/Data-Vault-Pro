// Data structure definitions for the analytics platform

export interface DataPoint {
  id: string;
  timestamp: string;
  value: number;
  category: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  data: Record<string, unknown>[];
  columns: Column[];
  schema?: DataSchema;
  metadata?: {
    uploadDate?: string;
    recordCount?: number;
    fileSize?: number;
    [key: string]: unknown;
  };
}

export interface DataSchema {
  columns: Column[];
}

export interface Column {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  description?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'system';
  content: string;
  timestamp: Date;
  visualization?: VisualizationConfig;
}

export interface VisualizationConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'table';
  title: string;
  data: DataPoint[];
  options?: Record<string, string | number | boolean>;
}

export interface SystemResponse {
  message: string;
  query?: string;
  visualization?: VisualizationConfig;
  insights?: string[];
}

export interface QueryContext {
  dataset: Dataset;
  previousMessages: ChatMessage[];
  userQuery: string;
}

export interface APIError {
  message: string;
  code: string;
  details?: Record<string, string | number | boolean>;
}

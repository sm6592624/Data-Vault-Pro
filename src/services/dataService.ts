import type { Dataset } from '../types';
import { generateId } from '../lib/utils';

export class DataService {
  private static instance: DataService;

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  generateSampleData(): Dataset {
    const startDate = new Date('2024-01-01');
    const data: Record<string, unknown>[] = [];
    const categories = ['Sales', 'Marketing', 'Engineering', 'Support', 'Operations'];

    // Generate 50 sample data points
    for (let i = 0; i < 50; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i * 7); // Weekly data points

      data.push({
        id: generateId(),
        timestamp: date.toISOString(),
        value: Math.floor(Math.random() * 1000) + 100,
        category: categories[Math.floor(Math.random() * categories.length)],
        region: Math.random() > 0.5 ? 'North' : 'South',
        priority: Math.random() > 0.7 ? 'High' : 'Normal'
      });
    }

    return {
      id: 'sample-dataset',
      name: 'Sample Business Data',
      description: 'A sample dataset containing business metrics across different departments',
      data,
      columns: [
        { name: 'id', type: 'string', description: 'Unique identifier' },
        { name: 'timestamp', type: 'date', description: 'Date of the data point' },
        { name: 'value', type: 'number', description: 'Metric value' },
        { name: 'category', type: 'string', description: 'Department category' },
        { name: 'metadata', type: 'string', description: 'Additional metadata' }
      ],
      schema: {
        columns: [
          { name: 'id', type: 'string', description: 'Unique identifier' },
          { name: 'timestamp', type: 'date', description: 'Date of the data point' },
          { name: 'value', type: 'number', description: 'Metric value' },
          { name: 'category', type: 'string', description: 'Department category' },
          { name: 'metadata', type: 'string', description: 'Additional metadata' }
        ]
      },
      metadata: {
        uploadDate: new Date().toISOString(),
        recordCount: data.length,
        fileSize: JSON.stringify(data).length
      }
    };
  }

  async loadDataset(source: string): Promise<Dataset> {
    // In a real application, this would load data from various sources
    // For now, we'll return sample data
    console.log(`Loading dataset from: ${source}`);
    return this.generateSampleData();
  }

  filterData(dataset: Dataset, filters: Record<string, unknown>): Record<string, unknown>[] {
    return dataset.data.filter(point => {
      return Object.entries(filters).every(([key, value]) => {
        if (key === 'dateRange') {
          const range = value as { start: string; end: string };
          const pointDate = new Date(point.timestamp as string);
          return pointDate >= new Date(range.start) && pointDate <= new Date(range.end);
        }
        
        if (key === 'category') {
          return point.category === value;
        }
        
        if (key === 'minValue') {
          return (point.value as number) >= (value as number);
        }
        
        if (key === 'maxValue') {
          return (point.value as number) <= (value as number);
        }
        
        return true;
      });
    });
  }

  aggregateData(data: Record<string, unknown>[], groupBy: string): Record<string, number> {
    return data.reduce((acc: Record<string, number>, point) => {
      let key: string;
      
      if (groupBy === 'category') {
        key = point.category as string;
      } else if (groupBy === 'month') {
        key = new Date(point.timestamp as string).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
      } else {
        key = 'Total';
      }
      
      acc[key] = (acc[key] || 0) + (point.value as number);
      return acc;
    }, {});
  }
}

export const dataService = DataService.getInstance();

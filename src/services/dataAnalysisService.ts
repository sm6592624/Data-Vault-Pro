import OpenAI from 'openai';
import type { SystemResponse, QueryContext } from '../types';

// Data analysis service integration
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
  dangerouslyAllowBrowser: true // not ideal but needed for demo
});

export class DataAnalysisService {
  private static instance: DataAnalysisService;

  static getInstance(): DataAnalysisService {
    if (!DataAnalysisService.instance) {
      DataAnalysisService.instance = new DataAnalysisService();
    }
    return DataAnalysisService.instance;
  }

  async queryData(context: QueryContext): Promise<SystemResponse> {
    try {
      // fallback to mock if no real API key - keeps demo working
      if (!import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY === 'demo-key') {
        return this.getMockResponse(context);
      }

      const systemPrompt = this.buildSystemPrompt(context.dataset);
      const userPrompt = this.buildUserPrompt(context);

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const aiResponse = completion.choices[0]?.message?.content || '';
      return this.parseResponse(aiResponse);
    } catch (error) {
      console.error('AI query failed:', error);
      return {
        message: "Sorry, I'm having trouble right now. Please try again in a moment.",
        insights: ["Service temporarily unavailable"]
      };
    }
  }

  private buildSystemPrompt(dataset: QueryContext['dataset']): string {
    return `You are a data analysis assistant. You help users explore and understand their data through natural language queries.

Dataset Information:
- Name: ${dataset.name}
- Description: ${dataset.description}
- Columns: ${(dataset.schema?.columns || []).map((col) => `${col.name} (${col.type})`).join(', ')}
- Total records: ${dataset.data.length}

Your role:
1. Interpret user queries about the data
2. Suggest appropriate visualizations
3. Provide insights and patterns
4. Respond conversationally

Always respond in JSON format with the following structure:
{
  "message": "conversational response",
  "query": "SQL-like query if applicable",
  "visualization": {
    "type": "chart type",
    "title": "chart title",
    "data": "filtered/aggregated data",
    "options": {}
  },
  "insights": ["key insights array"]
}`;
  }

  private buildUserPrompt(context: QueryContext): string {
    const recentMessages = context.previousMessages
      .slice(-3)
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    return `Previous conversation:
${recentMessages}

Current user query: ${context.userQuery}

Available data sample:
${JSON.stringify(context.dataset.data.slice(0, 3), null, 2)}`;
  }

  private parseResponse(response: string): SystemResponse {
    try {
      const parsed = JSON.parse(response);
      return {
        message: parsed.message || response,
        query: parsed.query,
        visualization: parsed.visualization,
        insights: parsed.insights || []
      };
    } catch {
      return {
        message: response,
        insights: []
      };
    }
  }

  private getMockResponse(context: QueryContext): SystemResponse {
    const query = context.userQuery.toLowerCase();
    
    // Simple pattern matching for demo
    if (query.includes('trend') || query.includes('over time')) {
      return {
        message: "I can see you're interested in trends over time. Let me show you a line chart of the data.",
        visualization: {
          type: 'line',
          title: 'Trends Over Time',
          data: context.dataset.data.slice(0, 10).map((item, index) => ({
            id: `point-${index}`,
            timestamp: String(item.timestamp || new Date().toISOString()),
            value: Number(item.value || 0),
            category: String(item.category || 'default'),
            metadata: Object.fromEntries(
              Object.entries(item).map(([k, v]) => [k, typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? v : String(v)])
            )
          })),
          options: { showTrendLine: true }
        },
        insights: [
          "The data shows an upward trend over the selected period",
          "Peak values occur during certain time intervals"
        ]
      };
    }

    if (query.includes('compare') || query.includes('category')) {
      return {
        message: "I'll create a comparison chart showing the different categories in your data.",
        visualization: {
          type: 'bar',
          title: 'Category Comparison',
          data: context.dataset.data.slice(0, 8).map((item, index) => ({
            id: `point-${index}`,
            timestamp: String(item.timestamp || new Date().toISOString()),
            value: Number(item.value || 0),
            category: String(item.category || 'default'),
            metadata: Object.fromEntries(
              Object.entries(item).map(([k, v]) => [k, typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? v : String(v)])
            )
          })),
          options: { groupBy: 'category' }
        },
        insights: [
          "Some categories show significantly higher values",
          "Distribution appears to follow a pattern"
        ]
      };
    }

    if (query.includes('total') || query.includes('sum')) {
      const total = context.dataset.data.reduce((sum, point) => sum + Number(point.value || 0), 0);
      return {
        message: `The total sum across all data points is ${total.toLocaleString()}.`,
        insights: [
          `Total value: ${total.toLocaleString()}`,
          `Average value: ${(total / context.dataset.data.length).toFixed(2)}`
        ]
      };
    }

    return {
      message: "I understand you want to explore the data. Could you be more specific about what you'd like to see? For example, try asking about trends, comparisons, or totals.",
      insights: [
        "Try asking about 'trends over time'",
        "Ask for 'category comparisons'",
        "Request 'total values' or summaries"
      ]
    };
  }
}

export const aiService = DataAnalysisService.getInstance();

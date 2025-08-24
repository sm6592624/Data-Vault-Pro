# DataVault Pro - Advanced Analytics Platform

A modern data analytics dashboard built with React and TypeScript that lets you explore your data through AI-powered conversations and interactive visualizations.

![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue) ![React](https://img.shields.io/badge/React-19+-61dafb) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8) ![Vite](https://img.shields.io/badge/Vite-7.1+-purple)

## What is this?

I built this because I was tired of jumping between Excel, Tableau, and various other tools just to get quick insights from CSV files. This app lets you upload your data and literally just ask questions about it in plain English.

The AI analyzes your data and gives you both written insights and interactive charts. It's like having a data analyst that never gets tired of your questions.

## Key Features

###  Chat with your data


- Upload CSV files and ask questions in natural language
- Get instant insights and explanations
- AI remembers the conversation context
- Quick action buttons for common questions

###  Interactive visualizations  

- Auto-generated charts based on your questions
- Bar charts, line charts, pie charts, tables
- Hover for details, click to interact
- Export functionality (though I haven't fully tested all formats yet)

###  Clean, modern interface

- Dark sidebar with gradient logo (took way too long to get right)
- Glass morphism effects throughout
- Responsive design that works on mobile
- Browse.ai-inspired styling

###  Dashboard overview

- Live metrics and stats
- Dataset management
- Quick access to recent analyses
- System performance monitoring (mostly for show, but it works)

## Tech Stack

**Frontend:**

- React 19 with TypeScript 5.8+
- Tailwind CSS for styling
- Vite for build tooling
- Recharts for data visualization
- Lucide React for icons

**AI Integration:**

- OpenAI API for natural language processing
- Fallback to mock responses for demo purposes
- Custom prompt engineering for data analysis

**Development:**

- ESLint for code quality
- PostCSS for advanced CSS features
- Comprehensive TypeScript configuration

## Getting Started

### Prerequisites

- Node.js 18+ (I'm using 20.x)
- npm or yarn
- Optional: OpenAI API key for real AI responses

### Installation

`ash
# Clone the repo
git clone https://github.com/sm6592624/Data-Vault-Pro.git
cd Data-Vault-Pro

# Install dependencies
npm install

# Start development server
npm run dev
`

Open [http://localhost:5173](http://localhost:5173) and you should see the dashboard.

### Setting up AI (optional)

If you want real AI responses instead of the demo ones:

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Create a .env file in the root directory:

`env
VITE_OPENAI_API_KEY=your_api_key_here
`

3. Restart the dev server

**Note:** The app works fine without this - it just uses mock responses that are pretty realistic.

## Usage

1. **Upload your data**: Drag and drop a CSV file or use the upload button
2. **Start chatting**: Ask questions like "What's the average sales by region?" or "Show me trends over time"
3. **Explore visualizations**: Click on charts to interact, hover for details
4. **Export results**: Download your data or charts (though some export formats might be buggy)

### Example questions to try

- "What are the top 5 categories by sales?"
- "Show me the trend over the last 6 months"
- "Which region has the highest growth rate?"
- "Create a pie chart of customer segments"

## Project Structure

`
src/
 components/          # React components
    ChatInterface.tsx    # Main chat UI
    DataVisualization.tsx # Chart rendering
    DashboardStats.tsx   # Stats cards
    ...
 services/           # Business logic
    aiService.ts        # AI/OpenAI integration
    dataService.ts      # Data processing
 types/              # TypeScript definitions
 lib/                # Utilities
 App.tsx             # Main app component (quite large, should probably split it)
`

## Known Issues & TODOs

- [ ] File upload sometimes fails on very large CSVs (>10MB)
- [ ] Export functionality needs more testing
- [ ] Could use better error handling in some places
- [ ] The main App.tsx is getting huge - needs refactoring
- [ ] Some inline styles should be moved to CSS classes (ESLint keeps complaining)
- [ ] Mobile experience could be improved
- [ ] Add support for JSON file uploads
- [ ] Implement user authentication for saved datasets

## Development Notes

Built this over a few weeks as a side project. Started with create-react-app but switched to Vite because the build times were driving me crazy.

The AI integration was tricky - had to do a lot of prompt engineering to get consistent, useful responses. The mock responses are based on real patterns I observed from the OpenAI API.

Styling took longer than expected. Went through several iterations before settling on the current Browse.ai-inspired design. The logo animation was particularly painful to get right.

## Contributing

Feel free to open issues or submit PRs. This is mostly a personal project but I'm happy to review contributions.

Some areas that could use help:

- Better mobile responsiveness
- Additional chart types
- Performance optimizations
- More robust error handling
- Better test coverage (currently minimal)

## License

MIT License - feel free to use this for whatever you want.

## Credits

- Built with React, TypeScript, and a lot of coffee
- OpenAI for the language model integration
- Recharts for the visualization components
- Tailwind CSS for making styling bearable
- The countless Stack Overflow answers that helped debug weird issues

---

**Live Demo**: [http://localhost:5173](http://localhost:5173) *(when running locally)*

*Questions? Issues? Feel free to open a GitHub issue or reach out.*

---

## 🚀 Deploying to Vercel

This project is ready for deployment on [Vercel](https://vercel.com/):

1. **Push your code to GitHub** (already done!)
2. **Go to [vercel.com](https://vercel.com/) and import your repository**
3. **Framework Preset**: Vercel will auto-detect this as a Vite app
4. **Build Command**: `npm run build` (auto-detected)
5. **Output Directory**: `dist` (auto-detected)
6. **Install Command**: `npm install` (auto-detected)
7. Click "Deploy" and your app will be live!

**Environment Variables (optional):**

- If you want real AI responses, add `VITE_OPENAI_API_KEY` in Vercel's Project Settings > Environment Variables

**Note:** The app works perfectly without OpenAI - it uses realistic mock responses for demo purposes.

**Live Demo:**

- After deployment, Vercel provides a public URL like `https://data-vault-pro.vercel.app`

# Quick Setup Guide

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm package manager

### Installation Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the server**
   ```bash
   npm start
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Demo Mode vs OpenAI Mode

### Demo Mode (Default)
- ✅ Works immediately without any API keys
- ✅ Provides sample data for all topics
- ✅ Perfect for testing and demonstration
- ⚠️ Uses pre-generated sample content

### OpenAI Mode (Optional)
- 🔑 Requires OpenAI API key
- 🤖 Generates dynamic, AI-powered content
- 📚 More personalized and detailed analysis
- 💰 May incur API costs

To enable OpenAI mode:
1. Copy `env.example` to `.env`
2. Add your OpenAI API key: `OPENAI_API_KEY=your_key_here`
3. Restart the server

## 🎨 Features

### Core Functionality
- **Exam Selection**: PSAT/NMSQT, SAT, ACT
- **Subject Analysis**: Reading, Writing, Math, Science
- **Heatmap Generation**: Star ratings and percentage coverage
- **Deep Analysis**: Sample questions, explanations, learning tips

### UI Features
- **Modern Design**: Glassmorphism effects and gradients
- **Responsive**: Works on all devices
- **Interactive**: Smooth animations and hover effects
- **Accessible**: Keyboard shortcuts and screen reader support

## 🔧 API Endpoints

### GET `/api/exams`
Returns available exam types and subjects.

### POST `/api/generate-heatmap`
```json
{
  "examType": "SAT",
  "subject": "Reading and Writing"
}
```

### POST `/api/analyze-topic`
```json
{
  "examType": "SAT",
  "subject": "Reading and Writing",
  "topic": "Words in Context (Vocabulary)"
}
```

## 🎮 Usage

1. **Select Exam**: Choose from dropdown
2. **Choose Subject**: Select based on exam type
3. **Generate Heatmap**: Click button to create analysis
4. **Explore Topics**: View star ratings and percentages
5. **Deep Dive**: Click "Analyze in Depth" for detailed breakdown

## 🛠️ Troubleshooting

### Server won't start
- Check if port 3000 is available
- Ensure all dependencies are installed
- Check console for error messages

### API errors
- Verify server is running on port 3000
- Check browser console for network errors
- Ensure proper JSON format in requests

### OpenAI errors
- Verify API key is correct
- Check API key has sufficient credits
- Ensure internet connection

## 📱 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🎯 Next Steps

1. **Customize**: Add more exam types in `server.js`
2. **Enhance**: Modify demo data for better examples
3. **Deploy**: Host on platforms like Heroku or Vercel
4. **Extend**: Add user authentication and progress tracking

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure proper environment setup
4. Review the main README.md for detailed documentation 
# Exam Pattern Analyzer

A web-based tool that uses OpenAI API to analyze exam patterns and generate topic-wise heatmaps for various exams and subjects. The tool provides detailed analysis with sample questions, explanations, and learning tips.

## Features

### 🎯 Core Functionality
- **Exam Type Selection**: Support for PSAT/NMSQT, SAT, and ACT exams
- **Subject Analysis**: Comprehensive coverage of Reading, Writing, Math, and Science subjects
- **AI-Powered Heatmaps**: Generate topic-wise heatmaps with star ratings and percentage coverage
- **Interactive Analysis**: Deep-dive analysis for each topic with expandable sections

### 🔥 Heatmap Features
- **Star-based Heat Levels**: Visual representation using 1-5 star ratings
- **Percentage Coverage**: Approximate percentage of questions for each topic
- **Dynamic Generation**: Real-time heatmap generation based on exam and subject selection

### 📚 Analysis Components
- **Example Questions**: AI-generated sample questions for each topic
- **Step-by-step Solutions**: Detailed explanations with correct answers
- **Short Notes**: Concise explanations of key concepts and formulas
- **Learning Tips**: Creative study techniques and mnemonics

### 🎨 UI/UX Features
- **Modern Design**: Beautiful gradient backgrounds with glassmorphism effects
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Animations**: Fade-in effects and hover animations
- **Interactive Modals**: Expandable analysis sections with tabbed interface
- **Accessibility**: Keyboard shortcuts and screen reader support

## Technology Stack

- **Backend**: Node.js with Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI Integration**: OpenAI GPT-3.5-turbo API
- **Styling**: Custom CSS with modern design patterns
- **Icons**: Font Awesome 6.4.0

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- OpenAI API key

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd exam-pattern-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit the `.env` file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### Basic Workflow

1. **Select Exam Type**: Choose from PSAT/NMSQT, SAT, or ACT
2. **Choose Subject**: Select the subject you want to analyze
3. **Generate Heatmap**: Click "Generate Heatmap" to create the analysis
4. **Explore Topics**: View topic-wise heatmaps with star ratings
5. **Deep Analysis**: Click "Analyze in Depth" for detailed breakdowns

### Analysis Features

#### Example Questions Tab
- View AI-generated sample questions
- Click "Show Answer" to reveal solutions
- Read step-by-step explanations

#### Short Notes Tab
- Concise topic explanations
- Key concepts and formulas
- Grammar rules (for language subjects)

#### Learning Tips Tab
- Study techniques and strategies
- Mnemonics and memory aids
- Real-life examples and applications

## API Endpoints

### GET `/api/exams`
Returns available exam types and their subjects.

### POST `/api/generate-heatmap`
Generates heatmap data for selected exam and subject.

**Request Body:**
```json
{
  "examType": "SAT",
  "subject": "Reading and Writing"
}
```

**Response:**
```json
{
  "heatmapData": [
    {
      "topic": "Words in Context (Vocabulary)",
      "heatLevel": 4,
      "percentage": "19-20%"
    }
  ]
}
```

### POST `/api/analyze-topic`
Generates detailed analysis for a specific topic.

**Request Body:**
```json
{
  "examType": "SAT",
  "subject": "Reading and Writing",
  "topic": "Words in Context (Vocabulary)"
}
```

**Response:**
```json
{
  "sampleQuestion": "Sample question text...",
  "answer": "Correct answer",
  "explanation": "Step-by-step explanation...",
  "shortNote": "Key concepts explanation...",
  "learningTips": "Study strategies and tips..."
}
```

## Project Structure

```
exam-pattern-analyzer/
├── server.js              # Express server with API endpoints
├── package.json           # Dependencies and scripts
├── env.example           # Environment variables template
├── README.md             # Project documentation
└── public/               # Frontend assets
    ├── index.html        # Main HTML file
    ├── styles.css        # CSS styles
    └── script.js         # JavaScript functionality
```

## Customization

### Adding New Exams
Edit the `examData` object in `server.js`:

```javascript
const examData = {
  'NEW_EXAM': {
    'Subject Name': [
      'Topic 1',
      'Topic 2',
      'Topic 3'
    ]
  }
};
```

### Modifying Heat Levels
Adjust the `generateHeatData()` function in `server.js` to change how heat levels and percentages are calculated.

### Styling Changes
Modify `public/styles.css` to customize colors, fonts, and layout.

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Features

- **Debounced Resize**: Optimized window resize handling
- **Lazy Loading**: Efficient modal content loading
- **Smooth Animations**: Hardware-accelerated CSS transitions
- **Mobile Optimization**: Touch-friendly interface

## Accessibility

- **Keyboard Navigation**: Full keyboard support with shortcuts
- **Screen Reader**: Semantic HTML structure
- **ARIA Labels**: Proper accessibility attributes
- **High Contrast**: Readable color schemes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

## Future Enhancements

- [ ] User authentication and progress tracking
- [ ] Practice quiz generation
- [ ] Performance analytics
- [ ] Export functionality
- [ ] More exam types and subjects
- [ ] Advanced filtering and sorting
- [ ] Collaborative study features 
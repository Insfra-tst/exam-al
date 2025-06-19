# Zeyvior AI Comparison Tool

A web-based AI comparison tool that generates detailed comparisons between different methods and categories using AI analysis.

## Features

- AI-powered comparison generation
- Clean, modern UI with responsive design
- Download comparison pages as standalone HTML files
- Professional header and footer design
- Mobile-responsive layout

## Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Deployment**: Vercel
- **Styling**: Custom CSS with modern design patterns

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/Insfra-tst/Zeyvior-Intermediate.git
cd Zeyvior-Intermediate
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
python app.py
```

5. Open your browser and navigate to `http://localhost:5000`

## Deployment

This project is configured for deployment on Vercel. The deployment will happen automatically when you push to the main branch.

### Manual Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

## Project Structure

```
Zeyvior-Intermediate/
├── app.py                      # Main Flask application
├── generate_comparisons.py     # Comparison generation logic
├── requirements.txt            # Python dependencies
├── vercel.json                # Vercel configuration
├── .gitignore                 # Git ignore rules
├── README.md                  # Project documentation
├── static/
│   └── styles.css             # Main stylesheet
├── templates/
│   ├── index.html             # Home page template
│   ├── comparison.html        # Comparison page template
│   └── standalone_comparison.html  # Standalone comparison template
├── output/                    # Generated comparison files
└── UI/                        # UI reference files
    └── index.html             # Reference UI template
```

## API Endpoints

- `GET /` - Home page with comparison form
- `POST /generate` - Generate comparison between two methods
- `GET /download/<filename>` - Download comparison file
- `GET /standalone/<filename>` - View standalone comparison page

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

© 2025 Zeyvior. All rights reserved. 
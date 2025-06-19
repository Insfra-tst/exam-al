from flask import Flask, render_template, request, send_file, jsonify
import os
from pathlib import Path
from generate_comparisons import main as generate_comparisons
import tempfile
import shutil
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Create templates directory if it doesn't exist
Path("templates").mkdir(exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/compare', methods=['POST'])
def compare():
    try:
        # Get category and methods from form
        category = request.form.get('category', '').strip()
        methods = request.form.get('methods', '').split(',')
        methods = [m.strip() for m in methods if m.strip()]
        
        if not category:
            return jsonify({'error': 'Please provide a category'}), 400
        
        if len(methods) < 1:
            return jsonify({'error': 'Please provide at least 1 method'}), 400
        
        # Return the comparison page with methods and category
        return render_template('comparison.html', category=category, methods=methods)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download', methods=['POST'])
def download():
    try:
        # Get category and methods from form
        category = request.form.get('category', '').strip()
        methods = request.form.get('methods', '').split(',')
        methods = [m.strip() for m in methods if m.strip()]
        
        if not category or len(methods) < 1:
            return jsonify({'error': 'Invalid data'}), 400
        
        # Get current date
        from datetime import datetime
        current_date = datetime.now().strftime("%B %d, %Y")
        
        # Render the standalone comparison page as HTML
        html_content = render_template('standalone_comparison.html', 
                                     category=category, 
                                     methods=methods,
                                     current_date=current_date)
        
        # Create filename based on category
        filename = f"{category.lower().replace(' ', '-')}-comparison.html"
        
        # Return the HTML file for download
        response = app.response_class(
            html_content,
            mimetype='text/html',
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        return response
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate', methods=['POST'])
def generate():
    try:
        # Get keywords from form
        keywords = request.form.get('keywords', '').split(',')
        keywords = [k.strip() for k in keywords if k.strip()]
        
        if len(keywords) < 2:
            return jsonify({'error': 'Please provide at least 2 keywords'}), 400
        
        # Create a temporary directory for generation
        with tempfile.TemporaryDirectory() as temp_dir:
            # Change to temp directory
            original_cwd = os.getcwd()
            os.chdir(temp_dir)
            
            try:
                # Copy static directory to temp directory
                shutil.copytree(os.path.join(original_cwd, 'static'), 'static')
                
                # Generate comparisons
                generate_comparisons(keywords)
                
                # Move the ZIP file to original directory
                zip_path = 'comparison_pages.zip'
                if os.path.exists(zip_path):
                    shutil.move(zip_path, os.path.join(original_cwd, zip_path))
            finally:
                # Change back to original directory
                os.chdir(original_cwd)
        
        # Send the ZIP file
        return send_file(
            'comparison_pages.zip',
            as_attachment=True,
            download_name='comparison_pages.zip'
        )
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True) 
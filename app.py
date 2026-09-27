import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import init_db, create_profile, get_all_profiles

app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)  # Enable CORS for all routes, allowing cross-origin requests from frontends

# Simple email validation regex
EMAIL_REGEX = r'^[\w\.-]+@[\w\.-]+\.\w+$'

def validate_url(url):
    """
    Checks if a string is a valid HTTP/HTTPS URL.
    """
    if not url:
        return False
    # Simple regex pattern for URLs
    url_pattern = re.compile(
        r'^(https?:\/\/)'  # http:// or https://
        r'([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}'  # domain
        r'|localhost'  # localhost
        r'|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ip
        r'(:\d+)?(\/.*)?$', re.IGNORECASE  # port and path
    )
    return bool(url_pattern.match(url))

@app.route('/')
def serve_frontend():
    """
    Serves the frontend application homepage from the frontend folder.
    """
    return app.send_static_file('index.html')

@app.route('/generate-profile', methods=['POST'])
def generate_profile():
    """
    API Endpoint: POST /generate-profile
    Accepts JSON data, validates inputs, stores details in SQLite database, and returns the profile.
    """
    data = request.get_json()
    if not data:
        return jsonify({
            "success": False,
            "error": "Request body must be JSON."
        }), 400

    # Extract fields
    name = data.get('name', '').strip()
    bio = data.get('bio', '').strip()
    image_url = data.get('image_url', '').strip()
    email = data.get('email', '').strip() if data.get('email') else None
    location = data.get('location', '').strip() if data.get('location') else None

    # Required field validation
    errors = []
    if not name:
        errors.append("Full Name is required.")
    if not bio:
        errors.append("Bio/About Me is required.")
    if not image_url:
        errors.append("Profile Image URL is required.")

    # Format validation
    if image_url and not validate_url(image_url):
        errors.append("Invalid Profile Image URL. Must start with http:// or https://.")
    
    if email and not re.match(EMAIL_REGEX, email):
        errors.append("Invalid Email Address format.")

    # Return errors if validation failed
    if errors:
        return jsonify({
            "success": False,
            "errors": errors
        }), 400

    try:
        # Create and store profile in database
        profile = create_profile(name, bio, image_url, email, location)
        
        if not profile:
            return jsonify({
                "success": False,
                "error": "Failed to save profile to database."
            }), 500

        return jsonify({
            "success": True,
            "profile": {
                "id": profile["id"],
                "name": profile["name"],
                "bio": profile["bio"],
                "image_url": profile["image_url"],
                "email": profile["email"],
                "location": profile["location"],
                "created_at": profile["created_at"]
            }
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"An error occurred while processing: {str(e)}"
        }), 500

@app.route('/profiles', methods=['GET'])
def get_profiles():
    """
    API Endpoint: GET /profiles
    Retrieves all generated user profiles from SQLite database.
    """
    try:
        profiles = get_all_profiles()
        return jsonify({
            "success": True,
            "profiles": profiles
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"An error occurred while fetching profiles: {str(e)}"
        }), 500

if __name__ == '__main__':
    # Initialize the database and table
    init_db()
    print("Database initialized successfully.")
    
    # Run the Flask app on localhost:5000
    app.run(host='127.0.0.1', port=5000, debug=True)

# User Profile Card Generator

A responsive, premium full-stack web application designed to generate, validate, store, and display custom user profile cards. The application is built using a Python Flask API, an SQLite database, and a high-fidelity glassmorphic HTML/CSS/JS frontend dashboard.

## 🚀 Features

- **Dynamic Profile Generation:** Submit details via the interactive form to instantly render a beautiful user profile card.
- **Glassmorphic UI Design:** High-fidelity visuals utilizing blur filters, neon glow border outlines, and modern fonts (Outfit & Inter).
- **SQLite Database Integration:** All generated profiles are persisted in a database with timestamps.
- **Curated Avatar Picker:** Quickly select from beautiful preset Unsplash profile images to skip typing URLs.
- **Saved Profiles Gallery:** Browse previously generated profile cards from the database directly on the dashboard.
- **Preview Retrieval:** Click any profile in the history gallery to load it back into the main preview pane.
- **Comprehensive Validations:** Front-end and back-end checking for required inputs, email patterns, and URL syntax.
- **Responsive Layout:** Adaptive column-collapsing grid built using modern CSS layout systems (Grid and Flexbox).

---

## 📂 Project Structure

```text
UserProfileCardGenerator/
│
├── backend/
│   ├── app.py          # Main Flask Application & REST API Endpoints
│   ├── models.py       # SQLite Database Setup & CRUD Functions
│   └── database.db     # SQLite Database File (Auto-generated on startup)
│
├── frontend/
│   ├── index.html      # Dashboard Structure & Form Layout
│   ├── style.css       # Glassmorphism & Animations Stylesheet
│   └── script.js       # Form Validation, AJAX Requests, & Card Rendering
│
└── README.md           # Project Documentation & Setup Guide
```

---

## 🛠️ Prerequisites & Installation

### 1. Install Python
Ensure that Python 3.7 or higher is installed on your system. You can check your version by running:
```bash
python --version
```

### 2. Install Required Packages
The Flask backend depends on `Flask` and `flask-cors`. Install them via pip:
```bash
pip install flask flask-cors
```

---

## 🏃 Run the Application

### 1. Launch the Backend
Navigate to the `backend/` folder and execute `app.py`. This will initialize the database and spin up the local development server:
```bash
python backend/app.py
```
Upon successful start, you will see output indicating that the server is running on:
`http://127.0.0.1:5000`

### 2. Open the Frontend
Since the Flask app serves the static files from the `frontend/` directory, you can simply open:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)** in your browser!

*Alternatively, you can open `frontend/index.html` directly in your browser or run it using a standard static server (e.g. VS Code Live Server).*

---

## 📊 API Reference

### 1. Create a Profile
- **Endpoint:** `POST /generate-profile`
- **Headers:** `Content-Type: application/json`
- **Body Example:**
  ```json
  {
    "name": "Alex Johnson",
    "bio": "Passionate web developer and AI enthusiast.",
    "image_url": "https://example.com/profile.jpg",
    "email": "alex@example.com",
    "location": "Chennai"
  }
  ```
- **Response Example (201 Created):**
  ```json
  {
    "success": true,
    "profile": {
      "id": 1,
      "name": "Alex Johnson",
      "bio": "Passionate web developer and AI enthusiast.",
      "image_url": "https://example.com/profile.jpg",
      "email": "alex@example.com",
      "location": "Chennai",
      "created_at": "2026-06-17 15:00:00"
    }
  }
  ```

### 2. Get All Profiles
- **Endpoint:** `GET /profiles`
- **Response Example (200 OK):**
  ```json
  {
    "success": true,
    "profiles": [
      {
        "id": 1,
        "name": "Alex Johnson",
        "bio": "Passionate web developer and AI enthusiast.",
        "image_url": "https://example.com/profile.jpg",
        "email": "alex@example.com",
        "location": "Chennai",
        "created_at": "2026-06-17 15:00:00"
      }
    ]
  }
  ```

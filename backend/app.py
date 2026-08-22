from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend application
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize SQLAlchemy database
    db.init_app(app)

    # Register API blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "Dayflow HRMS Backend API",
            "database": "connected"
        }), 200

    # Auto-create tables if they don't exist yet
    with app.app_context():
        try:
            db.create_all()
            print("Database tables verified/created successfully.")
        except Exception as e:
            print(f"Warning during database initialization: {e}")

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

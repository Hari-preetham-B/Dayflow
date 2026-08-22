from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.profile_routes import profile_bp
from routes.attendance_routes import attendance_bp
from routes.leave_routes import leave_bp
from routes.salary_routes import salary_bp
from routes.notification_routes import notification_bp

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
    app.register_blueprint(profile_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(leave_bp)
    app.register_blueprint(salary_bp)
    app.register_blueprint(notification_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "Dayflow HRMS Backend API",
            "database": "connected"
        }), 200

    # Auto-create tables if they don't exist yet against real database
    with app.app_context():
        try:
            db.create_all()
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print("==================================================")
            print(f"[DATABASE STARTUP] Connected to Database Host: {db.engine.url.host}")
            print(f"[DATABASE STARTUP] Database Name: {db.engine.url.database}")
            print(f"[DATABASE STARTUP] Tables in Supabase Postgres: {tables}")
            print("==================================================")
        except Exception as e:
            print(f"[DATABASE STARTUP ERROR] Failed to initialize database: {e}")

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

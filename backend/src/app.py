from flask import Flask
from flask_cors import CORS

from api.upload import upload_bp
from api.compress import compress_bp
from api.watermark import watermark_bp
from api.status import status_bp
from api.download import download_bp
from api.delete import delete_bp

def create_app():
    api_app = Flask(__name__)
    CORS(api_app)

    # Register blueprints
    api_app.register_blueprint(upload_bp, url_prefix='/api')
    api_app.register_blueprint(compress_bp, url_prefix='/api')
    api_app.register_blueprint(watermark_bp, url_prefix='/api')
    api_app.register_blueprint(status_bp, url_prefix='/api')
    api_app.register_blueprint(download_bp, url_prefix='/api')
    api_app.register_blueprint(delete_bp, url_prefix='/api')

    return api_app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)

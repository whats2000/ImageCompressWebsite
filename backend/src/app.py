from flask import Flask
from flask_cors import CORS
import threading
import time

from api.upload import upload_bp
from api.compress import compress_bp
from api.watermark import watermark_bp
from api.status import status_bp
from api.image import image_bp
from api.download import download_bp
from api.delete import delete_bp
from utils.image_cleanup import cleanup_images

def create_app():
    api_app = Flask(__name__)
    CORS(api_app)

    # Register blueprints
    api_app.register_blueprint(upload_bp, url_prefix='/api')
    api_app.register_blueprint(compress_bp, url_prefix='/api')
    api_app.register_blueprint(watermark_bp, url_prefix='/api')
    api_app.register_blueprint(status_bp, url_prefix='/api')
    api_app.register_blueprint(image_bp, url_prefix='/api')
    api_app.register_blueprint(download_bp, url_prefix='/api')
    api_app.register_blueprint(delete_bp, url_prefix='/api')

    
    def start_cleanup_task():
        def run_cleanup_task():
            while True:
                cleanup_images(180)
                time.sleep(1)

        cleanup_thread = threading.Thread(target=run_cleanup_task, daemon=True)
        cleanup_thread.start()
    
    @api_app.before_request
    def before_request_func():
        api_app.before_request_funcs[None].remove(before_request_func)
        start_cleanup_task()
    
    return api_app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)

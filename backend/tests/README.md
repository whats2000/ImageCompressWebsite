# Backend Tests

## Overview
These tests cover the key functionalities of the Image Compression Website's backend API.

## Test Coverage
- Image Upload
- Image Compression
- Watermark Addition
- Status Checking
- Image Download

## Running Tests
To run the tests, use pytest:

```bash
# From the backend directory
pytest tests/
```

### Test Files
- `conftest.py`: Shared fixtures and configurations
- `test_upload.py`: Tests for image upload functionality
- `test_compress.py`: Tests for image compression
- `test_watermark.py`: Tests for watermark addition
- `test_status_and_download.py`: Tests for status checking and download

## Requirements
- pytest
- flask
- Pillow
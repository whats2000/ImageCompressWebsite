# Image Compression Website - System Requirements

Running on http://127.0.0.1:5000

### **API Design (Including Upload and Download)**

#### 1. **Upload Image**
- **Method:** `POST`
- **Endpoint:** `/api/upload`
- **Function:** Receive user-uploaded images and generate a unique image ID.
- **Request:**
  - Content-Type: `multipart/form-data`
  - Form Data:
    - `file` (required): Uploaded image file
- **Response:**
  ```json
  {
    "success": true,
    "message": "Image uploaded successfully",
    "image_id": "unique_image_id",
    "original_image_url": "url_to_original_image"
  }
  ```

---

#### 2. **Compress Image**
- **Method:** `POST`
- **Endpoint:** `/api/compress`
- **Function:** Compress an uploaded image.
- **Request:**
  - Content-Type: `application/json`
  - JSON Body:
    - `image_id` (required): Unique ID of the uploaded image
    - `compression_format` (required): Compression format (`jpeg`, `webp`)
    - `compression_quality` (required): Compression quality (1-100)
- **Response:**
  ```json
  {
    "success": true,
    "message": "Image compressed successfully",
    "compressed_image_url": "url_to_compressed_image"
  }
  ```

---

#### 3. **Add Watermark**
- **Method:** `POST`
- **Endpoint:** `/api/watermark`
- **Function:** Add a watermark to the compressed image.
- **Request:**
  - Content-Type: `application/json`
  - JSON Body:
    - `image_id` (required): Unique ID of the uploaded image
    - `watermark_text` (optional): Watermark text (default to predefined watermark)
    - `position` (optional): Watermark position (`top-left`, `top-right`, `bottom-left`, `bottom-right`, `center`)
- **Response:**
  ```json
  {
    "success": true,
    "message": "Watermark added successfully",
    "watermarked_image_url": "url_to_watermarked_image"
  }
  ```

---

#### 4. **Check Processing Status**
- **Method:** `GET`
- **Endpoint:** `/api/status/<image_id>`
- **Function:** Retrieve the processing status and downloadable URLs for a specific image.
- **Response:**
  ```json
  {
    "success": true,
    "image_id": "unique_image_id",
    "status": "processed", // "uploaded", "compressed", "watermarked"
    "original_image_url": "url_to_original_image",
    "compressed_image_url": "url_to_compressed_image",
    "watermarked_image_url": "url_to_watermarked_image"
  }
  ```

---

#### 5. **Download Image**
- **Method:** `GET`
- **Endpoint:** `/api/download/<image_id>`
- **Function:** Provide download link for a specific image.
- **Query Parameters:**
  - `type` (required): Image type (`original`, `compressed`, `watermarked`)
- **Response:**
  - If image type exists:
    - Header: `Content-Disposition: attachment; filename="image_filename.ext"`
    - Body: Image file stream
  - If image type does not exist:
    ```json
    {
      "success": false,
      "message": "Image not found for the requested type"
    }
    ```

---

#### 6. **Delete Image**
- **Method:** `DELETE`
- **Endpoint:** `/api/delete/<image_id>`
- **Function:** Delete a specific image and its related processing results.
- **Response:**
  ```json
  {
    "success": true,
    "message": "Image deleted successfully"
  }
  ```

---

### **Key Points for Upload and Download Functionality**

1. **Image Upload Processing**
   - Generate a unique ID (e.g., UUID) after image upload.
   - Store images in a specified server directory or cloud storage, returning a publicly accessible URL.
   - Limit image formats and sizes to prevent uploading unsupported file types or excessively large images.

2. **Download Image Processing**
   - Return different types of image files based on the `type` parameter request.
   - Use `send_file` or similar method to directly return the image file stream (e.g., Flask's `send_file` function).

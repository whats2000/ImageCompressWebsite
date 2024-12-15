import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    --primary-color: #4a90e2;
    --secondary-color: #f5f5f5;
    --text-color: #333;
    --accent-color: #e74c3c;
  }

  * {
    font-family: 'Source Sans Pro', sans-serif;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background-color: var(--secondary-color);
    line-height: 1.6;
    color: var(--text-color);
  }

  /* Custom Toast Styles */
  .Toastify__toast {
    font-family: 'Source Sans Pro', sans-serif;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 12px 16px;
  }

  .Toastify__toast--success {
    background-color: #2ecc71;
    color: white;
    border-left: 5px solid #27ae60;
  }

  .Toastify__toast--error {
    background-color: #e74c3c;
    color: white;
    border-left: 5px solid #c0392b;
  }

  .Toastify__toast--warning {
    background-color: #f39c12;
    color: white;
    border-left: 5px solid #d35400;
  }

  .Toastify__toast--info {
    background-color: #3498db;
    color: white;
    border-left: 5px solid #2980b9;
  }

  .Toastify__progress-bar {
    background: rgba(255, 255, 255, 0.7);
  }
`;

export const BACKEND_API_URL = 'http://127.0.0.1:5000';
export const UPLOAD_FILE_BASE_URL = `${window.location.origin}/backend`;

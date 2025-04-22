// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx' // Import AuthProvider later
import './index.css' // Keep or replace with your styling entry point

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Wrap App with AuthProvider once created */}
      <AuthProvider>
          <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
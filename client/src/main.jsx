import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import {MotionConfig} from 'motion/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>       {/* 1. Pure app me URLs aur Routing enable karta hai */}
      <AppProvider>       {/* 2. Global State (AppContext) sabhi components ko provide karta hai */}
        <MotionConfig viewport={{once: true}}> {/* 3. Smooth animations ke liye */}
          <App />         {/* 4. Humara Main App component */}
        </MotionConfig>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
)




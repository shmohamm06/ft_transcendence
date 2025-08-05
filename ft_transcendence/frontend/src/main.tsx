import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import AppRouter from './router'
import axios from 'axios'

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:3000'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
import App from './App.jsx'

const storedTheme = localStorage.getItem('theme')
const initialTheme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark'
document.documentElement.setAttribute('data-theme', initialTheme)
if (!storedTheme) {
  localStorage.setItem('theme', initialTheme)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

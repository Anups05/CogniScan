import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n/config'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-slate-50"><div className="text-2xl font-bold text-indigo-600 animate-pulse">Loading...</div></div>}>
      <App />
    </Suspense>
  </React.StrictMode>,
)

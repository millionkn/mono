import '@mono/libs-utils/polyfill'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from '@src/app.tsx'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

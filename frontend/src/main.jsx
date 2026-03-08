import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './pages/Home.jsx'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import Dashboard from './pages/Dashboard.jsx'

const rootElement = document.getElementById('root');

if (!rootElement) {
    console.error("CRITICAL: #root element not found in HTML!");
}

try {
    const root = createRoot(rootElement);
    root.render(
        <StrictMode>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/overview" element={<App />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </BrowserRouter>
        </StrictMode>
    );
} catch (error) {
    console.error("Critical React Mounting Error:", error);
    rootElement.innerHTML = `
        <div style="background: #000000; color: #f87171; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; padding: 20px; text-align: center;">
            <h1 style="font-size: 24px;">QuestMap failed to start</h1>
            <pre style="background: #1f2937; padding: 15px; border-radius: 8px; margin-top: 20px; white-space: pre-wrap; font-size: 14px;">\${error.message}</pre>
        </div>
    `;
}

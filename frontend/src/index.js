import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import './auth.css';
import HomePage from './landing_page/home/HomePage';
import Signup from './landing_page/signup/Signup';
import Login from './landing_page/login/Login';
import AboutPage from './landing_page/about/AboutPage';
import ProductPage from './landing_page/products/ProductPage';
import PricingPage from './landing_page/pricing/PricingPage';
import SupportPage from './landing_page/support/SupportPage';

import Navbar from './landing_page/Navbar';
import Footer from './landing_page/Footer';
import NotFound from './landing_page/NotFound';

// Initialize theme on first load based on localStorage or system preference
(function initTheme() {
  try {
    const saved = localStorage.getItem('hytrade_theme_mode');
    const mode = saved === 'dark' || saved === 'light' ? saved : 'light';
    document.body.classList.toggle('dark', mode === 'dark');
  } catch {}
})();

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.body.classList.contains('dark'));

  useEffect(() => {
    const handler = (e) => {
      if (e.storageArea === localStorage && e.key === 'hytrade_theme_mode') {
        const value = e.newValue;
        if (value === 'dark' || value === 'light') {
          document.body.classList.toggle('dark', value === 'dark');
          setDark(value === 'dark');
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      const mode = next ? 'dark' : 'light';
      try { localStorage.setItem('hytrade_theme_mode', mode); } catch {}
      document.body.classList.toggle('dark', next);
      return next;
    });
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1000,
        padding: '8px 12px',
        borderRadius: 8,
        border: '1px solid rgba(0,0,0,0.15)',
        background: 'var(--btn-bg, #ffffff)',
        color: 'var(--btn-fg, #111827)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'pointer'
      }}
    >
      {dark ? 'Light' : 'Dark'}
    </button>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <ThemeToggle />
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <>
          <Navbar />
          <HomePage />
          <Footer />
        </>
      } />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={
        <>
          <Navbar />
          <AboutPage />
          <Footer />
        </>
      } />
      <Route path="/products" element={
        <>
          <Navbar />
          <ProductPage />
          <Footer />
        </>
      } />
      <Route path="/pricing" element={
        <>
          <Navbar />
          <PricingPage />
          <Footer />
        </>
      } />
      <Route path="/support" element={
        <>
          <Navbar />
          <SupportPage />
          <Footer />
        </>
      } />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

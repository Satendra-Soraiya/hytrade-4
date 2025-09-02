import React from 'react';
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
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



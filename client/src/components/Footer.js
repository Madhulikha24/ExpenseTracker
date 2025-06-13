import React from 'react';
import '../styles/Home.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="footer text-center mt-5 py-3 text-light">

      {/* Social Icon */}
      <div className="mb-3">
        <a href="https://github.com/Madhulikha24" className="text-light">
          <i className="fab fa-github fa-2x"></i>
        </a>
      </div>

      {/* Contact Info */}
      <div className="mb-3">
        <p className="m-0">Contact us : madhulikha24@gmail.com</p>
      </div>

      {/* Copyright */}
      <div>
        <p className="footer-text m-0">
          &copy; {currentYear}. Created by Madhulikha
        </p>
      </div>

    </div>
  )
}

export default Footer;
import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(64, 64, 64, 0.20)',
      padding: '10px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {/* Left side - Copyright */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        color: '#EFEFDC',
        fontSize: '14px'
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20px',
          height: '20px',
          fontSize: '20px',
          marginRight: '8px'
        }}>
          ©
        </span>
        2025
      </div>

      {/* Right side - Signature */}
      <div style={{
        display: 'flex',
        alignItems: 'center'
      }}>
        <img 
          src="./signature.png" 
          alt="Signature" 
          style={{
            height: '20px',
            opacity: 0.8,
            filter: 'brightness(1.2)',
            zIndex: 1
          }}
        />
      </div>
    </footer>
  );
};

export default Footer;
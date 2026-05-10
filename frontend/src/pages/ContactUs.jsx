import React from 'react';

const ContactUs = () => {
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 1rem' }}>
      <div className="glass" style={{ maxWidth: '800px', width: '100%', padding: '3rem', borderRadius: '1.5rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '3rem' }}>📧</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1E3147', marginTop: '1rem', marginBottom: '0.5rem' }}>Get in Touch</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Have questions about our Business or Enterprise plans? We're here to help.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
          <div style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📞</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1E3147', marginBottom: '0.5rem' }}>Call Us</h3>
            <p style={{ color: '#475569', fontWeight: '600' }}>+91 98765 43210</p>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Mon-Fri, 9am - 6pm IST</p>
          </div>

          <div style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✉️</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1E3147', marginBottom: '0.5rem' }}>Email Us</h3>
            <p style={{ color: '#475569', fontWeight: '600' }}>support@digistore.com</p>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>We'll respond within 24 hours</p>
          </div>
        </div>

        <div style={{ marginTop: '4rem', padding: '2rem', borderTop: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#64748b', marginBottom: '1.5rem' }}>Connect with us on Social Media</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            {/* Social Icons could go here */}
            <span style={{ fontSize: '1.5rem', cursor: 'pointer' }}>📸</span>
            <span style={{ fontSize: '1.5rem', cursor: 'pointer' }}>📘</span>
            <span style={{ fontSize: '1.5rem', cursor: 'pointer' }}>🐦</span>
            <span style={{ fontSize: '1.5rem', cursor: 'pointer' }}>💼</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

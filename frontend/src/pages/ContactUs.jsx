import React from 'react';

const ContactUs = () => {
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 1rem' }}>
      <div className="glass" style={{ maxWidth: '800px', width: '100%', padding: '3rem', borderRadius: '1.5rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1E3147', marginTop: '1rem', marginBottom: '0.5rem' }}>Get in Touch</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Have questions about our Business or Enterprise plans? We're here to help.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
          <div style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1E3147" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1E3147', marginBottom: '0.5rem' }}>Call Us</h3>
            <p style={{ color: '#475569', fontWeight: '600' }}>+91-9833186775</p>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Mon-Fri, 9am - 6pm IST</p>
          </div>

          <div style={{ padding: '2rem', borderRadius: '1rem', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1E3147" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1E3147', marginBottom: '0.5rem' }}>Email Us</h3>
            <p style={{ color: '#475569', fontWeight: '600' }}>mcubehiveitsolutions@gmail.com</p>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>We'll respond within 24 hours</p>
          </div>
        </div>

        <div style={{ marginTop: '4rem', padding: '2rem', borderTop: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#64748b', marginBottom: '1.5rem' }}>Connect with us on Social Media</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer' }} title="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </span>
            <span style={{ cursor: 'pointer' }} title="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </span>
            <span style={{ cursor: 'pointer' }} title="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </span>
            <span style={{ cursor: 'pointer' }} title="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

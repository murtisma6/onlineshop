import { useNavigate } from 'react-router-dom';

const DigiStorePricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'for 3 Months',
      color: '#64748b',
      highlight: false,
      description: 'Perfect for individuals testing the waters.',
      features: [
        '1 Digital Store',
        'Up to 7 Products',
        'Basic Store Customization',
        'Unique Store URL',
        'WhatsApp Contact Button',
        'Community Support',
      ],
      cta: 'Get Started Free',
    },
    {
      name: 'Business',
      price: '₹249',
      period: 'per month',
      color: '#1E3147',
      highlight: true,
      description: 'For growing businesses that need more reach.',
      features: [
        '3 Digital Stores',
        '21 Products each store',
        'Advanced Store Branding',
        'Store Logo & Event Banner',
        'Analytics Dashboard',
        'Priority Email Support',
      ],
      cta: 'Start Business Plan',
    },
    {
      name: 'Enterprise',
      price: '₹849',
      period: 'per month',
      color: '#7c3aed',
      highlight: false,
      description: 'Full-featured solution for power sellers.',
      features: [
        'Unlimited Digital Stores',
        '53 Products each store',
        'White-label Branding',
        'Dedicated Account Manager',
        'Bulk Product Import',
        'API Access',
        'Custom Domain Support',
        '24/7 Priority Support',
      ],
      cta: 'Contact Sales',
    },
  ];

  const steps = [
    {
      step: '01',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1E3147" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      title: 'Create an Account',
      desc: 'Register as a Seller on Digital Store in under 2 minutes.',
    },
    {
      step: '02',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1E3147" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
      title: 'Set Up Your Store',
      desc: 'Name your store, add a logo, choose your brand color and tagline.',
    },
    {
      step: '03',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1E3147" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
      title: 'Add Your Products',
      desc: 'Upload product images, descriptions, prices, and categories.',
    },
    {
      step: '04',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1E3147" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
      title: 'Share & Sell',
      desc: 'Share your unique store link and start receiving orders via WhatsApp.',
    },
  ];

  return (
    <div style={{ backgroundColor: '#f8fafc', flex: 1, display: 'flex', flexDirection: 'column' }}>

      {/* Responsive styles via <style> tag */}
      <style>{`
        .digi-hero { padding: 4rem 1.25rem 5rem; }
        .digi-hero h1 { font-size: 2.2rem; }
        .digi-hero p { font-size: 1rem; }
        .digi-hero-btns { flex-direction: row; }
        .digi-section { padding: 3.5rem 1.25rem; }
        .digi-steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; }
        .digi-pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; align-items: start; }
        .digi-plan-card { transform: scale(1) !important; }
        .digi-plan-highlight { transform: scale(1.03) !important; }
        @media (max-width: 640px) {
          .digi-hero { padding: 2.5rem 1rem 3rem; }
          .digi-hero h1 { font-size: 1.65rem; }
          .digi-hero p { font-size: 0.9rem; }
          .digi-hero-btns { flex-direction: column; align-items: stretch; }
          .digi-hero-btns button { width: 100%; justify-content: center; }
          .digi-section { padding: 2.5rem 1rem; }
          .digi-steps-grid { grid-template-columns: 1fr 1fr; gap: 1rem; }
          .digi-pricing-grid { grid-template-columns: 1fr; gap: 1.25rem; }
          .digi-plan-highlight { transform: scale(1) !important; }
          .digi-badge-popular { font-size: 0.7rem; }
          .digi-section-title { font-size: 1.5rem !important; }
          .digi-cta-title { font-size: 1.4rem !important; }
        }
        @media (max-width: 380px) {
          .digi-steps-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Hero */}
      <div className="digi-hero" style={{
        background: 'linear-gradient(135deg, #1E3147 0%, #2d4a6b 60%, #1a5276 100%)',
        color: '#ffffff',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px', margin: '0 auto' }}>
          <span style={{ display: 'inline-block', backgroundColor: 'rgba(59,130,246,0.2)', color: '#93c5fd', padding: '0.3rem 1rem', borderRadius: '2rem', fontSize: '0.78rem', fontWeight: '600', marginBottom: '1.25rem', border: '1px solid rgba(59,130,246,0.3)' }}>
            🚀 Launch Your Digital Presence
          </span>
          <h1 style={{ fontWeight: '800', lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.5px' }}>
            Own Your <span style={{ color: '#60a5fa' }}>DigiStore</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '580px', margin: '0 auto 1.75rem auto', lineHeight: 1.7 }}>
            Empowering <strong>Bohra Businesses</strong> with professional digital storefronts. Connect with <strong>Dawoodi Bohra community</strong> members worldwide and grow your sales through WhatsApp.
          </p>
          <div className="digi-hero-btns" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register?role=SELLER&plan=STARTER')}
              style={{ backgroundColor: '#3b82f6', color: '#ffffff', padding: '0.8rem 1.75rem', borderRadius: '0.6rem', border: 'none', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              Start for Free
            </button>
            <button
              onClick={() => document.getElementById('pricing-section').scrollIntoView({ behavior: 'smooth' })}
              style={{ backgroundColor: 'transparent', color: '#ffffff', padding: '0.8rem 1.75rem', borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.3)', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              View Pricing ↓
            </button>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="digi-section" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 className="digi-section-title" style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1E3147', marginBottom: '0.5rem' }}>How It Works</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Get your store live in 4 simple steps</p>
        </div>
        <div className="digi-steps-grid">
          {steps.map((s) => (
            <div key={s.step} style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '1.5rem 1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', backgroundColor: '#f0f4ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                {s.icon}
              </div>
              <span style={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: '800', color: '#3b82f6', letterSpacing: '1px', marginBottom: '0.4rem' }}>STEP {s.step}</span>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1E3147', marginBottom: '0.4rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing-section" style={{ backgroundColor: '#f1f5f9' }}>
        <div className="digi-section" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 className="digi-section-title" style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1E3147', marginBottom: '0.5rem' }}>Simple, Transparent Pricing</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>No hidden fees. Cancel anytime.</p>
          </div>
          <div className="digi-pricing-grid">
            {plans.map((plan) => (
              <div key={plan.name} className={plan.highlight ? 'digi-plan-highlight' : 'digi-plan-card'} style={{
                backgroundColor: plan.highlight ? plan.color : '#ffffff',
                borderRadius: '1.25rem',
                padding: '2rem 1.5rem',
                boxShadow: plan.highlight ? '0 20px 40px -8px rgba(30,49,71,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.06)',
                border: plan.highlight ? 'none' : '1px solid #e2e8f0',
                position: 'relative',
              }}>
                {plan.highlight && (
                  <span className="digi-badge-popular" style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#3b82f6', color: '#ffffff', padding: '0.25rem 1rem', borderRadius: '2rem', fontSize: '0.72rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    ⭐ Most Popular
                  </span>
                )}
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: plan.highlight ? '#ffffff' : '#1E3147', marginBottom: '0.3rem' }}>{plan.name}</h3>
                <p style={{ fontSize: '0.82rem', color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#64748b', marginBottom: '1.25rem' }}>{plan.description}</p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: '800', color: plan.highlight ? '#ffffff' : '#1E3147' }}>{plan.price}</span>
                  <span style={{ fontSize: '0.82rem', color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#94a3b8', marginLeft: '0.35rem' }}>/{plan.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.87rem', color: plan.highlight ? 'rgba(255,255,255,0.9)' : '#374151' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={plan.highlight ? '#60a5fa' : '#22c55e'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    if (plan.name === 'Starter') {
                      navigate('/register?role=SELLER&plan=STARTER');
                    } else {
                      navigate('/contact-us');
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '0.6rem',
                    border: plan.highlight ? '2px solid rgba(255,255,255,0.3)' : `2px solid ${plan.color}`,
                    backgroundColor: plan.highlight ? 'rgba(255,255,255,0.15)' : plan.color,
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{ backgroundColor: '#1E3147', color: '#ffffff', textAlign: 'center', padding: '3.5rem 1.25rem' }}>
        <h2 className="digi-cta-title" style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem' }}>Ready to launch your DigiStore?</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>Join hundreds of sellers already growing their business online.</p>
        <button
          onClick={() => navigate('/register?role=SELLER&plan=STARTER')}
          style={{ backgroundColor: '#3b82f6', color: '#ffffff', padding: '0.85rem 2rem', borderRadius: '0.6rem', border: 'none', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          Create Your Store — It's Free
        </button>
      </div>

      {/* Footer Info */}
      <div style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '4rem 1.25rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>
          <div>
            <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem' }}>DigiStore</h3>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>Empowering small businesses and individuals to reach their full potential online with easy-to-use digital storefronts.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </span>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </span>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </span>
            </div>
          </div>
          <div>
            <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem' }}>Contact Us</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>+91-9833186775</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span>mcubehiveitsolutions@gmail.com</span>
              </div>
            </div>
          </div>
          <div>
            <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem' }}>Solutions</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <li style={{ cursor: 'pointer' }} onClick={() => navigate('/own-your-digistore')}>Pricing Plans</li>
              <li style={{ cursor: 'pointer' }} onClick={() => navigate('/register?role=SELLER')}>Seller Registration</li>
              <li style={{ cursor: 'pointer' }} onClick={() => navigate('/contact-us')}>Business Inquiries</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DigiStorePricing;

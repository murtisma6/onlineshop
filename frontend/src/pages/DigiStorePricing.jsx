import { useNavigate } from 'react-router-dom';

const DigiStorePricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'forever',
      color: '#64748b',
      highlight: false,
      description: 'Perfect for individuals testing the waters.',
      features: [
        '1 Digital Store',
        'Up to 10 Products',
        'Basic Store Customization',
        'Unique Store URL',
        'WhatsApp Contact Button',
        'Community Support',
      ],
      cta: 'Get Started Free',
      ctaAction: 'register',
    },
    {
      name: 'Business',
      price: '₹499',
      period: 'per month',
      color: '#1E3147',
      highlight: true,
      description: 'For growing businesses that need more reach.',
      features: [
        '3 Digital Stores',
        'Unlimited Products',
        'Advanced Store Branding',
        'Custom Logo & Banner',
        'Product Categories & Tags',
        'Analytics Dashboard',
        'Priority Email Support',
      ],
      cta: 'Start Business Plan',
      ctaAction: 'contact',
    },
    {
      name: 'Enterprise',
      price: '₹1,499',
      period: 'per month',
      color: '#7c3aed',
      highlight: false,
      description: 'Full-featured solution for power sellers.',
      features: [
        'Unlimited Digital Stores',
        'Unlimited Products',
        'White-label Branding',
        'Dedicated Account Manager',
        'Bulk Product Import',
        'API Access',
        'Custom Domain Support',
        '24/7 Priority Support',
      ],
      cta: 'Contact Sales',
      ctaAction: 'contact',
    },
  ];

  const steps = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E3147" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      step: '01',
      title: 'Create an Account',
      desc: 'Register as a Seller on Digital Store in under 2 minutes.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E3147" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
      step: '02',
      title: 'Set Up Your Store',
      desc: 'Name your store, add a logo, choose your brand color and tagline.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E3147" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      ),
      step: '03',
      title: 'Add Your Products',
      desc: 'Upload product images, descriptions, prices, and categories.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E3147" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
      ),
      step: '04',
      title: 'Share & Sell',
      desc: 'Share your unique store link with customers and start receiving orders via WhatsApp.',
    },
  ];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 70px)' }}>

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3147 0%, #2d4a6b 60%, #1a5276 100%)',
        color: '#ffffff',
        textAlign: 'center',
        padding: '5rem 1.5rem 6rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
          <span style={{ display: 'inline-block', backgroundColor: 'rgba(59,130,246,0.2)', color: '#93c5fd', padding: '0.3rem 1rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: '600', marginBottom: '1.5rem', border: '1px solid rgba(59,130,246,0.3)' }}>
            🚀 Launch Your Digital Presence
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '1.25rem', letterSpacing: '-0.5px' }}>
            Own Your <span style={{ color: '#60a5fa' }}>DigiStore</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.8)', maxWidth: '560px', margin: '0 auto 2rem auto', lineHeight: 1.7 }}>
            Create a beautiful online store in minutes. Showcase your products, reach more customers, and grow your business — all from one place.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              style={{ backgroundColor: '#3b82f6', color: '#ffffff', padding: '0.85rem 2rem', borderRadius: '0.6rem', border: 'none', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              Start for Free
            </button>
            <button
              onClick={() => document.getElementById('pricing-section').scrollIntoView({ behavior: 'smooth' })}
              style={{ backgroundColor: 'transparent', color: '#ffffff', padding: '0.85rem 2rem', borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.3)', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              View Pricing ↓
            </button>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1E3147', marginBottom: '0.75rem' }}>How It Works</h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem' }}>Get your store live in 4 simple steps</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          {steps.map((s) => (
            <div key={s.step} style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '2rem 1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(0,0,0,0.1)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ width: '56px', height: '56px', backgroundColor: '#f0f4ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                {s.icon}
              </div>
              <span style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: '800', color: '#3b82f6', letterSpacing: '1px', marginBottom: '0.5rem' }}>STEP {s.step}</span>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1E3147', marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing-section" style={{ backgroundColor: '#f1f5f9', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1E3147', marginBottom: '0.75rem' }}>Simple, Transparent Pricing</h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem' }}>No hidden fees. Cancel anytime.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            {plans.map((plan) => (
              <div key={plan.name} style={{
                backgroundColor: plan.highlight ? plan.color : '#ffffff',
                borderRadius: '1.25rem',
                padding: '2.5rem 2rem',
                boxShadow: plan.highlight ? '0 20px 40px -8px rgba(30,49,71,0.35)' : '0 4px 6px -1px rgba(0,0,0,0.06)',
                border: plan.highlight ? 'none' : '1px solid #e2e8f0',
                position: 'relative',
                transform: plan.highlight ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.2s',
              }}>
                {plan.highlight && (
                  <span style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#3b82f6', color: '#ffffff', padding: '0.3rem 1.2rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    ⭐ Most Popular
                  </span>
                )}
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: plan.highlight ? '#ffffff' : '#1E3147', marginBottom: '0.4rem' }}>{plan.name}</h3>
                <p style={{ fontSize: '0.85rem', color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#64748b', marginBottom: '1.5rem' }}>{plan.description}</p>
                <div style={{ marginBottom: '1.75rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '800', color: plan.highlight ? '#ffffff' : '#1E3147' }}>{plan.price}</span>
                  <span style={{ fontSize: '0.85rem', color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#94a3b8', marginLeft: '0.4rem' }}>/{plan.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: plan.highlight ? 'rgba(255,255,255,0.9)' : '#374151' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={plan.highlight ? '#60a5fa' : '#22c55e'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(plan.ctaAction === 'register' ? '/register' : '/register')}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '0.6rem',
                    border: plan.highlight ? '2px solid rgba(255,255,255,0.3)' : `2px solid ${plan.color}`,
                    backgroundColor: plan.highlight ? 'rgba(255,255,255,0.15)' : plan.color,
                    color: plan.highlight ? '#ffffff' : '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
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
      <div style={{ backgroundColor: '#1E3147', color: '#ffffff', textAlign: 'center', padding: '4rem 1.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Ready to launch your DigiStore?</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', fontSize: '1.05rem' }}>Join hundreds of sellers already growing their business online.</p>
        <button
          onClick={() => navigate('/register')}
          style={{ backgroundColor: '#3b82f6', color: '#ffffff', padding: '0.9rem 2.5rem', borderRadius: '0.6rem', border: 'none', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          Create Your Store — It's Free
        </button>
      </div>

    </div>
  );
};

export default DigiStorePricing;

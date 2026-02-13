export default function User_Footer() {
  const textWhite = { color: '#ffffff' };
  const linkStyle = { color: '#ffffff', textDecoration: 'underline', cursor: 'pointer' };
  
  return (
    <footer className="bg-brgy-dark" style={{ fontFamily: "'Poppins', 'Inter', sans-serif", color: '#ffffff' }}>
      <div style={{ maxWidth: '100%', paddingLeft: '40px', paddingRight: '40px', paddingTop: '24px', paddingBottom: '24px' }}>
        {/* Top section with logo and 3 columns */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.15)', gap: '80px' }}>
          {/* Logo Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
            <img src="/SB Logo.png" alt="Barangay San Bartolome" style={{ width: '80px', height: '80px' }} />
            <div>
              <h4 style={{ ...textWhite, fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', lineHeight: 1.2 }}>Barangay San<br />Bartolome</h4>
              <p style={{ ...textWhite, fontSize: '13px', margin: '4px 0 0 0', opacity: 0.9 }}>Official Services Portal</p>
            </div>
          </div>

          {/* Three Columns - side by side */}
          <div style={{ display: 'flex', gap: '120px', flex: 1 }}>
            {/* Contact Us */}
            <div>
              <h5 style={{ ...textWhite, fontSize: '15px', fontWeight: 'bold', marginBottom: '12px' }}>Contact Us</h5>
              <div style={{ fontSize: '14px' }}>
                <div style={textWhite}>Address:</div>
                <div style={textWhite}>Phone:</div>
                <div style={textWhite}>Email:</div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h5 style={{ ...textWhite, fontSize: '15px', fontWeight: 'bold', marginBottom: '12px' }}>Quick Links</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px' }}>
                <li style={{ marginBottom: '6px' }}><a href="#" style={linkStyle}>Privacy Policy</a></li>
                <li style={{ marginBottom: '6px' }}><a href="#" style={linkStyle}>Terms of Services</a></li>
                <li><a href="#" style={linkStyle}>FAQs</a></li>
              </ul>
            </div>

            {/* Office Hours */}
            <div>
              <h5 style={{ ...textWhite, fontSize: '15px', fontWeight: 'bold', marginBottom: '12px' }}>Office Hours</h5>
              <p style={{ ...textWhite, fontSize: '14px', margin: '0 0 8px 0' }}>Mon-Fri, 8AM-5PM</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <a href="#" style={{ ...textWhite, fontSize: '14px' }}>f</a>
                <a href="#" style={{ ...textWhite, fontSize: '14px' }}>▶</a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ paddingTop: '16px', textAlign: 'center', fontSize: '14px', color: '#ffffff' }}>
          @ 2026 Barangay San Bartolome.
        </div>
      </div>
    </footer>
  );
}

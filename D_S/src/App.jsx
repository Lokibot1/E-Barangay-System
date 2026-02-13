import User_Navbar from './components/User_Navbar';
import User_Hero from './components/User_Hero';
import User_Services from './components/User_Services';
import User_Process from './components/User_Process';
import User_Announcements from './components/User_Announcements';
import User_Footer from './components/User_Footer';
import { Routes, Route, useLocation } from 'react-router-dom';
import User_Frm_Selector from './components/User_Frm_Selector';
import User_Frm_ReqB_ID from './components/User_Frm_ReqB_ID';
import User_Frm_Req_Indigen from './components/User_Frm_Req_Indigen';
import User_Frm_Req_COR from './components/User_Frm_Req_COR';
import User_Req_Success from './components/User_Req_Success';
import User_Req_Indigen_Success from './components/User_Req_Indigen_Success';
import User_Req_COR_Success from './components/User_Req_COR_Success';
import User_Req_Track from './components/User_Req_Track';
import LoginPage from './components/LoginPage';
import Adm_DashB from './components/Adm_DashB';
import Adm_Route from './components/Adm_Route';

function Home() {
  return (
    <>
      <User_Hero />
      <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)', minHeight: '600px', padding: '60px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Left Column */}
          <div>
            {/* Services Section */}
            <div style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '12px', 
              padding: '40px',
              marginBottom: '40px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
              transition: 'all 0.3s ease'
            }}>
              <User_Services />
            </div>
            
            {/* Process Section */}
            <div style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '12px', 
              padding: '40px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
            }}>
              <User_Process />
            </div>
          </div>
          
          {/* Right Column */}
          <div>
            <div style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '12px', 
              padding: '40px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
              position: 'sticky',
              top: '20px'
            }}>
              <User_Announcements />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function App() {
  const location = useLocation();
  // hide site navbar/footer for login and admin routes only
  const hideShell = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login');

  return (
    <div className="min-h-screen font-sans antialiased text-gray-900 bg-gray-50">
      {!hideShell && <User_Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forms" element={<User_Frm_Selector />} />
        <Route path="/forms/request-barangay" element={<User_Frm_ReqB_ID />} />
        <Route path="/forms/request-indigency" element={<User_Frm_Req_Indigen />} />
        <Route path="/forms/request-residency" element={<User_Frm_Req_COR />} />
        <Route path="/request-success" element={<User_Req_Success />} />
        <Route path="/request-indigency-success" element={<User_Req_Indigen_Success />} />
        <Route path="/request-residency-success" element={<User_Req_COR_Success />} />
        <Route path="/request-tracking" element={<User_Req_Track />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<Adm_Route><Adm_DashB /></Adm_Route>} />
      </Routes>
      {!hideShell && <User_Footer />}
    </div>
  );
}

export default App;
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '450px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          padding: '40px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Link to="/">
              <img 
                src="https://res.cloudinary.com/dekf5dyng/image/upload/v1752664923/TMJ_LOGO_02_tkbsuw.jpg"
                alt="Master Jackets"
                style={{ height: '180px' }}
              />
            </Link>
          </div>

          <Outlet /> {/* ✅ Correct: Only use Outlet here */}
        </div>
      </div>

      <footer style={{
        textAlign: 'center',
        padding: '20px',
        color: '#666',
        fontSize: '14px'
      }}>
        © {new Date().getFullYear()} Master Jackets. All rights reserved.adsadadasd
      </footer>
    </div>
  );
};

export default AuthLayout;

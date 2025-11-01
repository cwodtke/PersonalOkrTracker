import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyMagicLink } from '../api';

export default function VerifyMagicLink({ onLogin }) {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const verify = async () => {
      try {
        const result = await verifyMagicLink(token);

        if (result.user) {
          onLogin(result.user.id);
          setStatus('success');
          setTimeout(() => navigate('/'), 1500);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
      }
    };

    verify();
  }, [token, onLogin, navigate]);

  return (
    <div className="login-container">
      <div className="login-card">
        {status === 'verifying' && (
          <>
            <h2>Verifying your link...</h2>
            <p>Please wait while we log you in.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h2>Success!</h2>
            <p>Redirecting to your dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2>Invalid or Expired Link</h2>
            <p>This magic link is invalid or has expired.</p>
            <button onClick={() => navigate('/login')} className="btn-primary">
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

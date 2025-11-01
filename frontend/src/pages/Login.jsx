import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import './Login.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await login(email);

      if (result.user) {
        // For demo, automatically log them in
        onLogin(result.user.id);
        setMessage('Logged in! Redirecting...');
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (error) {
      setMessage('Error logging in. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Daily OKR Task Planner</h1>
          <p>Focus on what matters. Track your goals. Plan your day.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in...' : 'Get Started'}
          </button>

          {message && <p className="message">{message}</p>}
        </form>

        <div className="login-footer">
          <p>
            In production, we'd send you a magic link via email. For this demo, you'll be logged in automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

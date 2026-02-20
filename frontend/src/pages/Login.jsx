import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Login = ({ onLogin }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = { email, password };
      const apiCall = mode === 'login' ? authAPI.login : authAPI.register;
      const response = await apiCall(payload);
      const { token, user } = response.data;

      if (onLogin) {
        onLogin(token, user);
      }

      navigate('/');
    } catch (err) {
      const message =
        err.response?.data?.message || 'Unable to authenticate. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-dark/10 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-dark mb-6 text-center">
          {mode === 'login' ? 'Sign in to Vision' : 'Create your Vision account'}
        </h1>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-dark/20 px-3 py-2 focus:outline-none focus:border-dark"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-dark/20 px-3 py-2 focus:outline-none focus:border-dark"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-dark text-white py-2 font-semibold hover:bg-black disabled:opacity-60"
          >
            {submitting
              ? mode === 'login'
                ? 'Signing in...'
                : 'Creating account...'
              : mode === 'login'
              ? 'Sign in'
              : 'Create account'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          {mode === 'login' ? (
            <button
              type="button"
              onClick={() => setMode('register')}
              className="text-dark underline"
            >
              Create a new account
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-dark underline"
            >
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;


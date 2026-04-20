/**
 * Login Page
 * User login form
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/helpers';

const LoginPage = ({ onSuccess }) => {
  const { login, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        onSuccess?.();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(79,70,229,0.28),_transparent_40%),radial-gradient(circle_at_80%_80%,_rgba(34,197,94,0.22),_transparent_35%)]" />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900/90 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-textPrimary">Pulse Chat</h1>
          <p className="mt-2 text-sm text-textSecondary">Secure messaging, built for focused conversations.</p>
        </div>

        <h2 className="mb-8 text-center text-2xl font-semibold text-textPrimary">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`w-full rounded-xl border bg-slate-800 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.email ? 'border-rose-500' : 'border-slate-700'
              }`}
              disabled={loading}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-400">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`w-full rounded-xl border bg-slate-800 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.password ? 'border-rose-500' : 'border-slate-700'
              }`}
              disabled={loading}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-rose-400">{errors.password}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2 accent-indigo-600"
            />
            <label htmlFor="rememberMe" className="text-sm text-slate-400">
              Remember me
            </label>
          </div>

          {/* Auth Error */}
          {authError && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-rose-200">
              {authError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white transition duration-200 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={() => onSuccess?.({ page: 'register' })}
            className="font-medium text-indigo-400 transition hover:text-indigo-300"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

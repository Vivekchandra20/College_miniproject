/**
 * Register Page
 * User registration form
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isValidPassword } from '../utils/helpers';

const RegisterPage = ({ onSuccess }) => {
  const { register, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (result.success) {
        onSuccess?.();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,_rgba(79,70,229,0.28),_transparent_35%),radial-gradient(circle_at_85%_80%,_rgba(34,197,94,0.2),_transparent_35%)]" />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900/90 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-textPrimary">
          Create Account
        </h1>
        <p className="mb-8 text-center text-sm text-textSecondary">
          Join us for secure messaging
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className={`w-full rounded-xl border bg-slate-800 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.username ? 'border-rose-500' : 'border-slate-700'
              }`}
              disabled={loading}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-rose-400">{errors.username}</p>
            )}
          </div>

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

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={`w-full rounded-xl border bg-slate-800 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.confirmPassword ? 'border-rose-500' : 'border-slate-700'
              }`}
              disabled={loading}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.confirmPassword}
              </p>
            )}
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <button
            onClick={() => onSuccess?.({ page: 'login' })}
            className="font-medium text-indigo-400 transition hover:text-indigo-300"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

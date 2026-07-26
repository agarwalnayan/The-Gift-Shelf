import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import { resetPasswordApi } from '../api/authApi.js';
import { useAuth } from '../context/AuthContext.jsx';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await resetPasswordApi(token, form.password);
      localStorage.setItem('tgs_token', data.data.token);
      setUser(data.data.user);
      toast.success('Password reset successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'This reset link is invalid or has expired');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-tgs flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-semibold text-charcoal">Set a new password</h1>
        <p className="mt-2 text-sm text-charcoal/60">Choose a new password for your account.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            label="New Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            required
          />
          <Button type="submit" isLoading={isLoading} className="w-full">
            Reset Password
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-charcoal/60">
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
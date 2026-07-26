import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import { forgotPasswordApi } from '../api/authApi.js';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await forgotPasswordApi(email);
      setIsSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-tgs flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-semibold text-charcoal">Reset your password</h1>
        <p className="mt-2 text-sm text-charcoal/60">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {isSubmitted ? (
          <div className="mt-8 rounded-xl bg-primary-50 border border-primary-100 px-4 py-4 text-sm text-charcoal/70">
            If an account with that email exists, we've sent a password reset link to <strong>{email}</strong>.
            It expires in 1 hour.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" isLoading={isLoading} className="w-full">
              Send Reset Link
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-charcoal/60">
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle Social Order account creation state
  const accountCreated = location.state?.accountCreated;
  const prefillEmail = location.state?.email;
  
  useEffect(() => {
    if (prefillEmail) {
      setForm(prev => ({ ...prev, email: prefillEmail }));
    }
  }, [prefillEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const guestCartStr = localStorage.getItem('tgs_guest_cart');
      let hasGuestCart = false;
      try {
        hasGuestCart = guestCartStr && JSON.parse(guestCartStr)?.items?.length > 0;
      } catch (e) {
        // Ignore parse error
      }
      
      await login(form);

      const redirectTo =
        location.state?.from?.pathname || (hasGuestCart ? '/cart' : '/');
      navigate(redirectTo);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const isCheckoutFlow = location.state?.from?.pathname === '/checkout';

  return (
    <div className="container-tgs flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        {accountCreated && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              Your TGS account has been created. Please log in using the password you just created.
            </p>
          </div>
        )}
        
        <h1 className="font-display text-3xl font-semibold text-charcoal">
          {isCheckoutFlow ? 'Almost there' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-sm text-charcoal/60">
          {isCheckoutFlow
            ? 'Sign in to complete your order — your bag is saved.'
            : 'Sign in to continue to The Gift Shelf'}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" isLoading={isLoading} className="w-full">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-charcoal/60">
          Don't have an account?{' '}
          <Link to="/register" state={location.state} className="font-medium text-primary-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
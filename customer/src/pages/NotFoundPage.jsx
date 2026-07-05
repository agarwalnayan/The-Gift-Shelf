import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container-tgs flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-6xl font-semibold text-primary-600">404</p>
      <h1 className="mt-4 text-xl font-semibold text-charcoal">Page not found</h1>
      <p className="mt-2 text-sm text-charcoal/60">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-8">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;

import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-5xl font-semibold text-primary-600">404</p>
      <h1 className="mt-4 text-lg font-semibold text-ink">Page not found</h1>
      <Link to="/" className="btn-primary mt-6">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;

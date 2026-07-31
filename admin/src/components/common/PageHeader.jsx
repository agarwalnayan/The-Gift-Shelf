import { Children } from 'react';

const PageHeader = ({ title, description, actions, breadcrumbs }) => {
  return (
    <div className="mb-6 space-y-4">
      {breadcrumbs && (
        <nav className="flex items-center gap-2 text-sm text-ink/50">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-ink">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-ink/70">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-ink/60 sm:text-base">{description}</p>
          )}
        </div>
        
        {actions && Children.count(actions) > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;

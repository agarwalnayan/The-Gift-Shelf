const TableCard = ({ 
  title, 
  description, 
  columns, 
  data, 
  emptyMessage = 'No data available',
  renderRow,
  renderCard,
  actions,
  className = ''
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`card ${className}`}>
        <div className="p-12 text-center text-ink/50">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`card overflow-hidden ${className}`}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-4 border-b border-ink/10 p-4 sm:p-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            {title && <h3 className="text-lg font-semibold text-ink">{title}</h3>}
            {description && <p className="mt-1 text-sm text-ink/60">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 bg-ink/[0.02]">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 font-medium text-ink/60"
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b border-ink/5 last:border-0">
                {renderRow(item, index)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 p-4 md:hidden">
        {data.map((item, index) => (
          <div key={index} className="rounded-lg border border-ink/10 bg-ink/[0.02] p-4">
            {renderCard ? renderCard(item, index) : (
              <div className="space-y-3">
                {columns.map((column, colIndex) => (
                  <div key={colIndex} className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-ink/50 uppercase tracking-wide">{column.header}</span>
                    <span className="text-sm text-ink">
                      {renderRow(item, index)[colIndex]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableCard;

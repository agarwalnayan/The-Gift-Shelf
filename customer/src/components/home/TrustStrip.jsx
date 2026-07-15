const TrustStrip = () => {
  const features = [
    'FREE PERSONALISATION',
    'FREE DELIVERY',
    'PREMIUM PACKAGING',
    'SECURE PAYMENT'
  ];

  return (
    <div className="bg-white border-y border-charcoal/5 py-4">
      <div className="container-tgs">
        <div className="flex items-center justify-center gap-6 sm:gap-12 overflow-x-auto">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-charcoal uppercase tracking-wide">{feature}</span>
              {index < features.length - 1 && (
                <span className="text-charcoal/20 mx-2">•</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustStrip;

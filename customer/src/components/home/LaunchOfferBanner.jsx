const LaunchOfferBanner = () => {
  return (
    <div className="bg-charcoal text-cream py-6">
      <div className="container-tgs">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-cream/80">🎉 Launch Offer</p>
          <p className="text-2xl font-bold text-white">Flat 20% OFF</p>
          <p className="text-sm text-cream/80">Use Code <span className="font-semibold text-white">LAUNCH20</span></p>
          <p className="text-xs text-cream/60">Free Delivery</p>
        </div>
      </div>
    </div>
  );
};

export default LaunchOfferBanner;

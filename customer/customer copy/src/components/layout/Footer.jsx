import { Link } from 'react-router-dom';
import { HiOutlineShieldCheck, HiOutlineTruck, HiOutlineGiftTop } from 'react-icons/hi2';

const footerLinks = [
  {
    heading: 'Shop',
    links: [
      { label: 'All Products', to: '/products' },
      { label: 'Categories', to: '/categories' },
      { label: 'New Arrivals', to: '/products?sort=newest' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Track Order', to: '/account/orders' },
      { label: 'Shipping Policy', to: '/shipping-policy' },
      { label: 'Returns', to: '/returns' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
    ],
  },
];

const microTrust = [
  { icon: HiOutlineShieldCheck, label: 'Secure Payments' },
  { icon: HiOutlineGiftTop, label: 'Premium Packaging' },
  { icon: HiOutlineTruck, label: 'Fast Delivery' },
];

const Footer = () => {
  return (
    <footer className="border-t border-charcoal/10 bg-white">
      <div className="border-b border-charcoal/10">
        <div className="container-tgs flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 sm:justify-between">
          {microTrust.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs font-medium text-charcoal/60 sm:text-sm">
              <item.icon size={18} className="text-primary-600" />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="container-tgs grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:py-14 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-xl font-semibold text-charcoal">The Gift Shelf</p>
          <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-charcoal/60">
            Thoughtfully curated gifts for every occasion, delivered with care.
          </p>
        </div>

        {footerLinks.map((section) => (
          <div key={section.heading}>
            <p className="text-xs font-semibold uppercase tracking-widest text-charcoal/40">{section.heading}</p>
            <ul className="mt-4 space-y-2.5">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-charcoal/70 transition-colors hover:text-primary-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-charcoal/10 py-6">
        <p className="container-tgs text-center text-xs text-charcoal/50">
          &copy; {new Date().getFullYear()} The Gift Shelf. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

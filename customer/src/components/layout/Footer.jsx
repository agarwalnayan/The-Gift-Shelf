import { Link } from 'react-router-dom';
import { HiOutlineShieldCheck, HiOutlineTruck, HiOutlineGiftTop, HiOutlineEnvelope, HiOutlinePhone } from 'react-icons/hi2';
import { FaFacebook, FaInstagram, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import { useMarketing } from '../../context/MarketingContext.jsx';

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

// Social links map straight to the admin's Global Site Settings fields —
// only rendered when a URL is actually configured, so nothing broken/empty
// ever shows up on the storefront.
const socialLinks = (globalConfig) => [
  { url: globalConfig.facebookUrl, icon: FaFacebook, label: 'Facebook' },
  { url: globalConfig.instagramUrl, icon: FaInstagram, label: 'Instagram' },
  { url: globalConfig.twitterUrl, icon: FaXTwitter, label: 'Twitter / X' },
  { url: globalConfig.youtubeUrl, icon: FaYoutube, label: 'YouTube' },
];

const Footer = () => {
  const { globalConfig = {} } = useMarketing();
  const brandName = globalConfig.storeName || 'The Gift Shelf';
  const activeSocialLinks = socialLinks(globalConfig).filter((item) => item.url);

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

      <div className="container-tgs grid grid-cols-1 gap-x-6 gap-y-10 py-10 text-center sm:grid-cols-2 sm:py-14 sm:text-left md:grid-cols-4">
        <div className="flex flex-col items-center sm:col-span-2 sm:items-start md:col-span-1">
          <p className="font-display text-xl font-semibold text-charcoal">{brandName}</p>
          <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-charcoal/60">
            Thoughtfully curated gifts for every occasion, delivered with care.
          </p>

          {(globalConfig.contactEmail || globalConfig.contactPhone) && (
            <div className="mt-4 space-y-1.5">
              {globalConfig.contactEmail && (
                <a
                  href={`mailto:${globalConfig.contactEmail}`}
                  className="flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-primary-600"
                >
                  <HiOutlineEnvelope size={16} />
                  {globalConfig.contactEmail}
                </a>
              )}
              {globalConfig.contactPhone && (
                <a
                  href={`tel:${globalConfig.contactPhone}`}
                  className="flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-primary-600"
                >
                  <HiOutlinePhone size={16} />
                  {globalConfig.contactPhone}
                </a>
              )}
            </div>
          )}

          {activeSocialLinks.length > 0 && (
            <div className="mt-4 flex items-center gap-3">
              {activeSocialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="text-charcoal/50 hover:text-primary-600"
                >
                  <item.icon size={18} />
                </a>
              ))}
            </div>
          )}
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
          &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
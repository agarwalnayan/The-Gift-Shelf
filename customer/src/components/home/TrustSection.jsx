import {
  HiOutlineShieldCheck,
  HiOutlineGiftTop,
  HiOutlineChatBubbleLeftRight,
  HiOutlineTruck,
  HiOutlineArrowUturnLeft,
} from 'react-icons/hi2';

const badges = [
  { icon: HiOutlineShieldCheck, title: 'Secure Payments', description: 'Razorpay-protected checkout' },
  { icon: HiOutlineGiftTop, title: 'Premium Packaging', description: 'Gift-ready presentation' },
  { icon: HiOutlineChatBubbleLeftRight, title: 'Easy Support', description: "We're here to help" },
  { icon: HiOutlineTruck, title: 'Fast Delivery', description: '4–7 business days' },
  { icon: HiOutlineArrowUturnLeft, title: 'Easy Returns', description: '7-day return window' },
];

const TrustSection = () => {
  return (
    <section className="border-t border-charcoal/10 bg-white py-10 sm:py-12">
      <div className="container-tgs">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map((badge) => (
            <div key={badge.title} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <badge.icon size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal sm:text-sm">{badge.title}</p>
                <p className="text-[11px] text-charcoal/50 sm:text-xs">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;

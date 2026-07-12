const CONTENT = {
  about: {
    title: 'About The Gift Shelf',
    body: [
      'The Gift Shelf curates thoughtfully sourced gifts for every relationship, milestone, and occasion worth celebrating.',
      'We work directly with independent makers and trusted brands to bring you gifting options that feel personal, not generic — from everyday tokens of appreciation to once-in-a-lifetime celebrations.',
      'Every order is packed with care, because we believe presentation is as much a part of the gift as what is inside the box.',
    ],
  },
  contact: {
    title: 'Contact Us',
    body: [
      'We are happy to help with orders, product questions, or anything else on your mind.',
      'Email: support@thegiftshelf.in',
      'Phone: +91 98765 43210 (Mon–Sat, 10am–7pm IST)',
      'Address: The Gift Shelf, 4th Floor, Salt Lake Sector V, Kolkata, West Bengal 700091, India',
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    body: [
      'We collect only the information needed to process your orders and improve your shopping experience — your name, contact details, shipping address, and order history.',
      'We never sell your personal information to third parties. Payment details are handled securely by our payment partners and are not stored on our servers.',
      'You can request a copy of your data, or ask us to delete your account and associated data, at any time by writing to support@thegiftshelf.in.',
    ],
  },
  'shipping-policy': {
    title: 'Shipping Policy',
    body: [
      'Orders are typically dispatched within 1–2 business days of confirmation.',
      'Standard delivery takes 3–7 business days depending on your location; express options are shown at checkout where available.',
      'You will receive a tracking link by email/SMS as soon as your order ships. Shipping charges, if any, are shown at checkout before payment.',
    ],
  },
  returns: {
    title: 'Returns & Refunds',
    body: [
      'If something arrives damaged or incorrect, let us know within 48 hours of delivery at support@thegiftshelf.in with photos of the item, and we will arrange a replacement or refund.',
      'Personalized and made-to-order items cannot be returned unless they arrive damaged or defective.',
      'Approved refunds are processed to the original payment method within 5–7 business days.',
    ],
  },
};

/**
 * Single reusable page for every footer info link (About, Contact, and the
 * Policy pages) — content is real and specific to each slug, replacing what
 * were previously broken/placeholder footer links with no matching route.
 */
const StaticInfoPage = ({ slug }) => {
  const page = CONTENT[slug] || CONTENT.about;

  return (
    <div className="container-tgs max-w-2xl py-14 sm:py-16">
      <h1 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl">{page.title}</h1>
      <div className="mt-6 space-y-4">
        {page.body.map((paragraph, index) => (
          <p key={index} className="text-sm leading-relaxed text-charcoal/70 sm:text-base">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

export default StaticInfoPage;

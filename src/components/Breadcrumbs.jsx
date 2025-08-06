import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const breadcrumbLabels = {
  '/productandplan': 'Product & Plan',
  '/productandplan/plasticnfccard': 'Plastic NFC Card',
  '/productandplan/woodennfccard': 'Wooden NFC Card',
  '/productandplan/metalnfccard': 'Metal NFC Card',
  // UPDATED BREADCRUMB LABEL for the Konar Card details page
  '/productandplan/konarcard': 'Konar Card White Edition',
  // UPDATED BREADCRUMB LABEL for the How It Works page (linked from subscription details)
  '/productandplan/howitworks': 'How It Works Details', // Keeping this as it's the page linked from the "View Subscription Details" button
  // UPDATED BREADCRUMB LABEL for the Konar Power Profile Subscription page (if accessed directly)
  '/subscription': 'Konar Power Profile Subscription', // This is for the direct /subscription path
  // If you decide to also have a nested path for the actual subscription page:
  // '/productandplan/konarsubscription': 'Konar Power Profile Subscription',

  '/blog': 'Blog',
  '/whatisnfc': 'What Is NFC', // Keep if this is still a valid standalone path
  '/howitworks': 'How It Works', // Keep if this is still a valid standalone path
  '/reviews': 'Reviews',
  '/contactus': 'Contact Us',
  '/faq': 'FAQs',
  '/helpcentre': 'Help Centre',
  '/policies': 'Policies',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  if (pathnames.length === 0) return null;

  return (
    <nav className="breadcrumb-nav">
      <Link to="/" className="breadcrumb-link desktop-body">Home</Link>
      {pathnames.map((segment, index) => {
        const fullPath = '/' + pathnames.slice(0, index + 1).join('/');
        const label = breadcrumbLabels[fullPath] || decodeURIComponent(segment);
        const isLast = index === pathnames.length - 1;

        return (
          <span key={fullPath}>
            <span className="breadcrumb-separator"> &gt; </span>
            {isLast ? (
              <span className="breadcrumb-current desktop-body">{label}</span>
            ) : (
              <Link to={fullPath} className="breadcrumb-link desktop-body">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

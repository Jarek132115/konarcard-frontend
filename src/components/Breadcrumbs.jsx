import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const breadcrumbLabels = {
  '/productandplan': 'Product & Plan',
  '/productandplan/plasticnfccard': 'Plastic NFC Card',
  '/productandplan/woodennfccard': 'Wooden NFC Card',
  '/productandplan/metalnfccard': 'Metal NFC Card',
  '/productandplan/subscription': 'Power Profile',
  '/productandplan/whatisnfc': 'What Is NFC',
  '/productandplan/howitworks': 'How It Works', // NEW: Label for the nested How It Works page
  '/blog': 'Blog',
  '/whatisnfc': 'What Is NFC',
  '/howitworks': 'How It Works',
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

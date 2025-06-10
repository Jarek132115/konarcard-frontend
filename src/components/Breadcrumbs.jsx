import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const breadcrumbLabels = {
  '/shopnfccards': 'Shop NFC Cards',
  '/shopnfccards/plasticnfccard': 'Plastic NFC Card',
  '/shopnfccards/woodennfccard': 'Wooden NFC Card',
  '/shopnfccards/metalnfccard': 'Metal NFC Card',
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

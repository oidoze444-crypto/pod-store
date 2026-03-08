import React from 'react';

export default function Layout({ children, currentPageName }) {
  // Store and Checkout pages handle their own layout
  const noLayoutPages = ['Store', 'Checkout'];
  
  if (noLayoutPages.includes(currentPageName)) {
    return <>{children}</>;
  }

  // Admin pages handle their own layout via AdminLayout
  if (currentPageName?.startsWith('Admin')) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
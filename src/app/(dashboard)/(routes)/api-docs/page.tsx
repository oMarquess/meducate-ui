"use client";

import { ComingSoon } from '@/components/coming-soon';

export default function ApiDocsPage() {
  return (
    <ComingSoon
      title="API Documentation"
      description="Complete API documentation for integrating Meducate's medical analysis capabilities into your applications."
      features={[
        "Interactive API explorer",
        "Code samples in multiple languages",
        "Authentication guides",
        "Rate limiting information",
        "Webhook documentation",
        "SDK downloads"
      ]}
    />
  );
}

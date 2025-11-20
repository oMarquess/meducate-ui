"use client";

import { ComingSoon } from '@/components/coming-soon';

export default function ApiKeysPage() {
  return (
    <ComingSoon
      title="API Keys"
      description="Manage your API keys for programmatic access to Meducate's medical analysis capabilities."
      features={[
        "Generate secure API keys",
        "Monitor usage and rate limits",
        "Manage key permissions",
        "View access logs and analytics"
      ]}
    />
  );
}
 
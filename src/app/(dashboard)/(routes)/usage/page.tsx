"use client";

import { ComingSoon } from '@/components/coming-soon';

export default function UsagePage() {
  return (
    <ComingSoon
      title="Usage Analytics"
      description="Detailed analytics and insights into your Meducate usage patterns and API consumption."
      features={[
        "Real-time usage metrics",
        "Cost analysis and forecasting",
        "Performance insights",
        "Usage trends and patterns",
        "Downloadable reports",
        "Alert configuration"
      ]}
    />
  );
}

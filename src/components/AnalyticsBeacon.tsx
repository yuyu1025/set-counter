import Script from "next/script";

export function AnalyticsBeacon() {
  const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
  if (!token) {
    return null;
  }
  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token, spa: false })}
    />
  );
}

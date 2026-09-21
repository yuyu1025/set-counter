#!/usr/bin/env node

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "d68615c4b79a81e7cf83dff92d97560a";
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID ?? "fa3614b51069a8592002b5ea5fc2ef27";
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const HOST = "sets.distinctive.fun";
const PROJECT = "set-counter";
const TARGET = "set-counter.pages.dev";

if (!TOKEN) {
  console.error("Set CLOUDFLARE_API_TOKEN with Pages Edit, Zone DNS Edit, and Account RUM Edit.");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

async function api(method, path, body) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json();
  if (!json.success) {
    throw new Error(`${method} ${path}: ${JSON.stringify(json.errors)}`);
  }
  return json.result;
}

const records = await api(
  "GET",
  `/zones/${ZONE_ID}/dns_records?name=${HOST}&type=CNAME`,
);
if (records.length === 0) {
  await api("POST", `/zones/${ZONE_ID}/dns_records`, {
    type: "CNAME",
    name: HOST,
    content: TARGET,
    proxied: true,
    ttl: 1,
  });
  console.log(`Created CNAME ${HOST} -> ${TARGET}`);
} else {
  console.log(`CNAME already exists: ${records[0].content}`);
}

try {
  await api("POST", `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}/domains`, {
    name: HOST,
  });
  console.log(`Attached ${HOST} to Pages project ${PROJECT}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("already") || message.includes("taken")) {
    console.log(`Domain already attached: ${HOST}`);
  } else {
    console.log(message);
  }
}

try {
  const site = await api("POST", `/accounts/${ACCOUNT_ID}/rum/site_info`, {
    host: HOST,
    auto_install: true,
  });
  console.log("Web Analytics site created");
  if (site.site_tag) {
    console.log(`NEXT_PUBLIC_CF_BEACON_TOKEN=${site.site_tag}`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.log(`Web Analytics: ${message}`);
}

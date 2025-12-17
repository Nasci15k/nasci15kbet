import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use multiple IP detection services for reliability
    const services = [
      "https://api.ipify.org?format=json",
      "https://httpbin.org/ip",
      "https://api.my-ip.io/ip.json",
    ];

    const results: string[] = [];

    for (const service of services) {
      try {
        const response = await fetch(service);
        const data = await response.json();
        const ip = data.ip || data.origin || "unknown";
        results.push(`${service}: ${ip}`);
        console.log(`IP from ${service}:`, ip);
      } catch {
        results.push(`${service}: error`);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Outgoing IP addresses from Lovable Cloud",
        results,
        note: "Adicione estes IPs na whitelist da Playfivers"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlayfiversRequest {
  action: "getGameUrl" | "getBalance" | "getProviders" | "getGames" | "syncGames";
  gameCode?: string;
  userId?: string;
  providerCode?: number;
  page?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get API settings
    const { data: apiSettings, error: settingsError } = await supabase
      .from("api_settings")
      .select("*")
      .eq("provider", "playfivers")
      .single();

    if (settingsError || !apiSettings) {
      return new Response(
        JSON.stringify({ error: "API settings not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { agent_token, secret_key, webhook_url } = apiSettings;
    const body: PlayfiversRequest = await req.json();

    const baseUrl = "https://api.playfivers.com";

    if (body.action === "getGameUrl") {
      // Get user profile for balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", body.userId)
        .single();

      if (!profile) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const response = await fetch(`${baseUrl}/game/open`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_token,
          secret_key,
          user_code: profile.user_id,
          user_balance: profile.balance || 0,
          game_code: body.gameCode,
          lang: "pt",
          home_url: webhook_url,
        }),
      });

      const data = await response.json();
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.action === "getProviders") {
      const response = await fetch(`${baseUrl}/game/providers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_token, secret_key }),
      });

      const data = await response.json();
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.action === "getGames") {
      const response = await fetch(`${baseUrl}/game/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_token,
          secret_key,
          provider_code: body.providerCode,
          page: body.page || 1,
        }),
      });

      const data = await response.json();
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.action === "syncGames") {
      // Get providers first
      const providersResponse = await fetch(`${baseUrl}/game/providers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_token, secret_key }),
      });

      const providersData = await providersResponse.json();
      
      if (providersData.status !== "success") {
        return new Response(
          JSON.stringify({ error: "Failed to fetch providers" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Insert/update providers
      for (const provider of providersData.providers || []) {
        const slug = provider.name.toLowerCase().replace(/\s+/g, "-");
        
        await supabase
          .from("game_providers")
          .upsert({
            external_id: provider.code,
            name: provider.name,
            slug,
            logo: provider.icon || null,
            is_active: true,
          }, { onConflict: "external_id" });
      }

      // Sync games for each provider
      let totalGames = 0;
      for (const provider of providersData.providers || []) {
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const gamesResponse = await fetch(`${baseUrl}/game/list`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              agent_token,
              secret_key,
              provider_code: provider.code,
              page,
            }),
          });

          const gamesData = await gamesResponse.json();
          
          if (gamesData.status !== "success" || !gamesData.games?.length) {
            hasMore = false;
            continue;
          }

          // Get provider from DB
          const { data: dbProvider } = await supabase
            .from("game_providers")
            .select("id")
            .eq("external_id", provider.code)
            .single();

          // Insert games
          for (const game of gamesData.games) {
            await supabase
              .from("games")
              .upsert({
                external_code: game.game_code,
                name: game.game_name,
                image: game.banner || null,
                provider_id: dbProvider?.id,
                is_active: true,
                rtp: game.rtp || null,
              }, { onConflict: "external_code" });
            
            totalGames++;
          }

          page++;
          if (gamesData.games.length < 50) {
            hasMore = false;
          }
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Synced ${providersData.providers?.length || 0} providers and ${totalGames} games` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
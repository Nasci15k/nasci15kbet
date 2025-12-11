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

async function fetchPlayfivers(url: string, body: object): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    console.log("Fetching:", url);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type") || "";
    const responseText = await response.text();
    
    console.log("Response status:", response.status, "Content-Type:", contentType);
    console.log("Response preview:", responseText.substring(0, 500));

    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}: ${responseText.substring(0, 200)}` };
    }

    if (!contentType.includes("application/json")) {
      // Try to parse anyway in case content-type is wrong
      try {
        const data = JSON.parse(responseText);
        return { ok: true, data };
      } catch {
        return { ok: false, error: `API retornou HTML em vez de JSON. URL pode estar incorreta ou API fora do ar. Resposta: ${responseText.substring(0, 200)}` };
      }
    }

    const data = JSON.parse(responseText);
    return { ok: true, data };
  } catch (error) {
    console.error("Fetch error:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Unknown fetch error" };
  }
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
      console.error("API settings not found:", settingsError);
      return new Response(
        JSON.stringify({ error: "API settings not configured. Configure nas Configurações de API." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { agent_token, secret_key } = apiSettings;
    
    if (!agent_token || !secret_key) {
      return new Response(
        JSON.stringify({ error: "Agent Token ou Secret Key não configurados" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: PlayfiversRequest = await req.json();
    console.log("Action requested:", body.action);

    // Try different API URLs
    const apiUrls = [
      "https://api.playfivers.com",
      "https://playfivers.com/api",
    ];
    
    const baseUrl = apiUrls[0];
    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/playfivers-webhook`;

    if (body.action === "getGameUrl") {
      if (!body.userId || !body.gameCode) {
        return new Response(
          JSON.stringify({ error: "userId and gameCode are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get user profile for balance
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", body.userId)
        .single();

      if (profileError || !profile) {
        console.error("User not found:", body.userId, profileError);
        return new Response(
          JSON.stringify({ error: "Usuário não encontrado. Faça login novamente." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Opening game for user:", profile.user_id, "Balance:", profile.balance);

      const requestBody = {
        agent_token,
        secret_key,
        user_code: profile.user_id,
        user_balance: profile.balance || 0,
        game_code: body.gameCode,
        lang: "pt",
        home_url: "https://nasci15kbet.lovable.app",
      };

      console.log("Playfivers request:", JSON.stringify({ ...requestBody, secret_key: "[HIDDEN]" }));

      const result = await fetchPlayfivers(`${baseUrl}/game/open`, requestBody);
      
      if (!result.ok) {
        return new Response(
          JSON.stringify({ error: result.error }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (result.data?.status === "error" || result.data?.error) {
        return new Response(
          JSON.stringify({ error: result.data?.msg || result.data?.error || "Erro ao abrir jogo" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify(result.data),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.action === "getProviders") {
      console.log("Fetching providers from Playfivers...");
      
      const result = await fetchPlayfivers(`${baseUrl}/game/providers`, { agent_token, secret_key });
      
      if (!result.ok) {
        return new Response(
          JSON.stringify({ error: result.error }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify(result.data),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.action === "getGames") {
      console.log("Fetching games from provider:", body.providerCode);
      
      const result = await fetchPlayfivers(`${baseUrl}/game/list`, {
        agent_token,
        secret_key,
        provider_code: body.providerCode,
        page: body.page || 1,
      });
      
      if (!result.ok) {
        return new Response(
          JSON.stringify({ error: result.error }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify(result.data),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.action === "syncGames") {
      console.log("Starting full sync with Playfivers...");
      
      // Get providers first
      const providersResult = await fetchPlayfivers(`${baseUrl}/game/providers`, { agent_token, secret_key });
      
      if (!providersResult.ok) {
        return new Response(
          JSON.stringify({ error: `Erro ao buscar provedores: ${providersResult.error}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const providersData = providersResult.data;
      console.log("Providers fetched:", providersData?.status);
      
      if (providersData?.status !== "success" || !providersData?.providers) {
        console.error("Failed to fetch providers:", providersData);
        return new Response(
          JSON.stringify({ 
            error: `Falha ao buscar provedores. Resposta da API: ${JSON.stringify(providersData || {}).substring(0, 200)}` 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Insert/update providers
      let providersCount = 0;
      for (const provider of providersData.providers || []) {
        const slug = provider.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        
        // Check if provider exists
        const { data: existingProvider } = await supabase
          .from("game_providers")
          .select("id")
          .eq("external_id", provider.code)
          .maybeSingle();

        if (existingProvider) {
          await supabase
            .from("game_providers")
            .update({
              name: provider.name,
              logo: provider.icon || null,
              is_active: true,
            })
            .eq("external_id", provider.code);
        } else {
          await supabase
            .from("game_providers")
            .insert({
              external_id: provider.code,
              name: provider.name,
              slug,
              logo: provider.icon || null,
              is_active: true,
            });
        }
        providersCount++;
      }

      console.log("Providers synced:", providersCount);

      // Sync games for each provider
      let totalGames = 0;
      for (const provider of providersData.providers || []) {
        let page = 1;
        let hasMore = true;

        // Get provider from DB
        const { data: dbProvider } = await supabase
          .from("game_providers")
          .select("id")
          .eq("external_id", provider.code)
          .maybeSingle();

        while (hasMore) {
          const gamesResult = await fetchPlayfivers(`${baseUrl}/game/list`, {
            agent_token,
            secret_key,
            provider_code: provider.code,
            page,
          });
          
          if (!gamesResult.ok) {
            console.error(`Error fetching games for provider ${provider.name}:`, gamesResult.error);
            hasMore = false;
            continue;
          }

          const gamesData = gamesResult.data;
          
          if (gamesData?.status !== "success" || !gamesData?.games?.length) {
            hasMore = false;
            continue;
          }

          console.log(`Provider ${provider.name} page ${page}: ${gamesData.games.length} games`);

          // Insert games
          for (const game of gamesData.games) {
            // Check if game exists
            const { data: existingGame } = await supabase
              .from("games")
              .select("id")
              .eq("external_code", game.game_code)
              .maybeSingle();

            if (existingGame) {
              await supabase
                .from("games")
                .update({
                  name: game.game_name,
                  image: game.banner || null,
                  provider_id: dbProvider?.id,
                  is_active: true,
                  rtp: game.rtp || null,
                })
                .eq("external_code", game.game_code);
            } else {
              await supabase
                .from("games")
                .insert({
                  external_code: game.game_code,
                  name: game.game_name,
                  image: game.banner || null,
                  provider_id: dbProvider?.id,
                  is_active: true,
                  rtp: game.rtp || null,
                });
            }
            
            totalGames++;
          }

          page++;
          if (gamesData.games.length < 50) {
            hasMore = false;
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log("Sync complete. Total games:", totalGames);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Sincronizado com sucesso! ${providersCount} provedores e ${totalGames} jogos.` 
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

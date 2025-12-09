import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/casino/Header";
import { Sidebar } from "@/components/casino/Sidebar";
import { HeroBanner } from "@/components/casino/HeroBanner";
import { CategoryFilter } from "@/components/casino/CategoryFilter";
import { SearchBar } from "@/components/casino/SearchBar";
import { GamesGrid } from "@/components/casino/GamesGrid";
import { WinnersSection } from "@/components/casino/WinnersSection";
import { GameModal } from "@/components/casino/GameModal";
import { mockGames, mockWinners } from "@/data/mockData";
import { Game } from "@/types/casino";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameUrl, setGameUrl] = useState<string | null>(null);

  const isLoggedIn = !!user;
  const balance = profile?.balance || 0;

  const filteredGames = useMemo(() => {
    let games = mockGames;

    if (activeCategory !== "all") {
      games = games.filter((game) => {
        if (activeCategory === "live") return game.isLive;
        if (activeCategory === "slots") return game.category === "slots";
        if (activeCategory === "aviator") return game.category === "aviator";
        if (activeCategory === "crash") return game.category === "crash";
        if (activeCategory === "mines") return game.category === "mines";
        if (activeCategory === "spaceman") return game.category === "spaceman";
        if (activeCategory === "roulette") return game.category === "roulette";
        if (activeCategory === "fortune-tiger") return game.name.toLowerCase().includes("fortune");
        return true;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      games = games.filter(
        (game) =>
          game.name.toLowerCase().includes(query) ||
          game.provider.toLowerCase().includes(query)
      );
    }

    return games;
  }, [activeCategory, searchQuery]);

  const handlePlayGame = (game: Game) => {
    if (!isLoggedIn) {
      toast.error("Faça login para jogar");
      navigate("/auth");
      return;
    }

    setSelectedGame(game);
    setIsGameModalOpen(true);
    setGameUrl(null);
    toast.info(`Carregando ${game.name}...`);
  };

  const handleDeposit = () => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }
    navigate("/deposit");
  };

  const handleLogin = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        balance={balance}
        isLoggedIn={isLoggedIn}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogin={handleLogin}
        onDeposit={handleDeposit}
      />

      <Sidebar
        isOpen={sidebarOpen}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          setSidebarOpen(false);
        }}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="pt-16 lg:pl-64">
        <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
          <HeroBanner />
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
          <WinnersSection winners={mockWinners} />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {activeCategory === "all" ? "Todos os Jogos" : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1).replace("-", " ")}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredGames.length} jogos
              </span>
            </div>
            <GamesGrid games={filteredGames} onPlayGame={handlePlayGame} />
          </div>
        </div>
      </main>

      <GameModal
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
        game={selectedGame}
        gameUrl={gameUrl}
      />
    </div>
  );
};

export default Index;
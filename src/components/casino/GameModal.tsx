import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Game } from "@/types/casino";
import { X, Maximize, Volume2, VolumeX, Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game | null;
  gameUrl: string | null;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export const GameModal = ({
  isOpen,
  onClose,
  game,
  gameUrl,
  isLoading = false,
  errorMessage,
  onRetry,
}: GameModalProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    const iframe = document.getElementById("game-iframe");
    if (iframe) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        iframe.requestFullscreen();
        setIsFullscreen(true);
      }
    }
  };

  if (!game) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 bg-background border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{game.name}</h3>
              <p className="text-xs text-muted-foreground">{game.provider}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleFullscreen}>
              <Maximize className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Game iframe */}
        <div className="flex-1 bg-background">
          {gameUrl ? (
            <iframe
              id="game-iframe"
              src={gameUrl}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen"
              title={game.name}
            />
          ) : isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
                <p className="text-muted-foreground">Carregando jogo…</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md px-6">
                <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden">
                  <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-semibold">Não foi possível abrir o jogo</h3>
                <p className="text-muted-foreground">
                  {errorMessage || "Tente novamente em alguns segundos."}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Button variant="secondary" onClick={onClose}>Fechar</Button>
                  <Button
                    variant="accent"
                    onClick={onRetry}
                    disabled={!onRetry}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Tentar novamente
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

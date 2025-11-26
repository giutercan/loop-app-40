import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Star, 
  Sparkles, 
  PartyPopper, 
  Award,
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Confetti {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
}

function ConfettiPiece({ confetti }: { confetti: Confetti }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      initial={{
        x: confetti.x,
        y: -20,
        rotate: 0,
        opacity: 1,
      }}
      animate={{
        y: [0, 400],
        x: [confetti.x, confetti.x + (Math.random() - 0.5) * 100],
        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 3,
        delay: confetti.delay,
        ease: "easeOut",
      }}
      style={{
        width: confetti.size,
        height: confetti.size,
        backgroundColor: confetti.color,
        borderRadius: Math.random() > 0.5 ? "50%" : "0",
      }}
    />
  );
}

function ConfettiExplosion({ count = 50 }: { count?: number }) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  useEffect(() => {
    const colors = [
      "hsl(var(--primary))",
      "#8DC63F",
      "#00ADBB",
      "#A3238E",
      "#FFD700",
      "#FF6B6B",
    ];

    const newConfetti: Confetti[] = [];
    for (let i = 0; i < count; i++) {
      newConfetti.push({
        id: i,
        x: Math.random() * 300 - 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        size: 6 + Math.random() * 8,
      });
    }
    setConfetti(newConfetti);
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {confetti.map((c) => (
        <ConfettiPiece key={c.id} confetti={c} />
      ))}
    </div>
  );
}

interface MilestoneCelebrationProps {
  open: boolean;
  onClose: () => void;
  milestone: {
    title: string;
    description?: string;
    type: "milestone" | "kpi_target" | "value_realized" | "project_complete";
    value?: string | number;
    improvement?: number;
  };
}

const celebrationIcons = {
  milestone: Trophy,
  kpi_target: TrendingUp,
  value_realized: Award,
  project_complete: PartyPopper,
};

const celebrationColors = {
  milestone: "from-amber-500 to-yellow-600",
  kpi_target: "from-primary to-emerald-600",
  value_realized: "from-purple-500 to-pink-600",
  project_complete: "from-cyan-500 to-blue-600",
};

const celebrationMessages = {
  milestone: "Milestone Achieved!",
  kpi_target: "Target Reached!",
  value_realized: "Value Delivered!",
  project_complete: "Congratulations!",
};

export function MilestoneCelebration({ open, onClose, milestone }: MilestoneCelebrationProps) {
  const Icon = celebrationIcons[milestone.type];
  const gradientClass = celebrationColors[milestone.type];
  const message = celebrationMessages[milestone.type];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md overflow-hidden" data-testid="dialog-celebration">
        <AnimatePresence>
          {open && (
            <>
              <ConfettiExplosion count={60} />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="relative z-10"
              >
                <DialogHeader className="text-center pb-4">
                  <motion.div
                    className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center mb-4 shadow-lg`}
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <DialogTitle className="text-2xl font-bold">
                    {message}
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    {milestone.title}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 text-center">
                  {milestone.description && (
                    <p className="text-muted-foreground">{milestone.description}</p>
                  )}

                  {milestone.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="py-4"
                    >
                      <div className="text-4xl font-bold font-mono text-primary">
                        {typeof milestone.value === "number"
                          ? milestone.value >= 1000000
                            ? `$${(milestone.value / 1000000).toFixed(1)}M`
                            : milestone.value >= 1000
                            ? `$${(milestone.value / 1000).toFixed(0)}K`
                            : milestone.value
                          : milestone.value}
                      </div>
                      {milestone.improvement && (
                        <Badge
                          variant="outline"
                          className="mt-2 border-primary text-primary"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {milestone.improvement}% improvement
                        </Badge>
                      )}
                    </motion.div>
                  )}

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>Achievement Unlocked</span>
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </div>

                  <Button
                    onClick={onClose}
                    className="w-full mt-4"
                    data-testid="button-close-celebration"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Continue
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

interface AchievementBadgeProps {
  type: "gold" | "silver" | "bronze" | "milestone";
  label: string;
  date?: string;
  onClick?: () => void;
}

export function AchievementBadge({ type, label, date, onClick }: AchievementBadgeProps) {
  const colors = {
    gold: "from-amber-400 to-yellow-600 text-amber-900",
    silver: "from-gray-300 to-gray-500 text-gray-900",
    bronze: "from-orange-400 to-orange-700 text-orange-900",
    milestone: "from-primary to-emerald-600 text-white",
  };

  return (
    <motion.button
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${colors[type]} font-medium text-sm shadow-md hover:shadow-lg transition-shadow`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      data-testid={`badge-achievement-${type}`}
    >
      <Trophy className="w-4 h-4" />
      <span>{label}</span>
      {date && <span className="text-xs opacity-75">({date})</span>}
    </motion.button>
  );
}

interface MilestoneCardProps {
  milestone: {
    id: number;
    title: string;
    description?: string;
    status: "planned" | "achieved" | "missed";
    date: string;
    linkedKPIs?: string[];
  };
  onCelebrate?: () => void;
}

export function MilestoneCard({ milestone, onCelebrate }: MilestoneCardProps) {
  const statusColors = {
    achieved: "border-primary/30 bg-primary/5",
    planned: "border-amber-500/30 bg-amber-500/5",
    missed: "border-destructive/30 bg-destructive/5",
  };

  const statusIcons = {
    achieved: CheckCircle2,
    planned: TrendingUp,
    missed: Award,
  };

  const Icon = statusIcons[milestone.status];

  return (
    <motion.div
      className={`p-4 rounded-lg border ${statusColors[milestone.status]} transition-all hover-elevate`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      data-testid={`card-milestone-${milestone.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${milestone.status === 'achieved' ? 'bg-primary/20' : milestone.status === 'planned' ? 'bg-amber-500/20' : 'bg-destructive/20'}`}>
            <Icon className={`w-5 h-5 ${milestone.status === 'achieved' ? 'text-primary' : milestone.status === 'planned' ? 'text-amber-500' : 'text-destructive'}`} />
          </div>
          <div>
            <h4 className="font-medium">{milestone.title}</h4>
            {milestone.description && (
              <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">{milestone.date}</p>
          </div>
        </div>
        {milestone.status === "achieved" && onCelebrate && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCelebrate}
            className="shrink-0"
            data-testid={`button-celebrate-${milestone.id}`}
          >
            <PartyPopper className="w-4 h-4 text-amber-500" />
          </Button>
        )}
      </div>
      {milestone.linkedKPIs && milestone.linkedKPIs.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {milestone.linkedKPIs.map((kpi, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {kpi}
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  );
}

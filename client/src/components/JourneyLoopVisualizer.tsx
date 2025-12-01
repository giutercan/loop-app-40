import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, FlaskConical, TrendingUp, Lightbulb, RefreshCw,
  ChevronRight, ChevronLeft, Play, Pause, X, Maximize2,
  CheckCircle2, Clock, AlertCircle, Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  JOURNEY_LOOP_STAGES, 
  JourneyLoopStage, 
  JourneyLoopProgress,
  JourneyLoopStageId 
} from '@shared/value-frameworks';

const iconMap: Record<string, any> = {
  Rocket,
  FlaskConical,
  TrendingUp,
  Lightbulb,
  RefreshCw
};

const colorMap: Record<string, { 
  bg: string; 
  border: string; 
  text: string; 
  gradient: string;
  svgFill: string;
  svgStroke: string;
  svgFillActive: string;
}> = {
  blue: { 
    bg: 'bg-blue-500/20', 
    border: 'border-blue-500', 
    text: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500 to-blue-600',
    svgFill: '#dbeafe',
    svgStroke: '#3b82f6',
    svgFillActive: '#3b82f6'
  },
  amber: { 
    bg: 'bg-amber-500/20', 
    border: 'border-amber-500', 
    text: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500 to-amber-600',
    svgFill: '#fef3c7',
    svgStroke: '#f59e0b',
    svgFillActive: '#f59e0b'
  },
  emerald: { 
    bg: 'bg-emerald-500/20', 
    border: 'border-emerald-500', 
    text: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500 to-emerald-600',
    svgFill: '#d1fae5',
    svgStroke: '#10b981',
    svgFillActive: '#10b981'
  },
  violet: { 
    bg: 'bg-violet-500/20', 
    border: 'border-violet-500', 
    text: 'text-violet-600 dark:text-violet-400',
    gradient: 'from-violet-500 to-violet-600',
    svgFill: '#ede9fe',
    svgStroke: '#8b5cf6',
    svgFillActive: '#8b5cf6'
  },
  rose: { 
    bg: 'bg-rose-500/20', 
    border: 'border-rose-500', 
    text: 'text-rose-600 dark:text-rose-400',
    gradient: 'from-rose-500 to-rose-600',
    svgFill: '#ffe4e6',
    svgStroke: '#f43f5e',
    svgFillActive: '#f43f5e'
  }
};

interface JourneyLoopVisualizerProps {
  outcomeName: string;
  solutionPattern?: string;
  progress?: JourneyLoopProgress[];
  quickWins?: { title: string; timeline: string; expectedImpact: string }[];
  kpis?: { name: string; target?: number; current?: number }[];
  isCompact?: boolean;
  onStageClick?: (stage: JourneyLoopStage) => void;
}

export function JourneyLoopVisualizer({
  outcomeName,
  solutionPattern,
  progress = [],
  quickWins = [],
  kpis = [],
  isCompact = false,
  onStageClick
}: JourneyLoopVisualizerProps) {
  const [activeStage, setActiveStage] = useState<JourneyLoopStage>(JOURNEY_LOOP_STAGES[0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const stages = JOURNEY_LOOP_STAGES;
  const activeIndex = stages.findIndex(s => s.id === activeStage.id);

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setActiveStage(prev => {
          const currentIndex = stages.findIndex(s => s.id === prev.id);
          const nextIndex = (currentIndex + 1) % stages.length;
          return stages[nextIndex];
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, stages]);

  const getStageProgress = (stageId: string): JourneyLoopProgress => {
    return progress.find(p => p.stageId === stageId) || {
      stageId,
      status: 'not_started',
      completionPercentage: 0
    };
  };

  const getStatusIcon = (status: JourneyLoopProgress['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'blocked': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const navigateStage = (direction: 'prev' | 'next') => {
    const currentIndex = stages.findIndex(s => s.id === activeStage.id);
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % stages.length
      : (currentIndex - 1 + stages.length) % stages.length;
    setActiveStage(stages[newIndex]);
  };

  const CircularLoop = ({ size = 280, interactive = true }: { size?: number; interactive?: boolean }) => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.38;
    const nodeRadius = size * 0.08;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
        <defs>
          {stages.map((stage) => {
            const colors = colorMap[stage.color];
            return (
              <linearGradient key={stage.id} id={`gradient-${stage.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.svgStroke} stopOpacity={0.7} />
                <stop offset="100%" stopColor={colors.svgStroke} />
              </linearGradient>
            );
          })}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {stages.map((stage, i) => {
          const angle1 = (i * 72 - 90) * (Math.PI / 180);
          const angle2 = ((i + 1) * 72 - 90) * (Math.PI / 180);
          const x1 = centerX + radius * Math.cos(angle1);
          const y1 = centerY + radius * Math.sin(angle1);
          const x2 = centerX + radius * Math.cos(angle2);
          const y2 = centerY + radius * Math.sin(angle2);
          
          const midAngle = ((i * 72 + 36) - 90) * (Math.PI / 180);
          const ctrlX = centerX + (radius * 1.15) * Math.cos(midAngle);
          const ctrlY = centerY + (radius * 1.15) * Math.sin(midAngle);

          const isActive = stage.id === activeStage.id || stages[(i + 1) % stages.length].id === activeStage.id;
          const stageColors = colorMap[stage.color];
          
          return (
            <motion.path
              key={`arc-${i}`}
              d={`M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`}
              fill="none"
              stroke={isActive ? `url(#gradient-${stage.id})` : stageColors.svgStroke}
              strokeWidth={isActive ? 3 : 2}
              strokeDasharray="8 4"
              opacity={isActive ? 1 : 0.3}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
            />
          );
        })}

        {stages.map((stage, i) => {
          const angle = (i * 72 - 90) * (Math.PI / 180);
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          const isActive = stage.id === activeStage.id;
          const stageProgress = getStageProgress(stage.id);
          const colors = colorMap[stage.color];
          const Icon = iconMap[stage.icon];

          return (
            <g key={stage.id}>
              <motion.circle
                cx={x}
                cy={y}
                r={nodeRadius + 4}
                stroke={isActive ? colors.svgStroke : '#e5e7eb'}
                strokeWidth={isActive ? 3 : 1}
                fill="none"
                filter={isActive ? 'url(#glow)' : undefined}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              />
              
              <motion.circle
                cx={x}
                cy={y}
                r={nodeRadius}
                fill={isActive ? colors.svgFillActive : colors.svgFill}
                strokeWidth={2}
                stroke={isActive ? 'white' : colors.svgStroke}
                style={{ cursor: interactive ? 'pointer' : 'default' }}
                onClick={() => interactive && setActiveStage(stage)}
                whileHover={interactive ? { scale: 1.1 } : {}}
                whileTap={interactive ? { scale: 0.95 } : {}}
              />
              
              {Icon && (
                <foreignObject
                  x={x - nodeRadius * 0.6}
                  y={y - nodeRadius * 0.6}
                  width={nodeRadius * 1.2}
                  height={nodeRadius * 1.2}
                  className="pointer-events-none"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : colors.text}`} />
                  </div>
                </foreignObject>
              )}

              <text
                x={x}
                y={y + nodeRadius + 16}
                textAnchor="middle"
                fill={isActive ? colors.svgStroke : '#6b7280'}
                style={{ fontSize: '12px', fontWeight: 500 }}
              >
                {stage.shortName}
              </text>

              {stageProgress.status !== 'not_started' && (
                <foreignObject
                  x={x + nodeRadius * 0.5}
                  y={y - nodeRadius - 8}
                  width={20}
                  height={20}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    {getStatusIcon(stageProgress.status)}
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}

        <text
          x={centerX}
          y={centerY - 8}
          textAnchor="middle"
          fill="#374151"
          style={{ fontSize: '14px', fontWeight: 600 }}
        >
          Value
        </text>
        <text
          x={centerX}
          y={centerY + 10}
          textAnchor="middle"
          fill="#374151"
          style={{ fontSize: '14px', fontWeight: 600 }}
        >
          Journey
        </text>
      </svg>
    );
  };

  const StageDetail = ({ stage }: { stage: JourneyLoopStage }) => {
    const colors = colorMap[stage.color];
    const stageProgress = getStageProgress(stage.id);
    const Icon = iconMap[stage.icon];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${colors.bg} ${colors.border} border-2`}>
            {Icon && <Icon className={`w-6 h-6 ${colors.text}`} />}
          </div>
          <div>
            <h3 className={`text-xl font-bold ${colors.text}`}>{stage.name}</h3>
            <p className="text-sm text-muted-foreground">{stage.duration}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {getStatusIcon(stageProgress.status)}
            <span className="text-sm text-muted-foreground capitalize">
              {stageProgress.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className={`p-4 rounded-lg bg-gradient-to-r ${colors.gradient} text-white`}>
          <p className="text-sm font-medium italic">"{stage.customerMessage}"</p>
        </div>

        <p className="text-muted-foreground">{stage.description}</p>

        {stageProgress.completionPercentage > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className={colors.text}>{stageProgress.completionPercentage}%</span>
            </div>
            <Progress value={stageProgress.completionPercentage} className="h-2" />
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Key Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {stage.activities.map((activity, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${colors.bg.replace('/20', '')}`} />
                    {activity}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Success Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {stage.successSignals.map((signal, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 text-emerald-500 flex-shrink-0" />
                    {signal}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">KPI Focus Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stage.kpiHighlights.map((kpi, i) => (
                <Badge key={i} variant="secondary" className={`${colors.bg} ${colors.text} border-none`}>
                  {kpi}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (isCompact) {
    return (
      <div 
        className="flex items-center gap-2 cursor-pointer hover-elevate p-2 rounded-lg"
        onClick={() => setIsFullScreen(true)}
        data-testid="journey-loop-compact"
      >
        <div className="flex -space-x-1">
          {stages.slice(0, 3).map(stage => {
            const Icon = iconMap[stage.icon];
            const colors = colorMap[stage.color];
            return (
              <div 
                key={stage.id}
                className={`w-6 h-6 rounded-full ${colors.bg} ${colors.border} border flex items-center justify-center`}
              >
                {Icon && <Icon className={`w-3 h-3 ${colors.text}`} />}
              </div>
            );
          })}
        </div>
        <span className="text-xs text-muted-foreground">View Journey Loop</span>
        <Maximize2 className="w-3 h-3 text-muted-foreground" />

        <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                {outcomeName} - Value Realization Journey
              </DialogTitle>
            </DialogHeader>
            <JourneyLoopVisualizer
              outcomeName={outcomeName}
              solutionPattern={solutionPattern}
              progress={progress}
              quickWins={quickWins}
              kpis={kpis}
              isCompact={false}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="journey-loop-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateStage('prev')}
            data-testid="journey-loop-prev"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            data-testid="journey-loop-autoplay"
          >
            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateStage('next')}
            data-testid="journey-loop-next"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-1">
          {stages.map((stage, i) => (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage)}
              className={`w-2 h-2 rounded-full transition-all ${
                stage.id === activeStage.id 
                  ? `w-6 bg-gradient-to-r ${colorMap[stage.color].gradient}` 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              data-testid={`journey-loop-dot-${stage.id}`}
            />
          ))}
        </div>

        <Badge variant="secondary" className="text-xs">
          Stage {activeIndex + 1} of {stages.length}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex items-center justify-center p-4">
          <CircularLoop size={320} />
        </div>

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <StageDetail key={activeStage.id} stage={activeStage} />
          </AnimatePresence>
        </div>
      </div>

      {quickWins.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Rocket className="w-4 h-4 text-amber-500" />
              Quick Wins Along the Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {quickWins.slice(0, 3).map((win, i) => (
                <div key={i} className="p-3 rounded-lg border bg-card/50">
                  <div className="font-medium text-sm">{win.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{win.timeline}</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                    {win.expectedImpact}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function JourneyLoopPresentationMode({
  outcomeName,
  solutionPattern,
  progress,
  quickWins,
  kpis,
  isOpen,
  onClose
}: JourneyLoopVisualizerProps & { isOpen: boolean; onClose: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary animate-spin-slow" />
              <span>{outcomeName}</span>
              {solutionPattern && (
                <Badge variant="outline" className="ml-2">
                  {solutionPattern.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <JourneyLoopVisualizer
            outcomeName={outcomeName}
            solutionPattern={solutionPattern}
            progress={progress}
            quickWins={quickWins}
            kpis={kpis}
            isCompact={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default JourneyLoopVisualizer;

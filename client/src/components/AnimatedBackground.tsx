interface FloatingOrbProps {
  size: number;
  color: string;
  top: string;
  left: string;
  delay: number;
  duration: number;
}

function FloatingOrb({ size, color, top, left, delay, duration }: FloatingOrbProps) {
  return (
    <div
      className="absolute rounded-full blur-3xl opacity-30 pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        top,
        left,
        animation: `float-slow ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

interface AnimatedBackgroundProps {
  variant?: "default" | "subtle" | "vibrant";
  className?: string;
}

export function AnimatedBackground({ variant = "default", className = "" }: AnimatedBackgroundProps) {
  const orbs = variant === "subtle" ? [
    { size: 400, color: "hsl(167 100% 19% / 0.15)", top: "10%", left: "5%", delay: 0, duration: 25 },
    { size: 300, color: "hsl(162 100% 30% / 0.1)", top: "60%", left: "70%", delay: 5, duration: 20 },
  ] : variant === "vibrant" ? [
    { size: 600, color: "hsl(167 100% 19% / 0.2)", top: "-10%", left: "-5%", delay: 0, duration: 25 },
    { size: 500, color: "hsl(193 100% 22% / 0.15)", top: "50%", left: "60%", delay: 3, duration: 22 },
    { size: 400, color: "hsl(162 100% 30% / 0.15)", top: "70%", left: "10%", delay: 7, duration: 28 },
    { size: 350, color: "hsl(315 65% 40% / 0.1)", top: "20%", left: "80%", delay: 10, duration: 30 },
  ] : [
    { size: 500, color: "hsl(167 100% 19% / 0.15)", top: "5%", left: "0%", delay: 0, duration: 25 },
    { size: 400, color: "hsl(193 100% 22% / 0.12)", top: "40%", left: "65%", delay: 4, duration: 22 },
    { size: 350, color: "hsl(162 100% 30% / 0.1)", top: "75%", left: "20%", delay: 8, duration: 28 },
  ];

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20 animate-gradient-shift" />
      {orbs.map((orb, index) => (
        <FloatingOrb key={index} {...orb} />
      ))}
      <div className="absolute inset-0 bg-background/40" />
    </div>
  );
}

export function GradientMesh({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg className="absolute w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

export function ShimmerLine({ className = "" }: { className?: string }) {
  return (
    <div className={`h-px w-full animate-shimmer ${className}`} />
  );
}

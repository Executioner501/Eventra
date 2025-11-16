import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

// Floating Paths Background Component
function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg
        className="w-full h-full opacity-60"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="#2563eb"
            strokeWidth={path.width}
            strokeOpacity={0.15 + path.id * 0.02}
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 15 + path.id * 0.5,
              repeat: Infinity,
              ease: "linear",
              delay: path.id * 0.1,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

function Hero() {
  const router = useRouter();
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Events", "Workshops", "Screenings", "Seminars"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Animated Background Paths */}
      <div className="absolute inset-0 z-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-3xl tracking-tighter text-center font-regular">
              <span className="text-gray-900">Discover the Best</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-blue-600"
                    initial={{ opacity: 0, y: -100 }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-gray-600 max-w-2xl text-center">
              Campus life is full of opportunities, but staying updated shouldn't be a challenge.
              We bring every event into one simple, organized space so you can discover, plan, and enjoy what matters without the hassle.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button 
              size="lg" 
              className="gap-4" 
              variant="outline"
              onClick={() => router.push('/admin/login')}
            >
              <div className="text-white flex items-center gap-2">
                Are you Admin? <MoveRight className="w-4 h-4" />
              </div>
            </Button>
            <Button 
              size="lg" 
              className="gap-4"
              onClick={() => router.push('/home')}
            >
              Explore Events <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
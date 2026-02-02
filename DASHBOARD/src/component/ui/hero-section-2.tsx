import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils' // Your shadcn utility for merging class names
import { MoveRight } from 'lucide-react'

// Props interface for type safety and reusability
interface AnimatedGlobeHeroProps {
  titlePrefix: string
  animatedWords: string[]
  subtitle: string
  ctaText: string
  ctaLink?: string // Optional link
  onCtaClick?: () => void // Optional click handler
  badgeText?: string // Optional badge
  globeSrc: string // Image source for the globe
  className?: string
}

export const AnimatedGlobeHero = ({
  titlePrefix,
  animatedWords,
  subtitle,
  ctaText,
  ctaLink,
  onCtaClick,
  badgeText,
  globeSrc,
  className,
}: AnimatedGlobeHeroProps) => {
  const [index, setIndex] = useState(0)

  // Effect to cycle through the animated words
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prevIndex => (prevIndex + 1) % animatedWords.length)
    }, 3000) // Change word every 3 seconds

    return () => clearInterval(interval)
  }, [animatedWords.length])

  return (
    <section
      className={cn(
        'relative w-full min-h-screen flex flex-col items-center justify-center text-center overflow-hidden bg-background p-4 md:p-8',
        className
      )}
    >
      <div className="z-10 flex flex-col items-center space-y-6 md:space-y-8 max-w-4xl mx-auto">
        {/* Optional Badge */}
        {badgeText && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm"
          >
            {badgeText}
          </motion.div>
        )}

        {/* Main Heading with Animated Text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground"
        >
          {titlePrefix}{' '}
          <div className="inline-block relative h-[1.2em] w-[300px] md:w-[450px] lg:w-[600px] overflow-hidden align-bottom">
            <AnimatePresence mode="wait">
              <motion.span
                key={animatedWords[index]}
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '-100%', opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 text-primary whitespace-nowrap bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
              >
                {animatedWords[index]}
              </motion.span>
            </AnimatePresence>
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-full"
            />
          </div>
        </motion.h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-base md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">{subtitle}</p>

        {/* Call to Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          {onCtaClick ? (
            <motion.button
              onClick={onCtaClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center rounded-full text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl"
            >
              {ctaText}
              <MoveRight className="w-4 h-4 ml-2" />
            </motion.button>
          ) : (
            <motion.a
              href={ctaLink || '#'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center rounded-full text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl"
            >
              {ctaText}
              <MoveRight className="w-4 h-4 ml-2" />
            </motion.a>
          )}
        </div>
      </div>

      {/* Globe Image with Rotation Animation */}
      <div className="absolute -bottom-[25%] md:-bottom-[40%] lg:-bottom-[50%] -z-0 w-full max-w-screen-lg opacity-40 dark:opacity-30">
        <img
          src={globeSrc}
          alt="Rotating Earth Globe"
          className="w-full h-auto animate-globe-spin"
        />
      </div>
    </section>
  )
}
// You'll need to add the animation keyframes to your global CSS or tailwind.config.js
/*
In your globals.css:
@keyframes globe-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-globe-spin {
  animation: globe-spin 40s linear infinite;
}
*/

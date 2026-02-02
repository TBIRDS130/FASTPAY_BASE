import AnimatedLogo from './AnimatedLogo'

/**
 * Demo component to showcase the AnimatedLogo
 * You can import and use this to test the logo, or import AnimatedLogo directly
 */
export default function AnimatedLogoDemo() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-12 p-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-muted-foreground">FASTPAY Animated Logo</h1>

        {/* Large Logo with Tagline */}
        <div className="py-12">
          <AnimatedLogo size="xl" showTagline tagline="The Real Gaming Platform" animated />
        </div>

        {/* Medium Logo */}
        <div className="py-8">
          <AnimatedLogo size="lg" animated />
        </div>

        {/* Small Logo - Non-animated */}
        <div className="py-4">
          <AnimatedLogo size="md" animated={false} />
        </div>

        {/* Extra Small Logo */}
        <div className="py-2">
          <AnimatedLogo size="sm" animated />
        </div>
      </div>

      {/* Usage Examples */}
      <div className="max-w-2xl w-full space-y-4">
        <div className="premium-card p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Usage Examples</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <span className="text-muted-foreground">// Basic usage</span>
              <div className="text-foreground mt-1">{`<AnimatedLogo />`}</div>
            </div>
            <div className="mt-4">
              <span className="text-muted-foreground">// With tagline</span>
              <div className="text-foreground mt-1">
                {`<AnimatedLogo showTagline tagline="Custom Tagline" />`}
              </div>
            </div>
            <div className="mt-4">
              <span className="text-muted-foreground">// Different sizes</span>
              <div className="text-foreground mt-1">{`<AnimatedLogo size="xl" />`}</div>
            </div>
            <div className="mt-4">
              <span className="text-muted-foreground">// Non-animated</span>
              <div className="text-foreground mt-1">{`<AnimatedLogo animated={false} />`}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

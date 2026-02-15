import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface SectionAnimatorProps {
  children: React.ReactNode;
  sectionKey: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideInLeft' | 'slideInRight' | 'scale';
  delay?: number;
  duration?: number;
  className?: string;
}

export function SectionAnimator({
  children,
  sectionKey,
  animation = 'fadeIn',
  delay = 0,
  duration = 300,
  className,
}: SectionAnimatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setTimeout(() => {
              setIsVisible(true);
              setHasAnimated(true);
            }, delay);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay, hasAnimated]);

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0';
    
    switch (animation) {
      case 'fadeIn':
        return 'animate-fade-in';
      case 'slideUp':
        return 'animate-slide-up';
      case 'slideInLeft':
        return 'animate-slide-in-left';
      case 'slideInRight':
        return 'animate-slide-in-right';
      case 'scale':
        return 'animate-scale-in';
      default:
        return 'animate-fade-in';
    }
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all ease-out',
        getAnimationClass(),
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
      data-section-key={sectionKey}
    >
      {children}
    </div>
  );
}

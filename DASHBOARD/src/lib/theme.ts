// Theme management utility

export type ThemePreset =
  | 'default'
  | 'dark-premium'
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'red'
  | 'teal'
  | 'pink'
  | 'cyberpunk'
  | 'ocean'

export interface ThemeUIConfig {
  borderRadius: string // e.g., '0.5rem', '0', '1rem'
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'none'
  borderWidth: string // e.g., '1px', '2px', '0'
  shadowStyle: 'none' | 'soft' | 'medium' | 'hard' | 'glow' | 'neon'
  cardStyle: 'solid' | 'glass' | 'outlined' | 'gradient'
  spacing: 'compact' | 'normal' | 'spacious'
  backgroundPattern: 'none' | 'dots' | 'grid' | 'waves' | 'gradient'
}

export interface ThemeConfig {
  name: string
  description: string
  ui?: ThemeUIConfig // Optional UI config, defaults applied if not specified
  light: {
    primary: string
    primaryForeground: string
    accent: string
    accentForeground: string
  }
  dark: {
    primary: string
    primaryForeground: string
    accent: string
    accentForeground: string
  }
}

export const themePresets: Record<ThemePreset, ThemeConfig> = {
  default: {
    name: 'Default',
    description: 'Classic gray theme',
    ui: {
      borderRadius: '0.5rem',
      borderStyle: 'solid',
      borderWidth: '1px',
      shadowStyle: 'soft',
      cardStyle: 'solid',
      spacing: 'normal',
      backgroundPattern: 'none',
    },
    light: {
      primary: '0 0% 9%',
      primaryForeground: '0 0% 98%',
      accent: '0 0% 96.1%',
      accentForeground: '0 0% 9%',
    },
    dark: {
      primary: '0 0% 98%',
      primaryForeground: '0 0% 9%',
      accent: '0 0% 14.9%',
      accentForeground: '0 0% 98%',
    },
  },
  blue: {
    name: 'Blue',
    description: 'Professional blue theme',
    ui: {
      borderRadius: '0.5rem',
      borderStyle: 'solid',
      borderWidth: '1px',
      shadowStyle: 'medium',
      cardStyle: 'solid',
      spacing: 'normal',
      backgroundPattern: 'none',
    },
    light: {
      primary: '221 83% 53%',
      primaryForeground: '0 0% 98%',
      accent: '221 83% 96%',
      accentForeground: '221 83% 20%',
    },
    dark: {
      primary: '221 83% 53%',
      primaryForeground: '0 0% 98%',
      accent: '221 83% 20%',
      accentForeground: '221 83% 90%',
    },
  },
  green: {
    name: 'Green',
    description: 'Fresh green theme',
    light: {
      primary: '142 76% 36%',
      primaryForeground: '0 0% 98%',
      accent: '142 76% 96%',
      accentForeground: '142 76% 20%',
    },
    dark: {
      primary: '142 76% 36%',
      primaryForeground: '0 0% 98%',
      accent: '142 76% 20%',
      accentForeground: '142 76% 90%',
    },
  },
  purple: {
    name: 'Purple',
    description: 'Elegant purple theme',
    light: {
      primary: '262 83% 58%',
      primaryForeground: '0 0% 98%',
      accent: '262 83% 96%',
      accentForeground: '262 83% 20%',
    },
    dark: {
      primary: '262 83% 58%',
      primaryForeground: '0 0% 98%',
      accent: '262 83% 20%',
      accentForeground: '262 83% 90%',
    },
  },
  orange: {
    name: 'Orange',
    description: 'Vibrant orange theme',
    light: {
      primary: '25 95% 53%',
      primaryForeground: '0 0% 98%',
      accent: '25 95% 96%',
      accentForeground: '25 95% 20%',
    },
    dark: {
      primary: '25 95% 53%',
      primaryForeground: '0 0% 98%',
      accent: '25 95% 20%',
      accentForeground: '25 95% 90%',
    },
  },
  red: {
    name: 'Red',
    description: 'Bold red theme',
    light: {
      primary: '0 84% 60%',
      primaryForeground: '0 0% 98%',
      accent: '0 84% 96%',
      accentForeground: '0 84% 20%',
    },
    dark: {
      primary: '0 84% 60%',
      primaryForeground: '0 0% 98%',
      accent: '0 84% 20%',
      accentForeground: '0 84% 90%',
    },
  },
  teal: {
    name: 'Teal',
    description: 'Calm teal theme',
    light: {
      primary: '173 80% 40%',
      primaryForeground: '0 0% 98%',
      accent: '173 80% 96%',
      accentForeground: '173 80% 20%',
    },
    dark: {
      primary: '173 80% 40%',
      primaryForeground: '0 0% 98%',
      accent: '173 80% 20%',
      accentForeground: '173 80% 90%',
    },
  },
  pink: {
    name: 'Pink',
    description: 'Soft pink theme',
    light: {
      primary: '340 82% 52%',
      primaryForeground: '0 0% 98%',
      accent: '340 82% 96%',
      accentForeground: '340 82% 20%',
    },
    dark: {
      primary: '340 82% 52%',
      primaryForeground: '0 0% 98%',
      accent: '340 82% 20%',
      accentForeground: '340 82% 90%',
    },
  },
  'dark-premium': {
    name: 'Dark Premium',
    description:
      'Glassmorphism with neon green and indigo accents. Modern, high-tech feel perfect for fintech.',
    ui: {
      borderRadius: '0.75rem',
      borderStyle: 'solid',
      borderWidth: '1px',
      shadowStyle: 'glow',
      cardStyle: 'glass',
      spacing: 'normal',
      backgroundPattern: 'dots',
    },
    light: {
      primary: '150 100% 50%', // #00ff88 neon green
      primaryForeground: '0 0% 4%',
      accent: '238 87% 64%', // #6366f1 indigo
      accentForeground: '0 0% 98%',
    },
    dark: {
      primary: '150 100% 50%', // #00ff88 neon green
      primaryForeground: '0 0% 4%',
      accent: '238 87% 64%', // #6366f1 indigo
      accentForeground: '0 0% 98%',
    },
  },
  cyberpunk: {
    name: 'Cyberpunk',
    description: 'Neon cyberpunk aesthetic with vibrant purple and green. Futuristic, high-energy vibe.',
    ui: {
      borderRadius: '0',
      borderStyle: 'solid',
      borderWidth: '2px',
      shadowStyle: 'neon',
      cardStyle: 'outlined',
      spacing: 'normal',
      backgroundPattern: 'grid',
    },
    light: {
      primary: '280 100% 50%', // #b300ff neon purple
      primaryForeground: '0 0% 100%',
      accent: '120 100% 50%', // #00ff00 neon green
      accentForeground: '0 0% 0%',
    },
    dark: {
      primary: '280 100% 60%', // Brighter neon purple
      primaryForeground: '0 0% 100%',
      accent: '120 100% 50%', // #00ff00 neon green
      accentForeground: '0 0% 100%',
    },
  },
  ocean: {
    name: 'Ocean',
    description: 'Calming ocean blues and teals. Peaceful, professional, perfect for data-heavy interfaces.',
    ui: {
      borderRadius: '1rem',
      borderStyle: 'solid',
      borderWidth: '1px',
      shadowStyle: 'soft',
      cardStyle: 'glass',
      spacing: 'spacious',
      backgroundPattern: 'waves',
    },
    light: {
      primary: '200 100% 40%', // Ocean blue
      primaryForeground: '0 0% 100%',
      accent: '180 100% 35%', // Teal
      accentForeground: '0 0% 100%',
    },
    dark: {
      primary: '200 100% 50%', // Bright ocean blue
      primaryForeground: '0 0% 100%',
      accent: '180 100% 45%', // Bright teal
      accentForeground: '0 0% 100%',
    },
  },
}

// Default UI config for themes that don't specify one
const defaultUIConfig: ThemeUIConfig = {
  borderRadius: '0.5rem',
  borderStyle: 'solid',
  borderWidth: '1px',
  shadowStyle: 'medium',
  cardStyle: 'solid',
  spacing: 'normal',
  backgroundPattern: 'none',
}

function getShadowCSS(shadowStyle: string, primaryColor: string): string {
  const primary = `hsl(${primaryColor})`
  switch (shadowStyle) {
    case 'none':
      return 'none'
    case 'soft':
      return '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)'
    case 'medium':
      return '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)'
    case 'hard':
      return '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)'
    case 'glow':
      return `0 0 20px ${primary}40, 0 0 40px ${primary}20`
    case 'neon':
      return `0 0 5px ${primary}, 0 0 10px ${primary}, 0 0 15px ${primary}, 0 0 20px ${primary}80`
    default:
      return '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)'
  }
}

function getCardStyleCSS(cardStyle: string, isDark: boolean): string {
  switch (cardStyle) {
    case 'glass':
      return isDark
        ? 'background: rgba(30, 30, 30, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1);'
        : 'background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(0, 0, 0, 0.1);'
    case 'outlined':
      return 'background: transparent; border: 2px solid;'
    case 'gradient':
      return isDark
        ? 'background: linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9));'
        : 'background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.9));'
    case 'solid':
    default:
      return ''
  }
}

function getSpacingCSS(spacing: string): string {
  switch (spacing) {
    case 'compact':
      return '0.5rem'
    case 'spacious':
      return '1.5rem'
    case 'normal':
    default:
      return '1rem'
  }
}

function getBackgroundPatternCSS(pattern: string, primaryColor: string): string {
  const primary = `hsl(${primaryColor})`
  switch (pattern) {
    case 'dots':
      return `radial-gradient(circle, ${primary}15 1px, transparent 1px)`
    case 'grid':
      return `linear-gradient(${primary}10 1px, transparent 1px), linear-gradient(90deg, ${primary}10 1px, transparent 1px)`
    case 'waves':
      return `repeating-linear-gradient(45deg, transparent, transparent 10px, ${primary}05 10px, ${primary}05 20px)`
    case 'gradient':
      return `linear-gradient(135deg, ${primary}10, transparent)`
    case 'none':
    default:
      return 'none'
  }
}

export function applyTheme(preset: ThemePreset, isDark: boolean = false) {
  try {
    if (typeof window === 'undefined' || !document.documentElement) {
      return
    }

    const theme = themePresets[preset]
    if (!theme) {
      console.warn(`Theme preset "${preset}" not found, using default`)
      return
    }

    const colors = isDark ? theme.dark : theme.light
    const ui = theme.ui || defaultUIConfig
    const root = document.documentElement

    // Apply primary colors
    root.style.setProperty('--primary', colors.primary)
    root.style.setProperty('--primary-foreground', colors.primaryForeground)
    root.style.setProperty('--accent', colors.accent)
    root.style.setProperty('--accent-foreground', colors.accentForeground)

    // Apply UI styles as CSS variables
    root.style.setProperty('--theme-border-radius', ui.borderRadius)
    root.style.setProperty('--theme-border-style', ui.borderStyle)
    root.style.setProperty('--theme-border-width', ui.borderWidth)
    root.style.setProperty('--theme-shadow', getShadowCSS(ui.shadowStyle, colors.primary))
    root.style.setProperty('--theme-spacing', getSpacingCSS(ui.spacing))
    root.style.setProperty('--theme-bg-pattern', getBackgroundPatternCSS(ui.backgroundPattern, colors.primary))
    
    // Apply card style directly to body class
    const cardStyleCSS = getCardStyleCSS(ui.cardStyle, isDark)
    if (cardStyleCSS) {
      root.style.setProperty('--theme-card-bg', cardStyleCSS.includes('background') ? 'transparent' : '')
      // Store card style in data attribute for CSS targeting
      root.setAttribute('data-card-style', ui.cardStyle)
    }

    // Add theme class for CSS targeting
    root.classList.remove(...Object.keys(themePresets).map(t => `theme-${t}`))
    root.classList.add(`theme-${preset}`)

    // Store theme preference
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme-preset', preset)
    }
  } catch (error) {
    console.error('Error applying theme:', error)
  }
}

export function getStoredTheme(): ThemePreset {
  try {
    if (typeof window === 'undefined' || !localStorage) {
      return 'default'
    }
    const stored = localStorage.getItem('theme-preset') as ThemePreset
    return stored && stored in themePresets ? stored : 'default'
  } catch (error) {
    console.error('Error getting stored theme:', error)
    return 'default'
  }
}

export function applyStoredTheme(isDark: boolean = false) {
  const preset = getStoredTheme()
  applyTheme(preset, isDark)
}

export function applyThemeModePreference(mode?: string): boolean {
  try {
    if (typeof window === 'undefined' || !document.documentElement) {
      return false
    }

    const normalized = (mode || '').toLowerCase()
    if (!normalized) {
      return false
    }

    const isDark = normalized === 'dark' || normalized === 'black'
    const isLight = normalized === 'white' || normalized === 'light'
    if (!isDark && !isLight) {
      return false
    }

    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dark-mode', isDark.toString())
      localStorage.setItem('dark-mode-set', 'true')
    }

    // Reapply theme with explicit mode
    applyStoredTheme(isDark)
    return true
  } catch (error) {
    console.error('Error applying theme mode preference:', error)
    return false
  }
}

export function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark')
  localStorage.setItem('dark-mode', isDark.toString())
  localStorage.setItem('dark-mode-set', 'true')

  // Reapply theme with new mode
  const preset = getStoredTheme()
  applyTheme(preset, isDark)

  return isDark
}

export function initTheme() {
  try {
    if (typeof window === 'undefined' || !document.documentElement) {
      return
    }

    // Restore dark mode preference, default to light theme
    let darkMode = false
    if (typeof localStorage !== 'undefined') {
      const storedDarkMode = localStorage.getItem('dark-mode')
      const modeSet = localStorage.getItem('dark-mode-set')
      darkMode = modeSet ? storedDarkMode === 'true' : false
      if (!modeSet) {
        localStorage.setItem('dark-mode', 'false')
      }
    }

    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Apply stored theme (defaults to dark-premium)
    applyStoredTheme(darkMode)
  } catch (error) {
    console.error('Error initializing theme:', error)
  }
}

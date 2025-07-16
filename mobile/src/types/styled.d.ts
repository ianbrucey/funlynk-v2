import 'styled-components/native';
import { theme } from '@/constants/theme';

declare module 'styled-components/native' {
  export interface DefaultTheme {
    colors: typeof theme.colors;
    spacing: typeof theme.spacing;
    borderRadius: typeof theme.borderRadius;
    typography: typeof theme.typography;
    textStyles: typeof theme.textStyles;
    shadows: typeof theme.shadows;
    touchTargets: typeof theme.touchTargets;
    animations: typeof theme.animations;
  }
}

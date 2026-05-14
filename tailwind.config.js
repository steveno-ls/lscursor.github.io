// ✅ Import the preset from your theme package (each theme exports its own preset)
import { preset } from '@lightspeed/unified-components-helios-theme/preset';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.tsx',
    // ✅ Add the content paths for the theme components
    './node_modules/@lightspeed/unified-components-helios-theme/dist/**/*.js'
  ],
  presets: [
    // ✅ Add the Unified Components Tailwind preset
    preset,
  ],
  theme: { extend: {} },
  plugins: [],
};
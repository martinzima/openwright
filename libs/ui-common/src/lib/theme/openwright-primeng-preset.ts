import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const OpenWrightPrimengPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{green.50}',
            100: '{green.100}',
            200: '{green.200}',
            300: '{green.300}',
            400: '{green.400}',
            500: '{green.500}',
            600: '{green.600}',
            700: '{green.700}',
            800: '{green.800}',
            900: '{green.900}',
            950: '{green.950}',
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{slate.800}',
                    inverseColor: '#ffffff',
                    hoverColor: '{slate.900}',
                    activeColor: '{slate.800}',
                },
                highlight: {
                    background: '{slate.950}',
                    focusBackground: '{slate.700}',
                    color: '#ffffff',
                    focusColor: '#ffffff',
                },
                surface: {
                    0: '#ffffff',
                    50: '{gray.50}',
                    100: '{gray.100}',
                    200: '{gray.200}',
                    300: '{gray.300}',
                    400: '{gray.400}',
                    500: '{gray.500}',
                    600: '{gray.600}',
                    700: '{gray.700}',
                    800: '{gray.800}',
                    900: '{gray.900}',
                    950: '{gray.950}'
                }
            },
            dark: {
                primary: {
                    color: '{slate.50}',
                    inverseColor: '{slate.950}',
                    hoverColor: '{slate.100}',
                    activeColor: '{slate.200}',
                },
                highlight: {
                    background: 'rgba(250, 250, 250, .16)',
                    focusBackground: 'rgba(250, 250, 250, .24)',
                    color: 'rgba(255,255,255,.87)',
                    focusColor: 'rgba(255,255,255,.87)',
                },
                surface: {
                    0: '#ffffff',
                    50: '{slate.50}',
                    100: '{slate.100}',
                    200: '{slate.200}',
                    300: '{slate.300}',
                    400: '{slate.400}',
                    500: '{slate.500}',
                    600: '{slate.600}',
                    700: '{slate.700}',
                    800: '{slate.800}',
                    900: '{slate.900}',
                    950: '{slate.950}'
                }
            },
        },
    },
});

import { createElement, type CSSProperties } from 'react'
import type { Preview } from '@storybook/nextjs'

import '../src/app/globals.css'
import { ThemeProvider } from '../src/components/theme-provider'

const storybookRootStyle = {
  ['--font-inter' as string]: 'Inter, system-ui, sans-serif',
  ['--font-share-tech-mono' as string]:
    '"Share Tech Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
} as CSSProperties

const preview: Preview = {
  decorators: [
    (Story) =>
      createElement(
        ThemeProvider,
        { attribute: 'class', defaultTheme: 'dark', enableSystem: false },
        createElement(
          'div',
          {
            className:
              'min-h-screen bg-background text-foreground font-sans antialiased',
            style: storybookRootStyle,
          },
          createElement(Story),
        ),
      ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview

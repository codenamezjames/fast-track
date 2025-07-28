/**
 * JSDoc Configuration for FastTrack
 * Generates comprehensive documentation for the application
 */

export default {
  source: {
    include: ['src'],
    includePattern: '.+\\.js$',
    excludePattern: '(node_modules/|docs/)',
  },

  plugins: ['plugins/markdown'],

  templates: {
    cleverLinks: true,
    monospaceLinks: true,
    default: {
      outputSourceFiles: true,
      includeDate: true,
    },
  },

  opts: {
    destination: './docs',
    recurse: true,
    readme: './README.md',
    template: 'node_modules/docdash',
    tutorials: './docs/tutorials',
  },

  markdown: {
    idInHeadings: true,
  },

  tags: {
    allowUnknownTags: ['component', 'composable', 'store', 'service'],
  },

  sourceType: 'module',

  // Custom tags for Vue components
  customTags: [
    {
      name: 'component',
      description: 'Vue component documentation',
    },
    {
      name: 'composable',
      description: 'Vue composable function',
    },
    {
      name: 'store',
      description: 'Pinia store documentation',
    },
    {
      name: 'service',
      description: 'Service layer documentation',
    },
  ],
}

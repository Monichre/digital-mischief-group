import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

export default [
  {
    ignores: [
      'node_modules/**',
      'docs/**',
      'scripts/**',
      '.next/**',
      'dist/**',
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      'import/no-anonymous-default-export': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      'react/jsx-no-comment-textnodes': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      'react/no-unescaped-entities': 'warn',
    },
  },
]

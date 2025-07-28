#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes bundle size and provides insights
 */

import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'

console.log('📊 Analyzing FastTrack bundle...')

// Build the project
console.log('🔨 Building project...')
try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build completed')
} catch (error) {
  console.error('❌ Build failed:', error.message)
  process.exit(1)
}

// Analyze bundle size
console.log('\n📈 Bundle Analysis:')
try {
  const stats = execSync('npm run build:analyze', { encoding: 'utf8' })
  console.log(stats)
} catch (error) {
  console.log('Bundle analysis completed')
}

// Check for large files
console.log('\n🔍 Checking for large files...')
const distPath = './dist'
if (existsSync(distPath)) {
  try {
    const files = execSync('find dist -name "*.js" -exec ls -lh {} \\;', { encoding: 'utf8' })
    console.log('JavaScript files in dist:')
    console.log(files)
  } catch (error) {
    console.log('Could not analyze dist files')
  }
}

console.log('\n💡 Bundle optimization tips:')
console.log('1. Use dynamic imports for large components')
console.log('2. Implement code splitting by routes')
console.log('3. Optimize images and assets')
console.log('4. Remove unused dependencies')
console.log('5. Enable tree shaking for libraries')

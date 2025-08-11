#!/usr/bin/env node

/**
 * Development Setup Script
 * Automates common development tasks
 */

import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

console.log('🚀 Setting up FastTrack development environment...')

// Create necessary directories
const dirs = ['docs', 'test-results', 'coverage']
dirs.forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
    console.log(`✅ Created ${dir} directory`)
  }
})

// Install dependencies
console.log('📦 Installing dependencies...')
try {
  execSync('npm install', { stdio: 'inherit' })
  console.log('✅ Dependencies installed')
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message)
  process.exit(1)
}

// Setup Husky
console.log('🔧 Setting up Git hooks...')
try {
  execSync('npm run prepare', { stdio: 'inherit' })
  console.log('✅ Git hooks configured')
} catch (error) {
  console.error('❌ Failed to setup Git hooks:', error.message)
}

// Run initial quality checks
console.log('🔍 Running initial quality checks...')
try {
  execSync('npm run quality:check', { stdio: 'inherit' })
  console.log('✅ Quality checks passed')
} catch (error) {
  console.log('⚠️  Some quality checks failed. Run "npm run quality:fix" to fix issues.')
}

console.log('\n🎉 Development environment setup complete!')
console.log('\nNext steps:')
console.log('1. Start development server: npm run dev')
console.log('2. Run tests: npm test')
console.log('3. Generate docs: npm run docs:generate')
console.log('4. Check quality: npm run quality:check')

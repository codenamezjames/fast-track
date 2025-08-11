#!/usr/bin/env node

/**
 * FastTrack Mobile Testing Script
 * Tests PWA functionality, mobile responsiveness, and performance
 */

const fs = require('fs');
const path = require('path');

console.log('📱 FastTrack Mobile Testing Report');
console.log('==================================');

// Test 1: PWA Manifest Validation
function testManifest() {
    console.log('\n🔍 Testing PWA Manifest...');
    
    const manifestPath = path.join(__dirname, 'dist/pwa/manifest.json');
    if (!fs.existsSync(manifestPath)) {
        console.log('❌ manifest.json not found');
        return false;
    }
    
    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        const requiredFields = ['name', 'short_name', 'start_url', 'display', 'theme_color', 'background_color', 'icons'];
        const missingFields = requiredFields.filter(field => !manifest[field]);
        
        if (missingFields.length === 0) {
            console.log('✅ PWA Manifest is valid');
            console.log(`   - Name: ${manifest.name}`);
            console.log(`   - Icons: ${manifest.icons.length} sizes`);
            console.log(`   - Display: ${manifest.display}`);
            console.log(`   - Theme: ${manifest.theme_color}`);
            return true;
        } else {
            console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Invalid manifest.json format');
        return false;
    }
}

// Test 2: Service Worker Validation
function testServiceWorker() {
    console.log('\n🔧 Testing Service Worker...');
    
    const swPath = path.join(__dirname, 'dist/pwa/sw.js');
    if (!fs.existsSync(swPath)) {
        console.log('❌ Service Worker not found');
        return false;
    }
    
    const swContent = fs.readFileSync(swPath, 'utf8');
    
    // Check for essential SW features
    const requiredFeatures = [
        { name: 'precache', pattern: /precache/i },
        { name: 'runtime caching', pattern: /runtimeCaching|RuntimeCaching/i },
        { name: 'skip waiting', pattern: /skipWaiting/i }
    ];
    
    let passedFeatures = 0;
    requiredFeatures.forEach(feature => {
        if (feature.pattern.test(swContent)) {
            console.log(`✅ ${feature.name} implemented`);
            passedFeatures++;
        } else {
            console.log(`⚠️  ${feature.name} not detected`);
        }
    });
    
    return passedFeatures >= 2;
}

// Test 3: Bundle Size Analysis
function testBundleSize() {
    console.log('\n📦 Testing Bundle Size...');
    
    const distPath = path.join(__dirname, 'dist/pwa');
    if (!fs.existsSync(distPath)) {
        console.log('❌ Build directory not found');
        return false;
    }
    
    function getDirectorySize(dirPath) {
        let totalSize = 0;
        const files = fs.readdirSync(dirPath);
        
        files.forEach(file => {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isDirectory()) {
                totalSize += getDirectorySize(filePath);
            } else {
                totalSize += stats.size;
            }
        });
        
        return totalSize;
    }
    
    const totalSize = getDirectorySize(distPath);
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    
    console.log(`📊 Total bundle size: ${sizeMB} MB`);
    
    if (totalSize < 2 * 1024 * 1024) { // Less than 2MB
        console.log('✅ Excellent bundle size (< 2MB)');
        return true;
    } else if (totalSize < 5 * 1024 * 1024) { // Less than 5MB
        console.log('⚠️  Good bundle size (< 5MB)');
        return true;
    } else {
        console.log('❌ Bundle size too large (> 5MB)');
        return false;
    }
}

// Test 4: Mobile Responsive Assets
function testMobileAssets() {
    console.log('\n📱 Testing Mobile Assets...');
    
    const iconsPath = path.join(__dirname, 'dist/pwa/icons');
    if (!fs.existsSync(iconsPath)) {
        console.log('❌ Icons directory not found');
        return false;
    }
    
    const requiredIcons = [
        'icon-192x192.png',
        'icon-512x512.png',
        'favicon-96x96.png'
    ];
    
    let foundIcons = 0;
    requiredIcons.forEach(icon => {
        const iconPath = path.join(iconsPath, icon);
        if (fs.existsSync(iconPath)) {
            console.log(`✅ ${icon} found`);
            foundIcons++;
        } else {
            console.log(`❌ ${icon} missing`);
        }
    });
    
    return foundIcons >= 2;
}

// Test 5: Performance Recommendations
function testPerformance() {
    console.log('\n⚡ Performance Analysis...');
    
    const indexPath = path.join(__dirname, 'dist/pwa/index.html');
    if (!fs.existsSync(indexPath)) {
        console.log('❌ index.html not found');
        return false;
    }
    
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    const performanceChecks = [
        { name: 'Preload critical resources', pattern: /<link[^>]*rel=["']preload["']/i },
        { name: 'Minified HTML', test: () => indexContent.length < 5000 },
        { name: 'Meta viewport', pattern: /<meta[^>]*name=["']viewport["']/i }
    ];
    
    let passedChecks = 0;
    performanceChecks.forEach(check => {
        const passed = check.pattern ? check.pattern.test(indexContent) : check.test();
        if (passed) {
            console.log(`✅ ${check.name}`);
            passedChecks++;
        } else {
            console.log(`⚠️  ${check.name} optimization available`);
        }
    });
    
    return passedChecks >= 2;
}

// Run all tests
async function runMobileTests() {
    const tests = [
        { name: 'PWA Manifest', test: testManifest },
        { name: 'Service Worker', test: testServiceWorker },
        { name: 'Bundle Size', test: testBundleSize },
        { name: 'Mobile Assets', test: testMobileAssets },
        { name: 'Performance', test: testPerformance }
    ];
    
    let passedTests = 0;
    
    for (const test of tests) {
        const result = test.test();
        if (result) passedTests++;
    }
    
    console.log('\n🏆 Mobile Testing Summary');
    console.log('========================');
    console.log(`✅ Passed: ${passedTests}/${tests.length} tests`);
    
    if (passedTests === tests.length) {
        console.log('🎉 EXCELLENT! Ready for mobile deployment');
    } else if (passedTests >= tests.length * 0.8) {
        console.log('👍 GOOD! Minor optimizations recommended');
    } else {
        console.log('⚠️  NEEDS WORK! Several issues need addressing');
    }
    
    console.log('\n📱 Next Steps:');
    console.log('1. Test on actual mobile devices');
    console.log('2. Run Lighthouse audit');
    console.log('3. Test PWA installation');
    console.log('4. Verify offline functionality');
    
    return passedTests / tests.length;
}

// Execute if run directly
if (require.main === module) {
    runMobileTests().catch(console.error);
}

module.exports = { runMobileTests }; 
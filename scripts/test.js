#!/usr/bin/env node

/**
 * Test runner script for Haid backend
 */

const { spawn } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function runTests() {
  try {
    log('🧪 Starting Haid Backend Tests', 'cyan');
    log('================================', 'cyan');

    // Check if we're in the right directory
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    try {
      require(packageJsonPath);
    } catch (error) {
      log('❌ Error: package.json not found. Please run this script from the project root.', 'red');
      process.exit(1);
    }

    // Set test environment
    process.env.NODE_ENV = 'test';

    log('\n📋 Running Unit Tests...', 'yellow');
    try {
      await runCommand('npm', ['run', 'test:unit']);
      log('✅ Unit tests passed!', 'green');
    } catch (error) {
      log('❌ Unit tests failed!', 'red');
      throw error;
    }

    log('\n🔗 Running Integration Tests...', 'yellow');
    try {
      await runCommand('npm', ['run', 'test:integration']);
      log('✅ Integration tests passed!', 'green');
    } catch (error) {
      log('❌ Integration tests failed!', 'red');
      throw error;
    }

    log('\n📊 Generating Coverage Report...', 'yellow');
    try {
      await runCommand('npm', ['run', 'test:coverage']);
      log('✅ Coverage report generated!', 'green');
    } catch (error) {
      log('❌ Coverage report generation failed!', 'red');
      throw error;
    }

    log('\n🎉 All tests completed successfully!', 'green');
    log('================================', 'green');
    log('📁 Coverage report: ./coverage/index.html', 'blue');
    log('📚 API Documentation: http://localhost:3000/api-docs', 'blue');

  } catch (error) {
    log('\n💥 Test run failed!', 'red');
    log('================================', 'red');
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log('Haid Backend Test Runner', 'bright');
  log('========================', 'bright');
  log('');
  log('Usage: node scripts/test.js [options]', 'bright');
  log('');
  log('Options:');
  log('  --help, -h     Show this help message');
  log('  --unit         Run only unit tests');
  log('  --integration  Run only integration tests');
  log('  --coverage     Run tests with coverage');
  log('');
  log('Examples:');
  log('  node scripts/test.js                # Run all tests');
  log('  node scripts/test.js --unit         # Run only unit tests');
  log('  node scripts/test.js --coverage     # Run with coverage');
  process.exit(0);
}

if (args.includes('--unit')) {
  log('🧪 Running Unit Tests Only...', 'cyan');
  runCommand('npm', ['run', 'test:unit'])
    .then(() => log('✅ Unit tests passed!', 'green'))
    .catch((error) => {
      log('❌ Unit tests failed!', 'red');
      process.exit(1);
    });
} else if (args.includes('--integration')) {
  log('🔗 Running Integration Tests Only...', 'cyan');
  runCommand('npm', ['run', 'test:integration'])
    .then(() => log('✅ Integration tests passed!', 'green'))
    .catch((error) => {
      log('❌ Integration tests failed!', 'red');
      process.exit(1);
    });
} else if (args.includes('--coverage')) {
  log('📊 Running Tests with Coverage...', 'cyan');
  runCommand('npm', ['run', 'test:coverage'])
    .then(() => log('✅ Tests with coverage completed!', 'green'))
    .catch((error) => {
      log('❌ Tests with coverage failed!', 'red');
      process.exit(1);
    });
} else {
  // Run all tests
  runTests();
}
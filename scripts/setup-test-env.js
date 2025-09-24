#!/usr/bin/env node

/**
 * Test environment setup script for Haid backend
 */

const { spawn } = require('child_process');
const fs = require('fs');
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

async function checkPrerequisites() {
  log('🔍 Checking prerequisites...', 'cyan');
  
  // Check Node.js version
  try {
    const { execSync } = require('child_process');
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    log(`✅ Node.js version: ${nodeVersion}`, 'green');
    
    const version = parseInt(nodeVersion.substring(1).split('.')[0]);
    if (version < 16) {
      log('❌ Node.js version 16 or higher is required', 'red');
      process.exit(1);
    }
  } catch (error) {
    log('❌ Node.js not found. Please install Node.js 16 or higher.', 'red');
    process.exit(1);
  }

  // Check npm
  try {
    const { execSync } = require('child_process');
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log(`✅ npm version: ${npmVersion}`, 'green');
  } catch (error) {
    log('❌ npm not found. Please install npm.', 'red');
    process.exit(1);
  }

  // Check PostgreSQL
  try {
    const { execSync } = require('child_process');
    execSync('psql --version', { encoding: 'utf8' });
    log('✅ PostgreSQL found', 'green');
  } catch (error) {
    log('⚠️  PostgreSQL not found. Please install PostgreSQL for database tests.', 'yellow');
  }
}

async function installDependencies() {
  log('\n📦 Installing dependencies...', 'cyan');
  
  try {
    await runCommand('npm', ['install']);
    log('✅ Dependencies installed successfully', 'green');
  } catch (error) {
    log('❌ Failed to install dependencies', 'red');
    throw error;
  }
}

async function setupEnvironmentFiles() {
  log('\n⚙️  Setting up environment files...', 'cyan');
  
  // Create .env file if it doesn't exist
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    const envExamplePath = path.join(process.cwd(), '.env.example');
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      log('✅ Created .env file from .env.example', 'green');
    } else {
      // Create basic .env file
      const envContent = `# Server Configuration
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=haid_db
DB_USER=postgres
DB_PASSWORD=password

# Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=test-operator-id
HEDERA_OPERATOR_KEY=test-operator-key
HEDERA_GUARDIAN_TOPIC_ID=0.0.123456

# JWT Configuration
JWT_SECRET=test-jwt-secret-change-in-production
JWT_EXPIRES_IN=24h

# Logging Configuration
LOG_LEVEL=info

# Security Configuration
CORS_ORIGIN=*
`;
      fs.writeFileSync(envPath, envContent);
      log('✅ Created .env file with default values', 'green');
    }
  } else {
    log('✅ .env file already exists', 'green');
  }

  // Create test environment file
  const testEnvPath = path.join(process.cwd(), '.env.test');
  if (!fs.existsSync(testEnvPath)) {
    const testEnvContent = `# Test Environment Configuration
NODE_ENV=test
PORT=3001
API_PREFIX=/api/v1

# Test Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=haid_test_db
DB_USER=postgres
DB_PASSWORD=password

# Test Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=test-operator-id
HEDERA_OPERATOR_KEY=test-operator-key
HEDERA_GUARDIAN_TOPIC_ID=0.0.123456

# Test JWT Configuration
JWT_SECRET=test-jwt-secret
JWT_EXPIRES_IN=1h

# Test Logging Configuration
LOG_LEVEL=error

# Test Security Configuration
CORS_ORIGIN=*
`;
    fs.writeFileSync(testEnvPath, testEnvContent);
    log('✅ Created .env.test file', 'green');
  } else {
    log('✅ .env.test file already exists', 'green');
  }
}

async function createDirectories() {
  log('\n📁 Creating necessary directories...', 'cyan');
  
  const directories = [
    'logs',
    'coverage',
    'tests/fixtures',
    'tests/mocks'
  ];

  directories.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log(`✅ Created directory: ${dir}`, 'green');
    } else {
      log(`✅ Directory already exists: ${dir}`, 'green');
    }
  });
}

async function runTests() {
  log('\n🧪 Running tests to verify setup...', 'cyan');
  
  try {
    await runCommand('npm', ['test']);
    log('✅ All tests passed!', 'green');
  } catch (error) {
    log('⚠️  Some tests failed. This might be expected if database is not set up.', 'yellow');
    log('   You can run tests later with: npm test', 'yellow');
  }
}

async function showNextSteps() {
  log('\n🎉 Setup completed successfully!', 'green');
  log('================================', 'green');
  log('');
  log('Next steps:', 'bright');
  log('1. Set up PostgreSQL database:', 'blue');
  log('   createdb haid_db', 'blue');
  log('   createdb haid_test_db', 'blue');
  log('');
  log('2. Update .env file with your database credentials', 'blue');
  log('');
  log('3. Start the development server:', 'blue');
  log('   npm run dev', 'blue');
  log('');
  log('4. View API documentation:', 'blue');
  log('   http://localhost:3000/api-docs', 'blue');
  log('');
  log('5. Run tests:', 'blue');
  log('   npm test', 'blue');
  log('   npm run test:coverage', 'blue');
  log('');
  log('6. Run custom test script:', 'blue');
  log('   node scripts/test.js', 'blue');
  log('');
  log('📚 Documentation:', 'bright');
  log('   - API Documentation: ./API_DOCUMENTATION.md', 'blue');
  log('   - Backend README: ./BACKEND_README.md', 'blue');
  log('   - Interactive Docs: http://localhost:3000/api-docs', 'blue');
}

async function main() {
  try {
    log('🚀 Haid Backend Test Environment Setup', 'bright');
    log('=====================================', 'bright');
    
    await checkPrerequisites();
    await installDependencies();
    await setupEnvironmentFiles();
    await createDirectories();
    await runTests();
    await showNextSteps();
    
  } catch (error) {
    log('\n💥 Setup failed!', 'red');
    log('================', 'red');
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log('Haid Backend Test Environment Setup', 'bright');
  log('===================================', 'bright');
  log('');
  log('Usage: node scripts/setup-test-env.js [options]', 'bright');
  log('');
  log('This script will:');
  log('  - Check prerequisites (Node.js, npm, PostgreSQL)');
  log('  - Install dependencies');
  log('  - Create environment files');
  log('  - Create necessary directories');
  log('  - Run tests to verify setup');
  log('');
  log('Options:');
  log('  --help, -h     Show this help message');
  log('  --skip-tests   Skip running tests');
  log('');
  process.exit(0);
}

if (args.includes('--skip-tests')) {
  // Override the runTests function to skip tests
  runTests = async () => {
    log('\n⏭️  Skipping tests as requested...', 'yellow');
  };
}

main();
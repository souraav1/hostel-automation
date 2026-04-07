// scripts/prepare-deployment.js
const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing for deployment...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'server.js',
  '.env.example',
  'client/package.json'
];

console.log('📋 Checking required files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
  }
});

// Check if .env exists
if (fs.existsSync('.env')) {
  console.log('✅ .env file exists');
} else {
  console.log('⚠️  .env file not found - create one based on .env.example');
}

// Check if client build directory exists
if (fs.existsSync('client/dist')) {
  console.log('✅ Client build directory exists');
} else {
  console.log('⚠️  Client not built yet - run "cd client && npm run build"');
}

console.log('\n📝 Deployment Checklist:');
console.log('1. [ ] Create MongoDB Atlas account and cluster');
console.log('2. [ ] Update .env with production MongoDB URI');
console.log('3. [ ] Generate strong JWT_SECRET');
console.log('4. [ ] Push code to GitHub');
console.log('5. [ ] Deploy backend to Railway/Render');
console.log('6. [ ] Update frontend API URL with backend URL');
console.log('7. [ ] Deploy frontend to Vercel/Netlify');
console.log('8. [ ] Update backend CLIENT_URL with frontend URL');
console.log('9. [ ] Test all functionality');
console.log('10. [ ] Seed database with sample data');

console.log('\n🔗 Useful Links:');
console.log('- MongoDB Atlas: https://www.mongodb.com/atlas');
console.log('- Railway: https://railway.app');
console.log('- Render: https://render.com');
console.log('- Vercel: https://vercel.com');
console.log('- Netlify: https://netlify.com');

console.log('\n📖 Read DEPLOYMENT.md for detailed instructions!');
console.log('🎉 Good luck with your deployment!');
const fs = require('fs');
const path = require('path');

const specPath = path.join(__dirname, '..', 'docs', 'swagger.json');
if (!fs.existsSync(specPath)) {
  console.error('swagger.json not found. Run npm run gen:swagger first.');
  process.exit(1);
}

const spec = JSON.parse(fs.readFileSync(specPath));
const paths = Object.keys(spec.paths || {});

const routeMap = {
  'authRoutes.js': '/api/auth',
  'userRoutes.js': '/api/users',
  'projectRoutes.js': '/api/projects',
  'taskRoutes.js': '/api/projects', // tasks under projects
  'commentRoutes.js': '/api/tasks',
  'attachmentRoutes.js': '/api/projects',
  'activityRoutes.js': '/api/activity',
  'notificationRoutes.js': '/api/notifications',
  'teamRoutes.js': '/api/teams',
};

const results = {};
for (const [file, base] of Object.entries(routeMap)) {
  const found = paths.filter(p => p.startsWith(base));
  results[file] = found.length;
}

console.log('Swagger coverage by route file:');
for (const [file, count] of Object.entries(results)) {
  console.log(`${file}: ${count} path(s)`);
}

// List paths not matched to any base
const unmatched = paths.filter(p => !Object.values(routeMap).some(base => p.startsWith(base)));
if (unmatched.length) {
  console.log('\nPaths not matched to known route bases:');
  unmatched.forEach(p => console.log(p));
} else {
  console.log('\nAll paths matched to route bases');
}

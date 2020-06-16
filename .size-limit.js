module.exports = [
  {
    name: 'Total Size (next)',
    path: 'dist/neotracker-client-web-next/*.js.gz',
    webpack: false,
    limit: '616 KB',
  },
  {
    name: 'Vendor Size (next)',
    path: 'dist/neotracker-client-web-next/vendors~index*.js.gz',
    webpack: false,
    limit: '600 KB',
  },
  {
    name: 'Total Size (current)',
    path: 'dist/neotracker-client-web/*.js.gz',
    webpack: false,
    limit: '10013 KB',
  },
];

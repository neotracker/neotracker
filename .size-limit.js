module.exports = [
  {
    name: 'Total Size (next)',
    path: 'dist/neotracker-client-web-next/*.js.gz',
    webpack: false,
    limit: '312 KB',
  },
  {
    name: 'Vendor Size (next)',
    path: 'dist/neotracker-client-web-next/vendors~index*.js.gz',
    webpack: false,
    limit: '301 KB',
  },
  {
    name: 'Total Size (current)',
    path: 'dist/neotracker-client-web/*.js.gz',
    webpack: false,
    limit: '565 KB',
  },
];

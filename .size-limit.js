module.exports = [
  {
    name: 'Total Size (next)',
    path: 'dist/neotracker-client-web-next/*.js.gz',
    webpack: false,
    limit: '320 KB',
  },
  {
    name: 'Vendor Size (next)',
    path: 'dist/neotracker-client-web-next/vendors~index*.js.gz',
    webpack: false,
    limit: '310 KB',
  },
  {
    name: 'Total Size (current)',
    path: 'dist/neotracker-client-web/*.js.gz',
    webpack: false,
    limit: '565 KB',
  },
];

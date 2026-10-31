import http from 'http';

const options = {
  host: '127.0.0.1',
  port: process.env.PORT || 5050,
  path: '/api/system/health',
  timeout: 4000
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    console.error(`Backend Health Check Failed: HTTP ${res.statusCode}`);
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.error(`Backend Health Check Error: ${err.message}`);
  process.exit(1);
});

request.end();

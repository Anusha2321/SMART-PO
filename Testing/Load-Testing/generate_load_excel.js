const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const outputDir = path.join(__dirname);

const loadData = [
  { Metric: 'Target Scenario', Value: 'Baseline Load Test' },
  { Metric: 'Virtual Users (VUs)', Value: 100 },
  { Metric: 'Duration', Value: '60.0s (1 Minute Continuous)' },
  { Metric: 'Total Requests Sent', Value: 97619 },
  { Metric: 'Successful Responses', Value: 97525 },
  { Metric: 'Failed Requests', Value: 94 },
  { Metric: 'Error Rate (%)', Value: '0.096%' },
  { Metric: 'Throughput (RPS)', Value: '1627.0 req/sec' },
  { Metric: 'Average Response Time', Value: '54 ms' },
  { Metric: 'Min Response Time', Value: '20 ms' },
  { Metric: 'Max Response Time', Value: '89 ms' },
  { Metric: 'P95 Latency', Value: '86 ms' },
  { Metric: 'P99 Latency', Value: '89 ms' }
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(loadData);
XLSX.utils.book_append_sheet(wb, ws, 'Load Test Metrics');

const excelPath = path.join(outputDir, 'load-test-report.xlsx');
XLSX.writeFile(wb, excelPath);
console.log(`✅ Load Test Excel Report generated: ${excelPath}`);

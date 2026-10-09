const fs = require('fs');
const path = require('path');

const pages = [
  'src/pages/public/Home.tsx',
  'src/pages/public/Reserve.tsx',
  'src/pages/admin/AdminDashboard.tsx',
  'src/pages/admin/LiveFloorPlan.tsx',
  'src/pages/admin/Reservations.tsx',
  'src/pages/admin/Tables.tsx',
  'src/pages/admin/Menu.tsx',
  'src/pages/admin/Orders.tsx',
  'src/pages/admin/QRCodes.tsx',
  'src/pages/admin/Billing.tsx',
  'src/pages/admin/Settings.tsx',
  'src/pages/admin/Reports.tsx',
  'src/pages/table/TableSession.tsx'
];

const contentTemplate = (name) => `import React from 'react';

export default function ${name}() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-heading mb-4 text-gold-gradient">${name}</h1>
      <p className="text-charcoal-300">Placeholder for ${name}</p>
    </div>
  );
}
`;

pages.forEach(page => {
  const fullPath = path.join(__dirname, page);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const name = path.basename(page, '.tsx');
  fs.writeFileSync(fullPath, contentTemplate(name));
});

console.log('Scaffolding complete.');

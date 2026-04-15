const fs = require('fs');
const path = require('path');

const dir = 'd:/test/healthcare/src';

const replacements = [
  { from: /@\/components\/Navbar/g, to: '@/components/layout/Navbar' },
  { from: /@\/components\/SessionProvider/g, to: '@/components/providers/SessionProvider' },
  { from: /@\/components\/SocketContext/g, to: '@/components/providers/SocketContext' },
  { from: /@\/components\/ToastProvider/g, to: '@/components/providers/ToastProvider' },
  { from: /@\/components\/VideoCall/g, to: '@/components/ui/VideoCall' },
  { from: /@\/components\/DoctorList/g, to: '@/components/features/doctors/DoctorList' },
  { from: /@\/components\/ListDoctors/g, to: '@/components/features/doctors/ListDoctors' },
  { from: /@\/components\/PastReportsOverview/g, to: '@/components/features/reports/PastReportsOverview' },
  { from: /@\/components\/patient/g, to: '@/components/features/patient/Patient' },
  { from: /@\/components\/appointment\/list_of_doctors/g, to: '@/components/features/appointment/list_of_doctors' },
  { from: /@\/lib\/ConnectDB/g, to: '@/lib/db' },
  { from: /\.\.\/\.\.\/lib\/ConnectDB/g, to: '@/lib/db' },
  { from: /\.\.\/lib\/ConnectDB/g, to: '@/lib/db' }
];

function walk(directory) {
  let results = [];
  const list = fs.readdirSync(directory);
  list.forEach(file => {
    file = path.join(directory, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(dir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  replacements.forEach(r => {
    newContent = newContent.replace(r.from, r.to);
  });
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log(`Updated ${file}`);
  }
});

const http = require('http');

console.log('\n=============================================================');
console.log('       MONGODB LIVE DATABASE INSPECTOR (CampusPulse)');
console.log('=============================================================\n');

http.get('http://localhost:5000/api/admin/db-inspect', (res) => {
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    try {
      const data = JSON.parse(rawData);
      if (!data.success) {
        console.error('Failed to query database:', data.message);
        return;
      }

      console.log(`Database Status: ${data.status} [${data.database}]`);
      console.log(`Summary Counts : Users (${data.counts.users}) | Events (${data.counts.events}) | Registrations/Tickets (${data.counts.registrations})\n`);

      console.log('-------------------------------------------------------------');
      console.log('1. [COLLECTION: USERS] (Registered Students & Coordinators)');
      console.log('-------------------------------------------------------------');
      console.table(data.collections.users.map(u => ({
        Name: u.name,
        Email: u.email,
        Role: u.role,
        Department: u.department,
        RollNo: u.rollNumber || 'N/A'
      })));

      console.log('\n-------------------------------------------------------------');
      console.log('2. [COLLECTION: REGISTRATIONS] (Event Passes & QR Codes)');
      console.log('-------------------------------------------------------------');
      if (data.collections.registrations.length === 0) {
        console.log('No ticket registrations yet.');
      } else {
        console.table(data.collections.registrations.map(r => ({
          TicketCode: r.ticketCode,
          StudentName: r.user?.name || 'Unknown',
          RollNo: r.user?.rollNumber || 'N/A',
          Event: r.event?.title?.slice(0, 25) + '...',
          GateStatus: r.attendanceStatus
        })));
      }

      console.log('\n-------------------------------------------------------------');
      console.log('3. [COLLECTION: EVENTS] (Active Campus Events)');
      console.log('-------------------------------------------------------------');
      console.table(data.collections.events.map(e => ({
        Title: e.title.slice(0, 28) + '...',
        Category: e.category,
        Capacity: e.capacity,
        Registered: e.registeredCount,
        Turnout: e.checkedInCount
      })));

      console.log('\nTip: To view raw JSON in browser, visit: http://localhost:5000/api/admin/db-inspect\n');
    } catch (e) {
      console.error('Error parsing response:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('\nBackend server is not running on port 5000.');
  console.log('Please start the server first using: node server.js\n');
});

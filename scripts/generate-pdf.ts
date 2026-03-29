// Generate application documentation PDF
// Run: npx tsx scripts/generate-pdf.ts

import * as fs from 'fs'
import * as path from 'path'

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HPC Pest Lifecare - Application Documentation</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    color: #1a2332;
    line-height: 1.6;
    background: #fff;
  }

  @page { margin: 0; size: A4; }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 20mm 25mm;
    margin: 0 auto;
    page-break-after: always;
    position: relative;
  }

  .page:last-child { page-break-after: auto; }

  /* Cover Page */
  .cover {
    background: linear-gradient(135deg, #1a2332 0%, #2d3a4a 40%, #42A5F5 100%);
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 40mm 30mm;
  }

  .cover-logo {
    width: 120px;
    height: 120px;
    background: white;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  }

  .cover-logo-text {
    font-size: 36px;
    font-weight: 800;
    background: linear-gradient(135deg, #7CB342, #42A5F5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .cover h1 {
    font-size: 42px;
    font-weight: 800;
    margin-bottom: 8px;
    letter-spacing: -1px;
  }

  .cover h2 {
    font-size: 18px;
    font-weight: 400;
    opacity: 0.85;
    margin-bottom: 40px;
  }

  .cover-divider {
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #7CB342, #42A5F5);
    border-radius: 2px;
    margin: 0 auto 40px;
  }

  .cover-subtitle {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .cover-desc {
    font-size: 14px;
    opacity: 0.8;
    max-width: 400px;
    margin: 0 auto 50px;
  }

  .cover-links {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .cover-link {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 12px;
    padding: 16px 24px;
    text-align: center;
    min-width: 200px;
  }

  .cover-link-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    opacity: 0.7;
    margin-bottom: 6px;
  }

  .cover-link-url {
    font-size: 14px;
    font-weight: 600;
    color: #7CB342;
  }

  .cover-footer {
    position: absolute;
    bottom: 25mm;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 12px;
    opacity: 0.5;
  }

  /* Content Pages */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 2px solid #e8edf2;
    margin-bottom: 25px;
  }

  .header-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-brand-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #7CB342, #42A5F5);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 800;
    font-size: 14px;
  }

  .header-brand-name {
    font-size: 14px;
    font-weight: 700;
    color: #1a2332;
  }

  .header-page {
    font-size: 11px;
    color: #6b7b8d;
  }

  h2 {
    font-size: 26px;
    font-weight: 800;
    color: #1a2332;
    margin-bottom: 6px;
    letter-spacing: -0.5px;
  }

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1a2332;
    margin: 22px 0 10px;
  }

  h4 {
    font-size: 14px;
    font-weight: 600;
    color: #42A5F5;
    margin: 16px 0 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section-desc {
    font-size: 13px;
    color: #6b7b8d;
    margin-bottom: 20px;
  }

  p, li {
    font-size: 13px;
    color: #3d4f63;
  }

  ul { padding-left: 20px; margin: 8px 0; }
  li { margin-bottom: 4px; }

  .badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .badge-blue { background: #e3f2fd; color: #1565c0; }
  .badge-green { background: #e8f5e9; color: #2e7d32; }
  .badge-orange { background: #fff3e0; color: #e65100; }
  .badge-purple { background: #f3e5f5; color: #7b1fa2; }

  /* Feature Grid */
  .feature-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin: 16px 0;
  }

  .feature-card {
    border: 1px solid #e8edf2;
    border-radius: 10px;
    padding: 14px;
    background: #fafbfc;
  }

  .feature-card-title {
    font-size: 13px;
    font-weight: 700;
    color: #1a2332;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .feature-card-desc {
    font-size: 11px;
    color: #6b7b8d;
    line-height: 1.5;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }

  .dot-blue { background: #42A5F5; }
  .dot-green { background: #7CB342; }
  .dot-orange { background: #FF9800; }
  .dot-red { background: #f44336; }
  .dot-purple { background: #9C27B0; }

  /* Flow diagram */
  .flow {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin: 16px 0;
  }

  .flow-step {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .flow-line {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 32px;
    flex-shrink: 0;
  }

  .flow-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  }

  .flow-connector {
    width: 2px;
    height: 30px;
    background: #e0e0e0;
  }

  .flow-content {
    padding: 4px 0 20px;
    flex: 1;
  }

  .flow-content h5 {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 3px;
  }

  .flow-content p {
    font-size: 12px;
    color: #6b7b8d;
  }

  /* Table */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 12px;
  }

  th {
    background: #f5f7fa;
    padding: 10px 12px;
    text-align: left;
    font-weight: 600;
    color: #1a2332;
    border-bottom: 2px solid #e0e0e0;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  td {
    padding: 9px 12px;
    border-bottom: 1px solid #f0f0f0;
    color: #3d4f63;
  }

  tr:hover td { background: #fafbfc; }

  .url-box {
    background: #f5f7fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 14px 18px;
    margin: 10px 0;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #42A5F5;
    font-weight: 600;
  }

  .credentials-box {
    background: linear-gradient(135deg, #fff8e1, #fff3e0);
    border: 1px solid #ffe0b2;
    border-radius: 10px;
    padding: 16px 20px;
    margin: 12px 0;
  }

  .credentials-box h5 {
    font-size: 12px;
    font-weight: 700;
    color: #e65100;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }

  .credential-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
    font-size: 13px;
  }

  .credential-label {
    font-weight: 600;
    color: #5d4037;
    min-width: 100px;
  }

  .credential-value {
    font-family: 'Courier New', monospace;
    background: white;
    padding: 4px 12px;
    border-radius: 6px;
    border: 1px solid #ffe0b2;
    color: #e65100;
    font-weight: 600;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin: 16px 0;
  }

  .stat-card {
    text-align: center;
    padding: 16px 10px;
    border-radius: 10px;
    border: 1px solid #e8edf2;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 800;
    color: #1a2332;
  }

  .stat-label {
    font-size: 10px;
    color: #6b7b8d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 2px;
  }

  .footer-bar {
    position: absolute;
    bottom: 15mm;
    left: 25mm;
    right: 25mm;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #aab;
    border-top: 1px solid #eee;
    padding-top: 8px;
  }
</style>
</head>
<body>

<!-- ===================== COVER PAGE ===================== -->
<div class="page cover">
  <div class="cover-logo">
    <span class="cover-logo-text">HPC</span>
  </div>
  <h1>HPC Pest Lifecare Pvt Ltd</h1>
  <h2>Application Documentation & User Guide</h2>
  <div class="cover-divider"></div>
  <p class="cover-subtitle">Admin Panel + Public Website</p>
  <p class="cover-desc">
    Complete pest control business management system with customer management,
    job assignment, stock tracking, employee management, and public-facing website.
  </p>
  <div class="cover-links">
    <div class="cover-link">
      <div class="cover-link-label">Admin Panel</div>
      <div class="cover-link-url">hpc-ten.vercel.app</div>
    </div>
    <div class="cover-link">
      <div class="cover-link-label">Public Website</div>
      <div class="cover-link-url">hpc-ten.vercel.app/services</div>
    </div>
  </div>
  <div class="cover-footer">Confidential &bull; Version 2.0 &bull; March 2026</div>
</div>

<!-- ===================== PAGE 2: ACCESS & OVERVIEW ===================== -->
<div class="page">
  <div class="header">
    <div class="header-brand">
      <div class="header-brand-icon">H</div>
      <div class="header-brand-name">HPC Pest Lifecare</div>
    </div>
    <div class="header-page">Page 2</div>
  </div>

  <h2>Access Details & Overview</h2>
  <p class="section-desc">All links and credentials needed to access the application.</p>

  <h4>Application URLs</h4>
  <table>
    <tr><th>Application</th><th>URL</th><th>Access</th></tr>
    <tr><td><strong>Admin Panel (Login)</strong></td><td><code>https://hpc-ten.vercel.app</code></td><td>Username & Password</td></tr>
    <tr><td><strong>Public Website - Home</strong></td><td><code>https://hpc-ten.vercel.app/</code></td><td>Public</td></tr>
    <tr><td><strong>Services Page</strong></td><td><code>https://hpc-ten.vercel.app/services</code></td><td>Public</td></tr>
    <tr><td><strong>About Page</strong></td><td><code>https://hpc-ten.vercel.app/about</code></td><td>Public</td></tr>
    <tr><td><strong>Contact / Enquiry</strong></td><td><code>https://hpc-ten.vercel.app/contact</code></td><td>Public</td></tr>
    <tr><td><strong>Employee Login</strong></td><td><code>https://hpc-ten.vercel.app/employee/login</code></td><td>Employee ID & Password</td></tr>
  </table>

  <h4>Admin Login Credentials</h4>
  <div class="credentials-box">
    <h5>&#128274; Admin Login</h5>
    <div class="credential-row">
      <span class="credential-label">Username:</span>
      <span class="credential-value">admin</span>
    </div>
    <div class="credential-row">
      <span class="credential-label">Password:</span>
      <span class="credential-value">Abhay@1995</span>
    </div>
    <div class="credential-row">
      <span class="credential-label">Login URL:</span>
      <span class="credential-value">https://hpc-ten.vercel.app</span>
    </div>
  </div>

  <h4>System Overview</h4>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value" style="color:#42A5F5">631</div>
      <div class="stat-label">Customers</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color:#7CB342">742</div>
      <div class="stat-label">Contracts</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color:#FF9800">12</div>
      <div class="stat-label">Services</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color:#9C27B0">15+</div>
      <div class="stat-label">API Endpoints</div>
    </div>
  </div>

  <h4>Technology Stack</h4>
  <table>
    <tr><th>Layer</th><th>Technology</th></tr>
    <tr><td>Frontend</td><td>Next.js 16, React 19, Tailwind CSS, shadcn/ui</td></tr>
    <tr><td>Backend</td><td>Next.js API Routes (Server-side)</td></tr>
    <tr><td>Database</td><td>PostgreSQL (Neon Cloud)</td></tr>
    <tr><td>ORM</td><td>Prisma ORM</td></tr>
    <tr><td>Hosting</td><td>Vercel (Edge Network)</td></tr>
    <tr><td>Icons</td><td>Lucide React</td></tr>
  </table>

  <div class="footer-bar">
    <span>HPC Pest Lifecare Pvt Ltd</span>
    <span>Confidential</span>
  </div>
</div>

<!-- ===================== PAGE 3: APPLICATION FLOW ===================== -->
<div class="page">
  <div class="header">
    <div class="header-brand">
      <div class="header-brand-icon">H</div>
      <div class="header-brand-name">HPC Pest Lifecare</div>
    </div>
    <div class="header-page">Page 3</div>
  </div>

  <h2>Application Flow</h2>
  <p class="section-desc">End-to-end business workflow from lead generation to job completion.</p>

  <div class="flow">
    <div class="flow-step">
      <div class="flow-line">
        <div class="flow-circle" style="background:#42A5F5">1</div>
        <div class="flow-connector"></div>
      </div>
      <div class="flow-content">
        <h5>Lead Generation <span class="badge badge-blue">Website / Manual</span></h5>
        <p>Customer submits enquiry on public website (auto-creates lead with "NEW" badge) or admin manually adds lead from call/walk-in. Leads appear with pulsing notification in admin panel.</p>
      </div>
    </div>

    <div class="flow-step">
      <div class="flow-line">
        <div class="flow-circle" style="background:#7CB342">2</div>
        <div class="flow-connector"></div>
      </div>
      <div class="flow-content">
        <h5>Lead Follow-up & Conversion <span class="badge badge-green">Admin</span></h5>
        <p>Admin views enquiry details (badge disappears), marks as "Contacted", then converts lead to customer with contract details, service type, frequency, and scheduled service dates.</p>
      </div>
    </div>

    <div class="flow-step">
      <div class="flow-line">
        <div class="flow-circle" style="background:#FF9800">3</div>
        <div class="flow-connector"></div>
      </div>
      <div class="flow-content">
        <h5>Job Assignment <span class="badge badge-orange">Admin</span></h5>
        <p>Admin assigns job to an employee with: bill number, customer (auto-fills service type from contract), products/chemicals to carry, and scheduled date. Stock is deducted from warehouse and added to employee's stock-in-hand.</p>
      </div>
    </div>

    <div class="flow-step">
      <div class="flow-line">
        <div class="flow-circle" style="background:#9C27B0">4</div>
        <div class="flow-connector"></div>
      </div>
      <div class="flow-content">
        <h5>Job Execution <span class="badge badge-purple">Employee</span></h5>
        <p>Employee logs in to their dashboard, sees pending jobs with assigned products. After completing the service, they enter actual product usage quantities and mark job complete. Unused stock remains in their stock-in-hand.</p>
      </div>
    </div>

    <div class="flow-step">
      <div class="flow-line">
        <div class="flow-circle" style="background:#f44336">5</div>
        <div class="flow-connector"></div>
      </div>
      <div class="flow-content">
        <h5>Stock Return & Approval <span class="badge badge-orange">Employee + Admin</span></h5>
        <p>Employee requests to return unused chemicals/machines from their stock-in-hand. Admin reviews and approves the return request. Approved stock is added back to the warehouse inventory. Machines must always be returned.</p>
      </div>
    </div>

    <div class="flow-step">
      <div class="flow-line">
        <div class="flow-circle" style="background:#00897B">6</div>
      </div>
      <div class="flow-content">
        <h5>Reports & Monitoring <span class="badge badge-green">Admin</span></h5>
        <p>Admin monitors everything from dashboard: running orders, upcoming services (3 days), low stock alerts, employee stock-in-hand, lead conversion rates, and detailed reports with date filters.</p>
      </div>
    </div>
  </div>

  <div class="footer-bar">
    <span>HPC Pest Lifecare Pvt Ltd</span>
    <span>Confidential</span>
  </div>
</div>

<!-- ===================== PAGE 4: ADMIN FEATURES ===================== -->
<div class="page">
  <div class="header">
    <div class="header-brand">
      <div class="header-brand-icon">H</div>
      <div class="header-brand-name">HPC Pest Lifecare</div>
    </div>
    <div class="header-page">Page 4</div>
  </div>

  <h2>Admin Panel Features</h2>
  <p class="section-desc">Complete feature list for the admin dashboard.</p>

  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-card-title"><span class="dot dot-blue"></span> Dashboard</div>
      <div class="feature-card-desc">Stats cards, running orders, upcoming services (3 days), low stock alerts, employee stock overview, activity log. All data from database with parallel loading.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-title"><span class="dot dot-green"></span> Customer Management</div>
      <div class="feature-card-desc">Add/edit/delete customers with contracts. Service type dropdown, frequency, contract dates, GST calculation, service date scheduling. Import/export Excel.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-title"><span class="dot dot-orange"></span> Employee Management</div>
      <div class="feature-card-desc">Full employee profiles with Aadhaar, photo, emergency contact. Activate/deactivate employees. Each employee gets login credentials for their mobile dashboard.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-title"><span class="dot dot-red"></span> Stock Management</div>
      <div class="feature-card-desc">Products categorized as Machine or Chemical. Add, restock, track history. Stock transactions log every movement. Low stock alerts on dashboard.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-title"><span class="dot dot-purple"></span> Job Assignment</div>
      <div class="feature-card-desc">Searchable customer dropdown with auto-fill. Employee selection, product assignment with real-time stock validation. Bill number uniqueness check. Confirmation dialog.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-title"><span class="dot dot-blue"></span> Sales & Leads</div>
      <div class="feature-card-desc">Website enquiries with NEW badge (pulsing notification). Lead detail dialog with call/contacted/convert actions. Status filter, source filter, search. Conversion flow to customer.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-title"><span class="dot dot-green"></span> Stock Approvals</div>
      <div class="feature-card-desc">Review employee stock return requests. Approve to add chemicals/machines back to warehouse. Reject with reason. Full audit trail of all stock movements.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-title"><span class="dot dot-orange"></span> Reports</div>
      <div class="feature-card-desc">Date-range filtered reports: completed services, employee performance, product usage, lead conversion rates. Export capabilities for analysis.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-title"><span class="dot dot-purple"></span> Website Services (CMS)</div>
      <div class="feature-card-desc">Add/edit/delete services shown on public website. Toggle visibility, set features, descriptions, icons. Changes reflect immediately on the website.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-title"><span class="dot dot-red"></span> Testimonials (CMS)</div>
      <div class="feature-card-desc">Manage customer reviews shown on website. Add name, location, rating (1-5 stars), review text, service used. Toggle visibility without deleting.</div>
    </div>
  </div>

  <div class="footer-bar">
    <span>HPC Pest Lifecare Pvt Ltd</span>
    <span>Confidential</span>
  </div>
</div>

<!-- ===================== PAGE 5: WEBSITE & EMPLOYEE FEATURES ===================== -->
<div class="page">
  <div class="header">
    <div class="header-brand">
      <div class="header-brand-icon">H</div>
      <div class="header-brand-name">HPC Pest Lifecare</div>
    </div>
    <div class="header-page">Page 5</div>
  </div>

  <h2>Public Website Features</h2>
  <p class="section-desc">Customer-facing website at hpc-ten.vercel.app</p>

  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-card-title"><span class="dot dot-blue"></span> Homepage</div>
      <div class="feature-card-desc">Hero section with animated stats (700+ customers, 15+ services), services grid, "Why Choose Us" section, testimonials, and call-to-action with enquiry form.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-title"><span class="dot dot-green"></span> Services Pages</div>
      <div class="feature-card-desc">12 detailed service pages with features, descriptions, related services. Each has "Get Quote" and "Book Service" CTAs linking to the enquiry form.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-title"><span class="dot dot-orange"></span> Contact & Enquiry</div>
      <div class="feature-card-desc">Contact info cards, enquiry form with service dropdown. Submissions go directly to admin's Sales & Leads with "NEW" badge notification.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-title"><span class="dot dot-purple"></span> About Page</div>
      <div class="feature-card-desc">Company story, mission & vision, stats, values section, and trust indicators. Professional layout building credibility.</div>
    </div>
  </div>

  <h3>Services Offered (12 Total)</h3>
  <table>
    <tr><th>#</th><th>Service Name</th><th>Type</th></tr>
    <tr><td>1</td><td>Termite Management Solutions</td><td>Pre & Post Construction</td></tr>
    <tr><td>2</td><td>Household Pest Management</td><td>Cockroach, Ant, Spider</td></tr>
    <tr><td>3</td><td>Bed Bugs Management Solutions</td><td>Complete Elimination</td></tr>
    <tr><td>4</td><td>Rodent Management Solutions</td><td>Rat & Mouse Control</td></tr>
    <tr><td>5</td><td>Mosquito Management Solutions</td><td>Fogging & Spray</td></tr>
    <tr><td>6</td><td>Cockroach Management Solutions</td><td>Gel Baiting & Spray</td></tr>
    <tr><td>7</td><td>Wood Borer Management</td><td>Furniture Protection</td></tr>
    <tr><td>8</td><td>Snake Management Solutions</td><td>Repellent Treatment</td></tr>
    <tr><td>9</td><td>Bee Safe Service</td><td>Safe Removal</td></tr>
    <tr><td>10</td><td>Weed Management Solutions</td><td>Garden Treatment</td></tr>
    <tr><td>11</td><td>Fly Management Solutions</td><td>UV Traps & Spray</td></tr>
    <tr><td>12</td><td>Microbial Disinfection Service</td><td>Sanitization</td></tr>
  </table>

  <h3>Employee Mobile Dashboard</h3>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-card-title"><span class="dot dot-blue"></span> Job Management</div>
      <div class="feature-card-desc">View pending/completed jobs. See assigned products for each job. Mark job complete with actual product usage entry.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-title"><span class="dot dot-green"></span> Stock & Returns</div>
      <div class="feature-card-desc">View stock-in-hand from database. Request stock returns to admin. Select products and quantities to return.</div>
    </div>
  </div>

  <div class="footer-bar">
    <span>HPC Pest Lifecare Pvt Ltd</span>
    <span>Confidential</span>
  </div>
</div>

<!-- ===================== PAGE 6: CONTACT & API ===================== -->
<div class="page">
  <div class="header">
    <div class="header-brand">
      <div class="header-brand-icon">H</div>
      <div class="header-brand-name">HPC Pest Lifecare</div>
    </div>
    <div class="header-page">Page 6</div>
  </div>

  <h2>API Endpoints & Contact</h2>
  <p class="section-desc">Technical reference and business contact information.</p>

  <h4>API Endpoints (35 Total)</h4>
  <table>
    <tr><th>Category</th><th>Endpoints</th><th>Methods</th></tr>
    <tr><td>Customers</td><td>/api/customers, /api/customers/[id], /api/customers/[id]/jobs</td><td>GET, POST, PUT, DELETE</td></tr>
    <tr><td>Employees</td><td>/api/employees, /api/employees/[id], /api/employees/stock, /api/employees/login</td><td>GET, POST, PUT, DELETE</td></tr>
    <tr><td>Products</td><td>/api/products, /api/products/[id]</td><td>GET, POST, PUT, DELETE</td></tr>
    <tr><td>Jobs</td><td>/api/jobs, /api/jobs/[id], /api/jobs/[id]/complete, /api/jobs/pending, /api/jobs/upcoming</td><td>GET, POST</td></tr>
    <tr><td>Leads</td><td>/api/leads, /api/leads/[id], /api/leads/[id]/convert, /api/leads/[id]/view</td><td>GET, POST, PUT, DELETE</td></tr>
    <tr><td>Stock</td><td>/api/stock/transactions, /api/stock/return-request, /api/stock/return-request/[id]</td><td>GET, POST, PUT</td></tr>
    <tr><td>Website</td><td>/api/enquiry, /api/services, /api/services/[id], /api/testimonials, /api/testimonials/[id]</td><td>GET, POST, PUT, DELETE</td></tr>
    <tr><td>Reports</td><td>/api/reports</td><td>GET (date-range filtered)</td></tr>
  </table>

  <h4>Performance Optimizations</h4>
  <ul>
    <li><strong>Count-only endpoints</strong> &#8212; Dashboard stats use ?countOnly=true (returns count instead of all records)</li>
    <li><strong>Parallel API calls</strong> &#8212; Dashboard loads 7 APIs simultaneously via Promise.all</li>
    <li><strong>Batch database operations</strong> &#8212; Job creation uses single product lookup + parallel writes</li>
    <li><strong>Filtered queries</strong> &#8212; Employee dashboard fetches only their jobs, not all</li>
    <li><strong>Optimized includes</strong> &#8212; Reports use select to limit returned fields</li>
    <li><strong>Batch seeding</strong> &#8212; Excel import uses createMany (631 customers in 37 seconds)</li>
  </ul>

  <h4>Business Contact</h4>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-card-title">&#128222; Phone Numbers</div>
      <div class="feature-card-desc">
        +91-7277234534<br>
        +91-9523591904
      </div>
    </div>
    <div class="feature-card">
      <div class="feature-card-title">&#128231; Email Addresses</div>
      <div class="feature-card-desc">
        hpcplranchi@gmail.com<br>
        info@hpcpltd.in
      </div>
    </div>
    <div class="feature-card">
      <div class="feature-card-title">&#127968; Location</div>
      <div class="feature-card-desc">
        Ranchi, Jharkhand, India
      </div>
    </div>
    <div class="feature-card">
      <div class="feature-card-title">&#127760; Website</div>
      <div class="feature-card-desc">
        hpcpltd.in<br>
        hpc-ten.vercel.app
      </div>
    </div>
  </div>

  <br>
  <div style="text-align:center; padding: 20px; background: linear-gradient(135deg, #f5f7fa, #e8edf2); border-radius: 12px; margin-top: 20px;">
    <p style="font-size: 16px; font-weight: 700; color: #1a2332; margin-bottom: 4px;">HPC Pest Lifecare Pvt Ltd</p>
    <p style="font-size: 12px; color: #6b7b8d;">Protecting Your Home & Business from Pests Since 2019</p>
    <p style="font-size: 11px; color: #aab; margin-top: 10px;">Document generated on March 29, 2026 &bull; All rights reserved</p>
  </div>

  <div class="footer-bar">
    <span>HPC Pest Lifecare Pvt Ltd</span>
    <span>Confidential</span>
  </div>
</div>

</body>
</html>`

const outputPath = path.join(process.cwd(), 'HPC_Application_Documentation.html')
fs.writeFileSync(outputPath, html, 'utf-8')
console.log(`Documentation generated: ${outputPath}`)
console.log('Open this file in your browser and press Ctrl+P to save as PDF.')
console.log('Use "Save as PDF" printer with no margins for best results.')

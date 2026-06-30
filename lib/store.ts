'use client'

import { Idea, Bug, BacklogItem, Decision, Requirement, NewsArticle, TeamMember, DemoMeeting, FeedbackItem } from './types'

// In-memory store with localStorage persistence
// In production, replace with a proper database (SQLite, PostgreSQL, etc.)

function loadFromStorage<T>(key: string, defaults: T[]): T[] {
  if (typeof window === 'undefined') return defaults
  try {
    const stored = localStorage.getItem(`producthub_${key}`)
    return stored ? JSON.parse(stored) : defaults
  } catch {
    return defaults
  }
}

function saveToStorage<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(`producthub_${key}`, JSON.stringify(data))
}

// ---- Default seed data ----

export const DEFAULT_IDEAS: Idea[] = [
  {
    id: '1', title: 'Automated onboarding checklist for new team members',
    description: 'Create a self-service onboarding flow with auto-assigned tasks.',
    type: 'idea', status: 'approved', priority: 'high',
    submitter: 'Linh Nguyen', team: 'Ops', date: '2026-06-01', tags: ['onboarding', 'automation'], votes: 12,
  },
  {
    id: '2', title: 'Add Slack notification for release deployments',
    description: 'Automatically post to #product-updates when a release is deployed.',
    type: 'request', status: 'in-review', priority: 'medium',
    submitter: 'Minh Tran', team: 'DevOps', date: '2026-06-10', tags: ['slack', 'notifications'], votes: 8,
  },
  {
    id: '3', title: 'Dashboard for tracking SLA compliance',
    description: 'Need a real-time dashboard to monitor SLA metrics across clients.',
    type: 'idea', status: 'submitted', priority: 'high',
    submitter: 'Huong Le', team: 'Ops', date: '2026-06-15', tags: ['dashboard', 'SLA'], votes: 15,
  },
  {
    id: '4', title: 'Export reports to Excel',
    description: 'Allow exporting any data table to .xlsx for offline reporting.',
    type: 'request', status: 'implemented', priority: 'medium',
    submitter: 'An Pham', team: 'Product', date: '2026-05-20', tags: ['export', 'excel'], votes: 6,
  },
]

export const DEFAULT_BUGS: Bug[] = [
  {
    id: 'BUG-001', title: 'Login fails on Safari 17 with SSO',
    description: 'Users on Safari 17 cannot complete SSO login — redirect loop.',
    severity: 'critical', status: 'in-progress',
    reporter: 'Linh Nguyen', assignee: 'Dev Team',
    date: '2026-06-20', updatedAt: '2026-06-25',
    steps: '1. Open Safari 17\n2. Click "Login with Google"\n3. Observe redirect loop',
    expected: 'User is logged in successfully',
    actual: 'Infinite redirect loop',
    environment: 'Safari 17, macOS 14', tags: ['auth', 'safari'],
  },
  {
    id: 'BUG-002', title: 'Notification badge count incorrect after read',
    description: 'Badge shows old count after marking notifications as read.',
    severity: 'medium', status: 'open',
    reporter: 'Minh Tran', assignee: '',
    date: '2026-06-22', updatedAt: '2026-06-22',
    steps: '1. Open notifications panel\n2. Mark all as read\n3. Check badge',
    expected: 'Badge disappears or shows 0',
    actual: 'Badge still shows previous count',
    environment: 'Chrome, Web', tags: ['notifications', 'ui'],
  },
  {
    id: 'BUG-003', title: 'CSV export missing last row',
    description: 'Exporting data tables to CSV truncates the last row.',
    severity: 'high', status: 'resolved',
    reporter: 'An Pham', assignee: 'Dev Team',
    date: '2026-06-10', updatedAt: '2026-06-18',
    steps: '1. Go to any data table\n2. Export as CSV\n3. Open in Excel',
    expected: 'All rows exported',
    actual: 'Last row is missing',
    environment: 'All browsers', tags: ['export', 'csv'],
  },
]

export const DEFAULT_BACKLOG: BacklogItem[] = [
  {
    id: 'EPIC-001', title: 'User Management v2',
    description: 'Revamp the user management system with RBAC.',
    type: 'epic', status: 'in-progress', priority: 'high',
    sprint: 'Sprint 23', estimate: 40, assignee: 'Product Team', epic: '',
    date: '2026-06-01', tags: ['rbac', 'users'],
  },
  {
    id: 'STORY-001', title: 'As an admin, I can assign roles to users',
    description: 'Role assignment UI with bulk actions.',
    type: 'story', status: 'todo', priority: 'high',
    sprint: 'Sprint 23', estimate: 8, assignee: 'Dev A', epic: 'EPIC-001',
    date: '2026-06-05', tags: ['rbac'],
  },
  {
    id: 'STORY-002', title: 'As a user, I can see my permission level',
    description: 'Show current role and permissions in profile.',
    type: 'story', status: 'backlog', priority: 'medium',
    sprint: 'Sprint 24', estimate: 3, assignee: 'Dev B', epic: 'EPIC-001',
    date: '2026-06-05', tags: ['rbac', 'profile'],
  },
  {
    id: 'TASK-001', title: 'Set up RBAC database schema',
    description: 'Create roles, permissions, user_roles tables.',
    type: 'task', status: 'done', priority: 'high',
    sprint: 'Sprint 22', estimate: 5, assignee: 'Dev A', epic: 'EPIC-001',
    date: '2026-05-28', tags: ['database'],
  },
]

export const DEFAULT_DECISIONS: Decision[] = [
  {
    id: 'ADR-001', title: 'Use Next.js App Router for ProductHUB',
    context: 'We needed to choose a React framework for the internal hub. Options were CRA, Next.js Pages, Next.js App Router.',
    decision: 'Use Next.js 14 App Router for file-based routing, server components, and easy API routes.',
    consequences: 'Team needs to learn React Server Components. Deployment is straightforward with Vercel or Node.',
    status: 'accepted', author: 'Product Team', date: '2026-06-01', tags: ['architecture', 'frontend'],
  },
  {
    id: 'ADR-002', title: 'Store data in localStorage for MVP, migrate to DB later',
    context: 'No backend infrastructure in place for MVP. Need quick iteration.',
    decision: 'Use localStorage for persistence in MVP. Migrate to SQLite/PostgreSQL in v2.',
    consequences: 'Data is not shared across browsers/users until backend is added. Acceptable for internal demo.',
    status: 'accepted', author: 'Product Team', date: '2026-06-05', tags: ['data', 'architecture'],
  },
]

export const DEFAULT_REQUIREMENTS: Requirement[] = [
  {
    id: 'REQ-001', title: 'User can submit an idea with title, description, and priority',
    epic: 'Ideas Management',
    description: '## Overview\nUsers need a simple form to submit product ideas.\n\n## User Story\nAs a team member, I want to submit my product ideas so that the product team can review and prioritize them.\n\n## Details\n- Title (required, max 150 chars)\n- Description (required, max 2000 chars)\n- Priority (Low/Medium/High)\n- Tags (optional)',
    acceptanceCriteria: '- [ ] Form validates required fields before submission\n- [ ] Submitter name is auto-filled from login\n- [ ] Idea appears in the Ideas table immediately\n- [ ] Submitter receives email confirmation',
    status: 'approved', priority: 'high',
    author: 'BA Team', assignee: 'Dev Team',
    date: '2026-06-01', updatedAt: '2026-06-10', tags: ['ideas', 'form'],
  },
  {
    id: 'REQ-002', title: 'Admin can change status of any idea',
    epic: 'Ideas Management',
    description: '## Overview\nAdmins need to be able to update the status of submitted ideas.\n\n## User Story\nAs a product admin, I want to update idea status so that submitters know the outcome of their submission.',
    acceptanceCriteria: '- [ ] Status can be changed to: Submitted, In Review, Approved, Rejected, Implemented\n- [ ] Status change sends notification to submitter\n- [ ] Status history is logged',
    status: 'review', priority: 'medium',
    author: 'BA Team', assignee: 'Dev Team',
    date: '2026-06-05', updatedAt: '2026-06-12', tags: ['ideas', 'admin'],
  },
]

export const DEFAULT_NEWS: NewsArticle[] = [
  {
    id: '1', title: 'Product Update — June 2026',
    content: `# Product Update — June 2026

## What's New

### 🚀 Feature: Bulk Export
Users can now export any data table to CSV or Markdown with a single click.

### 🐛 Bug Fixes
- Fixed Safari SSO redirect loop (BUG-001)
- Resolved notification badge count issue

### ⚡ Performance
- 40% faster page load on the dashboard
- Optimized image loading for product snapshots

## Upcoming in July
- Jira integration (create tickets directly from ProductHUB)
- Google Drive file picker
- Dark mode 🌙
`,
    category: 'updates', date: '2026-06-28', author: 'Product Team', pinned: true, tags: ['release'],
  },
  {
    id: '2', title: 'Product Snapshot — June 2026',
    content: `# Product Snapshot — June 2026

## Key Metrics
| Metric | Value | MoM Change |
|--------|-------|-----------|
| MAU | 12,450 | +8.2% |
| DAU | 3,200 | +5.1% |
| ARPU | $24.5 | +2.3% |
| Churn Rate | 2.1% | -0.3% |

## Top Initiatives
1. **User Management v2** — 60% complete, on track for Sprint 24
2. **Mobile App** — Design phase, launch Q3
3. **API v3** — Beta testing with 5 customers

## Product Health
- P0 Bugs: 1 (in-progress)
- P1 Bugs: 3 (2 resolved, 1 open)
- Sprint velocity: 42 points (↑ from 38)
`,
    category: 'snapshot', date: '2026-06-28', author: 'Product Ops', pinned: true, tags: ['metrics', 'monthly'],
  },
]

export const DEFAULT_TEAM: TeamMember[] = [
  // BĐH
  { id: '1', name: 'Trần Xuân Nam', role: 'GĐ Thương mại điện tử Long Châu', team: 'BĐH', email: 'NamTX8@fpt.com', phone: '0902992622', office: 'VP_678', dob: '26/09/1991', joinDate: '', manager: '', insideLC: '51337', gender: 'Nam', avatar: 'TN', responsibilities: [] },
  { id: '2', name: 'Đặng Đình Khoa', role: 'GĐ kinh doanh TMĐT Toàn quốc', team: 'BĐH', email: 'KhoaDD4@fpt.com', phone: '0775993336', office: 'VP_678', dob: '19/11/1988', joinDate: '', manager: '', insideLC: '01035', gender: 'Nam', avatar: 'ĐK', responsibilities: [] },
  { id: '3', name: 'Nguyễn Quang Nghĩa', role: 'PGĐ Phụ trách Sản phẩm Ecom', team: 'BĐH', email: 'Nghianq3@fpt.com', phone: '0984530435', office: 'VP_678', dob: '30/12/1988', joinDate: '', manager: '', insideLC: '54582', gender: 'Nam', avatar: 'NQ', responsibilities: [] },
  { id: '4', name: 'Phạm Hoài Thiên', role: 'PGĐ Nội dung - Media - Marketing Ecom', team: 'BĐH', email: 'Thienph2@fpt.com', phone: '0902986901', office: 'VP_678', dob: '01/09/1989', joinDate: '', manager: '', insideLC: '01067', gender: 'Nam', avatar: 'PT', responsibilities: [] },
  { id: '5', name: 'Trịnh Văn Hưng', role: 'PGĐ Phụ trách Trải nghiệm khách hàng Ecom', team: 'BĐH', email: 'HungTV45@fpt.com', phone: '0349363456', office: 'VP_678', dob: '30/10/1991', joinDate: '', manager: '', insideLC: '67666', gender: 'Nam', avatar: 'TH', responsibilities: [] },
  // VẬN HÀNH
  { id: '6', name: 'Nguyễn Thị Ngọc Trâm', role: 'Trưởng phòng Vận Hành Ecom', team: 'VẬN HÀNH', email: 'Tramntn21@fpt.com', phone: '0979867143', office: 'VP_678', dob: '09/05/1995', joinDate: '06/05/2024', manager: 'Trần Xuân Nam', insideLC: '55095', gender: 'Nữ', avatar: 'NT', responsibilities: [] },
  { id: '7', name: 'Nguyễn Ngọc Bảo Trân', role: 'Trưởng nhóm Vận hành Ecom', team: 'VẬN HÀNH', email: 'trannnb@fpt.com', phone: '0972044206', office: 'VP_678', dob: '07/05/2001', joinDate: '01/07/2024', manager: 'Trần Xuân Nam', insideLC: '56250', gender: 'Nữ', avatar: 'BT', responsibilities: [] },
  { id: '8', name: 'Lê Hữu Danh', role: 'Trưởng nhóm Vận hành Ecom', team: 'VẬN HÀNH', email: 'danglh4@fpt.com', phone: '0396054758', office: 'VP_678', dob: '02/12/1998', joinDate: '09/12/2020', manager: 'Trần Xuân Nam', insideLC: '52387', gender: 'Nam', avatar: 'LD', responsibilities: [] },
  { id: '9', name: 'Phùng Thị Phương Anh', role: 'NV Vận Hành Ecom', team: 'VẬN HÀNH', email: 'anhptp8@fpt.com', phone: '0989634736', office: 'VP_216 Thái Hà', dob: '01/02/1999', joinDate: '16/08/2024', manager: '', insideLC: '57792', gender: 'Nữ', avatar: 'PA', responsibilities: [] },
  { id: '10', name: 'Trần Linh Chi', role: 'NV Vận Hành Ecom', team: 'VẬN HÀNH', email: 'ChiTL12@fpt.com', phone: '0966472284', office: 'VP_678', dob: '28/08/2004', joinDate: '04/05/2026', manager: 'Trần Xuân Nam', insideLC: '70485', gender: 'Nữ', avatar: 'TC', responsibilities: [] },
  { id: '11', name: 'Phạm Thị Ngọc Hương', role: 'NV Vận Hành Ecom', team: 'VẬN HÀNH', email: 'HuongPTN5@fpt.com', phone: '0867336769', office: 'VP_678', dob: '09/09/1997', joinDate: '21/03/2022', manager: 'Trần Xuân Nam', insideLC: '40076', gender: 'Nữ', avatar: 'PH', responsibilities: [] },
  { id: '12', name: 'Phùng Thị Hương Quỳnh', role: 'NV Vận Hành Ecom', team: 'VẬN HÀNH', email: 'QuynhPTH3@fpt.com', phone: '0965494515', office: 'VP_216 Thái Hà', dob: '23/07/1995', joinDate: '16/05/2025', manager: '', insideLC: '63401', gender: 'Nữ', avatar: 'PQ', responsibilities: [] },
  { id: '13', name: 'Cao Lê Ngọc Bích', role: 'NV Vận Hành Ecom', team: 'VẬN HÀNH', email: 'BichCLN@fpt.com', phone: '0779681240', office: 'VP_678', dob: '12/04/1998', joinDate: '16/07/2025', manager: 'Trần Xuân Nam', insideLC: '51493', gender: 'Nữ', avatar: 'CB', responsibilities: [] },
  { id: '14', name: 'Nguyễn Công Danh', role: 'NV Vận Hành Ecom', team: 'VẬN HÀNH', email: 'DanhNC12@fpt.com', phone: '0921500759', office: 'VP_678', dob: '18/11/1996', joinDate: '04/08/2025', manager: 'Trần Xuân Nam', insideLC: '65365', gender: 'Nam', avatar: 'ND', responsibilities: [] },
  { id: '18', name: 'Phan Thái Tâm', role: 'NV Vận Hành Ecom', team: 'VẬN HÀNH', email: 'TamPT48@fpt.com', phone: '0382809184', office: 'VP_678', dob: '28/06/2001', joinDate: '16/06/2026', manager: '', insideLC: '71524', gender: 'Nam', avatar: 'PT', responsibilities: [] },
  // WEB-APP ADMIN
  { id: '15', name: 'Phạm Trần Thiên Quốc', role: 'Trưởng nhóm quản trị sản phẩm', team: 'WEB-APP ADMIN', email: 'Quocptt2@fpt.com', phone: '0905397888', office: 'VP_678', dob: '23/04/1997', joinDate: '15/03/2024', manager: 'Nguyễn Quang Nghĩa', insideLC: '58310', gender: 'Nam', avatar: 'PQ', responsibilities: [] },
  { id: '16', name: 'Thái Gia Hân', role: 'Nhân viên quản trị sản phẩm', team: 'WEB-APP ADMIN', email: 'Hantg9@fpt.com', phone: '0899494702', office: 'VP_678', dob: '12/03/2000', joinDate: '02/12/2024', manager: 'Nguyễn Quang Nghĩa', insideLC: '60068', gender: 'Nữ', avatar: 'TH', responsibilities: [] },
  { id: '17', name: 'Nguyễn Ngọc Thiên Hương', role: 'Nhân viên quản trị sản phẩm', team: 'WEB-APP ADMIN', email: 'HuongNNT2@fpt.com', phone: '0933638510', office: 'VP_678', dob: '06/03/1999', joinDate: '05/05/2025', manager: 'Nguyễn Quang Nghĩa', insideLC: '62994', gender: 'Nữ', avatar: 'NH', responsibilities: [] },
  // MEDIA
  { id: '19', name: 'Nguyễn Phước Sang', role: 'Phó phòng Media', team: 'MEDIA', email: 'SangNP2@fpt.com', phone: '0375335448', office: 'VP_Bùi Văn Ba', dob: '06/12/1996', joinDate: '01/07/2024', manager: 'Phạm Hoài Thiên', insideLC: '56251', gender: 'Nam', avatar: 'NS', responsibilities: [] },
  { id: '20', name: 'Khúc Thiên Trang', role: 'Trưởng nhóm Media Ecom', team: 'MEDIA', email: 'trangkt2@fpt.com', phone: '0335516556', office: 'VP_678', dob: '19/03/2001', joinDate: '15/03/2024', manager: 'Phạm Hoài Thiên', insideLC: '52687', gender: 'Nữ', avatar: 'KT', responsibilities: [] },
  { id: '21', name: 'Văn Sĩ Khang', role: 'Trưởng nhóm Media Ecom', team: 'MEDIA', email: 'KhangVS@fpt.com', phone: '0824005668', office: 'VP_Bùi Văn Ba', dob: '01/10/1997', joinDate: '04/07/2024', manager: 'Phạm Hoài Thiên', insideLC: '56438', gender: 'Nam', avatar: 'VK', responsibilities: [] },
  { id: '22', name: 'Thái Doãn Anh Tuấn', role: 'Nhân viên sản xuất video và hình ảnh', team: 'MEDIA', email: 'tuantda3@fpt.com', phone: '0877758409', office: 'VP_Bùi Văn Ba', dob: '15/05/2002', joinDate: '16/07/2024', manager: 'Phạm Hoài Thiên', insideLC: '56763', gender: 'Nam', avatar: 'TT', responsibilities: [] },
  { id: '23', name: 'Lê Lý Minh Khôi', role: 'Nhân viên sản xuất video và hình ảnh', team: 'MEDIA', email: 'KhoiLLM2@fpt.com', phone: '0888833450', office: 'VP_Bùi Văn Ba', dob: '25/08/1997', joinDate: '17/02/2025', manager: 'Phạm Hoài Thiên', insideLC: '61209', gender: 'Nam', avatar: 'LK', responsibilities: [] },
  { id: '24', name: 'Trần Thị Tuyết Nhi', role: 'Nhân viên sáng tạo nội dung số', team: 'MEDIA', email: 'nhittt9@fpt.com', phone: '0796931076', office: 'VP_Bùi Văn Ba', dob: '14/08/2000', joinDate: '16/08/2024', manager: 'Phạm Hoài Thiên', insideLC: '47106', gender: 'Nữ', avatar: 'TN', responsibilities: [] },
  { id: '25', name: 'Lý Thị Phương Dung', role: 'Nhân viên sáng tạo nội dung số', team: 'MEDIA', email: 'dungltp5@fpt.com', phone: '0795409436', office: 'VP_Bùi Văn Ba', dob: '17/06/2002', joinDate: '01/08/2024', manager: 'Phạm Hoài Thiên', insideLC: '57185', gender: 'Nữ', avatar: 'LD', responsibilities: [] },
  { id: '26', name: 'Trần Công Sơn', role: 'Nhân viên sáng tạo nội dung số', team: 'MEDIA', email: 'sontc8@fpt.com', phone: '0837877789', office: 'VP_Bùi Văn Ba', dob: '08/01/2001', joinDate: '16/08/2024', manager: 'Phạm Hoài Thiên', insideLC: '57612', gender: 'Nam', avatar: 'TS', responsibilities: [] },
  { id: '27', name: 'Trần Lê Thúc', role: 'Nhân viên sáng tạo nội dung số', team: 'MEDIA', email: 'thuctl3@fpt.com', phone: '0914672340', office: 'VP_Bùi Văn Ba', dob: '19/05/2001', joinDate: '01/04/2025', manager: 'Phạm Hoài Thiên', insideLC: '62366', gender: 'Nam', avatar: 'TT', responsibilities: [] },
  { id: '28', name: 'Nguyễn Thuận Yên Phương', role: 'Nhân viên vận hành và phát triển đa nền tảng', team: 'MEDIA', email: 'PhuongNTY2@fpt.com', phone: '0948290702', office: 'VP_Bùi Văn Ba', dob: '29/07/2002', joinDate: '03/03/2025', manager: 'Phạm Hoài Thiên', insideLC: '61646', gender: 'Nữ', avatar: 'NP', responsibilities: [] },
  { id: '29', name: 'Thái Điền Thiên Kim', role: 'Nhân viên vận hành và phát triển đa nền tảng', team: 'MEDIA', email: 'KimTDT@fpt.com', phone: '0934717263', office: 'VP_Bùi Văn Ba', dob: '09/09/2003', joinDate: '12/05/2025', manager: 'Phạm Hoài Thiên', insideLC: '63234', gender: 'Nữ', avatar: 'TK', responsibilities: [] },
  { id: '30', name: 'Lương Thị Ngọc Hà', role: 'Nhân viên vận hành và phát triển đa nền tảng', team: 'MEDIA', email: 'HaLTN12@fpt.com', phone: '0932633158', office: 'VP_Bùi Văn Ba', dob: '27/08/2002', joinDate: '16/07/2025', manager: 'Phạm Hoài Thiên', insideLC: '64838', gender: 'Nữ', avatar: 'LH', responsibilities: [] },
  { id: '31', name: 'Đặng Hoàng Nhật', role: 'Nhân viên sản xuất video và hình ảnh', team: 'MEDIA', email: 'NhatDH8@fpt.com', phone: '0338054250', office: 'VP_Bùi Văn Ba', dob: '10/12/1999', joinDate: '02/06/2025', manager: 'Phạm Hoài Thiên', insideLC: '63757', gender: 'Nam', avatar: 'ĐN', responsibilities: [] },
  { id: '32', name: 'Nguyễn Văn Nhiều', role: 'Nhân viên sản xuất video và hình ảnh', team: 'MEDIA', email: 'NhieuNV3@fpt.com', phone: '0785499233', office: 'VP_Bùi Văn Ba', dob: '04/03/1997', joinDate: '16/09/2025', manager: 'Phạm Hoài Thiên', insideLC: '66252', gender: 'Nam', avatar: 'NN', responsibilities: [] },
  { id: '33', name: 'Nguyễn Chí Ninh', role: 'Nhân viên sản xuất video và hình ảnh', team: 'MEDIA', email: 'NinhNC@fpt.com', phone: '0707280302', office: 'VP_Bùi Văn Ba', dob: '28/03/2002', joinDate: '01/10/2025', manager: 'Phạm Hoài Thiên', insideLC: '66653', gender: 'Nam', avatar: 'NC', responsibilities: [] },
  { id: '34', name: 'Ôn Nhật Huy', role: 'Nhân viên sản xuất video và hình ảnh', team: 'MEDIA', email: 'HuyON@fpt.com', phone: '0949318728', office: 'VP_Bùi Văn Ba', dob: '08/04/2001', joinDate: '14/10/2025', manager: 'Phạm Hoài Thiên', insideLC: '67114', gender: 'Nam', avatar: 'OH', responsibilities: [] },
  { id: '35', name: 'Nguyễn Huỳnh Gia Minh', role: 'Nhân viên sản xuất video và hình ảnh', team: 'MEDIA', email: 'MinhNHG2@fpt.com', phone: '0902955534', office: 'VP_Bùi Văn Ba', dob: '22/06/2002', joinDate: '14/10/2025', manager: 'Phạm Hoài Thiên', insideLC: '67115', gender: 'Nam', avatar: 'NM', responsibilities: [] },
  { id: '36', name: 'Nguyễn Huỳnh Khánh Đăng', role: 'Nhân viên sản xuất video và hình ảnh', team: 'MEDIA', email: 'DangNHK3@fpt.com', phone: '0907827735', office: 'VP_Bùi Văn Ba', dob: '04/11/1999', joinDate: '01/04/2026', manager: '', insideLC: '69827', gender: 'Nam', avatar: 'NK', responsibilities: [] },
  { id: '37', name: 'Phạm Thị Hiểu Phương', role: 'Nhân viên sáng tạo nội dung số', team: 'MEDIA', email: 'PhuongPTH5@fpt.com', phone: '0862309113', office: 'VP_Bùi Văn Ba', dob: '02/01/2003', joinDate: '01/06/2026', manager: '', insideLC: '71171', gender: 'Nữ', avatar: 'PP', responsibilities: [] },
  // SEO
  { id: '38', name: 'Nguyễn Thị Tường Vy', role: 'Phó phòng Performance Marketing', team: 'SEO', email: 'Vyntt21@fpt.com', phone: '0774663480', office: 'VP_678', dob: '09/10/1997', joinDate: '01/01/2021', manager: 'Phạm Hoài Thiên', insideLC: '54454', gender: 'Nữ', avatar: 'NV', responsibilities: [] },
  { id: '39', name: 'Hoàng Ngọc Quỳnh Như', role: 'Trưởng nhóm Nội dung SEO', team: 'SEO', email: 'Nhuhnq@fpt.com', phone: '0932096150', office: 'VP_678', dob: '09/05/1999', joinDate: '01/03/2022', manager: 'Phạm Hoài Thiên', insideLC: '54452', gender: 'Nữ', avatar: 'HN', responsibilities: [] },
  { id: '40', name: 'Trần Nguyễn Thanh Hương', role: 'Chuyên viên tối ưu SEO', team: 'SEO', email: 'HuongTNT@fpt.com', phone: '0776939120', office: 'VP_678', dob: '11/11/1997', joinDate: '03/03/2025', manager: 'Phạm Hoài Thiên', insideLC: '61643', gender: 'Nữ', avatar: 'TH', responsibilities: [] },
  { id: '41', name: 'Lê Thị Út Thương', role: 'NV Nội dung SEO', team: 'SEO', email: 'Thuongltu@fpt.com', phone: '0703629731', office: 'VP_678', dob: '16/08/1999', joinDate: '03/04/2023', manager: 'Phạm Hoài Thiên', insideLC: '54450', gender: 'Nữ', avatar: 'LT', responsibilities: [] },
  { id: '42', name: 'Nguyễn Thị Như Quỳnh', role: 'NV Nội dung SEO', team: 'SEO', email: 'QuynhNTN68@fpt.com', phone: '0913638297', office: 'VP_678', dob: '20/12/1997', joinDate: '16/08/2023', manager: 'Phạm Hoài Thiên', insideLC: '54451', gender: 'Nữ', avatar: 'NQ', responsibilities: [] },
  { id: '43', name: 'Ung Nhật Tấn', role: 'Trưởng nhóm Nội dung SEO', team: 'SEO', email: 'tanun@fpt.com', phone: '0768131937', office: 'VP_678', dob: '13/03/2000', joinDate: '15/01/2024', manager: 'Phạm Hoài Thiên', insideLC: '52686', gender: 'Nam', avatar: 'UT', responsibilities: [] },
  { id: '45', name: 'Hà Hồng Hạnh', role: 'NV Nội dung SEO', team: 'SEO', email: 'HanhHH7@fpt.com', phone: '0934212052', office: 'VP_678', dob: '01/01/1997', joinDate: '04/05/2026', manager: '', insideLC: '70484', gender: 'Nữ', avatar: 'HH', responsibilities: [] },
  // P.MKT
  { id: '44', name: 'Nguyễn Văn Hoài Thanh', role: 'Chuyên viên Marketing Ecom', team: 'P.MKT', email: 'ThanhNVH2@fpt.com', phone: '0949692790', office: 'VP_678', dob: '19/08/1998', joinDate: '02/02/2026', manager: '', insideLC: '68666', gender: 'Nam', avatar: 'NT', responsibilities: [] },
  // CONTENT
  { id: '46', name: 'Nguyễn Thị Minh Mẫn', role: 'Phó phòng Nội dung eCom', team: 'CONTENT', email: 'Manntm3@fpt.com', phone: '0377301217', office: 'VP_678', dob: '29/03/1996', joinDate: '06/06/2019', manager: 'Phạm Hoài Thiên', insideLC: '01617', gender: 'Nữ', avatar: 'NM', responsibilities: [] },
  { id: '47', name: 'Đinh Thị Minh Hồng', role: 'Trưởng nhóm Nội dung eCom', team: 'CONTENT', email: 'Hongdtm3@fpt.com', phone: '0968204438', office: 'VP_678', dob: '31/08/1998', joinDate: '22/03/2021', manager: 'Phạm Hoài Thiên', insideLC: '54448', gender: 'Nữ', avatar: 'ĐH', responsibilities: [] },
  { id: '48', name: 'Lê Huỳnh Phương Anh', role: 'Trưởng nhóm Nội dung eCom', team: 'CONTENT', email: 'Anhlhp@fpt.com', phone: '0977672920', office: 'VP_678', dob: '13/03/1992', joinDate: '22/03/2021', manager: 'Phạm Hoài Thiên', insideLC: '54449', gender: 'Nữ', avatar: 'LA', responsibilities: [] },
  { id: '49', name: 'Đinh Ngọc Phương Uyên', role: 'Trưởng nhóm Nội dung eCom', team: 'CONTENT', email: 'Uyendnp3@fpt.com', phone: '0907902062', office: 'VP_678', dob: '22/05/1999', joinDate: '03/06/2024', manager: 'Phạm Hoài Thiên', insideLC: '55566', gender: 'Nữ', avatar: 'ĐU', responsibilities: [] },
  { id: '50', name: 'Lê Thị Nhân Tâm', role: 'NV Content', team: 'CONTENT', email: 'Tamltn2@fpt.com', phone: '0335858344', office: 'VP_678', dob: '17/07/1994', joinDate: '17/07/2019', manager: 'Phạm Hoài Thiên', insideLC: '01618', gender: 'Nữ', avatar: 'LT', responsibilities: [] },
  { id: '51', name: 'Trần Thị Thùy Trâm', role: 'NV Content', team: 'CONTENT', email: 'Tramttt7@fpt.com', phone: '0945907367', office: 'VP_678', dob: '02/04/1998', joinDate: '22/02/2021', manager: 'Phạm Hoài Thiên', insideLC: '54453', gender: 'Nữ', avatar: 'TT', responsibilities: [] },
  { id: '52', name: 'Nguyễn Ngọc Dịu Dịu', role: 'NV Content', team: 'CONTENT', email: 'Diunnd@fpt.com', phone: '0898525915', office: 'VP_678', dob: '02/05/2001', joinDate: '16/11/2022', manager: 'Phạm Hoài Thiên', insideLC: '54447', gender: 'Nữ', avatar: 'ND', responsibilities: [] },
  { id: '53', name: 'Phạm Thị Minh Thi', role: 'NV Content', team: 'CONTENT', email: 'Thiptm@fpt.com', phone: '0377984706', office: 'VP_678', dob: '12/09/1999', joinDate: '24/03/2022', manager: 'Phạm Hoài Thiên', insideLC: '54445', gender: 'Nữ', avatar: 'PT', responsibilities: [] },
  { id: '54', name: 'Lê Yên Trà My', role: 'NV Content', team: 'CONTENT', email: 'Mylyt@fpt.com', phone: '0339794069', office: 'VP_678', dob: '27/09/1999', joinDate: '24/03/2022', manager: 'Phạm Hoài Thiên', insideLC: '54446', gender: 'Nữ', avatar: 'LM', responsibilities: [] },
  { id: '55', name: 'Trần Thị Hồng Ngọc', role: 'Chuyên viên sáng tạo nội dung', team: 'CONTENT', email: 'NgocTTH3@fpt.com', phone: '0772916195', office: 'VP_678', dob: '18/06/2001', joinDate: '01/03/2024', manager: 'Phạm Hoài Thiên', insideLC: '53489', gender: 'Nữ', avatar: 'TN', responsibilities: [] },
  { id: '56', name: 'Nguyễn Mai Quỳnh Trâm', role: 'Chuyên viên sáng tạo nội dung', team: 'CONTENT', email: 'TramNMQ@fpt.com', phone: '0332919757', office: 'VP_678', dob: '01/08/2000', joinDate: '03/06/2024', manager: 'Phạm Hoài Thiên', insideLC: '55573', gender: 'Nữ', avatar: 'NT', responsibilities: [] },
  { id: '57', name: 'Đoàn Thế Khải', role: 'Chuyên viên sáng tạo nội dung', team: 'CONTENT', email: 'KhaiDT6@fpt.com', phone: '', office: 'VP_678', dob: '05/05/2003', joinDate: '', manager: 'Phạm Hoài Thiên', insideLC: '63230', gender: 'Nam', avatar: 'ĐK', responsibilities: [] },
  // PRODUCT
  { id: '58', name: 'Lê Nhân Hào', role: 'Phó phòng phát triển sản phẩm', team: 'PRODUCT', email: 'haoln6@fpt.com', phone: '0947457407', office: 'VP_678', dob: '04/09/1991', joinDate: '24/12/2024', manager: 'Nguyễn Quang Nghĩa', insideLC: '60466', gender: 'Nam', avatar: 'LH', responsibilities: [] },
  { id: '59', name: 'Nguyễn Như Ngọc', role: 'Nhân viên phát triển sản phẩm', team: 'PRODUCT', email: 'Ngocnn5@fpt.com', phone: '0375120568', office: 'VP_678', dob: '11/07/2000', joinDate: '01/08/2024', manager: 'Nguyễn Quang Nghĩa', insideLC: '57309', gender: 'Nữ', avatar: 'NN', responsibilities: [] },
  { id: '60', name: 'Phạm Thị Thanh Trúc', role: 'Nhân viên phát triển sản phẩm', team: 'PRODUCT', email: 'trucptt13@fpt.com', phone: '0904819670', office: 'VP_678', dob: '04/11/1998', joinDate: '03/03/2025', manager: 'Nguyễn Quang Nghĩa', insideLC: '61644', gender: 'Nữ', avatar: 'PT', responsibilities: [] },
  { id: '61', name: 'Đinh Nguyễn Mạnh Trí', role: 'Nhân viên phát triển sản phẩm', team: 'PRODUCT', email: 'tridnm2@fpt.com', phone: '0919700712', office: 'VP_678', dob: '01/04/1990', joinDate: '05/05/2025', manager: 'Nguyễn Quang Nghĩa', insideLC: '62995', gender: 'Nam', avatar: 'ĐT', responsibilities: [] },
  { id: '62', name: 'Võ Thị Thu Hằng', role: 'Nhân viên phát triển sản phẩm', team: 'PRODUCT', email: 'hangvtt32@fpt.com', phone: '0346513003', office: 'VP_678', dob: '16/08/2003', joinDate: '05/05/2025', manager: 'Nguyễn Quang Nghĩa', insideLC: '62993', gender: 'Nữ', avatar: 'VH', responsibilities: [] },
  // DESIGN
  { id: '63', name: 'Lương Hoàng Minh Nguyệt', role: 'Trưởng nhóm thiết kế UI/UX', team: 'DESIGN', email: 'nguyetlhm@fpt.com', phone: '0985742712', office: 'VP_678', dob: '15/10/1998', joinDate: '01/11/2024', manager: 'Nguyễn Quang Nghĩa', insideLC: '59373', gender: 'Nữ', avatar: 'LN', responsibilities: [] },
  { id: '64', name: 'Mai Ý Nhi', role: 'Nhân viên thiết kế Graphic - UI/UX', team: 'DESIGN', email: 'NhiMY@fpt.com', phone: '0338048731', office: 'VP_678', dob: '18/04/1999', joinDate: '16/07/2025', manager: 'Nguyễn Quang Nghĩa', insideLC: '64079', gender: 'Nữ', avatar: 'MN', responsibilities: [] },
  { id: '65', name: 'Phan Duy Trọng', role: 'Nhân viên thiết kế UI/UX', team: 'DESIGN', email: 'Trongpd3@fpt.com', phone: '0981192203', office: 'VP_678', dob: '14/08/2003', joinDate: '01/07/2024', manager: 'Nguyễn Quang Nghĩa', insideLC: '56278', gender: 'Nam', avatar: 'PT', responsibilities: [] },
  { id: '66', name: 'Hà Thúy An', role: 'Nhân viên thiết kế UI/UX', team: 'DESIGN', email: 'AnHT14@fpt.com', phone: '0977686785', office: 'VP_678', dob: '13/03/2000', joinDate: '01/10/2024', manager: 'Nguyễn Quang Nghĩa', insideLC: '58611', gender: 'Nữ', avatar: 'HA', responsibilities: [] },
  { id: '67', name: 'Lê Nguyễn Thanh Ngọc', role: 'Nhân viên thiết kế UI/UX', team: 'DESIGN', email: 'NgocLNT2@fpt.com', phone: '0938791201', office: 'VP_678', dob: '08/07/1995', joinDate: '16/10/2024', manager: 'Nguyễn Quang Nghĩa', insideLC: '58971', gender: 'Nam', avatar: 'LN', responsibilities: [] },
  // CX
  { id: '68', name: 'Lê Vũ Châu Giang', role: 'Trưởng nhóm trải nghiệm khách hàng', team: 'CX', email: 'gianglvc@fpt.com', phone: '0972260172', office: 'VP_678', dob: '02/12/2003', joinDate: '04/11/2024', manager: 'Trịnh Văn Hưng', insideLC: '59378', gender: 'Nữ', avatar: 'LG', responsibilities: [] },
  { id: '69', name: 'Lại Thị Minh Thư', role: 'Nhân viên trải nghiệm khách hàng', team: 'CX', email: 'thultm7@fpt.com', phone: '0765710234', office: 'VP_678', dob: '13/02/2003', joinDate: '02/06/2025', manager: 'Trịnh Văn Hưng', insideLC: '63753', gender: 'Nữ', avatar: 'LT', responsibilities: [] },
  { id: '70', name: 'Nguyễn Đăng Khoa', role: 'Nhân viên trải nghiệm khách hàng', team: 'CX', email: 'khoand106@fpt.com', phone: '0962844127', office: 'VP_678', dob: '25/09/2003', joinDate: '02/06/2025', manager: 'Trịnh Văn Hưng', insideLC: '63752', gender: 'Nam', avatar: 'NK', responsibilities: [] },
  { id: '71', name: 'Huỳnh Gia Thịnh', role: 'Nhân viên trải nghiệm khách hàng', team: 'CX', email: 'ThinhHG@fpt.com', phone: '0949774730', office: 'VP_678', dob: '04/01/2003', joinDate: '16/06/2026', manager: '', insideLC: '71525', gender: 'Nam', avatar: 'HT', responsibilities: [] },
  // GS
  { id: '72', name: 'Lâm Thành Nghĩa', role: 'NV giám sát chất lượng Sale Ecom', team: 'GS', email: 'NghiaLT32@fpt.com', phone: '0933386292', office: 'VP_678', dob: '23/12/1992', joinDate: '16/07/2024', manager: 'Trần Xuân Nam', insideLC: '56768', gender: 'Nam', avatar: 'LN', responsibilities: [] },
  { id: '73', name: 'Chiêu Thị Huỳnh Như', role: 'NV giám sát chất lượng Sale Ecom', team: 'GS', email: 'Nhucth2@fpt.com', phone: '0967663788', office: 'VP_Bùi Văn Ba', dob: '20/04/1995', joinDate: '10/04/2021', manager: 'Trần Xuân Nam', insideLC: '07783', gender: 'Nữ', avatar: 'CN', responsibilities: [] },
  { id: '74', name: 'Nguyễn Phương Dung', role: 'NV giám sát chất lượng Sale Ecom', team: 'GS', email: 'DungNP16@fpt.com', phone: '0829216353', office: 'VP_216 Thái Hà', dob: '19/01/1995', joinDate: '02/10/2023', manager: '', insideLC: '50155', gender: 'Nữ', avatar: 'ND', responsibilities: [] },
  { id: '75', name: 'Nguyễn Thị Huyền Diệu', role: 'NV giám sát chất lượng Sale Ecom', team: 'GS', email: 'DieuNTH13@fpt.com', phone: '0342049009', office: 'VP_Bùi Văn Ba', dob: '16/10/2000', joinDate: '29/05/2022', manager: 'Trần Xuân Nam', insideLC: '41932', gender: 'Nữ', avatar: 'NH', responsibilities: [] },
  { id: '76', name: 'Nguyễn Thị Hồng Nhung', role: 'NV giám sát chất lượng Sale Ecom', team: 'GS', email: 'NhungNTH89@fpt.com', phone: '0948620683', office: 'VP_216 Thái Hà', dob: '16/01/1994', joinDate: '01/04/2021', manager: '', insideLC: '47957', gender: 'Nữ', avatar: 'NN', responsibilities: [] },
  // Growth / CDP
  { id: '77', name: 'Lê Thanh Hải', role: 'Trưởng phòng CDP', team: 'Growth', email: 'hailt46@fpt.com', phone: '0929073939', office: 'VP_678', dob: '03/04/1987', joinDate: '02/06/2025', manager: 'Trần Xuân Nam', insideLC: '63748', gender: 'Nam', avatar: 'LH', responsibilities: [] },
  { id: '78', name: 'Nguyễn Khắc Ngọc Yến', role: 'Trưởng nhóm vận hành CDP', team: 'Growth', email: 'YenNKN@fpt.com', phone: '0931316802', office: 'VP_678', dob: '30/05/1995', joinDate: '01/12/2025', manager: 'Trần Xuân Nam', insideLC: '67939', gender: 'Nữ', avatar: 'NY', responsibilities: [] },
  { id: '79', name: 'Lê Hồ Mỹ Ngân', role: 'Thực tập sinh vận hành CDP', team: 'Growth', email: 'NganLHM2@fpt.com', phone: '0334465414', office: 'VP_678', dob: '22/10/2004', joinDate: '16/12/2025', manager: '', insideLC: '68383', gender: 'Nữ', avatar: 'LN', responsibilities: [] },
  { id: '80', name: 'Đặng Đoàn Bình', role: 'Thực tập sinh vận hành CDP', team: 'Growth', email: 'BinhDD7@fpt.com', phone: '0923789304', office: 'VP_678', dob: '06/09/2004', joinDate: '02/01/2025', manager: '', insideLC: '68154', gender: 'Nam', avatar: 'ĐB', responsibilities: [] },
  { id: '81', name: 'Lê Quang Thành Tài', role: 'Chuyên viên phân tích dữ liệu kinh doanh', team: 'Growth', email: 'TaiLQT2@fpt.com', phone: '0835200142', office: 'VP_678', dob: '', joinDate: '04/08/2025', manager: 'Trần Xuân Nam', insideLC: '65366', gender: 'Nam', avatar: 'LT', responsibilities: [] },
  { id: '82', name: 'Lê Thị Thu Nhi', role: 'NV Vận Hành Ecom', team: 'Growth', email: 'NhiLTT14@fpt.com', phone: '0332796322', office: 'VP_678', dob: '11/02/2001', joinDate: '16/06/2025', manager: 'Trần Xuân Nam', insideLC: '64081', gender: 'Nữ', avatar: 'LN', responsibilities: [] },
  { id: '83', name: 'Ngô Quang Anh', role: 'Trưởng nhóm phân tích dữ liệu kinh doanh', team: 'Growth', email: 'ANHNQ162@fpt.com', phone: '0397052043', office: 'VP_678', dob: '10/01/1998', joinDate: '08/06/2026', manager: '', insideLC: '71170', gender: 'Nam', avatar: 'NA', responsibilities: [] },
]

export const DEFAULT_DEMOS: DemoMeeting[] = [
  {
    id: '1', title: 'Sprint 23 Demo — User Management v2',
    date: '2026-07-04', time: '14:00',
    link: 'https://meet.google.com/abc-defg-hij',
    description: 'Demo of the new RBAC system and role assignment UI.',
    agenda: ['Intro (5 min)', 'RBAC Demo (15 min)', 'Q&A (10 min)', 'Feedback (5 min)'],
    recording: '',
  },
  {
    id: '2', title: 'Monthly Product Review — June',
    date: '2026-06-30', time: '10:00',
    link: 'https://meet.google.com/xyz-uvwx-rst',
    description: 'Monthly review of product metrics, OKRs, and roadmap updates.',
    agenda: ['Metrics Review (20 min)', 'OKR Check-in (15 min)', 'Roadmap Updates (15 min)', 'Open Q&A (10 min)'],
    recording: 'https://drive.google.com/...',
  },
]

export const DEFAULT_FEEDBACK: FeedbackItem[] = [
  {
    id: '1', title: 'The new dashboard is much cleaner',
    content: 'Really appreciate the redesign. Finding information is much faster now.',
    submitter: 'Operations Team', date: '2026-06-20',
    category: 'Positive', status: 'acknowledged',
  },
  {
    id: '2', title: 'Need better search across all sections',
    content: 'Global search would save a lot of time when looking for specific info across News, Requirements, etc.',
    submitter: 'BA Team', date: '2026-06-22',
    category: 'Feature Request', status: 'new',
  },
]

// ---- Store hooks ----

export function getIdeas(): Idea[] {
  return loadFromStorage('ideas', DEFAULT_IDEAS)
}

export function saveIdeas(ideas: Idea[]) {
  saveToStorage('ideas', ideas)
}

export function getBugs(): Bug[] {
  return loadFromStorage('bugs', DEFAULT_BUGS)
}

export function saveBugs(bugs: Bug[]) {
  saveToStorage('bugs', bugs)
}

export function getBacklog(): BacklogItem[] {
  return loadFromStorage('backlog', DEFAULT_BACKLOG)
}

export function saveBacklog(items: BacklogItem[]) {
  saveToStorage('backlog', items)
}

export function getDecisions(): Decision[] {
  return loadFromStorage('decisions', DEFAULT_DECISIONS)
}

export function saveDecisions(decisions: Decision[]) {
  saveToStorage('decisions', decisions)
}

export function getRequirements(): Requirement[] {
  return loadFromStorage('requirements', DEFAULT_REQUIREMENTS)
}

export function saveRequirements(reqs: Requirement[]) {
  saveToStorage('requirements', reqs)
}

export function getNews(): NewsArticle[] {
  return loadFromStorage('news', DEFAULT_NEWS)
}

export function saveNews(news: NewsArticle[]) {
  saveToStorage('news', news)
}

export function getTeam(): TeamMember[] {
  return loadFromStorage('team_v2', DEFAULT_TEAM)
}

export function saveTeam(team: TeamMember[]) {
  saveToStorage('team_v2', team)
}

export function getDemos(): DemoMeeting[] {
  return loadFromStorage('demos', DEFAULT_DEMOS)
}

export function getFeedback(): FeedbackItem[] {
  return loadFromStorage('feedback', DEFAULT_FEEDBACK)
}

export function saveFeedback(items: FeedbackItem[]) {
  saveToStorage('feedback', items)
}

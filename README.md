# SmartVote - School Online Voting System

A secure, transparent, and accessible online voting platform designed for educational institutions. Built with Next.js and Firebase.

## System Overview

SmartVote is a comprehensive voting system that supports:
- **Student Government Elections**
- **Department Elections**
- **Club Elections**
- **Grade-Level Elections**

## Features

### 1. Voter Management
- Import student lists via CSV/Excel
- Automatic voter eligibility checking (grade, section, year level)
- Block inactive or suspended accounts
- Voter status tracking (Not Voted / Voted)
- Voting reminders via notifications

### 2. Candidate Management
- Candidate self-registration with admin approval
- Profile picture upload
- Campaign platform submission
- Video introduction support
- Position assignment
- Candidate withdrawal option (before election starts)

### 3. Election Control
- Support for multiple concurrent elections
- Position-based voting (one vote per position)
- Automatic election close when time expires
- Emergency pause/resume functionality
- Election preview/test mode

### 4. Advanced Security
- Two-Factor Authentication (2FA) support
- Session timeout after inactivity
- Vote encryption before database storage
- Tamper-detection via hash verification
- Role-based access control

### 5. Transparency & Audit
- Real-time voter turnout percentage
- Detailed election audit logs
- Vote verification receipt (without revealing vote choice)
- Admin activity tracking
- Election integrity reports

### 6. Reporting & Analytics
- Winner per position
- Vote distribution charts
- Voter participation by grade level, section, department
- Export reports to Excel
- Historical election comparison

### 7. Accessibility
- Mobile-first responsive design
- Dark mode / light mode
- Multi-language support ready
- Screen reader compatibility
- Large-text accessibility mode

### 8. Notifications
- Voting start notification
- Voting end reminders
- Winner announcements
- System maintenance alerts
- In-app notifications

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full system access, user management, system settings |
| **Election Officer** | Create/manage elections, approve candidates, view reports |
| **Viewer** | Read-only access to election data and reports |
| **Voter** | Vote in eligible elections, view own voting history |
| **Candidate** | Register as candidate, manage campaign profile |

## Technology Stack

- **Frontend**: Next.js 16 (JavaScript), React 19, Tailwind CSS 4
- **Backend**: Firebase (Authentication, Firestore, Storage, Realtime Database)
- **Charts**: Chart.js with react-chartjs-2
- **State Management**: Zustand
- **Encryption**: CryptoJS (AES encryption for votes)
- **File Processing**: Papa Parse (CSV), XLSX (Excel)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Database Schema (Firestore Collections)

### users
```
{
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  studentId: string,
  gradeLevel: string,
  section: string,
  department: string,
  role: 'super_admin' | 'election_officer' | 'viewer' | 'voter',
  status: 'active' | 'blocked' | 'inactive',
  hasVoted: boolean,
  twoFactorEnabled: boolean,
  createdAt: timestamp,
  lastLogin: timestamp
}
```

### elections
```
{
  id: string,
  name: string,
  description: string,
  type: 'student_government' | 'department' | 'club' | 'grade_level',
  status: 'draft' | 'preview' | 'active' | 'paused' | 'completed' | 'cancelled',
  positions: string[],
  startDate: timestamp,
  endDate: timestamp,
  eligibilityCriteria: {
    gradeLevels: string[],
    departments: string[],
    sections: string[]
  },
  totalVoters: number,
  totalVotes: number,
  createdBy: string,
  createdAt: timestamp
}
```

### candidates
```
{
  id: string,
  userId: string,
  electionId: string,
  name: string,
  position: string,
  platform: string,
  photoUrl: string,
  videoUrl: string,
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn',
  voteCount: number,
  createdAt: timestamp
}
```

### votes
```
{
  id: string,
  voterId: string,
  electionId: string,
  encryptedSelections: string (AES encrypted),
  voteHash: string (SHA256),
  receipt: string (verification code),
  timestamp: timestamp,
  verified: boolean
}
```

### voters
```
{
  id: string,
  userId: string,
  electionId: string,
  status: 'not_voted' | 'voted' | 'blocked',
  votedAt: timestamp,
  importedAt: timestamp
}
```

### auditLogs
```
{
  id: string,
  userId: string,
  action: string,
  details: object,
  timestamp: timestamp,
  ipAddress: string,
  userAgent: string
}
```

### notifications
```
{
  id: string,
  userId: string,
  type: string,
  title: string,
  message: string,
  read: boolean,
  createdAt: timestamp
}
```

## Election Workflow

1. **Create Election** - Admin creates election with name, type, dates, and positions
2. **Import Voters** - Upload CSV/Excel with eligible voters
3. **Candidate Registration** - Students register as candidates
4. **Approve Candidates** - Admin reviews and approves/rejects candidates
5. **Preview Mode** - Test election before going live
6. **Start Election** - Election becomes active for voting
7. **Voting Period** - Eligible voters cast encrypted votes
8. **End Election** - Automatic or manual close
9. **Results** - Generate reports and announce winners

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smartvote
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password)
   - Create Firestore Database
   - Enable Storage
   - Update `lib/firebase.js` with your config

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Firebase Indexes

The app requires composite indexes for certain queries. You have two options:

**Option 1: Automatic (Recommended)**
When you first run the app and encounter an index error, click the link in the console error message to create the index automatically in Firebase Console.

**Option 2: Deploy indexes file**
If you have Firebase CLI installed:
```bash
firebase deploy --only firestore:indexes
```

The required indexes are defined in `firestore.indexes.json`.

### Firebase Security Rules

Add these Firestore security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }
    match /elections/{electionId} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'election_officer'];
    }
    match /votes/{voteId} {
      allow create: if request.auth != null && request.auth.uid == request.resource.data.voterId;
      allow read: if request.auth.uid == resource.data.voterId || 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'election_officer'];
    }
  }
}
```

## Project Structure

```
smartvote/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── elections/
│   │   │   ├── voters/
│   │   │   ├── candidates/
│   │   │   ├── reports/
│   │   │   ├── audit/
│   │   │   ├── users/
│   │   │   └── settings/
│   │   ├── dashboard/
│   │   ├── elections/
│   │   ├── notifications/
│   │   ├── profile/
│   │   ├── settings/
│   │   └── my-votes/
│   ├── globals.css
│   ├── layout.js
│   ├── page.js
│   └── providers.js
├── components/
│   ├── auth/
│   ├── charts/
│   ├── elections/
│   ├── layout/
│   └── ui/
├── lib/
│   ├── hooks/
│   ├── services/
│   ├── constants.js
│   ├── encryption.js
│   ├── firebase.js
│   └── store.js
└── public/
```

## Security Design

- **Vote Encryption**: All votes are encrypted using AES-256 before storage
- **Vote Hashing**: SHA-256 hash ensures vote integrity
- **Receipt System**: Voters receive a receipt code to verify their vote was recorded
- **Audit Logging**: All actions are logged with timestamps and user info
- **Role-Based Access**: Strict permission controls for all operations
- **Session Management**: Automatic timeout for inactive sessions

## Accessibility & Compliance

- WCAG 2.1 AA compliant design
- Keyboard navigation support
- Screen reader optimized
- High contrast mode available
- Consent acknowledgment before voting
- Data privacy compliance notices
- Terms and conditions acceptance

## Optional Enhancements (Future)

- QR code login within campus
- Offline voting with secure data sync
- SMS notifications via Twilio
- Email notifications via SendGrid
- Blockchain-based vote verification
- Biometric authentication
- Real-time WebSocket updates

## License

MIT License

## Support

For support, please contact the system administrator or open an issue in the repository.

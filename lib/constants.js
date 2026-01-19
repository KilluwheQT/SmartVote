export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ELECTION_OFFICER: 'election_officer',
  VIEWER: 'viewer',
  VOTER: 'voter',
  CANDIDATE: 'candidate'
};

export const ELECTION_STATUS = {
  DRAFT: 'draft',
  PREVIEW: 'preview',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const VOTER_STATUS = {
  NOT_VOTED: 'not_voted',
  VOTED: 'voted',
  BLOCKED: 'blocked',
  INACTIVE: 'inactive'
};

export const CANDIDATE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
};

export const ELECTION_TYPES = {
  STUDENT_GOVERNMENT: 'student_government',
  DEPARTMENT: 'department',
  CLUB: 'club',
  GRADE_LEVEL: 'grade_level'
};

export const POSITIONS = [
  'President',
  'Vice President',
  'Secretary',
  'Treasurer',
  'Auditor',
  'Public Relations Officer',
  'Business Manager',
  'Representative'
];

export const GRADE_LEVELS = [
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Graduate'
];

export const AUDIT_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  VOTE_CAST: 'vote_cast',
  ELECTION_CREATED: 'election_created',
  ELECTION_STARTED: 'election_started',
  ELECTION_PAUSED: 'election_paused',
  ELECTION_RESUMED: 'election_resumed',
  ELECTION_ENDED: 'election_ended',
  CANDIDATE_APPROVED: 'candidate_approved',
  CANDIDATE_REJECTED: 'candidate_rejected',
  VOTER_IMPORTED: 'voter_imported',
  VOTER_BLOCKED: 'voter_blocked',
  SETTINGS_CHANGED: 'settings_changed',
  DATA_EXPORTED: 'data_exported'
};

export const NOTIFICATION_TYPES = {
  ELECTION_START: 'election_start',
  ELECTION_END: 'election_end',
  VOTING_REMINDER: 'voting_reminder',
  WINNER_ANNOUNCEMENT: 'winner_announcement',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  CANDIDATE_APPROVED: 'candidate_approved',
  CANDIDATE_REJECTED: 'candidate_rejected'
};

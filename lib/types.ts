export type InitiativeStatus = 'proposed' | 'approved' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled'
export type InitiativeComplexity = 'low' | 'medium' | 'high' | 'very-high'
export type IdeaStatus = 'submitted' | 'in-review' | 'approved' | 'rejected' | 'implemented'
export type IdeaType = 'idea' | 'request'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type BugSeverity = 'low' | 'medium' | 'high' | 'critical'
export type BugStatus = 'open' | 'in-progress' | 'resolved' | 'closed' | 'wont-fix'
export type BacklogStatus = 'backlog' | 'todo' | 'in-progress' | 'done' | 'blocked'
export type BacklogType = 'epic' | 'story' | 'task' | 'bug'
export type DecisionStatus = 'proposed' | 'accepted' | 'rejected' | 'deprecated'
export type RequirementStatus = 'draft' | 'review' | 'approved' | 'implemented'

export interface Idea {
  id: string
  title: string
  description: string
  type: IdeaType
  status: IdeaStatus
  priority: Priority
  submitter: string
  team: string
  date: string
  tags: string[]
  votes: number
}

export interface Bug {
  id: string
  title: string
  description: string
  severity: BugSeverity
  status: BugStatus
  reporter: string
  assignee: string
  date: string
  updatedAt: string
  steps: string
  expected: string
  actual: string
  environment: string
  tags: string[]
}

export interface NewsArticle {
  id: string
  title: string
  content: string
  category: 'updates' | 'snapshot' | 'roadmap' | 'metrics' | 'vision' | 'blog'
  date: string
  author: string
  pinned: boolean
  tags: string[]
}

export interface BacklogItem {
  id: string
  title: string
  description: string
  type: BacklogType
  status: BacklogStatus
  priority: Priority
  sprint: string
  estimate: number
  assignee: string
  epic: string
  date: string
  tags: string[]
}

export interface Decision {
  id: string
  title: string
  context: string
  decision: string
  consequences: string
  status: DecisionStatus
  author: string
  date: string
  tags: string[]
}

export interface Requirement {
  id: string
  title: string
  epic: string
  description: string
  acceptanceCriteria: string
  status: RequirementStatus
  priority: Priority
  author: string
  assignee: string
  date: string
  updatedAt: string
  tags: string[]
}

export interface TeamMember {
  id: string
  name: string
  role: string
  team?: string
  department?: string
  email: string
  phone?: string
  office?: string
  dob?: string
  joinDate?: string
  manager?: string
  insideLC?: string
  gender?: string
  avatar?: string
  responsibilities?: string[]
}

export interface DemoMeeting {
  id: string
  title: string
  date: string
  time: string
  link: string
  description: string
  agenda: string[]
  recording?: string
}

export interface Initiative {
  id: string
  title: string
  status: InitiativeStatus
  priority: Priority
  product: string
  owner: string
  quarter: string
  objective: string
  problem: string
  solution: string
  complexity: InitiativeComplexity
  risks: string
  effort: string
  investment: string
  roadmap?: boolean
  date: string
  tags: string[]
}

export interface FeedbackItem {
  id: string
  title: string
  content: string
  submitter: string
  date: string
  category: string
  status: 'new' | 'acknowledged' | 'addressed'
}

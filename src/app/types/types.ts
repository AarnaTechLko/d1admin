
export interface Evaluation {

  id: number;
  reviewTitle: string;
  primary_video_link: string;
  first_name: string;
  coachId: number;
  playerId: number;
  evaluation: string;
  image: string;
  number: number;
  position: number;
  expectedCharge: number;
  evaluationId: number;
  team: string;
  last_name: string;
  video_link_two?: string;
  video_link_three?: string;
  video_description?: string;
  evaluation_status: string;
  payment_status: string;
  created_at: string;
  createdAt: string;
  turnaroundTime: number;
  result: string;
  technicalRemarks: string;
  tacticalRemarks: string;
  physicalRemarks: string;
  finalRemarks: string;
  organizationalRemarks: string;
  rating: number;
  remarks: string;
  percentage: number;
  lighttype: number;
  evaluationposition: number;
  rejectremarks: string;
  slug: string;
  playerSlug: string;
  videoOneTiming: string;
  videoTwoTiming: string;
  videoThreeTiming: string;
  coachFirstName: string;
  coachLastName: string;
  coachSlug: string;
  updated_at: string;
  accepted_at: string;
  distributionRemarks: string;
  jerseyColorOne: string;
  jerseyNumber: string;
  positionOne: string;
  jerseyColorTwo: string;
  jerseyNumberTwo: string;
  positionTwo: string;
  video_descriptionTwo: string;
  jerseyColorThree: string;
  jerseyNumberThree: string;
  positionThree: string;
  video_descriptionThree: string;
document:string;
thingsToWork:string;
coachimage:string;
review_status:number;

}

export interface EvaluationsByStatus {
  Requested: Evaluation[];
  Accepted: Evaluation[];
  Completed: Evaluation[];
  Declined: Evaluation[];
  Drafted: Evaluation[];
}


export interface EvaluationData {
  review_title: string;
  rating: number;
  image: string; // Adjust this type based on your actual image data
  id: number; // Adjust this type based on your actual image data
  first_name: string; // Adjust this type based on your actual image data
  last_name: string; // Adjust this type based on your actual image data
  remarks: string; // Adjust this type based on your actual image data
}

export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  image: string;
  position: string;
  height: string;
  countryName: string;
  state: string;
  city: string;
  gender: string;
  league: string;
  jersey: string;
  weight: string;
  history?: string;
  graduation: string;
  sport: string;
  status: string;
  earnings: number;
  age_group: string;
  grade_level: string;
  is_deleted: number;
  suspend: number;
  suspend_days: number;
}


export interface Coach {
  
  // [x: string]: number;
  id: string;
  evaluationId: number;
  firstName: string;
  lastName: string;
  image: string;
  gender: string;
  countryName: string;
  state: string;
  city: string;
  sport: string;
  totalEvaluations: string;
  status: string;
  suspend: number;
  suspend_days: number;
  suspend_start_date: Date;
  suspend_end_date: Date;
  history?: string;
  earnings: number;
  is_deleted: number;
 evaluations?: Evaluation[];
}

export interface Organization {
  id: string;
  organizationName: string;
  contactPerson: string;
  owner_name: string;
  package_id: string;
  email: string;
  mobileNumber: string;
  countryCodes: string;
  address: string;
  country: string;
  state: string;
  city: string;
  logo: string;
  status: string;
    totalUsers: number;

  totalPlayers: number;
  totalCoaches: number;
  totalTeams: number;
  history?: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  xlink: string;
  youtube: string;
  is_deleted: number;
suspend: number;
  suspend_days: number;
}

export interface Ticket{
    id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  assign_to: number;
  assign_to_username: string;
  createdAt: string;
  status: string;
  assignee_name: string;
  ticket_from: string;
  role: string;
    escalate: boolean; // ✅ fix type to boolean

}
export interface Team {
  id: number;
  team_name: string;
  logo: string;
  organisation_name?: string;
  totalPlayers: number;
  totalCoaches: number;
  team_type: string;
  team_year: number;
  status: string;
}

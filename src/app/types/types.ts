
export interface Evaluation {
  id: number;
  review_title: string;
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

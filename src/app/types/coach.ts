import { Evaluation } from "@/app/types/types";

export type Coach = {
  id: string;
  evaluationId: number;
  firstName: string;
  lastName: string;
  image: string;
  gender: string;
  sport: string;
  totalEvaluations: string;
  status: string;
  history?: string;
  earnings: number;
  evaluations: Evaluation[]; // ✅ Now it's the same type used in CoachTable
  is_deleted: number;
};

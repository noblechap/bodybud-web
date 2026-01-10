import type { AthleteStatus } from "./athleteStatus";
import type { Food, FoodGoals, MealPlan } from "./food";
import type { Gender } from "./gender";
import type { Goal } from "./goal";
import type { SportType } from "./sportType";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  cellphone?: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
  };
}
export interface Athlete extends User {
  status: AthleteStatus;
  gender: Gender;
  birthDate: Date;
  age: number;
  lastSession?: Date;
  nextSession?: Date;
  enrollmentDate: Date;
  sport: SportType;
  goal: Goal;
  notes?: string;
  progression?: number; // 0-100
}

export interface Client {
  id: number;
  username: string;
  profile_picture?: string | null;
  client_phone?: string | null;
  client_email?: string | null;
  client_full_name?: string | null;
  client_notes?: string | null;
  client_emergency_contact?: string | null;
  coaching_since?: string;
  client_is_provisioned: boolean;
  max_client_provisions: number;
}

export interface CoachInfo {
    max_client_provisions: number | null;
    provisioned_clients: number | null;
    plan_tier: string | null;
    clients: Client[]; 
}

export interface AddClientPayload {
  username: string;
}

export interface UpdateClientPayload {
  client_phone?: string;
  client_email?: string;
  client_full_name?: string;
  client_notes?: string;
  client_emergency_contact?: string;
}

export interface AssignCheckInPayload {
  client: number;
  due_date: Date;
  title: string;
  description: string;
  items: Array<{
    item_type: string;
    prompt: string;
    is_required: boolean;
    order: number;
  }>;
}

export interface SaveCheckInTemplatePayload {
  title: string;
  description: string;
  items: Array<{
    item_type: string;
    prompt: string;
    is_required: boolean;
    order: number;
  }>;
}

export interface MealTemplate {
  id: number;
  name: string;
  description?: string;
  meals?: unknown[];
  meal_foods: Array<{
    food: Food;
    serving_size_g: number;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface CheckInTemplate {
  id: number;
  name?: string;
  title: string;
  description?: string;
  items: CheckInTemplateItem[];
  questions?: unknown[];
  created_at?: string;
  updated_at?: string;
}

export interface CheckInTemplateItem {
  id?: number;
  item_type: string;
  prompt: string;
  is_required: boolean;
  order?: number;
}

export interface CheckInItem {
  id: number;
  prompt: string;
  item_type: string;
  is_required: boolean;
  text_response?: string;
  number_response?: number;
  boolean_response?: boolean;
  photo_response_url?: string;
  video_response_url?: string;
}

export interface CheckIn {
  id: number;
  title: string;
  description?: string;
  due_date: string;
  completed_at?: string;
  items: CheckInItem[];
}

export interface ClientInfo {
  username: string;
  using_pounds: boolean;
  workout_history: unknown[];
  workout_templates: unknown[];
  supplements: unknown[];
  bodyweights: unknown[];
  food_goals?: FoodGoals[];
  meal_plan?: MealPlan[];
  client_checkins: CheckIn[];
}

export interface CreateClientAccountPayload {
  email: string;
  full_name?: string;
  send_welcome_email: boolean;
}

export interface CreateClientAccountResponse {
  user_id: number;
  username: string;
  email: string;
  temp_password: string;
}
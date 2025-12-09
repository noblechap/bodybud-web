export interface CheckInItem {
  id: number;
  prompt: string;
  item_type: string;
  is_required: boolean;
  text_response?: string;
  number_response?: number;
  yes_no_response?: boolean;
  photo_url?: string;
  video_url?: string;
}

export interface CheckIn {
  id: number;
  title: string;
  description?: string;
  due_date: string;
  completed_at?: string;
  created_at?: string;
  items: CheckInItem[];
}

export interface DocumentResponse {
  id: number;
  original_filename: string;
  stored_file_path?: string;
  mime_type?: string;
  file_size?: number;
  uploaded_at: string;
  current_status: string;
  latest_job_id?: number;
}

export interface JobResponse {
  id: number;
  document_id: number;
  status: string;
  progress_percentage: number;
  current_stage?: string;
  error_message?: string;
  retry_count: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface ReviewResponse {
  id: number;
  document_id: number;
  raw_text?: string;
  structured_output_json?: any;
  reviewed_output_json?: any;
  is_finalized: boolean;
  finalized_at?: string;
  updated_at: string;
}

export interface ReviewUpdateRequest {
  reviewed_output_json: any;
}

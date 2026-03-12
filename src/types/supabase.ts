export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      carriers: {
        Row: {
          id: string
          user_id: string
          mc_number: string
          dot_number: string
          legal_name: string
          dba_name: string | null
          entity_type: string | null
          operating_status: string | null
          phone: string | null
          email: string | null
          address_street: string | null
          address_city: string | null
          address_state: string | null
          address_zip: string | null
          mailing_street: string | null
          mailing_city: string | null
          mailing_state: string | null
          mailing_zip: string | null
          safety_rating: string | null
          safety_rating_date: string | null
          total_drivers: number | null
          total_power_units: number | null
          operation_classification: string[] | null
          carrier_operation: string[] | null
          cargo_carried: string[] | null
          bipd_required: number | null
          bipd_on_file: number | null
          bipd_insurer: string | null
          bipd_policy_number: string | null
          cargo_required: number | null
          cargo_on_file: number | null
          cargo_insurer: string | null
          cargo_policy_number: string | null
          bond_required: number | null
          bond_on_file: number | null
          vehicle_inspections_total: number | null
          vehicle_inspections_oos: number | null
          driver_inspections_total: number | null
          driver_inspections_oos: number | null
          hazmat_inspections_total: number | null
          hazmat_inspections_oos: number | null
          crashes_fatal: number | null
          crashes_injury: number | null
          crashes_towaway: number | null
          equipment: Json | null
          service_lanes: string[] | null
          company_description: string | null
          logo_url: string | null
          brand_color: string | null
          website_slug: string
          plan: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          fmcsa_raw: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mc_number: string
          dot_number: string
          legal_name: string
          dba_name?: string | null
          entity_type?: string | null
          operating_status?: string | null
          phone?: string | null
          email?: string | null
          address_street?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          mailing_street?: string | null
          mailing_city?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          safety_rating?: string | null
          safety_rating_date?: string | null
          total_drivers?: number | null
          total_power_units?: number | null
          operation_classification?: string[] | null
          carrier_operation?: string[] | null
          cargo_carried?: string[] | null
          bipd_required?: number | null
          bipd_on_file?: number | null
          bipd_insurer?: string | null
          bipd_policy_number?: string | null
          cargo_required?: number | null
          cargo_on_file?: number | null
          cargo_insurer?: string | null
          cargo_policy_number?: string | null
          bond_required?: number | null
          bond_on_file?: number | null
          vehicle_inspections_total?: number | null
          vehicle_inspections_oos?: number | null
          driver_inspections_total?: number | null
          driver_inspections_oos?: number | null
          hazmat_inspections_total?: number | null
          hazmat_inspections_oos?: number | null
          crashes_fatal?: number | null
          crashes_injury?: number | null
          crashes_towaway?: number | null
          equipment?: Json | null
          service_lanes?: string[] | null
          company_description?: string | null
          logo_url?: string | null
          brand_color?: string | null
          website_slug: string
          plan?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          fmcsa_raw?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mc_number?: string
          dot_number?: string
          legal_name?: string
          dba_name?: string | null
          entity_type?: string | null
          operating_status?: string | null
          phone?: string | null
          email?: string | null
          address_street?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          mailing_street?: string | null
          mailing_city?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          safety_rating?: string | null
          safety_rating_date?: string | null
          total_drivers?: number | null
          total_power_units?: number | null
          operation_classification?: string[] | null
          carrier_operation?: string[] | null
          cargo_carried?: string[] | null
          bipd_required?: number | null
          bipd_on_file?: number | null
          bipd_insurer?: string | null
          bipd_policy_number?: string | null
          cargo_required?: number | null
          cargo_on_file?: number | null
          cargo_insurer?: string | null
          cargo_policy_number?: string | null
          bond_required?: number | null
          bond_on_file?: number | null
          vehicle_inspections_total?: number | null
          vehicle_inspections_oos?: number | null
          driver_inspections_total?: number | null
          driver_inspections_oos?: number | null
          hazmat_inspections_total?: number | null
          hazmat_inspections_oos?: number | null
          crashes_fatal?: number | null
          crashes_injury?: number | null
          crashes_towaway?: number | null
          equipment?: Json | null
          service_lanes?: string[] | null
          company_description?: string | null
          logo_url?: string | null
          brand_color?: string | null
          website_slug?: string
          plan?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          fmcsa_raw?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      quote_requests: {
        Row: {
          id: string
          carrier_id: string
          name: string
          email: string
          details: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          carrier_id: string
          name: string
          email: string
          details: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          carrier_id?: string
          name?: string
          email?: string
          details?: string
          status?: string
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          carrier_id: string
          name: string
          type: string
          file_url: string
          created_at: string
        }
        Insert: {
          id?: string
          carrier_id: string
          name: string
          type: string
          file_url: string
          created_at?: string
        }
        Update: {
          id?: string
          carrier_id?: string
          name?: string
          type?: string
          file_url?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

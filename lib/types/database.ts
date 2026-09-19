export type UserRole = "admin" | "barber";
export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

// Nota: usamos `type` (não `interface`) porque o supabase-js exige que cada
// Row satisfaça `extends Record<string, unknown>` — interfaces sem index
// signature não atendem a esse constraint genérico.

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
};

export type SiteSettings = {
  id: number;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram_url: string | null;
  address: string | null;
  maps_url: string | null;
  hours: { day: string; time: string }[];
  updated_at: string;
};

export type Barber = {
  id: string;
  profile_id: string | null;
  name: string;
  photo_url: string | null;
  bio: string | null;
  specialties: string[];
  active: boolean;
  created_at: string;
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  active: boolean;
  created_at: string;
};

export type WorkingHours = {
  id: string;
  barber_id: string;
  weekday: number; // 0=domingo .. 6=sábado
  start_time: string; // HH:mm:ss
  end_time: string;
  break_start: string | null;
  break_end: string | null;
};

export type BlockedTime = {
  id: string;
  barber_id: string;
  start_at: string;
  end_at: string;
  reason: string | null;
  created_by: string | null;
  created_at: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
};

export type Appointment = {
  id: string;
  barber_id: string;
  service_id: string;
  customer_id: string;
  start_at: string;
  end_at: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AppointmentWithRelations = Appointment & {
  barber: Pick<Barber, "id" | "name" | "photo_url">;
  service: Pick<Service, "id" | "name" | "duration_minutes" | "price_cents">;
  customer: Pick<Customer, "id" | "name" | "phone" | "email">;
};

// Helper para declarar Row/Insert/Update/Relationships de forma compacta.
type Table<Row, Insertable extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Insertable>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile, "id" | "full_name">;
      site_settings: Table<SiteSettings>;
      barbers: Table<Barber, "name">;
      services: Table<Service, "name" | "duration_minutes" | "price_cents">;
      working_hours: Table<WorkingHours, "barber_id" | "weekday" | "start_time" | "end_time">;
      blocked_times: Table<BlockedTime, "barber_id" | "start_at" | "end_at">;
      customers: Table<Customer, "name" | "phone">;
      appointments: Table<
        Appointment,
        "barber_id" | "service_id" | "customer_id" | "start_at" | "end_at"
      >;
    };
    Views: Record<string, never>;
    Functions: {
      get_available_slots: {
        Args: {
          p_barber_id: string;
          p_service_id: string;
          p_date: string;
          p_slot_step_minutes?: number;
        };
        Returns: { slot_start: string }[];
      };
      create_appointment: {
        Args: {
          p_barber_id: string;
          p_service_id: string;
          p_start_at: string;
          p_customer_name: string;
          p_customer_phone: string;
          p_customer_email?: string | null;
        };
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      appointment_status: AppointmentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

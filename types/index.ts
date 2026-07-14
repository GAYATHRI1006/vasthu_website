export type VastuClass = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  event_date: string;
  event_time: string;
  venue: string;
  address: string;
  fee: number;
  total_seats: number;
  available_seats: number;
  registration_open: boolean;
};

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
};

export type RegistrationPayload = {
  classId: string;
  fullName: string;
  phone: string;
  email?: string;
  place: string;
  interestedClass: string;
  occupation?: string;
};

export type BookingRecord = {
  bookingId: string;
  customerName: string;
  phone: string;
  email?: string | null;
  place: string;
  occupation?: string | null;
  program: string;
  amountPaid: number;
  paymentId: string;
  venue: string;
  eventDate: string;
  paymentStatus: "paid" | "pending" | "failed";
  bookingStatus: "confirmed" | "pending" | "cancelled";
};

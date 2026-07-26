const CONFIRMED_BOOKING_KEY = "hariom_confirmed_booking_id";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getConfirmedBookingId() {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(CONFIRMED_BOOKING_KEY);
}

export function setConfirmedBookingId(bookingId: string) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(CONFIRMED_BOOKING_KEY, bookingId);
}

export function clearConfirmedBookingId() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(CONFIRMED_BOOKING_KEY);
}

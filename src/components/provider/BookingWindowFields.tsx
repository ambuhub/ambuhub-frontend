"use client";

import { HireReturnWindowFields } from "@/components/provider/HireReturnWindowFields";
import type { BookingWindow } from "@/lib/booking-window";

type Props = {
  value: BookingWindow;
  onChange: (next: BookingWindow) => void;
};

export function BookingWindowFields({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-600">
        When clients can book you (Africa/Lagos, WAT).
      </p>
      <HireReturnWindowFields
        value={value}
        onChange={onChange}
        labelClass="block text-sm font-semibold text-blue-950"
      />
    </div>
  );
}

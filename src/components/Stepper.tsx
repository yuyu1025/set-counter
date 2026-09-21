"use client";

import { Minus, Plus } from "lucide-react";

type StepperProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
};

export function Stepper({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: StepperProps) {
  return (
    <div className="stepper">
      <span className="stepper-label">{label}</span>
      <div className="stepper-row">
        <button
          type="button"
          className="stepper-btn"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(min, value - step))}
        >
          <Minus size={22} strokeWidth={2.4} />
        </button>
        <input
          className="stepper-value"
          inputMode="numeric"
          value={value}
          aria-label={label}
          onChange={(event) => {
            const next = Number.parseInt(event.target.value, 10);
            if (Number.isNaN(next)) {
              return;
            }
            onChange(Math.min(max, Math.max(min, next)));
          }}
        />
        <button
          type="button"
          className="stepper-btn"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(Math.min(max, value + step))}
        >
          <Plus size={22} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

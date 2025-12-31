"use client";

import { MALAYSIAN_STATES } from "@/lib/constants";

interface StateFilterProps {
    value: string;
    onChange: (value: string) => void;
}

export default function StateFilter({ value, onChange }: StateFilterProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="select-field"
        >
            <option value="">All States</option>
            {MALAYSIAN_STATES.map((state) => (
                <option key={state} value={state}>
                    {state}
                </option>
            ))}
        </select>
    );
}

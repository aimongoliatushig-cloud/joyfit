interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

/** Шошго + оролт + тайлбар/алдааг нэг стандартаар харуулна. */
export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-text">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

interface Option<T extends string | number> {
  value: T;
  label: string;
}

/** Цөөн сонголттой талбарт товчлуурын бүлэг (radio). */
export function Segmented<T extends string | number>({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              active
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface text-text hover:bg-surface2"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export const selectClass =
  "w-full rounded-xl bg-surface border border-border px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

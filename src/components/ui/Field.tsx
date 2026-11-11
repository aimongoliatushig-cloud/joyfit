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

/** Тайлбартай сонголтын карт (radio). Сонголт бүрийн утгыг нэг харцаар ойлгуулна. */
export function ChoiceCards<T extends string>({
  name,
  value,
  options,
  onChange,
  columns = 3,
}: {
  name: string;
  value: T;
  options: { value: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
  columns?: 2 | 3 | 4;
}) {
  const grid = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[columns];
  return (
    <div role="radiogroup" aria-label={name} className={`grid grid-cols-1 gap-2 ${grid}`}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              active ? "border-primary bg-primary/10" : "border-border bg-surface hover:bg-surface2"
            }`}
          >
            <span className={`block font-bold ${active ? "text-primary" : "text-text"}`}>{o.label}</span>
            {o.hint && <span className="block text-sm text-muted">{o.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}

export const selectClass =
  "w-full rounded-xl bg-surface border border-border px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

interface PasswordStrengthBarProps {
  password: string;
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const rules = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "Contains uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "Contains lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "Contains a number",
      valid: /[0-9]/.test(password),
    },
    {
      label: "Contains special character",
      valid: /[^a-zA-Z0-9]/.test(password),
    },
  ];
  const validCount = rules.filter((rule) => rule.valid).length;
  const allRulesValid = validCount === rules.length;
  const visibleRules = allRulesValid ? [] : rules.filter((rule) => !rule.valid);

  return (
    <div className="mt-1.5 space-y-1">
      {allRulesValid ? (
        <div className="flex items-center gap-2 text-xs text-emerald-700">
          <span
            aria-hidden="true"
            className="inline-flex h-4 w-4 items-center justify-center rounded border border-emerald-600 bg-emerald-600 text-white"
          >
            {"\u2713"}
          </span>
          <span>Strong password</span>
        </div>
      ) : (
        visibleRules.map((rule) => (
          <div key={rule.label} className="flex items-center gap-2 text-xs">
            <span
              aria-hidden="true"
              className="inline-flex h-4 w-4 items-center justify-center rounded border border-rose-300 bg-rose-50 text-rose-600"
            >
              {"\u2715"}
            </span>
            <span className="text-rose-600">{rule.label}</span>
          </div>
        ))
      )}
    </div>
  );
}

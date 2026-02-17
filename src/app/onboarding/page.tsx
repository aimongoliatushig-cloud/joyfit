"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { dictionary } from "@/lib/i18n";
import { checkPhoneExists, completeOnboarding } from "@/server/actions";
import { isValidPhone, isValidInviter, isValidPin } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const t = dictionary;

type PlanChoice = "1m" | "3m";
type CheckinDay = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
type WorkSituation = "office" | "active" | "student" | "home" | "other";
type Motivation = "health" | "confidence" | "event" | "performance" | "other";

const CHECKIN_DAYS: { value: CheckinDay; label: string }[] = [
  { value: "sun", label: t.onboarding.daySun },
  { value: "mon", label: t.onboarding.dayMon },
  { value: "tue", label: t.onboarding.dayTue },
  { value: "wed", label: t.onboarding.dayWed },
  { value: "thu", label: t.onboarding.dayThu },
  { value: "fri", label: t.onboarding.dayFri },
  { value: "sat", label: t.onboarding.daySat },
];

const WORK_OPTIONS: { value: WorkSituation; label: string }[] = [
  { value: "office", label: t.onboarding.workOffice },
  { value: "active", label: t.onboarding.workActive },
  { value: "student", label: t.onboarding.workStudent },
  { value: "home", label: t.onboarding.workHome },
  { value: "other", label: t.onboarding.workOther },
];

const MOTIVATION_OPTIONS: { value: Motivation; label: string }[] = [
  { value: "health", label: t.onboarding.motivationHealth },
  { value: "confidence", label: t.onboarding.motivationConfidence },
  { value: "event", label: t.onboarding.motivationEvent },
  { value: "performance", label: t.onboarding.motivationPerformance },
  { value: "other", label: t.onboarding.motivationOther },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [targetWarn, setTargetWarn] = useState(false);

  // Step 1
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [inviter, setInviter] = useState("");

  // Step 2
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">();
  const [birthYear, setBirthYear] = useState("");

  // Step 3
  const [planChoice, setPlanChoice] = useState<PlanChoice | null>(null);
  const [weeklyCheckinDay, setWeeklyCheckinDay] = useState<CheckinDay>("sun");
  const [workSituation, setWorkSituation] = useState<WorkSituation>();
  const [motivation, setMotivation] = useState<Motivation>();

  async function validateStep1(): Promise<boolean> {
    const next: Record<string, string> = {};
    if (!phone.trim()) next.phone = t.errors.phoneRequired;
    else if (!isValidPhone(phone)) next.phone = t.errors.phoneInvalid;
    if (!pin) next.pin = t.errors.pinRequired;
    else if (!isValidPin(pin)) next.pin = t.errors.pinInvalid;
    if (!pinConfirm) next.pinConfirm = t.errors.pinRequired;
    else if (pin !== pinConfirm) next.pinConfirm = t.errors.pinMismatch;
    if (inviter.trim() && !isValidInviter(inviter)) next.inviter = t.errors.inviterInvalid;
    setErrors(next);
    setSubmitError("");
    if (Object.keys(next).length > 0) return false;
    const exists = await checkPhoneExists(phone);
    if (exists) {
      setSubmitError(t.errors.phoneExists);
      return false;
    }
    return true;
  }

  function validateStep2(): boolean {
    const next: Record<string, string> = {};
    const cw = parseFloat(currentWeight);
    const tw = parseFloat(targetWeight);
    if (!currentWeight.trim()) next.currentWeight = t.errors.weightRequired;
    else if (isNaN(cw) || cw < 30 || cw > 300) next.currentWeight = t.errors.weightInvalid;
    if (!targetWeight.trim()) next.targetWeight = t.errors.weightRequired;
    else if (isNaN(tw) || tw < 30 || tw > 300) next.targetWeight = t.errors.weightInvalid;
    if (currentWeight.trim() && targetWeight.trim() && !isNaN(cw) && !isNaN(tw) && tw >= cw) {
      setTargetWarn(true);
    } else {
      setTargetWarn(false);
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateStep3(): boolean {
    const next: Record<string, string> = {};
    if (!planChoice) next.plan = t.errors.planRequired;
    setErrors(next);
    setSubmitError("");
    return Object.keys(next).length === 0;
  }

  async function handleNext() {
    if (step === 1 && !(await validateStep1())) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step < 3) setStep(step + 1);
  }

  async function handleComplete() {
    if (!validateStep3()) return;
    const result = await completeOnboarding({
      phone,
      pin,
      inviterRef: inviter.trim() || undefined,
      startWeightKg: parseFloat(currentWeight),
      targetWeightKg: parseFloat(targetWeight),
      heightCm: height.trim() ? parseInt(height, 10) : undefined,
      gender,
      birthYear: birthYear.trim() ? parseInt(birthYear, 10) : undefined,
      workSituation,
      motivation,
      weeklyCheckinDay,
      planChoice: planChoice!,
    });
    if ("success" in result && result.success) {
      router.push("/dashboard");
      router.refresh();
    } else if ("error" in result) {
      setSubmitError(result.error === "PHONE_EXISTS" ? t.errors.phoneExists : t.errors.generic);
    }
  }

  const invited = inviter.trim().length > 0;

  return (
    <div className="min-h-screen">
      <div className="absolute left-0 right-0 top-0 h-40 -z-10 bg-gradient-to-b from-primary/15 to-transparent dark:from-primary/25" />

      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
        <Card className="w-full">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-text">
              {step === 1 ? t.onboarding.step1Title : step === 2 ? t.onboarding.step2Title : t.onboarding.step3Title}
            </h1>
            <span className="text-sm font-medium text-muted">
              {step}/3
            </span>
          </div>

          {/* Step indicator */}
          <div className="mb-8 flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-surface2"
                }`}
              />
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text">
                  {t.onboarding.phone} <span className="text-primary">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder={t.onboarding.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={errors.phone ? "border-red-500" : ""}
                  autoComplete="tel"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text">
                  {t.onboarding.pin} <span className="text-primary">*</span>
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  placeholder="4-6 орон"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={6}
                  className={errors.pin ? "border-red-500" : ""}
                />
                {errors.pin && <p className="mt-1 text-sm text-red-500">{errors.pin}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text">
                  {t.onboarding.pinConfirm} <span className="text-primary">*</span>
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  placeholder="4-6 орон"
                  value={pinConfirm}
                  onChange={(e) => setPinConfirm(e.target.value)}
                  maxLength={6}
                  className={errors.pinConfirm ? "border-red-500" : ""}
                />
                {errors.pinConfirm && <p className="mt-1 text-sm text-red-500">{errors.pinConfirm}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text">{t.onboarding.inviter}</label>
                <Input
                  type="text"
                  placeholder={t.onboarding.inviterPlaceholder}
                  value={inviter}
                  onChange={(e) => setInviter(e.target.value)}
                  className={errors.inviter ? "border-red-500" : ""}
                />
                {errors.inviter && <p className="mt-1 text-sm text-red-500">{errors.inviter}</p>}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-text">{t.onboarding.step2Title}</h2>
              <div>
                <label className="block text-sm font-medium text-text">
                  {t.onboarding.currentWeight} <span className="text-primary">*</span>
                </label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="75"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className={errors.currentWeight ? "border-red-500" : ""}
                />
                {errors.currentWeight && <p className="mt-1 text-sm text-red-500">{errors.currentWeight}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text">
                  {t.onboarding.targetWeight} <span className="text-primary">*</span>
                </label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="70"
                  value={targetWeight}
                  onChange={(e) => { setTargetWeight(e.target.value); setTargetWarn(false); }}
                  className={errors.targetWeight ? "border-red-500" : ""}
                />
                {errors.targetWeight && <p className="mt-1 text-sm text-red-500">{errors.targetWeight}</p>}
                {targetWarn && !errors.targetWeight && (
                  <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">{t.errors.targetWarn}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text">{t.onboarding.height}</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="170"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text">{t.onboarding.gender}</label>
                <select
                  value={gender ?? ""}
                  onChange={(e) => setGender(e.target.value ? (e.target.value as "male" | "female" | "other") : undefined)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">--</option>
                  <option value="male">{t.onboarding.genderMale}</option>
                  <option value="female">{t.onboarding.genderFemale}</option>
                  <option value="other">{t.onboarding.genderOther}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text">{t.onboarding.birthYear}</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="1990"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-text">{t.onboarding.step3Title}</h2>
              <div>
                <label className="block text-sm font-medium text-text">
                  {t.onboarding.planChoice} <span className="text-primary">*</span>
                </label>
                <div className="mt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => setPlanChoice("1m")}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      planChoice === "1m"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-surface hover:border-primary/50"
                    }`}
                  >
                    <span className="font-semibold text-text">
                      {invited ? t.onboarding.plan1mInvited : t.onboarding.plan1m}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlanChoice("3m")}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      planChoice === "3m"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-surface hover:border-primary/50"
                    }`}
                  >
                    <span className="font-semibold text-text">{t.onboarding.plan3m}</span>
                  </button>
                </div>
                {errors.plan && <p className="mt-1 text-sm text-red-500">{errors.plan}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text">{t.onboarding.weeklyCheckin}</label>
                <select
                  value={weeklyCheckinDay}
                  onChange={(e) => setWeeklyCheckinDay(e.target.value as CheckinDay)}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {CHECKIN_DAYS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text">{t.onboarding.workSituation}</label>
                <select
                  value={workSituation ?? ""}
                  onChange={(e) => setWorkSituation(e.target.value ? (e.target.value as WorkSituation) : undefined)}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">--</option>
                  {WORK_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text">{t.onboarding.motivation}</label>
                <select
                  value={motivation ?? ""}
                  onChange={(e) => setMotivation(e.target.value ? (e.target.value as Motivation) : undefined)}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">--</option>
                  {MOTIVATION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {submitError && (
            <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
              {submitError}
            </p>
          )}

          <div className="mt-8 flex gap-3">
            {step > 1 ? (
              <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>
                {t.common.back}
              </Button>
            ) : (
              <Link href="/">
                <Button type="button" variant="secondary">{t.common.backLink}</Button>
              </Link>
            )}
            {step < 3 ? (
              <Button type="button" variant="primary" onClick={handleNext} className="flex-1">
                {t.common.next}
              </Button>
            ) : (
              <Button type="button" variant="primary" onClick={handleComplete} className="flex-1">
                {t.common.register}
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}

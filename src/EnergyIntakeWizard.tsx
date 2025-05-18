import React, { useState, useMemo, useCallback, useEffect, ChangeEvent, KeyboardEvent, ReactNode, CSSProperties, SVGProps, ReactElement } from "react"; // Added CSSProperties, SVGProps, ReactElement for Tooltip
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  TooltipProps as RechartsTooltipProps, // Aliased to avoid conflict if we define our own TooltipProps
} from "recharts";
import {
  ValueType,
  NameType,
  Payload, // Correct type for the third arg in formatter
} from "recharts/types/component/DefaultTooltipContent";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Home,
  Instagram,
  Info,
  ChevronDown,
  ChevronUp,
  Mail,
  // LucideProps, // We can use SVGProps for general icon props if needed
} from "lucide-react";

/****************************
* Dil Ayarları (TR)
***************************/
const TR = {
  // Genel
  welcomeTitle: "Hoş Geldiniz!",
  welcomeText: "Günlük enerji ihtiyacınızı ve hedef kalorinizi hesaplayalım.",
  startButton: "BAŞLA",
  nextButton: "İleri",
  backButton: "Geri",
  calculateAgainButton: "Tekrar Hesapla",
  estimatorTitle: "Günlük Enerji İhtiyacı Hesaplayıcısı",
  infoTitle: "Model Hakkında",
  infoDisclaimer:
    "Bu araç; BMR (Bazal Metabolizma Hızı), NEAT (Egzersiz Dışı Aktivite Termogenezi), RT (Ağırlık Antrenmanı) ve TEF (Besin Termik Etkisi) bileşenlerini kullanarak günlük enerji ihtiyacınızı tahmin eder. PA ve TEF faktörleri, adım sayınız ve protein alım düzeyinize göre otomatik hesaplanır.",
  resultsTitle: "Sonuçlar",
  resultsComparisonTitle: "Enerji Bileşen Dağılımı",
  ctaTitle: "BU VERİYİ SONUCA DÖNÜŞTÜRÜN",
  ctaTextP1:
    "Vücut yağ oranı ve enerji ihtiyacınızı bilmek önemlidir; asıl farkı yaratan bu veriyi bilimsel bir strateji ve disiplinli bir sistemle eyleme dönüştürmektir.",
  ctaTextP2:
    "Şu anda, sizin gibi hedeflerine ulaşmak isteyenler için, sonuç odaklı online koçluk programları ve sistemleri geliştiriyorum. İlk başlayanlardan olmak, lansmana özel avantajlardan yararlanmak ve sistem hazır olduğunda haberdar olmak için bekleme listesine katılın.",
  ctaButton: "BEKLEME LİSTESİNE KATIL",
  disclaimer:
    "Uyarı: Bunlar model tabanlı tahminlerdir. Gerçek harcama ±%20 değişebilir. İlerlemenizi takip ederek değeri ayarlayın.",
  noChartData: "Grafik için veri yok.",
  calculationError: "Hesaplama hatası, lütfen baştan başlayın.",
  enterHint: "Devam etmek için Enter'a basabilirsiniz.",

  // Adımlar başlıkları
  goalTitle: "Hedefinizi Seçin",
  stepSex: "Cinsiyetinizi Seçin",
  stepBW: "Kilonuzu Girin (kg)",
  stepBF: "Vücut Yağ Oranınız (%)",
  stepSteps: "Günlük Ortalama Adım Sayınız",
  stepProtein: "Protein Alım Düzeyiniz",
  stepMin: "Antrenman Süresi (dk)",
  stepDays: "Haftada kaç gün ağırlık çalışıyorsunuz?",
  stepTrainStatus: "Antrenman Seviyesi (sadece Bulk)",

  // Yardımcı Metinler (Input altı)
  helpGoal: "Kilo vermek için 'Cut', kas hacmi artırmak için 'Bulk' seçin.",
  helpBW: "Tartıdaki çıplak vücut ağırlığınız.",
  helpBF:
    "Yağ oranınızı bilmiyorsanız <a class='underline text-[#c2a57a]' href='https://calculator.atlasakin.com' target='_blank'>buradaki hesaplayıcıyı</a> kullanabilirsiniz.",
  helpSteps:
    "Yaklaşık günlük adım sayınız. 1.1 ≈ <5K adım, 1.2 ≈ 5‑8K, 1.3 ≈ 8‑12K, 1.4 ≈ >12K PA faktörüne karşılık gelir.",
  helpProtein:
    "Protein alımınız: Çok Düşük (<1 g/kg), Düşük (≈1 g/kg), Orta (≈1.6 g/kg), Yüksek (≥2 g/kg). Daha yüksek protein daha yüksek TEF demektir.",
  helpMin: "Bir antrenman seansında ağırlık çalıştığınız dakika.",
  helpDays: "Haftada kaç gün ağırlık çalışıyorsunuz?",
  helpTrainStatus: "Eğitim yaşı: Başlangıç <1 yıl, Orta Seviye 1‑3 yıl, İleri Seviye 3+ yıl.",

  // Seçenekler
  goalCut: "Cut",
  goalBulk: "Bulk",
  genderMale: "Erkek",
  genderFemale: "Kadın",
  proteinLevels: [
    { k: "verylow", label: "Çok Düşük" },
    { k: "low", label: "Düşük" },
    { k: "medium", label: "Orta" },
    { k: "high", label: "Yüksek" },
  ],
  statusNovice: "Başlangıç",
  statusInter: "Orta Seviye",
  statusAdv: "İleri Seviye",

  // Rapor Sayfası Etiketleri
  reportSubheadingTDEE: "Günlük Enerji İhtiyacı",
  reportSubheadingTarget: "Hedef Kalori",
  reportLabelAverage: "Ortalama",
  reportLabelTrainingDays: "Antrenman Günleri",
  reportLabelRestDays: "Dinlenme Günleri",

  // Özel Rehberlik Metinleri
  guidanceObeseCut: "Obez bireylerde, direnç antrenmanı olmaksızın yapılan çok düşük kalorili diyetlerde bile aşırı kas kaybı riski minimaldir. Fazla kilolu bireylerde yapılan birçok çalışma, diyet sırasında yağsız kütle kaybının, kilo kaybı hızından ziyade toplam kaybedilen kilo miktarıyla ilişkili olduğunu veya daha hızlı kilo kaybı sırasında yaşanan daha fazla yağsız kütle kaybının, sonrasında yağsız kütleyi geri kazanmak için kazanılan zamanla telafi edildiğini bulmuştur. Başka bir deyişle, fazla kilolu bireyler çok hızlı bir şekilde üretken kilo vermeye devam edebilirler.",
  guidanceAdvancedBulk: "İleri seviye sporcularda herhangi bir yağsız kütle kazanımı takdire şayandır. Eğer birkaç hafta sonunda belirgin bir gelişme görmezseniz, vücut yağ oranınızda artışa neden olana kadar kalori alımınızı kademeli olarak artırabilirsiniz.",

  // Progress Bar Text
  progressBarStep: "Adım",
};

/****************************
* Renk Paleti
***************************/
const PALETTE = {
  BACKGROUND: "#003153",
  CARD_BACKGROUND: "#1A1A1A",
  TEXT_PRIMARY: "#F8F8F8",
  TEXT_SECONDARY: "#A9A9A9",
  ACCENT: "#c2a57a",
  ACCENT_HOVER: "#d1b891",
  GRID_COLOR: "#333366",
  BORDER_COLOR: "#333366",
  ERROR_COLOR: "#f85149",
  SUCCESS_COLOR: "#3fb950",
  CHART_COLORS: ["#c2a57a", "#A9A9A9", "#d1b891", "#F8F8F8"],
  PROGRESS_BAR_TRACK: "#001f33",
};

/****************************
* Types
***************************/
// This is where 'Step' type should be defined
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

type Goal = "cut" | "bulk";
type Sex = "male" | "female";
type ProteinLevel = "verylow" | "low" | "medium" | "high";
type TrainingStatus = "novice" | "inter" | "adv";
type BodyfatCategory = "cp" | "ath" | "avg" | "ov" | "ob";


interface MyData {
  goal: Goal;
  sex: Sex;
  bw: string;
  bf: string;
  steps: string;
  protein: ProteinLevel;
  min: string;
  days: string;
  status: TrainingStatus;
}

type DataKeys = keyof MyData;

interface ErrorState {
  [key: string]: string | undefined;
}

interface ProgressBarProps {
  current: number;
  total: number;
  textPrimaryColor: string;
  textSecondaryColor: string;
  accentColor: string;
  trackColor: string;
}

interface PieLabelRenderProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  index?: number;
  name: string;
  value: number;
  // Add other props if used from the callback
}


/****************************
* Sabitler & Yardımcılar
***************************/
const format = (v: number | unknown, d: number = 0): string =>
  typeof v !== "number" || isNaN(v)
    ? "-"
    : v.toLocaleString("tr-TR", {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    });

const rngErr = (min: number, max: number, s: string | number): string => {
  if (s === "" || s === "-") return "";
  const v = parseFloat(String(s).replace(/,/g, "."));
  if (isNaN(v)) return "Geçersiz sayı";
  return v < min || v > max ? `Aralık: ${min}-${max}` : "";
};

const getMaxWeeklyLossRate = (category: BodyfatCategory): number | null => {
  switch (category) {
    case "cp": return 0.5;
    case "ath": return 0.7;
    case "avg": return 1.0;
    case "ov": return 1.5;
    case "ob": return null;
    default:
      const exhaustiveCheck: never = category; // Ensures all cases are handled
      // console.error("Unhandled category in getMaxWeeklyLossRate:", exhaustiveCheck); // For debugging
      return 1.0; // Fallback, though ideally never reached with proper typing
  }
};

const getWeeklyGainRateRange = (status: TrainingStatus): { min: number; max: number } | null => {
  switch (status) {
    case "novice": return { min: 0.5, max: 1.0 };
    case "inter": return { min: 0.2, max: 0.5 };
    case "adv": return null;
    default:
      const exhaustiveCheck: never = status; // Ensures all cases are handled
      // console.error("Unhandled status in getWeeklyGainRateRange:", exhaustiveCheck); // For debugging
      return { min: 0.2, max: 0.5 }; // Fallback, though ideally never reached
  }
};

/****************************
* Progress Bar Bileşeni
****************************/
const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, textPrimaryColor, textSecondaryColor, accentColor, trackColor }) => {
  const progressPercentage = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="my-6 sm:my-8">
      <div className="flex justify-between items-center mb-1.5">
        <span style={{ color: textSecondaryColor }} className="text-xs sm:text-sm font-medium">
          {TR.progressBarStep} {current} / {total}
        </span>
        <span style={{ color: textPrimaryColor }} className="text-xs sm:text-sm font-bold">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      <div className="w-full h-2.5 sm:h-3 rounded-full" style={{ backgroundColor: trackColor }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: accentColor,
            transition: "width 0.4s ease-in-out",
          }}
        />
      </div>
    </div>
  );
};


/****************************
* Ana Bileşen
***************************/
export default function EnergyIntakeWizard() {
  /* ----- Durum ----- */
  const [step, setStep] = useState<Step>(0); // Used Step type here
  const [show, setShow] = useState<boolean>(true);
  const [load, setLoad] = useState<boolean>(false);
  const [p, setP] = useState<number>(0);
  const [loadMsg, setLoadMsg] = useState<string>("Hesaplanıyor…");

  const [data, setData] = useState<MyData>({
    goal: "cut",
    sex: "male",
    bw: "80",
    bf: "20",
    steps: "6000",
    protein: "medium",
    min: "60",
    days: "4",
    status: "novice",
  });
  const [err, setErr] = useState<ErrorState>({});

  const num = useCallback(
    (k: DataKeys, d: number = 0): number => {
      const val = data[k];
      const v = parseFloat(String(val).replace(/,/g, "."));
      return isNaN(v) ? d : v;
    },
    [data],
  );

  /* ----- Yardımcı Dönüşümler ----- */
  const paFactor = useMemo(() => {
    const stepsVal = num("steps", 6000);
    if (stepsVal < 5000) return 1.1;
    if (stepsVal < 8000) return 1.2;
    if (stepsVal < 12000) return 1.3;
    return 1.4;
  }, [num]); // Removed data.steps as num already depends on data and k is "steps"

  const tefFactor = useMemo(() => {
    switch (data.protein) {
      case "verylow": return 1.05;
      case "low": return 1.1;
      case "medium": return 1.15;
      case "high": default: return 1.2;
    }
  }, [data.protein]);

  /* ----- Hesap ----- */
  const calc = useMemo(() => {
    const bwVal = num("bw", 80);
    const bfVal = num("bf", 20);
    const minVal = num("min", 60);
    const daysVal = num("days", 4);

    const lm = bwVal * (1 - bfVal / 100);
    const bmr = 370 + 21.6 * lm;
    const neat = bmr * (paFactor - 1);
    const rt = 0.1 * bwVal * minVal;

    const tefOnTrainingDayActivity = (bmr * paFactor + rt) * (tefFactor - 1);
    const tefOnRestDayActivity = (bmr * paFactor) * (tefFactor - 1);

    const tdeeTrainingDay = bmr + neat + rt + tefOnTrainingDayActivity;
    const tdeeRestDay = bmr + neat + tefOnRestDayActivity;

    const dTrain = Math.max(0, Math.min(7, daysVal));
    const maint = (dTrain * tdeeTrainingDay + (7 - dTrain) * tdeeRestDay) / 7;


    const male = data.sex === "male";
    let deficit = 0;
    let surplus = 0;

    const getCat = (): BodyfatCategory => {
      if (male) {
        if (bfVal < 8) return "cp";
        if (bfVal <= 15) return "ath";
        if (bfVal <= 21) return "avg";
        if (bfVal <= 26) return "ov";
        return "ob";
      }
      if (bfVal < 14) return "cp";
      if (bfVal <= 24) return "ath";
      if (bfVal <= 33) return "avg";
      if (bfVal <= 39) return "ov";
      return "ob";
    };

    const cat = getCat();

    if (data.goal === "cut") {
      const ranges: Record<BodyfatCategory, [number, number]> = {
        cp: [0.025, 0.075], ath: [0.05, 0.25], avg: [0.2, 0.35],
        ov: [0.3, 0.5], ob: [0.5, 0.5],
      };
      const rangePair = ranges[cat]; // To help TS infer
      if (rangePair) {
        const [lo, hi] = rangePair;
        deficit = (lo + hi) / 2;
      }
    } else { // Bulk
      const rangesBulk: Partial<Record<TrainingStatus, number>> = { // Use Partial if not all statuses guarantee a value
        novice: 0.10, inter: 0.05, adv: 0.025,
      };
      const surplusValue = rangesBulk[data.status];
      if (typeof surplusValue === 'number') {
        surplus = surplusValue;
      } else if (data.status === 'adv') { // Specific handling for adv if it can be null/undefined from ranges
        surplus = 0.025; // Default or from logic
      }
    }

    const ebf = data.goal === "cut" ? 1 - deficit : 1 + surplus;

    const targetTrain = tdeeTrainingDay * ebf;
    const targetRest = tdeeRestDay * ebf;
    const targetAvg = (targetTrain * dTrain + targetRest * (7 - dTrain)) / 7;


    return {
      lm, fm: bwVal - lm, maint, tdeeTrainingDay, tdeeRestDay, cat,
      targetTrain, targetRest, targetAvg, deficitPerc: deficit, surplusPerc: surplus,
      comp: {
        bmr, neat, rt,
        avgTef: (dTrain * tefOnTrainingDayActivity + (7 - dTrain) * tefOnRestDayActivity) / 7,
        dTrain
      },
    };
  }, [num, paFactor, tefFactor, data]);

  /* ----- Doğrulama & Handler ----- */
  const setVal = (k: DataKeys, v: string, min: number, max: number) => {
    // For `status`, `protein`, `goal`, `sex` v should align with their respective literal types
    // This is a simplification; a more robust `setVal` might use a type assertion or a switch on `k`
    setData((prev) => ({ ...prev, [k]: v as any }));
    setErr((e) => ({ ...e, [k]: rngErr(min, max, v) }));
  };

  const next = useCallback(() => {
    const stepKeyList: string[] = [ // Can be string[] if currentKey is checked carefully
      "goal", "sex", "bw", "bf", "steps", "protein", "min", "days", "status",
    ];
    const currentKey: string | undefined = stepKeyList[step - 1];
    if (currentKey && err[currentKey as keyof ErrorState]) return; // Assert keyof

    let nextStepValue = step + 1;
    if (nextStepValue === 9 && data.goal === "cut") nextStepValue = 10;

    if (nextStepValue === 10) {
      setLoad(true);
      setP(0);
    }

    setShow(false);
    setTimeout(() => {
      setStep(nextStepValue as Step); // Asserting that nextStepValue will be a valid Step
      setShow(true);
    }, 300);
  }, [step, err, data.goal]);

  const back = () => {
    if (step === 0) return;
    let prevStepValue = step - 1;
    if (step === 10 && data.goal === "cut") prevStepValue = 8;
    else if (prevStepValue === 9 && data.goal === "cut") prevStepValue = 8;

    setShow(false);
    setTimeout(() => {
      setStep(prevStepValue as Step); // Asserting that prevStepValue will be a valid Step
      setShow(true);
    }, 300);
  };

  const reset = () => {
    setShow(false);
    setTimeout(() => {
      setStep(0 as Step); // Explicitly 0 is a Step
      setData({
        goal: "cut", sex: "male", bw: "80", bf: "20",
        steps: "6000", protein: "medium", min: "60",
        days: "4", status: "novice",
      });
      setErr({});
      setLoad(false);
      setP(0);
      setShow(true);
    }, 300);
  };

  /* ----- Yükleme efekti ----- */
  useEffect(() => {
    if (!load) return;
    const dur = 4000;
    const st = Date.now();
    const intId = setInterval(() => {
      const pr = Math.min(100, ((Date.now() - st) / dur) * 100);
      setP(pr);
      setLoadMsg(pr < 33 ? "Veriler işleniyor…" : pr < 66 ? "Grafikler hazırlanıyor…" : "Rapor oluşturuluyor…");
      if (pr >= 100) {
        clearInterval(intId);
        setShow(false);
        setTimeout(() => {
          setLoad(false);
          setStep(11 as Step); // 11 is a Step
          setShow(true);
        }, 300);
      }
    }, 40);
    return () => clearInterval(intId);
  }, [load]);

  const totalInteractiveSteps = useMemo(() => (data.goal === "bulk" ? 9 : 8), [data.goal]);


  /* ----- UI Step rendering ----- */
  const renderStep = (): ReactNode => {
    if (step === 0)
      return (
        <div className="text-center py-16">
          <h2 className="text-3xl font-bold mb-8" style={{ color: PALETTE.ACCENT }}>{TR.welcomeTitle}</h2>
          <p className="mb-10 text-lg" style={{ color: PALETTE.TEXT_SECONDARY }}>{TR.welcomeText}</p>
          <button onClick={next} className="px-10 py-4 text-lg bg-[#c2a57a] hover:bg-[#d1b891] text-[#003153] font-bold rounded-lg shadow-md flex items-center justify-center mx-auto">
            {TR.startButton} <ArrowRight className="ml-3 h-6 w-6" />
          </button>
        </div>
      );

    if (step === 1)
      return (
        <div className="py-10">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: PALETTE.ACCENT }}>{TR.goalTitle}</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-10 mb-6">
            {[
              { k: "cut" as Goal, label: TR.goalCut, icon: <ChevronDown size={48} /> },
              { k: "bulk" as Goal, label: TR.goalBulk, icon: <ChevronUp size={48} /> },
            ].map((o) => (
              <div
                key={o.k}
                onClick={() => { setData((prev) => ({ ...prev, goal: o.k })); next(); }}
                className={`p-8 rounded-lg border-2 cursor-pointer transition w-full sm:w-auto ${data.goal === o.k ? `border-[${PALETTE.ACCENT}] ring-2 ring-[${PALETTE.ACCENT}]` : `border-[${PALETTE.BORDER_COLOR}] hover:border-[${PALETTE.ACCENT_HOVER}]`}`}
                style={{ background: PALETTE.CARD_BACKGROUND }}
              >
                <div className="flex justify-center" style={{ color: data.goal === o.k ? PALETTE.ACCENT : PALETTE.TEXT_SECONDARY }}>{o.icon}</div>
                <p className="mt-3 text-center font-semibold" style={{ color: data.goal === o.k ? PALETTE.ACCENT : PALETTE.TEXT_SECONDARY }}>{o.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-center" style={{ color: PALETTE.TEXT_SECONDARY }}>{TR.helpGoal}</p>
        </div>
      );

    if (step === 2)
      return (
        <div className="py-10">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: PALETTE.ACCENT }}>{TR.stepSex}</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 mb-6">
            {[
              { k: "male" as Sex, label: TR.genderMale, icon: <svg width="64" height="64" viewBox="0 0 24 24" stroke={data.sex === "male" ? PALETTE.ACCENT : PALETTE.TEXT_SECONDARY} strokeWidth="1.5" fill="none"><circle cx="10" cy="14" r="5" /><path d="M19 5l-5.5 5.5" /><path d="M15 3h6v6" /></svg> },
              { k: "female" as Sex, label: TR.genderFemale, icon: <svg width="64" height="64" viewBox="0 0 24 24" stroke={data.sex === "female" ? PALETTE.ACCENT : PALETTE.TEXT_SECONDARY} strokeWidth="1.5" fill="none"><circle cx="12" cy="8" r="5" /><line x1="12" y1="13" x2="12" y2="21" /><line x1="9" y1="18" x2="15" y2="18" /></svg> },
            ].map((o) => (
              <div
                key={o.k}
                onClick={() => { setData((prev) => ({ ...prev, sex: o.k })); next(); }}
                className={`p-8 rounded-lg border-2 cursor-pointer transition w-full sm:w-auto ${data.sex === o.k ? `border-[${PALETTE.ACCENT}] ring-2 ring-[${PALETTE.ACCENT}]` : `border-[${PALETTE.BORDER_COLOR}] hover:border-[${PALETTE.ACCENT_HOVER}]`}`}
                style={{ background: PALETTE.CARD_BACKGROUND }}
              >
                {o.icon}
                <p className="mt-3 text-center font-semibold" style={{ color: data.sex === o.k ? PALETTE.ACCENT : PALETTE.TEXT_SECONDARY }}>{o.label}</p>
              </div>
            ))}
          </div>
        </div>
      );

    const inputStep = (
      key: DataKeys, title: string, unit: string, min: number, max: number,
      placeholder: string, help: string, type: string = "number"
    ) => (
      <div className="py-10 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: PALETTE.ACCENT }}>{title}</h2>
        <input
          type={type}
          inputMode={type === "number" ? "decimal" : "text"}
          value={data[key]}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setVal(key, e.target.value, min, max)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && !err[key as keyof ErrorState] && next()}
          placeholder={placeholder}
          className={`w-full px-4 py-3 text-lg rounded-lg outline-none transition border ${err[key as keyof ErrorState] ? `border-[${PALETTE.ERROR_COLOR}] ring-1 ring-[${PALETTE.ERROR_COLOR}]` : `border-[${PALETTE.BORDER_COLOR}] focus:border-[${PALETTE.ACCENT}] focus:ring-1 focus:ring-[${PALETTE.ACCENT}]`}`}
          style={{ background: PALETTE.CARD_BACKGROUND, color: PALETTE.TEXT_PRIMARY }}
        />
        {err[key as keyof ErrorState] && <p className="text-center mt-2" style={{ color: PALETTE.ERROR_COLOR }}>{err[key as keyof ErrorState]}</p>}
        <p className="text-xs text-center mt-3" dangerouslySetInnerHTML={{ __html: help }} style={{ color: PALETTE.TEXT_SECONDARY }} />
        <p className="text-xs text-center mt-2" style={{ color: PALETTE.TEXT_SECONDARY }}>{TR.enterHint}</p>
      </div>
    );

    if (step === 3) return inputStep("bw", TR.stepBW, "kg", 30, 200, "80", TR.helpBW);
    if (step === 4) return inputStep("bf", TR.stepBF, "%", 3, 60, "20", TR.helpBF);
    if (step === 5) return inputStep("steps", TR.stepSteps, "adım", 0, 50000, "6000", TR.helpSteps);

    if (step === 6)
      return (
        <div className="py-10">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: PALETTE.ACCENT }}>{TR.stepProtein}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-6">
            {TR.proteinLevels.map((o) => (
              <div
                key={o.k}
                onClick={() => { setData((prev) => ({ ...prev, protein: o.k as ProteinLevel })); next(); }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition text-center ${data.protein === o.k ? `border-[${PALETTE.ACCENT}] ring-2 ring-[${PALETTE.ACCENT}]` : `border-[${PALETTE.BORDER_COLOR}] hover:border-[${PALETTE.ACCENT_HOVER}]`}`}
                style={{ background: PALETTE.CARD_BACKGROUND, color: data.protein === o.k ? PALETTE.ACCENT : PALETTE.TEXT_SECONDARY }}
              >
                {o.label}
              </div>
            ))}
          </div>
          <p className="text-xs text-center" style={{ color: PALETTE.TEXT_SECONDARY }}>{TR.helpProtein}</p>
        </div>
      );

    if (step === 7) return inputStep("min", TR.stepMin, "dk", 0, 300, "60", TR.helpMin);
    if (step === 8) return inputStep("days", TR.stepDays, "gün", 0, 7, "4", TR.helpDays);

    if (step === 9 && data.goal === "bulk")
      return (
        <div className="py-10">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: PALETTE.ACCENT }}>{TR.stepTrainStatus}</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-10 mb-6">
            {[
              { k: "novice" as TrainingStatus, label: TR.statusNovice },
              { k: "inter" as TrainingStatus, label: TR.statusInter },
              { k: "adv" as TrainingStatus, label: TR.statusAdv },
            ].map((o) => (
              <div
                key={o.k}
                onClick={() => { setData((prev) => ({ ...prev, status: o.k })); next(); }}
                className={`px-6 py-4 rounded-lg border-2 cursor-pointer transition w-full sm:w-auto text-center ${data.status === o.k ? `border-[${PALETTE.ACCENT}] ring-2 ring-[${PALETTE.ACCENT}]` : `border-[${PALETTE.BORDER_COLOR}] hover:border-[${PALETTE.ACCENT_HOVER}]`}`}
                style={{ background: PALETTE.CARD_BACKGROUND, color: data.status === o.k ? PALETTE.ACCENT : PALETTE.TEXT_SECONDARY }}
              >
                {o.label}
              </div>
            ))}
          </div>
          <p className="text-xs text-center" style={{ color: PALETTE.TEXT_SECONDARY }}>{TR.helpTrainStatus}</p>
        </div>
      );

    if (step === 10) {
      return (
        <div className="text-center py-24">
          <div className="relative inline-block mb-8">
            <Loader2 className="h-20 w-20 mx-auto animate-spin" style={{ color: PALETTE.ACCENT }} />
            <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold" style={{ color: PALETTE.TEXT_PRIMARY }}>{p.toFixed(0)}%</div>
          </div>
          <p className="text-xl font-semibold" style={{ color: PALETTE.TEXT_SECONDARY }}>{loadMsg}</p>
        </div>
      );
    }

    if (step === 11) {
      const {
        maint, tdeeTrainingDay, tdeeRestDay, targetAvg, targetTrain, targetRest,
        deficitPerc, surplusPerc, cat, comp
      } = calc;
      const isCut = data.goal === "cut";

      let guidanceText = "";
      if (isCut) {
        const currentCatMaxLoss = getMaxWeeklyLossRate(cat);
        if (cat === "ob") {
          guidanceText = TR.guidanceObeseCut;
        } else {
          guidanceText = `Tavsiye edilen enerji açığı: %${(deficitPerc * 100).toFixed(0)}.\nÖnerilen maksimum haftalık kilo kaybı: %${currentCatMaxLoss ? currentCatMaxLoss.toFixed(1) : 'N/A'} (vücut ağırlığının).\nBu orandan daha fazla kaybediyorsanız, enerji açığınızı azaltmanız (kalori alımınızı artırmanız) önerilir.`;
        }
      } else { // Bulk
        const currentStatusGainRange = getWeeklyGainRateRange(data.status);
        if (data.status === "adv" && !currentStatusGainRange) {
          guidanceText = TR.guidanceAdvancedBulk;
        } else if (currentStatusGainRange) {
          guidanceText = `Tavsiye edilen enerji fazlası: %${(surplusPerc * 100).toFixed(1)}.\nPlanlanan haftalık kilo artış aralığı: %${currentStatusGainRange.min.toFixed(1)} - %${currentStatusGainRange.max.toFixed(1)} (vücut ağırlığının).\nBu aralığın altında kalıyorsanız enerji fazlanızı artırmanız, üzerine çıkıyorsanız azaltmanız önerilir.`;
        } else {
          guidanceText = TR.guidanceAdvancedBulk; // Fallback for adv or other unexpected nulls
        }
      }

      const totalEnergyForPie = comp.bmr + comp.neat + comp.rt + comp.avgTef;
      const pieData = [
        { name: "BMR", value: comp.bmr },
        { name: "NEAT", value: comp.neat },
        ...(comp.dTrain > 0 && comp.rt > 0 ? [{ name: "Egzersiz (RT)", value: comp.rt }] : []), // Ensure RT is > 0
        { name: "TEF", value: comp.avgTef },
      ].filter(item => typeof item.value === 'number' && item.value > 0);

      return (
        <div className="py-8">
          <section className="mb-10 text-center">
            <h2 className="text-3xl font-bold mb-6" style={{ color: PALETTE.ACCENT }}>{TR.resultsTitle}</h2>
            <p className="text-sm mb-6 max-w-2xl mx-auto" style={{ color: PALETTE.TEXT_SECONDARY }} dangerouslySetInnerHTML={{ __html: TR.disclaimer }} />
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4" style={{ color: PALETTE.ACCENT }}>{TR.reportSubheadingTDEE}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {[
                  { title: TR.reportLabelAverage, v: maint },
                  { title: TR.reportLabelTrainingDays, v: tdeeTrainingDay },
                  { title: TR.reportLabelRestDays, v: tdeeRestDay },
                ].map((item) => (
                  <div key={item.title} className="p-4 rounded-lg border text-center" style={{ background: PALETTE.CARD_BACKGROUND, borderColor: PALETTE.BORDER_COLOR }}>
                    <h4 className="text-xs mb-1 uppercase tracking-wider" style={{ color: PALETTE.TEXT_SECONDARY }}>{item.title}</h4>
                    <p className="text-2xl font-bold" style={{ color: PALETTE.ACCENT }}>
                      {format(item.v, 0)} <span className="text-sm">kcal</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4" style={{ color: PALETTE.SUCCESS_COLOR }}>{TR.reportSubheadingTarget}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {[
                  { title: TR.reportLabelAverage, v: targetAvg },
                  { title: TR.reportLabelTrainingDays, v: targetTrain },
                  { title: TR.reportLabelRestDays, v: targetRest },
                ].map((item) => (
                  <div key={item.title} className="p-4 rounded-lg border text-center" style={{ background: PALETTE.CARD_BACKGROUND, borderColor: PALETTE.BORDER_COLOR }}>
                    <h4 className="text-xs mb-1 uppercase tracking-wider" style={{ color: PALETTE.TEXT_SECONDARY }}>{item.title}</h4>
                    <p className="text-2xl font-bold" style={{ color: PALETTE.SUCCESS_COLOR }}>
                      {format(item.v, 0)} <span className="text-sm">kcal</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm max-w-xl mx-auto whitespace-pre-line" style={{ color: PALETTE.TEXT_SECONDARY }}>
              {guidanceText}
            </p>
          </section>
          {pieData.length > 0 && (
          <section className="my-10 py-8 rounded-xl border" style={{ background: PALETTE.CARD_BACKGROUND, borderColor: PALETTE.BORDER_COLOR }}>
            <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: PALETTE.ACCENT }}>
              {TR.resultsComparisonTitle}
            </h2>
            <div style={{ width: "100%", height: 380 }} className="max-w-md mx-auto">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={50}
                    fill={PALETTE.ACCENT}
                    labelLine={false}
                    label={(props: PieLabelRenderProps) => {
                      const { name, value } = props;
                      const displayPercent = totalEnergyForPie > 0 && value > 0 ? (value / totalEnergyForPie * 100) : 0;
                      return `${name}: ${displayPercent.toFixed(0)}%`;
                    }}
                  >
                    {PALETTE.CHART_COLORS.slice(0, pieData.length).map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} stroke={PALETTE.CARD_BACKGROUND} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: ValueType, name: NameType, item: Payload<ValueType, NameType>) => { // item is Payload
                      const percentage = totalEnergyForPie > 0 && typeof value === 'number' ? (value / totalEnergyForPie * 100) : 0;
                      return [`${format(value as number, 0)} kcal (${percentage.toFixed(0)}%)`, name] as [ReactNode, NameType];
                    }}
                    contentStyle={{ backgroundColor: PALETTE.CARD_BACKGROUND, borderColor: PALETTE.BORDER_COLOR, borderRadius: '0.5rem' }}
                    itemStyle={{ color: PALETTE.TEXT_PRIMARY }}
                    cursor={{ fill: 'transparent' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
          )}
          <section className="mb-12 text-center p-8 rounded-lg border" style={{ borderColor: PALETTE.ACCENT, background: PALETTE.CARD_BACKGROUND }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: PALETTE.ACCENT }}>{TR.ctaTitle}</h3>
            <p className="mb-2" style={{ color: PALETTE.TEXT_SECONDARY }}>{TR.ctaTextP1}</p>
            <p className="mb-6" style={{ color: PALETTE.TEXT_SECONDARY }}>{TR.ctaTextP2}</p>
            <a href="https://forms.gle/eQxaeiMxo6PUNzQR9" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-8 py-3 text-lg bg-[#c2a57a] hover:bg-[#d1b891] text-[#003153] font-bold rounded-lg shadow-md">
              <Mail className="mr-2 h-5 w-5" /> {TR.ctaButton}
            </a>
          </section>
          <div className="text-center">
            <button onClick={reset} className="px-8 py-3 text-lg bg-[#1A1A1A] hover:bg-[#333333] text-[#F8F8F8] font-semibold rounded-lg border border-[#333366]">
              {TR.calculateAgainButton}
            </button>
          </div>
        </div>
      );
    }
    return <div />;
  };

  /* ----- Ana render ----- */
  return (
    <div className="w-full min-h-dvh p-4 sm:p-8 lg:p-12 font-sans flex flex-col relative pb-24" style={{ background: PALETTE.BACKGROUND, color: PALETTE.TEXT_PRIMARY }}>
      <div className="relative text-center mb-6 sm:mb-10 flex-shrink-0">
        <a
          href="https://atlasakin.com"
          title="Anasayfa"
          className="absolute top-0 left-0 -mt-1 sm:-mt-2 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-[#333366] transition"
          style={{ background: PALETTE.CARD_BACKGROUND, border: `1px solid ${PALETTE.BORDER_COLOR}`, color: PALETTE.TEXT_SECONDARY }}>
          <Home size={18} /> {/* Removed sm prop */}
        </a>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ color: PALETTE.ACCENT }}>{TR.estimatorTitle}</h1>
        <div className="absolute top-0 right-0 -mt-1 sm:-mt-2 h-full flex items-start group">
          <span className="cursor-help rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm font-bold" style={{ background: PALETTE.CARD_BACKGROUND, color: PALETTE.TEXT_SECONDARY, border: `1px solid ${PALETTE.BORDER_COLOR}` }}>
            <Info size={18} /> {/* Removed sm prop */}
          </span>
          <div className="absolute top-full right-0 mt-2 w-72 p-4 rounded-lg shadow-xl text-left text-xs z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: PALETTE.CARD_BACKGROUND, border: `1px solid ${PALETTE.BORDER_COLOR}` }}>
            <p className="font-semibold mb-2" style={{ color: PALETTE.ACCENT }}>{TR.infoTitle}</p>
            <p style={{ color: PALETTE.TEXT_SECONDARY }} dangerouslySetInnerHTML={{ __html: TR.infoDisclaimer }} />
          </div>
        </div>
      </div>

      {step > 0 && step <= totalInteractiveSteps && (
        <ProgressBar
          current={step}
          total={totalInteractiveSteps}
          textPrimaryColor={PALETTE.TEXT_PRIMARY}
          textSecondaryColor={PALETTE.TEXT_SECONDARY}
          accentColor={PALETTE.ACCENT}
          trackColor={PALETTE.PROGRESS_BAR_TRACK}
        />
      )}

      <div className={`flex-grow transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`}>{renderStep()}</div>

      {step > 0 && step < 10 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-10 mb-16 flex-shrink-0">
          <button
            onClick={back}
            disabled={step === 0}
            className="w-full sm:w-auto px-8 py-3 text-lg bg-[#1A1A1A] hover:bg-[#333333] text-[#F8F8F8] font-semibold rounded-lg border border-[#333366] flex items-center justify-center">
            <ArrowLeft className="mr-2 h-6 w-6" /> {TR.backButton}
          </button>
          <button
            onClick={next}
            disabled={Object.values(err).some(e => !!e) || (step === 9 && data.goal === 'bulk' && !data.status)}
            className="w-full sm:w-auto px-8 py-3 text-lg font-bold rounded-lg shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: PALETTE.ACCENT, color: "#003153" }}>
            {TR.nextButton} <ArrowRight className="ml-2 h-6 w-6" />
          </button>
        </div>
      )}

      <a href="https://www.instagram.com/atlasakin/" target="_blank" rel="noopener noreferrer" className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 text-[#A9A9A9] hover:text-[#c2a57a] transition z-10">
        <Instagram size={28} />
      </a>
    </div>
  );
}
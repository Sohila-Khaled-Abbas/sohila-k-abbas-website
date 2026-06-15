import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Building2, Database, FileText, DollarSign, 
  Send, ChevronRight, ChevronLeft, Check, Sparkles, Globe 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ─── Content Translations ─────────────────────────────────────
const content = {
  en: {
    title: "Data & BI Project Inquiry",
    desc: "Partner with me to build scalable, decision-ready data architectures.",
    stepNames: ["Identity", "Data Environment", "Project Scope", "Logistics"],
    lblName: "Full Name & Job Title *",
    lblEmail: "Work Email Address *",
    lblCompany: "Company Name & Industry",
    lblDataLoc: "Where does your data currently reside?",
    chkSheet: "Spreadsheets (Excel / Google Sheets)",
    chkDb: "Relational DBs / Cloud ERPs (SQL, Salesforce, etc.)",
    lblProblem: "Describe the core business problem you are trying to solve: *",
    lblBudget: "Estimated Budget Range",
    btnSubmit: "Submit Inquiry",
    btnProcessing: "Processing...",
    btnNext: "Next Step",
    btnBack: "Back",
    errValidation: "Please fill in all required fields correctly.",
    errNetwork: "Failed to submit. Please check your connection and try again.",
    succTitle: "Inquiry Received",
    succDesc: "Thank you for reaching out! I will review your project details and get back to you within 24-48 hours.",
    btnAnother: "Submit another inquiry",
    requiredLabel: "required",
    budgetOptions: [
      { val: "$500 - $1,500", label: "$500 - $1,500", desc: "Small-scale dashboard or schema design" },
      { val: "$1,500 - $5,000", label: "$1,500 - $5,000", desc: "End-to-end BI development & pipeline" },
      { val: "$5,000+", label: "$5,000+", desc: "Enterprise data platform & architecture" }
    ]
  },
  ar: {
    title: "طلب استشارة وبناء أنظمة بيانات",
    desc: "شاركني لبناء بنية تحتية قوية وجاهزة لاتخاذ القرارات لبياناتك.",
    stepNames: ["بيانات العميل", "بيئة البيانات", "نطاق المشروع", "التفاصيل اللوجستية"],
    lblName: "الاسم بالكامل والمسمى الوظيفي *",
    lblEmail: "البريد الإلكتروني للعمل *",
    lblCompany: "اسم الشركة ومجال العمل",
    lblDataLoc: "أين تحتفظ ببياناتك حالياً؟",
    chkSheet: "جداول البيانات (Excel / Google Sheets)",
    chkDb: "قواعد البيانات أو الأنظمة السحابية (SQL / ERP)",
    lblProblem: "صف المشكلة الأساسية التي تواجهها في تحليل بياناتك: *",
    lblBudget: "الميزانية التقديرية للمشروع",
    btnSubmit: "إرسال الطلب",
    btnProcessing: "جاري الإرسال...",
    btnNext: "الخطوة التالية",
    btnBack: "السابق",
    errValidation: "يرجى ملء الحقول المطلوبة بشكل صحيح.",
    errNetwork: "فشل الإرسال. يرجى التحقق من الاتصال والمحاولة مرة أخرى.",
    succTitle: "تم استلام طلبك بنجاح",
    succDesc: "شكراً لك. سأقوم بمراجعة التفاصيل والتواصل معك خلال ٢٤ إلى ٤٨ ساعة.",
    btnAnother: "إرسال طلب آخر",
    requiredLabel: "مطلوب",
    budgetOptions: [
      { val: "1000 - 5000 EGP", label: "١,٠٠٠ - ٥,٠٠٠ ج.م", desc: "تصميم تقرير أو لوحة بيانات بسيطة" },
      { val: "5000 - 15000 EGP", label: "٥,٠٠٠ - ١٥,٠٠٠ ج.م", desc: "تطوير لوحات تحكم متكاملة وربط مصادر البيانات" },
      { val: "15000+ EGP", label: "أكثر من ١٥,٠٠٠ ج.م", desc: "بناء مستودعات بيانات وهندسة بنية تحتية متكاملة" }
    ]
  }
};

const LIMITS = { fullName: 100, email: 255, company: 200, problem: 3000, budget: 50 };

export default function IntakeForm() {
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzoGEjhGmeppcE31Us5U2xVd8fJah4ZiobkhDSZvBpHnRpmHB9kEfRosdMKcA4Jibse/exec';
  const { toast } = useToast();

  const [lang, setLang] = useState('en');
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    dataLocation: [] as string[],
    problem: '',
    budget: ''
  });

  const t = content[lang as keyof typeof content];
  const isRTL = lang === 'ar';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCheckboxToggle = (value: string) => {
    setFormData((prev) => {
      const isSelected = prev.dataLocation.includes(value);
      return {
        ...prev,
        dataLocation: isSelected
          ? prev.dataLocation.filter((item) => item !== value)
          : [...prev.dataLocation, value]
      };
    });
  };

  const selectBudget = (value: string) => {
    setFormData((prev) => ({ ...prev, budget: value }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 0) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = lang === 'en' ? 'Full name is required' : 'الاسم بالكامل مطلوب';
      } else if (formData.fullName.length > LIMITS.fullName) {
        newErrors.fullName = lang === 'en' ? `Max ${LIMITS.fullName} characters` : `الحد الأقصى ${LIMITS.fullName} حرفاً`;
      }

      if (!formData.email.trim()) {
        newErrors.email = lang === 'en' ? 'Email address is required' : 'البريد الإلكتروني مطلوب';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = lang === 'en' ? 'Invalid email format' : 'صيغة البريد الإلكتروني غير صحيحة';
      } else if (formData.email.length > LIMITS.email) {
        newErrors.email = lang === 'en' ? `Max ${LIMITS.email} characters` : `الحد الأقصى ${LIMITS.email} حرفاً`;
      }

      if (formData.company.length > LIMITS.company) {
        newErrors.company = lang === 'en' ? `Max ${LIMITS.company} characters` : `الحد الأقصى ${LIMITS.company} حرفاً`;
      }
    }

    if (step === 2) {
      if (!formData.problem.trim()) {
        newErrors.problem = lang === 'en' ? 'Please describe your core problem' : 'يرجى وصف المشكلة الأساسية';
      } else if (formData.problem.length > LIMITS.problem) {
        newErrors.problem = lang === 'en' ? `Max ${LIMITS.problem} characters` : `الحد الأقصى ${LIMITS.problem} حرفاً`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    } else {
      toast({
        variant: "destructive",
        title: lang === 'en' ? "Validation Alert" : "تنبيه التحقق",
        description: t.errValidation
      });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(0) || !validateStep(2)) {
      toast({
        variant: "destructive",
        title: lang === 'en' ? "Validation Alert" : "تنبيه التحقق",
        description: t.errValidation
      });
      return;
    }

    setStatus('submitting');
    const payload = {
      ...formData,
      dataLocation: formData.dataLocation.join(', '),
      languagePreference: lang === 'en' ? 'English' : 'Arabic'
    };

    // ─── Dual Delivery Pipeline (Supabase + FormSubmit + Google Script) ───
    const dbPromise = supabase.from("intake_submissions").insert([{
      full_name: formData.fullName,
      email: formData.email,
      company: formData.company || null,
      data_location: formData.dataLocation,
      problem: formData.problem,
      budget: formData.budget || null,
      language_preference: lang === 'en' ? 'English' : 'Arabic',
      submitted_at: new Date().toISOString()
    }]);

    const emailPayload = {
      name: formData.fullName,
      email: formData.email,
      company: formData.company || "N/A",
      "Data Location": formData.dataLocation.join(", ") || "None selected",
      "Problem Description": formData.problem,
      "Budget Range": formData.budget || "Not specified",
      "Language Preference": lang === 'en' ? 'English' : 'Arabic',
      _subject: `New Project Inquiry from ${formData.fullName}`,
      _template: "table",
      _replyto: formData.email
    };

    const emailPromise = fetch("https://formsubmit.co/ajax/sohila.k.data@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailPayload)
    });

    const googleScriptPromise = fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    try {
      // We run all in parallel. Even if DB or Google Script fails, email should succeed (or vice-versa).
      const results = await Promise.allSettled([dbPromise, emailPromise, googleScriptPromise]);
      
      const emailSucceeded = results[1].status === 'fulfilled' && (results[1].value as Response).ok;
      const dbSucceeded = results[0].status === 'fulfilled' && !(results[0].value as any).error;

      if (emailSucceeded || dbSucceeded) {
        setStatus('success');
        toast({
          title: t.succTitle,
          description: t.succDesc
        });
      } else {
        throw new Error('All submission channels failed.');
      }
    } catch (error) {
      console.error('Submission Error:', error);
      setStatus('error');
      toast({
        variant: "destructive",
        title: lang === 'en' ? "Submission Error" : "خطأ في الإرسال",
        description: t.errNetwork
      });
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setCurrentStep(0);
    setFormData({
      fullName: '',
      email: '',
      company: '',
      dataLocation: [],
      problem: '',
      budget: ''
    });
    setErrors({});
  };

  // Custom motion transitions
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' }
    })
  };

  return (
    <div
      className="w-full py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden transition-all duration-300"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.25] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-accent/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/10 via-gold/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Language Selection Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4 text-accent animate-pulse" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {lang === 'en' ? 'Bilingual System' : 'نظام ثنائي اللغة'}
            </span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-full p-1 border border-border flex shadow-sm"
          >
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                lang === 'en' 
                  ? 'bg-accent text-accent-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang('ar')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                lang === 'ar' 
                  ? 'bg-accent text-accent-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              العربية
            </button>
          </motion.div>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-label mb-2"
          >
            {lang === 'en' ? 'COLLABORATE' : 'التعاون البرمجي'}
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-extrabold sm:text-4xl leading-tight"
          >
            <span className="gradient-text">{t.title}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base text-muted-foreground max-w-lg mx-auto"
          >
            {t.desc}
          </motion.p>
        </div>

        {/* Main Form Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden gradient-border neon-glow relative"
        >
          {status === 'success' ? (
            /* SUCCESS PANEL */
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-8 sm:p-12 text-center"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 border border-accent/20 mb-8 animate-bounce">
                <Check className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">{t.succTitle}</h3>
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed mb-8">{t.succDesc}</p>
              
              <button
                onClick={resetForm}
                className="btn-cta px-8 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {t.btnAnother}
              </button>
            </motion.div>
          ) : (
            /* FORM WIZARD */
            <div className="p-6 sm:p-10">
              
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3 text-xs font-semibold text-muted-foreground">
                  <span>
                    {lang === 'en' ? `Step ${currentStep + 1} of 4` : `الخطوة ${currentStep + 1} من ٤`}
                  </span>
                  <span className="text-accent uppercase tracking-wider">
                    {t.stepNames[currentStep]}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-border rounded-full overflow-hidden flex gap-1">
                  {[0, 1, 2, 3].map((stepIdx) => (
                    <div 
                      key={stepIdx}
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        stepIdx <= currentStep 
                          ? 'bg-gradient-to-r from-accent to-gold shadow-sm' 
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Form Content Steps */}
              <form onSubmit={handleSubmit} className="space-y-8 min-h-[300px] flex flex-col justify-between">
                <div>
                  <AnimatePresence mode="wait" custom={currentStep}>
                    <motion.div
                      key={currentStep}
                      custom={currentStep}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="space-y-6"
                    >
                      {/* STEP 1: IDENTITY */}
                      {currentStep === 0 && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 border-b border-border pb-3">
                            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                              <User className="h-5 w-5 text-accent" />
                            </div>
                            <h2 className="text-lg font-bold text-foreground">{t.stepNames[0]}</h2>
                          </div>

                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                              <label className="block text-sm font-semibold text-foreground mb-2">
                                {t.lblName}
                              </label>
                              <input 
                                type="text" 
                                name="fullName" 
                                required 
                                maxLength={LIMITS.fullName} 
                                value={formData.fullName} 
                                onChange={handleInputChange} 
                                className={`w-full bg-background border rounded-xl px-4 py-3 outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent ${
                                  errors.fullName ? 'border-destructive' : 'border-border'
                                }`}
                                placeholder={lang === 'en' ? 'John Doe — Operations Lead' : 'أحمد محمد — مدير العمليات'}
                              />
                              {errors.fullName && (
                                <p className="text-destructive text-xs mt-1 font-semibold">{errors.fullName}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-foreground mb-2">
                                {t.lblEmail}
                              </label>
                              <input 
                                type="email" 
                                name="email" 
                                required 
                                maxLength={LIMITS.email} 
                                value={formData.email} 
                                onChange={handleInputChange} 
                                className={`w-full bg-background border rounded-xl px-4 py-3 outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent ${
                                  errors.email ? 'border-destructive' : 'border-border'
                                }`}
                                placeholder="john@company.com"
                              />
                              {errors.email && (
                                <p className="text-destructive text-xs mt-1 font-semibold">{errors.email}</p>
                              )}
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-sm font-semibold text-foreground mb-2">
                                {t.lblCompany}
                              </label>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                                  {!isRTL && <Building2 className="h-5 w-5" />}
                                </span>
                                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-muted-foreground">
                                  {isRTL && <Building2 className="h-5 w-5" />}
                                </span>
                                <input 
                                  type="text" 
                                  name="company" 
                                  maxLength={LIMITS.company} 
                                  value={formData.company} 
                                  onChange={handleInputChange} 
                                  className={`w-full bg-background border border-border rounded-xl py-3 outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent ${
                                    isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'
                                  }`}
                                  placeholder={lang === 'en' ? 'Acme Corp — Logistics' : 'شركة النور — الخدمات اللوجستية'}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: DATA INFRASTRUCTURE */}
                      {currentStep === 1 && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 border-b border-border pb-3">
                            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                              <Database className="h-5 w-5 text-accent" />
                            </div>
                            <h2 className="text-lg font-bold text-foreground">{t.stepNames[1]}</h2>
                          </div>

                          <div className="space-y-4">
                            <p className="text-sm font-semibold text-muted-foreground mb-4">{t.lblDataLoc}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Option 1: Spreadsheets */}
                              <div 
                                onClick={() => handleCheckboxToggle('Spreadsheets')}
                                className={`border rounded-xl p-5 cursor-pointer flex items-start gap-4 transition-all duration-200 select-none ${
                                  formData.dataLocation.includes('Spreadsheets')
                                    ? 'bg-accent/5 border-accent shadow-md shadow-accent/5 scale-[1.01]'
                                    : 'bg-background border-border hover:border-accent/40'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${
                                  formData.dataLocation.includes('Spreadsheets')
                                    ? 'bg-accent border-accent text-accent-foreground'
                                    : 'border-border bg-background'
                                }`}>
                                  {formData.dataLocation.includes('Spreadsheets') && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                </div>
                                <div>
                                  <h3 className="font-bold text-sm text-foreground">{t.chkSheet}</h3>
                                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    {lang === 'en' 
                                      ? 'Files like Excel, Google Sheets, or CSV tables currently running core reports.'
                                      : 'ملفات مثل إكسل، جوجل شيتس، أو ملفات النصية التي يتم الاعتماد عليها حالياً.'}
                                  </p>
                                </div>
                              </div>

                              {/* Option 2: Databases */}
                              <div 
                                onClick={() => handleCheckboxToggle('Databases')}
                                className={`border rounded-xl p-5 cursor-pointer flex items-start gap-4 transition-all duration-200 select-none ${
                                  formData.dataLocation.includes('Databases')
                                    ? 'bg-accent/5 border-accent shadow-md shadow-accent/5 scale-[1.01]'
                                    : 'bg-background border-border hover:border-accent/40'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${
                                  formData.dataLocation.includes('Databases')
                                    ? 'bg-accent border-accent text-accent-foreground'
                                    : 'border-border bg-background'
                                }`}>
                                  {formData.dataLocation.includes('Databases') && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                </div>
                                <div>
                                  <h3 className="font-bold text-sm text-foreground">{t.chkDb}</h3>
                                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    {lang === 'en' 
                                      ? 'Structured platforms like Postgres, SQL Server, SAP, Oracle, HubSpot, or Salesforce.'
                                      : 'بيئات مهيكلة مثل قواعد بيانات SQL أو خدمات إدارة علاقات العملاء ونظم ERP.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: PROJECT SCOPE */}
                      {currentStep === 2 && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 border-b border-border pb-3">
                            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                              <FileText className="h-5 w-5 text-accent" />
                            </div>
                            <h2 className="text-lg font-bold text-foreground">{t.stepNames[2]}</h2>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                              {t.lblProblem}
                            </label>
                            <textarea 
                              name="problem" 
                              rows={5} 
                              required 
                              maxLength={LIMITS.problem} 
                              value={formData.problem} 
                              onChange={handleInputChange} 
                              className={`w-full bg-background border rounded-xl px-4 py-3 outline-none transition-all resize-none focus:border-accent focus:ring-1 focus:ring-accent ${
                                errors.problem ? 'border-destructive' : 'border-border'
                              }`}
                              placeholder={lang === 'en' 
                                ? "We have fragmented data across Salesforce and Excel, causing delay in daily sales pipeline reports. We need a clean dashboard..."
                                : "لدينا بيانات مشتتة بين نظام المبيعات وجداول إكسل مما يسبب تأخيراً في إعداد التقارير اليومية ونريد بناء لوحة بيانات موحدة..."
                              }
                            />
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-destructive text-xs font-semibold">{errors.problem || ''}</p>
                              <p className="text-[10px] text-muted-foreground font-semibold">
                                {formData.problem.length} / {LIMITS.problem}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 4: LOGISTICS & REVIEW */}
                      {currentStep === 3 && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 border-b border-border pb-3">
                            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                              <DollarSign className="h-5 w-5 text-accent" />
                            </div>
                            <h2 className="text-lg font-bold text-foreground">{t.stepNames[3]}</h2>
                          </div>

                          <div className="space-y-4">
                            <p className="text-sm font-semibold text-muted-foreground mb-3">{t.lblBudget}</p>
                            
                            <div className="grid grid-cols-1 gap-3">
                              {t.budgetOptions.map((opt) => (
                                <div
                                  key={opt.val}
                                  onClick={() => selectBudget(opt.val)}
                                  className={`border rounded-xl p-4 cursor-pointer flex items-center justify-between transition-all duration-200 ${
                                    formData.budget === opt.val
                                      ? 'bg-accent/5 border-accent shadow-md shadow-accent/5'
                                      : 'bg-background border-border hover:border-accent/40'
                                  }`}
                                >
                                  <div>
                                    <h3 className="font-bold text-sm text-foreground">{opt.label}</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                                  </div>
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    formData.budget === opt.val ? 'border-accent bg-accent text-accent-foreground' : 'border-border'
                                  }`}>
                                    {formData.budget === opt.val && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <div className="pt-6 border-t border-border flex justify-between items-center gap-4">
                  {/* Back button */}
                  {currentStep > 0 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-all inline-flex items-center gap-1.5"
                    >
                      {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                      {t.btnBack}
                    </button>
                  ) : (
                    <div />
                  )}

                  {/* Submit / Next Button */}
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-cta px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5"
                    >
                      {t.btnNext}
                      {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="btn-cta px-8 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === 'submitting' ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-accent-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t.btnProcessing}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          {t.btnSubmit}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>

            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}

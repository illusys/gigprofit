export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', flag: '🇸🇦' },
];

export const RTL_LANGUAGES = ['ar'];

const en = {
  // Landing
  landing_nav_signin: 'Sign in',
  landing_hero_head: 'Your gross pay',
  landing_hero_italic: "isn't your income.",
  landing_hero_sub:
    'GigsProfit calculates your real take-home pay after fuel, mileage at the IRS rate of $0.72 per mile, vehicle maintenance, and self-employment tax. DoorDash drivers earn $12.23 per hour on average gross — but real net pay after costs is 35–45% lower. GigsProfit shows you the actual number for every trip.',
  landing_cta_start: 'Start tracking for free',
  landing_signin_arrow: 'Sign in →',
  landing_stat1_value: '$0.72',
  landing_stat1_label: 'IRS mileage rate per mile (2026)',
  landing_stat2_value: '9',
  landing_stat2_label: 'cost categories tracked per trip',
  landing_stat3_value: '35–45%',
  landing_stat3_label: 'what expenses cut from gross pay',
  landing_problem_eyebrow: 'THE REAL MATH',
  landing_problem_head: "Apps show what you earned.\nWe show what you made.",
  landing_compare_gross: 'Gross earnings',
  landing_compare_real: 'Real take-home',
  landing_compare_note:
    'GridWise Analytics reports DoorDash drivers earn $12.23/hr gross. After costs, real take-home is often under $8/hr. GigsProfit shows your number.',
  landing_features_eyebrow: 'WHAT GIGSPROFIT DOES',
  landing_feature1_title: 'Real profit, not just earnings',
  landing_feature1_body:
    'Deducts fuel, depreciation, insurance, tires, oil, and maintenance on every trip.',
  landing_feature2_title: 'Compare every platform',
  landing_feature2_body:
    'Ranks Uber, Lyft, DoorDash, and more by actual net $/hr — not gross.',
  landing_feature3_title: 'Tax snapshot built in',
  landing_feature3_body:
    'Self-employment tax + IRS mileage deduction calculated automatically.',
  landing_feature4_title: 'AI profit coach',
  landing_feature4_body:
    'Claude AI gives you 2 specific actions to improve your numbers this week.',
  landing_testimonials_eyebrow: 'FROM DRIVERS USING IT',
  landing_testimonial1_quote:
    'I thought DoorDash was my best earner. Turns out Uber nets me $4 more per hour after costs.',
  landing_testimonial1_name: 'Marcus T.',
  landing_testimonial1_location: 'Dallas TX',
  landing_testimonial2_quote:
    'Found out my cost per mile was $0.94. I was barely breaking even on short trips. Now I decline anything under 4 miles.',
  landing_testimonial2_name: 'Priya S.',
  landing_testimonial2_location: 'Austin TX',
  landing_faq_eyebrow: 'QUESTIONS GIG DRIVERS ASK',
  landing_faq_head:
    'Real answers for Uber, DoorDash, Lyft, Instacart and Amazon Flex drivers',
  landing_faq1_q: 'Which gig platform pays the most after expenses?',
  landing_faq1_a:
    'It depends on your location and vehicle. Amazon Flex tends to yield high net pay because deliveries are batched. GigsProfit lets you compare real net dollars per hour across every platform so you can decide which shifts are actually worth it.',
  landing_faq2_q: 'What is the IRS mileage deduction for 2026?',
  landing_faq2_a:
    'The IRS standard mileage rate for 2026 is $0.72 per mile for business use. A driver who logs 25,000 miles per year deducts $18,000 — often wiping out most of the self-employment tax bill. GigsProfit tracks this automatically.',
  landing_faq3_q: 'How much do gig drivers pay in self-employment tax?',
  landing_faq3_a:
    "Gig drivers pay 15.3% self-employment tax on net profit — 12.4% Social Security and 2.9% Medicare. For a driver netting $2,000 per month, that's $306 per month in SE tax alone, before income tax. GigsProfit shows your running estimate.",
  landing_faq4_q: 'Does GigsProfit work for Instacart, Amazon Flex and Shipt?',
  landing_faq4_a:
    'Yes. GigsProfit supports Uber, Lyft, DoorDash, Instacart, Amazon Flex, Grubhub, Uber Eats, and Shipt. Log any trip on any platform and compare real profit side by side.',
  landing_faq5_q: 'Is GigsProfit free to use?',
  landing_faq5_a:
    'GigsProfit is completely free. No subscription, no credit card. Sign up, set your vehicle costs once, and start seeing your real profit immediately.',
  landing_final_head: 'Know your real number.',
  landing_final_sub: 'Free to use. No subscription required.',
  landing_cta_create: 'Create free account',
  landing_signin_existing: 'Sign in to existing account →',
  landing_footer_platforms:
    'Works with Uber, Lyft, DoorDash, Instacart, Amazon Flex, and any other platform.',
  landing_footer_disclaimer:
    'Tax estimates are for informational purposes only. Consult a tax professional for advice specific to your situation.',

  // Auth
  auth_signin_title: 'Sign In',
  auth_register_title: 'Create Account',
  auth_welcome_back: 'Welcome back',
  auth_create_free: 'Create your free account',
  auth_first_name: 'First name',
  auth_last_name: 'Last name',
  auth_email: 'Email',
  auth_phone: 'Phone (optional)',
  auth_password: 'Password',
  auth_confirm_password: 'Confirm password',
  auth_btn_signin: 'Sign In',
  auth_btn_register: 'Register',
  auth_google: 'Continue with Google',
  auth_google_loading: 'Signing in with Google…',
  auth_or: 'or',
  auth_no_account: "Don't have an account? Register",
  auth_have_account: 'Already have an account? Sign in',
  auth_back: '← Back',
  auth_google_config_note: 'Google sign-in requires EXPO_PUBLIC_GOOGLE_CLIENT_ID to be configured.',

  // Settings — language
  settings_language: 'Language',
  settings_language_pick: 'Choose Language',
  settings_language_done: 'Done',
};

const es = {
  // Landing
  landing_nav_signin: 'Iniciar sesión',
  landing_hero_head: 'Tu pago bruto',
  landing_hero_italic: 'no es tu ingreso.',
  landing_hero_sub:
    'GigsProfit calcula tu pago real después de combustible, millaje a la tasa del IRS de $0.72 por milla, mantenimiento del vehículo e impuesto de trabajo independiente. Los conductores de DoorDash ganan $12.23 por hora en promedio bruto, pero el pago neto real después de costos es entre 35–45% menor. GigsProfit te muestra el número real por cada viaje.',
  landing_cta_start: 'Empieza a rastrear gratis',
  landing_signin_arrow: 'Iniciar sesión →',
  landing_stat1_value: '$0.72',
  landing_stat1_label: 'Tasa de millaje IRS por milla (2026)',
  landing_stat2_value: '9',
  landing_stat2_label: 'categorías de costos por viaje',
  landing_stat3_value: '35–45%',
  landing_stat3_label: 'lo que los gastos reducen del pago bruto',
  landing_problem_eyebrow: 'LA MATEMÁTICA REAL',
  landing_problem_head: 'Las apps muestran lo que ganaste.\nNosotros mostramos lo que hiciste.',
  landing_compare_gross: 'Ganancias brutas',
  landing_compare_real: 'Pago real neto',
  landing_compare_note:
    'GridWise Analytics reporta que los conductores de DoorDash ganan $12.23/hr bruto. Después de costos, el pago neto real suele ser menor de $8/hr. GigsProfit muestra tu número.',
  landing_features_eyebrow: 'QUÉ HACE GIGSPROFIT',
  landing_feature1_title: 'Ganancia real, no solo ingresos',
  landing_feature1_body:
    'Deduce combustible, depreciación, seguro, llantas, aceite y mantenimiento en cada viaje.',
  landing_feature2_title: 'Compara cada plataforma',
  landing_feature2_body:
    'Clasifica Uber, Lyft, DoorDash y más por $/hr netos reales, no brutos.',
  landing_feature3_title: 'Resumen fiscal incluido',
  landing_feature3_body:
    'Impuesto de trabajo independiente + deducción de millaje del IRS calculados automáticamente.',
  landing_feature4_title: 'Coach de ganancias con IA',
  landing_feature4_body:
    'Claude AI te da 2 acciones específicas para mejorar tus números esta semana.',
  landing_testimonials_eyebrow: 'DE CONDUCTORES QUE LO USAN',
  landing_testimonial1_quote:
    'Pensaba que DoorDash era mi mejor opción. Resulta que Uber me genera $4 más por hora después de costos.',
  landing_testimonial1_name: 'Marcus T.',
  landing_testimonial1_location: 'Dallas TX',
  landing_testimonial2_quote:
    'Descubrí que mi costo por milla era $0.94. Apenas cubría gastos en viajes cortos. Ahora rechazo cualquier cosa menor de 4 millas.',
  landing_testimonial2_name: 'Priya S.',
  landing_testimonial2_location: 'Austin TX',
  landing_faq_eyebrow: 'PREGUNTAS DE CONDUCTORES INDEPENDIENTES',
  landing_faq_head:
    'Respuestas reales para conductores de Uber, DoorDash, Lyft, Instacart y Amazon Flex',
  landing_faq1_q: '¿Qué plataforma gig paga más después de gastos?',
  landing_faq1_a:
    'Depende de tu ubicación y vehículo. Amazon Flex tiende a dar mayor pago neto porque las entregas son agrupadas. GigsProfit te permite comparar dólares netos reales por hora en cada plataforma para decidir qué turnos realmente valen la pena.',
  landing_faq2_q: '¿Cuál es la deducción de millaje del IRS para 2026?',
  landing_faq2_a:
    'La tasa estándar de millaje del IRS para 2026 es $0.72 por milla para uso comercial. Un conductor que registra 25,000 millas al año deduce $18,000, a menudo eliminando gran parte del impuesto de trabajo independiente. GigsProfit lo rastrea automáticamente.',
  landing_faq3_q: '¿Cuánto pagan los conductores gig en impuesto de trabajo independiente?',
  landing_faq3_a:
    'Los conductores gig pagan 15.3% de impuesto de trabajo independiente sobre la ganancia neta — 12.4% Seguro Social y 2.9% Medicare. Para un conductor con $2,000 netos al mes, eso es $306 al mes solo en SE tax, antes del impuesto sobre la renta. GigsProfit muestra tu estimado actualizado.',
  landing_faq4_q: '¿GigsProfit funciona con Instacart, Amazon Flex y Shipt?',
  landing_faq4_a:
    'Sí. GigsProfit soporta Uber, Lyft, DoorDash, Instacart, Amazon Flex, Grubhub, Uber Eats y Shipt. Registra cualquier viaje en cualquier plataforma y compara la ganancia real lado a lado.',
  landing_faq5_q: '¿GigsProfit es gratuito?',
  landing_faq5_a:
    'GigsProfit es completamente gratuito. Sin suscripción, sin tarjeta de crédito. Regístrate, configura los costos de tu vehículo una vez y empieza a ver tu ganancia real de inmediato.',
  landing_final_head: 'Conoce tu número real.',
  landing_final_sub: 'Gratis. Sin suscripción.',
  landing_cta_create: 'Crear cuenta gratuita',
  landing_signin_existing: 'Iniciar sesión en cuenta existente →',
  landing_footer_platforms:
    'Funciona con Uber, Lyft, DoorDash, Instacart, Amazon Flex y cualquier otra plataforma.',
  landing_footer_disclaimer:
    'Los estimados de impuestos son solo informativos. Consulta a un profesional fiscal para tu situación específica.',

  // Auth
  auth_signin_title: 'Iniciar Sesión',
  auth_register_title: 'Crear Cuenta',
  auth_welcome_back: 'Bienvenido de vuelta',
  auth_create_free: 'Crea tu cuenta gratuita',
  auth_first_name: 'Nombre',
  auth_last_name: 'Apellido',
  auth_email: 'Correo electrónico',
  auth_phone: 'Teléfono (opcional)',
  auth_password: 'Contraseña',
  auth_confirm_password: 'Confirmar contraseña',
  auth_btn_signin: 'Iniciar Sesión',
  auth_btn_register: 'Registrarse',
  auth_google: 'Continuar con Google',
  auth_google_loading: 'Iniciando con Google…',
  auth_or: 'o',
  auth_no_account: '¿No tienes cuenta? Regístrate',
  auth_have_account: '¿Ya tienes cuenta? Inicia sesión',
  auth_back: '← Volver',
  auth_google_config_note: 'El inicio con Google requiere configurar EXPO_PUBLIC_GOOGLE_CLIENT_ID.',

  // Settings — language
  settings_language: 'Idioma',
  settings_language_pick: 'Elegir Idioma',
  settings_language_done: 'Listo',
};

const ar = {
  // Landing
  landing_nav_signin: 'تسجيل الدخول',
  landing_hero_head: 'راتبك الإجمالي',
  landing_hero_italic: 'ليس دخلك الحقيقي.',
  landing_hero_sub:
    'يحسب GigsProfit صافي دخلك الحقيقي بعد الوقود والمسافة بمعدل IRS البالغ $0.72 لكل ميل وصيانة السيارة وضريبة العمل الحر. يكسب سائقو DoorDash ما معدله $12.23 في الساعة إجمالاً، لكن الدخل الصافي الحقيقي بعد التكاليف أقل بنسبة 35–45٪. GigsProfit يُظهر لك الرقم الحقيقي لكل رحلة.',
  landing_cta_start: 'ابدأ التتبع مجاناً',
  landing_signin_arrow: 'تسجيل الدخول →',
  landing_stat1_value: '$0.72',
  landing_stat1_label: 'معدل أميال IRS لكل ميل (2026)',
  landing_stat2_value: '9',
  landing_stat2_label: 'فئات تكلفة مُتتبَّعة لكل رحلة',
  landing_stat3_value: '35–45%',
  landing_stat3_label: 'ما تخصمه التكاليف من الدخل الإجمالي',
  landing_problem_eyebrow: 'الحساب الحقيقي',
  landing_problem_head: 'التطبيقات تُظهر ما كسبته.\nنحن نُظهر ما ربحته فعلاً.',
  landing_compare_gross: 'الأرباح الإجمالية',
  landing_compare_real: 'الدخل الصافي الحقيقي',
  landing_compare_note:
    'تُفيد تحليلات GridWise بأن سائقي DoorDash يكسبون $12.23/ساعة إجمالاً. بعد التكاليف، يكون الدخل الصافي الحقيقي في الغالب أقل من $8/ساعة. GigsProfit يُظهر رقمك.',
  landing_features_eyebrow: 'ما يفعله GIGSPROFIT',
  landing_feature1_title: 'ربح حقيقي وليس مجرد أرباح',
  landing_feature1_body:
    'يخصم الوقود والاستهلاك والتأمين والإطارات والزيت والصيانة في كل رحلة.',
  landing_feature2_title: 'قارن كل منصة',
  landing_feature2_body: 'يُصنّف Uber وLyft وDoorDash وغيرها حسب صافي $/ساعة الحقيقي لا الإجمالي.',
  landing_feature3_title: 'لقطة ضريبية مدمجة',
  landing_feature3_body: 'يُحسب ضريبة العمل الحر وخصم أميال IRS تلقائياً.',
  landing_feature4_title: 'مدرب الأرباح بالذكاء الاصطناعي',
  landing_feature4_body: 'يمنحك Claude AI إجراءَين محددَين لتحسين أرقامك هذا الأسبوع.',
  landing_testimonials_eyebrow: 'من السائقين الذين يستخدمونه',
  landing_testimonial1_quote:
    'كنت أظن أن DoorDash هو الأفضل. اتضح أن Uber يمنحني $4 أكثر في الساعة بعد التكاليف.',
  landing_testimonial1_name: 'ماركوس ت.',
  landing_testimonial1_location: 'دالاس، تكساس',
  landing_testimonial2_quote:
    'اكتشفت أن تكلفتي لكل ميل كانت $0.94. كنت بالكاد أغطي التكاليف في الرحلات القصيرة. الآن أرفض أي رحلة أقل من 4 أميال.',
  landing_testimonial2_name: 'بريا س.',
  landing_testimonial2_location: 'أوستن، تكساس',
  landing_faq_eyebrow: 'أسئلة سائقي الخدمات',
  landing_faq_head: 'إجابات حقيقية لسائقي Uber وDoorDash وLyft وInstacart وAmazon Flex',
  landing_faq1_q: 'أي منصة خدمات تدفع أكثر بعد المصاريف؟',
  landing_faq1_a:
    'يعتمد ذلك على موقعك وسيارتك. تميل Amazon Flex إلى تقديم صافي دخل مرتفع لأن التوصيلات مجمّعة. يتيح لك GigsProfit مقارنة صافي الدولارات الحقيقية في الساعة عبر كل منصة لتقرر أي المناوبات تستحق فعلاً.',
  landing_faq2_q: 'ما هو خصم أميال IRS لعام 2026؟',
  landing_faq2_a:
    'المعدل القياسي لمسافة IRS لعام 2026 هو $0.72 لكل ميل للاستخدام التجاري. السائق الذي يسجل 25,000 ميل سنوياً يخصم $18,000 — مما يلغي في الغالب معظم فاتورة ضريبة العمل الحر. GigsProfit يتتبع ذلك تلقائياً.',
  landing_faq3_q: 'كم يدفع سائقو الخدمات في ضريبة العمل الحر؟',
  landing_faq3_a:
    'يدفع سائقو الخدمات 15.3٪ ضريبة عمل حر على صافي الربح — 12.4٪ ضمان اجتماعي و2.9٪ رعاية طبية. لسائق يحقق $2,000 صافياً في الشهر، هذا يعني $306 شهرياً في ضريبة العمل الحر وحدها، قبل ضريبة الدخل. GigsProfit يُظهر تقديرك الجاري.',
  landing_faq4_q: 'هل GigsProfit يعمل مع Instacart وAmazon Flex وShipt؟',
  landing_faq4_a:
    'نعم. يدعم GigsProfit Uber وLyft وDoorDash وInstacart وAmazon Flex وGrubhub وUber Eats وShipt. سجّل أي رحلة على أي منصة وقارن الربح الحقيقي جنباً إلى جنب.',
  landing_faq5_q: 'هل GigsProfit مجاني؟',
  landing_faq5_a:
    'GigsProfit مجاني تماماً. لا اشتراك ولا بطاقة ائتمانية. سجّل، عيّن تكاليف سيارتك مرة واحدة، وابدأ في رؤية ربحك الحقيقي فوراً.',
  landing_final_head: 'اعرف رقمك الحقيقي.',
  landing_final_sub: 'مجاني. لا اشتراك مطلوب.',
  landing_cta_create: 'إنشاء حساب مجاني',
  landing_signin_existing: 'تسجيل الدخول إلى حساب موجود →',
  landing_footer_platforms:
    'يعمل مع Uber وLyft وDoorDash وInstacart وAmazon Flex وأي منصة أخرى.',
  landing_footer_disclaimer:
    'تقديرات الضرائب لأغراض إعلامية فقط. استشر متخصصاً ضريبياً للحصول على مشورة خاصة بوضعك.',

  // Auth
  auth_signin_title: 'تسجيل الدخول',
  auth_register_title: 'إنشاء حساب',
  auth_welcome_back: 'مرحباً بعودتك',
  auth_create_free: 'أنشئ حسابك المجاني',
  auth_first_name: 'الاسم الأول',
  auth_last_name: 'اسم العائلة',
  auth_email: 'البريد الإلكتروني',
  auth_phone: 'الهاتف (اختياري)',
  auth_password: 'كلمة المرور',
  auth_confirm_password: 'تأكيد كلمة المرور',
  auth_btn_signin: 'تسجيل الدخول',
  auth_btn_register: 'تسجيل',
  auth_google: 'المتابعة مع Google',
  auth_google_loading: 'جارٍ تسجيل الدخول بـ Google…',
  auth_or: 'أو',
  auth_no_account: 'ليس لديك حساب؟ سجّل',
  auth_have_account: 'لديك حساب؟ سجّل دخولك',
  auth_back: '→ رجوع',
  auth_google_config_note: 'يتطلب تسجيل الدخول بـ Google تهيئة EXPO_PUBLIC_GOOGLE_CLIENT_ID.',

  // Settings — language
  settings_language: 'اللغة',
  settings_language_pick: 'اختر اللغة',
  settings_language_done: 'تم',
};

export const translations = { en, es, ar };

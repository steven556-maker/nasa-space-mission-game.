(function () {
  'use strict';

  var RK = 1737;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var $ = function (id) { return document.getElementById(id); };
  var hud = $('hud'), hold = $('hold'), holdLabel = $('holdLabel'), quick = $('quick'), fill = $('fill');
  var msgT = $('msgT'), msgA = $('msgA'), dust = $('dust'), flash = $('flash');
  var stage = $('stage');

  var T = {
    en: {
      brand: 'NOVA YEARS · Space Apps 2026', hero: 'Design your mission.<br>Live the consequences.', hero2: 'Out of chaos,<br>a NOVA is born.', skip: 'Skip', sub: 'Every choice trades mass, budget and energy. Press to begin.',
      f1k: 'Resources to balance', f1u: 'types', f2k: 'Mission phases', f2u: 'stages',
      loading: 'Preparing the scene…', hold: 'Start mission', arrange: 'Calibrating mission ',
      msgs: ['Trans-lunar injection', 'Lunar approach', 'Touchdown'],
      toggle: 'عربي', toggleLabel: 'العربية', soundOn: 'Sound on', soundOff: 'Sound off', noWebgl: 'Your browser does not support 3D',
      choose: 'Your mission', envH: 'Lunar missions', envP: 'Choose a mission path. Your choice sets the mission objective and resource trade-offs.',
      mis: 'missions', go: 'Select', selected: 'Selected', start: 'Start design',
      envs: [
        { n: 'Lunar Orbiter', d: 'Map polar ice from orbit. Balance instrument data, downlink capacity, power and mission lifetime.', k: 'ORBITAL SURVEY', m: ['Orbit', 'Data return', 'Power'] },
        { n: 'Lunar Lander', d: 'Plan a south-pole landing. Trade launch capacity, mass, fuel, power and landing risk.', k: 'LANDING MISSION', m: ['Launch', 'Mass', 'Fuel'] },
        { n: 'Surface Science', d: 'Deploy instruments on the surface. Balance science return against energy, data and communications.', k: 'SURFACE OPERATIONS', m: ['Instruments', 'Energy', 'Comms'] }
      ]
    },
    ar: {
      brand: 'NOVA YEARS · تحدي التطبيقات الفضائية 2026', hero: 'صمّم مهمتك.<br>وعِش نتائج قراراتك.', hero2: 'من قلب الفوضى<br>تولد NOVA.', skip: 'تخطَّ', sub: 'كل اختيار يغيّر الكتلة والميزانية والطاقة. اضغط للبدء.',
      f1k: 'موارد يجب موازنتها', f1u: 'أنواع', f2k: 'مراحل المهمة', f2u: 'مراحل',
      loading: 'جارٍ تجهيز المشهد…', hold: 'ابدأ المهمة', arrange: 'جارٍ معايرة المهمة ',
      msgs: ['الانطلاق نحو القمر', 'الاقتراب من القمر', 'الملامسة'],
      toggle: 'EN', toggleLabel: 'English', soundOn: 'الصوت يعمل', soundOff: 'الصوت متوقف', noWebgl: 'المتصفح لا يدعم عرض الـ 3D',
      choose: 'مهمتك', envH: 'مسارات المهمات القمرية', envP: 'اختر مسار المهمة؛ اختيارك يحدد الهدف ومقايضات الموارد.',
      mis: 'مهمات', go: 'اختر', selected: 'تم الاختيار', start: 'ابدأ التصميم',
      envs: [
        { n: 'مدار القمر', d: 'ارسم خريطة للجليد من المدار ووازن البيانات والطاقة والاتصال وعمر المهمة.', k: 'مسح مداري', m: ['مدار', 'بيانات', 'طاقة'] },
        { n: 'الهبوط على القمر', d: 'خطط للهبوط قرب القطب الجنوبي ووازن الحمولة والكتلة والوقود ومخاطر الهبوط.', k: 'مهمة هبوط', m: ['إطلاق', 'كتلة', 'وقود'] },
        { n: 'علوم السطح', d: 'شغّل الأدوات العلمية على السطح ووازن العائد العلمي مع الطاقة والاتصالات والبيانات.', k: 'عمليات سطحية', m: ['أدوات', 'طاقة', 'اتصال'] }
      ]
    }
  };
  var lang = 'en';
  var tools = $('tools'), langBtn = $('lang'), sndBtn = $('snd');
  var envSel = $('envSel'), envGrid = $('envGrid');

  var MissionGame = (function () {
    var current=null, answers={}, runNumber=0, lastOutcome=null, missionType='lander', selectedSite=null,stationIndex=0, goalIds=[],lastDecision=null;
    var objectives=[
      {id:'ice',en:'Map water ice near the lunar south pole',ar:'ارسم خريطة للجليد المائي قرب القطب الجنوبي للقمر',fav:['iceRadar','spectrometer'],power:4,data:2,science:20},
      {id:'seismic',en:'Measure moonquakes and subsurface structure',ar:'قِس الزلازل القمرية وبنية ما تحت السطح',fav:['seismometer','drill'],power:3,data:1,science:18},
      {id:'landing',en:'Survey a safe landing corridor',ar:'امسح مسارًا آمنًا للهبوط',fav:['stereoCamera','iceRadar'],power:2,data:2,science:16},
      {id:'regolith',en:'Characterize lunar soil for future missions',ar:'حلّل تربة القمر لدعم المهمات المستقبلية',fav:['spectrometer','drill'],power:2,data:1,science:20}
    ];
    var missionObjectives={orbiter:['ice','landing'],lander:['ice','landing'],surface:['seismic','regolith']};
    var challenges=[
      {id:'dark',en:'Long shadow periods reduce solar power.',ar:'فترات الظل الطويلة تقلل الطاقة الشمسية.',solar:.68,comm:.94},
      {id:'relay',en:'A terrain ridge creates a communication blackout.',ar:'حافة جبلية تسبب انقطاعًا في الاتصال.',solar:.95,comm:.62},
      {id:'dust',en:'Dust and rough terrain raise landing and power risk.',ar:'الغبار والتضاريس الوعرة يرفعان مخاطر الهبوط والطاقة.',solar:.82,comm:.90},
      {id:'window',en:'A short observation window limits mission time.',ar:'نافذة الرصد قصيرة وتحد من زمن المهمة.',solar:1,comm:1}
    ];
    var questions=[
      {id:'launcher',en:'Q1 | Choose a launch service',ar:'س١ | اختر خدمة الإطلاق',hintEn:'More payload margin costs more budget.',hintAr:'هامش الحمولة الأكبر يحتاج ميزانية أعلى.',options:[
        {id:'compact',en:'Compact rideshare',ar:'إطلاق مشترك صغير',cost:22,mass:0,payload:58,routeClass:1,fuel:8,reliability:88,science:0},
        {id:'balanced',en:'Dedicated medium launcher',ar:'صاروخ متوسط مخصص',cost:33,mass:0,payload:78,routeClass:2,fuel:11,reliability:94,science:0},
        {id:'heavy',en:'Heavy-lift reserve',ar:'إطلاق ثقيل بهامش احتياطي',cost:49,mass:0,payload:112,routeClass:3,fuel:15,reliability:97,science:0}
      ]},
      {id:'power',en:'Q2 | Choose spacecraft power',ar:'س٢ | اختر نظام طاقة المركبة',hintEn:'The scenario may include long darkness.',hintAr:'قد يتضمن السيناريو فترات ظلام طويلة.',options:[
        {id:'solar',en:'Fixed solar arrays',ar:'ألواح شمسية ثابتة',cost:10,mass:8,power:34,fuel:0,reliability:90,science:0},
        {id:'tracking',en:'Sun-tracking solar arrays',ar:'ألواح شمسية تتبع الشمس',cost:17,mass:12,power:48,fuel:0,reliability:94,science:0},
        {id:'hybrid',en:'Solar plus battery reserve',ar:'طاقة شمسية مع بطارية احتياطية',cost:24,mass:17,power:60,fuel:0,reliability:97,science:0}
      ]},
      {id:'instrument',en:'Q3 | Select the science instrument',ar:'س٣ | اختر أداة البحث العلمي',hintEn:'Higher science return can add cost, mass, power and data demand. All values are simplified game values.',hintAr:'قد يزيد العائد العلمي الأعلى التكلفة والكتلة والطاقة والبيانات. كل القيم مبسطة للعبة.',options:[
        {id:'iceRadar',en:'Ice-penetrating radar',ar:'رادار نافذ للجليد',cost:19,mass:13,power:19,data:7,science:38,targets:['ice','landing']},
        {id:'seismometer',en:'Seismometer network',ar:'شبكة مقاييس الزلازل',cost:14,mass:9,power:11,data:3,science:35,targets:['seismic']},
        {id:'stereoCamera',en:'Stereo terrain camera',ar:'كاميرا تضاريس مجسمة',cost:12,mass:7,power:12,data:8,science:28,targets:['landing']},
        {id:'spectrometer',en:'Near-infrared spectrometer',ar:'مطياف الأشعة تحت الحمراء القريبة',cost:16,mass:10,power:15,data:5,science:34,targets:['ice','regolith']},
        {id:'drill',en:'Regolith drill and sampler',ar:'مثقاب تربة وجامع عينات',cost:23,mass:16,power:22,data:4,science:43,targets:['seismic','regolith']}
      ]},
      {id:'comms',en:'Q4 | Choose a communications package',ar:'س٤ | اختر حزمة الاتصالات',hintEn:'Data return depends on both bandwidth and contact time.',hintAr:'إرجاع البيانات يعتمد على سعة الاتصال ووقت التغطية.',options:[
        {id:'lowGain',en:'Low-gain direct link',ar:'اتصال مباشر بهوائي منخفض الكسب',cost:7,mass:4,bandwidth:2,reliability:88},
        {id:'highGain',en:'High-gain direct-to-Earth',ar:'هوائي عالي الكسب باتصال مباشر بالأرض',cost:15,mass:8,bandwidth:5,reliability:94},
        {id:'relay',en:'Relay-assisted link',ar:'اتصال مدعوم بقمر ترحيل',cost:20,mass:11,bandwidth:8,reliability:97}
      ]},
      {id:'profile',en:'Q5 | Choose the mission operation',ar:'س٥ | اختر نشاط المهمة',hintEn:'Choose the work your spacecraft will do at the Moon.',hintAr:'اختر العمل الذي ستنفذه المركبة عند القمر.',options:[
        {id:'lowOrbit',en:'Short polar landing sortie',ar:'مهمة هبوط قطبي قصيرة',cost:8,mass:5,power:4,fuel:6,days:8,science:10,risk:8,site:1},
        {id:'softLanding',en:'Precision south-pole landing',ar:'هبوط دقيق عند القطب الجنوبي',cost:13,mass:9,power:8,fuel:12,days:12,science:18,risk:15,site:5},
        {id:'longSurvey',en:'Extended surface survey',ar:'مسح سطحي ممتد',cost:18,mass:13,power:10,fuel:18,days:16,science:25,risk:22,site:3}
      ]},
      {id:'trajectory',en:'Q6 | Choose an orbit or transfer path',ar:'س٦ | اختر المدار أو مسار الرحلة',hintEn:'The route changes fuel, observation time, communications access and launch-mass needs.',hintAr:'يغيّر المسار الوقود ووقت الرصد والاتصال والكتلة التي يجب أن يحملها الصاروخ.',options:[]}
    ];
    var questionById=Object.fromEntries(questions.map(function(q){return [q.id,q];}));
    var stationNames=[['Launch lab','معمل الإطلاق'],['Power lab','معمل الطاقة'],['Science payload lab','معمل الحمولة العلمية'],['Communications lab','معمل الاتصالات'],['Operations lab','معمل العمليات'],['Orbit & trajectory lab','معمل المدار والمسار']];
    var guideGroups=[
      {title:['Mission setup','إعداد المهمة'],items:[
        [['Mission path and site map','مسار المهمة وخريطة الموقع'],['Choose an orbital, landing, or surface mission and select a lunar training site. Map markers and terrain are illustrative.','اختر مهمة مدارية أو هبوطًا أو عمليات سطحية، ثم حدد موقعًا قمريًا للتدريب. العلامات والتضاريس توضيحية.']],
        [['Mission Atlas','أطلس المهمة'],['Compares the three training sites using game cost and operation assumptions alongside the shared mean lunar gravity reference.','يقارن مواقع التدريب الثلاثة باستخدام تكاليف وافتراضات تشغيل اللعبة، ويعرض مرجع الجاذبية القمرية المتوسطة المشترك.']],
        [['Start design / launch control','ابدأ التصميم / تحكم الإطلاق'],['Start design enters the mission builder. The earlier Manual and Autopilot buttons choose how the launch sequence is controlled.','زر بدء التصميم يفتح مصمم المهمة. يحدد خيارا اليدوي والطيار الآلي السابقان طريقة التحكم في الإطلاق.']],
        [['Generate mission','إنشاء المهمة'],['Builds a fixed local scenario from the mission path and site. Its goals and constraints seed your design; the resource values are simplified game values.','ينشئ سيناريو محليًا ثابتًا حسب مسار المهمة والموقع. يحدد الهدف والقيود التي ستصمم على أساسها؛ أرقام الموارد مبسطة للعبة.']],
        [['Difficulty','الصعوبة'],['Guided gives more margin; Standard is the baseline; Tight resources makes the resource limits harder.','الموجّه يمنح هامشًا أكبر، والقياسي هو المستوى الأساسي، والموارد المحدودة تشدد قيود المهمة.']],
        [['Sandbox','وضع التجربة'],['Lets you explore a design when resource checks fail. Failed limits remain visible in the evaluation.','يسمح باستكشاف التصميم حتى لو أخفق في بعض القيود، وتظل القيود غير المجتازة ظاهرة في التقرير.']],
        [['Mission briefing','ملخص المهمة'],['Shows the selected science objective, mission constraint, and how launch, spacecraft, ground link, and science users connect.','يعرض الهدف العلمي وقيد المهمة وكيف يرتبط الإطلاق بالمركبة والاتصال الأرضي ومستخدمي البيانات.']],
        [['Sustainable development links','ارتباط التنمية المستدامة'],['Short learning links to SDGs 4, 9, and 12; this is educational relevance, not a measured impact.','روابط تعليمية مختصرة للأهداف ٤ و٩ و١٢؛ هذا ارتباط تعليمي وليس قياسًا للأثر.']]
      ]},
      {title:['Science goals and design stations','الأهداف العلمية ومحطات التصميم'],items:[
        [['Science goals','الأهداف العلمية'],['Choose what the mission should learn. Compatible instruments stay available; choices that do not support the selected goals are disabled with a reason.','اختر ما تريد المهمة تعلمه. تظل الأدوات المتوافقة متاحة، وتُعطّل الأدوات غير المناسبة مع توضيح السبب.']],
        [['Six-station progress bar','شريط المحطات الست'],['Shows your place in the design. Select an available earlier station to revise a decision.','يوضح مكانك في التصميم. يمكنك الرجوع لمحطة متاحة لتعديل قرار سابق.']],
        [['Previous / Next station','المحطة السابقة / التالية'],['Move between design decisions. Next is enabled after you choose an option for the current station.','تنقّل بين قرارات التصميم. يتاح زر التالي بعد اختيار إجابة للمحطة الحالية.']],
        [['Choice cards','بطاقات الاختيار'],['Select a launcher, power system, instrument, communications package, mission operation, or route. Each choice changes the game model.','اختر صاروخًا أو نظام طاقة أو أداة علمية أو اتصالات أو عملية مهمة أو مسارًا. كل اختيار يؤثر في نموذج اللعبة.']],
        [['Live resource cards','بطاقات الموارد الحية'],['Show estimated budget, mass, power, fuel, communications, data, and time against this scenario’s limits. Units are simplified game units.','تعرض تقديرات الميزانية والكتلة والطاقة والوقود والاتصالات والبيانات والزمن مقارنة بحدود السيناريو. الوحدات مبسطة للعبة.']],
        [['Decision impact / trade-off map','خريطة أثر القرار والمقايضات'],['Explains how a choice affects science return and other resources, and gives a short reason or tip.','تشرح كيف يؤثر الاختيار في العائد العلمي وبقية الموارد، وتعرض سببًا أو نصيحة قصيرة.']],
        [['Evaluate mission','تقييم المهمة'],['Checks the completed design against the simplified game limits and opens the flight evaluation report.','يفحص التصميم المكتمل وفق قيود اللعبة المبسطة ويفتح تقرير تقييم المهمة.']]
      ]},
      {title:['Evaluation report and actions','التقرير والإجراءات'],items:[
        [['Readiness checklist','قائمة الجاهزية التعليمية'],['Shows which design areas are covered, what is missing, and a suggested next step based on linked learning resources. It is not an official NASA or JPL rating.','تعرض الجوانب المكتملة والنواقص والخطوة التالية المقترحة بالاستناد إلى موارد تعليمية مرتبطة. ليست تقييمًا رسميًا من NASA أو JPL.']],
        [['Historical lesson / design comparison','درس تاريخي / مقارنة التصميم'],['Connects one mission decision to a historical lesson or compares your simplified design values with NASA design practice. It does not claim numeric equivalence.','يربط قرارًا بدرس من مهمة تاريخية أو يقارن قيم لعبتك المبسطة بمنهج تصميم المهمات. لا يدّعي تطابقًا رقميًا.']],
        [['Redesign scenario','إعادة تصميم السيناريو'],['Resets your design choices while keeping the current mission scenario so you can try a different plan.','يمسح اختيارات التصميم مع إبقاء سيناريو المهمة الحالي لتجربة خطة أخرى.']],
        [['Manual / Autopilot','يدوي / طيار آلي'],['Starts the launch and landing simulator with your chosen control style. Manual gives you the controls; autopilot flies the supported sequence.','يشغّل محاكي الإطلاق والهبوط بأسلوب التحكم المختار. اليدوي يتيح لك التحكم، والطيار الآلي ينفذ المراحل المدعومة.']],
        [['Save report','حفظ التقرير'],['Stores the evaluation in this browser so you can compare it with later designs.','يحفظ التقييم في هذا المتصفح لتقارنه بتصاميم لاحقة.']],
        [['Print / Export / Share','طباعة / تصدير / مشاركة'],['Print creates a report copy, Export downloads the design as JSON, and Share copies a short summary when clipboard access is available.','الطباعة تنشئ نسخة تقرير، والتصدير ينزّل التصميم بصيغة JSON، والمشاركة تنسخ ملخصًا إذا كان الوصول للحافظة متاحًا.']],
        [['Compare saved runs','مقارنة الجولات المحفوظة'],['Shows the latest saved designs side by side, including route, science value, and outcome.','تعرض أحدث التصاميم المحفوظة جنبًا إلى جنب، مع المسار والعائد العلمي والنتيجة.']]
      ]},
      {title:['Mission timeline and flight','الخط الزمني والطيران'],items:[
        [['3D mission view','مشهد المهمة ثلاثي الأبعاد'],['Shows an illustrative Earth–Moon route. The marker follows the active phase; geometry and timing are not navigation data.','يعرض مسارًا توضيحيًا بين الأرض والقمر، ويتحرك المؤشر مع المرحلة الحالية. الشكل والتوقيت ليسا بيانات ملاحة.']],
        [['Mission timeline','الخط الزمني للمهمة'],['Tracks launch, transfer, orbit, landing when relevant, science operations, and data return.','يتابع الإطلاق والعبور والمدار والهبوط عند الحاجة والعمليات العلمية وإرجاع البيانات.']],
        [['Event notice','تنبيه الحدث'],['Describes the illustrative stress event selected for this run and its modeled impact. It is not a real event probability.','يشرح الحدث الطارئ التوضيحي المختار لهذه الجولة وأثره في نموذج اللعبة. لا يمثل احتمالًا حقيقيًا.']],
        [['Live telemetry','القياسات الحية'],['Updates modeled power, fuel, data, time, mass, and budget as the timeline advances.','تحدّث موارد الطاقة والوقود والبيانات والزمن والكتلة والميزانية في نموذج اللعبة مع تقدم المراحل.']],
        [['Flight keyboard controls','مفاتيح التحكم بالطيران'],['Follow the on-screen hint for each phase. The launch and landing simulator may use W/A/S/D, Space, I, G, or O depending on the stage.','اتبع التلميح الظاهر لكل مرحلة. قد يستخدم المحاكي W/A/S/D أو Space أو I أو G أو O حسب المرحلة.']],
        [['Switch to autopilot / Focus controls','التبديل للطيار الآلي / التركيز على التحكم'],['Use the flight-board buttons to switch control mode where available, or refocus the simulator so its controls respond to your keyboard.','استخدم أزرار لوحة الطيران للتبديل إلى الطيار الآلي عند توفره، أو أعد التركيز على المحاكي ليستجيب لمفاتيح لوحة المفاتيح.']],
        [['Return to mission','العودة إلى المهمة'],['Closes the flight view and returns to the mission design or debrief.','يغلق مشهد الطيران ويعيدك إلى تصميم المهمة أو تقريرها.']],
        [['Save mission report / Close timeline','حفظ تقرير المهمة / إغلاق الخط الزمني'],['Save the final mission outcome, or close the timeline and return to the design report.','احفظ النتيجة النهائية للمهمة، أو أغلق الخط الزمني للعودة إلى تقرير التصميم.']]
      ]}
    ];
    var profileOptions={
      orbiter:[
        {id:'polarMap',en:'Low polar mapping orbit',ar:'مدار قطبي منخفض للمسح',cost:12,mass:5,power:3,fuel:8,days:10,science:22,risk:7,observation:1.25,site:null},
        {id:'ellipticalMap',en:'Elliptical polar survey',ar:'مدار قطبي بيضاوي للمسح',cost:16,mass:7,power:5,fuel:11,days:14,science:29,risk:10,observation:1.45,site:null},
        {id:'relayMap',en:'Relay and mapping orbit',ar:'مدار للمسح وترحيل الاتصال',cost:19,mass:9,power:4,fuel:13,days:16,science:27,risk:12,observation:1.3,site:null}
      ],
      lander:[
        {id:'lowOrbit',en:'Short polar landing sortie',ar:'مهمة هبوط قطبي قصيرة',cost:8,mass:5,power:4,fuel:6,days:8,science:10,risk:8,site:1},
        {id:'softLanding',en:'Precision south-pole landing',ar:'هبوط دقيق عند القطب الجنوبي',cost:13,mass:9,power:8,fuel:12,days:12,science:18,risk:15,site:5},
        {id:'longSurvey',en:'Extended surface survey',ar:'مسح سطحي ممتد',cost:18,mass:13,power:10,fuel:18,days:16,science:25,risk:22,site:3}
      ],
      surface:[
        {id:'seismicStation',en:'Deploy a seismic station',ar:'نشر محطة لرصد الزلازل',cost:12,mass:7,power:5,fuel:8,days:9,science:20,risk:9,site:3},
        {id:'regolithTraverse',en:'Rover soil survey',ar:'مسح التربة بعربة جوالة',cost:17,mass:11,power:8,fuel:12,days:13,science:25,risk:15,site:3},
        {id:'polarSampling',en:'Polar drill and sample campaign',ar:'حملة حفر وجمع عينات قطبية',cost:20,mass:14,power:11,fuel:16,days:15,science:31,risk:18,site:5}
      ]
    };
    var trajectoryOptions={
      orbiter:[
        {id:'lowPolar',en:'Low lunar polar orbit',ar:'مدار قمري قطبي منخفض',cost:9,mass:4,power:0,fuel:7,days:3,science:8,risk:4,comms:.82,observation:1.18,launchNeed:1},
        {id:'elliptical',en:'Elliptical survey orbit',ar:'مدار بيضاوي للمسح',cost:12,mass:5,power:0,fuel:10,days:4,science:10,risk:7,comms:.92,observation:1.28,launchNeed:2},
        {id:'relayOrbit',en:'Relay-support orbit',ar:'مدار داعم لترحيل الاتصال',cost:16,mass:8,power:0,fuel:12,days:5,science:6,risk:6,comms:1.22,observation:1.05,launchNeed:2}
      ],
      lander:[
        {id:'directDescent',en:'Direct transfer to powered descent',ar:'انتقال مباشر إلى الهبوط الموجّه',cost:8,mass:5,power:0,fuel:14,days:2,science:0,risk:13,comms:.76,observation:.94,launchNeed:1},
        {id:'parkingOrbit',en:'Low parking orbit, then descent',ar:'مدار قمري منخفض ثم هبوط',cost:12,mass:7,power:0,fuel:11,days:4,science:3,risk:8,comms:.92,observation:1.08,launchNeed:2},
        {id:'lowEnergyTransfer',en:'Low-energy transfer, longer cruise',ar:'انتقال منخفض الطاقة ورحلة أطول',cost:10,mass:4,power:0,fuel:8,days:7,science:2,risk:6,comms:.88,observation:1.02,launchNeed:2}
      ],
      surface:[
        {id:'directDeployment',en:'Direct transfer and surface deployment',ar:'انتقال مباشر ونشر على السطح',cost:8,mass:5,power:0,fuel:14,days:2,science:1,risk:13,comms:.76,observation:.94,launchNeed:1},
        {id:'orbitDeployment',en:'Polar parking orbit, then deployment',ar:'مدار قطبي ثم نشر الحمولة',cost:12,mass:7,power:0,fuel:11,days:4,science:4,risk:8,comms:.92,observation:1.12,launchNeed:2},
        {id:'stagedTransfer',en:'Low-energy transfer and staged deployment',ar:'انتقال منخفض الطاقة ونشر على مراحل',cost:10,mass:4,power:0,fuel:8,days:7,science:3,risk:6,comms:.88,observation:1.06,launchNeed:2}
      ]
    };
    function isAr(){return lang==='ar';}
    function text(en,ar){return isAr()?ar:en;}
    function money(n){return n+' MC';}
    function applyMode(s){
      var level=$('mgDifficulty').value,mods={easy:[1.25,1.2,.82,1.25,1.12,1.2],standard:[1,1,1,1,1,1],hard:[.88,.88,1.18,.88,.9,.88]}[level];
      s.budget=Math.round(s.budget*mods[0]);s.massLimit=Math.round(s.massLimit*mods[1]);s.powerNeed=Math.max(8,Math.round(s.powerNeed*mods[2]));s.fuelLimit=Math.round(s.fuelLimit*mods[3]);s.commsFactor=Math.min(1,s.commsFactor*mods[4]);s.maxDays=Math.round(s.maxDays*mods[5]);s.difficulty=level;s.sandbox=$('mgSandbox').checked;return s;
    }
    async function buildScenario(force){
      if(!force&&current&&(!goalIds.length||!questions.every(function(q){return !!answers[q.id];})))return null;
      var btn=$('mgBuildMission'),panel=$('mgGeneratorPanel'),oldGoals=goalIds.slice();
      btn.disabled=true;btn.setAttribute('aria-busy','true');panel.classList.remove('is-ready','is-error');panel.classList.add('is-loading');$('mgBuildNote').textContent=text('Building scenario…','جارٍ تجهيز السيناريو…');$('mgGeneratorStatus').textContent=text('Setting up the selected lunar path, science goal, and game constraints…','جارٍ تجهيز مسار القمر والهدف العلمي وقيود اللعبة المختارة…');
      var input={missionType:missionType,site:selectedSite,objectives:objectives.filter(function(o){return missionObjectives[missionType].indexOf(o.id)>=0;}),challenges:challenges};
      try{
        var generated=await window.NOVA_SCENARIO_GENERATOR.generate(input),scenario=generated.scenario;
        runNumber++;current=applyMode({id:'NOVA | '+String(runNumber).padStart(3,'0'),mission:missionType,site:selectedSite||null,objective:objectives.filter(function(o){return o.id===scenario.objectiveId;})[0],challenge:challenges.filter(function(c){return c.id===scenario.challengeId;})[0],budget:scenario.budget,massLimit:scenario.massLimit,powerNeed:scenario.powerNeed,fuelLimit:scenario.fuelLimit,commsFactor:scenario.commsFactor,maxDays:scenario.maxDays,generatedBy:generated.mode,title:scenario.title,scenarioBrief:scenario.brief,segments:scenario.segments,sourceRefs:scenario.sourceRefs,dataStatus:'SIMPLIFIED'});
        goalIds=oldGoals.filter(function(id){return missionObjectives[missionType].indexOf(id)>=0;});if(!goalIds.length)goalIds=[current.objective.id];
        answers={};stationIndex=0;lastDecision=null;lastOutcome=null;render();
        panel.classList.add('is-ready');$('mgBuildNote').textContent=text('Scenario ready · adjust any choice','السيناريو جاهز · عدّل أي اختيار');$('mgGeneratorStatus').textContent=text('Scenario ready. It uses NASA resources for mission structure; all resource numbers are simplified game values.','السيناريو جاهز. استُخدمت موارد NASA لبنية المهمة، أما أرقام الموارد فمبسّطة للعبة.');
        return current;
      }catch(err){panel.classList.add('is-error');$('mgBuildNote').textContent=text('Could not build scenario','تعذر إنشاء السيناريو');$('mgGeneratorStatus').textContent=text('Scenario generation failed: ','تعذر إنشاء السيناريو: ')+(err.message||'unknown error');throw err;}
      finally{btn.removeAttribute('aria-busy');panel.classList.remove('is-loading');updateBuildButton();}
    }
    function updateBuildButton(){
      var complete=!!current&&goalIds.length>0&&questions.every(function(q){return !!answers[q.id];}),btn=$('mgBuildMission'),panel=$('mgGeneratorPanel');
      btn.disabled=!complete||panel.classList.contains('is-loading');
      btn.setAttribute('aria-disabled',String(btn.disabled));
      if(!panel.classList.contains('is-loading'))$('mgBuildNote').textContent=complete?text('Choices complete · ready to generate','اكتملت الاختيارات · جاهز للإنشاء'):text('Complete every choice below first','أكمل كل الاختيارات بالأسفل أولًا');
    }
    function optionsFor(q){
      if(q.id==='profile')return profileOptions[missionType]||q.options;
      if(q.id==='trajectory')return trajectoryOptions[missionType]||trajectoryOptions.lander;
      if(q.id==='instrument')return q.options;
      return q.options;
    }
    function fitsGoals(instrument,ids){return ids.every(function(id){return instrument.targets.indexOf(id)>=0;});}
    function canPairGoal(id){var ids=goalIds.concat(id);return questions.filter(function(q){return q.id==='instrument';})[0].options.some(function(item){return fitsGoals(item,ids);});}
    function toggleGoal(id){
      if(goalIds.indexOf(id)<0&&goalIds.length&& !canPairGoal(id))return;
      if(goalIds.indexOf(id)>=0){if(goalIds.length===1)return;goalIds=goalIds.filter(function(x){return x!==id;});}
      else if(goalIds.length<2)goalIds.push(id);
      current.objective=objectives.filter(function(o){return o.id===goalIds[0];})[0];
      var instrument=getOption('instrument',answers.instrument);
      if(instrument&&!goalIds.every(function(goal){return instrument.targets.indexOf(goal)>=0;}))delete answers.instrument;
      if(lastDecision&&lastDecision.qid==='instrument')lastDecision=null;lastOutcome=null;render();
    }
    function renderGoals(){
      var list=$('mgGoalList');list.innerHTML='';
      $('mgGoalsTitle').textContent=text('Choose your science goals','اختر أهدافك العلمية');
      objectives.filter(function(o){return missionObjectives[missionType].indexOf(o.id)>=0;}).forEach(function(o){
        var active=goalIds.indexOf(o.id)>=0,blocked=!active&&goalIds.length>0&&!canPairGoal(o.id),b=document.createElement('button');b.type='button';b.disabled=blocked;b.className='mg-goal'+(active?' selected':'')+(blocked?' unavailable':'');b.setAttribute('aria-pressed',active?'true':'false');
        b.innerHTML='<b>'+text(o.en,o.ar)+'</b><span>'+text(active?'Selected goal':blocked?'No shared instrument supports both goals':'Add goal',active?'هدف محدد':blocked?'لا توجد أداة تدعم الهدفين معًا':'أضف هدفًا')+'</span>';
        b.addEventListener('click',function(){toggleGoal(o.id);});list.appendChild(b);
      });
      $('mgGoalsNote').textContent=text('Choose up to 2. An added goal increases modeled power and data needs. All selected goals must share one instrument.','اختر هدفين كحد أقصى. الهدف الإضافي يزيد احتياج الطاقة والبيانات في النموذج. يجب أن تدعم الأداة كل الأهداف المختارة.');
    }
    function getOption(qid,oid){var q=questionById[qid];return q&&optionsFor(q).find(function(o){return o.id===oid&&(qid!=='instrument'||fitsGoals(o,goalIds));});}
    function totals(){
      var r={cost:0,mass:0,power:0,fuel:0,science:0,data:0,days:0,bandwidth:0,payload:0,risk:0,reliability:100};
      var l=getOption('launcher',answers.launcher),p=getOption('power',answers.power),i=getOption('instrument',answers.instrument),c=getOption('comms',answers.comms),f=getOption('profile',answers.profile);
      var route=getOption('trajectory',answers.trajectory);
      [l,p,i,c,f,route].forEach(function(o){if(!o)return;r.cost+=o.cost||0;r.mass+=o.mass||0;r.power+=o.power||0;r.fuel+=o.fuel||0;r.science+=o.science||0;r.risk+=o.risk||0;r.reliability=Math.min(r.reliability,o.reliability||100);});
      if(current.site){r.cost+=current.site.cost;r.fuel+=current.site.fuel;r.risk+=current.site.risk;}
      var extra=objectives.filter(function(o){return goalIds.slice(1).indexOf(o.id)>=0;});
      r.goalPower=extra.reduce(function(sum,o){return sum+o.power;},0);r.data=(i?(i.data||0):0)+extra.reduce(function(sum,o){return sum+o.data;},0);
      r.operationDays=f?f.days:0;r.transitDays=route?route.days:0;r.days=r.operationDays+r.transitDays;r.bandwidth=c?c.bandwidth:0;r.payload=l?l.payload:0;r.routeClass=l?l.routeClass:0;r.routeNeed=route?route.launchNeed:0;
      if(i)goalIds.forEach(function(id){var goal=objectives.filter(function(o){return o.id===id;})[0];if(goal&&goal.fav.indexOf(i.id)>=0)r.science+=14+(goal.science||0);});
      r.science+=route?(route.science||0):0;
      r.generatedData=r.data*r.operationDays*(route?route.observation||1:1)*(f?f.observation||1:1);
      r.downlink=r.bandwidth*10.8*r.days*current.commsFactor*current.challenge.comm*(route?route.comms||1:1);
      r.powerAvailable=p?p.power*current.challenge.solar*(current.site?current.site.solar:1):0;
      r.neededPower=current.powerNeed+(i?(i.power||0):0)+(f?(f.power||0):0)+r.goalPower;
      return r;
    }
    function stats(){
      var r=totals(),vals=[
        [text('Budget','الميزانية'),money(current.budget),money(r.cost),r.cost?Math.max(0,current.budget-r.cost)+' MC left':text('Choose answers','اختر إجابات'),r.cost,current.budget],
        [text('Mass','الكتلة'),current.massLimit+' MU'+(r.payload?' | '+r.payload+' MU':' | —'),r.mass+' MU',text('mission / launch limits','حد المهمة / الإطلاق'),r.mass,Math.min(current.massLimit,r.payload||current.massLimit)],
        [text('Power','الطاقة'),r.powerAvailable.toFixed(0)+' PU/day',r.neededPower+' PU/day',text('available / required','المتاح / المطلوب'),r.neededPower,r.powerAvailable],
        [text('Fuel','الوقود'),current.fuelLimit+' FU',r.fuel+' FU',text('reserve / required','الاحتياطي / المطلوب'),r.fuel,current.fuelLimit],
        [text('Launch path fit · game tier','توافق الصاروخ والمسار · مستوى اللعبة'),r.routeClass+' / '+r.routeNeed,r.routeNeed<=r.routeClass?text('Compatible','متوافق'):text('Needs a higher-capability launcher','يحتاج صاروخًا بقدرة أعلى'),text('vehicle class / route demand','فئة الصاروخ / متطلبات المسار'),r.routeNeed,r.routeClass],
        [text('Data return','إرجاع البيانات'),r.downlink.toFixed(0)+' GB',r.generatedData.toFixed(0)+' GB',text('capacity / generated','السعة / المُنتَج'),r.generatedData,r.downlink],
        [text('Communications','الاتصالات'),r.bandwidth+' Mbps',Math.round(current.commsFactor*current.challenge.comm*100)+'%',text('bandwidth / link availability','السعة / توافر الاتصال'),current.commsFactor*current.challenge.comm*100,100],
        [text('Mission time','زمن المهمة'),current.maxDays+' days',r.days+' days',text('limit / selected','الحد / المختار'),r.days,current.maxDays]
      ];
      $('mgStats').innerHTML='';vals.forEach(function(v){var d=document.createElement('div'),used=Number(v[4])||0,limit=Number(v[5])||0,pct=limit?Math.min(100,Math.round(used/limit*100)):0;d.className='mg-stat';d.innerHTML='<span>'+v[0]+'</span><b>'+v[2]+' <small>/ '+v[1]+'</small></b><div class="mg-meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'"><i style="width:'+pct+'%"></i></div><em>'+v[3]+'</em>'; $('mgStats').appendChild(d);});
      var totalCost=r.cost;
      var e=document.createElement('div');e.className='mg-stat mg-efficiency';e.innerHTML='<span>'+text('Science efficiency · SIMPLIFIED','كفاءة العلم · مبسّطة')+'</span><b>'+(totalCost? (totalCost/Math.max(r.science,1)).toFixed(2)+' MC / science point':'—')+'</b><em>'+text('Lower game cost per science point is better; no real-dollar conversion.','تكلفة لعبة أقل لكل نقطة علمية أفضل؛ لا تحويل إلى دولارات واقعية.')+'</em>'; $('mgStats').appendChild(e);
    }
    function renderTradeoff(){
      var grid=$('mgTradeGrid'),title=$('mgTradeTitle'),summary=$('mgTradeSummary'),tip=$('mgDecisionTip');
      title.textContent=text('Decision impact','أثر القرار');grid.innerHTML='';
      if(!lastDecision){summary.textContent=text('Pick an option to see its effect','اختر قرارًا لعرض أثره');tip.textContent=text('Mission choices trade science return against budget, mass, power, fuel, communications and time. Values are simplified for the game.','توازن قرارات المهمة بين العائد العلمي والميزانية والكتلة والطاقة والوقود والاتصال والزمن. القيم مبسطة للعبة.');return;}
      var o=lastDecision.option,id=lastDecision.qid,items=[];
      if(id==='launcher')items=[[text('Payload capacity','سعة الحمولة'),o.payload+' MU'],[text('Launch route tier','فئة المسار'),o.routeClass],[text('Budget','الميزانية'),'+ '+o.cost+' MC']];
      else if(id==='power')items=[[text('Power output','إنتاج الطاقة'),o.power+' PU/day'],[text('Spacecraft mass','كتلة المركبة'),'+ '+o.mass+' MU'],[text('Budget','الميزانية'),'+ '+o.cost+' MC']];
      else if(id==='instrument')items=[[text('Science value','العائد العلمي'),'+ '+o.science],[text('Spacecraft mass','كتلة المركبة'),'+ '+o.mass+' MU'],[text('Power need','احتياج الطاقة'),'+ '+o.power+' PU/day'],[text('Data volume','حجم البيانات'),o.data+' GB/day'],[text('Budget','الميزانية'),'+ '+o.cost+' MC']];
      else if(id==='comms')items=[[text('Downlink bandwidth','سعة الإرسال'),o.bandwidth+' Mbps'],[text('Spacecraft mass','كتلة المركبة'),'+ '+o.mass+' MU'],[text('Budget','الميزانية'),'+ '+o.cost+' MC']];
      else if(id==='trajectory')items=[[text('Launch tier needed','فئة الإطلاق المطلوبة'),o.launchNeed],[text('Fuel demand','احتياج الوقود'),'+ '+o.fuel+' FU'],[text('Transit time','زمن العبور'),o.days+' days'],[text('Budget','الميزانية'),'+ '+o.cost+' MC']];
      else items=[[text('Operation duration','مدة التشغيل'),o.days+' days'],[text('Power need','احتياج الطاقة'),'+ '+o.power+' PU/day'],[text('Science value','العائد العلمي'),'+ '+o.science],[text('Budget','الميزانية'),'+ '+o.cost+' MC']];
      summary.textContent=text(lastDecision.labelEn,lastDecision.labelAr);
      items.forEach(function(item){var card=document.createElement('span');card.innerHTML='<small>'+item[0]+'</small><b>'+item[1]+'</b>';grid.appendChild(card);});
      var why=id==='launcher'?text('The launcher must carry the full spacecraft mass and provide enough modeled capability for the selected route. A larger reserve costs more game budget.','يجب أن يحمل الصاروخ كتلة المركبة كاملة وأن يوفّر فئة القدرة المطلوبة للمسار في نموذج اللعبة. الهامش الأكبر يرفع ميزانية اللعبة.'):
        id==='power'?text('More power output can cover demanding instruments and operations, while adding spacecraft mass and cost.','قد يغطي إنتاج الطاقة الأعلى أدوات وعمليات أكثر طلبًا، لكنه يضيف كتلة وتكلفة للمركبة.'):
        id==='instrument'?text('A richer science return creates more data and raises payload cost, mass and power. The downlink must be able to return that data.','العائد العلمي الأعلى ينتج بيانات أكثر ويرفع تكلفة الحمولة وكتلتها واحتياجها للطاقة. يجب أن يتسع الاتصال لإرجاع البيانات.'):
        id==='comms'?text('More bandwidth can return more observations, but the antenna package adds cost and mass.','قد تعيد سعة الاتصال الأعلى ملاحظات أكثر، لكن حزمة الهوائي تضيف تكلفة وكتلة.'):
        id==='trajectory'?text('Orbit and transfer choices change route hardware, fuel, time, observation coverage and the launcher tier required.','تغيّر اختيارات المدار والعبور تجهيزات المسار والوقود والزمن وتغطية الرصد وفئة الصاروخ المطلوبة.'):
        text('Longer operations can collect more science, but consume time, energy and mission resources.','قد تجمع العمليات الأطول علمًا أكثر، لكنها تستهلك الوقت والطاقة وموارد المهمة.');
      tip.textContent=why;
    }
    function render(){
      if(!current)return;
      window.RAED = window.RAED || {}; window.RAED.scenario = Object.assign({},current,{answers:Object.assign({},answers),resources:totals()});
      var pathName=T[lang].envs[MISSIONS.indexOf(missionType)].n;
      $('mgKicker').textContent=text('MISSION PATH / ','مسار المهمة / ')+pathName;
      $('mgTitle').textContent=current.id+' | '+text('Mission design','تصميم المهمة');
      $('mgObjective').textContent=text('Science goal: ','الهدف العلمي: ')+goalIds.map(function(id){var o=objectives.filter(function(x){return x.id===id;})[0];return text(o.en,o.ar);}).join(' + ')+'. '+text('Mission constraint: ','قيد المهمة: ')+text(current.challenge.en,current.challenge.ar);
      var brief=$('mgBrief');brief.innerHTML='';var briefTitle=document.createElement('b'),briefText=document.createElement('span'),segments=document.createElement('span');
      briefTitle.textContent=current.title||text('Lunar mission','مهمة قمرية');briefText.textContent=current.scenarioBrief||text('Build a mission that can observe the selected science goals and return data within its resource limits.','صمّم مهمة ترصد الأهداف العلمية وتعيد البيانات ضمن حدود الموارد.');
      segments.textContent=text('Design flow: need and goals → concept and requirements → design → build and verify → implement. Source: NASA mission-design guide.','تدفق التصميم: الحاجة والأهداف ← المفهوم والمتطلبات ← التصميم ← البناء والتحقق ← التنفيذ. المصدر: دليل NASA لتصميم المهمات.');
      var selectedLauncher=getOption('launcher',answers.launcher),selectedPower=getOption('power',answers.power),selectedInstrument=getOption('instrument',answers.instrument),selectedComms=getOption('comms',answers.comms),selectedProfile=getOption('profile',answers.profile),selectedRoute=getOption('trajectory',answers.trajectory);
      var architecture=document.createElement('span');architecture.textContent=text('Mission segments — Launch: ','قطاعات المهمة — الإطلاق: ')+(selectedLauncher?text(selectedLauncher.en,selectedLauncher.ar):text('choose a launcher','اختر خدمة إطلاق'))+text(' · Space: ',' · الفضاء: ')+(selectedInstrument?text(selectedInstrument.en,selectedInstrument.ar):text('choose an instrument','اختر أداة'))+(selectedPower?' / '+text(selectedPower.en,selectedPower.ar):'')+(selectedProfile?' / '+text(selectedProfile.en,selectedProfile.ar):'')+(selectedRoute?' / '+text(selectedRoute.en,selectedRoute.ar):'')+text(' · Ground: ',' · الأرض: ')+(selectedComms?text(selectedComms.en,selectedComms.ar):text('choose a link','اختر اتصالًا'))+text(' · User: ',' · المستخدم: ')+goalIds.map(function(id){var goal=objectives.find(function(item){return item.id===id;});return goal?text(goal.en,goal.ar):'';}).filter(Boolean).join(' + ');
      brief.appendChild(briefTitle);brief.appendChild(briefText);brief.appendChild(segments);brief.appendChild(architecture);
      renderGoals();renderTradeoff();
      var progress=$('mgProgress');progress.textContent=text('Answers selected: ','الإجابات المختارة: ')+Object.keys(answers).length+' / '+questions.length;
      var root=$('mgGroups');root.innerHTML='';
      questions.forEach(function(q,idx){
        var sec=document.createElement('section');sec.className='mg-group';sec.hidden=idx!==stationIndex;
        var h=document.createElement('h3');h.textContent=text(q.en,q.ar);sec.appendChild(h);
        var hint=document.createElement('p');hint.className='mg-question-hint';
        hint.textContent=q.id==='instrument'?text(q.hintEn+' Unavailable tools do not cover every selected science goal.',q.hintAr+' الأدوات غير المتاحة لا تغطي كل الأهداف العلمية المحددة.'):text(q.hintEn,q.hintAr);
        sec.appendChild(hint);
        var row=document.createElement('div');row.className='mg-options';
        optionsFor(q).forEach(function(o){
          var fits=q.id!=='instrument'||fitsGoals(o,goalIds),b=document.createElement('button');
          b.type='button';b.disabled=!fits;b.className='mg-choice'+(answers[q.id]===o.id?' selected':'')+(!fits?' unavailable':'');
          b.setAttribute('aria-pressed',answers[q.id]===o.id?'true':'false');
          b.innerHTML='<b>'+text(o.en,o.ar)+'</b><span>'+optionText(q.id,o)+'</span>';
          if(!fits){var why=document.createElement('em');why.textContent=text('Does not support every selected science goal','لا تدعم جميع الأهداف العلمية المحددة');b.appendChild(why);}
          b.addEventListener('click',function(){
            if(b.disabled)return;
            answers[q.id]=o.id;lastDecision={qid:q.id,option:o,labelEn:q.en,labelAr:q.ar};lastOutcome=null;
            if(stationIndex<questions.length-1)stationIndex++;
            render();var updated=document.getElementById('q-'+questions[stationIndex].id);
            if(updated)updated.scrollIntoView({block:'nearest',behavior:'smooth'});
          });
          row.appendChild(b);
        });
        sec.appendChild(row);sec.id='q-'+q.id;root.appendChild(sec);
      });
      renderStations();updateBuildButton();
      stats();$('mgResult').classList.remove('show');$('mgAnalogue').hidden=true;$('mgLesson').hidden=true;$('mgTimeline').hidden=true;$('mgRun').disabled=Object.keys(answers).length!==questions.length||!goalIds.length;$('mgRetry').hidden=true;$('mgManual').hidden=true;$('mgAuto').hidden=true;$('mgControlLabel').hidden=true;$('mgSave').hidden=true;$('mgPrint').hidden=true;$('mgExport').hidden=true;$('mgShare').hidden=true;
      $('mgHint').textContent=text('Live resource use updates after every answer.','تتحدث الموارد المستخدمة مباشرة بعد كل إجابة.');
    }
    function optionText(qid,o){
      var en='',ar='';
      if(qid==='launcher'){en='Cost '+money(o.cost)+' | payload '+o.payload+' MU | route tier '+o.routeClass+' (game value) | fuel '+o.fuel+' FU';ar='التكلفة '+money(o.cost)+' | الحمولة '+o.payload+' MU | فئة المسار '+o.routeClass+' (قيمة لعبة) | الوقود '+o.fuel+' FU';}
      else if(qid==='power'){en='Cost '+money(o.cost)+' | mass '+o.mass+' MU | output '+o.power+' PU/day';ar='التكلفة '+money(o.cost)+' | الكتلة '+o.mass+' MU | الإنتاج '+o.power+' PU/day';}
      else if(qid==='instrument'){en='Cost '+money(o.cost)+' | mass '+o.mass+' MU | power '+o.power+' PU/day | data '+o.data+' GB/day | science '+o.science;ar='التكلفة '+money(o.cost)+' | الكتلة '+o.mass+' MU | الطاقة '+o.power+' PU/day | البيانات '+o.data+' GB/day | العلم '+o.science;}
      else if(qid==='comms'){en='Cost '+money(o.cost)+' | mass '+o.mass+' MU | bandwidth '+o.bandwidth+' Mbps';ar='التكلفة '+money(o.cost)+' | الكتلة '+o.mass+' MU | سعة الاتصال '+o.bandwidth+' Mbps';}
      else if(qid==='trajectory'){en='Cost '+money(o.cost)+' | added mass '+o.mass+' MU | fuel '+o.fuel+' FU | transit '+o.days+' days | launch tier '+o.launchNeed+' needed';ar='التكلفة '+money(o.cost)+' | كتلة إضافية '+o.mass+' MU | الوقود '+o.fuel+' FU | عبور '+o.days+' يومًا | فئة الإطلاق المطلوبة '+o.launchNeed;}
      else {en='Cost '+money(o.cost)+' | mass '+o.mass+' MU | fuel '+o.fuel+' FU | '+o.days+' ops days | science +'+o.science+' | risk '+o.risk+'%';ar='التكلفة '+money(o.cost)+' | الكتلة '+o.mass+' MU | الوقود '+o.fuel+' FU | '+o.days+' يوم تشغيل | العلم +'+o.science+' | المخاطر '+o.risk+'%';}
      return text(en,ar);
    }
    function buildReadiness(checks,aligned){
      var sources=window.NOVA_RESOURCE_CATALOG.sources,failed=checks.filter(function(item){return item.used>item.limit;}),saved=savedReports().some(function(item){return item.path===missionType;});
      var data=checks.filter(function(item){return item.en==='Data return';})[0],segments=['launch','space','ground','users'].every(function(key){return current.segments&&current.segments[key];});
      var criteria=[
        {en:'Science goal and instrument fit',ar:'توافق الهدف العلمي مع الأداة',state:aligned?'covered':'review',detail:aligned?text('The selected instrument supports every selected goal.','الأداة المختارة تدعم جميع الأهداف المحددة.'):text('Review the instrument choice against the science goals.','راجع توافق الأداة مع الأهداف العلمية.'),refs:['science-missions','webb-game']},
        {en:'End-to-end mission architecture',ar:'بنية المهمة من البداية للنهاية',state:segments?'concept':'review',detail:segments?text('Launch, space, ground, and user segments are represented at concept level.','قطاعات الإطلاق والفضاء والأرض والمستخدمين ممثلة على مستوى المفهوم.'):text('One or more mission segments are not represented.','هناك قطاع واحد أو أكثر غير ممثل في المهمة.'),refs:['science-missions','mission-design-lab','vr-mission-2023']},
        {en:'Resource feasibility',ar:'جدوى الموارد',state:failed.length?'review':'covered',detail:failed.length?text('Resolve the resource checks listed above before treating this design as feasible.','عالج قيود الموارد غير المجتازة أعلاه قبل اعتبار التصميم ممكنًا.'):text('The selected design fits the game resource limits.','التصميم المختار يلتزم بحدود موارد اللعبة.'),refs:['mission-design-lab','cml']},
        {en:'Science data and ground link',ar:'البيانات العلمية والاتصال الأرضي',state:data&&data.used<=data.limit?'covered':'review',detail:data&&data.used<=data.limit?text('Modeled data volume fits the selected communications return capacity.','حجم البيانات في النموذج يناسب سعة الاتصال المختارة لإعادتها.'):text('Adjust the instrument data volume or communications capacity.','عدّل حجم بيانات الأداة أو سعة الاتصال.'),refs:['mission-design-lab','cubesat-101']},
        {en:'Alternative design comparison',ar:'مقارنة بدائل التصميم',state:saved?'covered':'pending',detail:saved?text('A saved design for this mission path is available for comparison.','يوجد تصميم محفوظ لهذا المسار لمقارنته بالتصميم الحالي.'):text('Save another design on this mission path to compare alternatives.','احفظ تصميمًا آخر للمسار نفسه كي تقارن البدائل.'),refs:['mission-design-lab','cml','csa-games']},
        {en:'Risk mitigation and verification',ar:'تخفيف المخاطر والتحقق',state:'partial',detail:text('Stress events are simulated, but NOVA does not produce verified engineering mitigations or test evidence.','تُحاكى أحداث الضغط، لكن NOVA لا تنتج خطط تخفيف هندسية موثقة أو أدلة اختبار.'),refs:['cml','cubesat-101','mission-design-lab']}
      ];
      var next=!aligned?text('Choose an instrument that supports every science goal.','اختر أداة تدعم كل الأهداف العلمية.'):failed.length?text('Redesign the choices that exceed the game resource limits.','أعد تصميم الخيارات التي تجاوزت حدود موارد اللعبة.'):!saved?text('Save and compare a second design on this mission path.','احفظ تصميمًا ثانيًا لهذا المسار وقارنه.'):text('Add a documented risk response and a way to verify the key requirements.','أضف استجابة موثقة للمخاطر وطريقة للتحقق من المتطلبات الأساسية.');
      return {name:'NOVA resource-based educational readiness',method:'Adapted from the linked mission-design, concept-maturity, CubeSat, and learning-game resources; not an official NASA/JPL rating.',criteria:criteria,nextStep:next,sourceIds:Array.from(new Set(criteria.reduce(function(ids,item){return ids.concat(item.refs);},[]))).filter(function(id){return sources.some(function(source){return source.id===id;});})};
    }
    function readinessHtml(report){
      var sources=window.NOVA_RESOURCE_CATALOG.sources,stateNames={covered:['Covered in game','مغطّى في اللعبة'],concept:['Concept level only','على مستوى المفهوم فقط'],review:['Needs review','يحتاج مراجعة'],pending:['Not compared yet','لم تتم المقارنة بعد'],partial:['Partially modeled','مُمثّل جزئيًا']};
      var rows=report.criteria.map(function(item){
        var links=item.refs.map(function(id){var source=sources.find(function(entry){return entry.id===id;});return source?'<a href="'+source.url+'" target="_blank" rel="noopener">'+source.title+'</a>':'';}).filter(Boolean).join(' · ');
        return '<li class="mg-ready-item '+item.state+'"><div><b>'+text(item.en,item.ar)+'</b><span>'+text(item.detail,item.detail)+'</span><small>'+links+'</small></div><strong>'+text(stateNames[item.state][0],stateNames[item.state][1])+'</strong></li>';
      }).join('');
      return '<section class="mg-readiness"><header><small>'+text('RESOURCE-BASED REVIEW','مراجعة مستندة إلى الموارد')+'</small><h4>'+text('NOVA educational readiness checklist','قائمة جاهزية NOVA التعليمية')+'</h4></header><p>'+text('Criteria are adapted from linked NASA/JPL mission-design resources and CSA learning-game references. This is an educational assessment, not an official agency review or mission certification.','المعايير مستوحاة من موارد NASA/JPL لتصميم المهمات ومراجع وكالة الفضاء الكندية للألعاب التعليمية. هذا تقييم تعليمي وليس مراجعة رسمية من جهة فضائية أو اعتمادًا للمهمة.')+'</p><ul>'+rows+'</ul><p class="mg-ready-next"><b>'+text('Recommended next step: ','الخطوة التالية المقترحة: ')+text(report.nextStep,report.nextStep)+'</b></p></section>';
    }
    function scienceDataPlanHtml(resources,instrument){
      var products={
        ice:['Polar ice distribution and confidence map','خريطة توزيع الجليد القطبي ودرجة الثقة في الرصد'],
        seismic:['Seismic event records and a subsurface structure summary','سجلات الأحداث الزلزالية وملخص بنية ما تحت السطح'],
        landing:['Terrain elevation and hazard map for the landing corridor','خريطة ارتفاعات ومخاطر تضاريس مسار الهبوط'],
        regolith:['Soil composition spectra and sample record','أطياف تركيب التربة وسجل العينة']
      };
      var rows=goalIds.map(function(id){var goal=objectives.find(function(item){return item.id===id;}),product=products[id];return '<li><b>'+text(goal.en,goal.ar)+'</b><span>'+text('Data product: ','ناتج البيانات: ')+text(product[0],product[1])+'</span></li>';}).join('');
      var dataPass=resources.generatedData<=resources.downlink,schedulePass=resources.days<=current.maxDays,fit=goalIds.every(function(id){var goal=objectives.find(function(item){return item.id===id;});return goal&&goal.fav.indexOf(instrument.id)>=0;}),checksPass=fit&&dataPass&&schedulePass;
      var verify=text('Verification: confirm the selected instrument supports each goal, then check that the modeled observations fit the communications return capacity and mission schedule. These are educational acceptance checks, not flight requirements.','التحقق: تأكد أن الأداة المختارة تدعم كل هدف، ثم راجع توافق حجم الرصد المقدر مع سعة الاتصال وجدول المهمة. هذه معايير قبول تعليمية وليست متطلبات طيران فعلية.');
      var status=checksPass?text('Current design passes the modeled science-data checks.','التصميم الحالي يجتاز فحوصات بيانات العلم في النموذج.'):text('Review instrument fit, downlink capacity, or mission schedule.','راجع توافق الأداة أو سعة الاتصال أو جدول المهمة.');
      return '<section class="mg-data-plan"><header><small>'+text('NEED → DATA REQUIREMENT → VERIFICATION','الحاجة ← متطلب البيانات ← التحقق')+'</small><h4>'+text('Science data products','نواتج البيانات العلمية')+'</h4></header><ul>'+rows+'</ul><p>'+verify+'</p><p class="mg-data-status '+(checksPass?'pass':'review')+'"><b>'+status+'</b> '+text('Modeled volume: ','حجم البيانات في النموذج: ')+resources.generatedData.toFixed(1)+' / '+resources.downlink.toFixed(1)+' GB · '+text('schedule: ','الجدول: ')+resources.days+' / '+current.maxDays+' '+text('days.','أيام.')+'</p><small>'+text('Science mission design learning pattern; NOVA volumes and limits remain simplified game values.','نمط تعليمي من دليل تصميم المهمات العلمية؛ أحجام البيانات والحدود في NOVA تظل قيماً مبسطة للعبة.')+'</small></section>';
    }
    function evaluate(){
      if(Object.keys(answers).length!==questions.length)return;
      var r=totals(),l=getOption('launcher',answers.launcher),i=getOption('instrument',answers.instrument),f=getOption('profile',answers.profile);
      var route=getOption('trajectory',answers.trajectory),profile=getOption('profile',answers.profile);
      current.objectiveIds=goalIds.slice();
      var checks=[
        {en:'Budget',ar:'الميزانية',used:r.cost,limit:current.budget,unit:'MC'},
        {en:'Launch mass',ar:'الكتلة',used:r.mass,limit:Math.min(current.massLimit,r.payload),unit:'MU'},
        {en:'Launch path capability',ar:'قدرة الصاروخ على المسار',used:r.routeNeed,limit:r.routeClass,unit:'game tier'},
        {en:'Power',ar:'الطاقة',used:r.neededPower,limit:r.powerAvailable,unit:'PU/day'},
        {en:'Fuel',ar:'الوقود',used:r.fuel,limit:current.fuelLimit,unit:'FU'},
        {en:'Data return',ar:'إرجاع البيانات',used:r.generatedData,limit:r.downlink,unit:'GB'},
        {en:'Mission time',ar:'زمن المهمة',used:r.days,limit:current.maxDays,unit:'days'}
      ];
      var failed=checks.filter(function(c){return c.used>c.limit;}),blocked=current.sandbox?[]:failed;
      var aligned=goalIds.every(function(id){var goal=objectives.filter(function(o){return o.id===id;})[0];return goal&&goal.fav.indexOf(i.id)>=0;});
      var readiness=buildReadiness(checks,aligned),readinessBlock=readinessHtml(readiness),requirementsBlock=scienceDataPlanHtml(r,i);
       var siteRisk=current.site?current.site.risk:0;
       var reliability=Math.max(45,Math.min(99,Math.round((l.reliability+getOption('power',answers.power).reliability+getOption('comms',answers.comms).reliability)/3-f.risk-siteRisk+(aligned?5:0))));
      var success=blocked.length===0&&reliability>=60;
      var rating=success?(reliability>=85?'A':'B'):(failed.length<=2?'C':'D');
      var result=$('mgResult'),title=current.sandbox?text('Sandbox evaluation complete','اكتمل تقييم وضع التجربة'):success?text('Mission ready for flight','المهمة جاهزة للإطلاق'):text('Mission needs a redesign','المهمة تحتاج إلى إعادة تصميم');
      var details=checks.map(function(c){var ok=c.used<=c.limit;return '<li class="'+(ok?'pass':'fail')+'"><b>'+(ok?'+':'x')+' '+text(c.en,c.ar)+'</b><span>'+Number(c.used.toFixed?c.used.toFixed(1):c.used)+' / '+c.limit+' '+c.unit+'</span></li>';}).join('');
      var causes=failed.map(function(c){
        if(c.en==='Budget')return text('The chosen launch, power, instrument, route and site costs add up beyond the mission budget.','تكلفة الإطلاق والطاقة والأداة والمسار والموقع تتجاوز الميزانية.');
        if(c.en==='Launch mass')return text('The spacecraft plus route hardware exceeds the mission mass limit or the chosen launcher payload. Try a lighter route or a larger launcher.','كتلة المركبة وتجهيزات المسار تتجاوز حد المهمة أو حمولة الصاروخ؛ جرّب مسارًا أخف أو صاروخًا أكبر.');
        if(c.en==='Launch path capability')return text('The chosen launcher tier cannot support this route in NOVA’s simplified game model. Choose a more capable launcher or a lower-demand route.','فئة الصاروخ المختارة لا تدعم هذا المسار في نموذج NOVA المبسط. اختر صاروخًا أعلى قدرة أو مسارًا أقل متطلبات.');
        if(c.en==='Power')return text('The instrument and operations need more power than the arrays provide after the scenario and site illumination penalties.','تحتاج الأداة والعمليات طاقة أكثر مما توفره الألواح بعد أثر السيناريو وإضاءة الموقع.');
        if(c.en==='Fuel')return text('The trajectory and mission operation together need more propellant than the mission reserve.','يستهلك مسار الرحلة ونشاط المهمة وقودًا أكثر من الاحتياطي المتاح.');
        if(c.en==='Data return')return text('The instrument generates more data than the selected link can return during its contact window.','تنتج الأداة بيانات أكثر من قدرة الاتصال على إعادتها خلال نافذة الاتصال.');
        return text('Transit plus operations exceed the mission deadline.','يتجاوز زمن العبور والتشغيل الموعد النهائي للمهمة.');
      });
      var goalNote=goalIds.length>1?text('The second goal adds '+r.goalPower+' PU/day and '+(objectives.filter(function(o){return goalIds.slice(1).indexOf(o.id)>=0;}).reduce(function(sum,o){return sum+o.data;},0))+' GB/day to the game model; it raises science return, but also increases power and downlink demand. ','الهدف الثاني يضيف '+r.goalPower+' PU/day و'+objectives.filter(function(o){return goalIds.slice(1).indexOf(o.id)>=0;}).reduce(function(sum,o){return sum+o.data;},0)+' GB/day إلى نموذج اللعبة؛ يزيد العائد العلمي لكنه يرفع طلب الطاقة والاتصال.') : '';
      var instrumentNote=text('Instrument trade-off: '+i.en+' adds '+i.cost+' MC, '+i.mass+' MU, '+i.power+' PU/day and '+i.data+' GB/day for '+i.science+' base science points. These are NOVA game values. ','مقايضة الأداة: '+i.ar+' تضيف '+i.cost+' MC و'+i.mass+' MU و'+i.power+' PU/day و'+i.data+' GB/day مقابل '+i.science+' نقاط علم أساسية. هذه قيم لعبة NOVA. ');
      var explanation=(current.sandbox?text('Sandbox mode: resource limits are advisory. Failed checks remain visible so you can explore the trade-offs. ','وضع التجربة: قيود الموارد استرشادية. تظل الإخفاقات ظاهرة لتتمكن من استكشاف المقايضات. '):'')+instrumentNote+goalNote+(failed.length?causes.join(' '):text('Every hard limit is met. The selected instrument covers the science goals, and the trajectory trades transit time, observation coverage and communications access within the resource limits.','تحققت جميع الحدود. الأداة المختارة تغطي الأهداف العلمية، والمسار يوازن زمن العبور وتغطية الرصد والاتصال ضمن قيود الموارد.'));
      var routeName=route?text(route.en,route.ar):'';
      var efficiency=r.science? (r.cost/r.science).toFixed(2):'∞';
      var reportDate=new Date().toLocaleString(lang==='ar'?'ar-EG':'en-US',{dateStyle:'medium',timeStyle:'short'});
      var goalNames=goalIds.map(function(id){var goal=objectives.filter(function(o){return o.id===id;})[0];return text(goal.en,goal.ar);}).join(' + ');
      result.innerHTML='<div class="mg-result-top"><div><small>'+text('MISSIONFORGE · FLIGHT EVALUATION REPORT','MISSIONFORGE · تقرير تقييم الطيران')+' | '+current.id+'</small><h3>'+title+'</h3><small class="mg-report-date">'+text('Issued ','تاريخ التقرير ')+reportDate+'</small></div><strong class="mg-grade">'+rating+'</strong></div><p>'+text('Science goals: ','الأهداف العلمية: ')+'<b>'+goalNames+'</b></p><p>'+text('Science value','العائد العلمي')+': <b>'+r.science+'</b> | '+text('Game cost per science point (lower is better)','تكلفة اللعبة لكل نقطة علمية (الأقل أفضل)')+': <b>'+efficiency+' MC/point</b> | '+text('Game-model reliability score','درجة الاعتمادية في نموذج اللعبة')+': <b>'+reliability+'%</b></p><p class="mg-explain">'+text('Trajectory selected: ','المسار المختار: ')+routeName+'. '+explanation+'</p><ul class="mg-checks">'+details+'</ul>'+requirementsBlock+readinessBlock+'<p class="mg-attribution">'+text('SDG learning connection: this activity practices systems thinking and engineering trade-offs relevant to quality education (SDG 4), innovation (SDG 9), and responsible resource-use concepts (SDG 12). This is educational relevance, not measured SDG impact. ','ارتباط تعليمي بأهداف التنمية المستدامة: تدرّب اللعبة على التفكير النظمي ومقايضات الهندسة ذات الصلة بالتعليم الجيد (الهدف ٤)، والابتكار (الهدف ٩)، ومفاهيم الاستخدام المسؤول للموارد (الهدف ١٢). هذا ارتباط تعليمي وليس قياسًا لأثر فعلي على الأهداف. ')+text('SIMPLIFIED educational model. MC, MU, PU and FU are game values, not NASA specifications. The science-per-cost score follows the cost/science trade-off idea in JPL Marsbound, but NOVA game points are not Marsbound stars or real dollars.','نموذج تعليمي مبسّط. MC وMU وPU وFU قيم للعبة وليست مواصفات ناسا. يستلهم مقياس العلم/التكلفة فكرة الموازنة في نشاط Marsbound من JPL، لكن نقاط NOVA ليست نجوم Marsbound ولا دولارات حقيقية.')+'</p>';
      result.classList.add('show');$('mgRetry').hidden=false;$('mgManual').hidden=!success;$('mgAuto').hidden=!success;$('mgControlLabel').hidden=!success||missionType==='orbiter';$('mgSave').hidden=false;$('mgPrint').hidden=false;$('mgExport').hidden=false;$('mgShare').hidden=false;
      renderHistoricalLesson(current);
      renderAnalogue(current,r,checks,route,success);
      $('mgManual').textContent=missionType==='orbiter'?text('Run orbital mission','شغّل المهمة المدارية'):text('Fly manually','تحكم يدوي');
      $('mgAuto').textContent=text('Autopilot','طيار آلي');
      if(missionType==='orbiter')$('mgAuto').hidden=true;
      $('mgManual').onclick=function(){MissionTimeline.start(current,r,route,profile,'manual');};
      $('mgAuto').onclick=function(){MissionTimeline.start(current,r,route,profile,'autopilot');};
      $('mgSave').onclick=function(){saveReport(serializeOutcome(lastOutcome));};
      $('mgPrint').onclick=function(){window.print();};
      $('mgExport').onclick=function(){exportDesign(lastOutcome);};
      $('mgShare').onclick=function(){shareReport(lastOutcome);};
      lastOutcome={success:success,checks:checks,mission:current,resources:r,route:route,profile:profile,reliability:reliability,rating:rating,readiness:readiness,flight:null,answers:Object.assign({},answers)};
    }
    function renderStations(){
      var track=$('mgStationTrack');track.innerHTML='';
      stationNames.forEach(function(n,i){var b=document.createElement('button');b.type='button';b.className='mg-station-stop'+(i===stationIndex?' active':'')+(answers[questions[i].id]?' complete':'');b.disabled=i>Object.keys(answers).length;b.textContent=(i+1)+'. '+text(n[0],n[1]);b.addEventListener('click',function(){stationIndex=i;render();});track.appendChild(b);});
      $('mgStationKicker').textContent=text('MISSION ARCHITECT · STATION ','مهندس المهمة · المحطة ')+(stationIndex+1)+text(' OF 6',' من ٦');
      $('mgStationName').textContent=text(stationNames[stationIndex][0],stationNames[stationIndex][1]);
      $('mgStationBack').textContent=text('Previous station','المحطة السابقة');$('mgStationBack').disabled=stationIndex===0;
      $('mgStationNext').textContent=stationIndex===questions.length-1?text('Ready to review','جاهز للمراجعة'):text('Next station','المحطة التالية');
      $('mgStationNext').disabled=!answers[questions[stationIndex].id]||stationIndex===questions.length-1;
      $('mgStationChoice').textContent=answers[questions[stationIndex].id]?text('Decision saved · live resources updated','تم حفظ القرار · تحدّثت الموارد مباشرة'):text('Choose one option to continue.','اختر خيارًا للمتابعة.');
    }
    function renderGuide(){
      var box=$('mgGuideContent');box.replaceChildren();
      guideGroups.forEach(function(group){
        var section=document.createElement('section'),title=document.createElement('h3');section.className='mg-guide-group';title.textContent=text(group.title[0],group.title[1]);section.appendChild(title);
        group.items.forEach(function(item){var row=document.createElement('article'),name=document.createElement('b'),desc=document.createElement('p');row.className='mg-guide-item';name.textContent=text(item[0][0],item[0][1]);desc.textContent=text(item[1][0],item[1][1]);row.appendChild(name);row.appendChild(desc);section.appendChild(row);});
        box.appendChild(section);
      });
    }
    function closeGuide(){var panel=$('mgGuide');panel.hidden=true;$('mgGuideOpen').setAttribute('aria-expanded','false');$('mgGuideOpen').focus();}
    $('mgGuideOpen').addEventListener('click',function(){renderGuide();$('mgGuide').hidden=false;$('mgGuideOpen').setAttribute('aria-expanded','true');$('mgGuideClose').focus();});
    $('mgGuideClose').addEventListener('click',closeGuide);
    $('mgGuide').addEventListener('click',function(e){if(e.target===$('mgGuide'))closeGuide();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!$('mgGuide').hidden)closeGuide();});
    $('mgStationBack').addEventListener('click',function(){if(stationIndex>0){stationIndex--;render();}});
    $('mgStationNext').addEventListener('click',function(){if(stationIndex<questions.length-1&&answers[questions[stationIndex].id]){stationIndex++;render();}});
    $('mgDifficulty').addEventListener('change',function(){if(current)buildScenario(true);});
    $('mgSandbox').addEventListener('change',function(){if(current){current.sandbox=this.checked;lastOutcome=null;render();}});
    function redesign(){answers={};stationIndex=0;lastDecision=null;lastOutcome=null;render();window.scrollTo({top:0,behavior:'smooth'});}
    $('mgBuildMission').addEventListener('click',buildScenario);$('mgRetry').addEventListener('click',redesign);$('mgRun').addEventListener('click',evaluate);
     return {generate:function(type,site){if(type&&missionObjectives[type])missionType=type;selectedSite=site||null;return buildScenario(true);},getCurrent:function(){return current;},getOutcome:function(){return lastOutcome;},setFlight:function(result){if(lastOutcome)lastOutcome.flight=result;},setDiagnosis:function(diagnosis){if(lastOutcome)lastOutcome.diagnosis=diagnosis;},refreshLanguage:render,refreshGuide:renderGuide};
  })();

  function renderAnalogue(mission,resources,checks,route,success){
    var t=function(en,ar){return lang==='ar'?ar:en;};
    var failed=checks.filter(function(c){return c.used>c.limit;}).map(function(c){return lang==='ar'?c.ar:c.en;}),resultText=mission.sandbox?t('sandbox mode · limits are advisory','وضع التجربة · القيود استرشادية'):success?t('all hard limits pass','اجتياز كل الحدود'):t('redesign required','يلزم إعادة التصميم');
    var box=$('mgAnalogue');box.hidden=false;
    box.innerHTML='<button class="mg-analogue-toggle" id="mgAnalogueToggle" type="button">'+t('Compare design with NASA mission-design practice','قارن التصميم بمنهج ناسا لتصميم المهمات')+'</button><div class="mg-analogue-body" id="mgAnalogueBody" hidden><h3>'+t('Mission design comparison','مقارنة تصميم المهمة')+'</h3><p>'+t('Your design numbers are SIMPLIFIED game values: ','أرقام تصميمك قيم مبسطة للعبة: ')+'<b>'+mission.id+'</b> · '+t('budget','الميزانية')+' '+mission.budget+' MC · '+t('spent','المستخدم')+' '+resources.cost+' MC · '+t('mass limit','حد الكتلة')+' '+mission.massLimit+' MU · '+t('fuel reserve','احتياطي الوقود')+' '+mission.fuelLimit+' FU · '+t('route','المسار')+' '+t(route.en,route.ar)+'.</p><p>'+t('NASA comparison is about design structure: objective → spacecraft/instrument → launch and space segment → ground communications → users. This resources list does not provide a directly comparable lunar mission budget or bill of materials, so NOVA does not claim numeric equivalence.','المقارنة مع ناسا هنا في بنية التصميم: الهدف ← المركبة والأداة ← الإطلاق وقطاع الفضاء ← الاتصالات الأرضية ← المستخدمون. قائمة الموارد لا توفر ميزانية أو قائمة مكونات لمهمة قمرية مماثلة مباشرة؛ لذلك لا تدّعي NOVA تكافؤًا رقميًا.')+'</p><p><b>'+t('NOVA game result: ','نتيجة نموذج اللعبة: ')+resultText+'</b>'+(failed.length?' · '+t('Failed constraints: ','القيود غير المجتازة: ')+failed.join('، '):'')+'. '+t('The score is a game estimate, not mission reliability data.','النتيجة تقدير للعبة وليست بيانات اعتمادية لمهمة حقيقية.')+'</p><p>'+t('Supplemental learning reference: JPL Marsbound compares dollars spent per science star, preferring a lower ratio while respecting constraints. NOVA borrows that decision pattern only; MC and NOVA science points are not dollars or Marsbound stars.','مرجع تعليمي إضافي: يقارن JPL Marsbound المال المصروف لكل نجمة علمية، ويفضّل النسبة الأقل مع احترام القيود. تستعير NOVA نمط القرار فقط؛ وحدات MC ونقاط NOVA ليست دولارات أو نجوم Marsbound.')+'</p><p>'+t('References: ','المراجع: ')+'<a target="_blank" rel="noopener" href="https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/?tab=resources">'+t('official challenge resources','موارد التحدي الرسمية')+'</a> · <a target="_blank" rel="noopener" href="https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf">NASA mission segments</a> · <a target="_blank" rel="noopener" href="https://www.jpl.nasa.gov/edu/resources/lesson-plan/marsbound-mission-to-the-red-planet/">JPL Marsbound</a>.</p></div>';
    $('mgAnalogueToggle').addEventListener('click',function(){var body=$('mgAnalogueBody');body.hidden=!body.hidden;});
  }

  function renderHistoricalLesson(mission){
    var lessons=[
      {id:'luna1',name:'Luna 1 · 1959',en:'Its guidance error missed the planned lunar impact, but the spacecraft still flew by the Moon and entered solar orbit. Lesson: trajectory and navigation margins must be treated as mission-critical.',ar:'أدى خطأ التوجيه إلى تفويت الاصطدام القمري المخطط، لكن المركبة حلقت قرب القمر ودخلت مدارًا شمسيًا. الدرس: هامش المسار والملاحة عنصران حاسمان.',url:'https://www.nasa.gov/wp-content/uploads/2023/04/sp-4524.pdf'},
      {id:'luna3',name:'Luna 3 · 1959',en:'It returned the first images of the lunar far side. Lesson: the observation plan only works when spacecraft geometry, onboard storage, and a usable Earth link line up.',ar:'أعادت أول صور للجانب البعيد من القمر. الدرس: نجاح الرصد يحتاج توافق هندسة المركبة والتخزين على متنها ووصلة اتصال صالحة إلى الأرض.',url:'https://science.nasa.gov/resource/first-close-up-of-the-far-side-of-moon/'},
      {id:'luna9',name:'Luna 9 · 1966',en:'The first successful soft landing showed that the surface could support a spacecraft. Lesson: surface assumptions need evidence from a lander, not just orbital imagery.',ar:'أثبت أول هبوط لين ناجح أن السطح قادر على دعم مركبة. الدرس: افتراضات السطح تحتاج دليلًا من مركبة هبوط، وليس صورًا مدارية فقط.',url:'https://science.nasa.gov/moon/exploration/'},
      {id:'apollo15',name:'Apollo 15 · 1971',en:'The first lunar rover extended science traverses beyond the lander. Lesson: mobility can raise science return, while adding mass, power, operations, and navigation demands.',ar:'وسّعت أول عربة قمرية نطاق الاستكشاف العلمي بعيدًا عن المركبة. الدرس: الحركة قد تزيد العائد العلمي، لكنها تضيف متطلبات للكتلة والطاقة والتشغيل والملاحة.',url:'https://science.nasa.gov/solar-system/moon/history-of-lunar-exploration/'},
      {id:'artemis1',name:'Artemis I · 2022',en:'The integrated flight test validated the rocket, spacecraft, and ground systems together and returned engineering data for later flights. Lesson: evaluate the whole mission system, including ground support and recovery.',ar:'اختبر الطيران المتكامل الصاروخ والمركبة والأنظمة الأرضية معًا وأعاد بيانات هندسية لرحلات لاحقة. الدرس: قيّم منظومة المهمة كاملة، بما فيها الدعم الأرضي والاستعادة.',url:'https://www.nasa.gov/mission/artemis-i/'}
    ];
    var item=lessons[Math.floor(Math.random()*lessons.length)],box=$('mgLesson');
    box.hidden=false;
    box.innerHTML='<small>'+ (lang==='ar'?'درس مستفاد من مهمة حقيقية':'LESSON FROM A REAL LUNAR MISSION') +'</small><h3>'+item.name+'</h3><p>'+(lang==='ar'?item.ar:item.en)+'</p><a target="_blank" rel="noopener" href="'+item.url+'">'+(lang==='ar'?'مرجع تاريخي من NASA':'NASA historical source')+'</a>';
  }

  function serializeOutcome(o){
    if(!o)return null;
    return {format:'NOVA mission report v1',id:o.mission.id,path:o.mission.mission,site:o.mission.site&&o.mission.site.id,objective:o.mission.objective.en,objectives:o.mission.objectiveIds||[o.mission.objective.id],challenge:o.mission.challenge.id,difficulty:o.mission.difficulty,sandbox:!!o.mission.sandbox,decisions:o.answers,trajectory:o.route.en,profile:o.profile.en,resources:o.resources,checks:o.checks,science:o.resources.science,costPerSciencePoint:o.resources.science?(o.resources.cost/o.resources.science):null,reliability:o.reliability,success:o.flight?!!o.flight.success:o.success,flight:o.flight||null,scenario:{title:o.mission.title,brief:o.mission.scenarioBrief,segments:o.mission.segments,sources:o.mission.sourceRefs},readiness:o.readiness?Object.assign({},o.readiness,{sources:o.readiness.sourceIds.map(function(id){var source=window.NOVA_RESOURCE_CATALOG.sources.find(function(item){return item.id===id;});return source?{id:source.id,title:source.title,url:source.url}:null;}).filter(Boolean)}):null,sustainableDevelopment:{type:'educational alignment only',goals:[{id:4,connection:'mission-design learning and systems thinking'},{id:9,connection:'engineering systems and innovation concepts'},{id:12,connection:'trade-offs across simplified mission resources'}]},diagnosis:o.diagnosis||null,dataStatus:'SIMPLIFIED',references:['NASA Space Apps 2026 mission-design resources','JPL Marsbound educational activity','UN Sustainable Development Goals 4, 9, and 12'],created:new Date().toISOString()};
  }
  function diagnoseFlight(result,mission,resources){
    var t=function(en,ar){return lang==='ar'?ar:en;};
    var event=result.randomEvent,failures=result.eventFailures||[],causes=[],tips=[];
    if(event&&event.id==='shadow'){causes.push(text('A longer shadow reduced modeled solar availability below the instrument and operations demand.','امتداد الظل خفّض الطاقة الشمسية المتاحة في النموذج إلى أقل من حاجة الأداة والتشغيل.'));tips.push(text('Reduce instrument power demand or choose a power system with more margin.','خفّض استهلاك الأداة أو اختر نظام طاقة بهامش أكبر.'));}
    if(event&&event.id==='link'){causes.push(text('A temporary ground-link interruption reduced the data returned on this pass.','انقطاع مؤقت في الاتصال الأرضي قلّل البيانات المسترجعة في هذه الدورة.'));tips.push(text('Lower the data volume or select a higher-bandwidth communications option.','قلّل حجم البيانات أو اختر نظام اتصال بسعة إرسال أعلى.'));}
    if(event&&event.id==='window'){causes.push(text('The shortened observation window added modeled time and reduced collected data.','نافذة الرصد الأقصر أضافت زمنًا في نموذج اللعبة وقللت البيانات المجمعة.'));tips.push(text('Choose a shorter transfer or allow more mission time and downlink margin.','اختر عبورًا أقصر أو زد هامش زمن المهمة وسعة الاتصال.'));}
    if(event&&event.id==='terrain'){causes.push(text('Rough terrain required additional modeled fuel during descent.','التضاريس الوعرة احتاجت وقودًا إضافيًا في نموذج الهبوط.'));tips.push(text('Increase landing fuel margin or choose a lower-risk landing profile.','زد هامش وقود الهبوط أو اختر ملف هبوط أقل مخاطرة.'));}
    if(failures.some(function(x){return x.en==='Power';})&&!event)tips.push(text('Review instrument and operations power against the available array output.','راجع طاقة الأداة والتشغيل مقابل إنتاج الألواح المتاح.'));
    if(failures.some(function(x){return x.en==='Fuel';})&&!tips.length)tips.push(text('Keep more fuel reserve or reduce route and landing demand.','احتفظ باحتياطي وقود أكبر أو خفّض احتياج المسار والهبوط.'));
    if(result.flight&&result.flight.reason)causes.push(t('Flight simulator: ','محاكي الطيران: ')+String(result.flight.reason));
    if(failures.length)causes.push(t('Resource limit exceeded: ','تم تجاوز حد مورد: ')+failures.map(function(x){return (lang==='ar'?x.ar:x.en)+' '+x.used+'/'+x.limit+' '+x.unit;}).join(' · '));
    if(!causes.length)causes.push(result.success?t('No modeled event pushed a checked resource beyond its limit.','لم يدفع أي حدث في النموذج موردًا مفحوصًا إلى ما بعد حدّه.'):t('The flight did not complete; use the simulator debrief and resource margins to identify the limiting decision.','لم تكتمل الرحلة؛ استخدم تقرير المحاكي وهوامش الموارد لتحديد القرار المقيّد.'));
    if(!tips.length)tips.push(t('Keep the demonstrated resource margin when refining the design.','حافظ على هامش الموارد الظاهر عند تحسين التصميم.'));
    var local={source:'LOCAL_RULES',causes:causes,recommendations:tips,event:event&&event.id||null};
    var provider=window.NOVA_DIAGNOSTIC_PROVIDER;
    if(typeof provider!=='function')return Promise.resolve(local);
    return Promise.resolve(provider({mission:mission.title,resources:resources,event:event,failures:failures,local:local,allowedNumericStatus:'SIMPLIFIED'})).then(function(ai){
      if(!ai||!Array.isArray(ai.causes)||!Array.isArray(ai.recommendations))return local;
      return {source:'AI_PROVIDER',causes:ai.causes.slice(0,4).map(String),recommendations:ai.recommendations.slice(0,4).map(String),event:local.event};
    }).catch(function(){return local;});
  }
  function exportDesign(outcome){
    var data=serializeOutcome(outcome);if(!data)return;
    var url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=(data.id.replace(/[^a-z0-9_-]/gi,'-')+'-mission-design.json');document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
  async function shareReport(outcome){
    var d=serializeOutcome(outcome);if(!d)return;
    var report=d.id+' | '+d.path+' | '+d.trajectory+' | '+(lang==='ar'?'العلم':'Science')+' '+d.science+' | '+(lang==='ar'?'التكلفة لكل نقطة علمية':'MC per science point')+' '+(d.costPerSciencePoint?d.costPerSciencePoint.toFixed(2):'—')+' | '+(d.success?'PASS':'REDESIGN')+' | SIMPLIFIED game values';
    try{if(navigator.share)await navigator.share({title:'NOVA Flight Evaluation Report',text:report});else if(navigator.clipboard)await navigator.clipboard.writeText(report);else throw new Error('Share is unavailable in this browser.');$('mgHint').textContent=lang==='ar'?'تم تجهيز التقرير للمشاركة.':'Report ready to share.';}catch(e){if(e.name!=='AbortError')$('mgHint').textContent=e.message||'Share cancelled.';}
  }

  function savedReports(){try{return JSON.parse(localStorage.getItem('nova.savedReports')||'[]');}catch(e){return[];}}
  function saveReport(report){
    var items=savedReports();items.push(report);items=items.slice(-20);
    try{localStorage.setItem('nova.savedReports',JSON.stringify(items));}catch(e){}
    $('mgHint').textContent=lang==='ar'?'حُفظ التقرير على هذا الجهاز.':'Report saved on this device.';
    renderSavedComparison();
  }
  function renderSavedComparison(){
    var box=$('mgSaved'),items=savedReports().slice(-2).reverse();
    if(!items.length){box.hidden=false;box.innerHTML='<b>'+ (lang==='ar'?'لا توجد تقارير محفوظة بعد.':'No saved runs yet.') +'</b>';return;}
    box.hidden=false;
    box.innerHTML='<b>'+ (lang==='ar'?'آخر تصميمين محفوظين':'Latest saved designs') +'</b><div class="mg-compare-grid">'+items.map(function(x){return '<article><strong>'+x.id+'</strong><span>'+(x.path||x.mission)+' · '+x.trajectory+'</span><span>'+ (lang==='ar'?'العلم':'Science') +' '+x.science+' · '+ (lang==='ar'?'الاعتمادية':'Reliability') +' '+x.reliability+'%</span><span>'+ (x.success?(lang==='ar'?'نجحت':'Success'):(lang==='ar'?'إعادة تصميم':'Redesign')) +'</span></article>';}).join('')+'</div>';
  }
  $('mgCompare').addEventListener('click',function(){var box=$('mgSaved');box.hidden=!box.hidden;if(!box.hidden)renderSavedComparison();});
  $('mgTimelineClose').addEventListener('click',function(){$('mgTimeline').hidden=true;if(MissionTimeline)MissionTimeline.stop();});
  $('mgSaveFinal').addEventListener('click',function(){var o=MissionGame.getOutcome();if(!o)return;saveReport(serializeOutcome(o));});

  var MissionTimeline=(function(){
    var run=null,steps=[],stepIndex=-1,orbiterTimer=0;
    var sceneView=null;
    var phaseText={
      launch:['Launch and ascent','الإطلاق والصعود'],transfer:['Transfer to the Moon','العبور إلى القمر'],orbit:['Lunar orbit insertion','الدخول إلى المدار القمري'],landing:['Powered landing','الهبوط الموجّه'],operations:['Science operations','العمليات العلمية'],data:['Data return and debrief','إرجاع البيانات والتقرير']
    };
    var eventText={dark:['Scenario constraint: long shadows reduce modeled solar power.','قيد المهمة: الظلال الطويلة تخفض الطاقة الشمسية في نموذج اللعبة.'],relay:['Scenario constraint: terrain can interrupt a communications window.','قيد المهمة: قد تقطع التضاريس نافذة اتصال.'],dust:['Scenario constraint: rough terrain raises the modeled landing risk.','قيد المهمة: التضاريس الوعرة ترفع مخاطر الهبوط في النموذج.'],window:['Scenario constraint: a short observation window limits operations.','قيد المهمة: نافذة الرصد القصيرة تحد من العمليات.']};
    var flightEvents=[
      {id:'shadow',phase:'orbit',en:'Unplanned shadow period: available solar power drops for this phase.',ar:'حدث مفاجئ: يطول الظل وتنخفض الطاقة الشمسية المتاحة في هذه المرحلة.',power:.72},
      {id:'link',phase:'orbit',en:'Ground link interruption: less data can be returned on this pass.',ar:'حدث مفاجئ: ينقطع الاتصال الأرضي مؤقتًا فتقل البيانات المسترجعة في هذه المرحلة.',link:.65},
      {id:'window',phase:'transfer',en:'Observation window shortens: modeled mission time rises and fewer data are collected.',ar:'حدث مفاجئ: تقصر نافذة الرصد فيرتفع زمن المهمة في النموذج وتقل البيانات المجمعة.',days:4,data:.8},
      {id:'terrain',phase:'landing',en:'Unexpected rough patch: the lander spends an extra fuel reserve correcting its descent.',ar:'حدث مفاجئ: تضاريس وعرة تستهلك احتياطي وقود إضافيًا لتصحيح الهبوط.',fuel:5}
    ];
    function makeScene(){
      var canvas=$('missionScene');
      if(!canvas||!window.THREE)return null;
      var renderer,scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,40),craft,orbit,descent,earthPos=new THREE.Vector3(-3,0,0),moonPos=new THREE.Vector3(2.35,0,0),transferCurve,active=false,frame=0;
      try{renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true,powerPreference:'low-power'});}catch(err){$('mgSceneNote').textContent=text('3D rendering is unavailable on this device. The mission concept and timeline remain available.','العرض ثلاثي الأبعاد غير متاح على هذا الجهاز. يظل مفهوم المهمة والخط الزمني متاحين.');return null;}
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));camera.position.set(0,1.2,9.6);
      scene.add(new THREE.HemisphereLight(0xb8d9ff,0x17151b,1.6));var sun=new THREE.DirectionalLight(0xffe8bf,2);sun.position.set(-4,3,5);scene.add(sun);
      function body(pos,r,color,glow){var mesh=new THREE.Mesh(new THREE.SphereGeometry(r,40,28),new THREE.MeshStandardMaterial({color:color,emissive:glow||0x000000,roughness:.9}));mesh.position.copy(pos);scene.add(mesh);}
      body(earthPos,.55,0x3767a2,0x0b1b34);body(moonPos,.43,0xaaa69d,0x201e1b);
      transferCurve=new THREE.QuadraticBezierCurve3(earthPos.clone().add(new THREE.Vector3(.55,.24,0)),new THREE.Vector3(-.15,1.75,0),moonPos.clone().add(new THREE.Vector3(-.4,.28,0)));
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(transferCurve,80,.018,6,false),new THREE.MeshBasicMaterial({color:0x8dc3dd,transparent:true,opacity:.68})));
      var orbitCurve=new THREE.EllipseCurve(moonPos.x,moonPos.y,.72,.43,0,Math.PI*2,false,0);var orbitPts=orbitCurve.getPoints(96).map(function(p){return new THREE.Vector3(p.x,p.y,.02);});orbit=new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPts),new THREE.LineBasicMaterial({color:0xffd97a,transparent:true,opacity:.8}));scene.add(orbit);
      var landStart=moonPos.clone().add(new THREE.Vector3(-.22,.46,.04)),landEnd=moonPos.clone().add(new THREE.Vector3(-.12,.4,.04)),landCurve=new THREE.QuadraticBezierCurve3(landStart,moonPos.clone().add(new THREE.Vector3(-.48,.62,.04)),landEnd);descent=new THREE.Line(new THREE.BufferGeometry().setFromPoints(landCurve.getPoints(32)),new THREE.LineBasicMaterial({color:0xffa56c,transparent:true,opacity:.9}));scene.add(descent);
      craft=new THREE.Mesh(new THREE.OctahedronGeometry(.105,0),new THREE.MeshStandardMaterial({color:0xffdf83,emissive:0x8a5214,emissiveIntensity:.8}));scene.add(craft);
      [[lang==='ar'?'الأرض':'EARTH','mg-scene-earth'],[lang==='ar'?'القمر':'MOON','mg-scene-moon']].forEach(function(item){var el=document.createElement('span');el.className='mg-scene-label '+item[1];el.textContent=item[0];canvas.parentNode.appendChild(el);});
      function resize(){var rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();}
      function animate(){if(!active)return;frame=requestAnimationFrame(animate);craft.rotation.y+=.018;renderer.render(scene,camera);}
      window.addEventListener('resize',resize);
      return{start:function(){active=true;resize();this.move(0);animate();},move:function(idx){var key=steps[idx]||'launch',p;if(key==='launch')p=earthPos.clone().add(new THREE.Vector3(.48,.04,.12));else if(key==='transfer')p=transferCurve.getPoint(.52);else if(key==='orbit')p=moonPos.clone().add(new THREE.Vector3(-.68,.23,.15));else if(key==='landing')p=landEnd.clone();else p=landEnd.clone().add(new THREE.Vector3(.11,0,.04));craft.position.copy(p);orbit.visible=key==='orbit'||key==='landing'||key==='operations'||key==='data';descent.visible=key==='landing'||key==='operations'||key==='data';},stop:function(){active=false;cancelAnimationFrame(frame);}};
    }
    function active(){return !!run;}
    function textPair(pair){return pair[lang==='ar'?1:0];}
    function renderResources(){
      if(!run)return;
      var r=run.resources,c=run.mission,e=run.effects,rows=[['Budget',r.cost,c.budget,' MC'],['Launch mass',r.mass,Math.min(c.massLimit,r.payload),' MU'],['Power',r.neededPower,r.powerAvailable*e.power,' PU/day'],['Fuel',r.fuel+e.fuel,c.fuelLimit,' FU'],['Data return',r.generatedData*e.data,r.downlink*e.link,' GB'],['Time',r.days+e.days,c.maxDays,' days']];
      $('mgLiveResources').innerHTML=rows.map(function(x){var pct=x[2]?Math.min(100,Math.round(x[1]/x[2]*100)):0;return '<span><small>'+ (lang==='ar'?({'Budget':'الميزانية','Launch mass':'كتلة الإطلاق','Power':'الطاقة','Fuel':'الوقود','Data return':'إرجاع البيانات','Time':'الوقت'}[x[0]]||x[0]):x[0]) +'</small><b>'+Number(x[1].toFixed?x[1].toFixed(1):x[1])+'/'+Number(x[2].toFixed?x[2].toFixed(1):x[2])+x[3]+'</b><i><em style="width:'+pct+'%"></em></i></span>';}).join('');
    }
    function resourceSummary(){if(!run)return'';var r=run.resources;return (lang==='ar'?'الموارد المخططة — الميزانية ':'Planned envelope — Budget ')+r.cost+'/'+run.mission.budget+' MC · '+(lang==='ar'?'الكتلة ':'Mass ')+r.mass+'/'+Math.min(run.mission.massLimit,r.payload)+' MU · '+(lang==='ar'?'الوقود ':'Fuel ')+r.fuel+'/'+run.mission.fuelLimit+' FU';}
    function phase(key){
      if(!run)return;
      var selected=steps.indexOf(key);if(selected<0){if(key==='transfer')selected=steps.indexOf('transfer');else if(key==='orbit')selected=steps.indexOf('orbit');else if(key==='landing')selected=steps.indexOf('landing');}
      if(selected<0)return;stepIndex=Math.max(stepIndex,selected);
      Array.prototype.forEach.call($('mgPhaseList').children,function(el,i){el.classList.toggle('done',i<stepIndex);el.classList.toggle('active',i===stepIndex);});
      $('mgTimelineStatus').textContent=textPair(phaseText[key]||phaseText[steps[stepIndex]]);
      $('flightBoardPhase').textContent=textPair(phaseText[key]||phaseText[steps[stepIndex]]);
      var challenge=run.mission.challenge;
      if(run.event&&!run.event.triggered&&key===run.event.phase){run.event.triggered=true;run.effects.power=run.event.power||run.effects.power;run.effects.link=run.event.link||run.effects.link;run.effects.fuel+=run.event.fuel||0;run.effects.days+=run.event.days||0;run.effects.data=run.event.data||run.effects.data;$('mgTimelineEvent').textContent=textPair([run.event.en,run.event.ar]);$('mgTimelineEvent').classList.add('mg-event-live');$('mgLivePhase').textContent=text('EVENT · '+run.event.id.toUpperCase(),'حدث طارئ · '+run.event.id.toUpperCase());}
      else {$('mgTimelineEvent').textContent=textPair(eventText[challenge.id]||eventText.window);$('mgTimelineEvent').classList.remove('mg-event-live');$('mgLivePhase').textContent=textPair(phaseText[key]||phaseText[steps[stepIndex]]);}
      var keys=key==='launch'?['Ascent: W/S pitch · Space stage · I orbital insertion · . time warp','الصعود: W/S للميل · Space لفصل المراحل · I لتأكيد المدار · . لتسريع الزمن']:key==='landing'?['Landing: W/A/S/D steer · Space engine · G descent-rate hold · O autopilot','الهبوط: W/A/S/D للتوجيه · Space للمحرك · G لتثبيت الهبوط · O للطيار الآلي']:key==='transfer'?['Transfer: hold Space for each burn, then press I inside the green ΔV band. K skips cruise.','العبور: اضغط مطولًا Space للحرق، ثم I داخل النطاق الأخضر. K لتخطي زمن العبور.']:['Flight view: click the simulator, then use its on-screen prompts and keyboard hints.','نافذة الطيران: اضغط على المحاكي واتبع تلميحاته ومفاتيح التحكم الظاهرة.'];
      $('flightBoardKeys').textContent=textPair(keys);
      if(sceneView){sceneView.move(selected);$('mgScenePhase').textContent=textPair(phaseText[key]||phaseText[steps[selected]]).toUpperCase();}
      renderResources();
    }
    function start(mission,resources,route,profile,mode){
      window.clearTimeout(orbiterTimer);
      var events=flightEvents.filter(function(e){return mission.mission!=='orbiter'||e.phase!=='landing';});
      run={mission:mission,resources:resources,route:route,profile:profile,mode:mode,effects:{power:1,link:1,fuel:0,days:0,data:1},event:events[Math.floor(Math.random()*events.length)]};stepIndex=-1;
      steps=mission.mission==='orbiter'?['launch','transfer','orbit','operations','data']:['launch','transfer','orbit','landing','operations','data'];
      var list=$('mgPhaseList');list.innerHTML=steps.map(function(k){return '<li data-phase="'+k+'"><span class="phase-dot"></span><b>'+textPair(phaseText[k])+'</b></li>';}).join('');
      $('mgTimeline').hidden=false;$('mgDebrief').hidden=true;
      $('mgTimelineTitle').textContent=lang==='ar'?'خط زمني للمهمة':'Mission timeline';
      var goal=goalIds.map(function(id){var item=objectives.find(function(o){return o.id===id;});return item?text(item.en,item.ar):'';}).filter(Boolean).join(' + ');
      $('mgMissionConceptTitle').textContent=lang==='ar'?'مفهوم المهمة القمرية':'Lunar mission concept';
      var operation=mission.mission==='orbiter'?text('map the lunar region from orbit','مسح المنطقة القمرية من المدار'):mission.mission==='surface'?text('deploy and operate surface science instruments','نشر أدوات علمية وتشغيلها على السطح'):text('deliver the lander safely to the lunar surface','إيصال مركبة الهبوط بأمان إلى سطح القمر');
      $('mgMissionConceptText').textContent=(lang==='ar'?'الهدف العلمي: ':'Science objective: ')+(goal||text('lunar exploration','استكشاف قمري'))+'. '+text('The spacecraft will '+operation+', collect observations, then return data through the ground link to science users.','ستقوم المركبة بـ'+operation+'، وتجمع الرصد، ثم ترسل البيانات عبر الاتصال الأرضي ليستفيد منها العلماء.');
      $('mgMissionRoute').textContent=(lang==='ar'?'المسار: ':'Trajectory: ')+text(route.en,route.ar);
      $('mgSceneNote').textContent=lang==='ar'?'تصوير ثلاثي الأبعاد توضيحي لمسار الأرض–القمر ومراحل المهمة. المقياس والمسار والتوقيت مبسّطة للتعلم وليست للملاحة.':'Illustrative 3D Earth–Moon route and mission phases. Scale, trajectory, and timing are simplified for learning, not navigation.';
      $('mgScenePhase').textContent=lang==='ar'?'جاهز':'READY';
      if(!sceneView)sceneView=makeScene();if(sceneView)sceneView.start();
      $('mgTimelineStatus').textContent=lang==='ar'?'جارٍ التحضير':'Preparing';
      $('mgLivePhase').textContent=lang==='ar'?'بانتظار بدء الرحلة':'READY FOR FLIGHT';
      $('flightBoardRoute').textContent=(lang==='ar'?'المسار: ':'Route: ')+text(route.en,route.ar)+' · '+text(profile.en,profile.ar);
      renderResources();
      if(mission.mission==='orbiter'){runOrbitalSequence();return;}
      FlightSequence.start((mission.site&&mission.site.flightSite)||profile.site||1,mode,function(result){finish(result||{success:false,reason:'aborted'});});
    }
    function runOrbitalSequence(){
      var i=0;
      function tick(){if(!run)return;if(i>=steps.length){finish({success:run.mission&&MissionGame.getOutcome()?MissionGame.getOutcome().success:true,orbital:true});return;}phase(steps[i++]);orbiterTimer=window.setTimeout(tick,1150);}
      tick();
    }
    async function finish(result){
      if(!run)return;window.clearTimeout(orbiterTimer);
      var r=run.resources,e=run.effects,c=run.mission;
      var eventFailures=run.event&&run.event.triggered?[
        {en:'Power',ar:'الطاقة',used:r.neededPower,limit:r.powerAvailable*e.power,unit:'PU/day'},
        {en:'Fuel',ar:'الوقود',used:r.fuel+e.fuel,limit:c.fuelLimit,unit:'FU'},
        {en:'Data return',ar:'إرجاع البيانات',used:r.generatedData*e.data,limit:r.downlink*e.link,unit:'GB'},
        {en:'Mission time',ar:'زمن المهمة',used:r.days+e.days,limit:c.maxDays,unit:'days'}
      ].filter(function(x){return x.used>x.limit;}):[];
      if(eventFailures.length){result.success=false;result.eventFailures=eventFailures;result.eventReason=lang==='ar'?'أثر الحدث الطارئ تجاوز موردًا مخططًا.':'The unexpected event pushed a planned resource beyond its limit.';}
      result.randomEvent=run.event&&run.event.triggered?run.event:null;
      var o=MissionGame.getOutcome();if(o){o.flight=result;o.success=!!o.success&&!!result.success;}
      if(result.success)steps.forEach(function(k){phase(k);});
      $('mgTimelineStatus').textContent=lang==='ar'?(result.success?'اكتملت المهمة':'انتهت المهمة دون نجاح'):(result.success?'Mission complete':'Mission ended');
      $('flightBoard').hidden=true;
      var flightReason=result.eventReason?' '+result.eventReason:result.flight&&(result.flight.reason||result.flight.title)?' '+(lang==='ar'?'سبب المحاكي: ':'Simulator debrief: ')+(result.flight.reason||result.flight.title):'';
      var reason=result.success
        ?(lang==='ar'?'اجتاز التصميم حدود الموارد، ووصلت المهمة إلى مرحلة التشغيل وإرجاع البيانات. أثر الحدث الطارئ محسوب ضمن لوحة الموارد الحية.':'The design passed its resource checks and reached operations and data return. The unexpected event is reflected in live telemetry.')
        :(lang==='ar'?'لم تصل المهمة إلى النتيجة المخططة. تقرير التصميم يوضح هامش المورد، وتقرير المحاكي يوضح ما حدث أثناء الطيران.':'The mission did not reach its planned outcome. The design report shows the resource margin; the simulator debrief shows what happened during flight.')+flightReason;
      var diagnosis=await diagnoseFlight(result,c,r);result.diagnosis=diagnosis;
      $('mgDebrief').textContent=reason+'\n\n'+(lang==='ar'?'مستشار التشخيص · ':'Diagnostic co-pilot · ')+(diagnosis.source==='AI_PROVIDER'?(lang==='ar'?'تحليل مزود AI':'AI provider analysis'):(lang==='ar'?'تشخيص محلي بالقواعد':'local rule-based guidance'))+'\n'+(lang==='ar'?'الأسباب: ':'Root causes: ')+diagnosis.causes.join(' ')+'\n'+(lang==='ar'?'التوصيات: ':'Recommendations: ')+diagnosis.recommendations.join(' ');$('mgDebrief').hidden=false;
      await MissionGame.setFlight(result);MissionGame.setDiagnosis(diagnosis);if(sceneView)sceneView.stop();run=null;
    }
    return {active:active,start:start,phase:phase,stop:function(){window.clearTimeout(orbiterTimer);if(sceneView)sceneView.stop();},resourceSummary:resourceSummary};
  })();

  var FlightSequence = (function () {
    var frame=$('flightFrame'), screen=$('flightScreen'), stage='idle', site=1, afterClose=null, controlMode='autopilot';
    function bindSimulatorCursor(){
      var doc;try{doc=frame.contentDocument;}catch(e){return;}
      if(!doc)return;
      var canvas=doc.querySelector('canvas'),restartButton=doc.getElementById('asc-restart');if(!canvas)return;
      var dragging=false;
      function setRocket(e){
        if(!rocketCursor||e.pointerType!=='mouse')return;
        var rect=frame.getBoundingClientRect();
        rocketCursor.style.transform='translate3d('+(rect.left+e.clientX-12)+'px,'+(rect.top+e.clientY-12)+'px,0)';
        rocketCursor.classList.add('visible');
      }
      function onMove(e){
        var overCanvas=e.target===canvas,overRestart=!!(restartButton&&e.target.closest&&e.target.closest('#asc-restart'));
        if(!dragging&&!overCanvas&&!overRestart){canvas.classList.remove('nova-rocket-hover');restartButton?.classList.remove('nova-rocket-hover');rocketCursor?.classList.remove('visible','on-target');return;}
        setRocket(e);
        if(!dragging){
          canvas.classList.toggle('nova-rocket-hover',overCanvas);
          restartButton?.classList.toggle('nova-rocket-hover',overRestart);
          rocketCursor?.classList.toggle('on-target',overRestart);
        }
      }
      function onDown(e){
        var overRestart=!!(restartButton&&e.target.closest&&e.target.closest('#asc-restart'));
        if(e.pointerType==='mouse'&&e.button===0&&overRestart){
          setRocket(e);rocketCursor?.classList.add('visible','on-target');
          rocketCursor?.classList.remove('igniting');void rocketCursor?.offsetWidth;rocketCursor?.classList.add('igniting');
          window.setTimeout(function(){rocketCursor?.classList.remove('igniting');},420);return;
        }
        if(e.pointerType!=='mouse'||e.button!==0||e.target!==canvas)return;
        dragging=true;canvas.classList.add('nova-rocket-drag');
        setRocket(e);rocketCursor?.classList.add('dragging','on-target');rocketCursor?.classList.remove('igniting');
      }
      function onUp(){
        if(!dragging)return;
        dragging=false;canvas.classList.remove('nova-rocket-drag');
        rocketCursor?.classList.remove('dragging');
        var overRestart=restartButton&&doc.elementFromPoint(lastX,lastY)?.closest?.('#asc-restart');
        if(overRestart){restartButton.classList.add('nova-rocket-hover');rocketCursor?.classList.add('visible','on-target');}
        else if(doc.elementFromPoint(lastX,lastY)===canvas){canvas.classList.add('nova-rocket-hover');rocketCursor?.classList.add('visible');rocketCursor?.classList.remove('on-target');}
        else{canvas.classList.remove('nova-rocket-hover');rocketCursor?.classList.remove('visible','on-target');}
      }
      var lastX=0,lastY=0;
      function track(e){lastX=e.clientX;lastY=e.clientY;}
      doc.addEventListener('pointermove',function(e){track(e);onMove(e);},true);
      doc.addEventListener('pointerdown',onDown,true);
      doc.addEventListener('pointerup',onUp,true);doc.addEventListener('pointercancel',onUp,true);
      frame.contentWindow.addEventListener('blur',onUp);
      var style=doc.createElement('style');style.textContent='canvas.nova-rocket-hover,canvas.nova-rocket-drag,#asc-restart.nova-rocket-hover{cursor:none!important}';doc.head.appendChild(style);
    }
    frame.addEventListener('load',bindSimulatorCursor);
    function renderFlightHelp(){
      var ar=lang==='ar',panel=$('flightHelpPanel'),title=$('flightHelpTitle'),kicker=$('flightHelpKicker'),content=$('flightHelpContent');
      title.textContent=ar?'معاني أرقام وقراءات الطيران':'What do these numbers mean?';
      kicker.textContent=ar?'شاشة الطيران / دليل سريع':'FLIGHT DISPLAY / QUICK KEY';
      var phaseNames={launch:ar?'الإطلاق والصعود':'Launch and ascent',transfer:ar?'العبور إلى القمر':'Trans-lunar transfer',orbit:ar?'المدار القمري':'Lunar orbit',landing:ar?'الهبوط':'Landing',complete:ar?'اكتملت الرحلة':'Flight complete','launch-failed':ar?'توقف الإطلاق':'Launch ended'};
      var phase=document.createElement('p');phase.className='flight-help-phase';phase.textContent=(ar?'المرحلة الحالية: ':'CURRENT PHASE: ')+(phaseNames[stage]|| (ar?'جارٍ تجهيز المحاكي':'Simulator starting'));content.replaceChildren(phase);
      var rows=[
        ['ALT','الارتفاع','Altitude above the launch or landing surface.','الارتفاع فوق سطح الإطلاق أو الهبوط.'],
        ['SPEED · VERT · HORIZ','السرعة','Total, vertical, and horizontal speed.','السرعة الكلية والرأسية والأفقية.'],
        ['RANGE','المسافة','Distance remaining to the target or landing area.','المسافة المتبقية إلى الهدف أو منطقة الهبوط.'],
        ['MAX-Q · AOA','الضغط والميل','Peak air pressure on the rocket; angle between the rocket and airflow.','أعلى ضغط هوائي على الصاروخ؛ وزاوية الصاروخ بالنسبة لاتجاه الهواء.'],
        ['PROP · THROTTLE','الوقود والدفع','Propellant remaining and current engine power.','الوقود المتبقي وقوة المحرك الحالية.'],
        ['ACCEL · T/W · MASS','التسارع والكتلة','Acceleration in g, thrust-to-weight ratio, and vehicle mass.','التسارع بوحدة g ونسبة الدفع إلى الوزن وكتلة المركبة.'],
        ['MET · WARP · PHASE','الوقت والمرحلة','Mission elapsed time, simulation speed, and current flight segment.','الوقت المنقضي وسرعة المحاكاة ومرحلة الرحلة الحالية.'],
        ['DRIFT · TILT · RCS','التحكم في الهبوط','Sideways motion, lean from upright, and remaining attitude-control fuel.','الحركة الجانبية والميل عن الوضع الرأسي ووقود التحكم في الاتجاه.'],
        ['ΔV · TLI BURN','حرق العبور','Change in speed required for a transfer burn; follow the displayed target band.','التغير المطلوب في السرعة لحرق العبور؛ اتبع نطاق الهدف الظاهر.'],
        ['CAMERA','الكاميرا','View label only; change the view with C when the simulator has focus.','اسم زاوية العرض فقط؛ غيّرها بمفتاح C عند التركيز على المحاكي.']
      ];
      var list=document.createElement('dl');list.className='flight-help-list';
      rows.forEach(function(row){var item=document.createElement('div'),term=document.createElement('dt'),desc=document.createElement('dd');term.textContent=row[0]+' · '+row[1];desc.textContent=ar?row[3]:row[2];item.appendChild(term);item.appendChild(desc);list.appendChild(item);});
      content.appendChild(list);
      var note=document.createElement('p');note.className='flight-help-note';note.textContent=ar?'كل القيم الظاهرة جزء من نموذج تعليمي مبسّط. استخدم تلميحات المحاكي ومفاتيحه للتحكم اليدوي؛ الطيار الآلي يقود المراحل المدعومة.':'All displayed values belong to a simplified learning model. Use the simulator prompts and keys for manual control; autopilot flies the supported phases.';content.appendChild(note);
      panel.hidden=false;$('flightHelpButton').setAttribute('aria-expanded','true');
    }
    function closeFlightHelp(){ $('flightHelpPanel').hidden=true;$('flightHelpButton').setAttribute('aria-expanded','false');$('flightHelpButton').focus(); }
    $('flightHelpButton').addEventListener('click',function(){if($('flightHelpPanel').hidden)renderFlightHelp();else closeFlightHelp();});
    $('flightHelpClose').addEventListener('click',closeFlightHelp);
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!$('flightHelpPanel').hidden)closeFlightHelp();});
    window.addEventListener('message',function(event){
      if(event.source!==frame.contentWindow || !event.data || event.data.type!=='nova-flight') return;
      if(event.data.phase==='launch-start') stage='launch';
      if(event.data.phase==='transfer-start'||event.data.phase==='orbit-start'||event.data.phase==='landing-start') stage=event.data.phase.replace('-start','');
      if(stage!=='idle'&&MissionTimeline.active())MissionTimeline.phase(stage);
      if(event.data.phase==='launch-failed') { stage='launch-failed'; $('flightExit').textContent=afterClose?'Flight ended - continue':'Launch failed - return to mission'; if(afterClose){var next=afterClose;afterClose=null;close();next({success:false,reason:'launch',flight:event.data.report||null});} }
      if(event.data.phase==='landing-complete') { stage='complete'; $('flightExit').textContent='Landing complete - continue'; if(afterClose) { var next=afterClose; afterClose=null; close(); var report=event.data.report||null;next({success:!!(report&&report.success),flight:report}); } }
    });
    function start(siteId, mode, onComplete) {
      if(typeof mode==='function'){onComplete=mode;mode='autopilot';}
      site=siteId||1; controlMode=mode||'autopilot';stage='loading';afterClose=onComplete||null; $('flightExit').textContent=afterClose?'Exit flight':'Return to mission';
      $('flightBoard').hidden=!MissionTimeline.active();
      if(MissionTimeline.active())MissionTimeline.phase('launch');
      $('flightBoardResources').textContent=MissionTimeline.active()?MissionTimeline.resourceSummary():'';
      $('flightBoardAuto').textContent=controlMode==='manual'?'Switch to autopilot':'Take manual control';
      $('flightHelpPanel').hidden=true;$('flightHelpButton').setAttribute('aria-expanded','false');
      screen.classList.add('show');
      frame.src='assets/lunar-mission-simulator/index.html?site='+encodeURIComponent(site)+'&control='+encodeURIComponent(controlMode);
    }
    function close() {
      stage='idle'; frame.src='about:blank'; screen.classList.remove('show');$('flightBoard').hidden=true;
    }
    $('flightExit').addEventListener('click',function(){ var next=afterClose; afterClose=null; close(); if(next) next({success:false,reason:'aborted'}); });
    $('flightBoardFocus').addEventListener('click',function(){frame.focus();try{frame.contentWindow.focus();}catch(e){}});
    $('flightBoardAuto').addEventListener('click',function(){try{frame.contentWindow.postMessage({type:'nova-control',action:'autopilot'},'*');controlMode=controlMode==='manual'?'autopilot':'manual';$('flightBoardAuto').textContent=controlMode==='manual'?'Switch to autopilot':'Take manual control';}catch(e){}});
    return { start:start, close:close };
  })();

  var MOON = { id: 'moon', scene: 'lunar-science' };
  var MISSIONS = ['orbiter', 'lander', 'surface'];
  var SITES = [
    {id:'south',mission:'orbiter',objective:'ice',en:'South-pole orbital survey',ar:'مسح مداري للقطب الجنوبي',activityEn:'Map polar ice from orbit',activityAr:'رسم خريطة الجليد القطبي من المدار',reasonEn:'An orbital mission maps a shadowed polar region without a surface landing. The location marker and risk values are illustrative training data.',reasonAr:'تمسح المهمة المدارية منطقة قطبية مظللة من دون هبوط سطحي. العلامة وقيم المخاطر بيانات تدريبية توضيحية.',risk:10,fuel:4,cost:6,solar:.91,lightHours:8,opsDays:10,lat:-1.12,lon:-.15,color:0xff654d,flightSite:5},
    {id:'crater',mission:'surface',objective:'seismic',en:'Hadley Rille · Crater Science',ar:'أخدود هادلي · أبحاث الفوهات',activityEn:'Seismic study',activityAr:'دراسة زلزالية',reasonEn:'The bundled simulator labels this generated rille terrain Hard. The science target comes with a tighter landing and access margin.',reasonAr:'يصنف المحاكي المضمّن تضاريس الأخدود المولدة كصعبة. يأتي الهدف العلمي مع هامش أضيق للهبوط والوصول.',risk:14,fuel:8,cost:6,solar:.84,lightHours:12,opsDays:13,lat:.18,lon:.58,color:0xffbd4b,flightSite:3},
    {id:'plain',mission:'lander',objective:'landing',en:'Mare Tranquillitatis · Open Plain',ar:'بحر السكون · سهل مفتوح',activityEn:'Safe landing survey',activityAr:'مسح هبوط آمن',reasonEn:'The bundled simulator labels this generated Apollo 11 training terrain Training. Its wider landing pad lowers the game’s landing-risk penalty.',reasonAr:'يصنف المحاكي المضمّن تضاريس التدريب المولدة لموقع أبولو 11 كتدريب. تقلل ساحة الهبوط الأوسع عقوبة المخاطر في اللعبة.',risk:4,fuel:3,cost:2,solar:.98,lightHours:14,opsDays:8,lat:-.12,lon:-.62,color:0x65e1b0,flightSite:1}
  ];
  var selMission = 0, envBusy = false;
  var envStart = $('envStart');
  var moonMapView = null;
  function markPicked() {
    Array.prototype.forEach.call(envGrid.children, function (c, i) {
      var on = i === selMission;
      c.classList.toggle('picked', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
      c.querySelector('.site-select').textContent = on ? (lang === 'ar' ? 'محدد' : 'Selected') : (lang === 'ar' ? 'اختر' : 'Select');
    });
    updateSiteInfo();
    if (moonMapView) moonMapView.focus(selMission);
  }
  function renderEnv() {
    envGrid.innerHTML = '';
    SITES.forEach(function (site, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'env'; b.setAttribute('data-site', site.id);
      b.innerHTML = '<span class="site-dot"></span><span class="site-label"><b class="nm"></b><small class="site-activity"></small></span><span class="site-select"></span>';
      b.querySelector('.nm').textContent = lang === 'ar' ? site.ar : site.en;
      b.querySelector('.site-activity').textContent = lang === 'ar' ? site.activityAr : site.activityEn;
      b.style.setProperty('--site-color', '#' + site.color.toString(16).padStart(6, '0'));
      b.disabled = envBusy;
      b.addEventListener('click', function () { if (envBusy) return; selMission = i; markPicked(); sfx.tick(900 + i * 120); });
      envGrid.appendChild(b);
    });
    markPicked();
    $('envH').textContent = lang === 'ar' ? 'اختر مسار المهمة ومنطقتها' : 'Choose a mission path and region';
    $('envP').textContent = lang === 'ar' ? 'اختر مسحًا مداريًا أو هبوطًا أو عمليات سطحية. يغيّر اختيارك الهدف العلمي والموارد.' : 'Choose an orbital survey, landing, or surface mission. Your selection changes objectives and resource needs.';
    $('mapStamp').textContent = lang === 'ar' ? 'تضاريس مولدة للتدريب · ليست بيانات مسح' : 'GENERATED TRAINING TERRAIN · NOT SURVEY DATA';
    $('mapHelp').textContent = lang === 'ar' ? 'اسحب لتدوير القمر · اضغط علامة أو اختر منطقة' : 'Drag to rotate · Tap a marker or choose a region';
    $('mapKicker').textContent = lang === 'ar' ? 'منطقة المهمة' : 'MISSION AREA';
    $('mapRiskLabel').textContent = lang === 'ar' ? 'مخاطر توضيحية' : 'Illustrative risk';
    mapFootnoteText.textContent = lang === 'ar' ? 'نموذج القمر المجسم وبيانات مظهره وتضاريسه من مهمة NASA LRO. العلامات والمواقع توضيحية وليست إحداثيات تشغيلية، وقيم المفاضلة مبسطة.' : 'The 3D Moon model uses imagery and topography from NASA LRO. Sites and markers are illustrative, not operational coordinates; trade-off values are simplified.';
    $('mapLegend').innerHTML = lang === 'ar' ? '<span><i class="safe"></i>أقل</span><span><i class="mid"></i>متوسط</span><span><i class="high"></i>أعلى</span>' : '<span><i class="safe"></i>Lower risk</span><span><i class="mid"></i>Moderate</span><span><i class="high"></i>Higher risk</span>';
    envStart.textContent = T[lang].start; envStart.disabled = envBusy;
  }
  function updateSiteInfo() {
    var s = SITES[selMission]; if (!s) return;
    var ar = lang === 'ar';
    $('mapSelectedName').textContent = ar ? s.ar : s.en;
    $('mapSelectedDesc').textContent = ar ? s.reasonAr : s.reasonEn;
    $('mapRisk').textContent = ar ? (s.risk >= 16 ? 'مرتفع' : (s.risk >= 9 ? 'متوسط' : 'منخفض')) : (s.risk >= 16 ? 'HIGH' : (s.risk >= 9 ? 'MODERATE' : 'LOW'));
    $('mapRisk').className = s.risk >= 16 ? 'risk-high' : (s.risk >= 9 ? 'risk-mid' : 'risk-low');
    $('mapCosts').innerHTML = '<span><small>'+(ar?'وقود إضافي':'Extra fuel')+'</small><b>+'+s.fuel+' FU</b></span><span><small>'+(ar?'تكلفة الموقع':'Site cost')+'</small><b>+'+s.cost+' MC</b></span><span><small>'+(ar?'أثر الطاقة':'Power factor')+'</small><b>'+Math.round(s.solar*100)+'%</b></span>';
  }
  var nasaMoonBufferPromise;
  function loadNasaMoonMesh(radius, onLoad, onError, maxAnisotropy) {
    if (!nasaMoonBufferPromise) nasaMoonBufferPromise=fetch('./assets/lunar-mission-simulator/assets/moon_small.glb').then(function(response){if(!response.ok)throw new Error('HTTP '+response.status);return response.arrayBuffer();});
    nasaMoonBufferPromise.then(function(buffer){
      var view=new DataView(buffer),cursor=12,jsonChunk=null,binStart=0;
      while(cursor+8<=buffer.byteLength){var length=view.getUint32(cursor,true),type=view.getUint32(cursor+4,true),begin=cursor+8;if(type===0x4e4f534a)jsonChunk=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,begin,length)).trim());else if(type===0x004e4942)binStart=begin;cursor=begin+length;}
      if(!jsonChunk||!binStart)throw new Error('Invalid NASA GLB');
      var primitive=jsonChunk.meshes[0].primitives[0],geometry=new THREE.BufferGeometry();
      function attribute(accessorIndex,components,Type){var accessor=jsonChunk.accessors[accessorIndex],bufferView=jsonChunk.bufferViews[accessor.bufferView],offset=binStart+(bufferView.byteOffset||0)+(accessor.byteOffset||0);return new Type(buffer,offset,accessor.count*components);}
      geometry.setAttribute('position',new THREE.BufferAttribute(attribute(primitive.attributes.POSITION,3,Float32Array),3));
      geometry.setAttribute('normal',new THREE.BufferAttribute(attribute(primitive.attributes.NORMAL,3,Float32Array),3));
      geometry.setAttribute('uv',new THREE.BufferAttribute(attribute(primitive.attributes.TEXCOORD_0,2,Float32Array),2));
      geometry.setIndex(new THREE.BufferAttribute(attribute(primitive.indices,1,Uint16Array),1));
      geometry.computeBoundingSphere();geometry.scale(radius/geometry.boundingSphere.radius,radius/geometry.boundingSphere.radius,radius/geometry.boundingSphere.radius);geometry.computeBoundingSphere();
      var imageView=jsonChunk.bufferViews[jsonChunk.images[0].bufferView],imageBytes=buffer.slice(binStart+(imageView.byteOffset||0),binStart+(imageView.byteOffset||0)+imageView.byteLength),imageUrl=URL.createObjectURL(new Blob([imageBytes],{type:jsonChunk.images[0].mimeType||'image/png'})),image=new Image();
      image.onload=function(){URL.revokeObjectURL(imageUrl);var texture=new THREE.Texture(image);texture.flipY=false;if(THREE.SRGBColorSpace)texture.colorSpace=THREE.SRGBColorSpace;else texture.encoding=THREE.sRGBEncoding;texture.anisotropy=Math.min(maxAnisotropy||8,8);texture.needsUpdate=true;onLoad(new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({map:texture,roughness:.95,metalness:0})));};
      image.onerror=function(){URL.revokeObjectURL(imageUrl);if(onError)onError(new Error('NASA model texture could not be decoded'));};image.src=imageUrl;
    }).catch(function(error){if(onError)onError(error);});
  }

  function createMoonMap() {
    var canvas=$('moonMap'),renderer3d,scene3d,camera3d,moonGroup,raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),markers=[],active=false,drag=false,down=null,lastPoint=null,frame=0,focusTween=null;
    try { renderer3d=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true,powerPreference:'low-power'}); } catch(e) { $('mapHelp').textContent=lang==='ar'?'تعذر تشغيل العرض ثلاثي الأبعاد؛ اختر الموقع من القائمة.':'3D view unavailable; choose a region from the list.';return {show:function(){},focus:function(){},hide:function(){}}; }
    renderer3d.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
    scene3d=new THREE.Scene();
    camera3d=new THREE.PerspectiveCamera(38,1,.1,30); camera3d.position.set(0,0,4.5);
    scene3d.add(new THREE.HemisphereLight(0xb8d9ff,0x17151b,1.45));
    var sun=new THREE.DirectionalLight(0xffe8bf,2.25);sun.position.set(-3,2,4);scene3d.add(sun);
    var fillLight=new THREE.DirectionalLight(0x526c9f,.55);fillLight.position.set(3,-2,-3);scene3d.add(fillLight);
    var starPos=[];for(var si=0;si<420;si++){var sr=5+Math.random()*9,sa=Math.random()*Math.PI*2,sv=Math.acos(2*Math.random()-1);starPos.push(sr*Math.sin(sv)*Math.cos(sa),sr*Math.cos(sv),sr*Math.sin(sv)*Math.sin(sa));}
    var starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPos,3));scene3d.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xb4d6ef,size:.022,transparent:true,opacity:.62,sizeAttenuation:true})));
    moonGroup=new THREE.Group();scene3d.add(moonGroup);
    $('mapHelp').textContent=lang==='ar'?'جارٍ تحميل نموذج القمر الأصلي من NASA…':'Loading NASA lunar model…';
    loadNasaMoonMesh(1.45,function(mesh){moonGroup.add(mesh);$('mapHelp').textContent=lang==='ar'?'اسحب لتدوير القمر · اضغط علامة أو اختر منطقة':'Drag to rotate · Tap a marker or choose a region';},function(error){$('mapHelp').textContent=(lang==='ar'?'تعذر تحميل نموذج NASA: ':'NASA lunar model could not be loaded: ')+(error.message||'unknown error');},renderer3d.capabilities.getMaxAnisotropy());
    SITES.forEach(function(site,index){
      var dir=new THREE.Vector3(Math.cos(site.lat)*Math.sin(site.lon),Math.sin(site.lat),Math.cos(site.lat)*Math.cos(site.lon)).normalize();
      var pin=new THREE.Group();pin.position.copy(dir).multiplyScalar(1.445);pin.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);pin.userData.siteIndex=index;
      var core=new THREE.Mesh(new THREE.SphereGeometry(.075,18,14),new THREE.MeshStandardMaterial({color:site.color,emissive:site.color,emissiveIntensity:.75,roughness:.35}));core.position.y=.075;pin.add(core);
      var halo=new THREE.Mesh(new THREE.TorusGeometry(.11,.009,6,28),new THREE.MeshBasicMaterial({color:site.color,transparent:true,opacity:.9}));halo.rotation.x=Math.PI/2;halo.position.y=.045;pin.add(halo);
      var stem=new THREE.Mesh(new THREE.CylinderGeometry(.009,.009,.16,6),new THREE.MeshBasicMaterial({color:site.color,transparent:true,opacity:.9}));stem.position.y=-.025;pin.add(stem);
      moonGroup.add(pin);markers.push({root:pin,core:core,site:site,index:index,dir:dir});
    });
    function resize(){var rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer3d.setSize(rect.width,rect.height,false);camera3d.aspect=rect.width/rect.height;camera3d.updateProjectionMatrix();}
    function animate(){if(!active)return;frame=requestAnimationFrame(animate);if(focusTween){focusTween.t+=.035;var t=Math.min(focusTween.t,1);moonGroup.quaternion.slerpQuaternions(focusTween.from,focusTween.to,t*t*(3-2*t));camera3d.position.z=focusTween.z0+(focusTween.z1-focusTween.z0)*t;if(t>=1)focusTween=null;}renderer3d.render(scene3d,camera3d);}
    function focus(index){markers.forEach(function(m){m.core.material.emissiveIntensity=m.index===index?1.7:.62;m.root.scale.setScalar(m.index===index?1.18:1);});var m=markers[index];if(!m)return;focusTween={t:0,from:moonGroup.quaternion.clone(),to:new THREE.Quaternion().setFromUnitVectors(m.dir,new THREE.Vector3(0,0,1)),z0:camera3d.position.z,z1:3.95};}
    function setPointer(e){var r=canvas.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera3d);}
    canvas.addEventListener('pointerdown',function(e){drag=true;down={x:e.clientX,y:e.clientY};lastPoint={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener('pointermove',function(e){if(!drag||!lastPoint)return;var dx=e.clientX-lastPoint.x,dy=e.clientY-lastPoint.y;moonGroup.rotation.y+=dx*.006;moonGroup.rotation.x=Math.max(-.9,Math.min(.9,moonGroup.rotation.x+dy*.005));lastPoint={x:e.clientX,y:e.clientY};});
    canvas.addEventListener('pointerup',function(e){drag=false;if(down){var moved=Math.hypot(e.clientX-down.x,e.clientY-down.y);if(moved<8){setPointer(e);var hit=raycaster.intersectObjects(markers.map(function(m){return m.root;}),true)[0];if(hit){var g=hit.object;while(g&&g.userData.siteIndex===undefined&&g!==moonGroup)g=g.parent;if(g&&g.userData.siteIndex!==undefined)chooseSite(g.userData.siteIndex);}}}down=null;lastPoint=null;});
    canvas.addEventListener('pointercancel',function(){drag=false;down=null;});
    canvas.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')moonGroup.rotation.y-=.14;else if(e.key==='ArrowRight')moonGroup.rotation.y+=.14;else if(e.key==='ArrowUp')moonGroup.rotation.x-=.12;else if(e.key==='ArrowDown')moonGroup.rotation.x+=.12;else return;e.preventDefault();});
    window.addEventListener('resize',resize);
    return {show:function(){active=true;resize();focus(selMission);animate();},focus:focus,hide:function(){active=false;cancelAnimationFrame(frame);}};
  }
  function chooseSite(index){if(index<0||index>=SITES.length)return;selMission=index;markPicked();sfx.tick(980+index*110);}
  function renderAtlas(){
    var ar=lang==='ar',title=function(s){return ar?s.ar:s.en;};
    $('atlasTitle').textContent=ar?'نفس القواعد، وظروف محلية مختلفة':'Same rules, different local conditions';
    $('atlasNote').innerHTML=(ar?'تكلفة الموقع ونافذة الإضاءة افتراضات مبسطة للعبة، وليست قياسات موقعية. جاذبية سطح القمر معروضة كقيمة متوسطة واحدة للمواقع الثلاثة، ولا تختلف عمليًا على هذا المقياس. <a target="_blank" rel="noopener" href="https://science.nasa.gov/moon/by-the-numbers/">مرجع NASA للجاذبية</a>.':'Site cost and daylight window are simplified game assumptions, not site measurements. Lunar surface gravity is shown as one mean value for all three sites; it does not materially vary at this map scale. <a target="_blank" rel="noopener" href="https://science.nasa.gov/moon/by-the-numbers/">NASA gravity reference</a>.');
    $('atlasTable').innerHTML='<table><thead><tr><th>'+ (ar?'الموقع':'Site')+'</th><th>'+ (ar?'تكلفة اللعبة':'Game cost')+'</th><th>'+ (ar?'ضوء تقريبي':'Illustrative light')+'</th><th>'+ (ar?'الجاذبية المتوسطة':'Mean gravity')+'</th><th>'+ (ar?'أيام التشغيل (لعبة)':'Ops days (game)')+'</th><th>'+ (ar?'عامل الطاقة':'Power factor')+'</th></tr></thead><tbody>'+SITES.map(function(s,i){return '<tr class="'+(i===selMission?'selected':'')+'"><td>'+title(s)+'</td><td>+'+s.cost+' MC</td><td>'+s.lightHours+' h/day</td><td>1.62 m/s²</td><td>'+s.opsDays+'</td><td>'+Math.round(s.solar*100)+'%</td></tr>';}).join('')+'</tbody></table><p class="atlas-footer">'+(ar?'ملاحظة: القيمة 1.62 m/s² مرجع متوسط قمري حقيقي؛ بقية الأعمدة إما مُبسّطة للعبة أو عوامل ضوئية توضيحية.':'Note: 1.62 m/s² is a real mean lunar value; other columns are game-balancing values or illustrative light factors.')+'</p>';
  }
  $('atlasOpen').addEventListener('click',function(){renderAtlas();$('atlasPanel').hidden=false;});
  $('atlasClose').addEventListener('click',function(){$('atlasPanel').hidden=true;});
  $('atlasPanel').addEventListener('click',function(e){if(e.target===$('atlasPanel'))$('atlasPanel').hidden=true;});
  function openEnvSelector() {
    envBusy = false; renderEnv();
    envSel.classList.add('show');
    if (!moonMapView) moonMapView=createMoonMap();
    if (moonMapView) moonMapView.show();
    envStart.focus({ preventScroll: true });
  }
  async function startGame() {
    if (envBusy) return;
    envBusy = true;
    envStart.disabled = true;
    Array.prototype.forEach.call(envGrid.children, function (c) { c.disabled = true; });
    sfx.tick(1100);
    var en = SITES[selMission];
    if (moonMapView) moonMapView.hide();
    try {
      var scenario=await MissionGame.generate(en.mission,en);
      var detail = {
        id: MOON.id, scene: MOON.scene, mission: en.mission, missionIndex: selMission + 1, missionName: en.en,
        constantsUrl: null, scenario: scenario,
        constants: { schemaVersion: 1, source: 'embedded NOVA lunar mission registry', missions: MISSIONS.slice() }
      };
      window.RAED = window.RAED || {};window.RAED.environment = detail;
      var ev;
      try { ev = new CustomEvent('raed:environment', { detail: detail, cancelable: true }); } catch (e) { ev = null; }
      var handled = ev ? !window.dispatchEvent(ev) : false;
      if (handled) {envSel.classList.remove('show');hud.style.display = 'none';}
      else {
        envSel.classList.remove('show');$('missionGame').classList.add('show');window.RAED.scenario = detail.scenario;
        envBusy = false;envStart.disabled = false;Array.prototype.forEach.call(envGrid.children, function (c) { c.disabled = false; });
      }
    } catch (err) {
      envBusy=false;envStart.disabled=false;Array.prototype.forEach.call(envGrid.children,function(c){c.disabled=false;});
      $('mapHelp').textContent=(lang==='ar'?'تعذر بناء المهمة: ':'Mission generation failed: ')+(err.message||'unknown error');
    }
  }
  envStart.addEventListener('click', startGame);
  $('mgChangeMission').addEventListener('click',function(){
    if(envBusy)return;
    $('missionGame').classList.remove('show');
    envBusy=false;renderEnv();envSel.classList.add('show');
    if(!moonMapView)moonMapView=createMoonMap();
    if(moonMapView)moonMapView.show();
    window.scrollTo({top:0,behavior:'smooth'});envStart.focus({preventScroll:true});
  });
  function setLang(l) {
    lang = l;
    var t = T[l], dir = l === 'ar' ? 'rtl' : 'ltr';
    hud.dir = tools.dir = dir;
    hud.lang = l;
    $('missionGame').dir = dir;
    $('mgGuide').dir = dir;
    document.documentElement.lang = l;
    $('brandSub').textContent = t.brand; $('heroT').innerHTML = phrase ? t.hero2 : t.hero; $('subT').textContent = t.sub; quick.textContent = t.skip;
    $('mgRun').textContent=l==='ar'?'قيّم المهمة':'Evaluate mission';$('mgRetry').textContent=l==='ar'?'أعد تصميم السيناريو':'Redesign this scenario';$('mgCompare').textContent=l==='ar'?'قارن الجولات المحفوظة':'Compare saved runs';$('mgSave').textContent=l==='ar'?'احفظ التقرير':'Save report';$('mgSaveFinal').textContent=l==='ar'?'احفظ تقرير المهمة':'Save mission report';$('mgTimelineClose').textContent=l==='ar'?'إغلاق الخط الزمني':'Close timeline';$('flightBoardFocus').textContent=l==='ar'?'التركيز على التحكم':'Focus flight controls';$('flightHelpButton').setAttribute('aria-label',l==='ar'?'شرح أرقام وقراءات الطيران':'Flight data guide');$('flightHelpPanel').hidden=true;$('flightHelpButton').setAttribute('aria-expanded','false');
    $('mgDifficultyLabel').textContent=l==='ar'?'مستوى الصعوبة':'Difficulty';$('mgDifficulty').options[0].text=l==='ar'?'موجّه':'Guided';$('mgDifficulty').options[1].text=l==='ar'?'قياسي':'Standard';$('mgDifficulty').options[2].text=l==='ar'?'موارد محدودة':'Tight resources';$('mgSandboxText').textContent=l==='ar'?'وضع التجربة · القيود استرشادية':'Sandbox · limits are advisory';
    $('sdgKicker').textContent=l==='ar'?'أهداف التنمية المستدامة · ارتباط تعليمي':'SUSTAINABLE DEVELOPMENT GOALS · LEARNING CONNECTION';$('sdgTitle').textContent=l==='ar'?'كيف يرتبط تصميم المهمة بالتنمية المستدامة':'How mission design connects to sustainable development';$('sdg4Title').textContent=l==='ar'?'الهدف ٤ · التعليم الجيد':'SDG 4 · Quality education';$('sdg9Title').textContent=l==='ar'?'الهدف ٩ · الصناعة والابتكار والهياكل الأساسية':'SDG 9 · Industry, innovation and infrastructure';$('sdg12Title').textContent=l==='ar'?'الهدف ١٢ · الاستهلاك والإنتاج المسؤولان':'SDG 12 · Responsible consumption and production';$('sdg4').textContent=l==='ar'?'تدرّب على التفكير النظمي ببناء تصميم للمهمة، وملاحظة نتائجه، والتعلّم من التقييم.':'Practice systems thinking by making a mission design, seeing its consequences, and learning from the result.';$('sdg9').textContent=l==='ar'?'استكشف كيف تعمل المركبة والأدوات والاتصالات والأنظمة الأرضية معًا كمنظومة هندسية.':'Explore how spacecraft, instruments, communications, and ground systems work together as an engineered system.';$('sdg12').textContent=l==='ar'?'وازن العائد العلمي مع الكتلة والطاقة والبيانات والزمن والميزانية المحدودة في نموذج اللعبة.':'Compare science return with limited simulated mass, power, data, time, and budget, and explain each trade-off.';$('sdgNote').textContent=l==='ar'?'هذا ارتباط تعليمي بأهداف التنمية المستدامة، وليس ادعاءً بأن لعبة قمرية تحقق هذه الأهداف أو تقيس أثرها. موارد NOVA أرقام مبسطة للعبة.':'This is an educational connection to the SDGs, not a claim that a lunar game directly achieves or measures these goals. NOVA resource values are simplified game values.';
    $('mgControlLabel').textContent=l==='ar'?'اختر التحكم قبل الإقلاع:':'Choose control mode before launch:';$('mgManual').textContent=l==='ar'?'تحكم يدوي عند الإقلاع':'Manual control at launch';$('mgAuto').textContent=l==='ar'?'طيار آلي عند الإقلاع':'Autopilot at launch';$('mgPrint').textContent=l==='ar'?'اطبع تقرير تقييم الطيران':'Print flight evaluation';$('mgExport').textContent=l==='ar'?'صدّر التصميم JSON':'Export design JSON';$('mgShare').textContent=l==='ar'?'شارك التقرير':'Share report';
    $('atlasOpen').textContent=l==='ar'?'قارن المواقع · أطلس المهمة':'Compare all sites · Mission Atlas';$('atlasTitle').textContent=l==='ar'?'نفس القواعد، وظروف محلية مختلفة':'Same rules, different local conditions';$('atlasClose').setAttribute('aria-label',l==='ar'?'إغلاق الأطلس':'Close atlas');
    $('introControlLabel').textContent=l==='ar'?'اختر تحكم الإقلاع':'Choose your launch control';$('introManual').textContent=l==='ar'?'يدوي':'Manual';$('introAuto').textContent=l==='ar'?'طيار آلي':'Autopilot';
    if(ready&&!introControlMode){hold.disabled=true;quick.disabled=true;holdLabel.textContent=l==='ar'?'اختر التحكم أولًا':'Choose control mode first';}
    if(introControlMode){$('introControlHint').textContent=l==='ar'?(introControlMode==='manual'?'اختيارك: تحكم يدوي يبدأ من الإقلاع.':'اختيارك: الطيار الآلي يقود الإقلاع.'):(introControlMode==='manual'?'Selected: you will control the launch.':'Selected: autopilot will fly the launch.');}
    $('mgGeneratorKicker').textContent=l==='ar'?'منشئ سيناريو المهمة':'MISSION SCENARIO BUILDER';$('mgGeneratorTitle').textContent=l==='ar'?'ابدأ بسيناريو قمري متكامل':'Start with a complete lunar scenario';$('mgGeneratorHelp').textContent=l==='ar'?'يبني سيناريو حسب مسار المهمة والموقع المختارين، ويحدد هدفًا علميًا وقيودًا وحدود موارد مبسطة لتصمم على أساسها.':'Builds from your selected mission path and site, then gives you a science goal, constraints, and simplified resource limits to design against.';$('mgGeneratorSource').textContent=l==='ar'?'سيناريو محلي · إرشادات موارد NASA · قيم لعبة':'Local scenario · NASA resource guidance · game values';$('mgBuildLabel').textContent=l==='ar'?'أنشئ السيناريو':'Generate mission';$('mgBuildNote').textContent=MissionGame.getCurrent()?(l==='ar'?'أعد البناء أو عدّل اختياراتك':'Rebuild or adjust your choices'):(l==='ar'?'جاهز للتصميم':'Ready to design');
    $('mgChangeMissionLabel').textContent=l==='ar'?'تغيير المهمة':'Change mission';$('mgChangeMission').setAttribute('aria-label',l==='ar'?'الرجوع لاختيار مهمة أخرى':'Return to mission selection');$('mgGuideOpenLabel').textContent=l==='ar'?'دليل اللعبة':'Game guide';$('mgGuideOpen').setAttribute('aria-label',l==='ar'?'افتح دليل اللعبة':'Open game guide');$('mgGuideKicker').textContent=l==='ar'?'نوفا / دليل سريع':'NOVA / QUICK GUIDE';$('mgGuideTitle').textContent=l==='ar'?'شرح الأزرار والأقسام':'Buttons and sections';$('mgGuideIntro').textContent=l==='ar'?'استخدم الدليل لفهم كل جزء من مصمم المهمة وأزراره.':'Use this guide to understand each part of the mission designer.';$('mgGuideClose').setAttribute('aria-label',l==='ar'?'إغلاق الدليل':'Close guide');if(!$('mgGuide').hidden)MissionGame.refreshGuide();
    $('f1k').textContent = t.f1k; $('f1u').textContent = t.f1u; $('f2k').textContent = t.f2k; $('f2u').textContent = t.f2u;
    langBtn.textContent = t.toggle; langBtn.lang = l === 'ar' ? 'en' : 'ar'; langBtn.setAttribute('aria-label', t.toggleLabel);
    sndBtn.setAttribute('aria-label', sndBtn.classList.contains('muted') ? t.soundOff : t.soundOn);
    envSel.dir = dir; envSel.lang = l;
    $('envH').textContent = t.envH; $('envP').textContent = t.envP;
    renderEnv();
    if(!$('atlasPanel').hidden)renderAtlas();
    if ($('missionGame').classList.contains('show') && !$('mgResult').classList.contains('show')) MissionGame.refreshLanguage();
    lastLabel = ''; lastMsg = -1;
  }
  var phrase = 0, heroEl = $('heroT'), subEl = $('subT');
  function swapPhrase(i) {
    phrase = i;
    heroEl.innerHTML = i ? T[lang].hero2 : T[lang].hero;
    heroEl.classList.remove('swap'); void heroEl.offsetWidth; heroEl.classList.add('swap');
    if (typeof sfx !== 'undefined' && i) sfx.tick(1320);
  }
  langBtn.addEventListener('click', function () { setLang(lang === 'en' ? 'ar' : 'en'); if (typeof sfx !== 'undefined') sfx.tick(660); });

  var renderer = null;
  if (typeof THREE !== 'undefined') {
    try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); } catch (e) { renderer = null; }
  }
  if (!renderer) {
    holdLabel.textContent = T[lang].noWebgl;
    return;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
  function ss(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function glowTexture(size, stops) {
    var c = document.createElement('canvas'); c.width = c.height = size;
    var x = c.getContext('2d');
    var gr = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    for (var i = 0; i < stops.length; i++) gr.addColorStop(stops[i][0], stops[i][1]);
    x.fillStyle = gr; x.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x08070a, 1);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  stage.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x08070a, 0.02);
  var camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.05, 500);

  var CAM0 = new THREE.Vector3(0, 1.5, 4.6);
  var LOOK0 = new THREE.Vector3(-0.5, 3.0, -8);
  var MOON = new THREE.Vector3(-7.5, 6.4, -16);
  var RM = 5.4;
  var GC = new THREE.Vector3(-0.3, 2.7, -8);
  var sunDir = new THREE.Vector3(0.45, 0.35, 0.8).normalize();

  var sun = new THREE.DirectionalLight(0xfff1e0, 2.4);
  sun.position.copy(sunDir).multiplyScalar(20);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0x1b2038, 0.35));
  var rimLight = new THREE.PointLight(0x9db4d8, 1.2, 18, 2);
  rimLight.position.set(-5.2, 2.6, -10);
  scene.add(rimLight);

  var moonGroup = new THREE.Group();
  moonGroup.position.copy(MOON);
  moonGroup.scale.setScalar(RM);
  scene.add(moonGroup);
  var tilt = new THREE.Group();
  tilt.rotation.z = 0.1;
  moonGroup.add(tilt);
  var introMoon = new THREE.Group();tilt.add(introMoon);

  var atmMat = new THREE.ShaderMaterial({
    uniforms: { uK: { value: 1 }, uSun: { value: new THREE.Vector3(0, 0, 1) } },
    vertexShader: 'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'varying vec3 vN;uniform float uK;uniform vec3 uSun;void main(){float rim=pow(clamp(0.62-dot(vN,vec3(0.0,0.0,1.0)),0.0,1.0),2.4);float lit=0.1+0.9*smoothstep(-0.1,0.8,dot(vN,uSun));float i=clamp(rim*lit*uK*1.9,0.0,1.0);gl_FragColor=vec4(0.72,0.8,0.95,i*0.3);}',
    side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
  });
  moonGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.02, 64, 64), atmMat));

  var halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(256, [[0, 'rgba(200,214,240,0.4)'], [0.35, 'rgba(160,180,215,0.14)'], [1, 'rgba(160,180,215,0)']]),
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false
  }));
  halo.position.set(MOON.x, MOON.y, MOON.z - 1.5);
  halo.scale.setScalar(RM * 5.2);
  scene.add(halo);

  var ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0x0e0c0e, roughness: 0.5, metalness: 0 }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  function reflectionTexture() {
    var w = 64, h = 256, c = document.createElement('canvas'); c.width = w; c.height = h;
    var x = c.getContext('2d'), img = x.createImageData(w, h), d = img.data;
    for (var j = 0; j < h; j++) {
      var far = 1 - j / h;
      var bright = Math.pow(far, 2.2) * (1 - ss(0.93, 1, far));
      var streak = 0.7 + 0.3 * Math.pow(Math.sin(j * 1.7 + 0.4), 2);
      for (var i = 0; i < w; i++) {
        var u = ((i + 0.5) / w) * 2 - 1;
        var a = bright * streak * Math.exp(-u * u * 3.2);
        var p = (j * w + i) * 4;
        d[p] = 205; d[p + 1] = 215; d[p + 2] = 238; d[p + 3] = clamp(a, 0, 1) * 255;
      }
    }
    x.putImageData(img, 0, 0);
    return new THREE.CanvasTexture(c);
  }
  var reflection = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 16), new THREE.MeshBasicMaterial({
    map: reflectionTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0.55
  }));
  reflection.rotation.x = -Math.PI / 2;
  reflection.position.set(MOON.x, 0.012, -8);
  scene.add(reflection);

  function pointCloud(n, sx, sy, sz, ox, oy, oz, size, opacity, color, useFog) {
    var pos = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      pos[i * 3] = ox + (Math.random() - 0.5) * sx;
      pos[i * 3 + 1] = oy + Math.random() * sy;
      pos[i * 3 + 2] = oz + (Math.random() - 0.5) * sz;
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({
      size: size, sizeAttenuation: false, color: color, transparent: true, opacity: opacity, depthWrite: false, fog: useFog,
      map: glowTexture(32, [[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']])
    }));
  }
  scene.add(pointCloud(350, 36, 0.1, 37, 0, 0.03, -15, 1.4, 0.45, 0xffd9b0, true));
  var motes = pointCloud(90, 14, 5.4, 14, -1, 0.3, -7, 1.2, 0.35, 0xffe6cc, false);
  scene.add(motes);

  var N = 2200, sPos = new Float32Array(N * 3), sCol = new Float32Array(N * 3);
  for (var si = 0; si < N; si++) {
    var uu = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, rr = 120 + Math.random() * 60, ss2 = Math.sqrt(1 - uu * uu);
    sPos[si * 3] = rr * ss2 * Math.cos(th); sPos[si * 3 + 1] = Math.abs(rr * uu) * 0.9 + 2; sPos[si * 3 + 2] = rr * ss2 * Math.sin(th);
    var kk = Math.random(), br = 0.35 + Math.random() * 0.65, cr = 1, cg = 1, cb = 1;
    if (kk < 0.25) { cg = 0.84; cb = 0.7; } else if (kk > 0.8) { cr = 0.76; cg = 0.86; }
    sCol[si * 3] = cr * br; sCol[si * 3 + 1] = cg * br; sCol[si * 3 + 2] = cb * br;
  }
  var sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  sGeo.setAttribute('color', new THREE.BufferAttribute(sCol, 3));
  var stars = new THREE.Points(sGeo, new THREE.PointsMaterial({
    size: 1.8, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, fog: false,
    map: glowTexture(32, [[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,255,255,0.7)'], [1, 'rgba(255,255,255,0)']])
  }));
  scene.add(stars);

  function streakTexture() {
    var c = document.createElement('canvas'); c.width = 256; c.height = 4;
    var x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 256, 0);
    gr.addColorStop(0, 'rgba(255,236,214,0)'); gr.addColorStop(1, 'rgba(255,244,230,1)');
    x.fillStyle = gr; x.fillRect(0, 0, 256, 4);
    return new THREE.CanvasTexture(c);
  }
  var shoot = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.09), new THREE.MeshBasicMaterial({
    map: streakTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0
  }));
  shoot.position.z = -90;
  scene.add(shoot);
  var sh = { active: false, t: 0, next: 3.2, vx: 0, vy: 0, life: 0.9 };

  function makeAstronaut() {
    var g = new THREE.Group();
    var suit = new THREE.MeshStandardMaterial({ color: 0x2c2b2e, roughness: 0.65, metalness: 0.1 });
    var dark = new THREE.MeshStandardMaterial({ color: 0x1b1b1e, roughness: 0.7, metalness: 0.15 });
    var visor = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.15, metalness: 0.9, emissive: 0x1d0d06 });
    function add(geo, mat, x, y, z) { var m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); g.add(m); return m; }
    add(new THREE.BoxGeometry(0.16, 0.1, 0.28), dark, -0.1, 0.05, -0.03);
    add(new THREE.BoxGeometry(0.16, 0.1, 0.28), dark, 0.1, 0.05, -0.03);
    add(new THREE.CylinderGeometry(0.075, 0.085, 0.72, 12), suit, -0.1, 0.46, 0);
    add(new THREE.CylinderGeometry(0.075, 0.085, 0.72, 12), suit, 0.1, 0.46, 0);
    add(new THREE.BoxGeometry(0.42, 0.5, 0.25), suit, 0, 1.14, 0);
    add(new THREE.BoxGeometry(0.34, 0.48, 0.17), dark, 0, 1.18, 0.21);
    var armL = add(new THREE.CylinderGeometry(0.055, 0.06, 0.56, 10), suit, -0.28, 1.12, 0);
    var armR = add(new THREE.CylinderGeometry(0.055, 0.06, 0.56, 10), suit, 0.28, 1.12, 0);
    armL.rotation.z = 0.08; armR.rotation.z = -0.08;
    var head = new THREE.Group();
    head.position.set(0, 1.55, 0);
    g.add(head);
    var helmet = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 16), suit);
    helmet.scale.set(1, 1.05, 1.05);
    head.add(helmet);
    var vz = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 16), visor);
    vz.position.set(0, 0, -0.07);
    vz.scale.set(0.95, 0.85, 0.8);
    head.add(vz);
    g.userData.head = head;
    return g;
  }

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function tailTexture() {
    var c = document.createElement('canvas'); c.width = 256; c.height = 32;
    var x = c.getContext('2d');
    var gr = x.createLinearGradient(0, 0, 256, 0);
    gr.addColorStop(0, 'rgba(141,195,221,0)');
    gr.addColorStop(0.6, 'rgba(170,210,238,0.3)');
    gr.addColorStop(1, 'rgba(255,248,236,1)');
    x.fillStyle = gr;
    x.beginPath(); x.moveTo(0, 16); x.lineTo(256, 5); x.lineTo(256, 27); x.closePath(); x.fill();
    x.globalCompositeOperation = 'destination-in';
    var vg = x.createLinearGradient(0, 0, 0, 32);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(0.5, 'rgba(0,0,0,1)'); vg.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = vg; x.fillRect(0, 0, 256, 32);
    return new THREE.CanvasTexture(c);
  }
  var tailGeo = new THREE.PlaneGeometry(3, 0.2); tailGeo.translate(-1.5, 0, 0);
  var tailMat = new THREE.MeshBasicMaterial({ map: tailTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
  var headMat = new THREE.SpriteMaterial({
    map: glowTexture(64, [[0, 'rgba(255,252,244,1)'], [0.22, 'rgba(255,232,204,0.85)'], [1, 'rgba(255,190,140,0)']]),
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false
  });
  function tileTexture() {
    var S = 64, c = document.createElement('canvas'); c.width = c.height = S;
    var x = c.getContext('2d');
    x.shadowColor = 'rgba(255,196,80,0.95)'; x.shadowBlur = 9;
    var gr = x.createLinearGradient(0, 8, 0, 56);
    gr.addColorStop(0, '#fff1bd'); gr.addColorStop(0.5, '#f3c45a'); gr.addColorStop(1, '#c98a1f');
    x.fillStyle = gr;
    var r = 6, l = 9, t = 9, w = S - 18;
    x.beginPath();
    x.moveTo(l + r, t); x.lineTo(l + w - r, t); x.quadraticCurveTo(l + w, t, l + w, t + r);
    x.lineTo(l + w, t + w - r); x.quadraticCurveTo(l + w, t + w, l + w - r, t + w);
    x.lineTo(l + r, t + w); x.quadraticCurveTo(l, t + w, l, t + w - r);
    x.lineTo(l, t + r); x.quadraticCurveTo(l, t, l + r, t); x.closePath(); x.fill();
    return new THREE.CanvasTexture(c);
  }
  var tileGeo = new THREE.PlaneGeometry(1.4, 1.4);
  var tileMat = new THREE.MeshBasicMaterial({ map: tileTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0 });
  function makeComet() {
    var g = new THREE.Group();
    g.add(new THREE.Mesh(tailGeo, tailMat));
    var tile = new THREE.Mesh(tileGeo, tileMat); tile.position.z = 0.01; g.add(tile);
    var head = new THREE.Sprite(headMat); head.scale.setScalar(0.34); g.add(head);
    return g;
  }
  function novaPoints() {
    var F = {
      N: ['10001', '11001', '11001', '10101', '10011', '10011', '10001'],
      O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
      V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
      A: ['00100', '01010', '10001', '10001', '11111', '10001', '10001']
    }, word = 'NOVA', cell = 0.38, pts = [], totalW = word.length * 5 + (word.length - 1);
    for (var li = 0; li < word.length; li++) {
      var rows = F[word.charAt(li)];
      for (var ry = 0; ry < 7; ry++) for (var qx = 0; qx < 5; qx++) {
        if (rows[ry].charAt(qx) !== '1') continue;
        pts.push(new THREE.Vector3(GC.x + (li * 6 + qx - (totalW - 1) / 2) * cell, GC.y + 1.7 + (3 - ry) * cell, GC.z));
      }
    }
    return pts;
  }
  var cubes = [];
  (function () {
    var r = rng(21), grid = novaPoints();
    for (var k = 0; k < grid.length; k++) {
      var cx, cy, cz, tries = 0;
      do {
        cx = -8 + r() * 14; cy = 2.4 + r() * 4.2; cz = -13 + r() * 12.5; tries++;
      } while (tries < 20 && Math.abs(cx + 3) < 1.3 && cy < 2.6 && Math.abs(cz + 4) < 1.6);
      var m = makeComet();
      m.userData = {
        cx: cx, cy: cy, cz: cz, ax: 0.8 + r() * 1.2, ay: 0.2 + r() * 0.4, az: 0.2 + r() * 0.4,
        fx: 0.15 + r() * 0.25, fy: 0.15 + r() * 0.25, fz: 0.15 + r() * 0.25, ph: r() * 6.28,
        r0x: 0, r0y: 0, r0z: -0.3 + (r() - 0.5) * 0.5, rx: 0, ry: 0, rz: (r() - 0.5) * 0.04,
        s: 0.4 + r() * 0.5, grid: grid[k], scatter: false, alive: true, spawnT: performance.now() / 1000 + 0.3 + r() * 1.6,
        vel: new THREE.Vector3(), spin: new THREE.Vector3(), life: 0
      };
      scene.add(m);
      cubes.push(m);
    }
  })();

  var qC = new THREE.Quaternion(), idQ = new THREE.Quaternion(), eul = new THREE.Euler();

  function updateCubes(time, dt, e) {
    var T = reduce ? 0 : time;
    tileMat.opacity = e * (0.84 + 0.16 * Math.sin(time * 2.4));
    tailMat.opacity = 1 - 0.95 * e;
    for (var i = 0; i < cubes.length; i++) {
      var c = cubes[i], u = c.userData;
      if (!u.alive) continue;
      if (u.scatter) {
        c.position.addScaledVector(u.vel, dt);
        u.vel.multiplyScalar(Math.pow(0.45, dt));
        c.rotation.x += u.spin.x * dt; c.rotation.y += u.spin.y * dt; c.rotation.z += u.spin.z * dt;
        u.life += dt;
        if (u.life > 3.4) { c.visible = false; u.alive = false; }
        continue;
      }
      c.position.set(
        u.cx + u.ax * Math.sin(T * u.fx + u.ph),
        u.cy + u.ay * Math.sin(T * u.fy + u.ph * 1.3),
        u.cz + u.az * Math.sin(T * u.fz + u.ph * 0.7)
      ).lerp(u.grid, e);
      eul.set(u.r0x + T * u.rx, u.r0y + T * u.ry, u.r0z + T * u.rz);
      qC.setFromEuler(eul);
      c.quaternion.copy(qC).slerp(idQ, e);
      var sp = clamp((time - u.spawnT) / 1.2, 0, 1);
      sp = 1 - Math.pow(1 - sp, 3);
      c.scale.setScalar(Math.max(lerp(u.s, 0.27, e) * sp, 0.0001));
    }
  }
  function shatter() {
    for (var i = 0; i < cubes.length; i++) {
      var c = cubes[i], u = c.userData;
      u.scatter = true; u.life = 0;
      u.vel.copy(c.position).sub(GC).normalize().multiplyScalar(4 + Math.random() * 7);
      u.vel.y += 0.5 + Math.random() * 1.5;
      u.vel.z += 2 + Math.random() * 4;
      u.spin.set(0, 0, (Math.random() - 0.5) * 1.5);
    }
  }
  function resetCubes(time) {
    for (var i = 0; i < cubes.length; i++) {
      var c = cubes[i], u = c.userData;
      u.scatter = false; u.alive = true; u.life = 0; u.spawnT = time + Math.random() * 0.6;
      c.visible = true;
      c.scale.setScalar(0.0001);
    }
  }

  var sfx = (function () {
    var AC = window.AudioContext || window.webkitAudioContext;
    var ctx = null, master = null, bus = null, conv = null, noise = null, charge = null, ambG = null, on = true;
    var PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];
    function route(node, wet) {
      node.connect(bus);
      if (wet > 0 && conv) { var w = ctx.createGain(); w.gain.value = wet; node.connect(w); w.connect(conv); }
    }
    function src(t, dur) { var n = ctx.createBufferSource(); n.buffer = noise; n.loop = true; n.start(t); n.stop(t + dur); return n; }
    function env(g, t, peak, attack, total) {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + total);
    }
    function panner(v) { if (!ctx.createStereoPanner) return null; var p = ctx.createStereoPanner(); p.pan.value = v; return p; }
    function impulse() {
      var len = Math.floor(ctx.sampleRate * 2.8), ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (var c = 0; c < 2; c++) {
        var d = ir.getChannelData(c), prev = 0;
        for (var i = 0; i < len; i++) {
          var w = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4);
          prev = prev * 0.55 + w * 0.45; d[i] = prev;
        }
      }
      return ir;
    }
    function twinkle() {
      if (ctx && on && !document.hidden && ctx.state === 'running') {
        var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), p = panner(Math.random() * 1.6 - 0.8), out = g;
        o.type = 'sine'; o.frequency.value = PENTA[Math.floor(Math.random() * PENTA.length)];
        env(g, t, 0.045, 0.02, 2.4);
        o.connect(g);
        if (p) { g.connect(p); out = p; }
        route(out, 0.9); o.start(t); o.stop(t + 2.5);
      }
      setTimeout(twinkle, 2500 + Math.random() * 4500);
    }
    function init() {
      if (!AC) return;
      if (ctx) { if (ctx.state === 'suspended' && on) ctx.resume(); return; }
      try { ctx = new AC(); } catch (e) { ctx = null; return; }
      var comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20; comp.knee.value = 18; comp.ratio.value = 4; comp.attack.value = 0.01; comp.release.value = 0.25;
      master = ctx.createGain(); master.gain.value = on ? 0.9 : 0;
      bus = ctx.createGain();
      bus.connect(comp); comp.connect(master); master.connect(ctx.destination);
      conv = ctx.createConvolver(); conv.buffer = impulse();
      var rg = ctx.createGain(); rg.gain.value = 0.7; conv.connect(rg); rg.connect(bus);
      var len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      noise = buf;

      ambG = ctx.createGain(); ambG.gain.value = 0;
      ambG.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 4);
      route(ambG, 0.35);
      [[55, 0.09], [55.4, 0.09], [82.4, 0.04]].forEach(function (q) {
        var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = q[0];
        var g = ctx.createGain(); g.gain.value = q[1]; o.connect(g); g.connect(ambG); o.start();
      });
      var pf = ctx.createBiquadFilter(); pf.type = 'lowpass'; pf.frequency.value = 900; pf.Q.value = 0.7; pf.connect(ambG);
      var plfo = ctx.createOscillator(), plg = ctx.createGain(); plfo.frequency.value = 0.05; plg.gain.value = 300;
      plfo.connect(plg); plg.connect(pf.frequency); plfo.start();
      [110, 164.81, 196, 246.94].forEach(function (f) {
        [-6, 6].forEach(function (cents) {
          var o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'triangle'; o.frequency.value = f; o.detune.value = cents; g.gain.value = 0.035;
          o.connect(g); g.connect(pf); o.start();
        });
      });
      var nz = ctx.createBufferSource(); nz.buffer = noise; nz.loop = true;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300;
      var ng = ctx.createGain(); ng.gain.value = 0.1;
      nz.connect(lp); lp.connect(ng); ng.connect(ambG); nz.start();
      var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 130;
      lfo.connect(lg); lg.connect(lp.frequency); lfo.start();

      var co = ctx.createOscillator(), co2 = ctx.createOscillator(), g2 = ctx.createGain();
      co.type = 'sawtooth'; co.frequency.value = 60; co2.type = 'square'; co2.frequency.value = 30; g2.gain.value = 0.4;
      var cf = ctx.createBiquadFilter(); cf.type = 'lowpass'; cf.frequency.value = 180; cf.Q.value = 5;
      var pulse = ctx.createGain(); pulse.gain.value = 0.6;
      var pl = ctx.createOscillator(), plg2 = ctx.createGain(); pl.frequency.value = 2; plg2.gain.value = 0.4;
      pl.connect(plg2); plg2.connect(pulse.gain); pl.start();
      var cg = ctx.createGain(); cg.gain.value = 0;
      co.connect(cf); co2.connect(g2); g2.connect(cf); cf.connect(pulse); pulse.connect(cg);
      route(cg, 0.2); co.start(); co2.start();
      charge = { o: co, o2: co2, f: cf, g: cg, l: pl };

      document.addEventListener('visibilitychange', function () {
        if (!ctx) return;
        if (document.hidden) ctx.suspend(); else if (on) ctx.resume();
      });
      setTimeout(twinkle, 3500);
    }
    function setCharge(h) {
      if (!ctx || !charge) return;
      var t = ctx.currentTime;
      charge.g.gain.setTargetAtTime(Math.pow(h, 1.5) * 0.2, t, 0.06);
      charge.o.frequency.setTargetAtTime(60 + h * 240, t, 0.08);
      charge.o2.frequency.setTargetAtTime(30 + h * 120, t, 0.08);
      charge.f.frequency.setTargetAtTime(180 + h * 2200, t, 0.08);
      charge.l.frequency.setTargetAtTime(2 + h * 16, t, 0.1);
    }
    function launch() {
      if (!ctx || !on) return;
      setCharge(0);
      var t = ctx.currentTime;
      ambG.gain.setTargetAtTime(0.15, t, 0.4);
      var o = ctx.createOscillator(), og = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(28, t + 1.6);
      og.gain.setValueAtTime(0.8, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      o.connect(og); route(og, 0.3); o.start(t); o.stop(t + 1.9);
      var r = src(t, 4.6), rl = ctx.createBiquadFilter(), rgn = ctx.createGain();
      rl.type = 'lowpass'; rl.frequency.setValueAtTime(160, t); rl.frequency.exponentialRampToValueAtTime(700, t + 4);
      env(rgn, t, 0.5, 1.2, 4.5); r.connect(rl); rl.connect(rgn); route(rgn, 0.15);
      var w = src(t, 4.6), bp = ctx.createBiquadFilter(), wg = ctx.createGain();
      bp.type = 'bandpass'; bp.Q.value = 0.8;
      bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(4000, t + 3.8);
      env(wg, t, 0.55, 2.2, 4.5); w.connect(bp); bp.connect(wg); route(wg, 0.25);
      var rs = ctx.createOscillator(), rf = ctx.createBiquadFilter(), rsg = ctx.createGain();
      rs.type = 'sawtooth'; rs.frequency.setValueAtTime(80, t); rs.frequency.exponentialRampToValueAtTime(900, t + 4);
      rf.type = 'lowpass'; rf.frequency.setValueAtTime(400, t); rf.frequency.exponentialRampToValueAtTime(3000, t + 4);
      env(rsg, t, 0.1, 3.8, 4.3); rs.connect(rf); rf.connect(rsg); route(rsg, 0.3); rs.start(t); rs.stop(t + 4.4);
      var bt = t + 1.7, b = src(bt, 1.2), hp = ctx.createBiquadFilter(), bg = ctx.createGain();
      hp.type = 'highpass'; hp.frequency.value = 2000; env(bg, bt, 0.18, 0.3, 1.0);
      b.connect(hp); hp.connect(bg); route(bg, 0.4);
    }
    function land() {
      if (!ctx || !on) return;
      var t = ctx.currentTime;
      var o = ctx.createOscillator(), og = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(75, t); o.frequency.exponentialRampToValueAtTime(34, t + 0.5);
      og.gain.setValueAtTime(0.6, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      o.connect(og); route(og, 0.3); o.start(t); o.stop(t + 0.8);
      [392, 523.25, 659.25, 783.99].forEach(function (f, i) {
        var c = ctx.createOscillator(), cg = ctx.createGain(), st = t + 0.35 + i * 0.13;
        c.type = 'triangle'; c.frequency.value = f;
        env(cg, st, 0.09, 0.03, 2.6);
        c.connect(cg); route(cg, 0.6); c.start(st); c.stop(st + 2.7);
      });
      [220, 329.63, 440].forEach(function (f) {
        var c = ctx.createOscillator(), cg = ctx.createGain();
        c.type = 'sine'; c.frequency.value = f;
        env(cg, t + 0.3, 0.07, 1.2, 3.6);
        c.connect(cg); route(cg, 0.7); c.start(t + 0.3); c.stop(t + 4);
      });
      ambG.gain.setTargetAtTime(0.55, t + 0.5, 1.2);
    }
    function swish() {
      if (!ctx || !on) return;
      var t = ctx.currentTime, s = src(t, 1.1), f = ctx.createBiquadFilter(), g = ctx.createGain(), p = panner(Math.random() * 1.4 - 0.7), out = g;
      f.type = 'bandpass'; f.Q.value = 1.2;
      f.frequency.setValueAtTime(5500, t); f.frequency.exponentialRampToValueAtTime(1800, t + 0.9);
      env(g, t, 0.06, 0.25, 0.95);
      s.connect(f); f.connect(g);
      if (p) { g.connect(p); out = p; }
      route(out, 0.5);
    }
    function tick(freq) {
      if (!ctx || !on) return;
      var f0 = freq || 880, t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 1.5, t + 0.06);
      g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      o.connect(g); route(g, 0.25); o.start(t); o.stop(t + 0.16);
    }
    function toggle() {
      on = !on;
      init();
      if (ctx && master) {
        master.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, 0.05);
        if (on && ctx.state === 'suspended') ctx.resume();
      }
      if (on) tick();
      return on;
    }
    return { init: init, setCharge: setCharge, launch: launch, land: land, swish: swish, tick: tick, toggle: toggle };
  })();
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, sfx.init, { passive: true }); });
  sndBtn.addEventListener('click', function () {
    var on = sfx.toggle();
    sndBtn.classList.toggle('muted', !on);
    sndBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    sndBtn.setAttribute('aria-label', on ? T[lang].soundOn : T[lang].soundOff);
  });

  var state = 'idle', ready = false, introControlMode = null;
  var autoGo = false, quickGo = false, h = 0;
  var mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  var L = { dir: new THREE.Vector3(), d0: 20, t0: 0, dur: 4400, look0: new THREE.Vector3() };
  var UP = new THREE.Vector3(0, 1, 0);
  var sunView = new THREE.Vector3();
  var frame = 0, lastMsg = -1, lastLabel = '';

  function startLaunch() {
    if (state !== 'idle') return;
    state = 'launch';
    autoGo = false; quickGo = false;
    hud.classList.add('launching');
    flash.classList.remove('go');
    void flash.offsetWidth;
    flash.classList.add('go');
    shatter();
    sfx.launch();
    dust.style.transition = 'none';
    L.dir.copy(camera.position).sub(MOON).normalize();
    L.d0 = camera.position.distanceTo(MOON);
    L.look0.copy(LOOK0);
    L.dur = reduce ? 1200 : 4400;
    L.t0 = performance.now();
    lastMsg = -1;
  }
  function finishLanding() {
    state = 'landed';
    sfx.land();
    try { window.dispatchEvent(new CustomEvent('raed:start')); } catch (e) {}
    FlightSequence.start(1, introControlMode || 'autopilot', openEnvSelector);
  }

  function chooseIntroControl(mode){
    introControlMode=mode;
    $('introManual').setAttribute('aria-pressed',mode==='manual'?'true':'false');$('introAuto').setAttribute('aria-pressed',mode==='autopilot'?'true':'false');
    $('introManual').classList.toggle('selected',mode==='manual');$('introAuto').classList.toggle('selected',mode==='autopilot');
    $('introControlHint').textContent=lang==='ar'?(mode==='manual'?'اختيارك: تحكم يدوي يبدأ من الإقلاع.':'اختيارك: الطيار الآلي يقود الإقلاع.'):(mode==='manual'?'Selected: you will control the launch.':'Selected: autopilot will fly the launch.');
    if(ready){hold.disabled=false;quick.disabled=false;holdLabel.textContent=T[lang].hold;}
  }
  $('introManual').addEventListener('click',function(){chooseIntroControl('manual');});
  $('introAuto').addEventListener('click',function(){chooseIntroControl('autopilot');});

  hold.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  hold.addEventListener('click', function () { if (ready && state === 'idle'&&introControlMode) { autoGo = true; sfx.tick(880); } else if(!introControlMode){$('introControlHint').textContent=lang==='ar'?'اختر التحكم اليدوي أو الطيار الآلي قبل الإقلاع.':'Choose manual control or autopilot before launch.';} });
  quick.addEventListener('click', function () { if (ready && state === 'idle'&&introControlMode) quickGo = true;else if(!introControlMode)$('introControlHint').textContent=lang==='ar'?'اختر نمط التحكم أولًا.':'Choose a control mode first.'; });
  window.addEventListener('pointermove', function (e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  });
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  var last = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    var time = now / 1000;
    frame++;

    stars.rotation.y += dt * (reduce ? 0 : 0.003);
    motes.rotation.y = reduce ? 0 : Math.sin(time * 0.05) * 0.08;
    introMoon.rotation.y += dt * (reduce ? 0 : 0.012);

    if (!reduce) {
      if (!sh.active) {
        sh.next -= dt;
        if (sh.next <= 0) {
          sh.active = true; sh.t = 0;
          sfx.swish();
          var ang = -(0.22 + Math.random() * 0.2);
          shoot.position.set(-60 + Math.random() * 50, 18 + Math.random() * 18, -90);
          shoot.rotation.z = ang;
          sh.vx = Math.cos(ang) * 75; sh.vy = Math.sin(ang) * 75;
        }
      } else {
        sh.t += dt;
        shoot.position.x += sh.vx * dt; shoot.position.y += sh.vy * dt;
        shoot.material.opacity = Math.sin(Math.PI * clamp(sh.t / sh.life, 0, 1)) * 0.9;
        if (sh.t > sh.life) { sh.active = false; sh.next = 6 + Math.random() * 8; shoot.material.opacity = 0; }
      }
    }

    var e = 0;
    if (state === 'idle') {
      if (ready) {
        if (autoGo || quickGo) h += dt / (quickGo ? 0.35 : 0.8);
        else h -= dt / 0.8;
        h = clamp(h, 0, 1);
      }
      e = easeInOut(h);
      if (frame % 3 === 0) sfx.setCharge(h);
      var wantPhrase = phrase === 0 ? (h > 0.55 ? 1 : 0) : (h < 0.3 ? 0 : 1);
      if (wantPhrase !== phrase) swapPhrase(wantPhrase);
      subEl.style.opacity = (1 - clamp((h - 0.05) / 0.25, 0, 1)).toFixed(2);
      var label = !ready ? T[lang].loading : T[lang].hold;
      if (label !== lastLabel) { lastLabel = label; holdLabel.textContent = label; }

      mouse.sx += (mouse.x - mouse.sx) * 0.05;
      mouse.sy += (mouse.y - mouse.sy) * 0.05;
      var sway = reduce ? 0 : 1;
      camera.position.set(
        CAM0.x + mouse.sx * 0.6 * sway + Math.sin(time * 0.2) * 0.08 * sway,
        CAM0.y - mouse.sy * 0.25 * sway + Math.sin(time * 0.27) * 0.03 * sway,
        CAM0.z - e * 1.1
      );
      camera.fov = lerp(46, 41, e);
      camera.updateProjectionMatrix();
      camera.lookAt(LOOK0);
      atmMat.uniforms.uK.value = 1;
      if (ready && h >= 1) startLaunch();
    } else if (state === 'launch') {
      e = 1;
      var p = clamp((now - L.t0) / L.dur, 0, 1);
      var ep = easeInOut(p);
      var dist = Math.exp(lerp(Math.log(L.d0), Math.log(RM * 1.045), ep));
      camera.position.copy(L.dir).multiplyScalar(dist).add(MOON);
      var tan = new THREE.Vector3().crossVectors(UP, L.dir).normalize();
      var tEnd = camera.position.clone().add(tan).addScaledVector(L.dir, -0.12);
      var target = L.look0.clone().lerp(MOON, ss(0, 0.3, p)).lerp(tEnd, ss(0.55, 1, p));
      camera.lookAt(target);
      camera.fov = lerp(41, 72, ep);
      camera.updateProjectionMatrix();
      atmMat.uniforms.uK.value = lerp(1, 0.25, ep);
      dust.style.opacity = String(ss(0.74, 0.99, p));
      var mi = p < 0.38 ? 0 : (p < 0.72 ? 1 : 2);
      if (mi !== lastMsg) { lastMsg = mi; msgT.textContent = T[lang].msgs[mi]; }
      if (frame % 4 === 0) msgA.textContent = Math.round(Math.max(0, (dist - RM) / RM * RK)).toLocaleString('en-US') + ' KM';
      if (p >= 1) finishLanding();
    } else {
      mouse.sx += (mouse.x - mouse.sx) * 0.05;
      camera.lookAt(camera.position.clone().add(new THREE.Vector3(0, 0, -1)));
    }

    updateCubes(time, dt, e);

    camera.updateMatrixWorld();
    sunView.copy(sunDir).transformDirection(camera.matrixWorldInverse);
    atmMat.uniforms.uSun.value.copy(sunView);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(loop);

  loadNasaMoonMesh(1,function(mesh){introMoon.add(mesh);ready=true;hold.disabled=!introControlMode;quick.disabled=!introControlMode;if(!introControlMode)holdLabel.textContent=lang==='ar'?'اختر التحكم أولًا':'Choose control mode first';},function(error){holdLabel.textContent=(lang==='ar'?'تعذر تحميل نموذج NASA: ':'NASA lunar model could not be loaded: ')+(error.message||'unknown error');});


  var rocketCursor = $('rocketCursor');
  if (rocketCursor && window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.documentElement.classList.add('rocket-pointer');
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      rocketCursor.classList.add('visible');
      rocketCursor.style.transform = 'translate3d(' + (e.clientX - 12) + 'px,' + (e.clientY - 12) + 'px,0)';
      var target = e.target && ((e.target.closest && e.target.closest('button,a,[role="button"],input,select,summary')) || e.target.tagName === 'IFRAME');
      rocketCursor.classList.toggle('on-target', !!target);
    });
    window.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || !((e.target.closest && e.target.closest('button,a,[role="button"],input,select,summary')) || e.target.tagName === 'IFRAME')) return;
      rocketCursor.classList.remove('igniting');
      void rocketCursor.offsetWidth;
      rocketCursor.classList.add('igniting');
      window.setTimeout(function () { rocketCursor.classList.remove('igniting'); }, 420);
    });
    window.addEventListener('blur', function () { rocketCursor.classList.remove('visible', 'igniting', 'on-target'); });
    document.addEventListener('mouseleave', function () { rocketCursor.classList.remove('visible', 'igniting', 'on-target'); });
  }

})();

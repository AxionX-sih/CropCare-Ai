(() => {
"use strict";
const API_BASE_URL = "https://cropcare-ai-backend-o5v5.onrender.com";
/* =========================================================
   CropCare AI - Complete Frontend
   10 Languages + Chat + Detection + Camera + Voice
   ========================================================= */

let currentLanguage =
    localStorage.getItem("cropcare-language") || "en";

let selectedFile = null;
let cameraStream = null;
let latestPrediction = null;
let lastAssistantAnswer = "";


/* =========================================================
   SUPPORTED LANGUAGES
   ========================================================= */

const LANGS = {
    en: "English",
    hi: "हिन्दी",
    mr: "मराठी",
    gu: "ગુજરાતી",
    bn: "বাংলা",
    ta: "தமிழ்",
    te: "తెలుగు",
    kn: "ಕನ್ನಡ",
    ml: "മലയാളം",
    pa: "ਪੰਜਾਬੀ"
};


/* =========================================================
   TRANSLATIONS
   ========================================================= */

const translations = {

    /* =====================================================
       ENGLISH
       ===================================================== */

    en: {
        navDetect: "Detect",
        navLibrary: "Plant Library",
        navRecovery: "Recovery",
        navAssistant: "AI Assistant",

        tryNow: "Try Now →",

        heroTitle: "A smarter way to care for every plant.",
        heroText: "Upload a leaf photo, select the plant type, understand the possible disease, and get simple recovery steps in a language you understand.",
        checkPlant: "Check My Plant →",
        exploreLibrary: "Explore Plant Library",

        detectTitle: "Let CropCare AI inspect your plant.",
        detectText: "Use a photo or camera. For the best result, capture one clear leaf in good light.",

        uploadTitle: "Upload or capture",
        plantType: "Plant type",
        plantName: "Plant / crop",
        chooseImage: "Choose a clear plant image",
        browse: "Click to browse • JPG / PNG / WEBP",

        useCamera: "📷 Use Camera",
        capture: "Capture",
        stop: "Stop",

        previewText: "Your image preview appears here",
        analyze: "Analyze with CropCare AI →",

        resultTitle: "Plant health report",
        noResult: "No analysis yet",
        noResultText: "Upload a plant image and your report will appear here.",

        libraryTitle: "From farm crops to indoor plants.",
        libraryText: "A structured catalog makes the same experience useful for farmers, gardeners and home-plant owners.",
        searchPlant: "Search plant...",
        all: "All",
        crops: "Crops",
        vegetables: "Vegetables",
        fruits: "Fruits",
        outdoor: "Outdoor",
        indoor: "Indoor",

        diseaseTitle: "Understand the problem, not just the name.",
        diseaseText: "Each supported disease entry can contain symptoms, likely causes, prevention and recovery guidance.",

        symptoms: "Symptoms",
        symptomsText: "What visible signs to look for on leaves, stems, fruit or soil.",
        causes: "Possible causes",
        causesText: "Environmental stress, pathogens, pests or care-related factors.",
        recoveryPlan: "Recovery plan",
        recoveryPlanText: "Clear, staged actions with safer care reminders and follow-up checks.",
        prevention: "Prevention",
        preventionText: "Practical habits that can reduce repeat problems.",

        recoveryTitle: "Help your plant recover step by step.",
        recoveryText: "After detection, CropCare AI can show a simple action plan and let you track later checks.",
        healthInsight: "health insight",
        recoveryGuide: "RECOVERY GUIDE",
        recoveryEmpty: "Analyze an image to receive plant-specific guidance.",
        checkAgain: "Check Again →",

        assistantTitle: "Ask questions. Listen to answers.",
        assistantText: "The assistant can explain a result in simpler language and read the answer aloud. Voice input depends on browser support.",
        assistantWelcome: "Hi! Ask me about plant symptoms, recovery, watering, sunlight or your latest AI result.",

        suggestRecovery: "🌱 Help it recover",
        suggestSymptoms: "🔎 Symptoms",
        suggestSunlight: "☀️ Sunlight",

        assistantPlaceholder: "Ask CropCare AI...",
        send: "Send",
        voiceInput: "🎙 Voice input",
        listen: "Listen",
        stopAudio: "⏹ Stop audio",

        accessibilityTitle: "Designed for accessibility",
        accessibilityText: "For users who find reading or typing difficult, the website can combine large controls, voice input and text-to-speech.",
        accessibilityOne: "Tap the microphone to speak when supported.",
        accessibilityTwo: "Tap “Listen” to hear the latest guidance.",
        accessibilityThree: "Switch language before speaking or listening.",

        footerText: "AI-assisted plant health education and recovery guidance.",
        footerWarning: "Student Innovation Project • Always confirm serious crop disease with a qualified agricultural expert.",

        dark: "Dark",
        light: "Light",

        noImage: "Please select a plant image first.",
        analyzing: "Analyzing your plant...",
        saved: "Result saved successfully.",
        error: "Something went wrong. Please try again.",
        cameraError: "Unable to access the camera.",
        noCamera: "Camera is not supported by this browser.",

        selectPlant: "Select a plant",
        plant: "Plant",
        disease: "Disease",
        confidence: "Confidence",
        saveResult: "Save Result",
        recovery: "Recovery",
        loading: "Loading...",
        generalPlantCare: "General plant-care mode",
        noPlants: "No plants found.",
        imageFileError: "Please select an image file.",
        chatFailed: "Chat failed.",
        thinking: "Thinking..."
    },


    /* =====================================================
       HINDI
       ===================================================== */

    hi: {
        navDetect: "जांच",
        navLibrary: "पौधों की लाइब्रेरी",
        navRecovery: "उपचार",
        navAssistant: "AI सहायक",

        tryNow: "अभी जांचें →",

        heroTitle: "हर पौधे की देखभाल का एक स्मार्ट तरीका.",
        heroText: "पत्ती की फोटो अपलोड करें, पौधे का प्रकार चुनें, संभावित बीमारी समझें और अपनी भाषा में आसान उपचार के चरण पाएं।",
        checkPlant: "मेरे पौधे की जांच करें →",
        exploreLibrary: "पौधों की लाइब्रेरी देखें",

        detectTitle: "CropCare AI को अपने पौधे की जांच करने दें.",
        detectText: "फोटो या कैमरा इस्तेमाल करें। अच्छे परिणाम के लिए अच्छी रोशनी में एक साफ पत्ती की तस्वीर लें।",

        uploadTitle: "अपलोड या कैप्चर करें",
        plantType: "पौधे का प्रकार",
        plantName: "पौधा / फसल",
        chooseImage: "पौधे की साफ तस्वीर चुनें",
        browse: "ब्राउज़ करने के लिए क्लिक करें • JPG / PNG / WEBP",

        useCamera: "📷 कैमरा इस्तेमाल करें",
        capture: "तस्वीर लें",
        stop: "रोकें",

        previewText: "आपकी तस्वीर यहां दिखाई देगी",
        analyze: "CropCare AI से विश्लेषण करें →",

        resultTitle: "पौधे की स्वास्थ्य रिपोर्ट",
        noResult: "अभी कोई विश्लेषण नहीं",
        noResultText: "पौधे की तस्वीर अपलोड करें और रिपोर्ट यहां दिखाई देगी।",

        libraryTitle: "खेत की फसलों से लेकर इनडोर पौधों तक.",
        libraryText: "एक व्यवस्थित कैटलॉग किसानों, बागवानों और घर में पौधे रखने वालों के लिए उपयोगी है।",
        searchPlant: "पौधा खोजें...",
        all: "सभी",
        crops: "फसलें",
        vegetables: "सब्जियां",
        fruits: "फल",
        outdoor: "बाहरी",
        indoor: "इनडोर",

        diseaseTitle: "सिर्फ नाम नहीं, समस्या को समझें.",
        diseaseText: "हर बीमारी की जानकारी में लक्षण, संभावित कारण, रोकथाम और उपचार शामिल हो सकते हैं।",

        symptoms: "लक्षण",
        symptomsText: "पत्तियों, तनों, फलों या मिट्टी पर दिखाई देने वाले संकेत।",
        causes: "संभावित कारण",
        causesText: "पर्यावरणीय तनाव, रोगजनक, कीट या देखभाल से जुड़े कारण।",
        recoveryPlan: "उपचार योजना",
        recoveryPlanText: "स्पष्ट चरणों में देखभाल और आगे की जांच।",
        prevention: "रोकथाम",
        preventionText: "ऐसी आदतें जो समस्या दोबारा होने की संभावना कम कर सकती हैं।",

        recoveryTitle: "अपने पौधे को चरण-दर-चरण ठीक होने में मदद करें.",
        recoveryText: "पहचान के बाद CropCare AI एक आसान उपचार योजना दिखा सकता है।",
        healthInsight: "स्वास्थ्य जानकारी",
        recoveryGuide: "उपचार गाइड",
        recoveryEmpty: "पौधे की विशेष सलाह पाने के लिए तस्वीर का विश्लेषण करें।",
        checkAgain: "फिर जांचें →",

        assistantTitle: "सवाल पूछें। जवाब सुनें.",
        assistantText: "सहायक परिणाम को आसान भाषा में समझा सकता है और जवाब पढ़कर सुना सकता है।",
        assistantWelcome: "नमस्ते! पौधे के लक्षण, उपचार, पानी, धूप या अपने नवीनतम AI परिणाम के बारे में पूछें।",

        suggestRecovery: "🌱 इसे ठीक करने में मदद",
        suggestSymptoms: "🔎 लक्षण",
        suggestSunlight: "☀️ धूप",

        assistantPlaceholder: "CropCare AI से पूछें...",
        send: "भेजें",
        voiceInput: "🎙 आवाज़ से पूछें",
        listen: "सुनें",
        stopAudio: "⏹ आवाज़ रोकें",

        accessibilityTitle: "सुलभता के लिए बनाया गया",
        accessibilityText: "वेबसाइट बड़े नियंत्रण, आवाज़ इनपुट और टेक्स्ट-टू-स्पीच का उपयोग कर सकती है।",
        accessibilityOne: "समर्थित होने पर माइक्रोफोन दबाकर बोलें।",
        accessibilityTwo: "नवीनतम सलाह सुनने के लिए “सुनें” दबाएं।",
        accessibilityThree: "बोलने या सुनने से पहले भाषा बदलें।",

        footerText: "AI की मदद से पौधों की स्वास्थ्य शिक्षा और उपचार मार्गदर्शन।",
        footerWarning: "छात्र नवाचार परियोजना • गंभीर फसल रोग की पुष्टि योग्य कृषि विशेषज्ञ से करें।",

        dark: "डार्क",
        light: "लाइट",

        noImage: "कृपया पहले पौधे की तस्वीर चुनें।",
        analyzing: "आपके पौधे का विश्लेषण हो रहा है...",
        saved: "परिणाम सफलतापूर्वक सेव हो गया।",
        error: "कुछ गलत हुआ। कृपया फिर कोशिश करें।",
        cameraError: "कैमरा इस्तेमाल नहीं किया जा सकता।",
        noCamera: "इस ब्राउज़र में कैमरा समर्थित नहीं है।",

        selectPlant: "पौधा चुनें",
        plant: "पौधा",
        disease: "रोग",
        confidence: "विश्वास स्तर",
        saveResult: "परिणाम सेव करें",
        recovery: "उपचार",
        loading: "लोड हो रहा है...",
        generalPlantCare: "सामान्य पौधा-देखभाल मोड",
        noPlants: "कोई पौधा नहीं मिला।",
        imageFileError: "कृपया एक इमेज फ़ाइल चुनें।",
        chatFailed: "चैट काम नहीं कर सकी।",
        thinking: "सोच रहा हूँ..."
    },


    /* =====================================================
       MARATHI
       ===================================================== */

    mr: {
        navDetect: "तपासणी",
        navLibrary: "वनस्पती लायब्ररी",
        navRecovery: "उपचार",
        navAssistant: "AI सहाय्यक",

        tryNow: "आता तपासा →",

        heroTitle: "प्रत्येक रोपाची काळजी घेण्याचा स्मार्ट मार्ग.",
        heroText: "पानाचा फोटो अपलोड करा, रोपाचा प्रकार निवडा, संभाव्य रोग समजून घ्या आणि आपल्या भाषेत सोपे उपचाराचे टप्पे मिळवा.",
        checkPlant: "माझे रोप तपासा →",
        exploreLibrary: "वनस्पती लायब्ररी पहा",

        detectTitle: "CropCare AI ला तुमच्या रोपाची तपासणी करू द्या.",
        detectText: "फोटो किंवा कॅमेरा वापरा. चांगल्या परिणामासाठी चांगल्या प्रकाशात स्वच्छ पानाचा फोटो घ्या.",

        uploadTitle: "अपलोड किंवा कॅप्चर करा",
        plantType: "रोपाचा प्रकार",
        plantName: "रोप / पीक",
        chooseImage: "स्वच्छ रोपाचा फोटो निवडा",
        browse: "ब्राउझ करण्यासाठी क्लिक करा • JPG / PNG / WEBP",

        useCamera: "📷 कॅमेरा वापरा",
        capture: "फोटो काढा",
        stop: "थांबवा",

        previewText: "तुमचा फोटो येथे दिसेल",
        analyze: "CropCare AI ने विश्लेषण करा →",

        resultTitle: "रोपाच्या आरोग्याचा अहवाल",
        noResult: "अजून विश्लेषण नाही",
        noResultText: "रोपाचा फोटो अपलोड करा आणि अहवाल येथे दिसेल.",

        libraryTitle: "शेतातील पिकांपासून घरातील रोपांपर्यंत.",
        libraryText: "व्यवस्थित कॅटलॉग शेतकरी, बागकाम करणारे आणि घरातील रोपांच्या मालकांसाठी उपयुक्त आहे.",
        searchPlant: "रोप शोधा...",
        all: "सर्व",
        crops: "पिके",
        vegetables: "भाज्या",
        fruits: "फळे",
        outdoor: "बाहेरील",
        indoor: "घरातील",

        diseaseTitle: "फक्त नाव नाही, समस्या समजून घ्या.",
        diseaseText: "प्रत्येक रोगाच्या माहितीत लक्षणे, संभाव्य कारणे, प्रतिबंध आणि उपचार मार्गदर्शन असू शकते.",

        symptoms: "लक्षणे",
        symptomsText: "पाने, देठ, फळे किंवा मातीवरील दिसणारी चिन्हे.",
        causes: "संभाव्य कारणे",
        causesText: "पर्यावरणीय ताण, रोगकारक, कीड किंवा निगा-संबंधित कारणे.",
        recoveryPlan: "उपचार योजना",
        recoveryPlanText: "स्पष्ट टप्प्यांमध्ये काळजी आणि पुढील तपासणी.",
        prevention: "प्रतिबंध",
        preventionText: "समस्या पुन्हा होण्याची शक्यता कमी करणाऱ्या सवयी.",

        recoveryTitle: "तुमच्या रोपाला टप्प्याटप्प्याने बरे होण्यास मदत करा.",
        recoveryText: "तपासणीनंतर CropCare AI सोपी उपचार योजना दाखवू शकते.",
        healthInsight: "आरोग्य माहिती",
        recoveryGuide: "उपचार मार्गदर्शक",
        recoveryEmpty: "रोपासाठी विशेष मार्गदर्शन मिळवण्यासाठी फोटोचे विश्लेषण करा.",
        checkAgain: "पुन्हा तपासा →",

        assistantTitle: "प्रश्न विचारा. उत्तरे ऐका.",
        assistantText: "सहाय्यक परिणाम सोप्या भाषेत समजावू शकतो आणि उत्तर मोठ्याने वाचू शकतो.",
        assistantWelcome: "नमस्कार! रोपाची लक्षणे, उपचार, पाणी, सूर्यप्रकाश किंवा तुमच्या AI निकालाबद्दल विचारा.",

        suggestRecovery: "🌱 बरे होण्यास मदत",
        suggestSymptoms: "🔎 लक्षणे",
        suggestSunlight: "☀️ सूर्यप्रकाश",

        assistantPlaceholder: "CropCare AI ला विचारा...",
        send: "पाठवा",
        voiceInput: "🎙 आवाजाने विचारा",
        listen: "ऐका",
        stopAudio: "⏹ आवाज थांबवा",

        accessibilityTitle: "सुलभतेसाठी तयार केलेले",
        accessibilityText: "वाचणे किंवा टाइप करणे कठीण वाटणाऱ्या वापरकर्त्यांसाठी मोठी नियंत्रणे, आवाज इनपुट आणि टेक्स्ट-टू-स्पीच वापरता येते.",
        accessibilityOne: "समर्थित असल्यास मायक्रोफोन दाबून बोला.",
        accessibilityTwo: "नवीन मार्गदर्शन ऐकण्यासाठी “ऐका” दाबा.",
        accessibilityThree: "बोलण्यापूर्वी किंवा ऐकण्यापूर्वी भाषा बदला.",

        footerText: "AI-सहाय्यित वनस्पती आरोग्य शिक्षण आणि उपचार मार्गदर्शन.",
        footerWarning: "विद्यार्थी नवोपक्रम प्रकल्प • गंभीर पीक रोगाची खात्री पात्र कृषी तज्ज्ञाकडून करून घ्या.",

        dark: "डार्क",
        light: "लाइट",

        noImage: "कृपया आधी रोपाचा फोटो निवडा.",
        analyzing: "तुमच्या रोपाचे विश्लेषण होत आहे...",
        saved: "निकाल यशस्वीरित्या सेव्ह झाला.",
        error: "काहीतरी चूक झाली. पुन्हा प्रयत्न करा.",
        cameraError: "कॅमेरा वापरता आला नाही.",
        noCamera: "या ब्राउझरमध्ये कॅमेरा उपलब्ध नाही.",

        selectPlant: "रोप निवडा",
        plant: "रोप",
        disease: "रोग",
        confidence: "विश्वास पातळी",
        saveResult: "निकाल सेव्ह करा",
        recovery: "उपचार",
        loading: "लोड होत आहे...",
        generalPlantCare: "सामान्य रोप काळजी मोड",
        noPlants: "कोणतेही रोप सापडले नाही.",
        imageFileError: "कृपया इमेज फाइल निवडा.",
        chatFailed: "चॅट अयशस्वी झाले.",
        thinking: "विचार करत आहे..."
    },


    /* =====================================================
       GUJARATI
       ===================================================== */

    gu: {
        navDetect: "તપાસો",
        navLibrary: "છોડ લાઇબ્રેરી",
        navRecovery: "સુધારણા",
        navAssistant: "AI સહાયક",

        tryNow: "હમણાં તપાસો →",

        heroTitle: "દરેક છોડની સંભાળ રાખવાની વધુ સ્માર્ટ રીત.",
        heroText: "પાનનો ફોટો અપલોડ કરો, છોડનો પ્રકાર પસંદ કરો, સંભવિત રોગ સમજો અને તમારી ભાષામાં સરળ સુધારણા સૂચનાઓ મેળવો.",
        checkPlant: "મારો છોડ તપાસો →",
        exploreLibrary: "છોડ લાઇબ્રેરી જુઓ",

        detectTitle: "CropCare AI ને તમારા છોડની તપાસ કરવા દો.",
        detectText: "ફોટો અથવા કેમેરાનો ઉપયોગ કરો. સારા પરિણામ માટે સારી રોશનીમાં એક સ્પષ્ટ પાનનો ફોટો લો.",

        uploadTitle: "અપલોડ અથવા કેપ્ચર કરો",
        plantType: "છોડનો પ્રકાર",
        plantName: "છોડ / પાક",
        chooseImage: "છોડની સ્પષ્ટ તસવીર પસંદ કરો",
        browse: "બ્રાઉઝ કરવા ક્લિક કરો • JPG / PNG / WEBP",

        useCamera: "📷 કેમેરાનો ઉપયોગ કરો",
        capture: "ફોટો લો",
        stop: "બંધ કરો",

        previewText: "તમારી તસવીર અહીં દેખાશે",
        analyze: "CropCare AI સાથે વિશ્લેષણ કરો →",

        resultTitle: "છોડના આરોગ્યનો અહેવાલ",
        noResult: "હજુ કોઈ વિશ્લેષણ નથી",
        noResultText: "છોડની તસવીર અપલોડ કરો અને અહેવાલ અહીં દેખાશે.",

        libraryTitle: "ખેતરના પાકથી લઈને ઘરના છોડ સુધી.",
        libraryText: "વ્યવસ્થિત કેટલોગ ખેડૂતો, માળીઓ અને ઘરેલુ છોડના માલિકો માટે ઉપયોગી છે.",
        searchPlant: "છોડ શોધો...",
        all: "બધા",
        crops: "પાક",
        vegetables: "શાકભાજી",
        fruits: "ફળ",
        outdoor: "બહારના",
        indoor: "ઘરના",

        diseaseTitle: "માત્ર નામ નહીં, સમસ્યાને સમજો.",
        diseaseText: "દરેક રોગની માહિતી લક્ષણો, સંભવિત કારણો, નિવારણ અને સુધારણા માર્ગદર્શન આપી શકે છે.",

        symptoms: "લક્ષણો",
        symptomsText: "પાંદડા, ડાળીઓ, ફળ અથવા જમીન પર દેખાતા સંકેતો.",
        causes: "સંભવિત કારણો",
        causesText: "પર્યાવરણીય તણાવ, રોગકારક, જીવાત અથવા સંભાળ સંબંધિત કારણો.",
        recoveryPlan: "સુધારણા યોજના",
        recoveryPlanText: "સ્પષ્ટ તબક્કાવાર સંભાળ અને આગળની તપાસ.",
        prevention: "નિવારણ",
        preventionText: "સમસ્યા ફરી થવાની શક્યતા ઘટાડતી વ્યવહારુ આદતો.",

        recoveryTitle: "તમારા છોડને પગલું-દર-પગલું સ્વસ્થ થવામાં મદદ કરો.",
        recoveryText: "તપાસ પછી CropCare AI સરળ સુધારણા યોજના બતાવી શકે છે.",
        healthInsight: "આરોગ્ય માહિતી",
        recoveryGuide: "સુધારણા માર્ગદર્શિકા",
        recoveryEmpty: "છોડ માટે ખાસ માર્ગદર્શન મેળવવા તસવીરનું વિશ્લેષણ કરો.",
        checkAgain: "ફરી તપાસો →",

        assistantTitle: "પ્રશ્નો પૂછો. જવાબો સાંભળો.",
        assistantText: "સહાયક પરિણામને સરળ ભાષામાં સમજાવી શકે છે અને જવાબ મોટેથી વાંચી શકે છે.",
        assistantWelcome: "નમસ્તે! છોડના લક્ષણો, સુધારણા, પાણી, સૂર્યપ્રકાશ અથવા તમારા તાજેતરના AI પરિણામ વિશે પૂછો.",

        suggestRecovery: "🌱 તેને સ્વસ્થ થવામાં મદદ",
        suggestSymptoms: "🔎 લક્ષણો",
        suggestSunlight: "☀️ સૂર્યપ્રકાશ",

        assistantPlaceholder: "CropCare AI ને પૂછો...",
        send: "મોકલો",
        voiceInput: "🎙 અવાજથી પૂછો",
        listen: "સાંભળો",
        stopAudio: "⏹ અવાજ બંધ કરો",

        accessibilityTitle: "સુલભતા માટે બનાવેલું",
        accessibilityText: "વાંચવા અથવા ટાઇપ કરવામાં મુશ્કેલી ધરાવતા વપરાશકર્તાઓ માટે મોટા નિયંત્રણો, અવાજ ઇનપુટ અને ટેક્સ્ટ-ટુ-સ્પીચનો ઉપયોગ કરી શકાય છે.",
        accessibilityOne: "સપોર્ટ હોય ત્યારે માઇક્રોફોન દબાવીને બોલો.",
        accessibilityTwo: "તાજેતરની સલાહ સાંભળવા “સાંભળો” દબાવો.",
        accessibilityThree: "બોલતા અથવા સાંભળતા પહેલાં ભાષા બદલો.",

        footerText: "AI-સહાયિત છોડ આરોગ્ય શિક્ષણ અને સુધારણા માર્ગદર્શન.",
        footerWarning: "વિદ્યાર્થી નવીનતા પ્રોજેક્ટ • ગંભીર પાક રોગની પુષ્ટિ યોગ્ય કૃષિ નિષ્ણાત પાસેથી કરાવો.",

        dark: "ડાર્ક",
        light: "લાઇટ",

        noImage: "કૃપા કરીને પહેલા છોડની તસવીર પસંદ કરો.",
        analyzing: "તમારા છોડનું વિશ્લેષણ થઈ રહ્યું છે...",
        saved: "પરિણામ સફળતાપૂર્વક સાચવાયું.",
        error: "કંઈક ખોટું થયું. કૃપા કરીને ફરી પ્રયાસ કરો.",
        cameraError: "કેમેરા ઍક્સેસ કરી શકાયો નથી.",
        noCamera: "આ બ્રાઉઝરમાં કેમેરા સપોર્ટેડ નથી.",

        selectPlant: "છોડ પસંદ કરો",
        plant: "છોડ",
        disease: "રોગ",
        confidence: "વિશ્વાસ સ્તર",
        saveResult: "પરિણામ સાચવો",
        recovery: "સુધારણા",
        loading: "લોડ થઈ રહ્યું છે...",
        generalPlantCare: "સામાન્ય છોડ સંભાળ મોડ",
        noPlants: "કોઈ છોડ મળ્યો નથી.",
        imageFileError: "કૃપા કરીને ઇમેજ ફાઇલ પસંદ કરો.",
        chatFailed: "ચેટ નિષ્ફળ થઈ.",
        thinking: "વિચારી રહ્યું છે..."
    },


    /* =====================================================
       BENGALI
       ===================================================== */

    bn: {
        navDetect: "পরীক্ষা",
        navLibrary: "উদ্ভিদ লাইব্রেরি",
        navRecovery: "পুনরুদ্ধার",
        navAssistant: "AI সহায়ক",

        tryNow: "এখনই পরীক্ষা করুন →",

        heroTitle: "প্রতিটি গাছের যত্ন নেওয়ার আরও স্মার্ট উপায়।",
        heroText: "পাতার ছবি আপলোড করুন, গাছের ধরন নির্বাচন করুন, সম্ভাব্য রোগ বুঝুন এবং আপনার ভাষায় সহজ পুনরুদ্ধারের ধাপ পান।",
        checkPlant: "আমার গাছ পরীক্ষা করুন →",
        exploreLibrary: "উদ্ভিদ লাইব্রেরি দেখুন",

        detectTitle: "CropCare AI-কে আপনার গাছ পরীক্ষা করতে দিন।",
        detectText: "ছবি বা ক্যামেরা ব্যবহার করুন। ভালো ফলাফলের জন্য ভালো আলোতে একটি পরিষ্কার পাতার ছবি তুলুন।",

        uploadTitle: "আপলোড বা ক্যাপচার করুন",
        plantType: "গাছের ধরন",
        plantName: "গাছ / ফসল",
        chooseImage: "একটি পরিষ্কার গাছের ছবি নির্বাচন করুন",
        browse: "ব্রাউজ করতে ক্লিক করুন • JPG / PNG / WEBP",

        useCamera: "📷 ক্যামেরা ব্যবহার করুন",
        capture: "ছবি তুলুন",
        stop: "বন্ধ করুন",

        previewText: "আপনার ছবির প্রিভিউ এখানে দেখা যাবে",
        analyze: "CropCare AI দিয়ে বিশ্লেষণ করুন →",

        resultTitle: "গাছের স্বাস্থ্য রিপোর্ট",
        noResult: "এখনও কোনো বিশ্লেষণ নেই",
        noResultText: "গাছের ছবি আপলোড করুন এবং রিপোর্ট এখানে দেখা যাবে।",

        libraryTitle: "খেতের ফসল থেকে ঘরের গাছ পর্যন্ত।",
        libraryText: "একটি সাজানো ক্যাটালগ কৃষক, বাগানপ্রেমী এবং ঘরের গাছের মালিকদের জন্য উপযোগী।",
        searchPlant: "গাছ খুঁজুন...",
        all: "সব",
        crops: "ফসল",
        vegetables: "সবজি",
        fruits: "ফল",
        outdoor: "বাইরের",
        indoor: "ঘরের",

        diseaseTitle: "শুধু নাম নয়, সমস্যাটি বুঝুন।",
        diseaseText: "প্রতিটি রোগের তথ্যের মধ্যে লক্ষণ, সম্ভাব্য কারণ, প্রতিরোধ এবং পুনরুদ্ধারের নির্দেশনা থাকতে পারে।",

        symptoms: "লক্ষণ",
        symptomsText: "পাতা, কাণ্ড, ফল বা মাটিতে দেখা যাওয়া লক্ষণ।",
        causes: "সম্ভাব্য কারণ",
        causesText: "পরিবেশগত চাপ, রোগজীবাণু, পোকামাকড় বা যত্নের সমস্যা।",
        recoveryPlan: "পুনরুদ্ধার পরিকল্পনা",
        recoveryPlanText: "পরিষ্কার ধাপে যত্ন এবং পরবর্তী পরীক্ষা।",
        prevention: "প্রতিরোধ",
        preventionText: "সমস্যা আবার হওয়ার সম্ভাবনা কমানোর ব্যবহারিক অভ্যাস।",

        recoveryTitle: "ধাপে ধাপে আপনার গাছকে সুস্থ হতে সাহায্য করুন।",
        recoveryText: "পরীক্ষার পরে CropCare AI একটি সহজ পুনরুদ্ধার পরিকল্পনা দেখাতে পারে।",
        healthInsight: "স্বাস্থ্য তথ্য",
        recoveryGuide: "পুনরুদ্ধার নির্দেশিকা",
        recoveryEmpty: "গাছের জন্য নির্দিষ্ট নির্দেশনা পেতে ছবি বিশ্লেষণ করুন।",
        checkAgain: "আবার পরীক্ষা করুন →",

        assistantTitle: "প্রশ্ন করুন। উত্তর শুনুন।",
        assistantText: "সহায়ক ফলাফল সহজ ভাষায় ব্যাখ্যা করতে এবং উত্তর পড়ে শোনাতে পারে।",
        assistantWelcome: "নমস্কার! গাছের লক্ষণ, পুনরুদ্ধার, পানি দেওয়া, সূর্যালোক বা আপনার সর্বশেষ AI ফলাফল সম্পর্কে জিজ্ঞাসা করুন।",

        suggestRecovery: "🌱 সুস্থ হতে সাহায্য করুন",
        suggestSymptoms: "🔎 লক্ষণ",
        suggestSunlight: "☀️ সূর্যালোক",

        assistantPlaceholder: "CropCare AI-কে জিজ্ঞাসা করুন...",
        send: "পাঠান",
        voiceInput: "🎙 কণ্ঠে প্রশ্ন করুন",
        listen: "শুনুন",
        stopAudio: "⏹ অডিও বন্ধ করুন",

        accessibilityTitle: "সবার ব্যবহারের জন্য তৈরি",
        accessibilityText: "যাদের পড়তে বা টাইপ করতে অসুবিধা হয়, তাদের জন্য বড় নিয়ন্ত্রণ, ভয়েস ইনপুট এবং টেক্সট-টু-স্পিচ ব্যবহার করা যায়।",
        accessibilityOne: "সাপোর্ট থাকলে মাইক্রোফোনে ট্যাপ করে কথা বলুন।",
        accessibilityTwo: "সর্বশেষ নির্দেশনা শুনতে “শুনুন” চাপুন।",
        accessibilityThree: "কথা বলা বা শোনার আগে ভাষা পরিবর্তন করুন।",

        footerText: "AI-সহায়িত উদ্ভিদ স্বাস্থ্য শিক্ষা ও পুনরুদ্ধার নির্দেশনা।",
        footerWarning: "ছাত্র উদ্ভাবন প্রকল্প • গুরুতর ফসলের রোগ অবশ্যই যোগ্য কৃষি বিশেষজ্ঞের মাধ্যমে নিশ্চিত করুন।",

        dark: "ডার্ক",
        light: "লাইট",

        noImage: "দয়া করে প্রথমে একটি গাছের ছবি নির্বাচন করুন।",
        analyzing: "আপনার গাছ বিশ্লেষণ করা হচ্ছে...",
        saved: "ফলাফল সফলভাবে সংরক্ষিত হয়েছে।",
        error: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
        cameraError: "ক্যামেরা ব্যবহার করা যায়নি।",
        noCamera: "এই ব্রাউজারে ক্যামেরা সমর্থিত নয়।",

        selectPlant: "গাছ নির্বাচন করুন",
        plant: "গাছ",
        disease: "রোগ",
        confidence: "বিশ্বাসের মাত্রা",
        saveResult: "ফলাফল সংরক্ষণ করুন",
        recovery: "পুনরুদ্ধার",
        loading: "লোড হচ্ছে...",
        generalPlantCare: "সাধারণ গাছের যত্ন মোড",
        noPlants: "কোনো গাছ পাওয়া যায়নি।",
        imageFileError: "দয়া করে একটি ছবি ফাইল নির্বাচন করুন।",
        chatFailed: "চ্যাট ব্যর্থ হয়েছে।",
        thinking: "ভাবছি..."
    },


    /* =====================================================
       TAMIL
       ===================================================== */

    ta: {
        navDetect: "கண்டறிதல்",
        navLibrary: "தாவர நூலகம்",
        navRecovery: "மீட்பு",
        navAssistant: "AI உதவியாளர்",

        tryNow: "இப்போது முயற்சிக்கவும் →",

        heroTitle: "ஒவ்வொரு தாவரத்தையும் பராமரிக்க ஒரு புத்திசாலித்தனமான வழி.",
        heroText: "இலை புகைப்படத்தை பதிவேற்றவும், தாவர வகையைத் தேர்ந்தெடுக்கவும், சாத்தியமான நோயை புரிந்துகொள்ளவும், உங்கள் மொழியில் எளிய மீட்பு வழிமுறைகளைப் பெறவும்.",
        checkPlant: "என் தாவரத்தைச் சரிபார்க்கவும் →",
        exploreLibrary: "தாவர நூலகத்தைப் பார்க்கவும்",

        detectTitle: "CropCare AI உங்கள் தாவரத்தைப் பரிசோதிக்கட்டும்.",
        detectText: "புகைப்படம் அல்லது கேமராவைப் பயன்படுத்தவும். சிறந்த முடிவுக்கு நல்ல வெளிச்சத்தில் தெளிவான இலையின் புகைப்படத்தை எடுக்கவும்.",

        uploadTitle: "பதிவேற்றவும் அல்லது படம் எடுக்கவும்",
        plantType: "தாவர வகை",
        plantName: "தாவரம் / பயிர்",
        chooseImage: "தெளிவான தாவரப் படத்தைத் தேர்ந்தெடுக்கவும்",
        browse: "உலாவ கிளிக் செய்யவும் • JPG / PNG / WEBP",

        useCamera: "📷 கேமராவைப் பயன்படுத்தவும்",
        capture: "படம் எடுக்கவும்",
        stop: "நிறுத்தவும்",

        previewText: "உங்கள் படத்தின் முன்னோட்டம் இங்கே தோன்றும்",
        analyze: "CropCare AI மூலம் பகுப்பாய்வு செய்யவும் →",

        resultTitle: "தாவர ஆரோக்கிய அறிக்கை",
        noResult: "இன்னும் பகுப்பாய்வு இல்லை",
        noResultText: "தாவரப் படத்தைப் பதிவேற்றவும்; அறிக்கை இங்கே தோன்றும்.",

        libraryTitle: "வயல் பயிர்களிலிருந்து வீட்டுத் தாவரங்கள் வரை.",
        libraryText: "விவசாயிகள், தோட்டக்காரர்கள் மற்றும் வீட்டுத் தாவர உரிமையாளர்களுக்கு இந்த பட்டியல் பயனுள்ளதாக இருக்கும்.",
        searchPlant: "தாவரத்தைத் தேடுங்கள்...",
        all: "அனைத்தும்",
        crops: "பயிர்கள்",
        vegetables: "காய்கறிகள்",
        fruits: "பழங்கள்",
        outdoor: "வெளிப்புறம்",
        indoor: "உட்புறம்",

        diseaseTitle: "பெயரை மட்டும் அல்ல, பிரச்சினையையும் புரிந்துகொள்ளுங்கள்.",
        diseaseText: "ஒவ்வொரு நோய் தகவலிலும் அறிகுறிகள், சாத்தியமான காரணங்கள், தடுப்பு மற்றும் மீட்பு வழிகாட்டுதல் இருக்கலாம்.",

        symptoms: "அறிகுறிகள்",
        symptomsText: "இலைகள், தண்டுகள், பழங்கள் அல்லது மண்ணில் காணப்படும் அறிகுறிகள்.",
        causes: "சாத்தியமான காரணங்கள்",
        causesText: "சுற்றுச்சூழல் அழுத்தம், நோய்க்கிருமிகள், பூச்சிகள் அல்லது பராமரிப்பு காரணிகள்.",
        recoveryPlan: "மீட்பு திட்டம்",
        recoveryPlanText: "தெளிவான கட்டங்களுடன் பராமரிப்பு மற்றும் தொடர்ந்து செய்ய வேண்டிய சோதனைகள்.",
        prevention: "தடுப்பு",
        preventionText: "பிரச்சினைகள் மீண்டும் ஏற்படுவதை குறைக்க உதவும் பழக்கங்கள்.",

        recoveryTitle: "உங்கள் தாவரம் படிப்படியாக மீள உதவுங்கள்.",
        recoveryText: "கண்டறிதலுக்குப் பிறகு CropCare AI எளிய மீட்பு திட்டத்தை வழங்கலாம்.",
        healthInsight: "ஆரோக்கிய தகவல்",
        recoveryGuide: "மீட்பு வழிகாட்டி",
        recoveryEmpty: "தாவரத்திற்கான குறிப்பிட்ட வழிகாட்டுதலைப் பெற படத்தைப் பகுப்பாய்வு செய்யவும்.",
        checkAgain: "மீண்டும் சரிபார்க்கவும் →",

        assistantTitle: "கேள்விகள் கேளுங்கள். பதில்களைக் கேளுங்கள்.",
        assistantText: "உதவியாளர் முடிவை எளிய மொழியில் விளக்கி, பதிலைச் சத்தமாக வாசிக்க முடியும்.",
        assistantWelcome: "வணக்கம்! தாவர அறிகுறிகள், மீட்பு, நீர் ஊற்றுதல், சூரிய ஒளி அல்லது உங்கள் சமீபத்திய AI முடிவு பற்றி கேளுங்கள்.",

        suggestRecovery: "🌱 மீள உதவுங்கள்",
        suggestSymptoms: "🔎 அறிகுறிகள்",
        suggestSunlight: "☀️ சூரிய ஒளி",

        assistantPlaceholder: "CropCare AI-யிடம் கேளுங்கள்...",
        send: "அனுப்பு",
        voiceInput: "🎙 குரலில் கேளுங்கள்",
        listen: "கேளுங்கள்",
        stopAudio: "⏹ ஒலியை நிறுத்தவும்",

        accessibilityTitle: "அணுகலுக்காக வடிவமைக்கப்பட்டது",
        accessibilityText: "படிக்க அல்லது தட்டச்சு செய்ய சிரமம் உள்ளவர்களுக்கு பெரிய கட்டுப்பாடுகள், குரல் உள்ளீடு மற்றும் உரை-ஒலி வசதிகளைப் பயன்படுத்தலாம்.",
        accessibilityOne: "ஆதரவு இருந்தால் மைக்ரோஃபோனைத் தட்டி பேசுங்கள்.",
        accessibilityTwo: "சமீபத்திய வழிகாட்டுதலைக் கேட்க “கேளுங்கள்” என்பதைத் தட்டுங்கள்.",
        accessibilityThree: "பேசுவதற்கு அல்லது கேட்பதற்கு முன் மொழியை மாற்றுங்கள்.",

        footerText: "AI உதவியுடன் தாவர ஆரோக்கியக் கல்வி மற்றும் மீட்பு வழிகாட்டுதல்.",
        footerWarning: "மாணவர் புதுமைத் திட்டம் • தீவிரமான பயிர் நோயை தகுதியான வேளாண் நிபுணரிடம் உறுதிப்படுத்தவும்.",

        dark: "டார்க்",
        light: "லைட்",

        noImage: "முதலில் தாவரப் படத்தைத் தேர்ந்தெடுக்கவும்.",
        analyzing: "உங்கள் தாவரம் பகுப்பாய்வு செய்யப்படுகிறது...",
        saved: "முடிவு வெற்றிகரமாக சேமிக்கப்பட்டது.",
        error: "ஏதோ தவறு ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.",
        cameraError: "கேமராவை அணுக முடியவில்லை.",
        noCamera: "இந்த உலாவியில் கேமரா ஆதரிக்கப்படவில்லை.",

        selectPlant: "தாவரத்தைத் தேர்ந்தெடுக்கவும்",
        plant: "தாவரம்",
        disease: "நோய்",
        confidence: "நம்பிக்கை நிலை",
        saveResult: "முடிவை சேமிக்கவும்",
        recovery: "மீட்பு",
        loading: "ஏற்றப்படுகிறது...",
        generalPlantCare: "பொதுவான தாவர பராமரிப்பு முறை",
        noPlants: "தாவரங்கள் எதுவும் கிடைக்கவில்லை.",
        imageFileError: "படக் கோப்பைத் தேர்ந்தெடுக்கவும்.",
        chatFailed: "அரட்டை தோல்வியடைந்தது.",
        thinking: "யோசிக்கிறது..."
    },


    /* =====================================================
       TELUGU
       ===================================================== */

    te: {
        navDetect: "గుర్తింపు",
        navLibrary: "మొక్కల లైబ్రరీ",
        navRecovery: "పునరుద్ధరణ",
        navAssistant: "AI సహాయకుడు",

        tryNow: "ఇప్పుడే ప్రయత్నించండి →",

        heroTitle: "ప్రతి మొక్కను చూసుకోవడానికి మరింత తెలివైన మార్గం.",
        heroText: "ఆకు ఫోటోను అప్‌లోడ్ చేయండి, మొక్క రకాన్ని ఎంచుకోండి, సాధ్యమైన వ్యాధిని అర్థం చేసుకోండి మరియు మీ భాషలో సులభమైన పునరుద్ధరణ సూచనలు పొందండి.",
        checkPlant: "నా మొక్కను తనిఖీ చేయండి →",
        exploreLibrary: "మొక్కల లైబ్రరీని చూడండి",

        detectTitle: "CropCare AI మీ మొక్కను పరిశీలించనివ్వండి.",
        detectText: "ఫోటో లేదా కెమెరాను ఉపయోగించండి. మంచి ఫలితానికి మంచి వెలుతురులో ఒక స్పష్టమైన ఆకు ఫోటో తీయండి.",

        uploadTitle: "అప్‌లోడ్ లేదా క్యాప్చర్ చేయండి",
        plantType: "మొక్క రకం",
        plantName: "మొక్క / పంట",
        chooseImage: "స్పష్టమైన మొక్క చిత్రాన్ని ఎంచుకోండి",
        browse: "బ్రౌజ్ చేయడానికి క్లిక్ చేయండి • JPG / PNG / WEBP",

        useCamera: "📷 కెమెరాను ఉపయోగించండి",
        capture: "ఫోటో తీయండి",
        stop: "ఆపండి",

        previewText: "మీ చిత్రం ఇక్కడ కనిపిస్తుంది",
        analyze: "CropCare AIతో విశ్లేషించండి →",

        resultTitle: "మొక్క ఆరోగ్య నివేదిక",
        noResult: "ఇంకా విశ్లేషణ లేదు",
        noResultText: "మొక్క చిత్రాన్ని అప్‌లోడ్ చేయండి; నివేదిక ఇక్కడ కనిపిస్తుంది.",

        libraryTitle: "పొలాల పంటల నుండి ఇంటి మొక్కల వరకు.",
        libraryText: "ఈ కేటలాగ్ రైతులు, తోటమాలులు మరియు ఇంటి మొక్కల యజమానులకు ఉపయోగకరంగా ఉంటుంది.",
        searchPlant: "మొక్కను వెతకండి...",
        all: "అన్నీ",
        crops: "పంటలు",
        vegetables: "కూరగాయలు",
        fruits: "పండ్లు",
        outdoor: "బయటి",
        indoor: "ఇంటి",

        diseaseTitle: "పేరు మాత్రమే కాదు, సమస్యను అర్థం చేసుకోండి.",
        diseaseText: "ప్రతి వ్యాధి సమాచారంలో లక్షణాలు, సాధ్యమైన కారణాలు, నివారణ మరియు పునరుద్ధరణ మార్గదర్శకాలు ఉండవచ్చు.",

        symptoms: "లక్షణాలు",
        symptomsText: "ఆకులు, కాండాలు, పండ్లు లేదా నేలపై కనిపించే సంకేతాలు.",
        causes: "సాధ్యమైన కారణాలు",
        causesText: "పర్యావరణ ఒత్తిడి, వ్యాధికారకాలు, పురుగులు లేదా సంరక్షణకు సంబంధించిన కారణాలు.",
        recoveryPlan: "పునరుద్ధరణ ప్రణాళిక",
        recoveryPlanText: "స్పష్టమైన దశలలో సంరక్షణ మరియు తదుపరి తనిఖీలు.",
        prevention: "నివారణ",
        preventionText: "సమస్య మళ్లీ రావడాన్ని తగ్గించే ఆచరణాత్మక అలవాట్లు.",

        recoveryTitle: "మీ మొక్క కోలుకోవడానికి దశలవారీగా సహాయం చేయండి.",
        recoveryText: "గుర్తింపు తర్వాత CropCare AI సులభమైన పునరుద్ధరణ ప్రణాళికను చూపగలదు.",
        healthInsight: "ఆరోగ్య సమాచారం",
        recoveryGuide: "పునరుద్ధరణ మార్గదర్శకం",
        recoveryEmpty: "మొక్కకు ప్రత్యేక మార్గదర్శకం పొందడానికి చిత్రాన్ని విశ్లేషించండి.",
        checkAgain: "మళ్లీ తనిఖీ చేయండి →",

        assistantTitle: "ప్రశ్నలు అడగండి. సమాధానాలు వినండి.",
        assistantText: "సహాయకుడు ఫలితాన్ని సులభమైన భాషలో వివరించి, సమాధానాన్ని చదివి వినిపించగలడు.",
        assistantWelcome: "నమస్కారం! మొక్క లక్షణాలు, పునరుద్ధరణ, నీరు పోయడం, సూర్యకాంతి లేదా మీ తాజా AI ఫలితం గురించి అడగండి.",

        suggestRecovery: "🌱 కోలుకోవడానికి సహాయం",
        suggestSymptoms: "🔎 లక్షణాలు",
        suggestSunlight: "☀️ సూర్యకాంతి",

        assistantPlaceholder: "CropCare AIని అడగండి...",
        send: "పంపండి",
        voiceInput: "🎙 వాయిస్‌తో అడగండి",
        listen: "వినండి",
        stopAudio: "⏹ ఆడియో ఆపండి",

        accessibilityTitle: "అందుబాటులో ఉండేలా రూపొందించబడింది",
        accessibilityText: "చదవడం లేదా టైప్ చేయడం కష్టంగా ఉన్నవారికి పెద్ద నియంత్రణలు, వాయిస్ ఇన్‌పుట్ మరియు టెక్స్ట్-టు-స్పీచ్ ఉపయోగించవచ్చు.",
        accessibilityOne: "సపోర్ట్ ఉంటే మైక్రోఫోన్ నొక్కి మాట్లాడండి.",
        accessibilityTwo: "తాజా సూచనలను వినడానికి “వినండి” నొక్కండి.",
        accessibilityThree: "మాట్లాడే లేదా వినే ముందు భాషను మార్చండి.",

        footerText: "AI సహాయంతో మొక్కల ఆరోగ్య విద్య మరియు పునరుద్ధరణ మార్గదర్శకం.",
        footerWarning: "విద్యార్థి ఆవిష్కరణ ప్రాజెక్ట్ • తీవ్రమైన పంట వ్యాధిని అర్హత కలిగిన వ్యవసాయ నిపుణుడితో నిర్ధారించండి.",

        dark: "డార్క్",
        light: "లైట్",

        noImage: "ముందుగా మొక్క చిత్రాన్ని ఎంచుకోండి.",
        analyzing: "మీ మొక్కను విశ్లేషిస్తోంది...",
        saved: "ఫలితం విజయవంతంగా సేవ్ చేయబడింది.",
        error: "ఏదో తప్పు జరిగింది. మళ్లీ ప్రయత్నించండి.",
        cameraError: "కెమెరాను యాక్సెస్ చేయలేకపోయాము.",
        noCamera: "ఈ బ్రౌజర్‌లో కెమెరా మద్దతు లేదు.",

        selectPlant: "మొక్కను ఎంచుకోండి",
        plant: "మొక్క",
        disease: "వ్యాధి",
        confidence: "నమ్మక స్థాయి",
        saveResult: "ఫలితాన్ని సేవ్ చేయండి",
        recovery: "పునరుద్ధరణ",
        loading: "లోడ్ అవుతోంది...",
        generalPlantCare: "సాధారణ మొక్క సంరక్షణ మోడ్",
        noPlants: "మొక్కలు ఏవీ కనుగొనబడలేదు.",
        imageFileError: "దయచేసి ఇమేజ్ ఫైల్‌ను ఎంచుకోండి.",
        chatFailed: "చాట్ విఫలమైంది.",
        thinking: "ఆలోచిస్తోంది..."
    },


    /* =====================================================
       KANNADA
       ===================================================== */

    kn: {
        navDetect: "ಪರಿಶೀಲನೆ",
        navLibrary: "ಸಸ್ಯ ಗ್ರಂಥಾಲಯ",
        navRecovery: "ಚೇತರಿಕೆ",
        navAssistant: "AI ಸಹಾಯಕ",

        tryNow: "ಈಗ ಪ್ರಯತ್ನಿಸಿ →",

        heroTitle: "ಪ್ರತಿ ಸಸ್ಯವನ್ನು ಆರೈಕೆ ಮಾಡಲು ಇನ್ನಷ್ಟು ಸ್ಮಾರ್ಟ್ ಮಾರ್ಗ.",
        heroText: "ಎಲೆಯ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ಸಸ್ಯದ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ, ಸಾಧ್ಯವಾದ ರೋಗವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ ಮತ್ತು ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಸರಳ ಚೇತರಿಕೆ ಹಂತಗಳನ್ನು ಪಡೆಯಿರಿ.",
        checkPlant: "ನನ್ನ ಸಸ್ಯವನ್ನು ಪರಿಶೀಲಿಸಿ →",
        exploreLibrary: "ಸಸ್ಯ ಗ್ರಂಥಾಲಯ ನೋಡಿ",

        detectTitle: "CropCare AI ನಿಮ್ಮ ಸಸ್ಯವನ್ನು ಪರಿಶೀಲಿಸಲಿ.",
        detectText: "ಫೋಟೋ ಅಥವಾ ಕ್ಯಾಮೆರಾ ಬಳಸಿ. ಉತ್ತಮ ಫಲಿತಾಂಶಕ್ಕಾಗಿ ಉತ್ತಮ ಬೆಳಕಿನಲ್ಲಿ ಸ್ಪಷ್ಟವಾದ ಎಲೆಯ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ.",

        uploadTitle: "ಅಪ್‌ಲೋಡ್ ಅಥವಾ ಕ್ಯಾಪ್ಚರ್ ಮಾಡಿ",
        plantType: "ಸಸ್ಯದ ಪ್ರಕಾರ",
        plantName: "ಸಸ್ಯ / ಬೆಳೆ",
        chooseImage: "ಸ್ಪಷ್ಟವಾದ ಸಸ್ಯದ ಚಿತ್ರವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ",
        browse: "ಬ್ರೌಸ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ • JPG / PNG / WEBP",

        useCamera: "📷 ಕ್ಯಾಮೆರಾ ಬಳಸಿ",
        capture: "ಚಿತ್ರ ತೆಗೆಯಿರಿ",
        stop: "ನಿಲ್ಲಿಸಿ",

        previewText: "ನಿಮ್ಮ ಚಿತ್ರದ ಪೂರ್ವವೀಕ್ಷಣೆ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ",
        analyze: "CropCare AI ಮೂಲಕ ವಿಶ್ಲೇಷಿಸಿ →",

        resultTitle: "ಸಸ್ಯ ಆರೋಗ್ಯ ವರದಿ",
        noResult: "ಇನ್ನೂ ವಿಶ್ಲೇಷಣೆ ಇಲ್ಲ",
        noResultText: "ಸಸ್ಯದ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ವರದಿ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.",

        libraryTitle: "ಹೊಲದ ಬೆಳೆಗಳಿಂದ ಒಳಾಂಗಣ ಸಸ್ಯಗಳವರೆಗೆ.",
        libraryText: "ಈ ಪಟ್ಟಿಯು ರೈತರು, ತೋಟಗಾರರು ಮತ್ತು ಮನೆಯ ಸಸ್ಯ ಮಾಲೀಕರಿಗೆ ಉಪಯುಕ್ತವಾಗಿದೆ.",
        searchPlant: "ಸಸ್ಯ ಹುಡುಕಿ...",
        all: "ಎಲ್ಲಾ",
        crops: "ಬೆಳೆಗಳು",
        vegetables: "ತರಕಾರಿಗಳು",
        fruits: "ಹಣ್ಣುಗಳು",
        outdoor: "ಹೊರಾಂಗಣ",
        indoor: "ಒಳಾಂಗಣ",

        diseaseTitle: "ಹೆಸರನ್ನು ಮಾತ್ರವಲ್ಲ, ಸಮಸ್ಯೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.",
        diseaseText: "ಪ್ರತಿ ರೋಗದ ಮಾಹಿತಿಯಲ್ಲಿ ಲಕ್ಷಣಗಳು, ಸಾಧ್ಯ ಕಾರಣಗಳು, ತಡೆಗಟ್ಟುವಿಕೆ ಮತ್ತು ಚೇತರಿಕೆ ಮಾರ್ಗದರ್ಶನ ಇರಬಹುದು.",

        symptoms: "ಲಕ್ಷಣಗಳು",
        symptomsText: "ಎಲೆಗಳು, ಕಾಂಡಗಳು, ಹಣ್ಣುಗಳು ಅಥವಾ ಮಣ್ಣಿನಲ್ಲಿ ಕಾಣುವ ಲಕ್ಷಣಗಳು.",
        causes: "ಸಂಭಾವ್ಯ ಕಾರಣಗಳು",
        causesText: "ಪರಿಸರ ಒತ್ತಡ, ರೋಗಕಾರಕಗಳು, ಕೀಟಗಳು ಅಥವಾ ಆರೈಕೆಗೆ ಸಂಬಂಧಿಸಿದ ಕಾರಣಗಳು.",
        recoveryPlan: "ಚೇತರಿಕೆ ಯೋಜನೆ",
        recoveryPlanText: "ಸ್ಪಷ್ಟ ಹಂತಗಳಲ್ಲಿ ಆರೈಕೆ ಮತ್ತು ಮುಂದಿನ ಪರಿಶೀಲನೆಗಳು.",
        prevention: "ತಡೆಗಟ್ಟುವಿಕೆ",
        preventionText: "ಸಮಸ್ಯೆ ಮತ್ತೆ ಬರುವ ಸಾಧ್ಯತೆಯನ್ನು ಕಡಿಮೆ ಮಾಡುವ ಪ್ರಾಯೋಗಿಕ ಅಭ್ಯಾಸಗಳು.",

        recoveryTitle: "ನಿಮ್ಮ ಸಸ್ಯ ಚೇತರಿಸಿಕೊಳ್ಳಲು ಹಂತ ಹಂತವಾಗಿ ಸಹಾಯ ಮಾಡಿ.",
        recoveryText: "ಪರಿಶೀಲನೆಯ ನಂತರ CropCare AI ಸರಳ ಚೇತರಿಕೆ ಯೋಜನೆಯನ್ನು ತೋರಿಸಬಹುದು.",
        healthInsight: "ಆರೋಗ್ಯ ಮಾಹಿತಿ",
        recoveryGuide: "ಚೇತರಿಕೆ ಮಾರ್ಗದರ್ಶಿ",
        recoveryEmpty: "ಸಸ್ಯಕ್ಕೆ ನಿರ್ದಿಷ್ಟ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಲು ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಿ.",
        checkAgain: "ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ →",

        assistantTitle: "ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ. ಉತ್ತರಗಳನ್ನು ಕೇಳಿ.",
        assistantText: "ಸಹಾಯಕವು ಫಲಿತಾಂಶವನ್ನು ಸರಳ ಭಾಷೆಯಲ್ಲಿ ವಿವರಿಸಿ ಉತ್ತರವನ್ನು ಓದಿ ಕೇಳಿಸಬಹುದು.",
        assistantWelcome: "ನಮಸ್ಕಾರ! ಸಸ್ಯದ ಲಕ್ಷಣಗಳು, ಚೇತರಿಕೆ, ನೀರು ಹಾಕುವುದು, ಸೂರ್ಯನ ಬೆಳಕು ಅಥವಾ ನಿಮ್ಮ ಇತ್ತೀಚಿನ AI ಫಲಿತಾಂಶದ ಬಗ್ಗೆ ಕೇಳಿ.",

        suggestRecovery: "🌱 ಚೇತರಿಸಿಕೊಳ್ಳಲು ಸಹಾಯ",
        suggestSymptoms: "🔎 ಲಕ್ಷಣಗಳು",
        suggestSunlight: "☀️ ಸೂರ್ಯನ ಬೆಳಕು",

        assistantPlaceholder: "CropCare AI ಅನ್ನು ಕೇಳಿ...",
        send: "ಕಳುಹಿಸಿ",
        voiceInput: "🎙 ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ",
        listen: "ಕೇಳಿ",
        stopAudio: "⏹ ಆಡಿಯೋ ನಿಲ್ಲಿಸಿ",

        accessibilityTitle: "ಪ್ರವೇಶಸೌಲಭ್ಯಕ್ಕಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ",
        accessibilityText: "ಓದಲು ಅಥವಾ ಟೈಪ್ ಮಾಡಲು ಕಷ್ಟವಾಗುವ ಬಳಕೆದಾರರಿಗೆ ದೊಡ್ಡ ನಿಯಂತ್ರಣಗಳು, ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಮತ್ತು ಟೆಕ್ಸ್ಟ್-ಟು-ಸ್ಪೀಚ್ ಬಳಸಬಹುದು.",
        accessibilityOne: "ಬೆಂಬಲವಿದ್ದರೆ ಮೈಕ್ರೋಫೋನ್ ಒತ್ತಿ ಮಾತನಾಡಿ.",
        accessibilityTwo: "ಇತ್ತೀಚಿನ ಮಾರ್ಗದರ್ಶನ ಕೇಳಲು “ಕೇಳಿ” ಒತ್ತಿರಿ.",
        accessibilityThree: "ಮಾತನಾಡುವ ಅಥವಾ ಕೇಳುವ ಮೊದಲು ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸಿ.",

        footerText: "AI ಸಹಾಯದಿಂದ ಸಸ್ಯ ಆರೋಗ್ಯ ಶಿಕ್ಷಣ ಮತ್ತು ಚೇತರಿಕೆ ಮಾರ್ಗದರ್ಶನ.",
        footerWarning: "ವಿದ್ಯಾರ್ಥಿ ನವೀನತಾ ಯೋಜನೆ • ಗಂಭೀರ ಬೆಳೆ ರೋಗವನ್ನು ಅರ್ಹ ಕೃಷಿ ತಜ್ಞರಿಂದ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",

        dark: "ಡಾರ್ಕ್",
        light: "ಲೈಟ್",

        noImage: "ಮೊದಲು ಸಸ್ಯದ ಚಿತ್ರವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.",
        analyzing: "ನಿಮ್ಮ ಸಸ್ಯವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
        saved: "ಫಲಿತಾಂಶವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.",
        error: "ಏನೋ ತಪ್ಪಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        cameraError: "ಕ್ಯಾಮೆರಾವನ್ನು ಪ್ರವೇಶಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
        noCamera: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಕ್ಯಾಮೆರಾ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ.",

        selectPlant: "ಸಸ್ಯವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ",
        plant: "ಸಸ್ಯ",
        disease: "ರೋಗ",
        confidence: "ವಿಶ್ವಾಸ ಮಟ್ಟ",
        saveResult: "ಫಲಿತಾಂಶ ಉಳಿಸಿ",
        recovery: "ಚೇತರಿಕೆ",
        loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
        generalPlantCare: "ಸಾಮಾನ್ಯ ಸಸ್ಯ ಆರೈಕೆ ಮೋಡ್",
        noPlants: "ಯಾವುದೇ ಸಸ್ಯಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
        imageFileError: "ದಯವಿಟ್ಟು ಚಿತ್ರ ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಿ.",
        chatFailed: "ಚಾಟ್ ವಿಫಲವಾಗಿದೆ.",
        thinking: "ಯೋಚಿಸುತ್ತಿದೆ..."
    },


    /* =====================================================
       MALAYALAM
       ===================================================== */

    ml: {
        navDetect: "പരിശോധിക്കുക",
        navLibrary: "സസ്യ ലൈബ്രറി",
        navRecovery: "വീണ്ടെടുക്കൽ",
        navAssistant: "AI സഹായി",

        tryNow: "ഇപ്പോൾ ശ്രമിക്കുക →",

        heroTitle: "ഓരോ ചെടിയെയും പരിപാലിക്കാൻ കൂടുതൽ മികച്ച മാർഗം.",
        heroText: "ഇലയുടെ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക, ചെടിയുടെ തരം തിരഞ്ഞെടുക്കുക, സാധ്യതയുള്ള രോഗം മനസ്സിലാക്കുക, നിങ്ങളുടെ ഭാഷയിൽ ലളിതമായ വീണ്ടെടുക്കൽ ഘട്ടങ്ങൾ നേടുക.",
        checkPlant: "എന്റെ ചെടി പരിശോധിക്കുക →",
        exploreLibrary: "സസ്യ ലൈബ്രറി കാണുക",

        detectTitle: "CropCare AI നിങ്ങളുടെ ചെടി പരിശോധിക്കട്ടെ.",
        detectText: "ഫോട്ടോയോ ക്യാമറയോ ഉപയോഗിക്കുക. മികച്ച ഫലത്തിനായി നല്ല വെളിച്ചത്തിൽ വ്യക്തമായ ഇലയുടെ ചിത്രം എടുക്കുക.",

        uploadTitle: "അപ്‌ലോഡ് അല്ലെങ്കിൽ ക്യാമറ ഉപയോഗിക്കുക",
        plantType: "ചെടിയുടെ തരം",
        plantName: "ചെടി / വിള",
        chooseImage: "വ്യക്തമായ ചെടിയുടെ ചിത്രം തിരഞ്ഞെടുക്കുക",
        browse: "ബ്രൗസ് ചെയ്യാൻ ക്ലിക്ക് ചെയ്യുക • JPG / PNG / WEBP",

        useCamera: "📷 ക്യാമറ ഉപയോഗിക്കുക",
        capture: "ചിത്രം എടുക്കുക",
        stop: "നിർത്തുക",

        previewText: "നിങ്ങളുടെ ചിത്രത്തിന്റെ പ്രിവ്യൂ ഇവിടെ കാണാം",
        analyze: "CropCare AI ഉപയോഗിച്ച് വിശകലനം ചെയ്യുക →",

        resultTitle: "ചെടിയുടെ ആരോഗ്യ റിപ്പോർട്ട്",
        noResult: "ഇതുവരെ വിശകലനം ഇല്ല",
        noResultText: "ചെടിയുടെ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക; റിപ്പോർട്ട് ഇവിടെ കാണാം.",

        libraryTitle: "കൃഷിയിടത്തിലെ വിളകളിൽ നിന്ന് വീട്ടിലെ ചെടികൾ വരെ.",
        libraryText: "കർഷകർ, തോട്ടക്കാർ, വീട്ടിലെ ചെടികളുടെ ഉടമകൾ എന്നിവർക്കെല്ലാം ഈ പട്ടിക പ്രയോജനപ്പെടും.",
        searchPlant: "ചെടി തിരയുക...",
        all: "എല്ലാം",
        crops: "വിളകൾ",
        vegetables: "പച്ചക്കറികൾ",
        fruits: "പഴങ്ങൾ",
        outdoor: "പുറത്ത്",
        indoor: "അകത്ത്",

        diseaseTitle: "പേര് മാത്രം അല്ല, പ്രശ്നവും മനസ്സിലാക്കുക.",
        diseaseText: "ഓരോ രോഗ വിവരത്തിലും ലക്ഷണങ്ങൾ, സാധ്യതയുള്ള കാരണങ്ങൾ, പ്രതിരോധം, വീണ്ടെടുക്കൽ മാർഗനിർദ്ദേശം എന്നിവ ഉണ്ടാകാം.",

        symptoms: "ലക്ഷണങ്ങൾ",
        symptomsText: "ഇലകൾ, തണ്ടുകൾ, പഴങ്ങൾ അല്ലെങ്കിൽ മണ്ണിൽ കാണുന്ന ലക്ഷണങ്ങൾ.",
        causes: "സാധ്യതയുള്ള കാരണങ്ങൾ",
        causesText: "പരിസ്ഥിതി സമ്മർദ്ദം, രോഗാണുക്കൾ, കീടങ്ങൾ അല്ലെങ്കിൽ പരിപാലന കാരണങ്ങൾ.",
        recoveryPlan: "വീണ്ടെടുക്കൽ പദ്ധതി",
        recoveryPlanText: "വ്യക്തമായ ഘട്ടങ്ങളിലുള്ള പരിചരണവും തുടർ പരിശോധനകളും.",
        prevention: "പ്രതിരോധം",
        preventionText: "പ്രശ്നങ്ങൾ വീണ്ടും ഉണ്ടാകാനുള്ള സാധ്യത കുറയ്ക്കുന്ന ശീലങ്ങൾ.",

        recoveryTitle: "നിങ്ങളുടെ ചെടി ഘട്ടംഘട്ടമായി വീണ്ടെടുക്കാൻ സഹായിക്കുക.",
        recoveryText: "പരിശോധനയ്ക്ക് ശേഷം CropCare AI ലളിതമായ വീണ്ടെടുക്കൽ പദ്ധതി കാണിക്കും.",
        healthInsight: "ആരോഗ്യ വിവരം",
        recoveryGuide: "വീണ്ടെടുക്കൽ മാർഗനിർദ്ദേശം",
        recoveryEmpty: "ചെടിക്ക് പ്രത്യേക മാർഗനിർദ്ദേശം ലഭിക്കാൻ ചിത്രം വിശകലനം ചെയ്യുക.",
        checkAgain: "വീണ്ടും പരിശോധിക്കുക →",

        assistantTitle: "ചോദ്യങ്ങൾ ചോദിക്കുക. ഉത്തരങ്ങൾ കേൾക്കുക.",
        assistantText: "സഹായി ഫലം ലളിതമായ ഭാഷയിൽ വിശദീകരിക്കുകയും ഉത്തരം ശബ്ദമായി വായിക്കുകയും ചെയ്യും.",
        assistantWelcome: "നമസ്കാരം! ചെടിയുടെ ലക്ഷണങ്ങൾ, വീണ്ടെടുക്കൽ, വെള്ളം നൽകൽ, സൂര്യപ്രകാശം അല്ലെങ്കിൽ നിങ്ങളുടെ ഏറ്റവും പുതിയ AI ഫലത്തെക്കുറിച്ച് ചോദിക്കുക.",

        suggestRecovery: "🌱 വീണ്ടെടുക്കാൻ സഹായിക്കുക",
        suggestSymptoms: "🔎 ലക്ഷണങ്ങൾ",
        suggestSunlight: "☀️ സൂര്യപ്രകാശം",

        assistantPlaceholder: "CropCare AI-യോട് ചോദിക്കുക...",
        send: "അയയ്ക്കുക",
        voiceInput: "🎙 ശബ്ദത്തിൽ ചോദിക്കുക",
        listen: "കേൾക്കുക",
        stopAudio: "⏹ ഓഡിയോ നിർത്തുക",

        accessibilityTitle: "പ്രവേശന സൗകര്യത്തിനായി രൂപകൽപ്പന ചെയ്തത്",
        accessibilityText: "വായിക്കാനോ ടൈപ്പ് ചെയ്യാനോ ബുദ്ധിമുട്ടുള്ളവർക്ക് വലിയ നിയന്ത്രണങ്ങൾ, ശബ്ദ ഇൻപുട്ട്, ടെക്സ്റ്റ്-ടു-സ്പീച്ച് എന്നിവ ഉപയോഗിക്കാം.",
        accessibilityOne: "പിന്തുണയുണ്ടെങ്കിൽ മൈക്രോഫോൺ അമർത്തി സംസാരിക്കുക.",
        accessibilityTwo: "ഏറ്റവും പുതിയ നിർദ്ദേശങ്ങൾ കേൾക്കാൻ “കേൾക്കുക” അമർത്തുക.",
        accessibilityThree: "സംസാരിക്കുന്നതിനോ കേൾക്കുന്നതിനോ മുമ്പ് ഭാഷ മാറ്റുക.",

        footerText: "AI സഹായത്തോടെ സസ്യ ആരോഗ്യ വിദ്യാഭ്യാസവും വീണ്ടെടുക്കൽ മാർഗനിർദ്ദേശവും.",
        footerWarning: "വിദ്യാർത്ഥി നവീകരണ പദ്ധതി • ഗുരുതരമായ വിള രോഗം യോഗ്യനായ കാർഷിക വിദഗ്ധനോട് സ്ഥിരീകരിക്കുക.",

        dark: "ഡാർക്ക്",
        light: "ലൈറ്റ്",

        noImage: "ആദ്യം ഒരു ചെടിയുടെ ചിത്രം തിരഞ്ഞെടുക്കുക.",
        analyzing: "നിങ്ങളുടെ ചെടി വിശകലനം ചെയ്യുന്നു...",
        saved: "ഫലം വിജയകരമായി സംരക്ഷിച്ചു.",
        error: "എന്തോ തെറ്റായി. വീണ്ടും ശ്രമിക്കുക.",
        cameraError: "ക്യാമറ ആക്‌സസ് ചെയ്യാൻ കഴിഞ്ഞില്ല.",
        noCamera: "ഈ ബ്രൗസറിൽ ക്യാമറ പിന്തുണയ്ക്കുന്നില്ല.",

        selectPlant: "ചെടി തിരഞ്ഞെടുക്കുക",
        plant: "ചെടി",
        disease: "രോഗം",
        confidence: "വിശ്വാസ നില",
        saveResult: "ഫലം സംരക്ഷിക്കുക",
        recovery: "വീണ്ടെടുക്കൽ",
        loading: "ലോഡ് ചെയ്യുന്നു...",
        generalPlantCare: "സാധാരണ ചെടി പരിപാലന മോഡ്",
        noPlants: "ചെടികളൊന്നും കണ്ടെത്തിയില്ല.",
        imageFileError: "ദയവായി ഒരു ചിത്രം തിരഞ്ഞെടുക്കുക.",
        chatFailed: "ചാറ്റ് പരാജയപ്പെട്ടു.",
        thinking: "ചിന്തിക്കുന്നു..."
    },


    /* =====================================================
       PUNJABI
       ===================================================== */

    pa: {
        navDetect: "ਜਾਂਚ",
        navLibrary: "ਪੌਦਿਆਂ ਦੀ ਲਾਇਬ੍ਰੇਰੀ",
        navRecovery: "ਸੁਧਾਰ",
        navAssistant: "AI ਸਹਾਇਕ",

        tryNow: "ਹੁਣੇ ਜਾਂਚੋ →",

        heroTitle: "ਹਰ ਪੌਦੇ ਦੀ ਦੇਖਭਾਲ ਕਰਨ ਦਾ ਹੋਰ ਸਮਾਰਟ ਤਰੀਕਾ।",
        heroText: "ਪੱਤੇ ਦੀ ਤਸਵੀਰ ਅੱਪਲੋਡ ਕਰੋ, ਪੌਦੇ ਦੀ ਕਿਸਮ ਚੁਣੋ, ਸੰਭਾਵਿਤ ਬਿਮਾਰੀ ਨੂੰ ਸਮਝੋ ਅਤੇ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਆਸਾਨ ਸੁਧਾਰ ਦੇ ਕਦਮ ਪ੍ਰਾਪਤ ਕਰੋ।",
        checkPlant: "ਮੇਰੇ ਪੌਦੇ ਦੀ ਜਾਂਚ ਕਰੋ →",
        exploreLibrary: "ਪੌਦਿਆਂ ਦੀ ਲਾਇਬ੍ਰੇਰੀ ਵੇਖੋ",

        detectTitle: "CropCare AI ਨੂੰ ਆਪਣੇ ਪੌਦੇ ਦੀ ਜਾਂਚ ਕਰਨ ਦਿਓ।",
        detectText: "ਤਸਵੀਰ ਜਾਂ ਕੈਮਰਾ ਵਰਤੋ। ਵਧੀਆ ਨਤੀਜੇ ਲਈ ਚੰਗੀ ਰੌਸ਼ਨੀ ਵਿੱਚ ਸਾਫ਼ ਪੱਤੇ ਦੀ ਤਸਵੀਰ ਲਓ।",

        uploadTitle: "ਅੱਪਲੋਡ ਜਾਂ ਕੈਪਚਰ ਕਰੋ",
        plantType: "ਪੌਦੇ ਦੀ ਕਿਸਮ",
        plantName: "ਪੌਦਾ / ਫਸਲ",
        chooseImage: "ਪੌਦੇ ਦੀ ਸਾਫ਼ ਤਸਵੀਰ ਚੁਣੋ",
        browse: "ਬ੍ਰਾਊਜ਼ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ • JPG / PNG / WEBP",

        useCamera: "📷 ਕੈਮਰਾ ਵਰਤੋ",
        capture: "ਤਸਵੀਰ ਲਓ",
        stop: "ਰੋਕੋ",

        previewText: "ਤੁਹਾਡੀ ਤਸਵੀਰ ਇੱਥੇ ਦਿਖਾਈ ਦੇਵੇਗੀ",
        analyze: "CropCare AI ਨਾਲ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ →",

        resultTitle: "ਪੌਦੇ ਦੀ ਸਿਹਤ ਰਿਪੋਰਟ",
        noResult: "ਹਾਲੇ ਕੋਈ ਵਿਸ਼ਲੇਸ਼ਣ ਨਹੀਂ",
        noResultText: "ਪੌਦੇ ਦੀ ਤਸਵੀਰ ਅੱਪਲੋਡ ਕਰੋ ਅਤੇ ਰਿਪੋਰਟ ਇੱਥੇ ਦਿਖਾਈ ਦੇਵੇਗੀ।",

        libraryTitle: "ਖੇਤਾਂ ਦੀਆਂ ਫਸਲਾਂ ਤੋਂ ਘਰੇਲੂ ਪੌਦਿਆਂ ਤੱਕ।",
        libraryText: "ਇਹ ਕੈਟਾਲਾਗ ਕਿਸਾਨਾਂ, ਬਾਗਬਾਨਾਂ ਅਤੇ ਘਰੇਲੂ ਪੌਦਿਆਂ ਦੇ ਮਾਲਕਾਂ ਲਈ ਲਾਭਦਾਇਕ ਹੈ।",
        searchPlant: "ਪੌਦਾ ਖੋਜੋ...",
        all: "ਸਾਰੇ",
        crops: "ਫਸਲਾਂ",
        vegetables: "ਸਬਜ਼ੀਆਂ",
        fruits: "ਫਲ",
        outdoor: "ਬਾਹਰੀ",
        indoor: "ਅੰਦਰੂਨੀ",

        diseaseTitle: "ਸਿਰਫ਼ ਨਾਮ ਨਹੀਂ, ਸਮੱਸਿਆ ਨੂੰ ਸਮਝੋ।",
        diseaseText: "ਹਰ ਬਿਮਾਰੀ ਦੀ ਜਾਣਕਾਰੀ ਵਿੱਚ ਲੱਛਣ, ਸੰਭਾਵਿਤ ਕਾਰਨ, ਰੋਕਥਾਮ ਅਤੇ ਸੁਧਾਰ ਲਈ ਮਾਰਗਦਰਸ਼ਨ ਹੋ ਸਕਦਾ ਹੈ।",

        symptoms: "ਲੱਛਣ",
        symptomsText: "ਪੱਤਿਆਂ, ਤਣਿਆਂ, ਫਲਾਂ ਜਾਂ ਮਿੱਟੀ ਉੱਤੇ ਦਿਖਾਈ ਦੇਣ ਵਾਲੇ ਸੰਕੇਤ।",
        causes: "ਸੰਭਾਵਿਤ ਕਾਰਨ",
        causesText: "ਵਾਤਾਵਰਣਕ ਤਣਾਅ, ਰੋਗਾਣੂ, ਕੀੜੇ ਜਾਂ ਦੇਖਭਾਲ ਨਾਲ ਜੁੜੇ ਕਾਰਨ।",
        recoveryPlan: "ਸੁਧਾਰ ਯੋਜਨਾ",
        recoveryPlanText: "ਸਪਸ਼ਟ ਕਦਮਾਂ ਵਿੱਚ ਦੇਖਭਾਲ ਅਤੇ ਅਗਲੀ ਜਾਂਚ।",
        prevention: "ਰੋਕਥਾਮ",
        preventionText: "ਸਮੱਸਿਆ ਦੁਬਾਰਾ ਹੋਣ ਦੀ ਸੰਭਾਵਨਾ ਘਟਾਉਣ ਵਾਲੀਆਂ ਆਦਤਾਂ।",

        recoveryTitle: "ਆਪਣੇ ਪੌਦੇ ਨੂੰ ਕਦਮ-ਦਰ-ਕਦਮ ਠੀਕ ਹੋਣ ਵਿੱਚ ਮਦਦ ਕਰੋ।",
        recoveryText: "ਜਾਂਚ ਤੋਂ ਬਾਅਦ CropCare AI ਇੱਕ ਸਧਾਰਨ ਸੁਧਾਰ ਯੋਜਨਾ ਦਿਖਾ ਸਕਦਾ ਹੈ।",
        healthInsight: "ਸਿਹਤ ਜਾਣਕਾਰੀ",
        recoveryGuide: "ਸੁਧਾਰ ਮਾਰਗਦਰਸ਼ਨ",
        recoveryEmpty: "ਪੌਦੇ ਲਈ ਖਾਸ ਮਾਰਗਦਰਸ਼ਨ ਲੈਣ ਲਈ ਤਸਵੀਰ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ।",
        checkAgain: "ਦੁਬਾਰਾ ਜਾਂਚੋ →",

        assistantTitle: "ਸਵਾਲ ਪੁੱਛੋ। ਜਵਾਬ ਸੁਣੋ।",
        assistantText: "ਸਹਾਇਕ ਨਤੀਜੇ ਨੂੰ ਸੌਖੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਮਝਾ ਸਕਦਾ ਹੈ ਅਤੇ ਜਵਾਬ ਪੜ੍ਹ ਕੇ ਸੁਣਾ ਸਕਦਾ ਹੈ।",
        assistantWelcome: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਪੌਦੇ ਦੇ ਲੱਛਣਾਂ, ਸੁਧਾਰ, ਪਾਣੀ, ਧੁੱਪ ਜਾਂ ਆਪਣੇ ਨਵੇਂ AI ਨਤੀਜੇ ਬਾਰੇ ਪੁੱਛੋ।",

        suggestRecovery: "🌱 ਇਸਨੂੰ ਠੀਕ ਹੋਣ ਵਿੱਚ ਮਦਦ ਕਰੋ",
        suggestSymptoms: "🔎 ਲੱਛਣ",
        suggestSunlight: "☀️ ਧੁੱਪ",

        assistantPlaceholder: "CropCare AI ਨੂੰ ਪੁੱਛੋ...",
        send: "ਭੇਜੋ",
        voiceInput: "🎙 ਆਵਾਜ਼ ਨਾਲ ਪੁੱਛੋ",
        listen: "ਸੁਣੋ",
        stopAudio: "⏹ ਆਡੀਓ ਰੋਕੋ",

        accessibilityTitle: "ਪਹੁੰਚਯੋਗਤਾ ਲਈ ਬਣਾਇਆ ਗਿਆ",
        accessibilityText: "ਜਿਨ੍ਹਾਂ ਲੋਕਾਂ ਨੂੰ ਪੜ੍ਹਨ ਜਾਂ ਟਾਈਪ ਕਰਨ ਵਿੱਚ ਮੁਸ਼ਕਲ ਹੁੰਦੀ ਹੈ, ਉਹ ਵੱਡੇ ਕੰਟਰੋਲ, ਵੌਇਸ ਇਨਪੁੱਟ ਅਤੇ ਟੈਕਸਟ-ਟੂ-ਸਪੀਚ ਵਰਤ ਸਕਦੇ ਹਨ।",
        accessibilityOne: "ਸਹਾਇਤਾ ਹੋਣ 'ਤੇ ਮਾਈਕ੍ਰੋਫੋਨ ਦਬਾ ਕੇ ਬੋਲੋ।",
        accessibilityTwo: "ਤਾਜ਼ਾ ਮਾਰਗਦਰਸ਼ਨ ਸੁਣਨ ਲਈ “ਸੁਣੋ” ਦਬਾਓ।",
        accessibilityThree: "ਬੋਲਣ ਜਾਂ ਸੁਣਨ ਤੋਂ ਪਹਿਲਾਂ ਭਾਸ਼ਾ ਬਦਲੋ।",

        footerText: "AI ਦੀ ਮਦਦ ਨਾਲ ਪੌਦਿਆਂ ਦੀ ਸਿਹਤ ਸਿੱਖਿਆ ਅਤੇ ਸੁਧਾਰ ਮਾਰਗਦਰਸ਼ਨ।",
        footerWarning: "ਵਿਦਿਆਰਥੀ ਨਵੀਨਤਾ ਪ੍ਰੋਜੈਕਟ • ਗੰਭੀਰ ਫਸਲ ਦੀ ਬਿਮਾਰੀ ਦੀ ਪੁਸ਼ਟੀ ਯੋਗ ਖੇਤੀਬਾੜੀ ਮਾਹਿਰ ਤੋਂ ਕਰਵਾਓ।",

        dark: "ਡਾਰਕ",
        light: "ਲਾਈਟ",

        noImage: "ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂ ਪੌਦੇ ਦੀ ਤਸਵੀਰ ਚੁਣੋ।",
        analyzing: "ਤੁਹਾਡੇ ਪੌਦੇ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ...",
        saved: "ਨਤੀਜਾ ਸਫਲਤਾਪੂਰਵਕ ਸੇਵ ਹੋ ਗਿਆ।",
        error: "ਕੁਝ ਗਲਤ ਹੋਇਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
        cameraError: "ਕੈਮਰੇ ਤੱਕ ਪਹੁੰਚ ਨਹੀਂ ਹੋ ਸਕੀ।",
        noCamera: "ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਕੈਮਰਾ ਸਮਰਥਿਤ ਨਹੀਂ ਹੈ।",

        selectPlant: "ਪੌਦਾ ਚੁਣੋ",
        plant: "ਪੌਦਾ",
        disease: "ਬਿਮਾਰੀ",
        confidence: "ਭਰੋਸੇ ਦਾ ਪੱਧਰ",
        saveResult: "ਨਤੀਜਾ ਸੇਵ ਕਰੋ",
        recovery: "ਸੁਧਾਰ",
        loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
        generalPlantCare: "ਆਮ ਪੌਦਾ ਦੇਖਭਾਲ ਮੋਡ",
        noPlants: "ਕੋਈ ਪੌਦਾ ਨਹੀਂ ਮਿਲਿਆ।",
        imageFileError: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਤਸਵੀਰ ਫਾਈਲ ਚੁਣੋ।",
        chatFailed: "ਚੈਟ ਅਸਫਲ ਹੋਈ।",
        thinking: "ਸੋਚ ਰਿਹਾ ਹੈ..."
    }
};


/* =========================================================
   SAFETY FALLBACK
   ========================================================= */

for (const code of Object.keys(LANGS)) {
    if (!translations[code]) {
        translations[code] = {};
    }
}


/* =========================================================
   LOCALIZED PLANT NAMES
   ========================================================= */

const localizedPlantNames = {
    en: {
        Rice: "Rice", Wheat: "Wheat", Maize: "Maize", Cotton: "Cotton", Sugarcane: "Sugarcane", Bean: "Bean", Pea: "Pea", Lentil: "Lentil", Chickpea: "Chickpea", Tomato: "Tomato", Potato: "Potato", Pepper: "Pepper", Corn: "Corn", Cucumber: "Cucumber", Apple: "Apple", Grape: "Grape", Mango: "Mango", Orange: "Orange", Strawberry: "Strawberry", Rose: "Rose", Marigold: "Marigold", Hibiscus: "Hibiscus", Jasmine: "Jasmine", "Money Plant": "Money Plant", "Snake Plant": "Snake Plant", "Aloe Vera": "Aloe Vera", "Peace Lily": "Peace Lily"
    },
    hi: { Rice:"चावल", Wheat:"गेहूं", Maize:"मक्का", Cotton:"कपास", Sugarcane:"गन्ना", Bean:"सेम", Pea:"मटर", Lentil:"मसूर", Chickpea:"चना", Tomato:"टमाटर", Potato:"आलू", Pepper:"मिर्च", Corn:"मक्का", Cucumber:"खीरा", Apple:"सेब", Grape:"अंगूर", Mango:"आम", Orange:"संतरा", Strawberry:"स्ट्रॉबेरी", Rose:"गुलाब", Marigold:"गेंदा", Hibiscus:"गुड़हल", Jasmine:"चमेली", "Money Plant":"मनी प्लांट", "Snake Plant":"स्नेक प्लांट", "Aloe Vera":"एलोवेरा", "Peace Lily":"पीस लिली" },
    mr: { Rice:"तांदूळ", Wheat:"गहू", Maize:"मका", Cotton:"कापूस", Sugarcane:"ऊस", Bean:"शेंग", Pea:"वाटाणा", Lentil:"मसूर", Chickpea:"हरभरा", Tomato:"टोमॅटो", Potato:"बटाटा", Pepper:"मिरची", Corn:"मका", Cucumber:"काकडी", Apple:"सफरचंद", Grape:"द्राक्ष", Mango:"आंबा", Orange:"संत्रे", Strawberry:"स्ट्रॉबेरी", Rose:"गुलाब", Marigold:"झेंडू", Hibiscus:"जास्वंद", Jasmine:"मोगरा", "Money Plant":"मनी प्लांट", "Snake Plant":"स्नेक प्लांट", "Aloe Vera":"कोरफड", "Peace Lily":"पीस लिली" },
    gu: { Rice:"ચોખા", Wheat:"ઘઉં", Maize:"મકાઈ", Cotton:"કપાસ", Sugarcane:"શેરડી", Bean:"બીન", Pea:"વટાણા", Lentil:"મસૂર", Chickpea:"ચણા", Tomato:"ટામેટા", Potato:"બટાકા", Pepper:"મરચું", Corn:"મકાઈ", Cucumber:"કાકડી", Apple:"સફરજન", Grape:"દ્રાક્ષ", Mango:"કેરી", Orange:"નારંગી", Strawberry:"સ્ટ્રોબેરી", Rose:"ગુલાબ", Marigold:"ગલગોટો", Hibiscus:"જાસૂદ", Jasmine:"મોગરો", "Money Plant":"મની પ્લાન્ટ", "Snake Plant":"સ્નેક પ્લાન્ટ", "Aloe Vera":"કુંવારપાઠું", "Peace Lily":"પીસ લિલી" },
    bn: { Rice:"চাল", Wheat:"গম", Maize:"ভুট্টা", Cotton:"তুলা", Sugarcane:"আখ", Bean:"শিম", Pea:"মটরশুঁটি", Lentil:"মসুর ডাল", Chickpea:"ছোলা", Tomato:"টমেটো", Potato:"আলু", Pepper:"লঙ্কা", Corn:"ভুট্টা", Cucumber:"শসা", Apple:"আপেল", Grape:"আঙুর", Mango:"আম", Orange:"কমলা", Strawberry:"স্ট্রবেরি", Rose:"গোলাপ", Marigold:"গাঁদা", Hibiscus:"জবা", Jasmine:"জুঁই", "Money Plant":"মানি প্ল্যান্ট", "Snake Plant":"স্নেক প্ল্যান্ট", "Aloe Vera":"অ্যালোভেরা", "Peace Lily":"পিস লিলি" },
    ta: { Rice:"அரிசி", Wheat:"கோதுமை", Maize:"மக்காச்சோளம்", Cotton:"பருத்தி", Sugarcane:"கரும்பு", Bean:"பீன்ஸ்", Pea:"பட்டாணி", Lentil:"பருப்பு", Chickpea:"கொண்டைக்கடலை", Tomato:"தக்காளி", Potato:"உருளைக்கிழங்கு", Pepper:"மிளகாய்", Corn:"சோளம்", Cucumber:"வெள்ளரிக்காய்", Apple:"ஆப்பிள்", Grape:"திராட்சை", Mango:"மாம்பழம்", Orange:"ஆரஞ்சு", Strawberry:"ஸ்ட்ராபெர்ரி", Rose:"ரோஜா", Marigold:"சாமந்தி", Hibiscus:"செம்பருத்தி", Jasmine:"மல்லிகை", "Money Plant":"மணி பிளாண்ட்", "Snake Plant":"ஸ்நேக் பிளாண்ட்", "Aloe Vera":"கற்றாழை", "Peace Lily":"பீஸ் லில்லி" },
    te: { Rice:"బియ్యం", Wheat:"గోధుమ", Maize:"మొక్కజొన్న", Cotton:"పత్తి", Sugarcane:"చెరకు", Bean:"బీన్స్", Pea:"బఠానీ", Lentil:"పప్పు", Chickpea:"శనగ", Tomato:"టమాటా", Potato:"బంగాళాదుంప", Pepper:"మిరపకాయ", Corn:"మొక్కజొన్న", Cucumber:"దోసకాయ", Apple:"ఆపిల్", Grape:"ద్రాక్ష", Mango:"మామిడి", Orange:"నారింజ", Strawberry:"స్ట్రాబెర్రీ", Rose:"గులాబీ", Marigold:"బంతి పువ్వు", Hibiscus:"మందారం", Jasmine:"మల్లె", "Money Plant":"మనీ ప్లాంట్", "Snake Plant":"స్నేక్ ప్లాంట్", "Aloe Vera":"కలబంద", "Peace Lily":"పీస్ లిల్లీ" },
    kn: { Rice:"ಅಕ್ಕಿ", Wheat:"ಗೋಧಿ", Maize:"ಮೆಕ್ಕೆಜೋಳ", Cotton:"ಹತ್ತಿ", Sugarcane:"ಕಬ್ಬು", Bean:"ಬೀನ್ಸ್", Pea:"ಬಟಾಣಿ", Lentil:"ಮಸೂರ", Chickpea:"ಕಡಲೆ", Tomato:"ಟೊಮ್ಯಾಟೊ", Potato:"ಆಲೂಗಡ್ಡೆ", Pepper:"ಮೆಣಸಿನಕಾಯಿ", Corn:"ಮೆಕ್ಕೆಜೋಳ", Cucumber:"ಸೌತೆಕಾಯಿ", Apple:"ಸೇಬು", Grape:"ದ್ರಾಕ್ಷಿ", Mango:"ಮಾವು", Orange:"ಕಿತ್ತಳೆ", Strawberry:"ಸ್ಟ್ರಾಬೆರಿ", Rose:"ಗುಲಾಬಿ", Marigold:"ಚೆಂಡು ಹೂವು", Hibiscus:"ದಾಸವಾಳ", Jasmine:"ಮಲ್ಲಿಗೆ", "Money Plant":"ಮನಿ ಪ್ಲಾಂಟ್", "Snake Plant":"ಸ್ನೇಕ್ ಪ್ಲಾಂಟ್", "Aloe Vera":"ಲೋಳೆಸರ", "Peace Lily":"ಪೀಸ್ ಲಿಲಿ" },
    ml: { Rice:"അരി", Wheat:"ഗോതമ്പ്", Maize:"ചോളം", Cotton:"പരുത്തി", Sugarcane:"കരിമ്പ്", Bean:"പയർ", Pea:"പട്ടാണി", Lentil:"പരിപ്പ്", Chickpea:"കടല", Tomato:"തക്കാളി", Potato:"ഉരുളക്കിഴങ്ങ്", Pepper:"മുളക്", Corn:"ചോളം", Cucumber:"വെള്ളരി", Apple:"ആപ്പിൾ", Grape:"മുന്തിരി", Mango:"മാങ്ങ", Orange:"ഓറഞ്ച്", Strawberry:"സ്ട്രോബെറി", Rose:"റോസ്", Marigold:"ചെണ്ടുമല്ലി", Hibiscus:"ചെമ്പരത്തി", Jasmine:"മുല്ല", "Money Plant":"മണി പ്ലാന്റ്", "Snake Plant":"സ്നേക്ക് പ്ലാന്റ്", "Aloe Vera":"കറ്റാർവാഴ", "Peace Lily":"പീസ് ലില്ലി" },
    pa: { Rice:"ਚੌਲ", Wheat:"ਕਣਕ", Maize:"ਮੱਕੀ", Cotton:"ਕਪਾਹ", Sugarcane:"ਗੰਨਾ", Bean:"ਫਲੀਆਂ", Pea:"ਮਟਰ", Lentil:"ਮਸੂਰ", Chickpea:"ਛੋਲੇ", Tomato:"ਟਮਾਟਰ", Potato:"ਆਲੂ", Pepper:"ਮਿਰਚ", Corn:"ਮੱਕੀ", Cucumber:"ਖੀਰਾ", Apple:"ਸੇਬ", Grape:"ਅੰਗੂਰ", Mango:"ਅੰਬ", Orange:"ਸੰਤਰਾ", Strawberry:"ਸਟ੍ਰਾਬੇਰੀ", Rose:"ਗੁਲਾਬ", Marigold:"ਗੇਂਦਾ", Hibiscus:"ਗੁੜਹਲ", Jasmine:"ਚਮੇਲੀ", "Money Plant":"ਮਨੀ ਪਲਾਂਟ", "Snake Plant":"ਸਨੇਕ ਪਲਾਂਟ", "Aloe Vera":"ਐਲੋਵੇਰਾ", "Peace Lily":"ਪੀਸ ਲਿਲੀ" }
};

function localizePlantName(name) {
    return localizedPlantNames[currentLanguage]?.[name] || name || "";
}



/* =========================================================
   PEST DETECTION LABELS
   Kept separate so the existing 10-language translations stay untouched.
   ========================================================= */

const pestLabels = {
    en: { pest: "Pest infestation", noPest: "No significant pest detected", pestConfidence: "Pest confidence", detectedPests: "Detected pests" },
    hi: { pest: "कीट संक्रमण", noPest: "कोई महत्वपूर्ण कीट नहीं मिला", pestConfidence: "कीट विश्वास स्तर", detectedPests: "पाए गए कीट" },
    mr: { pest: "कीड प्रादुर्भाव", noPest: "महत्त्वपूर्ण कीड आढळला नाही", pestConfidence: "कीड विश्वास पातळी", detectedPests: "आढळलेल्या किडी" },
    gu: { pest: "જીવાતનો ઉપદ્રવ", noPest: "નોંધપાત્ર જીવાત મળી નથી", pestConfidence: "જીવાત વિશ્વાસ સ્તર", detectedPests: "મળેલી જીવાતો" },
    bn: { pest: "কীটপতঙ্গের আক্রমণ", noPest: "উল্লেখযোগ্য কীটপতঙ্গ শনাক্ত হয়নি", pestConfidence: "কীটপতঙ্গ শনাক্তকরণ বিশ্বাসমাত্রা", detectedPests: "শনাক্ত কীটপতঙ্গ" },
    ta: { pest: "பூச்சி தாக்குதல்", noPest: "குறிப்பிடத்தக்க பூச்சி கண்டறியப்படவில்லை", pestConfidence: "பூச்சி நம்பிக்கை நிலை", detectedPests: "கண்டறியப்பட்ட பூச்சிகள்" },
    te: { pest: "పురుగు సోకడం", noPest: "గణనీయమైన పురుగు గుర్తించబడలేదు", pestConfidence: "పురుగు నమ్మక స్థాయి", detectedPests: "గుర్తించిన పురుగులు" },
    kn: { pest: "ಕೀಟ ಹಾವಳಿ", noPest: "ಗಮನಾರ್ಹ ಕೀಟ ಪತ್ತೆಯಾಗಿಲ್ಲ", pestConfidence: "ಕೀಟ ವಿಶ್ವಾಸ ಮಟ್ಟ", detectedPests: "ಪತ್ತೆಯಾದ ಕೀಟಗಳು" },
    ml: { pest: "കീടബാധ", noPest: "ശ്രദ്ധേയമായ കീടത്തെ കണ്ടെത്തിയില്ല", pestConfidence: "കീട വിശ്വാസ നില", detectedPests: "കണ്ടെത്തിയ കീടങ്ങൾ" },
    pa: { pest: "ਕੀੜਿਆਂ ਦਾ ਹਮਲਾ", noPest: "ਕੋਈ ਮਹੱਤਵਪੂਰਨ ਕੀੜਾ ਨਹੀਂ ਮਿਲਿਆ", pestConfidence: "ਕੀੜਾ ਭਰੋਸਾ ਪੱਧਰ", detectedPests: "ਮਿਲੇ ਕੀੜੇ" }
};

function pestText(key) {
    const pack = pestLabels[currentLanguage] || pestLabels.en;
    return pack[key] || pestLabels.en[key] || key;
}

/* =========================================================
   PLANT DATA
   ========================================================= */

const plantCatalog = {

    crop: [
        "Corn",
        "Soybean"
    ],

    vegetable: [
        "Bell Pepper",
        "Potato",
        "Squash",
        "Tomato"
    ],

    fruit: [
        "Apple",
        "Blueberry",
        "Cherry",
        "Grape",
        "Orange",
        "Peach",
        "Raspberry",
        "Strawberry"
    ],

    indoor: [
        "Money Plant",
        "Snake Plant",
        "Spider Plant"
    ]
};


const libraryPlants = [
    ["Corn", "crop", "PlantVillage-supported crop."],
    ["Soybean", "crop", "PlantVillage-supported crop."],

    ["Bell Pepper", "vegetable", "PlantVillage-supported vegetable."],
    ["Potato", "vegetable", "PlantVillage-supported vegetable."],
    ["Squash", "vegetable", "PlantVillage-supported vegetable."],
    ["Tomato", "vegetable", "PlantVillage-supported vegetable."],

    ["Apple", "fruit", "PlantVillage-supported fruit crop."],
    ["Blueberry", "fruit", "PlantVillage-supported fruit crop."],
    ["Cherry", "fruit", "PlantVillage-supported fruit crop."],
    ["Grape", "fruit", "PlantVillage-supported fruit crop."],
    ["Orange", "fruit", "PlantVillage-supported citrus crop."],
    ["Peach", "fruit", "PlantVillage-supported fruit crop."],
    ["Raspberry", "fruit", "PlantVillage-supported fruit crop."],
    ["Strawberry", "fruit", "PlantVillage-supported fruit crop."],

    ["Money Plant", "indoor", "Indoor plant supported by the indoor disease model."],
    ["Snake Plant", "indoor", "Indoor plant supported by the indoor disease model."],
    ["Spider Plant", "indoor", "Indoor plant supported by the indoor disease model."]
].map(item => ({
    name: item[0],
    category: item[1],
    description: item[2]
}));


/* =========================================================
   TRANSLATION HELPER
   ========================================================= */

function t(key) {

    return (
        translations[currentLanguage]?.[key] ??
        translations.en[key] ??
        key
    );
}


/* =========================================================
   SPEECH LANGUAGE
   ========================================================= */

function getSpeechLanguage(language) {

    const map = {
        en: "en-IN",
        hi: "hi-IN",
        mr: "mr-IN",
        gu: "gu-IN",
        bn: "bn-IN",
        ta: "ta-IN",
        te: "te-IN",
        kn: "kn-IN",
        ml: "ml-IN",
        pa: "pa-IN"
    };

    return map[language] || "en-IN";
}


/* =========================================================
   CHAT BOX OVERFLOW FIX
   ========================================================= */

function installChatFixes() {
    if (document.getElementById("cropcare-chat-fixes")) return;

    const style = document.createElement("style");
    style.id = "cropcare-chat-fixes";
    style.textContent = `
        .assistant-layout,
        .assistant-card,
        #chatMessages,
        .chat-messages,
        #chatForm,
        .chat-form {
            min-width: 0 !important;
            max-width: 100% !important;
        }

        .assistant-layout > *,
        .assistant-card > * {
            min-width: 0 !important;
            max-width: 100% !important;
        }

        #chatMessages,
        .chat-messages {
            width: 100% !important;
            height: auto !important;
            min-height: 250px !important;
            max-height: 430px !important;
            overflow-x: hidden !important;
            overflow-y: auto !important;
            box-sizing: border-box !important;
        }

        #chatMessages .chat-message,
        .chat-messages .chat-message {
            display: block !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            box-sizing: border-box !important;
            min-width: 0 !important;
            overflow: visible !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
            white-space: normal !important;
            line-height: 1.6 !important;
        }

        #chatMessages .chat-message.bot,
        #chatMessages .chat-message.assistant,
        .chat-messages .chat-message.bot,
        .chat-messages .chat-message.assistant {
            width: 100% !important;
            max-width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
        }

        #chatMessages .chat-message.user,
        .chat-messages .chat-message.user {
            width: auto !important;
            max-width: 82% !important;
            margin-left: auto !important;
            margin-right: 0 !important;
        }

        #chatMessages .chat-message p,
        .chat-messages .chat-message p {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            max-width: 100% !important;
            min-width: 0 !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            overflow: visible !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
            white-space: normal !important;
            line-height: 1.6 !important;
        }

        #chatForm,
        .chat-form {
            width: 100% !important;
            box-sizing: border-box !important;
        }

        #chatForm > *,
        .chat-form > * {
            min-width: 0 !important;
        }

        #chatForm input,
        #chatInput {
            min-width: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
        }

        @media (max-width: 520px) {
            #chatMessages .chat-message.user,
            .chat-messages .chat-message.user {
                width: 100% !important;
                max-width: 100% !important;
            }
        }
    `;

    document.head.appendChild(style);

    // The welcome message already exists in crop.html before JavaScript runs.
    // Normalize it too, so it uses exactly the same wrapping rules as new messages.
    const initialMessage = document.querySelector("#chatMessages .chat-message");
    if (initialMessage) {
        initialMessage.style.display = "block";
        initialMessage.style.width = "100%";
        initialMessage.style.maxWidth = "100%";
        initialMessage.style.height = "auto";
        initialMessage.style.minHeight = "0";
        initialMessage.style.maxHeight = "none";
        initialMessage.style.overflow = "visible";
        initialMessage.style.boxSizing = "border-box";

        const paragraph = initialMessage.querySelector("p");
        if (paragraph) {
            paragraph.style.display = "block";
            paragraph.style.width = "100%";
            paragraph.style.maxWidth = "100%";
            paragraph.style.height = "auto";
            paragraph.style.minHeight = "0";
            paragraph.style.maxHeight = "none";
            paragraph.style.overflow = "visible";
            paragraph.style.boxSizing = "border-box";
            paragraph.style.overflowWrap = "anywhere";
            paragraph.style.wordBreak = "break-word";
            paragraph.style.whiteSpace = "normal";
        }
    }
}

/* =========================================================
   LANGUAGE SWITCHING
   ========================================================= */

function changeLanguage(language) {

    if (!LANGS[language]) {
        language = "en";
    }

    currentLanguage =
        language;

    localStorage.setItem(
        "cropcare-language",
        language
    );

    document.documentElement.lang =
        language;

    const select =
        document.getElementById(
            "languageSelect"
        );

    if (select) {
        select.value =
            language;
    }


    /* Translate all marked elements */

    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {

            const key =
                element.dataset.i18n;

            const value =
                t(key);

            if (value && value !== key) {

                /*
                 * Preserve an icon child where possible.
                 */
                const textNodes =
                    Array.from(
                        element.childNodes
                    ).filter(
                        node =>
                            node.nodeType ===
                            Node.TEXT_NODE
                    );

                if (textNodes.length) {

                    textNodes[
                        textNodes.length - 1
                    ].nodeValue =
                        value;

                } else {

                    element.textContent =
                        value;
                }
            }
        });


    /* Translate placeholders */

    document
        .querySelectorAll(
            "[data-i18n-placeholder]"
        )
        .forEach(element => {

            const key =
                element.dataset.i18nPlaceholder;

            element.placeholder =
                t(key);
        });


    /* Translate title attributes */

    document
        .querySelectorAll(
            "[data-i18n-title]"
        )
        .forEach(element => {

            const key =
                element.dataset.i18nTitle;

            element.title =
                t(key);
        });


    updatePlantSelectorLanguage();
    updateThemeIcon();
    updateThemeText();
    updateAnalysisButton();
    renderPlantLibrary();
    updateAssistantContext();

    if (latestPrediction) {
        displayResult(latestPrediction);
    }

    if (window.cropCareRecognition) {

        window.cropCareRecognition.lang =
            getSpeechLanguage(
                currentLanguage
            );
    }
}


/* =========================================================
   LANGUAGE SELECTOR
   ========================================================= */

function setupLanguage() {

    const select =
        document.getElementById(
            "languageSelect"
        );

    if (!select) {
        return;
    }

    select.value =
        LANGS[currentLanguage]
            ? currentLanguage
            : "en";

    select.addEventListener(
        "change",
        event => {

            changeLanguage(
                event.target.value
            );
        }
    );
}


/* =========================================================
   DARK MODE
   ========================================================= */

function restoreTheme() {

    const saved =
        localStorage.getItem(
            "cropcare-theme"
        );

    if (saved === "dark") {

        document.documentElement
            .classList
            .add("dark-mode");

    } else {

        document.documentElement
            .classList
            .remove("dark-mode");
    }
}


function setupDarkMode() {

    const button =
        document.getElementById(
            "themeToggle"
        );

    if (!button) {
        return;
    }

    /*
     * Avoid adding the same listener twice.
     */
    if (button.dataset.cropcareThemeReady === "true") {
        return;
    }

    button.dataset.cropcareThemeReady =
        "true";

    button.addEventListener(
        "click",
        () => {

            document.documentElement
                .classList
                .toggle("dark-mode");

            localStorage.setItem(
                "cropcare-theme",
                document.documentElement
                    .classList
                    .contains("dark-mode")
                    ? "dark"
                    : "light"
            );

            updateThemeIcon();
            updateThemeText();
        }
    );
}


function updateThemeIcon() {

    const icon =
        document.getElementById(
            "themeIcon"
        );

    if (!icon) {
        return;
    }

    icon.textContent =
        document.documentElement
            .classList
            .contains("dark-mode")
            ? "☀️"
            : "🌙";
}


function updateThemeText() {

    const label =
        document.getElementById(
            "themeLabel"
        );

    if (!label) {
        return;
    }

    label.textContent =
        document.documentElement
            .classList
            .contains("dark-mode")
            ? t("light")
            : t("dark");
}


/* =========================================================
   ANALYZE BUTTON
   ========================================================= */

function updateAnalysisButton() {

    const button =
        document.getElementById(
            "analyzeButton"
        );

    if (
        button &&
        !button.disabled
    ) {

        button.textContent =
            t("analyze");
    }
}


/* =========================================================
   FILE UPLOAD
   ========================================================= */

function setupUpload() {

    const input =
        document.getElementById(
            "cropImage"
        );

    const zone =
        document.getElementById(
            "dropZone"
        );

    if (!input) {
        return;
    }

    input.addEventListener(
        "change",
        () => {

            if (
                input.files &&
                input.files[0]
            ) {

                handleSelectedFile(
                    input.files[0]
                );
            }
        }
    );


    if (zone) {

        zone.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

                zone.classList.add(
                    "dragging"
                );
            }
        );


        zone.addEventListener(
            "dragleave",
            () => {

                zone.classList.remove(
                    "dragging"
                );
            }
        );


        zone.addEventListener(
            "drop",
            event => {

                event.preventDefault();

                zone.classList.remove(
                    "dragging"
                );

                if (
                    event.dataTransfer &&
                    event.dataTransfer.files &&
                    event.dataTransfer.files[0]
                ) {

                    handleSelectedFile(
                        event.dataTransfer.files[0]
                    );
                }
            }
        );
    }
}


/* =========================================================
   HANDLE IMAGE
   ========================================================= */

function handleSelectedFile(file) {

    if (
        !file.type ||
        !file.type.startsWith("image/")
    ) {

        setMessage(
            "uploadMessage",
            t("imageFileError")
        );

        return;
    }

    selectedFile =
        file;


    const reader =
        new FileReader();


    reader.onload =
        event => {

            const preview =
                document.getElementById(
                    "preview"
                );

            if (!preview) {
                return;
            }

            preview.innerHTML =
                "";

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                event.target.result;

            image.alt =
                "Plant preview";

            image.className =
                "preview-image";

            preview.appendChild(
                image
            );
        };


    reader.readAsDataURL(
        file
    );


    setMessage(
        "uploadMessage",
        file.name
    );


    const button =
        document.getElementById(
            "analyzeButton"
        );

    if (button) {

        button.disabled =
            false;

        button.textContent =
            t("analyze");
    }
}


/* =========================================================
   MESSAGE
   ========================================================= */

function setMessage(
    id,
    message
) {

    const element =
        document.getElementById(
            id
        );

    if (element) {
        element.textContent =
            message;
    }
}


/* =========================================================
   CAMERA
   ========================================================= */

function setupCamera() {

    document
        .getElementById(
            "startCamera"
        )
        ?.addEventListener(
            "click",
            startCamera
        );

    document
        .getElementById(
            "captureImage"
        )
        ?.addEventListener(
            "click",
            captureImage
        );

    document
        .getElementById(
            "stopCamera"
        )
        ?.addEventListener(
            "click",
            stopCamera
        );
}


async function startCamera() {

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        alert(
            t("noCamera")
        );

        return;
    }


    try {

        cameraStream =
            await navigator.mediaDevices
                .getUserMedia({
                    video: true,
                    audio: false
                });


        const video =
            document.getElementById(
                "camera"
            );

        const container =
            document.getElementById(
                "cameraContainer"
            );


        if (video) {

            video.srcObject =
                cameraStream;

            await video.play();
        }


        if (container) {

            container.style.display =
                "block";
        }

    } catch (error) {

        console.error(
            error
        );

        alert(
            t("cameraError")
        );
    }
}


function captureImage() {

    const video =
        document.getElementById(
            "camera"
        );

    if (
        !video ||
        !cameraStream
    ) {
        return;
    }


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        video.videoWidth ||
        640;

    canvas.height =
        video.videoHeight ||
        480;


    const context =
        canvas.getContext(
            "2d"
        );


    if (!context) {
        return;
    }


    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );


    canvas.toBlob(
        blob => {

            if (blob) {

                const file =
                    new File(
                        [blob],
                        "camera-plant.jpg",
                        {
                            type:
                                "image/jpeg"
                        }
                    );

                handleSelectedFile(
                    file
                );
            }

            stopCamera();

        },
        "image/jpeg",
        0.9
    );
}


function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );
    }

    cameraStream =
        null;


    const video =
        document.getElementById(
            "camera"
        );

    if (video) {

        video.srcObject =
            null;
    }


    const container =
        document.getElementById(
            "cameraContainer"
        );

    if (container) {

        container.style.display =
            "none";
    }
}


/* =========================================================
   PLANT SELECTOR
   ========================================================= */

function setupPlantSelector() {

    const type =
        document.getElementById(
            "plantType"
        );

    const name =
        document.getElementById(
            "plantName"
        );

    if (
        !type ||
        !name
    ) {
        return;
    }


    type.addEventListener(
        "change",
        fillPlants
    );


    function fillPlants() {

        name.innerHTML =
            "";

        const firstOption =
            document.createElement(
                "option"
            );

        firstOption.value =
            "";

        firstOption.textContent =
            t("selectPlant");

        name.appendChild(
            firstOption
        );


        (
            plantCatalog[type.value] ||
            []
        ).forEach(
            plant => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    plant;

                option.textContent =
                    localizePlantName(plant);

                name.appendChild(
                    option
                );
            }
        );
    }


    fillPlants();
}


function updatePlantSelectorLanguage() {

    const type =
        document.getElementById(
            "plantType"
        );

    const name =
        document.getElementById(
            "plantName"
        );

    if (
        !type ||
        !name
    ) {
        return;
    }


    const currentValue =
        name.value;


    name.innerHTML =
        "";


    const firstOption =
        document.createElement(
            "option"
        );

    firstOption.value =
        "";

    firstOption.textContent =
        t("selectPlant");

    name.appendChild(
        firstOption
    );


    (
        plantCatalog[type.value] ||
        []
    ).forEach(
        plant => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                plant;

            option.textContent =
                localizePlantName(plant);

            name.appendChild(
                option
            );
        }
    );


    if (
        Array.from(name.options)
            .some(
                option =>
                    option.value ===
                    currentValue
            )
    ) {

        name.value =
            currentValue;
    }
}


/* =========================================================
   PLANT LIBRARY
   ========================================================= */

let selectedLibraryCategory =
    "all";


function setupPlantLibrary() {

    const search =
        document.getElementById(
            "plantSearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            () => {

                renderPlantLibrary(
                    search.value
                );
            }
        );
    }


    document
        .querySelectorAll(
            "#categoryChips [data-category]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        selectedLibraryCategory =
                            button.dataset.category ||
                            "all";


                        document
                            .querySelectorAll(
                                "#categoryChips [data-category]"
                            )
                            .forEach(
                                other => {

                                    other.classList.remove(
                                        "active"
                                    );
                                }
                            );


                        button.classList.add(
                            "active"
                        );


                        renderPlantLibrary(
                            search?.value || ""
                        );
                    }
                );
            }
        );


    renderPlantLibrary();
}


function renderPlantLibrary(
    searchTerm = ""
) {

    const grid =
        document.getElementById(
            "plantGrid"
        );

    if (!grid) {
        return;
    }


    const query =
        String(searchTerm)
            .toLowerCase()
            .trim();


    const filtered =
        libraryPlants.filter(
            plant => {

                const categoryMatch =
                    selectedLibraryCategory ===
                        "all" ||
                    plant.category ===
                        selectedLibraryCategory;


                const textMatch =
                    !query ||
                    (localizePlantName(plant.name) || plant.name)
                        .toLowerCase()
                        .includes(query) ||
                    plant.description
                        .toLowerCase()
                        .includes(query);


                return (
                    categoryMatch &&
                    textMatch
                );
            }
        );


    if (!filtered.length) {

        grid.innerHTML =
            `<div class="empty-library">${escapeHtml(
                t("noPlants")
            )}</div>`;

        return;
    }


    grid.innerHTML =
        filtered
            .map(
                plant => `

                    <div class="plant-card">

                        <h3>
                            ${escapeHtml(
                                localizePlantName(plant.name)
                            )}
                        </h3>

                        <p>
                            ${escapeHtml(
                                plant.description
                            )}
                        </p>

                    </div>

                `
            )
            .join("");
}


/* =========================================================
   ANALYZE
   ========================================================= */

function setupAnalyze() {

    const button =
        document.getElementById(
            "analyzeButton"
        );

    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        analyzePlant
    );
}


async function analyzePlant() {

    if (!selectedFile) {

        alert(
            t("noImage")
        );

        return;
    }


    const button =
        document.getElementById(
            "analyzeButton"
        );


    if (button) {

        button.disabled =
            true;

        button.textContent =
            t("analyzing");
    }


    const form =
        new FormData();


    form.append(
        "image",
        selectedFile
    );


    form.append(
        "plant_type",
        document.getElementById(
            "plantType"
        )?.value || ""
    );


    form.append(
        "plant_name",
        document.getElementById(
            "plantName"
        )?.value || ""
    );


    form.append(
        "language",
        currentLanguage
    );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/upload`,
                {
                    method:
                        "POST",
                    body:
                        form
                }
            );


        const data =
            await readJson(
                response
            );


        if (
            !response.ok ||
            data.success === false
        ) {

            throw new Error(
                data.error ||
                data.message ||
                t("error")
            );
        }


        latestPrediction =
            data;


        displayResult(
            data
        );


        updateAssistantContext();


    } catch (error) {

        console.error(
            error
        );

        alert(
            error.message ||
            t("error")
        );


    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                t("analyze");
        }
    }
}


/* =========================================================
   JSON HELPER
   ========================================================= */

async function readJson(
    response
) {

    const text =
        await response.text();


    try {

        return JSON.parse(
            text
        );

    } catch {

        throw new Error(
            text ||
            `Server error (${response.status})`
        );
    }
}


/* =========================================================
   DISPLAY RESULT
   ========================================================= */

function displayResult(
    data
) {

    const result =
        document.getElementById(
            "result"
        );

    if (!result) {
        return;
    }

    const crop =
        data.crop ||
        data.crop_name ||
        data.plant ||
        data.plant_name ||
        "Unknown";

    const disease =
        data.disease ||
        data.disease_name ||
        data.prediction ||
        "Unknown";

    const modelSource =
        data.model_source ||
        "";

    let confidence =
        Number(
            data.confidence
        );

    let confidenceText =
        "—";

    if (
        Number.isFinite(
            confidence
        )
    ) {
        confidenceText =
            confidence <= 1
                ? `${(
                    confidence * 100
                ).toFixed(1)}%`
                : `${confidence.toFixed(1)}%`;
    }

    const pestResult =
        data.pest_detection ||
        {};

    const detectedPests =
        Array.isArray(data.pests)
            ? data.pests
            : Array.isArray(pestResult.pests)
                ? pestResult.pests
                : [];

    const pestDetected =
        data.pest_detected === true ||
        pestResult.detected === true ||
        detectedPests.length > 0;

    const pestNames =
        detectedPests
            .map(
                pest =>
                    typeof pest === "string"
                        ? pest
                        : pest.name ||
                          pest.label ||
                          pest.class_name ||
                          ""
            )
            .filter(Boolean);

    const pestDisplay =
        pestDetected
            ? (
                pestNames.length
                    ? pestNames.join(", ")
                    : (
                        data.pest_name ||
                        pestResult.name ||
                        "Pest detected"
                    )
            )
            : pestText("noPest");

    let pestConfidence =
        Number(
            data.pest_confidence ??
            pestResult.confidence
        );

    let pestConfidenceText =
        "—";

    if (
        Number.isFinite(
            pestConfidence
        )
    ) {
        pestConfidenceText =
            pestConfidence <= 1
                ? `${(
                    pestConfidence * 100
                ).toFixed(1)}%`
                : `${pestConfidence.toFixed(1)}%`;
    }

    result.innerHTML = `

        <div class="result-content">

            <h3>
                ${escapeHtml(
                    t("resultTitle")
                )}
            </h3>


            <div class="result-item">

                <strong>
                    ${escapeHtml(
                        t("plant")
                    )}
                </strong>

                <span>
                    ${escapeHtml(
                        localizePlantName(crop)
                    )}
                </span>

            </div>


            <div class="result-item">

                <strong>
                    ${escapeHtml(
                        t("disease")
                    )}
                </strong>

                <span>
                    ${escapeHtml(
                        disease
                    )}
                </span>

            </div>


            <div class="result-item">

                <strong>
                    ${escapeHtml(
                        pestText("pest")
                    )}
                </strong>

                <span>
                    ${escapeHtml(
                        pestDisplay
                    )}
                </span>

            </div>


            ${
                pestDetected &&
                pestConfidenceText !== "—"
                    ? `
            <div class="result-item">

                <strong>
                    ${escapeHtml(
                        pestText("pestConfidence")
                    )}
                </strong>

                <span>
                    ${escapeHtml(
                        pestConfidenceText
                    )}
                </span>

            </div>
                    `
                    : ""
            }


            <div class="result-item">

                <strong>
                    ${escapeHtml(
                        t("confidence")
                    )}
                </strong>

                <span>
                    ${escapeHtml(
                        confidenceText
                    )}
                </span>

            </div>


            ${
                pestNames.length > 1
                    ? `
            <div class="result-item">

                <strong>
                    ${escapeHtml(
                        pestText("detectedPests")
                    )}
                </strong>

                <span>
                    ${escapeHtml(
                        pestNames.join(", ")
                    )}
                </span>

            </div>
                    `
                    : ""
            }


            <div class="result-actions">

                <button
                    type="button"
                    class="btn primary-btn"
                    id="saveResultButton"
                >
                    ${escapeHtml(
                        t("saveResult")
                    )}
                </button>


                <button
                    type="button"
                    class="btn secondary-btn"
                    id="recoveryButton"
                >
                    ${escapeHtml(
                        t("recovery")
                    )}
                </button>

            </div>

        </div>
    `;


    document
        .getElementById(
            "saveResultButton"
        )
        ?.addEventListener(
            "click",
            savePrediction
        );


    document
        .getElementById(
            "recoveryButton"
        )
        ?.addEventListener(
            "click",
            loadRecovery
        );
}


/* =========================================================
   SAVE RESULT
   ========================================================= */

async function savePrediction() {

    if (!latestPrediction) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/predict`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            latestPrediction
                        )
                }
            );


        const data =
            await readJson(
                response
            );


        if (
            !response.ok ||
            data.success === false
        ) {

            throw new Error(
                data.error ||
                data.message ||
                t("error")
            );
        }


        alert(
            data.message ||
            t("saved")
        );


    } catch (error) {

        console.error(
            error
        );

        alert(
            error.message ||
            t("error")
        );
    }
}


/* =========================================================
   RECOVERY
   ========================================================= */

async function loadRecovery() {

    if (!latestPrediction) {
        return;
    }


    const crop =
        latestPrediction.crop ||
        latestPrediction.crop_name ||
        latestPrediction.plant_name ||
        "your plant";


    const disease =
        latestPrediction.disease ||
        latestPrediction.disease_name ||
        "general";


    const title =
        document.getElementById(
            "recoveryResultTitle"
        );


    const status =
        document.getElementById(
            "recoveryStatus"
        );


    if (status) {

        status.textContent =
            t("loading");
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/recovery/${encodeURIComponent(
                    crop
                )}?disease=${encodeURIComponent(
                    disease
                )}&language=${encodeURIComponent(
                    currentLanguage
                )}`
            );


        const data =
            await readJson(
                response
            );


        if (
            !response.ok ||
            data.success === false
        ) {

            throw new Error(
                data.error ||
                data.message ||
                t("error")
            );
        }


        /*
         * Keep the existing title unless the backend
         * provides a translated title.
         */
        if (title) {

            title.textContent =
                data.title ||
                t("recoveryGuide");
        }


        if (status) {

            const steps =
                data.recovery_steps ||
                [];


            status.innerHTML =
                steps
                    .map(
                        (
                            step,
                            index
                        ) => `

                            <p>

                                <strong>
                                    ${index + 1}.
                                </strong>

                                ${escapeHtml(
                                    step
                                )}

                            </p>

                        `
                    )
                    .join("");
        }


        document
            .getElementById(
                "recovery"
            )
            ?.scrollIntoView({
                behavior:
                    "smooth",
                block:
                    "start"
            });


    } catch (error) {

        console.error(
            error
        );

        if (status) {

            status.textContent =
                error.message ||
                t("error");
        }
    }
}


/* =========================================================
   ASSISTANT CONTEXT
   ========================================================= */

function updateAssistantContext() {

    const element =
        document.getElementById(
            "assistantContext"
        );

    if (!element) {
        return;
    }


    if (!latestPrediction) {

        element.textContent =
            t("generalPlantCare");

        return;
    }


    const crop =
        latestPrediction.crop ||
        latestPrediction.crop_name ||
        latestPrediction.plant_name ||
        "plant";


    const disease =
        latestPrediction.disease ||
        latestPrediction.disease_name ||
        "condition";


    const pestResult =
        latestPrediction.pest_detection ||
        {};

    const pestDetected =
        latestPrediction.pest_detected === true ||
        pestResult.detected === true ||
        (
            Array.isArray(
                latestPrediction.pests
            ) &&
            latestPrediction.pests.length > 0
        );

    const pestNames =
        Array.isArray(
            latestPrediction.pests
        )
            ? latestPrediction.pests
                .map(
                    pest =>
                        typeof pest === "string"
                            ? pest
                            : pest.name ||
                              pest.label ||
                              pest.class_name ||
                              ""
                )
                .filter(Boolean)
            : [];

    const pest =
        pestDetected
            ? (
                pestNames.length
                    ? pestNames.join(", ")
                    : (
                        latestPrediction.pest_name ||
                        pestResult.name ||
                        pestText("pest")
                    )
            )
            : pestText("noPest");


    element.textContent =
        `${localizePlantName(crop)} • ${disease} • ${pest}`;
}


/* =========================================================
   CHAT
   ========================================================= */

function setupChat() {

    const form =
        document.getElementById(
            "chatForm"
        );

    const input =
        document.getElementById(
            "chatInput"
        );


    if (
        !form ||
        !input
    ) {
        return;
    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const message =
                input.value.trim();


            if (!message) {
                return;
            }


            addChatMessage(
                message,
                "user"
            );


            input.value =
                "";

            input.disabled =
                true;


            const sendButton =
                form.querySelector(
                    "button[type='submit']"
                );


            if (sendButton) {
                sendButton.disabled =
                    true;
            }


            const thinking =
                addChatMessage(
                    t("thinking"),
                    "bot"
                );


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/chat`,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    message:
                                        message,

                                    language:
                                        currentLanguage,

                                    /*
                                     * Send BOTH names so the
                                     * backend remains compatible.
                                     */

                                    plant_name:
                                        latestPrediction?.crop_name ||
                                        latestPrediction?.crop ||
                                        latestPrediction?.plant_name ||
                                        document.getElementById(
                                            "plantName"
                                        )?.value ||
                                        "",

                                    disease_name:
                                        latestPrediction?.disease_name ||
                                        latestPrediction?.disease ||
                                        latestPrediction?.prediction ||
                                        "",

                                    crop:
                                        latestPrediction?.crop_name ||
                                        latestPrediction?.crop ||
                                        latestPrediction?.plant_name ||
                                        "",

                                    disease:
                                        latestPrediction?.disease_name ||
                                        latestPrediction?.disease ||
                                        latestPrediction?.prediction ||
                                        ""
,
                                    pest_name:
                                        latestPrediction?.pest_name ||
                                        latestPrediction?.pest_detection?.name ||
                                        (
                                            Array.isArray(
                                                latestPrediction?.pests
                                            )
                                                ? latestPrediction.pests
                                                    .map(
                                                        pest =>
                                                            typeof pest === "string"
                                                                ? pest
                                                                : pest.name ||
                                                                  pest.label ||
                                                                  pest.class_name ||
                                                                  ""
                                                    )
                                                    .filter(Boolean)
                                                    .join(", ")
                                                : ""
                                        ),

                                    pest_detected:
                                        latestPrediction?.pest_detected === true ||
                                        latestPrediction?.pest_detection?.detected === true ||
                                        (
                                            Array.isArray(
                                                latestPrediction?.pests
                                            ) &&
                                            latestPrediction.pests.length > 0
                                        )
                                })
                        }
                    );


                const data =
                    await readJson(
                        response
                    );


                if (
                    !response.ok ||
                    data.success === false
                ) {

                    throw new Error(
                        data.error ||
                        data.message ||
                        t("chatFailed")
                    );
                }


                const answer =
                    data.response ||
                    data.answer ||
                    data.message ||
                    t("error");


                lastAssistantAnswer =
                    answer;


                if (thinking) {

                    const paragraph =
                        thinking.querySelector(
                            "p"
                        );

                    if (paragraph) {

                        paragraph.textContent =
                            answer;
                    }
                }


            } catch (error) {

                console.error(
                    "Chat error:",
                    error
                );


                if (thinking) {

                    const paragraph =
                        thinking.querySelector(
                            "p"
                        );

                    if (paragraph) {

                        paragraph.textContent =
                            error.message ||
                            t("error");
                    }
                }


            } finally {

                input.disabled =
                    false;


                if (sendButton) {

                    sendButton.disabled =
                        false;
                }


                input.focus();
            }
        }
    );
}


/* =========================================================
   ADD CHAT MESSAGE
   ========================================================= */

function addChatMessage(message, sender) {
    const container = document.getElementById("chatMessages");
    if (!container) return null;

    const wrapper = document.createElement("div");
    wrapper.className = `chat-message ${sender}`;
    wrapper.style.boxSizing = "border-box";
    wrapper.style.minWidth = "0";
    wrapper.style.overflowWrap = "anywhere";
    wrapper.style.wordBreak = "break-word";
    wrapper.style.whiteSpace = "normal";
    wrapper.style.height = "auto";
    wrapper.style.minHeight = "0";
    wrapper.style.maxHeight = "none";
    wrapper.style.overflow = "visible";

    if (sender === "user") {
        wrapper.style.width = "auto";
        wrapper.style.maxWidth = "82%";
        wrapper.style.marginLeft = "auto";
        wrapper.style.marginRight = "0";
    } else {
        wrapper.style.width = "100%";
        wrapper.style.maxWidth = "100%";
        wrapper.style.marginLeft = "0";
        wrapper.style.marginRight = "0";
    }

    const paragraph = document.createElement("p");
    paragraph.textContent = String(message ?? "");
    paragraph.style.display = "block";
    paragraph.style.width = "100%";
    paragraph.style.maxWidth = "100%";
    paragraph.style.minWidth = "0";
    paragraph.style.margin = "0";
    paragraph.style.boxSizing = "border-box";
    paragraph.style.overflowWrap = "anywhere";
    paragraph.style.wordBreak = "break-word";
    paragraph.style.whiteSpace = "normal";
    paragraph.style.height = "auto";
    paragraph.style.minHeight = "0";
    paragraph.style.maxHeight = "none";
    paragraph.style.overflow = "visible";

    wrapper.appendChild(paragraph);
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
    return wrapper;
}


/* =========================================================
   SUGGESTIONS
   ========================================================= */

function askSuggestion(
    message
) {

    const input =
        document.getElementById(
            "chatInput"
        );


    if (!input) {
        return;
    }


    input.value =
        message;


    input.focus();


    document
        .getElementById(
            "chatForm"
        )
        ?.requestSubmit();
}


/* =========================================================
   VOICE INPUT
   ========================================================= */

function setupVoice() {

    const button =
        document.getElementById(
            "voiceInputBtn"
        );


    const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!button) {
        return;
    }


    if (!Recognition) {

        button.disabled =
            true;

        button.title =
            "Voice input is not supported by this browser.";

        return;
    }


    const recognition =
        new Recognition();


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.lang =
        getSpeechLanguage(
            currentLanguage
        );


    window.cropCareRecognition =
        recognition;


    button.addEventListener(
        "click",
        () => {

            recognition.lang =
                getSpeechLanguage(
                    currentLanguage
                );


            try {

                recognition.start();

            } catch (error) {

                console.log(
                    error
                );
            }
        }
    );


    recognition.onstart =
        () => {

            button.classList.add(
                "recording"
            );
        };


    recognition.onend =
        () => {

            button.classList.remove(
                "recording"
            );
        };


    recognition.onresult =
        event => {

            const text =
                event.results?.[0]?.[0]
                    ?.transcript ||
                "";


            const input =
                document.getElementById(
                    "chatInput"
                );


            if (input) {

                input.value =
                    text;

                input.focus();
            }
        };


    recognition.onerror =
        event => {

            console.log(
                "Speech recognition:",
                event.error
            );
        };
}


/* =========================================================
   TEXT TO SPEECH
   ========================================================= */

function setupTextToSpeech() {

    document
        .getElementById(
            "speakLastResult"
        )
        ?.addEventListener(
            "click",
            speakLastResult
        );


    document
        .getElementById(
            "stopSpeech"
        )
        ?.addEventListener(
            "click",
            stopSpeech
        );
}


function speakLastResult() {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    const text =
        lastAssistantAnswer ||
        document.getElementById(
            "chatMessages"
        )?.innerText ||
        "";


    if (!text.trim()) {
        return;
    }


    speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    utterance.lang =
        getSpeechLanguage(
            currentLanguage
        );


    speechSynthesis.speak(
        utterance
    );
}


function stopSpeech() {

    if (
        "speechSynthesis" in window
    ) {

        speechSynthesis.cancel();
    }
}


/* =========================================================
   DETECTION SCROLL
   ========================================================= */

function startDetection() {

    document
        .getElementById(
            "detect"
        )
        ?.scrollIntoView({
            behavior:
                "smooth",
            block:
                "start"
        });
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (!LANGS[currentLanguage]) {
            currentLanguage =
                "en";
        }


        installChatFixes();

        setupLanguage();

        restoreTheme();

        setupDarkMode();

        // Analyze is bound first so another startup function cannot block it.
        try {
            setupAnalyze();
        } catch (error) {
            console.error("Analyze setup error:", error);
        }

        setupUpload();

        setupCamera();

        setupChat();

        setupVoice();

        setupTextToSpeech();

        setupPlantSelector();

        setupPlantLibrary();

        changeLanguage(
            currentLanguage
        );

        updateThemeIcon();

        updateThemeText();

        updateAssistantContext();
    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.startDetection =
    startDetection;

window.askSuggestion =
    askSuggestion;

window.changeLanguage =
    changeLanguage;

window.toggleDarkMode =
    () => {

        document
            .getElementById(
                "themeToggle"
            )
            ?.click();
    };

window.startCamera =
    startCamera;

window.captureImage =
    captureImage;

window.stopCamera =
    stopCamera;

window.speakLastResult =
    speakLastResult;

window.stopSpeech =
    stopSpeech;

})();
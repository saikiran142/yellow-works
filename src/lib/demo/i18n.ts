import type { DayKey, Lang } from "./types";

export const DAY_SHORT: Record<Lang, Record<DayKey, string>> = {
  en: { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" },
  hi: { mon: "सोम", tue: "मंगल", wed: "बुध", thu: "गुरु", fri: "शुक्र", sat: "शनि", sun: "रवि" },
  te: { mon: "సోమ", tue: "మంగళ", wed: "బుధ", thu: "గురు", fri: "శుక్ర", sat: "శని", sun: "ఆది" },
};

/** Words that identify a day in any supported language (matched as prefixes, case-insensitive). */
export const DAY_WORDS: Record<DayKey, string[]> = {
  mon: ["mon", "सोम", "సోమ"],
  tue: ["tue", "मंगल", "మంగళ"],
  wed: ["wed", "बुध", "బుధ"],
  thu: ["thu", "गुरु", "గురు"],
  fri: ["fri", "शुक्र", "శుక్ర"],
  sat: ["sat", "शनि", "శని"],
  sun: ["sun", "रवि", "ఆది"],
};

/** Keyword packs per intent. English is always checked; Telugu and Hindi are added. */
export const KEYWORDS = {
  urgent: /emergency|urgent|ambulance|bleeding|chest pain|can'?t breathe|accident|fire\b|आपात|इमरजेंसी|खून|अत्यవసర|అత్యవసర|ఎమర్జెన్సీ|రక్తస్రావం/i,
  complaint: /complain|refund|angry|cheated|worst|terrible|rude|bad service|not happy|disappointed|शिकायत|धोखा|बेकार|ఫిర్యాదు|మోసం|చెత్త/i,
  advice: /should i (take|stop|invest|sue)|medicine|medication|dosage|\bdose\b|diagnos|symptom|prescri|lawyer|legal advice|sue\b|loan|invest|tax advice|दवा|सलाह|మందు|సలహా/i,
  offtopic: /weather|cricket|joke|poem|movie|president|prime minister|election|write (me )?(an? )?(essay|code|story)|capital of|bitcoin|stock market|मौसम|క్రికెట్|వాతావరణం/i,
  price: /price|prices|cost|fee|fees|charge|charges|rate|rates|how much|quote|membership|package|₹|rs\b|कीमत|कितना|फीस|शुल्क|ధర|ఫీజు|ఎంత/i,
  hours: /hours|timing|timings|open|close|closing|what time|when do you|batch|schedule|समय|खुला|कब|సమయం|ఎప్పుడు|తెరి/i,
  location: /where|address|location|directions|map|कहाँ|पता|ఎక్కడ|చిరునామా|లొకేషన్/i,
  unsure: /stock|available in|deliver|delivery|documents?|warranty|discount|bulk|party|parking|home visit|वारंटी|డిస్కౌంట్|వారంటీ/i,
  booking: /book|appointment|slot|visit|available|availability|free (this|tonight|tomorrow)|table|trial|demo class|attend|reserve|बुक|अपॉइंटमेंट|स्लॉट|బుక్|అపాయింట్‌మెంట్|స్లాట్/i,
} as const;

export interface Strings {
  greet: (n: string) => string;
  hours: (n: string, h: string) => string;
  price: (list: string) => string;
  location: (n: string, a: string) => string;
  askSlot: string;
  booked: (label: string) => string;
  thanks: (name: string, label: string) => string;
  slotUnavailable: string;
  urgent: string;
  complaint: string;
  advice: string;
  offtopic: (n: string) => string;
  unsure: string;
  ui: {
    placeholder: string;
    send: string;
    chips: { price: string; hours: string; book: string; location: string };
    typing: string;
  };
}

export const STRINGS: Record<Lang, Strings> = {
  en: {
    greet: (n) => `Hi, I'm the automated assistant for ${n}. How can I help?`,
    hours: (n, h) => `${n} is open ${h}. Want me to book a slot?`,
    price: (list) => `Here are some of our prices: ${list}. The final price is confirmed by our staff. Want to book?`,
    location: (n, a) => `${n} is in ${a}. I can share the location on WhatsApp once you book a slot.`,
    askSlot: "Sure. Which slot suits you? Pick one or type a day and time.",
    booked: (l) => `Booked: ${l}. May I have your name?`,
    thanks: (nm, l) => `Thanks, ${nm}. You will get a reminder before ${l}. See you then.`,
    slotUnavailable: "I could not find that slot. Please pick one of these:",
    urgent: "This sounds urgent. I have alerted our team to contact you now. If it is an emergency, please call your local emergency number straight away.",
    complaint: "I am sorry about that. I have passed this to our team and someone will contact you personally.",
    advice: "I cannot give medical, legal or financial advice. Our team can speak with you. Shall I book a slot?",
    offtopic: (n) => `I can only help with questions about ${n}, like prices, timings and bookings.`,
    unsure: "I am not sure about that, so I have asked our team to confirm. They will reply here.",
    ui: { placeholder: "Type a message", send: "Send", chips: { price: "What are your prices?", hours: "What are your timings?", book: "I want to book a slot", location: "Where are you?" }, typing: "typing" },
  },
  te: {
    greet: (n) => `నమస్కారం, నేను ${n} యొక్క ఆటోమేటెడ్ అసిస్టెంట్‌ని. మీకు ఎలా సహాయం చేయగలను?`,
    hours: (n, h) => `${n} ${h} తెరిచి ఉంటుంది. స్లాట్ బుక్ చేయమంటారా?`,
    price: (list) => `మా కొన్ని ధరలు: ${list}. తుది ధరను సిబ్బంది నిర్ధారిస్తారు. బుక్ చేయమంటారా?`,
    location: (n, a) => `${n} ${a}లో ఉంది. స్లాట్ బుక్ చేస్తే లొకేషన్‌ను WhatsApp లో పంపుతాను.`,
    askSlot: "సరే. ఏ స్లాట్ మీకు అనుకూలం? ఒకటి ఎంచుకోండి లేదా రోజు, సమయం టైప్ చేయండి.",
    booked: (l) => `బుక్ అయింది: ${l}. మీ పేరు చెబుతారా?`,
    thanks: (nm, l) => `ధన్యవాదాలు, ${nm}. ${l}కు ముందు రిమైండర్ వస్తుంది. అప్పుడు కలుద్దాం.`,
    slotUnavailable: "ఆ స్లాట్ దొరకలేదు. దయచేసి వీటిలో ఒకటి ఎంచుకోండి:",
    urgent: "ఇది అత్యవసరంగా అనిపిస్తోంది. మా బృందానికి వెంటనే తెలియజేశాను, వారు మిమ్మల్ని సంప్రదిస్తారు. ఇది అత్యవసర పరిస్థితి అయితే వెంటనే మీ స్థానిక అత్యవసర నంబర్‌కు కాల్ చేయండి.",
    complaint: "క్షమించండి. దీన్ని మా బృందానికి పంపాను, ఎవరైనా మిమ్మల్ని వ్యక్తిగతంగా సంప్రదిస్తారు.",
    advice: "నేను వైద్య, న్యాయ లేదా ఆర్థిక సలహా ఇవ్వలేను. మా బృందం మీతో మాట్లాడగలదు. స్లాట్ బుక్ చేయమంటారా?",
    offtopic: (n) => `${n} గురించిన ప్రశ్నలకు మాత్రమే నేను సహాయం చేయగలను, ఉదా. ధరలు, సమయాలు, బుకింగ్.`,
    unsure: "దీని గురించి నాకు ఖచ్చితంగా తెలియదు, అందుకే మా బృందాన్ని నిర్ధారించమని అడిగాను. వారు ఇక్కడే సమాధానం ఇస్తారు.",
    ui: { placeholder: "సందేశం టైప్ చేయండి", send: "పంపండి", chips: { price: "ధరలు ఎంత?", hours: "సమయాలు ఏమిటి?", book: "స్లాట్ బుక్ చేయాలి", location: "మీరు ఎక్కడ ఉన్నారు?" }, typing: "టైప్ చేస్తోంది" },
  },
  hi: {
    greet: (n) => `नमस्ते, मैं ${n} का ऑटोमैटेड असिस्टेंट हूँ। मैं आपकी कैसे मदद कर सकता हूँ?`,
    hours: (n, h) => `${n} ${h} खुला रहता है। क्या मैं स्लॉट बुक कर दूँ?`,
    price: (list) => `हमारी कुछ कीमतें: ${list}। अंतिम कीमत स्टाफ़ पुष्टि करेगा। बुक करना चाहेंगे?`,
    location: (n, a) => `${n} ${a} में है। स्लॉट बुक करने पर मैं लोकेशन WhatsApp पर भेज दूँगा।`,
    askSlot: "ज़रूर। कौन-सा स्लॉट ठीक रहेगा? एक चुनें या दिन और समय लिखें।",
    booked: (l) => `बुक हो गया: ${l}। कृपया अपना नाम बताएँ?`,
    thanks: (nm, l) => `धन्यवाद, ${nm}। ${l} से पहले आपको रिमाइंडर मिलेगा। मिलते हैं।`,
    slotUnavailable: "वह स्लॉट नहीं मिला। कृपया इनमें से चुनें:",
    urgent: "यह ज़रूरी लग रहा है। मैंने हमारी टीम को अभी आपसे संपर्क करने के लिए बताया है। अगर यह आपात स्थिति है, तो कृपया तुरंत अपने स्थानीय आपातकालीन नंबर पर कॉल करें।",
    complaint: "इसके लिए खेद है। मैंने यह हमारी टीम को भेज दिया है, कोई आपसे व्यक्तिगत रूप से संपर्क करेगा।",
    advice: "मैं चिकित्सा, कानूनी या वित्तीय सलाह नहीं दे सकता। हमारी टीम आपसे बात कर सकती है। क्या स्लॉट बुक कर दूँ?",
    offtopic: (n) => `मैं सिर्फ़ ${n} से जुड़े सवालों में मदद कर सकता हूँ, जैसे कीमत, समय और बुकिंग।`,
    unsure: "इस बारे में मुझे पक्का पता नहीं है, इसलिए मैंने हमारी टीम से पुष्टि करने को कहा है। वे यहीं जवाब देंगे।",
    ui: { placeholder: "संदेश लिखें", send: "भेजें", chips: { price: "कीमत क्या है?", hours: "समय क्या है?", book: "स्लॉट बुक करना है", location: "आप कहाँ हैं?" }, typing: "लिख रहा है" },
  },
};

import os
import json
import re
from pathlib import Path
from datetime import datetime

from flask import Flask, jsonify, request, send_from_directory
from dotenv import load_dotenv
from PIL import Image
import torch
import torch.nn as nn
from torchvision import models, transforms
from transformers import pipeline
from supabase import create_client
from huggingface_hub import hf_hub_download

# =========================================================
# CROPCARE AI — BACKEND
# Disease detection + Pest detection + Chat + Supabase
# =========================================================

BACKEND_DIR = Path(__file__).resolve().parent
BASE_DIR = BACKEND_DIR.parent
UPLOAD_DIR = BACKEND_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv(BACKEND_DIR / ".env")
load_dotenv()

app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024


# =========================================================
# MODELS
# =========================================================

MODEL_NAME = os.getenv(
    "CROPCARE_MODEL",
    "kimcomehome/plantvillage-vit-leaf-disease"
)

PEST_MODEL_NAME = os.getenv(
    "CROPCARE_PEST_MODEL",
    "Yashwanth1508/AgroAI-pest-detection"
)

PEST_CONFIDENCE = float(
    os.getenv("CROPCARE_PEST_CONFIDENCE", "0.50")
)

HF_MODEL_REPO = "tasmi-0609/cropcare-ai-models"

INDOOR_MODEL_PATH = Path(
    hf_hub_download(
        repo_id=HF_MODEL_REPO,
        filename="indoor_model.pth",
        token=os.getenv("HF_TOKEN"),
    )
)

INDOOR_CLASSES_PATH = Path(
    hf_hub_download(
        repo_id=HF_MODEL_REPO,
        filename="indoor_classes.json",
        token=os.getenv("HF_TOKEN"),
    )
)

PLANTDOC_PLANTWILD_MODEL_PATH = Path(
    hf_hub_download(
        repo_id=HF_MODEL_REPO,
        filename="plantdoc_plantwild_model.pth",
        token=os.getenv("HF_TOKEN"),
    )
)

PLANTDOC_PLANTWILD_CLASSES_PATH = Path(
    hf_hub_download(
        repo_id=HF_MODEL_REPO,
        filename="plantdoc_plantwild_classes.json",
        token=os.getenv("HF_TOKEN"),
    )
)
# Plant species supported by the PlantVillage classifier.
# These keys must match the plant names used by the frontend selector.
PLANTVILLAGE_PLANT_ALIASES = {
    "apple": ["apple"],
    "blueberry": ["blueberry"],
    "cherry": ["cherry"],
    "corn": ["corn"],
    "grape": ["grape"],
    "orange": ["orange"],
    "peach": ["peach"],
    "bell pepper": ["pepperbell", "bellpepper", "pepperbell"],
    "potato": ["potato"],
    "raspberry": ["raspberry"],
    "soybean": ["soybean"],
    "squash": ["squash"],
    "strawberry": ["strawberry"],
    "tomato": ["tomato"],
}

GENERAL_IMAGE_SIZE = 224
GENERAL_MEAN = [0.485, 0.456, 0.406]
GENERAL_STD = [0.229, 0.224, 0.225]

INDOOR_IMAGE_SIZE = 224
INDOOR_MEAN = [0.485, 0.456, 0.406]
INDOOR_STD = [0.229, 0.224, 0.225]

_indoor_model = None
_indoor_classes = None
_general_model = None
_general_classes = None
_general_transform = transforms.Compose([
    transforms.Resize((GENERAL_IMAGE_SIZE, GENERAL_IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(GENERAL_MEAN, GENERAL_STD),
])

_indoor_transform = transforms.Compose([
    transforms.Resize((INDOOR_IMAGE_SIZE, INDOOR_IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(INDOOR_MEAN, INDOOR_STD),
])

_disease_classifier = None
_pest_detector = None


def get_classifier():
    global _disease_classifier

    if _disease_classifier is None:
        _disease_classifier = pipeline(
            "image-classification",
            model=MODEL_NAME
        )

    return _disease_classifier


def get_indoor_model():
    global _indoor_model, _indoor_classes

    if _indoor_model is None:
        if not INDOOR_MODEL_PATH.exists():
            raise FileNotFoundError(f"Indoor model not found: {INDOOR_MODEL_PATH}")
        if not INDOOR_CLASSES_PATH.exists():
            raise FileNotFoundError(f"Indoor class file not found: {INDOOR_CLASSES_PATH}")

        with open(INDOOR_CLASSES_PATH, "r", encoding="utf-8") as file:
            _indoor_classes = json.load(file)

        model = models.mobilenet_v3_small(weights=None)
        model.classifier[3] = nn.Linear(
            model.classifier[3].in_features,
            len(_indoor_classes),
        )

        state_dict = torch.load(INDOOR_MODEL_PATH, map_location="cpu")
        model.load_state_dict(state_dict)
        model.eval()
        _indoor_model = model

    return _indoor_model, _indoor_classes


def get_general_model():
    global _general_model, _general_classes

    if _general_model is None:
        if not PLANTDOC_PLANTWILD_MODEL_PATH.exists():
            raise FileNotFoundError(
                f"PlantDoc + PlantWild model not found: {PLANTDOC_PLANTWILD_MODEL_PATH}"
            )
        if not PLANTDOC_PLANTWILD_CLASSES_PATH.exists():
            raise FileNotFoundError(
                f"PlantDoc + PlantWild class file not found: {PLANTDOC_PLANTWILD_CLASSES_PATH}"
            )

        with open(PLANTDOC_PLANTWILD_CLASSES_PATH, "r", encoding="utf-8") as file:
            _general_classes = json.load(file)

        model = models.mobilenet_v3_small(weights=None)
        model.classifier[3] = nn.Linear(
            model.classifier[3].in_features,
            len(_general_classes),
        )

        state_dict = torch.load(
            PLANTDOC_PLANTWILD_MODEL_PATH,
            map_location="cpu",
        )
        model.load_state_dict(state_dict)
        model.eval()
        _general_model = model

    return _general_model, _general_classes


def _normalize_label(value):
    """Normalize a model/plant label for robust comparisons."""
    return "".join(
        character
        for character in str(value).lower()
        if character.isalnum()
    )


def _plantvillage_matches(label, plant_name):
    """Check whether a PlantVillage label belongs to the selected plant."""
    plant_key = str(plant_name or "").strip().lower()
    aliases = PLANTVILLAGE_PLANT_ALIASES.get(plant_key, [])

    if not aliases:
        return False

    normalized = _normalize_label(label)

    return any(
        normalized.startswith(alias) or alias in normalized
        for alias in aliases
    )


def predict_plantvillage(image, plant_name):
    """
    Run the PlantVillage classifier and filter results to the selected plant.

    This prevents a Strawberry upload from being displayed as Tomato simply
    because Tomato received the highest score across all PlantVillage classes.
    """
    classifier = get_classifier()

    # PlantVillage has 38 classes; request them all so the selected plant's
    # classes can be found before filtering.
    results = classifier(
        image,
        top_k=38,
    )

    selected_results = [
        item
        for item in results
        if _plantvillage_matches(
            item.get("label", ""),
            plant_name,
        )
    ]

    # For a PlantVillage-supported plant, only return that plant's classes.
    if selected_results:
        results = selected_results

    predictions = [
        {
            "label": str(item.get("label", "Unknown")),
            "score": round(float(item.get("score", 0)) * 100, 2),
        }
        for item in results[:5]
    ]

    if not predictions:
        predictions = [
            {
                "label": "Unknown",
                "score": 0.0,
            }
        ]

    return (
        predictions[0]["label"],
        predictions[0]["score"],
        predictions,
    )


def predict_general(image):
    model, classes = get_general_model()
    image_tensor = _general_transform(image).unsqueeze(0)

    with torch.no_grad():
        probabilities = torch.softmax(model(image_tensor), dim=1)[0]

    top_k = min(5, len(classes))
    scores, indices = torch.topk(probabilities, top_k)

    predictions = [
        {
            "label": classes[index],
            "score": round(float(score) * 100, 2),
        }
        for score, index in zip(scores.tolist(), indices.tolist())
    ]

    return predictions[0]["label"], predictions[0]["score"], predictions


def predict_indoor(image):
    model, classes = get_indoor_model()
    image_tensor = _indoor_transform(image).unsqueeze(0)

    with torch.no_grad():
        probabilities = torch.softmax(model(image_tensor), dim=1)[0]

    top_k = min(5, len(classes))
    scores, indices = torch.topk(probabilities, top_k)

    predictions = [
        {
            "label": classes[index],
            "score": round(float(score) * 100, 2),
        }
        for score, index in zip(scores.tolist(), indices.tolist())
    ]

    return predictions[0]["label"], predictions[0]["score"], predictions


INDOOR_INFO = {
    "Money_Plant_Bacterial_wilt_disease": ("Money Plant", "Bacterial Wilt Disease"),
    "Money_Plant_Healthy": ("Money Plant", "Healthy"),
    "Money_Plant_Manganese_Toxicity": ("Money Plant", "Manganese Toxicity"),
    "Snake_Plant_Anthracnose": ("Snake Plant", "Anthracnose"),
    "Snake_Plant_Healthy": ("Snake Plant", "Healthy"),
    "Snake_Plant_Leaf_Withering": ("Snake Plant", "Leaf Withering"),
    "Spider_Plant_Fungal_leaf_spot": ("Spider Plant", "Fungal Leaf Spot"),
    "Spider_Plant_Healthy": ("Spider Plant", "Healthy"),
    "Spider_Plant_Leaf_Tip_Necrosis": ("Spider Plant", "Leaf Tip Necrosis"),
}


def get_indoor_info(label):
    return INDOOR_INFO.get(
        label,
        ("Indoor Plant", label.replace("_", " ")),
    )


def get_pest_detector():
    global _pest_detector

    if _pest_detector is None:
        from ultralytics import YOLO

        _pest_detector = YOLO(
    "https://huggingface.co/Yashwanth1508/AgroAI-pest-detection/resolve/main/best.pt"
         )

    return _pest_detector


# =========================================================
# SUPABASE
# =========================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = (
    os.getenv("SUPABASE_SECRET_KEY")
    or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_KEY")
)

supabase = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(
            SUPABASE_URL,
            SUPABASE_KEY
        )
    except Exception as exc:
        print("Supabase connection error:", exc)


# =========================================================
# LANGUAGE DATA
# =========================================================

LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "gu": "Gujarati",
    "bn": "Bengali",
    "ta": "Tamil",
    "te": "Telugu",
    "kn": "Kannada",
    "ml": "Malayalam",
    "pa": "Punjabi",
}


CHAT_TEXT = {
    "en": {
        "general": "I can help with plant symptoms, watering, sunlight, prevention and recovery.",
        "water": "Water according to the plant's needs and avoid keeping the soil constantly waterlogged.",
        "light": "Check the plant's light requirement and avoid sudden changes in light exposure.",
        "symptoms": "Watch for changes in leaf color, spots, wilting, holes, curling, unusual growth or spreading damage.",
        "recovery": "Start with simple care: isolate the affected plant when practical, remove severely affected material when appropriate, improve airflow, avoid overwatering and monitor new growth.",
        "pest": "Inspect the leaves, stems and undersides of leaves for insects or feeding damage. Keep affected plants separated when practical and monitor closely.",
    },
    "hi": {
        "general": "मैं पौधों के लक्षण, पानी, धूप, रोकथाम और सुधार के बारे में मदद कर सकता हूँ।",
        "water": "पौधे की जरूरत के अनुसार पानी दें और मिट्टी को लगातार बहुत गीला न रखें।",
        "light": "पौधे की रोशनी की जरूरत देखें और रोशनी में अचानक बदलाव से बचें।",
        "symptoms": "पत्तियों का रंग बदलना, धब्बे, मुरझाना, छेद, मुड़ना या फैलता हुआ नुकसान देखें।",
        "recovery": "सरल देखभाल से शुरू करें: संभव हो तो प्रभावित पौधे को अलग रखें, जरूरत होने पर बहुत प्रभावित हिस्से हटाएं, हवा का संचार बढ़ाएं, अधिक पानी से बचें और नई वृद्धि पर नजर रखें।",
        "pest": "पत्तियों, तनों और पत्तियों की नीचे की सतह पर कीट या खाने के निशान देखें। संभव हो तो प्रभावित पौधे को अलग रखें और निगरानी करें।",
    },
    "mr": {
        "general": "मी वनस्पतींची लक्षणे, पाणी, सूर्यप्रकाश, प्रतिबंध आणि सुधारणा याबद्दल मदत करू शकतो.",
        "water": "वनस्पतीच्या गरजेनुसार पाणी द्या आणि माती सतत खूप ओली ठेवू नका.",
        "light": "वनस्पतीला किती प्रकाश हवा ते तपासा आणि प्रकाशात अचानक बदल टाळा.",
        "symptoms": "पानांचा रंग बदलणे, डाग, कोमेजणे, छिद्रे, वाकणे किंवा वाढणारे नुकसान तपासा.",
        "recovery": "सोप्या काळजीपासून सुरुवात करा: शक्य असल्यास प्रभावित वनस्पती वेगळी ठेवा, गरज असल्यास जास्त प्रभावित भाग काढा, हवा खेळती ठेवा, जास्त पाणी टाळा आणि नवीन वाढ तपासा.",
        "pest": "पाने, खोड आणि पानांच्या खालच्या बाजूस कीटक किंवा खाण्याच्या खुणा तपासा. शक्य असल्यास प्रभावित वनस्पती वेगळी ठेवा.",
    },
    "gu": {
        "general": "હું છોડના લક્ષણો, પાણી, સૂર્યપ્રકાશ, નિવારણ અને સુધારા વિશે મદદ કરી શકું છું.",
        "water": "છોડની જરૂરિયાત મુજબ પાણી આપો અને માટીને સતત ખૂબ ભીની ન રાખો.",
        "light": "છોડને જરૂરી પ્રકાશ તપાસો અને પ્રકાશમાં અચાનક ફેરફાર ટાળો.",
        "symptoms": "પાંદડાનો રંગ બદલાવ, ડાઘ, સુકાવું, છિદ્રો, વળાંક અથવા વધતું નુકસાન તપાસો.",
        "recovery": "સરળ સંભાળથી શરૂ કરો: શક્ય હોય તો અસરગ્રસ્ત છોડને અલગ રાખો, જરૂર હોય તો વધારે અસરગ્રસ્ત ભાગ દૂર કરો, હવાની અવરજવર રાખો, વધુ પાણી ટાળો અને નવી વૃદ્ધિ જુઓ.",
        "pest": "પાંદડા, ડાંઠ અને પાંદડાની નીચેની બાજુએ જીવાત અથવા ખાવાના નિશાન તપાસો. શક્ય હોય તો અસરગ્રસ્ત છોડને અલગ રાખો.",
    },
    "bn": {
        "general": "আমি গাছের লক্ষণ, পানি, আলো, প্রতিরোধ এবং পুনরুদ্ধার সম্পর্কে সাহায্য করতে পারি।",
        "water": "গাছের প্রয়োজন অনুযায়ী পানি দিন এবং মাটি সবসময় অতিরিক্ত ভেজা রাখবেন না।",
        "light": "গাছের আলোর প্রয়োজন দেখুন এবং আলোতে হঠাৎ পরিবর্তন এড়িয়ে চলুন।",
        "symptoms": "পাতার রং পরিবর্তন, দাগ, ঝিমিয়ে পড়া, ছিদ্র, পাতা মোড়ানো বা ছড়িয়ে পড়া ক্ষতি দেখুন।",
        "recovery": "সহজ যত্ন দিয়ে শুরু করুন: সম্ভব হলে আক্রান্ত গাছ আলাদা রাখুন, প্রয়োজন হলে বেশি আক্রান্ত অংশ সরান, বাতাস চলাচল বাড়ান, অতিরিক্ত পানি এড়িয়ে চলুন এবং নতুন বৃদ্ধি পর্যবেক্ষণ করুন।",
        "pest": "পাতা, কাণ্ড এবং পাতার নিচে পোকা বা খাওয়ার দাগ দেখুন। সম্ভব হলে আক্রান্ত গাছ আলাদা রাখুন এবং পর্যবেক্ষণ করুন।",
    },
    "ta": {
        "general": "தாவர அறிகுறிகள், நீர், சூரியஒளி, தடுப்பு மற்றும் மீட்பு பற்றி நான் உதவ முடியும்.",
        "water": "தாவரத்தின் தேவைக்கேற்ப நீர் ஊற்றுங்கள்; மண்ணை எப்போதும் அதிக ஈரமாக வைத்திருக்க வேண்டாம்.",
        "light": "தாவரத்திற்கு தேவையான ஒளியை அறிந்து, ஒளியில் திடீர் மாற்றங்களைத் தவிர்க்கவும்.",
        "symptoms": "இலை நிறமாற்றம், புள்ளிகள், வாடுதல், துளைகள், சுருட்டல் அல்லது பரவும் சேதத்தை கவனிக்கவும்.",
        "recovery": "எளிய பராமரிப்பில் தொடங்குங்கள்: முடிந்தால் பாதிக்கப்பட்ட தாவரத்தை தனியாக வைக்கவும், தேவையானால் அதிகம் பாதிக்கப்பட்ட பகுதிகளை அகற்றவும், காற்றோட்டத்தை அதிகரிக்கவும், அதிக நீரைத் தவிர்க்கவும்.",
        "pest": "இலைகள், தண்டு மற்றும் இலைகளின் கீழ்புறத்தில் பூச்சிகள் அல்லது உணவுச் சேதத்தைப் பாருங்கள். முடிந்தால் பாதிக்கப்பட்ட தாவரத்தை தனியாக வைக்கவும்.",
    },
    "te": {
        "general": "మొక్క లక్షణాలు, నీరు, సూర్యకాంతి, నివారణ మరియు పునరుద్ధరణ గురించి నేను సహాయం చేయగలను.",
        "water": "మొక్క అవసరానికి అనుగుణంగా నీరు ఇవ్వండి; మట్టిని ఎప్పుడూ ఎక్కువగా తడిగా ఉంచవద్దు.",
        "light": "మొక్కకు అవసరమైన కాంతిని తెలుసుకుని, కాంతిలో అకస్మాత్తు మార్పులను నివారించండి.",
        "symptoms": "ఆకుల రంగు మారడం, మచ్చలు, వాడిపోవడం, రంధ్రాలు, ముడుచుకోవడం లేదా వ్యాప్తి చెందుతున్న నష్టాన్ని గమనించండి.",
        "recovery": "సాధారణ సంరక్షణతో ప్రారంభించండి: వీలైతే ప్రభావిత మొక్కను వేరు చేయండి, అవసరమైతే ఎక్కువగా దెబ్బతిన్న భాగాలను తొలగించండి, గాలి ప్రసరణ పెంచండి మరియు అధిక నీటిని నివారించండి.",
        "pest": "ఆకులు, కాండం మరియు ఆకుల కింది భాగంలో పురుగులు లేదా తినివేసిన గుర్తులు చూడండి. వీలైతే ప్రభావిత మొక్కను వేరు చేయండి.",
    },
    "kn": {
        "general": "ಸಸ್ಯದ ಲಕ್ಷಣಗಳು, ನೀರು, ಸೂರ್ಯಪ್ರಕಾಶ, ತಡೆಗಟ್ಟುವಿಕೆ ಮತ್ತು ಚೇತರಿಕೆಯ ಬಗ್ಗೆ ನಾನು ಸಹಾಯ ಮಾಡಬಹುದು.",
        "water": "ಸಸ್ಯದ ಅಗತ್ಯಕ್ಕೆ ಅನುಗುಣವಾಗಿ ನೀರು ನೀಡಿ ಮತ್ತು ಮಣ್ಣನ್ನು ಸದಾ ತುಂಬಾ ತೇವವಾಗಿರಿಸಬೇಡಿ.",
        "light": "ಸಸ್ಯಕ್ಕೆ ಬೇಕಾದ ಬೆಳಕನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಬೆಳಕಿನಲ್ಲಿ ಹಠಾತ್ ಬದಲಾವಣೆಗಳನ್ನು ತಪ್ಪಿಸಿ.",
        "symptoms": "ಎಲೆಗಳ ಬಣ್ಣ ಬದಲಾವಣೆ, ಕಲೆಗಳು, ಒಣಗುವುದು, ರಂಧ್ರಗಳು, ಮುದುಡುವಿಕೆ ಅಥವಾ ಹರಡುವ ಹಾನಿಯನ್ನು ಗಮನಿಸಿ.",
        "recovery": "ಸರಳ ಆರೈಕೆಯಿಂದ ಪ್ರಾರಂಭಿಸಿ: ಸಾಧ್ಯವಾದರೆ ಬಾಧಿತ ಸಸ್ಯವನ್ನು ಬೇರ್ಪಡಿಸಿ, ಅಗತ್ಯವಿದ್ದರೆ ಹೆಚ್ಚು ಬಾಧಿತ ಭಾಗಗಳನ್ನು ತೆಗೆದುಹಾಕಿ, ಗಾಳಿಯ ಹರಿವು ಹೆಚ್ಚಿಸಿ ಮತ್ತು ಹೆಚ್ಚು ನೀರು ತಪ್ಪಿಸಿ.",
        "pest": "ಎಲೆಗಳು, ಕಾಂಡ ಮತ್ತು ಎಲೆಗಳ ಕೆಳಭಾಗದಲ್ಲಿ ಕೀಟಗಳು ಅಥವಾ ತಿನ್ನುವ ಗುರುತುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ. ಸಾಧ್ಯವಾದರೆ ಬಾಧಿತ ಸಸ್ಯವನ್ನು ಬೇರ್ಪಡಿಸಿ.",
    },
    "ml": {
        "general": "സസ്യലക്ഷണങ്ങൾ, വെള്ളം, സൂര്യപ്രകാശം, പ്രതിരോധം, വീണ്ടെടുക്കൽ എന്നിവയിൽ ഞാൻ സഹായിക്കാം.",
        "water": "ചെടിയുടെ ആവശ്യത്തിന് അനുസരിച്ച് വെള്ളം നൽകുക; മണ്ണ് എല്ലായ്പ്പോഴും അമിതമായി നനഞ്ഞിരിക്കരുത്.",
        "light": "ചെടിക്ക് ആവശ്യമായ വെളിച്ചം പരിശോധിക്കുകയും വെളിച്ചത്തിൽ പെട്ടെന്നുള്ള മാറ്റങ്ങൾ ഒഴിവാക്കുകയും ചെയ്യുക.",
        "symptoms": "ഇലയുടെ നിറമാറ്റം, പാടുകൾ, വാടൽ, തുളകൾ, ചുരുണ്ട ഇലകൾ അല്ലെങ്കിൽ പടരുന്ന കേടുപാടുകൾ ശ്രദ്ധിക്കുക.",
        "recovery": "ലളിതമായ പരിചരണത്തിൽ തുടങ്ങുക: സാധ്യമെങ്കിൽ ബാധിച്ച ചെടി വേർതിരിക്കുക, ആവശ്യമായാൽ ഗുരുതരമായി ബാധിച്ച ഭാഗങ്ങൾ നീക്കം ചെയ്യുക, വായുസഞ്ചാരം വർധിപ്പിക്കുക, അമിത ജലം ഒഴിവാക്കുക.",
        "pest": "ഇലകൾ, തണ്ട്, ഇലകളുടെ അടിഭാഗം എന്നിവയിൽ കീടങ്ങളോ ഭക്ഷണനാശത്തിന്റെ അടയാളങ്ങളോ പരിശോധിക്കുക. സാധ്യമെങ്കിൽ ബാധിച്ച ചെടി വേർതിരിക്കുക.",
    },
    "pa": {
        "general": "ਮੈਂ ਪੌਦੇ ਦੇ ਲੱਛਣਾਂ, ਪਾਣੀ, ਧੁੱਪ, ਰੋਕਥਾਮ ਅਤੇ ਸੁਧਾਰ ਬਾਰੇ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।",
        "water": "ਪੌਦੇ ਦੀ ਲੋੜ ਅਨੁਸਾਰ ਪਾਣੀ ਦਿਓ ਅਤੇ ਮਿੱਟੀ ਨੂੰ ਹਮੇਸ਼ਾ ਬਹੁਤ ਗਿੱਲੀ ਨਾ ਰੱਖੋ।",
        "light": "ਪੌਦੇ ਦੀ ਰੌਸ਼ਨੀ ਦੀ ਲੋੜ ਵੇਖੋ ਅਤੇ ਰੌਸ਼ਨੀ ਵਿੱਚ ਅਚਾਨਕ ਬਦਲਾਅ ਤੋਂ ਬਚੋ।",
        "symptoms": "ਪੱਤਿਆਂ ਦਾ ਰੰਗ ਬਦਲਣਾ, ਧੱਬੇ, ਮੁਰਝਾਉਣਾ, ਛੇਦ, ਮੁੜਨਾ ਜਾਂ ਫੈਲਦਾ ਨੁਕਸਾਨ ਵੇਖੋ।",
        "recovery": "ਸਧਾਰਣ ਦੇਖਭਾਲ ਨਾਲ ਸ਼ੁਰੂ ਕਰੋ: ਸੰਭਵ ਹੋਵੇ ਤਾਂ ਪ੍ਰਭਾਵਿਤ ਪੌਦੇ ਨੂੰ ਵੱਖ ਰੱਖੋ, ਲੋੜ ਹੋਣ 'ਤੇ ਜ਼ਿਆਦਾ ਪ੍ਰਭਾਵਿਤ ਹਿੱਸੇ ਹਟਾਓ, ਹਵਾ ਦੀ ਆਵਾਜਾਈ ਵਧਾਓ ਅਤੇ ਜ਼ਿਆਦਾ ਪਾਣੀ ਤੋਂ ਬਚੋ।",
        "pest": "ਪੱਤਿਆਂ, ਤਣਿਆਂ ਅਤੇ ਪੱਤਿਆਂ ਦੇ ਹੇਠਲੇ ਪਾਸੇ ਕੀੜੇ ਜਾਂ ਖਾਣ ਦੇ ਨਿਸ਼ਾਨ ਵੇਖੋ। ਸੰਭਵ ਹੋਵੇ ਤਾਂ ਪ੍ਰਭਾਵਿਤ ਪੌਦੇ ਨੂੰ ਵੱਖ ਰੱਖੋ।",
    },
}


# =========================================================
# RECOVERY
# =========================================================

def get_recovery_steps(crop_name, disease_name):
    crop = (crop_name or "").lower()
    disease = (disease_name or "").lower()

    if "tomato" in crop:
        if "healthy" in disease:
            return [
                "Continue regular watering without overwatering.",
                "Provide adequate sunlight.",
                "Maintain healthy, well-drained soil.",
                "Support good airflow around the plant.",
                "Check leaves and fruits regularly for changes.",
            ]
        if "early blight" in disease:
            return [
                "Remove severely affected leaves when appropriate.",
                "Avoid splashing water onto foliage.",
                "Water near the base of the plant.",
                "Improve airflow and avoid overcrowding.",
                "Remove fallen affected leaves.",
                "Monitor new leaves for spreading symptoms.",
            ]
        if "late blight" in disease:
            return [
                "Remove severely affected plant material when appropriate.",
                "Avoid overhead watering.",
                "Keep foliage as dry as practical.",
                "Improve air circulation.",
                "Monitor nearby plants for similar symptoms.",
            ]

    if "potato" in crop:
        return [
            "Remove severely affected leaves when appropriate.",
            "Avoid watering foliage directly.",
            "Maintain good airflow around plants.",
            "Keep infected plant debris away from healthy plants.",
            "Monitor new leaves for spreading symptoms.",
        ]

    if "pepper" in crop:
        return [
            "Remove severely affected leaves when appropriate.",
            "Avoid excessive moisture on foliage.",
            "Water near the base of the plant.",
            "Maintain good airflow.",
            "Monitor new leaves and fruits for changes.",
        ]

    if "money plant" in crop:
        if "healthy" in disease:
            return [
                "Continue regular watering while allowing the growing medium to drain well.",
                "Provide suitable indirect light.",
                "Avoid keeping the roots constantly waterlogged.",
                "Inspect leaves and stems regularly for changes.",
            ]
        if "bacterial wilt" in disease:
            return [
                "Isolate the affected plant when practical.",
                "Remove severely affected material with clean tools.",
                "Avoid overhead watering and keep foliage as dry as practical.",
                "Improve drainage and airflow around the plant.",
                "Monitor nearby plants for similar symptoms.",
            ]
        if "manganese toxicity" in disease:
            return [
                "Review recent fertilizer and micronutrient applications.",
                "Avoid adding extra micronutrient fertilizer until the cause is reviewed.",
                "Keep the growing medium well drained.",
                "Monitor new leaves after correcting the growing conditions.",
            ]

    if "snake plant" in crop:
        if "healthy" in disease:
            return [
                "Continue moderate watering and allow the growing medium to dry between waterings.",
                "Provide suitable indirect light.",
                "Keep the pot well drained.",
                "Check leaves regularly for spots or wilting.",
            ]
        if "anthracnose" in disease:
            return [
                "Isolate the affected plant when practical.",
                "Remove severely affected leaves with clean tools.",
                "Keep foliage dry and avoid overhead watering.",
                "Improve airflow around the plant.",
                "Monitor new leaves for spreading spots.",
            ]
        if "withering" in disease:
            return [
                "Check the growing medium for excessive dryness or prolonged wetness.",
                "Check the roots and pot drainage if the plant continues to wilt.",
                "Provide suitable light and avoid sudden environmental changes.",
                "Monitor new growth after correcting watering and drainage.",
            ]

    if "spider plant" in crop:
        if "healthy" in disease:
            return [
                "Continue regular care with suitable indirect light.",
                "Water when the growing medium needs it and avoid waterlogging.",
                "Maintain good airflow.",
                "Inspect leaves regularly for spots or tip damage.",
            ]
        if "fungal leaf spot" in disease:
            return [
                "Isolate the affected plant when practical.",
                "Remove severely affected leaves with clean tools.",
                "Avoid wetting the foliage during watering.",
                "Improve airflow and reduce prolonged leaf moisture.",
                "Monitor new leaves for spreading spots.",
            ]
        if "tip necrosis" in disease:
            return [
                "Check watering consistency and pot drainage.",
                "Review fertilizer or salt buildup in the growing medium.",
                "Provide suitable humidity and avoid harsh environmental changes.",
                "Trim severely damaged tips if desired and monitor new growth.",
            ]

    return [
        "Remove severely affected leaves when appropriate.",
        "Avoid excessive watering.",
        "Maintain good airflow around the plant.",
        "Keep the growing area clean.",
        "Monitor the plant for changes.",
        "Upload another clear image if the condition changes.",
    ]


# =========================================================
# PEST DETECTION
# =========================================================

def detect_pests(pil_image):
    """Detect visible insect pests using the YOLO IP102 model."""

    detector = get_pest_detector()

    def collect(results):
        found = []

        for result in results:
            boxes = getattr(result, "boxes", None)

            if boxes is None:
                continue

            names = getattr(result, "names", {})

            for box in boxes:
                confidence = float(box.conf[0].item())
                class_id = int(box.cls[0].item())

                if isinstance(names, dict):
                    pest_name = names.get(
                        class_id,
                        f"Class {class_id}"
                    )
                else:
                    pest_name = str(class_id)

                xyxy = [
                    round(float(value), 2)
                    for value in box.xyxy[0].tolist()
                ]

                found.append({
                    "name": str(pest_name).replace("_", " "),
                    "confidence": round(confidence * 100, 2),
                    "box": xyxy,
                })

        return found

    # First pass: sensitive detection at a large image size.
    results = detector.predict(
        source=pil_image,
        imgsz=896,
        conf=0.10,
        iou=0.50,
        max_det=20,
        verbose=False,
    )

    detections = collect(results)

    # Fallback: very sensitive pass for small or partially visible insects.
    if not detections:
        results = detector.predict(
            source=pil_image,
            imgsz=1280,
            conf=0.03,
            iou=0.45,
            max_det=20,
            verbose=False,
        )

        detections = collect(results)

    detections.sort(
        key=lambda item: item["confidence"],
        reverse=True,
    )

    return {
        "detected": bool(detections),
        "pests": detections[:10],
        "confidence": (
            detections[0]["confidence"]
            if detections
            else None
        ),
    }


# =========================================================
# FRONTEND ROUTES
# =========================================================

@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "crop.html")


@app.route("/crop.html")
def crop_page():
    return send_from_directory(BASE_DIR, "crop.html")


@app.route("/script.js")
def script():
    return send_from_directory(BASE_DIR, "script.js")


@app.route("/style.css")
def style():
    return send_from_directory(BASE_DIR, "style.css")


# =========================================================
# UPLOAD + DISEASE + PEST ANALYSIS
# =========================================================

@app.route("/upload", methods=["POST"])
def upload_image():
    try:
        if "image" not in request.files:
            return jsonify({
                "success": False,
                "message": "No image received.",
            }), 400

        image = request.files["image"]

        if not image.filename:
            return jsonify({
                "success": False,
                "message": "No image selected.",
            }), 400

        pil_image = Image.open(image.stream).convert("RGB")

        # Resize only for storage/processing safety.
        processing_image = pil_image.copy()
        processing_image.thumbnail((1600, 1600))

        filename = datetime.now().strftime(
            "%Y%m%d_%H%M%S_%f.jpg"
        )
        save_path = UPLOAD_DIR / filename
        processing_image.save(save_path, format="JPEG", quality=90)

        # -----------------------------------------------------
        # DISEASE MODEL ROUTING
        # -----------------------------------------------------
        plant_type = request.form.get("plant_type", "crop").strip().lower()
        plant_name = request.form.get("plant_name", "").strip()
        plant_name_key = plant_name.lower()

        if plant_type == "indoor":
            # Indoor model is ONLY used for the 9 indoor classes it was trained on.
            indoor_label, confidence, predictions = predict_indoor(processing_image)
            crop_name, disease_name = get_indoor_info(indoor_label)
            model_source = "Indoor Plant Disease Model"

        elif plant_name_key in PLANTVILLAGE_PLANT_ALIASES:
            # Use the local PlantDoc + PlantWild model on Render.
            # This avoids loading the much larger PlantVillage Transformer.
            label, confidence, predictions = predict_general(processing_image)

            crop_name = plant_name or "Plant"

            if "___" in label:
                _, disease_name = label.split("___", 1)
                disease_name = disease_name.replace("_", " ").strip()
            else:
                disease_name = label.replace("_", " ").strip()

            model_source = "PlantDoc + PlantWild Model"

        else:
            label, confidence, predictions = predict_general(processing_image)

            crop_name = plant_name

            if not crop_name:
                label_lower = label.lower()

                if "tomato" in label_lower:
                    crop_name = "Tomato"
                elif "potato" in label_lower:
                    crop_name = "Potato"
                elif "pepper" in label_lower:
                    crop_name = "Bell Pepper"
                elif "squash" in label_lower:
                    crop_name = "Squash"
                elif "corn" in label_lower:
                    crop_name = "Corn"
                elif "soybean" in label_lower:
                    crop_name = "Soybean"
                elif "apple" in label_lower:
                    crop_name = "Apple"
                elif "blueberry" in label_lower:
                    crop_name = "Blueberry"
                elif "cherry" in label_lower:
                    crop_name = "Cherry"
                elif "grape" in label_lower:
                    crop_name = "Grape"
                elif "orange" in label_lower:
                    crop_name = "Orange"
                elif "peach" in label_lower:
                    crop_name = "Peach"
                elif "raspberry" in label_lower:
                    crop_name = "Raspberry"
                elif "strawberry" in label_lower:
                    crop_name = "Strawberry"
                else:
                    crop_name = "Plant"

            disease_name = label.replace("_", " ").strip()
            model_source = "PlantDoc + PlantWild Model"

        recovery_steps = get_recovery_steps(
            crop_name,
            disease_name,
        )

        # -----------------------------------------------------
        # PEST MODEL
        # -----------------------------------------------------
        pest_result = {
            "detected": False,
            "pests": [],
            "confidence": None,
        }
        image_url = f"/uploads/{filename}"

        return jsonify({
            "success": True,
            "message": "Image analyzed successfully.",
            "plant_type": plant_type,
            "plant_name": plant_name,
            "model_source": model_source,
            "crop_name": crop_name,
            "disease_name": disease_name,
            "confidence": confidence,
            "predictions": predictions,
            "top_predictions": predictions,
            "recovery_steps": recovery_steps,
            "image_url": image_url,
            "pest_detected": pest_result["detected"],
            "pests": pest_result["pests"],
            "pest_confidence": pest_result["confidence"],
            "pest_detection": pest_result,
        }), 200

    except Exception as exc:
        print("Upload error:", exc)
        return jsonify({
            "success": False,
            "message": str(exc),
        }), 500


# =========================================================
# SERVE UPLOADED IMAGES
# =========================================================

@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_DIR, filename)


# =========================================================
# SAVE PREDICTION
# =========================================================

@app.route("/predict", methods=["POST"])
def save_prediction():
    try:
        data = request.get_json(silent=True) or {}

        crop_name = data.get("crop_name")
        disease_name = data.get("disease_name")
        confidence = data.get("confidence")
        image_url = data.get("image_url")

        if not crop_name or not disease_name or confidence is None:
            return jsonify({
                "success": False,
                "error": "crop_name, disease_name and confidence are required",
            }), 400

        if supabase is None:
            return jsonify({
                "success": False,
                "error": "Supabase is not configured.",
            }), 503

        row = {
            "crop_name": crop_name,
            "disease_name": disease_name,
            "confidence": confidence,
            "image_url": image_url,
        }

        # Do not require pest columns in the existing table.
        result = supabase.table(
            "disease_predictions"
        ).insert(row).execute()

        return jsonify({
            "success": True,
            "message": "Prediction saved successfully.",
            "data": result.data,
        }), 201

    except Exception as exc:
        print("Supabase save error:", exc)
        return jsonify({
            "success": False,
            "error": str(exc),
        }), 500


# =========================================================
# RECOVERY HISTORY
# =========================================================

@app.route("/recovery/<path:crop_name>", methods=["GET"])
def recovery_history(crop_name):
    try:
        if supabase is None:
            return jsonify({
                "success": True,
                "crop_name": crop_name,
                "recovery_steps": get_recovery_steps(crop_name, ""),
                "history": [],
            }), 200

        response = supabase.table(
            "disease_predictions"
        ).select(
            "id,crop_name,disease_name,confidence,image_url,created_at"
        ).eq(
            "crop_name",
            crop_name,
        ).order(
            "created_at",
            desc=True,
        ).limit(10).execute()

        history = response.data or []

        latest_disease = (
            history[0].get("disease_name", "")
            if history
            else ""
        )

        return jsonify({
            "success": True,
            "crop_name": crop_name,
            "recovery_steps": get_recovery_steps(
                crop_name,
                latest_disease,
            ),
            "history": history,
        }), 200

    except Exception as exc:
        print("Recovery history error:", exc)
        return jsonify({
            "success": False,
            "message": str(exc),
        }), 500


# =========================================================
# HISTORY
# =========================================================

@app.route("/history", methods=["GET"])
def history():
    try:
        if supabase is None:
            return jsonify({
                "success": True,
                "history": [],
            }), 200

        response = supabase.table(
            "disease_predictions"
        ).select(
            "id,crop_name,disease_name,confidence,image_url,created_at"
        ).order(
            "created_at",
            desc=True,
        ).limit(50).execute()

        return jsonify({
            "success": True,
            "history": response.data or [],
        }), 200

    except Exception as exc:
        print("History error:", exc)
        return jsonify({
            "success": False,
            "message": str(exc),
        }), 500


# =========================================================
# AI ASSISTANT
# =========================================================

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json(silent=True) or {}

        message = str(data.get("message", "")).strip()
        language = data.get("language", "en")
        language = language if language in LANGUAGES else "en"

        plant_name = (
            data.get("plant_name")
            or data.get("crop")
            or ""
        )
        disease_name = (
            data.get("disease_name")
            or data.get("disease")
            or ""
        )
        pest_name = data.get("pest_name") or ""
        pest_detected = bool(data.get("pest_detected", False))

        if not message:
            return jsonify({
                "success": False,
                "message": "Please enter a question.",
            }), 400

        text = CHAT_TEXT[language]
        lower = message.lower()

        if any(word in lower for word in [
            "pest", "insect", "bug", "कीट", "कीड", "જીવાત", "কীট", "பூச்சி", "పురుగు", "ಕೀಟ", "കീട", "ਕੀੜ"
        ]):
            answer = text["pest"]
        elif any(word in lower for word in [
            "water", "watering", "पानी", "पाणी", "પાણી", "জল", "நீர்", "నీరు", "ನೀರು", "വെള്ളം", "ਪਾਣੀ"
        ]):
            answer = text["water"]
        elif any(word in lower for word in [
            "light", "sun", "sunlight", "धूप", "सूर्य", "સૂર્ય", "আলো", "ஒளி", "కాంతి", "ಬೆಳಕು", "വെളിച്ചം", "ਰੌਸ਼ਨੀ"
        ]):
            answer = text["light"]
        elif any(word in lower for word in [
            "symptom", "yellow", "spot", "wilting", "लक्षण", "पील", "डाग", "લક્ષણ", "লক্ষণ", "அறிகுறி", "లక్షణ", "ಲಕ್ಷಣ", "ലക്ഷണം", "ਲੱਛਣ"
        ]):
            answer = text["symptoms"]
        elif any(word in lower for word in [
            "recover", "recovery", "treat", "care", "उपचार", "सुधार", "સારવાર", "পুনরুদ্ধার", "மீட்பு", "పునరుద్ధరణ", "ಚೇತರಿಕೆ", "വീണ്ടെടുക്കൽ", "ਸੁਧਾਰ"
        ]):
            answer = text["recovery"]
        else:
            answer = text["general"]

        context_parts = []
        if plant_name:
            context_parts.append(str(plant_name))
        if disease_name:
            context_parts.append(str(disease_name))
        if pest_detected and pest_name:
            context_parts.append(str(pest_name))

        if context_parts:
            answer = answer + " " + " • ".join(context_parts)

        return jsonify({
            "success": True,
            "response": answer,
            "answer": answer,
            "reply": answer,
        }), 200

    except Exception as exc:
        print("Chat error:", exc)
        return jsonify({
            "success": False,
            "message": str(exc),
        }), 500


# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "disease_model": MODEL_NAME,
        "indoor_model": str(INDOOR_MODEL_PATH),
        "indoor_model_available": INDOOR_MODEL_PATH.exists() and INDOOR_CLASSES_PATH.exists(),
        "plantdoc_plantwild_model": str(PLANTDOC_PLANTWILD_MODEL_PATH),
        "plantdoc_plantwild_model_available": (
            PLANTDOC_PLANTWILD_MODEL_PATH.exists()
            and PLANTDOC_PLANTWILD_CLASSES_PATH.exists()
        ),
        "plantvillage_model": MODEL_NAME,
        "pest_model": PEST_MODEL_NAME,
        "supabase_configured": supabase is not None,
    }), 200


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))

    app.run(
        host="127.0.0.1",
        port=port,
        debug=True,
        use_reloader=False,
    )

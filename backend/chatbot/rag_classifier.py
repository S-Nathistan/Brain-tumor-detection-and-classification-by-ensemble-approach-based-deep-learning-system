"""
NeuroSight RAG Classifier
Multilingual DistilBERT + FAISS for intent classification
and answer retrieval in English, Sinhala, Tamil
"""

import re
from pathlib import Path
import numpy as np
import pandas as pd
import faiss
import torch
import joblib
from transformers import AutoTokenizer, AutoModelForSequenceClassification, DistilBertModel

MODEL_DIR = Path(__file__).resolve().parent / "model"

EMERGENCY_TERMS = [
    # English
    "seizure", "cannot breathe", "can't breathe", "collapsed",
    "unconscious", "1990", "ambulance", "dying", "stroke",
    "paralysis", "choking", "bleeding", "emergency",
    "convulsion", "blackout", "fainted", "not breathing",
    # Sinhala emergency terms
    "ආයාසය", "හුස්ම", "කඩා වැටුණා", "ගිලන් රථ",
    "කැක්කුම", "කැක්කුමක්", "ඥානය නැති", "ඇද වැටුණා",
    "රුධිරය", "හදිසි", "ශ්වාස", "අංශභාගය",
    # Tamil emergency terms
    "வலிப்பு", "சுவாசிக்க", "மயக்கம்", "ஆம்புலன்ஸ்",
    "வலிப்புத்தாக்கு", "இரத்தம்", "சுயநினைவு",
    "பக்கவாதம்", "அவசரம்", "விழுந்தார்",
]
EMERGENCY_RESPONSES = {
    "en": "This sounds like a medical emergency. Please call 1990 immediately or go to the nearest hospital emergency room. Do not wait. Contact your care team right away.",
    "si": "මෙය වෛද්‍ය හදිසි අවස්ථාවක් ලෙස පෙනේ. කරුණාකර වහාම 1990 අමතන්න හෝ ළඟම ඇති රෝහල් හදිසි ප්‍රතිකාර ඒකකයට යන්න. රැඳී නොසිටින්න.",
    "ta": "இது மருத்துவ அவசரநிலை போல் தெரிகிறது. உடனே 1990 அழையுங்கள் அல்லது அருகிலுள்ள மருத்துவமனை அவசர சிகிச்சை பிரிவுக்கு செல்லுங்கள். காத்திருக்காதீர்கள்.",
}


def _detect_script_language(text: str) -> str:
    for ch in text:
        cp = ord(ch)
        if 0x0D80 <= cp <= 0x0DFF:
            return "si"
        if 0x0B80 <= cp <= 0x0BFF:
            return "ta"
    return "en"


def _has_emergency_language(text: str) -> bool:
    lowered = text.lower()
    return any(term.lower() in lowered for term in EMERGENCY_TERMS)


# Keyword overrides — fires when the classifier returns "general" but the message
# clearly belongs to a specific intent.  Extended to cover English misclassifications
# (DistilBERT was fine-tuned on English but sometimes falls back to "general" for
# conversational phrasing like "I feel tired" or "what should I eat").
INTENT_KEYWORDS = {
    "nutrition": [
        # English
        "what should i eat", "what can i eat", "food to eat", "food to avoid",
        "diet", "meal", "appetite", "i have no appetite", "loss of appetite",
        "i don't want to eat", "don't like to eat", "cannot eat", "can't eat",
        "not eating", "eating during", "nutrition",
        # Sinhala
        "කෑම", "කන්න", "ආහාර", "කෑමට", "පෝෂණ", "බොන්න", "කෑවොත්",
        "ගන්න ආහාර", "ආහාර ගන්න", "කන ආහාර", "කන දේ",
        # Tamil
        "சாப்பிட", "உணவு", "சாப்பாடு", "சாப்பிட வேண்டும்",
        "என்ன சாப்பிட", "குடிக்க", "சாப்பிடலாம்",
    ],
    "symptom": [
        # English — common symptom phrases that DistilBERT misses
        "i feel tired", "feeling tired", "i am tired", "i am feeling tired",
        "a bit tired", "bit tired", "very tired", "so tired",
        "i feel dizzy", "feeling dizzy", "i am dizzy",
        "headache", "head hurts", "head pain",
        "nausea", "i feel sick", "feeling sick", "feeling unwell",
        "blurred vision", "trouble seeing", "vision",
        "i cannot sleep", "trouble sleeping", "can't sleep",
        "memory", "i keep forgetting", "confused", "confusion",
        "weakness", "my arm", "my leg", "muscle",
        "mood", "feeling depressed", "anxious", "anxiety",
        "is this normal", "is this a symptom", "new symptom",
        "i have pain", "i am in pain",
        # Sinhala
        "රිදෙනවා", "රදනවා", "දැනෙනවා", "වේදනා", "ඔක්කාරය",
        "හිසරදය", "කැක්කුව", "දුර්වල", "වෙහෙස", "ඔළුව",
        "ඇස්", "දකින්න", "අමතක", "නිද්ද", "වමනය",
        # Tamil
        "வலிக்கிறது", "தலைவலி", "குமட்டல்", "சோர்வு",
        "வலி", "தலை சுற்றல்", "மறதி", "தூக்கம்", "வாந்தி",
    ],
    "diagnosis": [
        # English
        "what is my diagnosis", "what do i have", "my diagnosis",
        "what type of tumor", "what type of tumour", "what kind of tumor",
        "how serious", "is it cancerous", "what stage", "what grade",
        "what does my scan show", "what did the mri show", "scan result",
        # Sinhala
        "රෝගය", "රෝග විනිශ්චය", "ගෙඩිය", "ප්‍රතිඵල",
        "පරීක්ෂණ", "MRI", "හඳුනාගත්", "රෝගී",
        # Tamil
        "நோய்", "கண்டறிதல்", "கட்டி", "முடிவுகள்",
        "பரிசோதனை", "நோயறிதல்",
    ],
    "treatment": [
        # English
        "my treatment", "treatment plan", "what medications", "what medicine",
        "do i need surgery", "side effects", "radiation", "chemotherapy",
        "how is it treated",
        # Sinhala
        "ප්‍රතිකාර", "ඖෂධ", "චිකිත්සාව", "බෙහෙත්",
        "ශල්‍යකර්ම", "කෙමෝ", "රේඩියේෂන්", "හමුව",
        # Tamil
        "சிகிச்சை", "மருந்து", "அறுவை", "கீமோ",
        "கதிர்வீச்சு", "சந்திப்பு",
    ],
}

# Hospital-visit trigger phrases — handled separately because DistilBERT has
# no "hospital visit" training label; it falls through to "general".
_HOSPITAL_VISIT_PHRASES_EN = [
    "when should i go to hospital", "when should i go to the hospital",
    "when to go to hospital", "when to go to the hospital",
    "should i go to hospital", "should i go to the hospital",
    "when do i need to go to hospital", "when do i need emergency care",
    "when is it an emergency", "when should i seek help",
    "when should i seek medical help", "when to seek emergency",
    "when to go to er", "when to visit doctor urgently",
    "when to visit hospital", "go to hospital now", "rush to hospital",
    "need to go to hospital",
    # Sinhala
    "රෝහලට යා යුත්තේ", "රෝහලට යන්නේ",
    # Tamil
    "மருத்துவமனைக்கு எப்போது",
]


def _is_hospital_visit_question(text: str) -> bool:
    lowered = text.lower()
    return any(phrase in lowered for phrase in _HOSPITAL_VISIT_PHRASES_EN)


def _build_hospital_visit_response(doctor: str | None, language: str) -> str:
    """
    Returns actionable guidance on when to go to hospital vs. when to call.
    Mirrors classifier.py _reply_when_to_hospital() with multilingual support.
    """
    dr = doctor if doctor and doctor.strip() else "your care team"

    if language == "en":
        lines = [
            "Go to hospital immediately (call 1990 or the emergency room) if you experience:",
            "• Sudden severe headache unlike any before",
            "• Seizure or convulsions",
            "• Sudden weakness or numbness in your face, arm, or leg",
            "• Sudden confusion or difficulty speaking",
            "• Loss of consciousness or fainting",
            "• Sudden vision loss or double vision",
            "• High fever with stiff neck",
            "• Vomiting that will not stop.",
            f"Contact {dr} the same day (do not wait) if you notice:",
            "• A new symptom you have not had before",
            "• A known symptom that is getting noticeably worse",
            "• Unusual changes in mood, memory, or behaviour.",
            "When in doubt, call your care team first — they will tell you whether to come in.",
        ]
        return "\n".join(lines)

    elif language == "si":
        lines = [
            "පහත රෝග ලක්ෂණ ඇත්නම් වහාම රෝහලට යන්න (1990 අමතන්න හෝ හදිසි ප්‍රතිකාර ඒකකයට):",
            "• හදිසි දැඩි හිසරදය",
            "• කැක්කුම හෝ ගෙදරක ළමයා",
            "• හදිසි දුර්වලතාව — මුහුණ, අත හෝ පය",
            "• හදිසි ව්‍යාකූලතාව හෝ කතා කිරීමේ ගැටලු",
            "• විඥාන නැතිවීම",
            "• හදිසි පෙනීම නැතිවීම",
            "• නවතා නොගත හැකි වමනය.",
            f"පහත රෝග ලක්ෂණ ඇත්නම් ඒ දිනයේ {dr} ට ඇමතුම් කරන්න:",
            "• නව රෝග ලක්ෂණ",
            "• නරක අතට හැරෙන රෝග ලක්ෂණ",
            "• සාමාන්‍ය නොවන මනෝ හෝ මතක වෙනස්කම්.",
        ]
        return "\n".join(lines)

    elif language == "ta":
        lines = [
            "பின்வரும் அறிகுறிகள் இருந்தால் உடனே மருத்துவமனைக்கு செல்லுங்கள் (1990 அழையுங்கள்):",
            "• திடீர் கடுமையான தலைவலி",
            "• வலிப்பு அல்லது பிடிப்பு",
            "• திடீர் பலவீனம் — முகம், கை அல்லது கால்",
            "• திடீர் குழப்பம் அல்லது பேசுவதில் சிரமம்",
            "• சுயநினைவு இழப்பு",
            "• திடீர் பார்வை இழப்பு",
            "• நிறுத்த முடியாத வாந்தி.",
            f"பின்வரும் அறிகுறிகள் இருந்தால் அதே நாளில் {dr} ஐ தொடர்புகொள்ளுங்கள்:",
            "• புதிய அறிகுறிகள்",
            "• மோசமாகும் அறிகுறிகள்",
            "• மனநிலை அல்லது நினைவாற்றல் மாற்றங்கள்.",
        ]
        return "\n".join(lines)

    return _build_hospital_visit_response(doctor, "en")


def _keyword_intent_override(text: str) -> str | None:
    lowered = text.lower()
    for intent, keywords in INTENT_KEYWORDS.items():
        if any(kw in lowered for kw in keywords):
            return intent
    return None


_SIDE_EFFECT_TERMS = [
    "side effect", "side effects",
    "effects of treatment", "effects of chemo", "effects of radiation", "effects of surgery",
    "chemotherapy side", "radiation side", "surgery side",
    "what effects", "what are the effects",
    # Sinhala
    "අතුරු ආබාධ",
    # Tamil
    "பக்க விளைவு", "பக்க விளைவுகள்",
]


def _is_asking_side_effects(text: str) -> bool:
    return any(term in text for term in _SIDE_EFFECT_TERMS)


def _build_side_effects_info(plan_summary: str | None, language: str = "en") -> str:
    """
    Returns side-effect text tailored to the treatment types found in plan_summary.
    Falls back to a generic message when the plan is empty or unrecognised.
    Supports English, Sinhala (si), and Tamil (ta).
    """
    plan_lower = (plan_summary or "").lower()
    effects = []

    has_surgery  = any(w in plan_lower for w in ["surgery", "resection", "surgical", "operation", "tumor removal", "tumour removal"])
    has_chemo    = any(w in plan_lower for w in ["chemo", "chemotherapy", "temozolomide", "bevacizumab"])
    has_radiation= any(w in plan_lower for w in ["radiation", "radiotherapy", "radio therapy"])
    has_mri      = any(w in plan_lower for w in ["mri", "observation", "follow-up", "follow up", "monitor", "observe", "imaging"])

    if language == "en":
        if has_surgery:
            effects.append(
                "Surgery: fatigue and soreness at the surgical site during recovery; "
                "small risk of infection, bleeding, or temporary neurological changes "
                "(weakness, speech or vision changes); recovery typically takes several weeks."
            )
        if has_chemo:
            effects.append(
                "Chemotherapy: nausea, vomiting, hair loss, fatigue, low blood counts "
                "(raising infection risk), and mouth sores. Anti-nausea medicines can help."
            )
        if has_radiation:
            effects.append(
                "Radiation therapy: fatigue, headaches, scalp irritation, hair loss in the "
                "treated area, and temporary changes in memory or concentration. "
                "These often improve after treatment ends."
            )
        if has_mri:
            effects.append(
                "MRI scans and observation follow-ups: MRI uses magnetic fields, not radiation, "
                "so there are no significant physical side effects from these check-ups."
            )
        if effects:
            return (
                "Based on your treatment plan, here are the expected side effects for each component:\n"
                + "\n".join(f"• {e}" for e in effects)
            )
        return (
            "Common side effects of brain tumour treatment include fatigue, nausea, hair loss, "
            "headaches, and temporary changes in memory or concentration. "
            "Ask your doctor which effects apply to your specific treatment."
        )

    elif language == "si":
        if has_surgery:
            effects.append("ශල්‍යකර්ම: දිනකිහිපයක් කෙරෙන් වෙහෙස, ශල්‍යකර්ම ස්ථානයේ වේදනාව, ආසාදන අවදානම.")
        if has_chemo:
            effects.append("කීමෝ: ඔක්කාරය, වමනය, හිසකෙස් නැතිවීම, දුර්වලතාව, ආසාදන වැළකීමේ හැකියාව අඩුවීම.")
        if has_radiation:
            effects.append("විකිරණ: හිසරදය, දැඩි වෙහෙස, ප්‍රතිකාර ස්ථානයේ හිසකෙස් නැතිවීම, මතකය තාවකාලිකව අඩුවීම.")
        if has_mri:
            effects.append("MRI ස්කෑන් හා නිරීක්ෂණ: MRI සඳහා ශරීරයට හානිකර විකිරණ නොමැත; සැලකිය යුතු අතුරු ආබාධ නැත.")
        if effects:
            return "ඔබේ ප්‍රතිකාර සැලැස්ම අනුව අපේක්ෂිත අතුරු ආබාධ:\n" + "\n".join(f"• {e}" for e in effects)
        return "ප්‍රතිකාරයේ සාමාන්‍ය අතුරු ආබාධ: වෙහෙස, ඔක්කාරය, හිසකෙස් නැතිවීම, හිසරදය. ඔබේ ප්‍රතිකාරය ගැන වෛද්‍යවරයා ගෙන් විමසන්න."

    elif language == "ta":
        if has_surgery:
            effects.append("அறுவை சிகிச்சை: சோர்வு, அறுவை இடத்தில் வலி, நோய்த்தொற்று அபாயம், மீட்சிக்கு சில வாரங்கள்.")
        if has_chemo:
            effects.append("கீமோதெரபி: குமட்டல், வாந்தி, முடி உதிர்வு, சோர்வு, தொற்று அபாயம்.")
        if has_radiation:
            effects.append("கதிர்வீச்சு சிகிச்சை: தலைவலி, சோர்வு, சிகிச்சை பகுதியில் முடி உதிர்வு, நினைவாற்றல் தற்காலிக மாற்றங்கள்.")
        if has_mri:
            effects.append("MRI ஸ்கேன் மற்றும் கண்காணிப்பு: MRI காந்த புலத்தை பயன்படுத்துவதால் குறிப்பிடத்தக்க பக்க விளைவுகள் இல்லை.")
        if effects:
            return "உங்கள் சிகிச்சை திட்டத்தின் எதிர்பார்க்கப்படும் பக்க விளைவுகள்:\n" + "\n".join(f"• {e}" for e in effects)
        return "சாதாரண பக்க விளைவுகள்: சோர்வு, குமட்டல், முடி உதிர்வு, தலைவலி. உங்கள் சிகிச்சை குறித்து மருத்துவரிடம் கேளுங்கள்."

    # Fallback for unsupported language codes
    return _build_side_effects_info(plan_summary, "en")


def _build_treatment_response(message: str, plan_summary: str, language: str) -> str:
    """
    Builds a personalised treatment reply without touching the QA dataset.

    The QA dataset has ONE identical generic answer for every treatment question
    (confirmed by inspecting qa_dataset_final.csv), so FAISS retrieval adds no value
    for this intent.  We generate the response from the patient's actual plan instead.
    """
    has_plan = bool(plan_summary and plan_summary != "No treatment plan is recorded yet.")

    # ── Side-effects question ─────────────────────────────────────────────────
    if _is_asking_side_effects(message):
        side_effects = _build_side_effects_info(plan_summary, language)
        if has_plan:
            if language == "si":
                return f"ඔබේ ප්‍රතිකාර සැලැස්ම: {plan_summary}.\n\n{side_effects}"
            elif language == "ta":
                return f"உங்கள் தற்போதைய சிகிச்சை திட்டம்: {plan_summary}.\n\n{side_effects}"
            return f"Your current treatment plan is: {plan_summary}.\n\n{side_effects}"
        return side_effects

    # ── Hair-loss reassurance ─────────────────────────────────────────────────
    if any(w in message.lower() for w in ["hair", "hair loss", "hair falling", "losing hair"]):
        if language == "si":
            base = "හිසකෙස් නැතිවීම රේඩියේෂන් සහ/හෝ කීමෝ ප්‍රතිකාරවල බොහෝ දෙනාට ඇති වන ආබාධයකි. ප්‍රතිකාරය ඉවර වූ පසු බොහෝ රෝගීන්ගේ හිසකෙස් නැවත වැඩේ."
        elif language == "ta":
            base = "முடி உதிர்வு கதிர்வீச்சு மற்றும்/அல்லது கீமோ சிகிச்சையின் பொதுவான பக்க விளைவு ஆகும். சிகிச்சை முடிந்த பிறகு பெரும்பாலான நோயாளிகளுக்கு முடி மீண்டும் வளரும்."
        else:
            base = (
                "Hair loss is a common side effect of radiation and/or chemotherapy treatment. "
                "For most patients, hair grows back after treatment ends. "
                "Using gentle shampoos and avoiding heat styling can help during treatment."
            )
        if has_plan:
            if language == "si":
                return f"ඔබේ ප්‍රතිකාර සැලැස්ම: {plan_summary}. {base}"
            elif language == "ta":
                return f"உங்கள் சிகிச்சை திட்டம்: {plan_summary}. {base}"
            return f"Your current treatment plan is: {plan_summary}. {base}"
        return base

    # ── Fatigue / tiredness ───────────────────────────────────────────────────
    if any(w in message.lower() for w in ["fatigue", "tired", "exhausted", "energy", "weak"]):
        if language == "en":
            base = (
                "Fatigue is one of the most common side effects of brain tumour treatment. "
                "Short rests during the day, light activity when possible, and a balanced diet "
                "can help. Report severe or sudden fatigue to your doctor."
            )
        elif language == "si":
            base = "වෙහෙස ප්‍රතිකාරයේ ඉතා සාමාන්‍ය ආබාධයකි. දිවා කාලයේ විශ්‍රාම ගැනීම, ලෙහෙසි ව්‍යායාමය, සහ සමබර ආහාර ගැනීම ශක්තිය ආරක්ෂා කිරීමට උදව් කරයි."
        elif language == "ta":
            base = "சோர்வு சிகிச்சையின் மிகவும் பொதுவான பக்க விளைவு. பகல் நேர ஓய்வு, இலகுவான உடற்பயிற்சி மற்றும் சமச்சீர் உணவு உதவும்."
        else:
            base = "Fatigue is a very common treatment side effect. Rest, light activity, and balanced meals can help."
        plan_prefix = (
            f"Your current treatment plan is: {plan_summary}. " if language == "en"
            else f"ඔබේ ප්‍රතිකාර සැලැස්ම: {plan_summary}. " if language == "si"
            else f"உங்கள் சிகிச்சை திட்டம்: {plan_summary}. "
        )
        return (plan_prefix + base) if has_plan else base

    # ── Nausea / vomiting ────────────────────────────────────────────────────
    if any(w in message.lower() for w in ["nausea", "vomit", "nauseous", "sick from treatment", "feeling sick"]):
        if language == "en":
            base = (
                "Nausea and vomiting are common during chemotherapy and radiation. "
                "Small, frequent meals, ginger tea, and staying hydrated can help. "
                "Ask your doctor about anti-nausea medication if it is severe or persistent."
            )
        elif language == "si":
            base = "ඔක්කාරය සහ වමනය කීමෝ සහ රේඩියේෂන් ප්‍රතිකාරවල සාමාන්‍ය ආබාධ වේ. කුඩා ආහාර ගැනීම, ඉඟුරු තේ සහ ඕනෑ තරම් ජලය බොන්න. ශක්තිමත් නම් ප්‍රති-ඔක්කාරය ඖෂධ ගැන ඔබේ වෛද්‍යවරයාගෙන් විමසන්න."
        elif language == "ta":
            base = "குமட்டல் மற்றும் வாந்தி கீமோ மற்றும் கதிர்வீச்சு சிகிச்சையின் பொதுவான பக்க விளைவுகள். சிறிய உணவுகள், இஞ்சி தேநீர் மற்றும் நிறைய தண்ணீர் உதவும். தீவிரமாக இருந்தால் குமட்டல் எதிர்ப்பு மருந்து குறித்து மருத்துவரிடம் கேளுங்கள்."
        else:
            base = "Nausea is a common treatment side effect. Small meals, ginger tea, and anti-nausea medication can help."
        plan_prefix = (
            f"Your current treatment plan is: {plan_summary}. " if language == "en"
            else f"ඔබේ ප්‍රතිකාර සැලැස්ම: {plan_summary}. " if language == "si"
            else f"உங்கள் சிகிச்சை திட்டம்: {plan_summary}. "
        )
        return (plan_prefix + base) if has_plan else base

    # ── Treatment duration ────────────────────────────────────────────────────
    if any(w in message.lower() for w in ["how long", "duration", "when will it end", "end of treatment", "finish treatment", "treatment end", "when does it end"]):
        if language == "en":
            base = (
                "Treatment duration depends on the type of therapy and your response to it. "
                "Surgery recovery typically takes several weeks; if radiation or chemotherapy "
                "is involved, courses usually last 4–6 weeks or longer. "
                "Your doctor will give you the specific timeline for your plan."
            )
        elif language == "si":
            base = "ප්‍රතිකාරයේ කාලසීමාව ප්‍රතිකාරයේ වර්ගය සහ ඔබේ ප්‍රතිචාරය අනුව වෙනස් වේ. ඔබේ නිශ්චිත කාලසීමාව ගැන ඔබේ වෛද්‍යවරයාගෙන් විමසන්න."
        elif language == "ta":
            base = "சிகிச்சையின் கால அளவு சிகிச்சை வகையைப் பொறுத்தது. உங்கள் குறிப்பிட்ட கால அட்டவணை குறித்து மருத்துவரிடம் கேளுங்கள்."
        else:
            base = "Treatment duration varies by therapy type. Ask your doctor for the specific timeline."
        plan_prefix = (
            f"Your current treatment plan is: {plan_summary}. " if language == "en"
            else f"ඔබේ ප්‍රතිකාර සැලැස්ම: {plan_summary}. " if language == "si"
            else f"உங்கள் சிகிச்சை திட்டம்: {plan_summary}. "
        )
        return (plan_prefix + base) if has_plan else base

    # ── General treatment-plan question ──────────────────────────────────────
    # (Doctor sign-off is added by _add_context() — avoid repeating it here.)
    if has_plan:
        if language == "si":
            return (
                f"ඔබේ ප්‍රතිකාර සැලැස්ම: {plan_summary}. "
                "ඔබේ ප්‍රතිකාර සැලැස්ම ඔබේ නිශ්චිත රෝග විනිශ්චය මත ඔබේ වෛද්‍යවරයා විසින් සකස් කර ඇත."
            )
        elif language == "ta":
            return (
                f"உங்கள் தற்போதைய சிகிச்சை திட்டம்: {plan_summary}. "
                "உங்கள் சிகிச்சை திட்டம் உங்கள் குறிப்பிட்ட நோயறிதலின் அடிப்படையில் உங்கள் மருத்துவரால் தயாரிக்கப்பட்டது."
            )
        return (
            f"Your current treatment plan is: {plan_summary}. "
            "Your treatment plan has been prepared by your doctor based on your specific diagnosis."
        )

    # No plan recorded
    if language == "si":
        return "ඔබේ ගොනුවේ ප්‍රතිකාර සැලැස්මක් තවම සටහන් කර නොමැත. ඔබේ ප්‍රතිකාර ගැන ඔබේ වෛද්‍යවරයා සමඟ කතා කරන්න."
    elif language == "ta":
        return "உங்கள் கோப்பில் இன்னும் சிகிச்சை திட்டம் பதிவு செய்யப்படவில்லை. உங்கள் சிகிச்சை குறித்து மருத்துவரிடம் பேசுங்கள்."
    return (
        "No treatment plan has been recorded in your file yet. "
        "Please speak with your doctor about your treatment options."
    )


class RAGClassifier:
    """
    Multilingual RAG Classifier using DistilBERT + FAISS
    Handles English, Sinhala, Tamil
    """

    def __init__(self):
        print("[RAG] Loading tokenizer...")
        self._tokenizer = AutoTokenizer.from_pretrained(
            str(MODEL_DIR / "neurosight_distilbert")
        )

        print("[RAG] Loading classifier...")
        self._classifier = AutoModelForSequenceClassification.from_pretrained(
            str(MODEL_DIR / "neurosight_distilbert")
        )
        self._classifier.eval()

        print("[RAG] Loading encoder...")
        self._encoder = DistilBertModel.from_pretrained(
            "distilbert-base-multilingual-cased"
        )
        self._encoder.eval()

        print("[RAG] Loading label encoder...")
        self._label_enc = joblib.load(
            MODEL_DIR / "neurosight_distilbert" / "label_encoder.pkl"
        )

        print("[RAG] Loading FAISS index...")
        self._index = faiss.read_index(str(MODEL_DIR / "faiss_index.bin"))

        print("[RAG] Loading QA dataset...")
        self._qa_df = pd.read_csv(MODEL_DIR / "qa_dataset_final.csv")

        self._device = torch.device(
            'cuda' if torch.cuda.is_available() else 'cpu'
        )
        self._classifier = self._classifier.to(self._device)
        self._encoder = self._encoder.to(self._device)

        print(f"[RAG] Ready! Device: {self._device}")

    def _get_embedding(self, text: str) -> np.ndarray:
        inputs = self._tokenizer(
            text,
            return_tensors='pt',
            max_length=128,
            padding='max_length',
            truncation=True
        ).to(self._device)
        with torch.no_grad():
            outputs = self._encoder(**inputs)
        return outputs.last_hidden_state[:, 0, :].cpu().numpy()

    def _predict_intent(self, text: str) -> str:
        inputs = self._tokenizer(
            text,
            return_tensors='pt',
            max_length=128,
            padding='max_length',
            truncation=True
        ).to(self._device)
        with torch.no_grad():
            outputs = self._classifier(**inputs)
        pred = outputs.logits.argmax(dim=-1).item()
        return self._label_enc.inverse_transform([pred])[0]

    def _find_answer(self, question: str, language: str, intent: str) -> str:
        # Use FAISS semantic search when the index aligns with the QA DataFrame
        # (index was built from the same dataset rows in order).
        if self._index.ntotal == len(self._qa_df):
            q_emb = self._get_embedding(question).astype('float32')
            k = min(120, self._index.ntotal)
            _, indices = self._index.search(q_emb, k)

            # Best match: language + intent
            for idx in indices[0]:
                if idx < 0 or idx >= len(self._qa_df):
                    continue
                row = self._qa_df.iloc[int(idx)]
                if row['language'] == language and row['intent'] == intent:
                    return row['answer']

            # Second pass: English fallback with same intent
            for idx in indices[0]:
                if idx < 0 or idx >= len(self._qa_df):
                    continue
                row = self._qa_df.iloc[int(idx)]
                if row['language'] == 'en' and row['intent'] == intent:
                    return row['answer']

        # Exact-filter fallback (used when FAISS index size != DataFrame size)
        target_rows = self._qa_df[
            (self._qa_df['language'] == language) &
            (self._qa_df['intent'] == intent)
        ]
        if len(target_rows) > 0:
            return target_rows.iloc[0]['answer']

        en_rows = self._qa_df[
            (self._qa_df['language'] == 'en') &
            (self._qa_df['intent'] == intent)
        ]
        if len(en_rows) > 0:
            return en_rows.iloc[0]['answer']

        return "Please consult your doctor for more information."

    def answer(self, message: str, context: dict, language: str = "en") -> tuple:
        """
        Returns (reply, intent, is_emergency)
        """
        # Truncate to first sentence or 300 chars to avoid classifying pasted UI text
        message = message.strip()
        for sep in ('\n', '.', '?', '!'):
            idx = message.find(sep)
            if 0 < idx < 300:
                message = message[:idx + 1].strip()
                break
        else:
            message = message[:300]

        # Detect language from the message script (overrides caller's guess)
        detected = _detect_script_language(message)
        if detected != "en":
            language = detected
        print(f"[DEBUG] Language: {language} for message: {message[:60]}")

        # ── Emergency pre-screen ─────────────────────────────────────────────
        if _has_emergency_language(message):
            print(f"[DEBUG] Emergency keyword detected in: {message}")
            reply = EMERGENCY_RESPONSES.get(language, EMERGENCY_RESPONSES["en"])
            return reply, "emergency", True

        # ── Hospital-visit pre-check (rule-based, beats DistilBERT) ─────────
        # DistilBERT has no "hospital visit" label — it defaults to "general".
        # Intercept these questions before the model runs.
        if _is_hospital_visit_question(message):
            print(f"[DEBUG] Hospital visit question detected: {message[:60]}")
            doctor = context.get("doctor")
            reply  = _build_hospital_visit_response(doctor, language)
            return reply, "symptom", False

        # ── ML intent prediction ─────────────────────────────────────────────
        intent = self._predict_intent(message)
        print(f"[DEBUG] Intent predicted: {intent} for: {message[:60]}")

        # Real emergencies are already caught above; classifier false-positives → "general"
        if intent == "emergency":
            intent = "general"
            print(f"[DEBUG] Classifier emergency overridden → general (no keyword match)")

        # ── Keyword override when model returns "general" ────────────────────
        # Applies to ALL languages:
        #   - Sinhala/Tamil: model was trained mostly on English, misclassifies native script
        #   - English: DistilBERT sometimes misses conversational phrasing
        #     (e.g. "I feel a bit tired", "I don't want to eat")
        if intent == "general":
            override = _keyword_intent_override(message)
            if override:
                print(f"[DEBUG] Keyword override: general → {override} for: {message[:60]}")
                intent = override

        # ── Extract patient context before building the answer ───────────────
        diagnosis    = context.get("diagnosis", "")
        plan_summary = context.get("plan_summary", "")
        checkin_info = context.get("checkin_info", "")

        # ── Build base answer ────────────────────────────────────────────────
        # For "treatment" intent: the QA dataset has one identical generic answer
        # for every treatment question (verified in qa_dataset_final.csv), so FAISS
        # retrieval adds no value.  Build a personalised code response instead.
        if intent == "treatment":
            base_answer = _build_treatment_response(message, plan_summary, language)
        else:
            base_answer = self._find_answer(message, language, intent=intent)

            # Replace the QA dataset's generic "brain tumor/tumour" placeholder with
            # the patient's actual diagnosis so every response is specific.
            if diagnosis and "no tumour" not in diagnosis.lower():
                base_answer = re.sub(
                    r'brain\s+tum(?:o|ou)r',
                    diagnosis,
                    base_answer,
                    flags=re.IGNORECASE,
                )

        # ── Diagnosis-specific overrides ─────────────────────────────────────
        # QA dataset only has tumour-positive "diagnosis" answers.
        # Override with a reassuring No Tumour response when appropriate.
        if intent == "diagnosis" and "no tumour" in diagnosis.lower():
            no_tumour_answers = {
                "en": "Your MRI scan shows no brain tumour, which is very reassuring. Any symptoms you are experiencing may have other causes that your doctor will evaluate and address.",
                "ta": "உங்கள் MRI ஸ்கேன் மூளை கட்டி இல்லை என்று காட்டுகிறது, இது மிகவும் ஆறுதலான செய்தி. நீங்கள் அனுபவிக்கும் அறிகுறிகளுக்கு வேறு காரணங்கள் இருக்கலாம்; உங்கள் மருத்துவர் அவற்றை மதிப்பீடு செய்வார்.",
                "si": "ඔබේ MRI ස්කෑන් මොළේ ගෙඩියක් නොමැති බව දක්වයි. මෙය ඉතා ශුභදායක ප්‍රවෘත්තිය. ඔබ අත්විඳින රෝග ලක්ෂණවලට වෙනත් හේතු ද ඇති විය හැකිය; ඔබේ වෛද්‍යවරයා ඒවා ඇගයීමට ලක් කරනු ඇත.",
            }
            base_answer = no_tumour_answers.get(language, no_tumour_answers["en"])

        # ── Symptom: surface latest check-in in human-readable form ──────────
        if intent == "symptom" and checkin_info:
            ci_lower = checkin_info.lower()
            if "recent seizure" in ci_lower:
                base_answer += (
                    " Your last daily check-in flagged a recent seizure — "
                    "please contact your care team or go to emergency immediately."
                )
            elif "critical" in ci_lower or "red" in ci_lower:
                base_answer += (
                    " Your last daily check-in showed a high-concern level. "
                    "Please contact your care team as soon as possible."
                )
            elif "amber" in ci_lower:
                base_answer += (
                    " Your last daily check-in showed a moderate-concern level. "
                    "Monitor your symptoms closely and contact your doctor if they worsen."
                )
            elif "green" in ci_lower:
                base_answer += (
                    " Your last daily check-in showed a stable level. "
                    "Continue to monitor and report any new changes to your doctor."
                )

        # Add patient context
        reply = self._add_context(base_answer, intent, context, language)

        return reply, intent, False

    def _add_context(self, answer: str, intent: str, context: dict, language: str) -> str:
        doctor      = context.get("doctor", "")
        diagnosis   = context.get("diagnosis", "")
        plan        = context.get("plan_summary", "")
        latest_scan = context.get("latest_scan", "")

        is_no_tumour = "no tumour" in diagnosis.lower() if diagnosis else False
        has_plan     = bool(plan and plan != "No treatment plan is recorded yet.")
        dr = doctor if doctor and re.match(r'^[Dd]r\.?\s+', doctor.strip()) else (f"Dr. {doctor}" if doctor else "your doctor")

        if language == "en":
            if intent == "diagnosis":
                if latest_scan:
                    answer += f" Your latest scan result: {latest_scan}."
                if has_plan:
                    answer += f" Your current treatment plan: {plan}."
                if diagnosis:
                    if is_no_tumour:
                        answer += " Your scan results confirm No Tumour. This is good news."
                    else:
                        answer += f" Your confirmed diagnosis is {diagnosis}."
                answer += f" Please ask {dr} to explain what this means for your specific situation."

            elif intent == "treatment":
                # _build_treatment_response() builds the full body; add the doctor sign-off here.
                answer += f"\nAlways consult {dr} before making any changes to your medications or treatment."

            elif intent == "symptom":
                if diagnosis:
                    answer += f" These symptoms may be related to {diagnosis} or its treatment."
                answer += f" Report any new or worsening symptoms to {dr} as soon as possible."

            elif intent == "general":
                if diagnosis:
                    answer += f" Your current diagnosis is {diagnosis}."
                if has_plan:
                    answer += f" Your treatment plan: {plan}."
                answer += f" For specific questions, contact your care team or {dr} directly."

            elif intent == "nutrition":
                answer += f" Please consult {dr} or a dietitian for a nutrition plan tailored to your specific treatment."

        elif language == "si":
            if intent == "diagnosis":
                if latest_scan:
                    answer += f" ඔබේ නවතම ස්කෑන් ප්‍රතිඵලය: {latest_scan}."
                if has_plan:
                    answer += f" ඔබේ ප්‍රතිකාර සැලැස්ම: {plan}."
                if diagnosis:
                    if is_no_tumour:
                        answer += " ඔබේ ස්කෑන් ප්‍රතිඵල ගෙඩියක් නොමැති බව පෙන්වයි. මෙය සුභ ප්‍රවෘත්තිය."
                    else:
                        answer += f" ඔබේ රෝග විනිශ්චය: {diagnosis}."
                if doctor:
                    answer += f" පුද්ගලික උපදෙස් සඳහා කරුණාකර වෛද්‍ය {doctor} හමුවන්න."

            elif intent == "treatment":
                if doctor:
                    answer += f"\nඔබේ ඖෂධ හෝ ප්‍රතිකාර වෙනස් කිරීමට පෙර සෑම විටම වෛද්‍ය {doctor} හමුවන්න."

            elif intent == "symptom":
                if diagnosis:
                    answer += f" මෙම රෝග ලක්ෂණ {diagnosis} හෝ එහි ප්‍රතිකාරය සමඟ සම්බන්ධ විය හැකිය."
                if doctor:
                    answer += f" නව හෝ වැඩිවන රෝග ලක්ෂණ ගැන වෛද්‍ය {doctor} ට දන්වන්න."

            elif intent == "general":
                if diagnosis:
                    answer += f" ඔබේ වත්මන් රෝග විනිශ්චය: {diagnosis}."
                if has_plan:
                    answer += f" ඔබේ ප්‍රතිකාර සැලැස්ම: {plan}."
                if doctor:
                    answer += f" ඔබේ වෛද්‍යවරයා: {doctor}."

            elif intent == "nutrition":
                if doctor:
                    answer += f" ඔබේ ප්‍රතිකාරයට ගැළපෙන පෝෂණ සැලැස්මක් සඳහා වෛද්‍ය {doctor} හෝ ආහාරවේදියෙකු හමුවන්න."

        elif language == "ta":
            if intent == "diagnosis":
                if latest_scan:
                    answer += f" உங்கள் சமீபத்திய ஸ்கேன் முடிவு: {latest_scan}."
                if has_plan:
                    answer += f" உங்கள் தற்போதைய சிகிச்சை திட்டம்: {plan}."
                if diagnosis:
                    if is_no_tumour:
                        answer += " உங்கள் ஸ்கேன் முடிவுகள் கட்டி இல்லை என்று உறுதிப்படுத்துகின்றன. இது நல்ல செய்தி."
                    else:
                        answer += f" உங்கள் நோயறிதல்: {diagnosis}."
                if doctor:
                    answer += f" தனிப்பட்ட ஆலோசனைக்கு டாக்டர் {doctor} ஐ அணுகவும்."

            elif intent == "treatment":
                if doctor:
                    answer += f"\nஉங்கள் மருந்துகள் அல்லது சிகிச்சையில் மாற்றம் செய்வதற்கு முன் டாக்டர் {doctor} ஐ அணுகவும்."

            elif intent == "symptom":
                if diagnosis:
                    answer += f" இந்த அறிகுறிகள் {diagnosis} அல்லது அதன் சிகிச்சையுடன் தொடர்புடையதாக இருக்கலாம்."
                if doctor:
                    answer += f" புதிய அல்லது மோசமாகும் அறிகுறிகளை டாக்டர் {doctor} க்கு தெரிவிக்கவும்."

            elif intent == "general":
                if diagnosis:
                    answer += f" உங்கள் தற்போதைய நோயறிதல்: {diagnosis}."
                if has_plan:
                    answer += f" உங்கள் சிகிச்சை திட்டம்: {plan}."
                if doctor:
                    answer += f" உங்கள் மருத்துவர்: {doctor}. குறிப்பிட்ட கேள்விகளுக்கு நேரடியாக தொடர்பு கொள்ளவும்."

            elif intent == "nutrition":
                if doctor:
                    answer += f" உங்கள் சிகிச்சைக்கு ஏற்ற உணவு திட்டத்திற்கு டாக்டர் {doctor} அல்லது உணவியல் நிபுணரை அணுகவும்."

        return answer


# Singleton
_instance: RAGClassifier | None = None


def get_rag_classifier() -> RAGClassifier | None:
    global _instance
    if _instance is not None:
        return _instance
    required = [
        MODEL_DIR / "neurosight_distilbert" / "model.safetensors",
        MODEL_DIR / "faiss_index.bin",
        MODEL_DIR / "qa_dataset_final.csv",
    ]
    if all(f.exists() for f in required):
        _instance = RAGClassifier()
    return _instance

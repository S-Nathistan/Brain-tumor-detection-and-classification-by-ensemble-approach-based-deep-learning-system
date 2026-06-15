"""
NeuroSight Chatbot - Intent Classifier (Inference Module)

Loads trained TF-IDF + SVM weights and classifies patient questions
into one of 6 intents, then generates a context-aware response.

Usage:
    from backend.chatbot.classifier import ChatbotClassifier
    bot = ChatbotClassifier()
    reply, topic, emergency = bot.answer(message, patient_context)
"""

import re
from pathlib import Path

import joblib

MODEL_DIR = Path(__file__).resolve().parent / "model"

EMERGENCY_TERMS = [
    "seizure", "cannot breathe", "can't breathe", "cant breathe",
    "collapsed", "collapse", "unconscious", "1990", "call 1990",
    "severe chest pain", "ambulance", "dying", "emergency room",
    "lost consciousness", "paralysis", "stroke", "choking",
]


def _has_emergency_language(text: str) -> bool:
    lowered = text.lower()
    return any(term in lowered for term in EMERGENCY_TERMS)


def _dr(name: str | None, fallback: str = "your doctor") -> str:
    if not name:
        return fallback
    return name if re.match(r'^[Dd]r\.?\s+', name.strip()) else f"Dr. {name}"


def _safe_join(values, sep=" "):
    parts = [str(v).strip() for v in values if v and str(v).strip()]
    return sep.join(parts)


def _matches_any(text: str, phrases: list) -> bool:
    """Return True if any phrase from the list is a substring of text."""
    return any(phrase in text for phrase in phrases)


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


def _build_side_effects_info(plan_summary: str | None) -> str:
    """
    Returns side-effect text tailored to the treatment types found in plan_summary.
    Falls back to a generic message when the plan is empty or unrecognised.
    """
    plan_lower = (plan_summary or "").lower()
    effects = []

    if any(w in plan_lower for w in ["surgery", "resection", "surgical", "operation", "tumor removal", "tumour removal"]):
        effects.append(
            "Surgery: expect fatigue and soreness around the surgical site during recovery. "
            "There is a small risk of infection, bleeding, or temporary neurological changes "
            "(such as weakness, speech or vision changes) depending on the area of the brain. "
            "Full recovery typically takes several weeks."
        )
    if any(w in plan_lower for w in ["chemo", "chemotherapy", "temozolomide", "bevacizumab"]):
        effects.append(
            "Chemotherapy: common side effects include nausea, vomiting, hair loss, fatigue, "
            "low blood counts (increasing infection risk), and mouth sores. "
            "Anti-nausea medications can help manage these effects."
        )
    if any(w in plan_lower for w in ["radiation", "radiotherapy", "radio therapy"]):
        effects.append(
            "Radiation therapy: common side effects include fatigue, headaches, scalp irritation, "
            "hair loss in the treated area, and temporary changes in memory or concentration. "
            "These often improve after treatment ends."
        )
    if any(w in plan_lower for w in ["mri", "observation", "follow-up", "follow up", "monitor", "observe", "imaging"]):
        effects.append(
            "MRI scans and observation monitoring: MRI uses magnetic fields and does not involve "
            "radiation, so there are no significant physical side effects from these follow-ups."
        )

    if effects:
        intro = "Based on your treatment plan, here are the expected side effects for each component:"
        return intro + "\n" + "\n".join(f"• {e}" for e in effects)

    # Fallback when plan is absent or unrecognised
    return (
        "Common side effects of brain tumour treatment include fatigue, nausea, hair loss, "
        "headaches, and temporary changes in memory or concentration. "
        "Specific effects depend on whether you are having surgery, chemotherapy, or radiation. "
        "Ask your doctor which effects apply to your exact treatment."
    )


# ── Rule-based phrase lists ───────────────────────────────────────────────────
# These cover patterns the SVM reliably misclassifies due to sparse training data.

_HOSPITAL_VISIT_PHRASES = [
    # English
    "when should i go to hospital",
    "when should i go to the hospital",
    "when to go to hospital",
    "when to go to the hospital",
    "should i go to hospital",
    "should i go to the hospital",
    "when do i need to go to hospital",
    "when do i need to go to the hospital",
    "when to visit hospital",
    "when to visit the hospital",
    "when should i visit the hospital",
    "do i need to go to hospital",
    "do i need to go to the hospital",
    "need to go to hospital",
    "go to hospital now",
    "rush to hospital",
    "when is it an emergency",
    "when should i seek help",
    "when should i seek medical help",
    "when to seek emergency",
    "when to go to er",
    "when to visit doctor urgently",
    "when do i need emergency care",
    # Sinhala (quick3 pill translation)
    "රෝහලට යා යුත්තේ කවදාද",
    "රෝහලට යන්නේ කවදාද",
    "රෝහලට යා යුත්තේ",
    # Tamil (quick3 pill translation)
    "மருத்துவமனைக்கு எப்போது செல்ல வேண்டும்",
    "மருத்துவமனைக்கு எப்போது",
    "மருத்துவமனை போக வேண்டும்",
]

_DIAGNOSIS_PHRASES = [
    # English
    "what is my diagnosis",
    "what do i have",
    "what type of tumour",
    "what type of tumor",
    "what kind of tumour",
    "what kind of tumor",
    "tell me my diagnosis",
    "what is my condition",
    "what tumour do i have",
    "what tumor do i have",
    "what is wrong with me",
    "what does my scan show",
    "what did the scan find",
    "what did the mri show",
    "what is my mri result",
    "what is the result",
    "my diagnosis",
    "my scan result",
    # Sinhala (quick1: "මගේ රෝග විනිශ්චය කුමක්ද?")
    "රෝග විනිශ්චය කුමක්ද",
    "රෝග විනිශ්චය",
    "රෝගය කුමක්ද",
    # Tamil (quick1: "என் நோய் கண்டறிதல் என்ன?")
    "நோய் கண்டறிதல்",
    "என் நோய்",
]

_TREATMENT_PHRASES = [
    # English
    "what is my treatment",
    "what is my treatment plan",
    "my treatment plan",
    "tell me my treatment",
    "what treatment am i on",
    "what medications am i taking",
    "what medicine am i on",
    "what surgery do i need",
    "do i need surgery",
    "what is the treatment for",
    "how is brain tumour treated",
    "how is brain tumor treated",
    "treatment side effects",
    "side effects of treatment",
    "effects of chemotherapy",
    "effects of radiation",
    "radiation side effects",
    "chemotherapy side effects",
    # Sinhala (quick2: "මගේ ප්‍රතිකාරයේ අතුරු ආබාධ මොනවාද?")
    "ප්‍රතිකාරයේ අතුරු ආබාධ",
    "ප්‍රතිකාර",
    "අතුරු ආබාධ",
    # Tamil (quick2: "என் சிகிச்சையின் பக்க விளைவுகள் என்ன?")
    "சிகிச்சையின் பக்க விளைவுகள்",
    "பக்க விளைவுகள்",
    "சிகிச்சை",
]

_NUTRITION_PHRASES = [
    # English
    "what should i eat",
    "what can i eat",
    "what foods should i avoid",
    "what food should i eat",
    "diet for brain tumour",
    "diet for brain tumor",
    "nutrition during treatment",
    "eating during chemo",
    "eating during radiation",
    "food to avoid",
    "food to eat",
    "healthy eating",
    "meal plan",
    "i have no appetite",
    "loss of appetite",
    "nausea from eating",
    "feeling nauseous after eating",
    # Sinhala (quick4: "මා කා යුත්තේ කුමක්ද?")
    "කා යුත්තේ කුමක්ද",
    "කෑම",
    "ආහාර",
    # Tamil (quick4: "நான் என்ன சாப்பிட வேண்டும்?")
    "சாப்பிட வேண்டும்",
    "என்ன சாப்பிட",
    "உணவு",
]

_SYMPTOM_PHRASES = [
    "i have a headache",
    "i have headaches",
    "my head hurts",
    "head pain",
    "i feel dizzy",
    "i am dizzy",
    "feeling dizzy",
    "i have nausea",
    "i feel nauseous",
    "feeling nauseous",
    "i am vomiting",
    "i vomited",
    "blurred vision",
    "vision problems",
    "trouble seeing",
    "i have seizure",
    "i had a seizure",
    "memory loss",
    "i keep forgetting",
    "feeling confused",
    "i feel confused",
    "difficulty speaking",
    "trouble speaking",
    "weakness in",
    "my arm is weak",
    "my leg is weak",
    "i feel tired",
    "extreme fatigue",
    "very tired",
    "i cannot sleep",
    "trouble sleeping",
    "mood changes",
    "feeling depressed",
    "feeling anxious",
    "is this normal",
    "is this a symptom",
    "new symptom",
]


class ChatbotClassifier:
    """
    Brain tumour patient intent classifier.
    Loads model weights from backend/chatbot/model/ at startup.
    """

    def __init__(self):
        self._vectorizer  = joblib.load(MODEL_DIR / "vectorizer.pkl")
        self._classifier  = joblib.load(MODEL_DIR / "intent_model.pkl")
        self._label_enc   = joblib.load(MODEL_DIR / "label_encoder.pkl")

    def predict_intent(self, message: str) -> str:
        cleaned = message.lower().strip()
        vec     = self._vectorizer.transform([cleaned])
        encoded = self._classifier.predict(vec)[0]
        return self._label_enc.inverse_transform([encoded])[0]

    def answer(self, message: str, context: dict) -> tuple[str, str, bool]:
        """
        Returns (reply, topic, is_emergency).

        context keys (from _patient_context in mobile.py):
            patient_name, hospital_id, diagnosis, doctor,
            plan_summary, latest_scan, checkin_info, latest_checkin
        """
        lowered = message.lower().strip()

        # 1. Fast emergency pre-screen — no model call needed
        if _has_emergency_language(message):
            return (
                "This sounds urgent. Please call 1990 now or go to the "
                "nearest hospital emergency room immediately.",
                "emergency",
                True,
            )

        # 2. Rule-based overrides for phrases the model reliably misclassifies
        #    These are checked BEFORE the ML model to guarantee correct routing.
        if _matches_any(lowered, _HOSPITAL_VISIT_PHRASES):
            return self._reply_when_to_hospital(context, message), "symptom", False

        if _matches_any(lowered, _DIAGNOSIS_PHRASES):
            return self._reply_diagnosis(context, message), "diagnosis", False

        if _matches_any(lowered, _TREATMENT_PHRASES):
            return self._reply_treatment(context, message), "treatment", False

        if _matches_any(lowered, _NUTRITION_PHRASES):
            return self._reply_nutrition(context, message), "nutrition", False

        if _matches_any(lowered, _SYMPTOM_PHRASES):
            return self._reply_symptom(context, message), "symptom", False

        # 3. Fall through to ML model for everything else
        intent    = self.predict_intent(message)
        reply     = self._build_reply(intent, context, message)
        emergency = intent == "emergency"
        return reply, intent, emergency

    # ── Response builders ────────────────────────────────────────────────────

    def _build_reply(self, intent: str, context: dict, message: str) -> str:
        builders = {
            "emergency":  self._reply_emergency,
            "diagnosis":  self._reply_diagnosis,
            "treatment":  self._reply_treatment,
            "nutrition":  self._reply_nutrition,
            "symptom":    self._reply_symptom,
            "general":    self._reply_general,
        }
        builder = builders.get(intent, self._reply_general)
        return builder(context, message)

    def _reply_emergency(self, context: dict, message: str) -> str:
        return (
            "This sounds like a medical emergency. "
            "Please call 1990 now or go to your nearest hospital immediately. "
            "Do not wait. Contact your care team right away."
        )

    def _reply_when_to_hospital(self, context: dict, message: str) -> str:
        doctor = context.get("doctor")
        parts = [
            "Go to hospital immediately (call 1990 or go to the emergency room) if you experience any of these:",
            "• Sudden severe headache unlike any you have had before",
            "• Seizure or convulsions (fits)",
            "• Sudden weakness or numbness in your face, arm, or leg",
            "• Sudden confusion or difficulty speaking or understanding",
            "• Loss of consciousness or fainting",
            "• Sudden vision loss or double vision",
            "• High fever with stiff neck",
            "• Vomiting that will not stop.",
            f"Contact {_dr(doctor, 'your care team')} on the same day (do not wait for your next appointment) if you notice:",
            "• A new symptom you have not had before",
            "• A known symptom that is getting noticeably worse",
            "• Unusual changes in your mood, memory, or behaviour.",
            "When in doubt, call your care team first. They will tell you whether you need to come in.",
        ]
        return "\n".join(parts)

    def _reply_diagnosis(self, context: dict, message: str) -> str:
        diagnosis   = context.get("diagnosis") or "Not classified yet"
        doctor      = context.get("doctor")
        plan        = context.get("plan_summary")
        latest_scan = context.get("latest_scan")

        parts = [f"Based on your record, your diagnosis is: {diagnosis}."]
        if latest_scan:
            parts.append(f"Your latest scan result: {latest_scan}.")
        if plan and plan != "No treatment plan is recorded yet.":
            parts.append(f"Your current treatment plan: {plan}.")
        parts.append(
            f"Please ask {doctor if doctor else 'your doctor'} "
            "to explain what this means for your specific situation."
        )
        return " ".join(parts)

    def _reply_treatment(self, context: dict, message: str) -> str:
        plan    = context.get("plan_summary")
        doctor  = context.get("doctor")
        lowered = message.lower()

        has_plan = bool(plan and plan != "No treatment plan is recorded yet.")

        parts = []
        if has_plan:
            parts.append(f"Your current treatment plan is: {plan}.")
        else:
            parts.append("No treatment plan has been recorded yet in your file.")

        if _is_asking_side_effects(lowered):
            # Targeted side effects for the patient's actual treatments
            parts.append(_build_side_effects_info(plan))

        elif any(w in lowered for w in ["hair", "hair loss", "hair falling", "losing hair"]):
            parts.append(
                "Hair loss is a common side effect of radiation and/or chemotherapy. "
                "For most patients, hair grows back after treatment ends. "
                "Using gentle shampoo and avoiding heat styling can help in the meantime."
            )

        elif any(w in lowered for w in ["fatigue", "tired", "exhausted", "no energy", "weakness"]):
            parts.append(
                "Fatigue is one of the most common effects of brain tumour treatment. "
                "Short rests during the day, light activity, and balanced meals can help. "
                "Report severe or sudden fatigue to your doctor promptly."
            )

        elif any(w in lowered for w in ["nausea", "vomit", "sick", "nauseous"]):
            parts.append(
                "Nausea and vomiting are common during chemotherapy and radiation. "
                "Small frequent meals, ginger tea, and prescribed anti-nausea medication can help. "
                "Let your doctor know if vomiting is severe or will not stop."
            )

        elif any(w in lowered for w in ["how long", "duration", "when will it end", "end of treatment", "finish treatment"]):
            parts.append(
                "Treatment duration depends on the type of therapy and your response to it. "
                "Surgery recovery typically takes several weeks; radiation/chemotherapy courses "
                "usually last 4 to 6 weeks or longer. Your doctor will give you the specific timeline."
            )

        else:
            parts.append(
                "Your treatment plan has been prepared by your doctor based on your specific diagnosis. "
                "Always follow your doctor's instructions and never stop medications without consulting them."
            )

        parts.append(
            f"Always consult {_dr(doctor)} "
            "before making any changes to your medications or treatment."
        )
        return " ".join(parts)

    def _reply_nutrition(self, context: dict, message: str) -> str:
        return (
            "Small, frequent meals with soft foods are often easier when appetite is low. "
            "Focus on protein-rich foods like eggs, fish, and lentils to help maintain strength. "
            "Avoid spicy or greasy foods if you feel nauseous, and drink plenty of water. "
            "Please consult your doctor or a dietitian for a plan tailored to your treatment."
        )

    def _reply_symptom(self, context: dict, message: str) -> str:
        checkin   = context.get("checkin_info")
        doctor    = context.get("doctor")
        diagnosis = context.get("diagnosis") or "your condition"

        parts = [
            f"Symptoms like these can be related to {diagnosis} or its treatment."
        ]

        # Format checkin_info (e.g. "score 3 GREEN" or "score 8 RED recent seizure")
        # into human-readable text instead of showing raw internal data.
        if checkin:
            checkin_lower = checkin.lower()
            if "recent seizure" in checkin_lower:
                parts.append(
                    "Your last daily check-in flagged a recent seizure — "
                    "please contact your care team or go to emergency immediately."
                )
            elif "critical" in checkin_lower or "red" in checkin_lower:
                parts.append(
                    "Your last daily check-in showed a high-concern level. "
                    "Please contact your care team as soon as possible."
                )
            elif "amber" in checkin_lower:
                parts.append(
                    "Your last daily check-in showed a moderate-concern level. "
                    "Monitor your symptoms closely and contact your doctor if they worsen."
                )
            elif "green" in checkin_lower:
                parts.append(
                    "Your last daily check-in showed a stable level. "
                    "Continue to monitor and report any changes to your doctor."
                )

        parts.append(
            "If this symptom is new, worsening, or worrying you, please report it to "
            f"{_dr(doctor, 'your care team')} as soon as possible."
        )
        parts.append(
            "Call 1990 or go to emergency immediately if symptoms become severe or sudden."
        )
        return " ".join(parts)

    def _reply_general(self, context: dict, message: str) -> str:
        doctor      = context.get("doctor")
        diagnosis   = context.get("diagnosis") or "Not classified"
        plan        = context.get("plan_summary")

        parts = [
            f"Your current diagnosis is {diagnosis}."
        ]
        if plan and plan != "No treatment plan is recorded yet.":
            parts.append(f"Your treatment plan: {plan}.")
        if doctor:
            parts.append(f"Your assigned doctor is {_dr(doctor)}.")
        parts.append(
            "For specific questions about your care, please contact your care team directly "
            "or check with your doctor at your next appointment."
        )
        return " ".join(parts)


# Module-level singleton — loaded once when the backend starts
_instance: ChatbotClassifier | None = None


def get_classifier() -> ChatbotClassifier | None:
    """
    Returns the singleton classifier.
    Returns None if model weights are not found (not yet trained).
    """
    global _instance
    if _instance is not None:
        return _instance
    weights = [
        MODEL_DIR / "vectorizer.pkl",
        MODEL_DIR / "intent_model.pkl",
        MODEL_DIR / "label_encoder.pkl",
    ]
    if all(w.exists() for w in weights):
        _instance = ChatbotClassifier()
    return _instance

import sys
import json
import re

# Dummy local scoring logic (replace with LM Studio or Ollama calls if needed)
def score_bio(bio_text):
    if not bio_text:
        return {
            "pitch_score": 1.0,
            "urgency_score": 1.0,
            "language": "English",
            "region": "Unknown",
            "business_type": "Unknown"
        }
    
    lower = bio_text.lower()
    
    # Language detection (improved)
    if re.search(r"\b(el|la|de|y|en|con|para|por|una|un|es|mi|tu|su|que|pero|como|muy|más|también|hola|gracias)\b", lower):
        language = "Spanish"
    elif re.search(r"\b(le|la|et|un|une|des|pour|avec|est|je|tu|il|elle|nous|vous|ils|elles|bonjour|merci)\b", lower):
        language = "French"
    elif re.search(r"\b(der|die|das|und|ist|ein|eine|mit|für|ich|du|er|sie|wir|ihr|sie|hallo|danke)\b", lower):
        language = "German"
    else:
        language = "English"

    # Region detection (improved)
    if any(term in lower for term in ["la ", "los angeles", "hollywood", "beverly hills", "santa monica"]):
        region = "Los Angeles"
    elif any(term in lower for term in ["nyc", "new york", "manhattan", "brooklyn", "queens"]):
        region = "New York"
    elif any(term in lower for term in ["london", "uk", "england"]):
        region = "London"
    elif any(term in lower for term in ["paris", "france"]):
        region = "Paris"
    elif any(term in lower for term in ["toronto", "canada"]):
        region = "Toronto"
    else:
        region = "Unknown"

    # Business type detection (improved)
    if any(term in lower for term in ["barber", "haircut", "fade", "beard trim"]):
        business_type = "Barber"
    elif any(term in lower for term in ["salon", "hair salon", "beauty", "nails"]):
        business_type = "Salon"
    elif any(term in lower for term in ["photographer", "photography", "photos", "photoshoot"]):
        business_type = "Photographer"
    elif any(term in lower for term in ["artist", "art", "painting", "drawing"]):
        business_type = "Artist"
    elif any(term in lower for term in ["coach", "coaching", "mentor", "training"]):
        business_type = "Coach"
    elif any(term in lower for term in ["gym", "fitness", "personal trainer", "workout"]):
        business_type = "Fitness/Gym"
    elif any(term in lower for term in ["agency", "marketing", "advertising"]):
        business_type = "Agency"
    elif any(term in lower for term in ["catering", "food", "chef", "restaurant"]):
        business_type = "Catering"
    else:
        business_type = "Business"

    # Pitch score calculation (1-10 scale)
    pitch_score = 2.0  # Base score
    
    # High-value indicators
    if any(term in lower for term in ["dm me", "dm for", "book now", "booking", "appointments"]):
        pitch_score += 3.0
    if any(term in lower for term in ["link in bio", "website", "book online"]):
        pitch_score += 2.0
    if any(term in lower for term in ["professional", "certified", "licensed"]):
        pitch_score += 1.5
    if any(term in lower for term in ["years experience", "expert", "specialist"]):
        pitch_score += 1.0
    if re.search(r"[📧📞☎️📲]|email|phone|call|contact", lower):
        pitch_score += 1.5
    
    # Urgency score calculation (1-10 scale)
    urgency_score = 2.0  # Base score
    
    if any(term in lower for term in ["limited time", "special offer", "discount", "sale"]):
        urgency_score += 3.0
    if any(term in lower for term in ["book now", "call today", "available now"]):
        urgency_score += 2.5
    if any(term in lower for term in ["dm me", "message me", "contact me"]):
        urgency_score += 2.0
    if any(term in lower for term in ["new", "opening", "grand opening"]):
        urgency_score += 1.5
    
    # Cap scores at 10
    pitch_score = min(pitch_score, 10.0)
    urgency_score = min(urgency_score, 10.0)
    
    return {
        "pitch_score": round(pitch_score, 1),
        "urgency_score": round(urgency_score, 1),
        "language": language,
        "region": region,
        "business_type": business_type
    }

if __name__ == "__main__":
    bio_text = sys.argv[1] if len(sys.argv) > 1 else ""
    result = score_bio(bio_text)
    print(json.dumps(result))

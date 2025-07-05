import sys
import json
import re
from typing import Dict, List, Tuple

class ProfessionalBioAnalyzer:
    def __init__(self):
        # Business type keywords with confidence scoring
        self.business_keywords = {
            "fitness": {
                "keywords": ["trainer", "fitness", "gym", "workout", "personal training", "crossfit", "yoga", "pilates", "nutrition", "bodybuilding", "coach", "athlete"],
                "high_value": ["certified trainer", "nutrition coach", "fitness coach", "personal trainer"],
                "revenue_potential": 8.5
            },
            "beauty": {
                "keywords": ["barber", "hair", "salon", "beauty", "makeup", "nails", "lashes", "brows", "aesthetics", "skincare"],
                "high_value": ["master barber", "certified", "licensed", "award winning"],
                "revenue_potential": 7.5
            },
            "photography": {
                "keywords": ["photographer", "photography", "photos", "wedding", "portrait", "commercial", "headshots"],
                "high_value": ["wedding photographer", "commercial photographer", "award winning"],
                "revenue_potential": 8.0
            },
            "food_service": {
                "keywords": ["chef", "catering", "restaurant", "food", "culinary", "bakery", "cafe", "meal prep"],
                "high_value": ["executive chef", "catering company", "restaurant owner"],
                "revenue_potential": 7.0
            },
            "real_estate": {
                "keywords": ["realtor", "real estate", "broker", "property", "homes", "listings"],
                "high_value": ["top producer", "million dollar", "luxury homes"],
                "revenue_potential": 9.5
            },
            "consulting": {
                "keywords": ["consultant", "coaching", "business coach", "mentor", "advisor", "strategy"],
                "high_value": ["business consultant", "executive coach", "strategy consultant"],
                "revenue_potential": 9.0
            },
            "healthcare": {
                "keywords": ["doctor", "dentist", "therapist", "clinic", "medical", "health", "wellness"],
                "high_value": ["md", "dds", "licensed therapist", "clinic owner"],
                "revenue_potential": 9.5
            },
            "legal": {
                "keywords": ["lawyer", "attorney", "law firm", "legal", "paralegal"],
                "high_value": ["partner", "law firm", "attorney"],
                "revenue_potential": 9.5
            },
            "marketing": {
                "keywords": ["marketing", "social media", "advertising", "branding", "digital marketing", "seo"],
                "high_value": ["marketing agency", "digital marketing", "brand strategist"],
                "revenue_potential": 8.5
            },
            "ecommerce": {
                "keywords": ["ecommerce", "online store", "shopify", "amazon", "dropshipping", "retail"],
                "high_value": ["7 figure", "8 figure", "million", "successful"],
                "revenue_potential": 8.0
            }
        }
        
        # Urgency and action indicators
        self.urgency_indicators = {
            "high": ["book now", "call today", "limited time", "urgent", "asap", "immediate", "hurry"],
            "medium": ["dm me", "message me", "contact", "reach out", "get in touch"],
            "low": ["available", "open", "accepting"]
        }
        
        # Professional credibility indicators
        self.credibility_indicators = {
            "certifications": ["certified", "licensed", "accredited", "board certified", "diploma"],
            "achievements": ["award", "winner", "top", "best", "featured", "published", "recognized"],
            "experience": ["years", "decade", "veteran", "expert", "specialist", "master"],
            "scale": ["company", "agency", "firm", "corporation", "llc", "inc"]
        }
        
        # Contact readiness indicators
        self.contact_indicators = {
            "direct": ["dm", "text", "call", "email", "whatsapp", "telegram"],
            "booking": ["book", "schedule", "appointment", "consultation", "meeting"],
            "social_proof": ["reviews", "testimonials", "clients", "customers", "satisfied"]
        }
        
        # Geographic regions with market value
        self.regions = {
            "high_value": {
                "keywords": ["manhattan", "beverly hills", "silicon valley", "miami beach", "soho"],
                "multiplier": 1.5
            },
            "major_cities": {
                "keywords": ["nyc", "new york", "los angeles", "chicago", "miami", "san francisco", "boston", "seattle"],
                "multiplier": 1.3
            },
            "medium_cities": {
                "keywords": ["atlanta", "dallas", "houston", "phoenix", "denver", "austin"],
                "multiplier": 1.1
            }
        }

    def analyze_bio(self, bio_text: str) -> Dict:
        if not bio_text or len(bio_text.strip()) < 5:
            return self._default_score()
        
        bio_lower = bio_text.lower()
        
        # Core analysis
        business_analysis = self._analyze_business_type(bio_lower)
        urgency_score = self._calculate_urgency_score(bio_lower)
        credibility_score = self._calculate_credibility_score(bio_lower)
        contact_readiness = self._calculate_contact_readiness(bio_lower)
        region_analysis = self._analyze_region(bio_lower)
        language = self._detect_language(bio_lower)
        
        # Calculate final pitch score (1-10)
        base_score = 3.0  # Everyone starts at 3
        
        # Business type contribution (0-3 points)
        base_score += business_analysis["score_contribution"]
        
        # Credibility contribution (0-2 points)
        base_score += credibility_score
        
        # Contact readiness (0-2 points)
        base_score += contact_readiness
        
        # Regional multiplier
        base_score *= region_analysis["multiplier"]
        
        # Cap at 10
        final_pitch_score = min(base_score, 10.0)
        
        return {
            "pitch_score": round(final_pitch_score, 1),
            "urgency_score": round(urgency_score, 1),
            "credibility_score": round(credibility_score, 1),
            "contact_readiness": round(contact_readiness, 1),
            "business_type": business_analysis["type"],
            "business_confidence": business_analysis["confidence"],
            "revenue_potential": business_analysis["revenue_potential"],
            "language": language,
            "region": region_analysis["region"],
            "region_value": region_analysis["value"],
            "key_indicators": self._extract_key_indicators(bio_lower),
            "recommendation": self._generate_recommendation(final_pitch_score, urgency_score, business_analysis)
        }
    
    def _analyze_business_type(self, bio_lower: str) -> Dict:
        best_match = {"type": "General Business", "confidence": 0.1, "score_contribution": 0.5, "revenue_potential": 5.0}
        
        for business_type, data in self.business_keywords.items():
            confidence = 0
            
            # Check regular keywords
            for keyword in data["keywords"]:
                if keyword in bio_lower:
                    confidence += 0.3
            
            # Check high-value keywords (worth more)
            for high_value in data["high_value"]:
                if high_value in bio_lower:
                    confidence += 0.7
            
            if confidence > best_match["confidence"]:
                best_match = {
                    "type": business_type.replace("_", " ").title(),
                    "confidence": min(confidence, 1.0),
                    "score_contribution": min(confidence * 3, 3.0),
                    "revenue_potential": data["revenue_potential"]
                }
        
        return best_match
    
    def _calculate_urgency_score(self, bio_lower: str) -> float:
        score = 2.0  # Base urgency
        
        for urgency_level, keywords in self.urgency_indicators.items():
            for keyword in keywords:
                if keyword in bio_lower:
                    if urgency_level == "high":
                        score += 3.0
                    elif urgency_level == "medium":
                        score += 2.0
                    else:
                        score += 1.0
        
        return min(score, 10.0)
    
    def _calculate_credibility_score(self, bio_lower: str) -> float:
        score = 0.0
        
        for category, keywords in self.credibility_indicators.items():
            for keyword in keywords:
                if keyword in bio_lower:
                    if category == "certifications":
                        score += 0.7
                    elif category == "achievements":
                        score += 0.6
                    elif category == "experience":
                        score += 0.4
                    elif category == "scale":
                        score += 0.5
        
        return min(score, 2.0)
    
    def _calculate_contact_readiness(self, bio_lower: str) -> float:
        score = 0.0
        
        for category, keywords in self.contact_indicators.items():
            for keyword in keywords:
                if keyword in bio_lower:
                    if category == "direct":
                        score += 0.8
                    elif category == "booking":
                        score += 0.7
                    elif category == "social_proof":
                        score += 0.5
        
        # Check for actual contact info
        if "@" in bio_lower or "📧" in bio_lower:
            score += 0.8
        if re.search(r'\d{3}[-.]?\d{3}[-.]?\d{4}', bio_lower):
            score += 1.0
        
        return min(score, 2.0)
    
    def _analyze_region(self, bio_lower: str) -> Dict:
        for region_type, data in self.regions.items():
            for keyword in data["keywords"]:
                if keyword in bio_lower:
                    return {
                        "region": keyword.title(),
                        "value": region_type.replace("_", " ").title(),
                        "multiplier": data["multiplier"]
                    }
        
        return {"region": "Unknown", "value": "Standard", "multiplier": 1.0}
    
    def _detect_language(self, bio_lower: str) -> str:
        spanish_indicators = ["el", "la", "de", "y", "en", "con", "para", "por", "una", "un", "es", "mi", "tu", "su"]
        french_indicators = ["le", "la", "et", "un", "une", "des", "pour", "avec", "est", "mon", "ton", "son"]
        
        spanish_count = sum(1 for word in spanish_indicators if f" {word} " in f" {bio_lower} ")
        french_count = sum(1 for word in french_indicators if f" {word} " in f" {bio_lower} ")
        
        if spanish_count >= 2:
            return "Spanish"
        elif french_count >= 2:
            return "French"
        else:
            return "English"
    
    def _extract_key_indicators(self, bio_lower: str) -> List[str]:
        indicators = []
        
        if any(word in bio_lower for word in ["certified", "licensed"]):
            indicators.append("Certified Professional")
        if any(word in bio_lower for word in ["dm", "contact", "book"]):
            indicators.append("Contact Ready")
        if "@" in bio_lower or "📧" in bio_lower:
            indicators.append("Email Available")
        if any(word in bio_lower for word in ["award", "top", "best"]):
            indicators.append("Award Winner")
        if any(word in bio_lower for word in ["company", "llc", "inc"]):
            indicators.append("Business Entity")
        
        return indicators
    
    def _generate_recommendation(self, pitch_score: float, urgency_score: float, business_analysis: Dict) -> str:
        if pitch_score >= 8.5 and urgency_score >= 7:
            return "🔥 HOT LEAD - Contact immediately! High-value prospect with strong indicators."
        elif pitch_score >= 7 and urgency_score >= 5:
            return "🌟 WARM LEAD - Strong potential, reach out within 24 hours."
        elif pitch_score >= 5:
            return "💼 QUALIFIED LEAD - Good business potential, add to nurture sequence."
        elif business_analysis["revenue_potential"] >= 8:
            return "💎 HIGH-VALUE INDUSTRY - Lower engagement but high revenue potential."
        else:
            return "📋 STANDARD LEAD - Basic qualification, consider for mass outreach."
    
    def _default_score(self) -> Dict:
        return {
            "pitch_score": 1.0,
            "urgency_score": 1.0,
            "credibility_score": 0.0,
            "contact_readiness": 0.0,
            "business_type": "Unknown",
            "business_confidence": 0.0,
            "revenue_potential": 0.0,
            "language": "English",
            "region": "Unknown",
            "region_value": "Standard",
            "key_indicators": [],
            "recommendation": "❌ INSUFFICIENT DATA - Bio too short or empty."
        }

def score_bio_fast(bio_text):
    analyzer = ProfessionalBioAnalyzer()
    return analyzer.analyze_bio(bio_text)

if __name__ == "__main__":
    bio_text = sys.argv[1] if len(sys.argv) > 1 else ""
    result = score_bio_fast(bio_text)
    print(json.dumps(result)) 
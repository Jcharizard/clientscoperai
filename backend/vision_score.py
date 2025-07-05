import sys
import json
import os
from typing import Dict, List
import hashlib

class ProfessionalVisionAnalyzer:
    def __init__(self):
        # Professional image indicators (based on filename patterns and common characteristics)
        self.professional_indicators = {
            "high_quality": ["hd", "high", "quality", "professional", "studio"],
            "business_context": ["office", "business", "corporate", "meeting", "presentation"],
            "branding": ["logo", "brand", "company", "business"],
            "portfolio": ["portfolio", "work", "gallery", "showcase"]
        }
        
        # Image quality indicators (based on file characteristics)
        self.quality_indicators = {
            "file_size_ranges": {
                "high": (500000, float('inf')),  # 500KB+
                "medium": (100000, 500000),      # 100KB-500KB
                "low": (0, 100000)               # <100KB
            },
            "resolution_indicators": ["4k", "1080", "720", "hd", "uhd"]
        }
        
        # Professional presentation elements
        self.presentation_elements = {
            "professional_attire": ["suit", "business", "formal", "professional"],
            "clean_background": ["studio", "clean", "white", "professional"],
            "good_lighting": ["studio", "professional", "lighting", "bright"],
            "composition": ["headshot", "portrait", "professional", "centered"]
        }

    def analyze_image(self, image_path: str) -> Dict:
        if not image_path or not os.path.exists(image_path):
            return self._default_score()
        
        try:
            # Get file information
            file_stats = os.stat(image_path)
            file_size = file_stats.st_size
            filename = os.path.basename(image_path).lower()
            
            # Quick analysis based on file characteristics
            quality_score = self._analyze_image_quality(file_size, filename)
            professional_score = self._analyze_professionalism(filename, file_size)
            branding_score = self._analyze_branding_elements(filename)
            composition_score = self._analyze_composition(filename, file_size)
            
            # Calculate overall scores
            overall_professional = self._calculate_overall_professional_score(
                quality_score, professional_score, branding_score, composition_score
            )
            
            return {
                "professional_score": round(overall_professional, 1),
                "quality_score": round(quality_score, 1),
                "branding_score": round(branding_score, 1),
                "composition_score": round(composition_score, 1),
                "file_size_mb": round(file_size / 1024 / 1024, 2),
                "image_quality": self._get_quality_rating(quality_score),
                "professional_rating": self._get_professional_rating(overall_professional),
                "key_strengths": self._identify_strengths(quality_score, professional_score, branding_score),
                "improvement_suggestions": self._generate_suggestions(quality_score, professional_score, branding_score),
                "marketability": self._assess_marketability(overall_professional, branding_score),
                "recommendation": self._generate_recommendation(overall_professional, quality_score)
            }
            
        except Exception as e:
            return self._error_score(str(e))

    def _analyze_image_quality(self, file_size: int, filename: str) -> float:
        base_score = 3.0
        
        # File size analysis - key indicator of image quality
        if file_size >= 1000000:  # 1MB+
            base_score += 4.0
        elif file_size >= 500000:  # 500KB+
            base_score += 3.0
        elif file_size >= 100000:  # 100KB+
            base_score += 2.0
        elif file_size >= 10000:   # 10KB+
            base_score += 1.0
        else:  # Very small files are likely placeholders
            base_score = 1.0
        
        # Filename quality indicators
        for indicator in self.quality_indicators["resolution_indicators"]:
            if indicator in filename:
                base_score += 1.0
        
        return min(base_score, 10.0)

    def _analyze_professionalism(self, filename: str, file_size: int) -> float:
        base_score = 4.0
        
        # File size affects professionalism perception
        if file_size >= 500000:
            base_score += 2.0
        elif file_size >= 100000:
            base_score += 1.0
        elif file_size < 1000:  # Tiny files are not professional
            base_score = 2.0
        
        # Professional context indicators from filename
        professional_keywords = ["professional", "business", "corporate", "headshot", "portrait"]
        for keyword in professional_keywords:
            if keyword in filename:
                base_score += 1.0
        
        return min(base_score, 10.0)

    def _analyze_branding_elements(self, filename: str) -> float:
        base_score = 3.0
        
        # Branding indicators
        branding_keywords = ["logo", "brand", "company", "business", "professional"]
        for keyword in branding_keywords:
            if keyword in filename:
                base_score += 1.5
        
        return min(base_score, 10.0)

    def _analyze_composition(self, filename: str, file_size: int) -> float:
        base_score = 4.0
        
        # File size indicates image complexity
        if file_size > 1000000:  # 1MB+ suggests detailed image
            base_score += 2.0
        elif file_size > 500000:
            base_score += 1.0
        
        # Composition keywords
        composition_keywords = ["headshot", "portrait", "professional", "studio"]
        for keyword in composition_keywords:
            if keyword in filename:
                base_score += 1.0
        
        return min(base_score, 10.0)

    def _calculate_overall_professional_score(self, quality: float, professional: float, 
                                            branding: float, composition: float) -> float:
        # Weighted average with emphasis on quality and professionalism
        weighted_score = (
            quality * 0.4 +
            professional * 0.3 +
            branding * 0.2 +
            composition * 0.1
        )
        return min(weighted_score, 10.0)

    def _get_quality_rating(self, score: float) -> str:
        if score >= 8.0:
            return "Excellent"
        elif score >= 6.0:
            return "Good"
        elif score >= 4.0:
            return "Average"
        else:
            return "Needs Improvement"

    def _get_professional_rating(self, score: float) -> str:
        if score >= 8.5:
            return "Highly Professional"
        elif score >= 7.0:
            return "Professional"
        elif score >= 5.0:
            return "Semi-Professional"
        else:
            return "Casual"

    def _identify_strengths(self, quality: float, professional: float, branding: float) -> List[str]:
        strengths = []
        
        if quality >= 7.0:
            strengths.append("High Image Quality")
        if professional >= 7.0:
            strengths.append("Professional Presentation")
        if branding >= 6.0:
            strengths.append("Strong Branding Elements")
        
        return strengths if strengths else ["Basic Profile Image"]

    def _generate_suggestions(self, quality: float, professional: float, branding: float) -> List[str]:
        suggestions = []
        
        if quality < 6.0:
            suggestions.append("Improve image quality - use higher resolution")
        if professional < 6.0:
            suggestions.append("Consider more professional presentation")
        if branding < 5.0:
            suggestions.append("Add branding elements")
        
        return suggestions if suggestions else ["Image meets standards"]

    def _assess_marketability(self, professional_score: float, branding_score: float) -> str:
        combined_score = (professional_score + branding_score) / 2
        
        if combined_score >= 8.0:
            return "High - Excellent for marketing"
        elif combined_score >= 6.0:
            return "Good - Suitable for business use"
        elif combined_score >= 4.0:
            return "Moderate - Could be improved"
        else:
            return "Low - Needs professional photography"

    def _generate_recommendation(self, professional_score: float, quality_score: float) -> str:
        avg_score = (professional_score + quality_score) / 2
        
        if avg_score >= 8.5:
            return "🌟 EXCELLENT PROFILE"
        elif avg_score >= 7.0:
            return "✅ PROFESSIONAL PROFILE"
        elif avg_score >= 5.0:
            return "👍 GOOD PROFILE"
        elif avg_score >= 3.0:
            return "⚠️ BASIC PROFILE"
        else:
            return "❌ NEEDS IMPROVEMENT"

    def _default_score(self) -> Dict:
        return {
            "professional_score": 1.0,
            "quality_score": 1.0,
            "branding_score": 1.0,
            "composition_score": 1.0,
            "file_size_mb": 0.0,
            "image_quality": "Unknown",
            "professional_rating": "Unknown",
            "key_strengths": [],
            "improvement_suggestions": ["No image available"],
            "marketability": "Unknown",
            "recommendation": "❌ NO IMAGE"
        }

    def _error_score(self, error_msg: str) -> Dict:
        return {
            "professional_score": 0.0,
            "quality_score": 0.0,
            "branding_score": 0.0,
            "composition_score": 0.0,
            "file_size_mb": 0.0,
            "image_quality": "Error",
            "professional_rating": "Error",
            "key_strengths": [],
            "improvement_suggestions": [f"Error: {error_msg}"],
            "marketability": "Cannot assess",
            "recommendation": f"❌ ERROR"
        }

def vision_score(image_path):
    analyzer = ProfessionalVisionAnalyzer()
    return analyzer.analyze_image(image_path)

if __name__ == "__main__":
    try:
        img_path = sys.argv[1] if len(sys.argv) > 1 else ""
        result = vision_score(img_path)
        print(json.dumps(result))
    except Exception as e:
        error_result = {
            "professional_score": 0.0,
            "error": str(e)
        }
        print(json.dumps(error_result))

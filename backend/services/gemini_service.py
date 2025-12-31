import os
import json
import google.generativeai as genai
from typing import Dict, List, Any
from services.chapter_loader import build_ai_context

class GeminiService:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('models/gemini-2.5-flash-lite')
    
    def _safe_generate_content(self, prompt: str, fallback_prompt: str = None) -> str:
        """
        Safely generate content with fallback if prompt is empty or null.
        Ensures Gemini is NEVER called with an empty prompt.
        """
        # Check if prompt is None, empty, or whitespace-only
        if prompt is None or not prompt or not prompt.strip():
            if fallback_prompt and fallback_prompt.strip():
                prompt = fallback_prompt
            else:
                # Default fallback if no fallback provided
                prompt = "Explain the basics of chemistry in simple terms."
        
        # Final safety check - ensure prompt is not empty before calling Gemini
        if not prompt or not prompt.strip():
            raise ValueError("Cannot call Gemini with empty prompt. Fallback prompt is also empty.")
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip() if response.text else ""
        except Exception as e:
            raise Exception(f"Error generating content: {str(e)}")
    
    def generate_diagnostic(self, chapter: str) -> Dict[str, Any]:
        """
        Generate diagnostic test for a chapter using Gemini API
        """
        # Load chapter data from database
        chapter_data = build_ai_context(chapter)
        
        if "error" in chapter_data:
            return {"error": "NO_DATA_AVAILABLE"}
        
        syllabus = chapter_data.get('syllabus', '')
        past_paper_text = chapter_data.get('past_paper_text', '')
        answer_key_text = chapter_data.get('answer_key_text', '')
        
        # Check if we have any content
        if not syllabus and not past_paper_text and not answer_key_text:
            return {"error": "NO_DATA_AVAILABLE"}
        
        prompt = f"""You are an expert Cambridge O Level Chemistry examiner.

Chapter: {chapter}

SYLLABUS CONTENT:
{syllabus}

PAST PAPER QUESTIONS:
{past_paper_text}

ANSWER KEY:
{answer_key_text}

Your task:
- Generate 6-8 MCQs for the chapter "{chapter}"
- Use ONLY the content provided above
- Categorize questions into:
  - Basic
  - Conceptual
  - Application
- Output STRICT JSON
- Do NOT explain
- Do NOT invent questions
- Base questions on the syllabus, past papers, and answer key provided

Expected Output format:
{{
  "chapter": "{chapter}",
  "diagnostic_test": [
    {{
      "bucket": "Basic",
      "question": "Question text here?",
      "type": "MCQ",
      "options": ["A", "B", "C", "D"],
      "answer": "B",
      "marks": 1
    }}
  ]
}}

Generate diagnostic test for {chapter} chapter. Return JSON only, no explanations."""

        # Fallback prompt if main prompt is empty - ensure it's never empty
        fallback_prompt = f"Run a basic diagnostic explanation for {chapter}."

        try:
            response_text = self._safe_generate_content(prompt, fallback_prompt)
            
            # Clean response text (remove markdown code blocks if present)
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            # Parse JSON
            diagnostic = json.loads(response_text)
            
            # Validate structure
            if "error" in diagnostic:
                return diagnostic
            
            if "diagnostic_test" not in diagnostic:
                return {"error": "Invalid response format from AI"}
            
            # Ensure all questions have required fields
            for question in diagnostic.get("diagnostic_test", []):
                if "options" not in question:
                    question["options"] = ["A", "B", "C", "D"]
                if "type" not in question:
                    question["type"] = "MCQ"
                if "marks" not in question:
                    question["marks"] = 1
            
            return diagnostic
            
        except json.JSONDecodeError as e:
            return {"error": f"Failed to parse AI response: {str(e)}"}
        except Exception as e:
            return {"error": f"AI generation failed: {str(e)}"}
    
    def generate_roadmap(self, profile: Dict, results: List[Dict]) -> Dict[str, Any]:
        """
        Generate AI roadmap based on student profile and diagnostic results
        """
        # Prepare input data
        onboarding_data = {
            "student_type": profile.get("student_type"),
            "confidence_level": profile.get("confidence_level"),
            "difficult_areas": profile.get("difficult_areas", []),
            "target_grade": profile.get("target_grade"),
            "study_hours": profile.get("study_hours"),
            "exam_session": profile.get("exam_session")
        }
        
        diagnostic_summary = []
        for result in results:
            diagnostic_summary.append({
                "chapter": result.get("chapter"),
                "passed": result.get("passed"),
                "percentage": result.get("percentage"),
                "bucket_scores": result.get("bucket_scores", {})
            })
        
        prompt = f"""You are an academic planner for Cambridge O Level Chemistry.

Input:
- Student onboarding: {json.dumps(onboarding_data)}
- Diagnostic results: {json.dumps(diagnostic_summary)}

Output:
- Weekly roadmap
- Topics per week
- Priority order
- Reasoning

Rules:
- JSON only
- No teaching
- No explanations
- Focus on weak areas from diagnostics
- Align with target grade and study hours

Expected format:
{{
  "weekly_roadmap": [
    {{
      "week": 1,
      "topics": ["topic1", "topic2"],
      "priority": "high",
      "reasoning": "brief reason"
    }}
  ],
  "estimated_completion": "X weeks",
  "focus_areas": ["area1", "area2"]
}}

Generate roadmap. Return JSON only."""

        fallback_prompt = """Create a 4-week study plan for O-Level Chemistry. Return JSON with weekly topics and priorities."""

        try:
            response_text = self._safe_generate_content(prompt, fallback_prompt)
            
            # Clean response text
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            roadmap = json.loads(response_text)
            
            # Validate structure
            if "weekly_roadmap" not in roadmap:
                return {"error": "Invalid roadmap format from AI"}
            
            return roadmap
            
        except json.JSONDecodeError as e:
            return {"error": f"Failed to parse roadmap: {str(e)}"}
        except Exception as e:
            return {"error": f"Roadmap generation failed: {str(e)}"}


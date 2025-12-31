import os
import json
import re
import google.generativeai as genai
from typing import Dict, Optional, List, Tuple
from services.chapter_loader import build_ai_context
from services.gemini_service import GeminiService

class TutorService:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('models/gemini-2.5-flash-lite')
    
    def _safe_generate_content(self, prompt: str, fallback_prompt: str = None) -> str:
        """Safely generate content with fallback if prompt is empty"""
        if not prompt or prompt.strip() == "":
            if fallback_prompt:
                prompt = fallback_prompt
            else:
                prompt = "Explain the basics of chemistry in simple terms."
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip() if response.text else ""
        except Exception as e:
            raise Exception(f"Error generating content: {str(e)}")
    
    def _build_teaching_prompt(self, chapter_data: Dict) -> str:
        syllabus = chapter_data.get('syllabus', '')
        past_paper_text = chapter_data.get('past_paper_text', '')
        answer_key_text = chapter_data.get('answer_key_text', '')
        chapter_name = chapter_data.get('chapter', '')
        
        prompt = f"""You are a friendly and patient O-Level Chemistry teacher teaching the chapter: {chapter_name}

YOUR TEACHING STYLE:
- Use simple, clear language suitable for O-Level students
- Explain concepts step-by-step
- Use examples from the syllabus and past papers
- Focus on exam-relevant content
- Be encouraging and supportive
- Use clear headings to organize content

AVAILABLE CONTENT:
SYLLABUS:
{syllabus}

PAST PAPER QUESTIONS:
{past_paper_text}

ANSWER KEY:
{answer_key_text}

TASK:
Provide a comprehensive, step-by-step explanation of the {chapter_name} chapter. Structure your explanation with clear headings. Cover all key concepts from the syllabus. Use examples from past papers where relevant. Make it exam-focused and easy to understand.

Start your explanation now:"""
        
        return prompt
    
    def _build_question_prompt(self, chapter_data: Dict, student_question: str) -> str:
        syllabus = chapter_data.get('syllabus', '')
        past_paper_text = chapter_data.get('past_paper_text', '')
        answer_key_text = chapter_data.get('answer_key_text', '')
        chapter_name = chapter_data.get('chapter', '')
        
        prompt = f"""You are an O-Level Chemistry tutor answering a student's question about {chapter_name}.

STUDENT'S QUESTION:
{student_question}

AVAILABLE SOURCES (USE ONLY THESE):
SYLLABUS:
{syllabus}

PAST PAPER QUESTIONS:
{past_paper_text}

ANSWER KEY:
{answer_key_text}

RULES:
1. Answer ONLY using information from the syllabus, past papers, or answer key above
2. If the question cannot be answered using these sources, respond with: "This is outside the syllabus."
3. Be clear, step-by-step, and exam-focused
4. Use simple language
5. Reference specific examples from past papers if relevant

Provide your answer:"""
        
        return prompt
    
    def _generate_response(self, prompt: str) -> str:
        fallback_prompt = "Explain the basics of chemistry in simple terms."
        try:
            response_text = self._safe_generate_content(prompt, fallback_prompt)
            return response_text
        except Exception as e:
            return f"Error generating response: {str(e)}"
    
    def _check_answer_in_sources(self, question: str, chapter_data: Dict) -> bool:
        combined_text = (
            chapter_data.get('syllabus', '') + ' ' +
            chapter_data.get('past_paper_text', '') + ' ' +
            chapter_data.get('answer_key_text', '')
        ).lower()
        
        question_keywords = question.lower().split()
        relevant_keywords = [kw for kw in question_keywords if len(kw) > 3]
        
        if not relevant_keywords:
            return False
        
        matches = sum(1 for keyword in relevant_keywords if keyword in combined_text)
        relevance_score = matches / len(relevant_keywords) if relevant_keywords else 0
        
        return relevance_score >= 0.3
    
    def tutor_response(self, chapter_name: str, student_question: Optional[str] = None) -> Dict:
        chapter_data = build_ai_context(chapter_name)
        
        if "error" in chapter_data:
            return {
                "chapter": chapter_name,
                "mode": "error",
                "response": chapter_data["error"]
            }
        
        if student_question:
            if not self._check_answer_in_sources(student_question, chapter_data):
                return {
                    "chapter": chapter_name,
                    "mode": "question",
                    "response": "This is outside the syllabus."
                }
            
            prompt = self._build_question_prompt(chapter_data, student_question)
            response_text = self._generate_response(prompt)
            
            if "outside the syllabus" in response_text.lower() or "not found" in response_text.lower():
                return {
                    "chapter": chapter_name,
                    "mode": "question",
                    "response": "This is outside the syllabus."
                }
            
            return {
                "chapter": chapter_name,
                "mode": "question",
                "response": response_text
            }
        else:
            prompt = self._build_teaching_prompt(chapter_data)
            response_text = self._generate_response(prompt)
            
            return {
                "chapter": chapter_name,
                "mode": "teaching",
                "response": response_text
            }

def tutor_response(chapter_name: str, student_question: Optional[str] = None) -> Dict:
    service = TutorService()
    return service.tutor_response(chapter_name, student_question)

def _extract_keywords(question: str) -> List[str]:
    question_lower = question.lower()
    stop_words = {'what', 'is', 'are', 'the', 'a', 'an', 'how', 'why', 'when', 'where', 'which', 'who', 'does', 'do', 'can', 'could', 'will', 'would', 'should', 'this', 'that', 'these', 'those', 'to', 'from', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'into', 'onto', 'of', 'and', 'or', 'but', 'if', 'then', 'than', 'as', 'be', 'been', 'being', 'have', 'has', 'had', 'was', 'were', 'been', 'being', 'question', 'questions'}
    words = re.findall(r'\b\w+\b', question_lower)
    keywords = [w for w in words if len(w) > 2 and w not in stop_words]
    return keywords

def _find_relevant_sections(text: str, keywords: List[str]) -> List[Tuple[str, int]]:
    if not text or not keywords:
        return []
    
    text_lower = text.lower()
    sentences = re.split(r'[.!?]\s+', text)
    relevant_sections = []
    
    for sentence in sentences:
        if not sentence.strip():
            continue
        
        sentence_lower = sentence.lower()
        keyword_matches = sum(1 for keyword in keywords if keyword in sentence_lower)
        relevance_score = keyword_matches / len(keywords) if keywords else 0
        
        if relevance_score > 0:
            relevant_sections.append((sentence.strip(), relevance_score))
    
    relevant_sections.sort(key=lambda x: x[1], reverse=True)
    return relevant_sections[:5]

def _extract_answer_from_content(question: str, chapter_data: Dict) -> Optional[str]:
    syllabus = chapter_data.get('syllabus', '')
    past_paper_text = chapter_data.get('past_paper_text', '')
    answer_key_text = chapter_data.get('answer_key_text', '')
    
    all_content = {
        'syllabus': syllabus,
        'past_papers': past_paper_text,
        'answer_key': answer_key_text
    }
    
    keywords = _extract_keywords(question)
    if not keywords:
        return None
    
    combined_sections = []
    for source_name, source_text in all_content.items():
        if not source_text:
            continue
        
        sections = _find_relevant_sections(source_text, keywords)
        for section, score in sections:
            combined_sections.append((section, score, source_name))
    
    if not combined_sections:
        return None
    
    combined_sections.sort(key=lambda x: x[1], reverse=True)
    top_sections = [section for section, _, _ in combined_sections[:3]]
    
    if top_sections:
        answer = ' '.join(top_sections)
        answer = re.sub(r'\s+', ' ', answer).strip()
        if len(answer) > 50:
            return answer
        elif len(answer) > 20:
            return answer
    
    question_lower = question.lower()
    for source_name, source_text in all_content.items():
        if not source_text:
            continue
        
        source_lower = source_text.lower()
        for keyword in keywords:
            if keyword in source_lower:
                keyword_index = source_lower.find(keyword)
                start = max(0, keyword_index - 100)
                end = min(len(source_text), keyword_index + len(keyword) + 200)
                excerpt = source_text[start:end].strip()
                if len(excerpt) > 30:
                    return excerpt
    
    return None

def answer_question(chapter_name: str, question: str) -> Dict:
    chapter_data = build_ai_context(chapter_name)
    
    if "error" in chapter_data:
        return {
            "chapter": chapter_name,
            "question": question,
            "answer": f"Error: {chapter_data['error']}"
        }
    
    if not question or not question.strip():
        return {
            "chapter": chapter_name,
            "question": question,
            "answer": "This question is outside the syllabus."
        }
    
    answer = _extract_answer_from_content(question, chapter_data)
    
    if not answer:
        return {
            "chapter": chapter_name,
            "question": question,
            "answer": "This question is outside the syllabus."
        }
    
    answer_clean = answer.strip()
    if len(answer_clean) < 20:
        return {
            "chapter": chapter_name,
            "question": question,
            "answer": "This question is outside the syllabus."
        }
    
    return {
        "chapter": chapter_name,
        "question": question,
        "answer": answer_clean
    }

def _build_mcq_prompt(chapter_data: Dict, difficulty: str, count: int) -> str:
    syllabus = chapter_data.get('syllabus', '')
    past_paper_text = chapter_data.get('past_paper_text', '')
    answer_key_text = chapter_data.get('answer_key_text', '')
    chapter_name = chapter_data.get('chapter', '')
    
    difficulty_guidance = {
        'easy': 'Focus on definitions, direct facts, and basic recall. Questions should test simple knowledge from the syllabus.',
        'medium': 'Focus on calculations, concepts, and understanding. Questions should require some thinking and application of concepts.',
        'hard': 'Focus on complex application, reasoning, and problem-solving. Questions should require deep understanding and multiple steps.'
    }
    
    prompt = f"""You are an O-Level Chemistry exam question writer. Generate {count} multiple-choice questions (MCQs) for the chapter: {chapter_name}

DIFFICULTY LEVEL: {difficulty.upper()}
{difficulty_guidance.get(difficulty, difficulty_guidance['medium'])}

STRICT RULES:
1. Use ONLY information from the sources provided below
2. Do NOT use any outside knowledge
3. Do NOT invent facts or concepts
4. Questions must be exam-style (O-Level format)
5. Each question must have exactly 4 options (A, B, C, D)
6. Only ONE correct answer per question
7. Options must be plausible and related to the topic
8. Include a brief explanation for each answer

AVAILABLE SOURCES (USE ONLY THESE):
SYLLABUS:
{syllabus}

PAST PAPER QUESTIONS:
{past_paper_text}

ANSWER KEY:
{answer_key_text}

OUTPUT FORMAT (JSON only, no explanations):
{{
  "mcqs": [
    {{
      "question": "Question text here?",
      "options": {{
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      }},
      "correct_answer": "B",
      "explanation": "Brief explanation of why this is correct"
    }}
  ]
}}

Generate {count} {difficulty} difficulty MCQs. Return JSON only, no other text."""

    return prompt

def generate_mcqs(chapter_name: str, difficulty: str = "medium", count: int = 5) -> Dict:
    valid_difficulties = ['easy', 'medium', 'hard']
    if difficulty.lower() not in valid_difficulties:
        difficulty = 'medium'
    
    if count < 1 or count > 20:
        count = 5
    
    chapter_data = build_ai_context(chapter_name)
    
    if "error" in chapter_data:
        return {
            "chapter": chapter_name,
            "difficulty": difficulty,
            "mcqs": [],
            "error": chapter_data["error"]
        }
    
    syllabus = chapter_data.get('syllabus', '')
    past_paper_text = chapter_data.get('past_paper_text', '')
    answer_key_text = chapter_data.get('answer_key_text', '')
    
    if not syllabus and not past_paper_text and not answer_key_text:
        return {
            "chapter": chapter_name,
            "difficulty": difficulty,
            "mcqs": [],
            "error": "No chapter content available"
        }
    
    try:
        service = TutorService()
        prompt = _build_mcq_prompt(chapter_data, difficulty, count)
        response = service._generate_response(prompt)
        
        response_text = response.strip()
        
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        mcq_data = json.loads(response_text)
        
        if "mcqs" not in mcq_data:
            return {
                "chapter": chapter_name,
                "difficulty": difficulty,
                "mcqs": [],
                "error": "Invalid response format"
            }
        
        mcqs = mcq_data.get("mcqs", [])
        
        for mcq in mcqs:
            if "options" not in mcq:
                mcq["options"] = {"A": "", "B": "", "C": "", "D": ""}
            if "correct_answer" not in mcq:
                mcq["correct_answer"] = "A"
            if "explanation" not in mcq:
                mcq["explanation"] = "Explanation not provided"
        
        return {
            "chapter": chapter_name,
            "difficulty": difficulty,
            "mcqs": mcqs
        }
        
    except json.JSONDecodeError as e:
        return {
            "chapter": chapter_name,
            "difficulty": difficulty,
            "mcqs": [],
            "error": f"Failed to parse MCQ response: {str(e)}"
        }
    except Exception as e:
        return {
            "chapter": chapter_name,
            "difficulty": difficulty,
            "mcqs": [],
            "error": f"Error generating MCQs: {str(e)}"
        }

def ai_tutor_controller(input_data: Dict) -> Dict:
    if not isinstance(input_data, dict):
        return {
            "status": "error",
            "mode": "unknown",
            "chapter": "",
            "data": {},
            "error": "Invalid input: input_data must be a dictionary"
        }
    
    chapter = input_data.get("chapter", "").strip()
    mode = input_data.get("mode", "").strip().lower()
    
    if not chapter:
        return {
            "status": "error",
            "mode": mode,
            "chapter": "",
            "data": {},
            "error": "Chapter name is required"
        }
    
    if mode not in ["teach", "question", "mcq"]:
        return {
            "status": "error",
            "mode": mode,
            "chapter": chapter,
            "data": {},
            "error": f"Invalid mode: '{mode}'. Must be 'teach', 'question', or 'mcq'"
        }
    
    try:
        if mode == "teach":
            result = tutor_response(chapter)
            return {
                "status": "success",
                "mode": "teach",
                "chapter": chapter,
                "data": {
                    "response": result.get("response", ""),
                    "mode": result.get("mode", "teaching")
                }
            }
        
        elif mode == "question":
            question = input_data.get("question", "").strip()
            if not question:
                return {
                    "status": "error",
                    "mode": "question",
                    "chapter": chapter,
                    "data": {},
                    "error": "Question is required for question mode"
                }
            
            result = answer_question(chapter, question)
            return {
                "status": "success",
                "mode": "question",
                "chapter": chapter,
                "data": {
                    "question": result.get("question", ""),
                    "answer": result.get("answer", "")
                }
            }
        
        elif mode == "mcq":
            difficulty = input_data.get("difficulty", "medium").strip().lower()
            if difficulty not in ["easy", "medium", "hard"]:
                difficulty = "medium"
            
            mcq_count = input_data.get("mcq_count", 5)
            try:
                mcq_count = int(mcq_count)
                if mcq_count < 1 or mcq_count > 20:
                    mcq_count = 5
            except (ValueError, TypeError):
                mcq_count = 5
            
            result = generate_mcqs(chapter, difficulty, mcq_count)
            
            if "error" in result:
                return {
                    "status": "error",
                    "mode": "mcq",
                    "chapter": chapter,
                    "data": {},
                    "error": result.get("error", "Unknown error generating MCQs")
                }
            
            return {
                "status": "success",
                "mode": "mcq",
                "chapter": chapter,
                "data": {
                    "difficulty": result.get("difficulty", difficulty),
                    "mcqs": result.get("mcqs", [])
                }
            }
    
    except Exception as e:
        return {
            "status": "error",
            "mode": mode,
            "chapter": chapter,
            "data": {},
            "error": f"Error processing request: {str(e)}"
        }

if __name__ == "__main__":
    result = tutor_response("Stoichiometry")
    print(json.dumps(result, indent=2))
    
    print("\n" + "="*50 + "\n")
    
    qa_result = answer_question("Stoichiometry", "What is a limiting reagent?")
    print(json.dumps(qa_result, indent=2))
    
    print("\n" + "="*50 + "\n")
    
    mcq_result = generate_mcqs("Stoichiometry", "medium", 5)
    print(json.dumps(mcq_result, indent=2))
    
    print("\n" + "="*50 + "\n")
    print("CONTROLLER TEST CASES:")
    print("="*50 + "\n")
    
    test1 = ai_tutor_controller({
        "chapter": "Stoichiometry",
        "mode": "teach"
    })
    print("Test 1 - Teach Mode:")
    print(json.dumps(test1, indent=2))
    
    print("\n" + "-"*50 + "\n")
    
    test2 = ai_tutor_controller({
        "chapter": "Stoichiometry",
        "mode": "question",
        "question": "What is limiting reagent?"
    })
    print("Test 2 - Question Mode:")
    print(json.dumps(test2, indent=2))
    
    print("\n" + "-"*50 + "\n")
    
    test3 = ai_tutor_controller({
        "chapter": "Stoichiometry",
        "mode": "mcq",
        "difficulty": "medium",
        "mcq_count": 5
    })
    print("Test 3 - MCQ Mode:")
    print(json.dumps(test3, indent=2))


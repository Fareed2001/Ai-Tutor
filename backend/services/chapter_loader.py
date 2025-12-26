import os
import requests
import pdfplumber
from typing import Dict, Optional
from io import BytesIO
from supabase import create_client, Client

class ChapterLoader:
    def __init__(self):
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required")
        
        self.supabase: Client = create_client(url, key)
    
    def get_chapter_data(self, chapter_name: str) -> Optional[Dict]:
        try:
            response = self.supabase.table('chemistry_chapters')\
                .select('*')\
                .eq('chapter_name', chapter_name)\
                .single()\
                .execute()
            
            if response.data:
                return {
                    'chapter_name': response.data.get('chapter_name'),
                    'syllabus': response.data.get('syllabus_text'),
                    'syllabus_pdf_url': response.data.get('syllabus_pdf_url'),
                    'past_paper_pdf_url': response.data.get('past_paper_pdf_url'),
                    'answer_key_pdf_url': response.data.get('answer_key_pdf_url')
                }
            return None
        except Exception as e:
            print(f"Error fetching chapter data: {e}")
            return None
    
    def extract_pdf_text(self, pdf_url: str) -> str:
        if not pdf_url:
            return ""
        
        try:
            response = requests.get(pdf_url, timeout=30)
            response.raise_for_status()
            
            pdf_bytes = BytesIO(response.content)
            
            text_content = []
            with pdfplumber.open(pdf_bytes) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_content.append(page_text)
            
            return "\n\n".join(text_content).strip()
        except requests.RequestException as e:
            print(f"Error downloading PDF: {e}")
            return ""
        except Exception as e:
            print(f"Error extracting PDF text: {e}")
            return ""
    
    def build_ai_context(self, chapter_name: str) -> Dict:
        chapter_data = self.get_chapter_data(chapter_name)
        
        if not chapter_data:
            return {
                "error": f"Chapter '{chapter_name}' not found in database"
            }
        
        syllabus = chapter_data.get('syllabus', '')
        past_paper_url = chapter_data.get('past_paper_pdf_url', '')
        answer_key_url = chapter_data.get('answer_key_pdf_url', '')
        
        past_paper_text = self.extract_pdf_text(past_paper_url)
        answer_key_text = self.extract_pdf_text(answer_key_url)
        
        ai_prompt_ready = f"""Chapter: {chapter_name}

SYLLABUS CONTENT:
{syllabus}

PAST PAPER QUESTIONS:
{past_paper_text}

ANSWER KEY:
{answer_key_text}

---
Use the above information to generate educational content, questions, and explanations for the {chapter_name} chapter."""
        
        return {
            "chapter": chapter_name,
            "syllabus": syllabus,
            "past_paper_text": past_paper_text,
            "answer_key_text": answer_key_text,
            "ai_prompt_ready": ai_prompt_ready
        }

def get_chapter_data(chapter_name: str) -> Optional[Dict]:
    loader = ChapterLoader()
    return loader.get_chapter_data(chapter_name)

def extract_pdf_text(pdf_url: str) -> str:
    loader = ChapterLoader()
    return loader.extract_pdf_text(pdf_url)

def build_ai_context(chapter_name: str) -> Dict:
    loader = ChapterLoader()
    return loader.build_ai_context(chapter_name)


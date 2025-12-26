import os
from supabase import create_client, Client
from typing import Dict, List, Any, Optional
from datetime import datetime

class SupabaseService:
    def __init__(self):
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required")
        
        self.supabase: Client = create_client(url, key)
    
    def get_student_profile(self, user_id: str) -> Optional[Dict]:
        """Get student profile by user_id"""
        try:
            response = self.supabase.table('student_profile').select('*').eq('user_id', user_id).single().execute()
            return response.data if response.data else None
        except Exception:
            return None
    
    def save_diagnostic(self, user_id: str, chapter: str, diagnostic: Dict) -> str:
        """Save diagnostic test to database"""
        data = {
            'user_id': user_id,
            'chapter': chapter,
            'test_data': diagnostic,
            'created_at': datetime.utcnow().isoformat()
        }
        
        response = self.supabase.table('diagnostics').insert(data).execute()
        return response.data[0]['id'] if response.data else None
    
    def get_diagnostic(self, diagnostic_id: str) -> Optional[Dict]:
        """Get diagnostic by ID"""
        try:
            response = self.supabase.table('diagnostics').select('*').eq('id', diagnostic_id).single().execute()
            return response.data if response.data else None
        except Exception:
            return None
    
    def save_diagnostic_result(self, result_data: Dict) -> str:
        """Save diagnostic result"""
        response = self.supabase.table('diagnostic_results').insert(result_data).execute()
        return response.data[0]['id'] if response.data else None
    
    def get_diagnostic_result(self, user_id: str, chapter: str) -> Optional[Dict]:
        """Get existing diagnostic result for user and chapter"""
        try:
            response = self.supabase.table('diagnostic_results').select('*').eq('user_id', user_id).eq('chapter', chapter).single().execute()
            return response.data if response.data else None
        except Exception:
            return None
    
    def get_user_diagnostic_results(self, user_id: str) -> List[Dict]:
        """Get all diagnostic results for a user"""
        try:
            response = self.supabase.table('diagnostic_results').select('*').eq('user_id', user_id).order('submitted_at', desc=True).execute()
            return response.data if response.data else []
        except Exception:
            return []
    
    def save_roadmap(self, user_id: str, roadmap: Dict) -> str:
        """Save roadmap to database"""
        data = {
            'user_id': user_id,
            'roadmap_data': roadmap,
            'created_at': datetime.utcnow().isoformat()
        }
        
        response = self.supabase.table('roadmaps').insert(data).execute()
        return response.data[0]['id'] if response.data else None
    
    def get_roadmap(self, user_id: str) -> Optional[Dict]:
        """Get roadmap for user"""
        try:
            response = self.supabase.table('roadmaps').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(1).execute()
            if response.data and len(response.data) > 0:
                return response.data[0].get('roadmap_data')
            return None
        except Exception:
            return None


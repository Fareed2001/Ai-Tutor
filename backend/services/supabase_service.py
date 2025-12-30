import os
import requests
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
            'created_at': datetime.utcnow().isoformat(),
            'remaining_time_seconds': 30 * 60  # Initialize with full 30 minutes
        }
        
        response = self.supabase.table('diagnostics').insert(data).execute()
        return response.data[0]['id'] if response.data else None
    
    def update_diagnostic_timer(self, diagnostic_id: str, remaining_time_seconds: int) -> bool:
        """Update remaining time for diagnostic"""
        try:
            response = self.supabase.table('diagnostics').update({
                'remaining_time_seconds': max(0, remaining_time_seconds)
            }).eq('id', diagnostic_id).execute()
            return True
        except Exception:
            return False
    
    def get_diagnostic(self, diagnostic_id: str) -> Optional[Dict]:
        """Get diagnostic by ID"""
        try:
            response = self.supabase.table('diagnostics').select('*').eq('id', diagnostic_id).single().execute()
            return response.data if response.data else None
        except Exception:
            return None
    
    def get_existing_diagnostic(self, user_id: str, chapter: str) -> Optional[Dict]:
        """Get existing diagnostic for user and chapter (even if not submitted)"""
        try:
            response = self.supabase.table('diagnostics').select('*').eq('user_id', user_id).eq('chapter', chapter).order('created_at', desc=True).limit(1).execute()
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
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
    
    def get_user_by_username(self, username: str) -> Optional[Dict]:
        """Get user profile by username"""
        try:
            response = self.supabase.table('user_profile').select('*').eq('username', username.lower()).single().execute()
            return response.data if response.data else None
        except Exception:
            return None
    
    def update_user_password(self, user_id: str, new_password: str) -> bool:
        """Update user password using Supabase Admin API via REST"""
        try:
            import requests
            
            url = os.getenv('SUPABASE_URL')
            service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
            
            if not url or not service_role_key:
                raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")
            
            # Use Supabase Admin API REST endpoint
            admin_url = f"{url}/auth/v1/admin/users/{user_id}"
            headers = {
                "apikey": service_role_key,
                "Authorization": f"Bearer {service_role_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "password": new_password
            }
            
            response = requests.put(admin_url, json=payload, headers=headers)
            
            if response.status_code in [200, 204]:
                return True
            else:
                print(f"Error updating password: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"Error updating password: {str(e)}")
            return False


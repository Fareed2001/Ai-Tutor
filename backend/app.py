from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import json
from datetime import datetime
from services.gemini_service import GeminiService
from services.supabase_service import SupabaseService
from utils.validators import validate_diagnostic_request, validate_submission

load_dotenv()

app = Flask(__name__)

# CORS Configuration - Production-safe defaults
# Allow specific origins from environment variable, fallback to wildcard for development
frontend_url = os.getenv("FRONTEND_URL", "")
allowed_origins = []

# Add environment-based frontend URL if provided
if frontend_url:
    allowed_origins.append(frontend_url)

# In production, use specific origins; in development, allow all
# Render sets RENDER environment variable, or we can check for production mode
is_production = os.getenv("FLASK_ENV") == "production" or os.getenv("RENDER") == "true"

if is_production and allowed_origins:
    # Production: Use specific allowed origins
    CORS(app, 
         origins=allowed_origins,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         supports_credentials=False)
else:
    # Development: Allow all origins (for local development)
    CORS(app, 
         origins="*", 
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         supports_credentials=False)

# Initialize services
gemini_service = GeminiService()
supabase_service = SupabaseService()

# Fetch available chapters from database
def get_available_chapters():
    """Fetch available chapters from chemistry_chapters table"""
    try:
        chapters = supabase_service.get_available_chapters()
        if chapters:
            return chapters
        else:
            # Fallback to default if database query fails
            print("Warning: No chapters found in database, using default")
            return ["Stoichiometry"]
    except Exception as e:
        print(f"Error loading chapters from database: {str(e)}")
        # Fallback to default if there's an error
        return ["Stoichiometry"]

AVAILABLE_CHAPTERS = get_available_chapters()

@app.route('/', methods=['GET'])
def root():
    """Root health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "ChemMentor AI Backend",
        "version": "1.0.0"
    }), 200

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy"}), 200

@app.route('/reset-password', methods=['POST'])
def reset_password():
    """
    Reset user password by username
    Uses service role to update password directly (no email verification needed for dummy emails)
    """
    try:
        data = request.json
        username = data.get('username')
        new_password = data.get('new_password')
        
        # Validate request
        if not username or not new_password:
            return jsonify({"error": "Missing username or new_password"}), 400
        
        if len(new_password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long"}), 400
        
        # Normalize username
        normalized_username = username.lower()
        
        # Get user profile by username
        user_profile = supabase_service.get_user_by_username(normalized_username)
        if not user_profile:
            return jsonify({"error": "Username not found"}), 404
        
        user_id = user_profile.get('id')
        if not user_id:
            return jsonify({"error": "Invalid user profile"}), 400
        
        # Update password using service role
        success = supabase_service.update_user_password(user_id, new_password)
        if not success:
            return jsonify({"error": "Failed to update password"}), 500
        
        return jsonify({"message": "Password reset successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate-diagnostic', methods=['POST'])
def generate_diagnostic():
    try:
        data = request.json
        user_id = data.get('user_id')
        chapter = data.get('chapter')
        
        # Validate request
        if not user_id or not chapter:
            return jsonify({"error": "Missing user_id or chapter"}), 400
        
        if chapter not in AVAILABLE_CHAPTERS:
            return jsonify({"error": f"Chapter '{chapter}' not available"}), 400
        
        # Check if user has already submitted diagnostic for this chapter
        existing_result = supabase_service.get_diagnostic_result(user_id, chapter)
        if existing_result:
            return jsonify({
                "error": "Diagnostic already completed"
            }), 400
        
        # Check if diagnostic was already generated (even if not submitted)
        # If exists, return it instead of generating new one (prevents Gemini call)
        existing_diagnostic = supabase_service.get_existing_diagnostic(user_id, chapter)
        if existing_diagnostic:
            test_data = existing_diagnostic.get('test_data', {})
            
            return jsonify({
                "diagnostic_id": existing_diagnostic.get('id'),
                "chapter": chapter,
                "diagnostic_test": test_data.get("diagnostic_test", []),
                "total_questions": len(test_data.get("diagnostic_test", [])),
                "time_limit": 30,
                "created_at": existing_diagnostic.get('created_at'),
                "is_existing": True  # Flag to indicate this is an existing diagnostic
            }), 200
        
        # Generate diagnostic using Gemini (only if no existing diagnostic found)
        diagnostic = gemini_service.generate_diagnostic(chapter)
        
        if diagnostic.get("error"):
            return jsonify(diagnostic), 400
        
        # Store diagnostic in database
        diagnostic_id = supabase_service.save_diagnostic(user_id, chapter, diagnostic)
        
        # Get the saved diagnostic to return created_at
        saved_diagnostic = supabase_service.get_diagnostic(diagnostic_id)
        created_at = saved_diagnostic.get('created_at') if saved_diagnostic else None
        
        return jsonify({
            "diagnostic_id": diagnostic_id,
            "chapter": chapter,
            "diagnostic_test": diagnostic.get("diagnostic_test", []),
            "total_questions": len(diagnostic.get("diagnostic_test", [])),
            "time_limit": 30,
            "created_at": created_at,
            "is_existing": False  # Flag to indicate this is a newly generated diagnostic
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get-diagnostic', methods=['POST'])
def get_diagnostic():
    """
    Get existing diagnostic for user and chapter (if exists)
    Returns existing diagnostic without generating new one
    """
    try:
        data = request.json
        user_id = data.get('user_id')
        chapter = data.get('chapter')
        
        # Validate request
        if not user_id or not chapter:
            return jsonify({"error": "Missing user_id or chapter"}), 400
        
        if chapter not in AVAILABLE_CHAPTERS:
            return jsonify({"error": f"Chapter '{chapter}' not available"}), 400
        
        # Check if diagnostic was already generated
        existing_diagnostic = supabase_service.get_existing_diagnostic(user_id, chapter)
        if existing_diagnostic:
            test_data = existing_diagnostic.get('test_data', {})
            
            return jsonify({
                "diagnostic_id": existing_diagnostic.get('id'),
                "chapter": chapter,
                "diagnostic_test": test_data.get("diagnostic_test", []),
                "total_questions": len(test_data.get("diagnostic_test", [])),
                "time_limit": 30,
                "created_at": existing_diagnostic.get('created_at'),
                "is_existing": True
            }), 200
        else:
            return jsonify({
                "error": "No existing diagnostic found"
            }), 404
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/submit-diagnostic', methods=['POST'])
def submit_diagnostic():
    try:
        data = request.json
        user_id = data.get('user_id')
        diagnostic_id = data.get('diagnostic_id')
        answers = data.get('answers', {})
        
        if not user_id or not diagnostic_id:
            return jsonify({"error": "Missing user_id or diagnostic_id"}), 400
        
        # Get diagnostic from database
        diagnostic = supabase_service.get_diagnostic(diagnostic_id)
        if not diagnostic:
            return jsonify({"error": "Diagnostic not found"}), 404
        
        # Evaluate answers
        test_data = diagnostic.get('test_data', {})
        questions = test_data.get('diagnostic_test', [])
        
        results = []
        bucket_scores = {"Basic": 0, "Conceptual": 0, "Application": 0}
        bucket_totals = {"Basic": 0, "Conceptual": 0, "Application": 0}
        
        for idx, question in enumerate(questions):
            question_id = str(idx)
            user_answer = answers.get(question_id, "").strip().upper()
            correct_answer = question.get('answer', '').strip().upper()
            bucket = question.get('bucket', 'Basic')
            
            is_correct = user_answer == correct_answer
            bucket_totals[bucket] = bucket_totals.get(bucket, 0) + 1
            
            if is_correct:
                bucket_scores[bucket] = bucket_scores.get(bucket, 0) + 1
            
            results.append({
                "question_id": question_id,
                "question": question.get('question', ''),
                "bucket": bucket,
                "user_answer": user_answer,
                "correct_answer": correct_answer,
                "is_correct": is_correct,
                "marks": question.get('marks', 1)
            })
        
        # Calculate overall score
        total_correct = sum(bucket_scores.values())
        total_questions = len(questions)
        percentage = (total_correct / total_questions * 100) if total_questions > 0 else 0
        
        # Check if passed (all buckets must pass)
        passed = all(
            bucket_scores.get(bucket, 0) > 0 and 
            (bucket_scores.get(bucket, 0) / bucket_totals.get(bucket, 1)) >= 0.5
            for bucket in ["Basic", "Conceptual", "Application"]
            if bucket_totals.get(bucket, 0) > 0
        )
        
        # Save results
        result_data = {
            "user_id": user_id,
            "diagnostic_id": diagnostic_id,
            "chapter": diagnostic.get('chapter'),
            "answers": answers,
            "results": results,
            "bucket_scores": bucket_scores,
            "bucket_totals": bucket_totals,
            "total_correct": total_correct,
            "total_questions": total_questions,
            "percentage": percentage,
            "passed": passed,
            "submitted_at": datetime.utcnow().isoformat()
        }
        
        result_id = supabase_service.save_diagnostic_result(result_data)
        
        return jsonify({
            "result_id": result_id,
            "passed": passed,
            "percentage": round(percentage, 2),
            "total_correct": total_correct,
            "total_questions": total_questions,
            "bucket_scores": bucket_scores,
            "results": results
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/dashboard', methods=['GET'])
def get_dashboard():
    try:
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400
        
        # Get all diagnostic results for user
        results = supabase_service.get_user_diagnostic_results(user_id)
        
        # Get student profile
        profile = supabase_service.get_student_profile(user_id)
        
        # Calculate progress
        attempted_chapters = []
        passed_chapters = []
        
        for result in results:
            chapter = result.get('chapter')
            if chapter:
                attempted_chapters.append(chapter)
                if result.get('passed'):
                    passed_chapters.append(chapter)
        
        # Get roadmap if exists
        roadmap = supabase_service.get_roadmap(user_id)
        
        return jsonify({
            "user_id": user_id,
            "attempted_chapters": list(set(attempted_chapters)),
            "passed_chapters": list(set(passed_chapters)),
            "total_attempted": len(set(attempted_chapters)),
            "total_passed": len(set(passed_chapters)),
            "results": results,
            "profile": profile,
            "roadmap": roadmap
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate-roadmap', methods=['POST'])
def generate_roadmap():
    try:
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400
        
        # Get student profile and diagnostic results
        profile = supabase_service.get_student_profile(user_id)
        results = supabase_service.get_user_diagnostic_results(user_id)
        
        if not profile:
            return jsonify({"error": "Student profile not found"}), 404
        
        # Generate roadmap using Gemini
        roadmap = gemini_service.generate_roadmap(profile, results)
        
        if roadmap.get("error"):
            return jsonify(roadmap), 400
        
        # Save roadmap
        roadmap_id = supabase_service.save_roadmap(user_id, roadmap)
        
        return jsonify({
            "roadmap_id": roadmap_id,
            "roadmap": roadmap
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Production deployment: Use Gunicorn
# Development: Only run Flask dev server if executed directly
if __name__ == '__main__':
    # Only run Flask dev server in development
    # In production, Gunicorn will handle the server
    import sys
    if os.getenv("FLASK_ENV") != "production" and os.getenv("RENDER") != "true":
        app.run(debug=True, port=int(os.getenv("PORT", 5000)))
    else:
        print("Production mode detected. Use 'gunicorn app:app' to start the server.")
        sys.exit(1)


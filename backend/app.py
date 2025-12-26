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
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])

# Initialize services
gemini_service = GeminiService()
supabase_service = SupabaseService()

AVAILABLE_CHAPTERS = ["Stoichiometry"]

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

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
        
        # Check if user has already taken diagnostic for this chapter
        existing = supabase_service.get_diagnostic_result(user_id, chapter)
        if existing:
            return jsonify({
                "error": "Diagnostic already completed for this chapter",
                "existing_result": existing
            }), 400
        
        # Generate diagnostic using Gemini
        diagnostic = gemini_service.generate_diagnostic(chapter)
        
        if diagnostic.get("error"):
            return jsonify(diagnostic), 400
        
        # Store diagnostic in database
        diagnostic_id = supabase_service.save_diagnostic(user_id, chapter, diagnostic)
        
        return jsonify({
            "diagnostic_id": diagnostic_id,
            "chapter": chapter,
            "diagnostic_test": diagnostic.get("diagnostic_test", []),
            "total_questions": len(diagnostic.get("diagnostic_test", [])),
            "time_limit": 30
        }), 200
        
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)


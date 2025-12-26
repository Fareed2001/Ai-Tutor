#!/bin/bash
# Backend startup script

# Activate virtual environment if exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install dependencies if needed
if [ ! -d "venv" ]; then
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
fi

# Run Flask app
python app.py


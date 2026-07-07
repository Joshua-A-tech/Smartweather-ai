import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GROQ_API_KEY')
print(f"GROQ_API_KEY found: {api_key is not None}")

if api_key:
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        print("✅ Groq client created!")
        
        # Try the new model
        response = client.chat.completions.create(
            model="llama3-70b-8192",  # New model
            messages=[{"role": "user", "content": "Say Hello from SmartWeather AI"}],
            max_tokens=20
        )
        print("✅ Groq Response:", response.choices[0].message.content)
    except Exception as e:
        print(f"❌ Groq error: {e}")

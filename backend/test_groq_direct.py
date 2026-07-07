import os
from dotenv import load_dotenv

# Load .env
load_dotenv()

# Print environment variables
api_key = os.getenv('GROQ_API_KEY')
print(f"GROQ_API_KEY found: {api_key is not None}")
print(f"Key length: {len(api_key) if api_key else 0}")
print(f"Key starts with: {api_key[:10] if api_key else 'None'}")

if api_key:
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        print("✅ Groq client created!")
        
        # Test query
        response = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": "Say Hello from SmartWeather AI"}],
            max_tokens=20
        )
        print("✅ Groq Response:", response.choices[0].message.content)
    except Exception as e:
        print(f"❌ Groq error: {e}")

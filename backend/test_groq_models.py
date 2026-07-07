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
        
        # Try different models
        models_to_test = [
            "llama-3.1-70b-versatile",
            "llama-3.1-8b-instant",
            "gemma2-9b-it",
            "mixtral-8x7b-v0.1",
            "llama-3.2-3b-preview",
            "llama-3.2-1b-preview"
        ]
        
        for model in models_to_test:
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": "Hello"}],
                    max_tokens=10
                )
                print(f"✅ {model}: Working!")
                print(f"   Response: {response.choices[0].message.content[:50]}...")
                break
            except Exception as e:
                if "model_decommissioned" in str(e) or "not supported" in str(e):
                    print(f"❌ {model}: Deprecated")
                else:
                    print(f"❌ {model}: {str(e)[:50]}...")
                    
    except Exception as e:
        print(f"❌ Groq error: {e}")

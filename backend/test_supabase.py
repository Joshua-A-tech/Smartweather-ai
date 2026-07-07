import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')

print(f"URL: {url[:30] if url else 'None'}...")
print(f"Key exists: {bool(key)}")

if not url or not key:
    print("❌ Missing Supabase credentials")
    exit()

try:
    client = create_client(url, key)
    response = client.table('weather_data').select('*').limit(5).execute()
    print(f"✅ Found {len(response.data)} records")
    for record in response.data:
        print(f"  - {record.get('temperature')}°C at {record.get('created_at')}")
except Exception as e:
    print(f"❌ Error: {e}")

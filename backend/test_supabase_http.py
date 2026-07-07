import requests
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')

print(f'URL: {url}')
print(f'Key starts with: {key[:20] if key else None}...')

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json'
}

try:
    # Test connection by fetching devices
    response = requests.get(f'{url}/rest/v1/devices?select=*&limit=1', headers=headers)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        print(f'✅ Connected! Found {len(response.json())} devices')
        print(f'Response: {response.json()}')
    else:
        print(f'❌ Error: {response.text}')
except Exception as e:
    print(f'❌ Error: {e}')

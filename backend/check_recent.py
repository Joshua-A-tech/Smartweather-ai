import requests
import os
from dotenv import load_dotenv
load_dotenv()

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

# Check the most recent 10 records
response = requests.get(f'{url}/rest/v1/weather_data?select=*&order=created_at.desc&limit=10', headers=headers)
data = response.json()
print(f'Found {len(data)} records')
print('Most recent 10:')
for record in data:
    created = record.get('created_at', 'N/A')
    temp = record.get('temperature', 'N/A')
    is_raining = record.get('is_raining', 'N/A')
    print(f"  {created}: {temp}°C | Rain: {is_raining}")

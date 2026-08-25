with open('server.ts', 'r', encoding='utf-8') as f:
    server_code = f.read()

endpoints = [
    '/api/properties',
    '/api/resident-services',
    '/api/stores',
    '/api/stores/all',
    '/api/news',
    '/api/ads',
    '/api/recruitment',
    '/api/reputation-posts',
    '/api/auth/users'
]

print("=== CHECKING SERVER ENDPOINTS ===")
for ep in endpoints:
    if ep in server_code:
        print(f"FOUND: {ep}")
    else:
        print(f"MISSING: {ep}")

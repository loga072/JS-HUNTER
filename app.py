from flask import Flask, request, jsonify, render_template
import requests
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import re

app = Flask(__name__)

def extract_js_urls(domain):
    """Fetch homepage and return list of absolute JS URLs."""
    if not domain.startswith(('http://', 'https://')):
        domain = 'http://' + domain

    headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; JSHunter-Secure/1.0)'
    }

    try:
        response = requests.get(domain, timeout=10, headers=headers, allow_redirects=True)
        response.raise_for_status()
    except Exception as e:
        raise RuntimeError(f"Failed to fetch domain: {str(e)}")

    soup = BeautifulSoup(response.text, 'html.parser')
    script_tags = soup.find_all('script', src=True)

    base_url = response.url
    js_urls = set()
    for tag in script_tags:
        src = tag['src']
        absolute = urljoin(base_url, src)
        js_urls.add(absolute)

    return list(js_urls)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/extract', methods=['POST'])
def extract():
    data = request.get_json()
    domain = data.get('domain', '').strip()
    if not domain:
        return jsonify({'error': 'No domain provided'}), 400

    if not re.match(r'^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', domain):
        return jsonify({'error': 'Invalid domain format'}), 400

    try:
        urls = extract_js_urls(domain)
        return jsonify({'success': True, 'urls': urls})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
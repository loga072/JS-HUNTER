document.getElementById('domainForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const domain = document.getElementById('domainInput').value.trim();
    if (!domain) return;

    document.getElementById('loading').style.display = 'block';
    document.getElementById('error').style.display = 'none';
    document.getElementById('results').style.display = 'none';

    try {
        const response = await fetch('/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: domain })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Unknown error');
        }

        displayResults(data.urls);
    } catch (err) {
        const errorDiv = document.getElementById('error');
        errorDiv.querySelector('span').textContent = err.message;
        errorDiv.style.display = 'flex';
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
});

function displayResults(urls) {
    const list = document.getElementById('jsList');
    list.innerHTML = '';
    document.getElementById('count').textContent = urls.length;

    if (urls.length === 0) {
        list.innerHTML = '<li>⚠️ No JavaScript files found.</li>';
    } else {
        urls.forEach(url => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = url;
            a.textContent = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            li.appendChild(a);
            list.appendChild(li);
        });
    }

    document.getElementById('results').style.display = 'block';
}

document.getElementById('copyBtn').addEventListener('click', () => {
    const urls = [...document.querySelectorAll('#jsList a')].map(a => a.href);
    if (urls.length === 0) return;

    navigator.clipboard.writeText(urls.join('\n')).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy"></i> Copy all';
        }, 2000);
    }).catch(err => {
        alert('Failed to copy: ' + err);
    });
});

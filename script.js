function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function NewMessage(text, topic, time) {
    const t = escapeHtml(topic || 'No topic');
    const body = escapeHtml(text || '');
    const when = escapeHtml(time || new Date().toLocaleString());
    return `<article class="message"><h4>${when} : ${t}</h4><p>${body}</p></article>`;
}

document.addEventListener('DOMContentLoaded', () => {
    const topic = document.getElementById('topic');
    const text = document.getElementById('text');
    const send = document.getElementById('send');
    const messages = document.getElementById('messages');
    const stored = localStorage.getItem('clipclap_messages');
    
    if (stored) {
        try {
            const arr = JSON.parse(stored);
            arr.forEach(msg => {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = NewMessage(msg.text, msg.topic, msg.time);
                messages.appendChild(wrapper);
            });
        } catch (e) {
            console.warn('failed to parse stored messages', e);
        }
    }

    function saveAll() {
        const elems = messages.querySelectorAll('article.message');
        const arr = [];
        elems.forEach(el => {
            const h4 = el.querySelector('h4');
            const p = el.querySelector('p');
            if (!h4 || !p) return;
            const parts = h4.textContent.split(' : ');
            arr.push({ time: parts[0] || '', topic: parts[1] || '', text: p.textContent || '' });
        });
        localStorage.setItem('clipclap_messages', JSON.stringify(arr));
    }

    function addMessage() {
        const html = NewMessage(text.value, topic.value);
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        messages.appendChild(wrapper);
        saveAll();
        text.value = '';
        topic.value = '';
    }

    if (send) send.addEventListener('click', addMessage);
    if (text) text.addEventListener('keydown', (e) => { if (e.key === 'Enter') addMessage(); });
});
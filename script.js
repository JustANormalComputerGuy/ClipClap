
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

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const topic = document.getElementById('topic');
        const text = document.getElementById('text');
        const send = document.getElementById('send');
        const messages = document.getElementById('messages');

        function addMessage() {
            const html = NewMessage(text.value, topic.value);
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            messages.appendChild(wrapper);
            text.value = '';
            topic.value = '';
        }

        if (send) send.addEventListener('click', addMessage);
        if (text) text.addEventListener('keydown', (e) => { if (e.key === 'Enter') addMessage(); });
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NewMessage };
}

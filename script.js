// main chat logic for ClipClap using Gun.js peers

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

        // status / diagnostic elements
        const statusEl = document.createElement('div');
        statusEl.id = 'gateway-status';
        statusEl.style.marginTop = '0.5rem';
        statusEl.textContent = 'connecting to peers...';
        messages.parentNode.insertBefore(statusEl, messages);

        const logEl = document.createElement('pre');
        logEl.id = 'inpage-log';
        logEl.style.background = '#f0f0f0';
        logEl.style.padding = '0.5rem';
        logEl.style.marginTop = '0.5rem';
        logEl.style.maxHeight = '8rem';
        logEl.style.overflowY = 'auto';
        logEl.textContent = 'logs:';
        messages.parentNode.insertBefore(logEl, messages);

        function logToPage(...args) {
            const txt = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
            logEl.textContent += '\n' + txt;
        }
        ['log','error','warn','info'].forEach(fn => {
            const orig = console[fn];
            console[fn] = function(...a) { orig.apply(console,a); logToPage(fn+':', ...a); };
        });

        // configure Gun
        const gun = Gun({
            peers: [
                'https://gun-manhattan.herokuapp.com/gun',
                'https://gun-us.herokuapp.com/gun',
                'https://gun-eu.herokuapp.com/gun'
            ]
        });
        const chat = gun.get('clipclap_chat');

        console.log('gun peers:', gun.back('opt.peers'));
        if (Object.keys(gun.back('opt.peers') || {}).length === 0) {
            statusEl.textContent = 'no peers configured or reachable';
        }
        gun.on('hi', peer => {
            console.log('connected to peer', peer);
            statusEl.textContent = 'connected to peer ' + peer.url;
        });
        gun.on('bye', peer => {
            console.log('disconnected from peer', peer);
            statusEl.textContent = 'disconnected from peer ' + peer.url;
        });

        let connected = false;
        gun.on('hi', () => { connected = true; });
        setTimeout(() => {
            if (!connected) {
                statusEl.textContent = 'unable to reach peers; chat will not sync';
                logToPage('ERROR: no peer connection established.');
                logToPage('You may need to host your own Gun relay or use a different network.');
            }
        }, 8000);

        chat.map().on((data, id) => {
            if (!data || !data.time) return;
            const wrapper = document.createElement('div');
            wrapper.innerHTML = NewMessage(data.text, data.topic, data.time);
            messages.appendChild(wrapper);
        });

        function addMessage() {
            const msg = { text: text.value, topic: topic.value, time: new Date().toLocaleString() };
            chat.set(msg);
            text.value = '';
            topic.value = '';
        }

        if (send) send.addEventListener('click', addMessage);
        if (text) text.addEventListener('keydown', (e) => { if (e.key === 'Enter') addMessage(); });
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { escapeHtml, NewMessage };
}
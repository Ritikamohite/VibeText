/* static/js/home.js
   Handles: mic composer, comment toggles, reply/edit/replies, and small input fixes.
*/
(function () {
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith(name + '=')) { cookieValue = decodeURIComponent(cookie.substring(name.length + 1)); break; }
            }
        }
        return cookieValue;
    }

    const csrftoken = getCookie('csrftoken');

    // Composer: keep mic inline and attach speech recognition to the composer textarea
    document.addEventListener('DOMContentLoaded', () => {
        const micBtn = document.getElementById('mic-btn');
        const composer = document.querySelector('.composer-main');
        const textarea = composer ? composer.querySelector('textarea') : document.querySelector('textarea');

        if (micBtn && textarea) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.lang = 'en-US';
                recognition.continuous = false;
                recognition.interimResults = false;

                recognition.onresult = (ev) => {
                    const text = ev.results[0][0].transcript;
                    textarea.value += (textarea.value ? ' ' : '') + text;
                };
                recognition.onerror = () => { };
                recognition.onend = () => micBtn.classList.remove('listening');

                micBtn.addEventListener('click', () => {
                    if (micBtn.classList.contains('listening')) { recognition.stop(); micBtn.classList.remove('listening'); return; }
                    recognition.start(); micBtn.classList.add('listening');
                });
            }
        }

        // Restore comment open state if hash present
        if (window.location.hash && window.location.hash.startsWith('#post-')) {
            const postId = window.location.hash.replace('#post-', '');
            const comments = document.getElementById(`comments-${postId}`);
            if (comments) comments.classList.add('open');
        }
    });

    // Auto-fix shorthand on blur
    (function () {
        const fixes = { im: "I'm", dont: "don't", cant: "can't", u: 'you', ur: 'your', pls: 'please' };
        function autoFix(input) {
            if (!input || !input.value) return;
            let words = input.value.split(/\b/);
            words = words.map(w => fixes[w.toLowerCase()] || w);
            input.value = words.join('');
        }
        document.addEventListener('blur', function (e) {
            if (e.target && e.target.matches && e.target.matches("textarea, input[type='text']")) autoFix(e.target);
        }, true);
    })();

    // Delegated handlers: comment toggle and comment submit
    document.addEventListener('click', function (e) {
        const commentBtn = e.target.closest('.comment-btn');
        if (commentBtn) {
            const postId = commentBtn.getAttribute('data-post-id');
            if (!postId) return;
            const comments = document.getElementById(`comments-${postId}`);
            if (!comments) return;
            comments.toggleAttribute('hidden');
        }
    });

    // Handle AJAX comment submissions for forms with class .yt-new-comment
    document.addEventListener('submit', function (e) {
        const form = e.target;
        if (!form.classList.contains('yt-new-comment')) return;
        e.preventDefault();

        const postId = form.getAttribute('data-post-id');
        const input = form.querySelector('[name=comment]');
        if (!input || !input.value.trim()) return;

        fetch(form.action, {
            method: 'POST',
            headers: { 'X-CSRFToken': csrftoken, 'X-Requested-With': 'XMLHttpRequest' },
            body: new URLSearchParams(new FormData(form)),
            credentials: 'same-origin'
        }).then(r => r.json()).then(data => {
            // Expecting JSON: { user, text }
            if (!data) return;
            const list = document.createElement('div');
            list.className = 'yt-comment new';
            list.innerHTML = `<div class="yt-body"><div class="yt-header"><span class="yt-username">@${data.user}</span><span class="yt-time">just now</span></div><div class="yt-text">${data.text}</div></div>`;
            // insert before the new-comment form
            form.parentNode.insertBefore(list, form);
            form.reset();
            // ensure comments panel is open
            const comments = document.getElementById(`comments-${postId}`);
            if (comments && !comments.classList.contains('open')) comments.classList.add('open');
        }).catch(err => console.error('Comment submit failed', err));
    });

    // Small toggles for edit/reply/replies using delegation
    document.addEventListener('click', function (e) {
        const replyBtn = e.target.closest('[onclick^="toggleReply"]');
        if (replyBtn) {
            const id = replyBtn.getAttribute('onclick').match(/toggleReply\('(\d+)'\)/);
            if (id && id[1]) {
                const f = document.getElementById(`reply-form-${id[1]}`);
                if (f) f.style.display = f.style.display === 'block' ? 'none' : 'block';
            }
        }

        const editBtn = e.target.closest('[onclick^="toggleEdit"]');
        if (editBtn) {
            const id = editBtn.getAttribute('onclick').match(/toggleEdit\('(\d+)'\)/);
            if (id && id[1]) {
                const form = document.getElementById(`edit-form-${id[1]}`);
                const text = document.getElementById(`comment-text-${id[1]}`);
                if (form && text) {
                    form.style.display = form.style.display === 'block' ? 'none' : 'block';
                    text.style.display = text.style.display === 'none' ? 'block' : 'none';
                }
            }
        }
    });

})();

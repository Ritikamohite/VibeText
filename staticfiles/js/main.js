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

  // Delegate like button clicks
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.like-btn');
    if (!btn) return;
    e.preventDefault();

    const postId = btn.dataset.id || (btn.getAttribute('href') || '').split('/').filter(Boolean).pop();
    if (!postId) return;

    fetch(`/like/${postId}/`, {
      method: 'POST',
      headers: { 'X-CSRFToken': csrftoken, 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'same-origin'
    }).then(r => r.json()).then(data => {
      const countEl = btn.querySelector('.action-count');
      if (countEl && (typeof data.count !== 'undefined')) countEl.textContent = data.count;
      btn.classList.toggle('liked', !!data.liked);
    }).catch(err => console.error('Like failed', err));
  });

  // Enhance generic comment forms (if any other than home)
  document.querySelectorAll('.comment-form').forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      fetch(this.action, {
        method: 'POST',
        headers: { 'X-CSRFToken': csrftoken, 'X-Requested-With': 'XMLHttpRequest' },
        body: new FormData(this),
        credentials: 'same-origin'
      }).then(res => res.json()).then(data => {
        if (data && data.user && data.text) {
          this.nextElementSibling && (this.nextElementSibling.innerHTML += `<p><b>${data.user}:</b> ${data.text}</p>`);
          this.reset();
        }
      }).catch(err => console.error('Comment failed', err));
    });
  });

  // Notifications clickable elements
  document.querySelectorAll('.notification[data-url]').forEach(n => {
    n.addEventListener('click', function () {
      fetch(this.dataset.url, {
        method: 'POST', headers: { 'X-CSRFToken': csrftoken, 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'same-origin'
      }).catch(() => {});
      this.classList.add('read');
    });
  });

  // Profile form optional
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', function (e) {
      e.preventDefault();
      fetch(this.action, { method: 'POST', headers: { 'X-CSRFToken': csrftoken, 'X-Requested-With': 'XMLHttpRequest' }, body: new FormData(this), credentials: 'same-origin' }).then(() => alert('Profile updated')).catch(err => console.error(err));
    });
  }
})();

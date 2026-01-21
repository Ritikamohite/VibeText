document.addEventListener("click", function (e) {
  if (e.target.closest(".like-btn")) {
    const btn = e.target.closest(".like-btn");
    const postId = btn.dataset.id;

    fetch(`/like/${postId}/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": csrftoken,
        "X-Requested-With": "XMLHttpRequest"
      }
    })
    .then(res => res.json())
    .then(data => {
      document.getElementById(`like-${postId}`).innerText = data.count;
    });
  }
});


document.querySelectorAll(".comment-form").forEach(form => {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    fetch(this.action, {
      method: "POST",
      headers: {
        "X-CSRFToken": csrftoken,
        "X-Requested-With": "XMLHttpRequest"
      },
      body: new FormData(this)
    })
    .then(res => res.json())
    .then(data => {
      this.nextElementSibling.innerHTML +=
        `<p><b>${data.user}:</b> ${data.text}</p>`;
      this.reset();
    });
  });
});


document.querySelectorAll(".notification").forEach(n => {
  n.addEventListener("click", function () {
    fetch(this.dataset.url, {
      method: "POST",
      headers: {
        "X-CSRFToken": csrftoken,
        "X-Requested-With": "XMLHttpRequest"
      }
    });
    this.classList.add("read");
  });
});


document.getElementById("profile-form").addEventListener("submit", function (e) {
  e.preventDefault();

  fetch(this.action, {
    method: "POST",
    headers: {
      "X-CSRFToken": csrftoken,
      "X-Requested-With": "XMLHttpRequest"
    },
    body: new FormData(this)
  })
  .then(res => res.json())
  .then(() => alert("Profile updated"));
});

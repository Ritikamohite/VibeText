// static/js/profile.js

function updateProfile(field, value) {
  sendAjax("/ajax/profile/", { field, value }, (res) => {
    alert(res.message);
  });
}

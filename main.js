const baseUrl = "https://tarmeezacademy.com/api/v1";
function getPosts() {
  axios.get(`${baseUrl}/posts?limit=100`).then((response) => {
    console.log(response);
    document.getElementById("posts").innerHTML = "";
    const posts = response.data.data;
    console.log(posts);

    for (post of posts) {
      console.log(post);
      let postTitle = "";
      if (post.title != null) {
        postTitle = post.title;
      }

      let postImage = "./image/sensitive.jpg";
      if (
        post.author.id == "1246" ||
        post.author.id == "1164" ||
        post.author.id == "1360"
      ) {
        post.image = postImage;
      }

      let content = `
            <div class="card shadow">
                <div class="card-header">
                    <img class="rounded-circle user-img" src=${
                      post.author.profile_image
                    } style="width: 30px;">
                    <span class="user-name">${post.author.username}</span>
                </div>
                <div class="card-body">
                <img class="imgs w-100" src=${post.image} alt="">
                <p class="mt-1 time-ago" style="color: #aaa;">${
                  post.created_at
                }</p>
                <h5 class="title">${postTitle}</h5>
                <p class="body">${post.body}</p>
                <hr>
                <div class="comments">
                    <span><i class="fa-solid fa-pen-clip"></i></span>
                    <span class="comments-count">${
                      "(" + post.comments_count + ")"
                    }</span> <span>comments</span>
                    <span id="post-tags-${post.id}"></span>
                </div>
                </div>
            </div>`;
      document.getElementById("posts").innerHTML += content;
      const currentPostTagsId = `post-tags-${post.id}`;
      document.getElementById(currentPostTagsId).innerHTML = "";
      for (tag of post.tags) {
        console.log(tag.name);
        console.log("tarmeez");
        let tagsContent = `
                    <button class ="btn btn-sm rounded-5" style= "background-color:#eee color:white ">
                        ${tag.name}
                    </button>
                `;
        document.getElementById(currentPostTagsId).innerHTML += tagsContent;
      }
    }
  });
}

function loginBtnClicked() {
  const password = document.getElementById("password-input").value;
  const userName = document.getElementById("username-input").value;

  let params = {
    username: userName,
    password: password,
  };
  axios.post(`${baseUrl}/login`, params).then((response) => {
    console.log(response.data);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    const modal = document.getElementById("login-modal");
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
    showAlert("Logged in successfully", "success");
    setupUI();
  });
}
function registerBtnClicked() {
  const name = document.getElementById("register-name-input").value;
  const password = document.getElementById("register-password-input").value;
  const userName = document.getElementById("register-username-input").value;
  const image = document.getElementById("register-image-input").files[0];

  let formData = new FormData();
  formData.append("name", name);
  formData.append("username", userName);
  formData.append("password", password);
  formData.append("image", image);

  axios
    .post(`${baseUrl}/register`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => {
      console.log(response.data);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      const modal = document.getElementById("register-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      showAlert("New User Regiseter Successfully", "success");
      setupUI();
    })
    .catch((error) => {
      showAlert(error.response.data.message, "danger");
    });
}

function createNewPost() {
  const title = document.getElementById("post-title-input").value;
  const body = document.getElementById("post-body-input").value;
  console.log(title);
  console.log(body);
  const image = document.getElementById("post-image-input").files[0];
  const token = localStorage.getItem("token");

  let formData = new FormData();
  formData.append("title", title);
  formData.append("body", body);
  formData.append("image", image);

  axios
    .post(`${baseUrl}/posts`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log(response);
      const modal = document.getElementById("creat-post-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      showAlert("New post has been created", "success");
      getPosts();
      //setupUI();
    })
    .catch((error) => {
      showAlert(error.response.data.message, "danger");
    });
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showAlert("Logged out successfully", "success");
  setupUI();
}

function showAlert(customMessage, type = "success") {
  const alertPlaceholder = document.getElementById("successAlert");
  const alert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      "</div>",
    ].join("");

    alertPlaceholder.append(wrapper);
  };
  alert(customMessage, type);
  setTimeout(() => {
    const closeAlert = bootstrap.Alert.getOrCreateInstance("#successAlert");
    if (type == "success") closeAlert.close();
  }, 5 * 1000);
}

function setupUI() {
  const token = localStorage.getItem("token");
  let loginBtn = document.getElementById("login-btn");
  let registerBtn = document.getElementById("register-btn");
  // Renamed variable from `logout` to `logoutBtn`
  let logoutBtn = document.getElementById("logout-btn");
  const addBtn = document.getElementById("add-post-btn");

  if (token == null) {
    addBtn.style.display = "none";
    logoutBtn.style.display = "none";
    loginBtn.style.visibility = "visible";
    registerBtn.style.visibility = "visible";
  } else {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    logoutBtn.style.visibility = "visible";
    let navbar_edit = document.getElementById("logout-div");
    navbar_edit.style.display = "flex";
    let user = getCurrentUser();
    document.getElementById("nav-username").innerHTML = user.username;
    let profile_image = document.createElement("img");
    profile_image.src = user.profile_image;
    profile_image.style = "width: 40px; height: 40px; border-radius: 50%;";
    document.getElementById("logout-div").prepend(profile_image);
  }
}

function getCurrentUser() {
  let user = null;
  const storageUser = localStorage.getItem("user");
  if (storageUser != null) {
    user = JSON.parse(storageUser);
  }
  return user;
}

getPosts();
setupUI();

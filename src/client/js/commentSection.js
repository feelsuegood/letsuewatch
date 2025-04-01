const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtns = document.querySelectorAll(".video__comment-delete");

const addComment = (text, newCommentId) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = newCommentId;
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = ` ${text}`;
  const deleteSpan = document.createElement("span");
  deleteSpan.className = "video__comment-delete";
  deleteSpan.innerText = " ❌";
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(deleteSpan);
  videoComments.prepend(newComment);

  deleteSpan.addEventListener("click", handleDeleteComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

const handleDeleteComment = async (event) => {
  const commentElement = event.target.closest(".video__comment");
  const commentId = commentElement.dataset.id;
  const videoId = videoContainer.dataset.id;
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ commentId }),
  });
  if (response.status === 200) {
    return commentElement.remove();
  }
};

if (deleteBtns) {
  deleteBtns.forEach((btn) =>
    btn.addEventListener("click", handleDeleteComment),
  );
}

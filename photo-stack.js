document.addEventListener("click", (e) => {
  const item = e.target.closest(".photo-stack-item");
  if (!item) return;
  const stack = item.parentElement;
  stack.querySelector(".on-top")?.classList.remove("on-top");
  item.classList.add("on-top");
});

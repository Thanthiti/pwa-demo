const taskInput = document.getElementById("taskInput");
const tagInput = document.getElementById("tagInput");
const taskList = document.getElementById("taskList");

// โหลด tasks จาก localStorage
document.addEventListener("DOMContentLoaded", loadTasks);

function addTask() {
  const task = taskInput.value.trim();
  const tag = tagInput.value.trim();
  if (task === "") return;

  createTaskElement(task, tag);

  taskInput.value = "";
  tagInput.value = "";
  saveTasks();
}

function createTaskElement(task, tag) {
  const li = document.createElement("li");

  const leftDiv = document.createElement("div");
  leftDiv.className = "left";

  const taskText = document.createElement("span");
  taskText.textContent = task;

  if (tag) {
    const tagEl = document.createElement("span");
    tagEl.className = "tag";
    tagEl.textContent = "#" + tag;
    leftDiv.appendChild(tagEl);
  }

  leftDiv.insertBefore(taskText, leftDiv.firstChild);

  const actions = document.createElement("div");
  actions.className = "actions";

  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️";
  editBtn.onclick = () => {
    const newTask = prompt("Edit task:", taskText.textContent);
    if (newTask) {
      taskText.textContent = newTask;
      saveTasks();
    }
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.onclick = () => {
    li.remove();
    saveTasks();
  };

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(leftDiv);
  li.appendChild(actions);

  taskList.appendChild(li);
}

function saveTasks() {
  const tasks = [];
  document.querySelectorAll("#taskList li").forEach((li) => {
    const text = li.querySelector(".left span:first-child").textContent;
    const tagEl = li.querySelector(".tag");
    tasks.push({ task: text, tag: tagEl ? tagEl.textContent.slice(1) : "" });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach((t) => createTaskElement(t.task, t.tag));
}

let db;
const statusEl = document.getElementById("status");
const tasksEl = document.getElementById("tasks");
const pendingEl = document.getElementById("pending-tasks");
const newTaskInput = document.getElementById("newTask");

// ------------------ IndexedDB Setup ------------------
const request = indexedDB.open("tasksDB", 1);

request.onupgradeneeded = (e) => {
  db = e.target.result;
  if (!db.objectStoreNames.contains("tasks"))
    db.createObjectStore("tasks", { keyPath: "id" });
  if (!db.objectStoreNames.contains("outbox"))
    db.createObjectStore("outbox", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = (e) => {
  db = e.target.result;
  updateStatus();
  renderTasks();
  renderPendingTasks();
};

// ------------------ Online/Offline Status ------------------
window.addEventListener("online", () => {
  updateStatus();
  autoSyncPending(); // Auto sync pending เมื่อกลับ online
});
window.addEventListener("offline", updateStatus);

function updateStatus() {
  statusEl.textContent = navigator.onLine ? "🟢 Online" : "🔴 Offline";
}

// ------------------ Add Task ------------------
document.getElementById("add").addEventListener("click", () => {
  const title = newTaskInput.value.trim();
  if (!title) return;

  if (navigator.onLine) {
    const task = { id: Date.now(), title };
    addTaskToStore("tasks", task, renderTasks);
  } else {
    const task = { title }; // id autoIncrement
    addTaskToStore("outbox", task, renderPendingTasks);
  }

  newTaskInput.value = "";
});

// ------------------ Add to IndexedDB ------------------
function addTaskToStore(storeName, task, callback) {
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  const req = store.put(task);

  req.onsuccess = (e) => {
    if (storeName === "outbox") task.id = e.target.result; // เอา id จริง
    if (callback) callback();
  };
}

// ------------------ Render Tasks ------------------
function renderTasks() {
  tasksEl.innerHTML = "";

  const tx = db.transaction("tasks", "readonly");
  tx.objectStore("tasks").getAll().onsuccess = (e) => {
    e.target.result.forEach((t) => appendTaskElement(t, "synced", "tasks"));
    renderPendingTasks(); // append pending สีส้มต่อท้าย
  };
}

// ------------------ Render Pending Tasks ------------------
function renderPendingTasks() {
  const tx = db.transaction("outbox", "readonly");
  tx.objectStore("outbox").getAll().onsuccess = (e) => {
    // ลบ pending เก่า
    Array.from(tasksEl.querySelectorAll(".pending")).forEach((li) =>
      li.remove()
    );

    e.target.result.forEach((task) =>
      appendTaskElement(task, "pending", "outbox")
    );
  };
}

// ------------------ Append Task Element ------------------
function appendTaskElement(task, className, storeName) {
  const li = document.createElement("li");
  li.textContent = task.title;
  li.className = className;

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.className = "delete-btn";
  delBtn.onclick = () => {
    deleteTask(storeName, task.id);
    li.remove();
  };

  li.appendChild(delBtn);
  tasksEl.appendChild(li);
}

// ------------------ Delete Task ------------------
function deleteTask(storeName, id) {
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).delete(id);
}

// ------------------ Sync Pending Tasks ------------------
function syncPendingTasks() {
  if (!navigator.onLine) return alert("Must be online to sync!");

  const tx = db.transaction(["tasks", "outbox"], "readwrite");
  const tasksStore = tx.objectStore("tasks");
  const outboxStore = tx.objectStore("outbox");

  outboxStore.getAll().onsuccess = (e) => {
    e.target.result.forEach((t, index) => {
      tasksStore.put({ id: Date.now() + index, title: t.title });
    });
    outboxStore.clear();
  };

  tx.oncomplete = () => {
    renderTasks(); // แสดง tasks สีเขียวทั้งหมด
  };
}

document.getElementById("sync").addEventListener("click", syncPendingTasks);

// ------------------ Auto Sync Pending ------------------
function autoSyncPending() {
  if (navigator.onLine) {
    syncPendingTasks();
  }
}

// ------------------ Service Worker ------------------
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("service-worker.js")
    .then(() => console.log("SW registered"))
    .catch((err) => console.log("SW registration failed:", err));
}

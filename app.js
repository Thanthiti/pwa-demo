const todoInput = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");

// โหลดจาก localStorage
let todos = JSON.parse(localStorage.getItem("todos")) || [];

// แสดงรายการ
function renderTodos() {
  todoList.innerHTML = "";
  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.textContent = todo.text;
    li.className = todo.completed ? "completed" : "";

    // ทำเครื่องหมายเสร็จ
    li.addEventListener("click", () => {
      todos[index].completed = !todos[index].completed;
      saveAndRender();
    });

    // ปุ่มลบ
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "todo-btn";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      todos.splice(index, 1);
      saveAndRender();
    });

    li.appendChild(deleteBtn);
    todoList.appendChild(li);
  });
}

// บันทึกและรีเฟรช
function saveAndRender() {
  localStorage.setItem("todos", JSON.stringify(todos));
  renderTodos();
}

// เพิ่มรายการใหม่
addBtn.addEventListener("click", () => {
  const text = todoInput.value.trim();
  if (text) {
    todos.push({ text, completed: false });
    saveAndRender();
    todoInput.value = "";
  }
});

// Enter key เพิ่มรายการ
todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addBtn.click();
});

// แสดงตอนโหลด
renderTodos();
    
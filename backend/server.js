const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "tasks.json");

// Read tasks
function readTasks() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    return [];
  }
}

// Write tasks
function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), "utf8");
}

// LOGIN — accept ANY email & password
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Enter Email & Password" });
  }

  return res.json({ success: true });
});

// GET TASKS
app.get("/tasks", (req, res) => {
  res.json(readTasks());
});

// ADD TASK
app.post("/tasks", (req, res) => {
  const { name, description, time } = req.body;
  const tasks = readTasks();

  const newTask = {
    id: Date.now().toString(),
    name,
    description,
    time,
    completed: false
  };

  tasks.push(newTask);
  writeTasks(tasks);

  res.json({ success: true, task: newTask });
});

// EDIT / COMPLETE TASK
app.put("/tasks/:id", (req, res) => {
  const id = req.params.id;
  const { name, description, time, completed } = req.body;

  let tasks = readTasks();
  let found = false;

  tasks = tasks.map(task => {
    if (task.id === id) {
      found = true;
      return {
        ...task,
        name: name ?? task.name,
        description: description ?? task.description,
        time: time ?? task.time,
        completed: completed ?? task.completed
      };
    }
    return task;
  });

  if (!found) return res.status(404).json({ success: false });

  writeTasks(tasks);
  res.json({ success: true });
});

// DELETE TASK
app.delete("/tasks/:id", (req, res) => {
  const id = req.params.id;
  let tasks = readTasks();
  const newTasks = tasks.filter(t => t.id !== id);

  writeTasks(newTasks);
  res.json({ success: true });
});

// RUN SERVER
const PORT = 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

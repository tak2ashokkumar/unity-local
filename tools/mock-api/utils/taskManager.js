const tasks = {};

function createTask() {
  const id = "mock-task-" + Date.now();
  tasks[id] = { state: "PENDING", start: Date.now() };
  return id;
}

function getTask(id) {

  const task = tasks[id];

  if (!task) {
    return { state: "FAILURE", result: "Task not found" };
  }

  const elapsed = Date.now() - task.start;

  if (elapsed > 3000) {
    task.state = "SUCCESS";
  }

  if (task.state === "SUCCESS") {
    return {
      state: "SUCCESS",
      result: { success: true }
    };
  }

  return {
    state: "PENDING",
    result: null
  };
}

module.exports = { createTask, getTask };
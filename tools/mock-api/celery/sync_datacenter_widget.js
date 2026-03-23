const { createTask, getTask } = require("../utils/taskManager");

module.exports = (app) => {

  app.get("/customer/colo_cloud/sync_datacenter_widget/", (req,res)=>{
      const taskId = createTask();
      res.json({ task_id: taskId });
  });

  app.get("/task/:id/", (req,res)=>{
      res.json(getTask(req.params.id));
  });

};
const { createTask } = require("../utils/taskManager");

module.exports = (app) => {

  app.get("/customer/colo_cloud/sync_datacenter_widget/", (req,res)=>{
      const taskId = createTask();
      res.json({ task_id: taskId });
  });

};
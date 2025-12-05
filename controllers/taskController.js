const Task = require('../models/Task');
const Project = require('../models/Project');
const notificationService = require('../services/notificationService');
const SocketService = require('../services/socketService');
const { successHandler, errorHandler } = require('../utils/responseHandler');

// Create task
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignee } = req.body;
    if (!title) return errorHandler(res, 400, 'Task title is required');

    const project = await Project.findById(req.params.projectId);
    if (!project) return errorHandler(res, 404, 'Project not found');

    const task = new Task({
      title,
      description,
      project: req.params.projectId,
      creator: req.user.id,
      assignee,
      priority,
      dueDate,
    });

    await task.save();
    await task.populate('assignee', 'name email');
    await task.populate('creator', 'name email');

    // Notify assignee
    if (assignee) {
      const assigneeUser = await (await task.populate('assignee')).assignee;
      await notificationService.notifyTaskAssigned(
        assignee,
        task._id,
        task.title,
        req.user.id
      );
    }

    // Emit socket event
    SocketService.emitTaskUpdate(req.params.projectId, task._id, task, req.user.id);

    successHandler(res, 201, 'Task created', task);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Get task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignee', 'name email')
      .populate('creator', 'name email');

    if (!task) return errorHandler(res, 404, 'Task not found');
    successHandler(res, 200, 'Task retrieved', task);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { title, description, priority, status, progress, dueDate, assignee } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) return errorHandler(res, 404, 'Task not found');

    const oldStatus = task.status;
    const oldAssignee = task.assignee?.toString();

    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (status) {
      task.status = status;
      if (status === 'done') task.completedDate = Date.now();
    }
    if (progress) task.progress = progress;
    if (dueDate) task.dueDate = dueDate;
    if (assignee && assignee !== oldAssignee) {
      task.assignee = assignee;
      // Notify new assignee
      await notificationService.notifyTaskAssigned(assignee, task._id, task.title, req.user.id);
    }

    await task.save();
    await task.populate('assignee', 'name email');
    await task.populate('creator', 'name email');

    // Notify status change
    if (status && status !== oldStatus) {
      if (task.assignee) {
        await notificationService.notifyStatusChanged(
          task.assignee._id,
          task._id,
          task.title,
          status,
          req.user.id
        );
      }
      SocketService.emitTaskStatusChange(task.project, task._id, task, status, req.user.id);
    }

    // Emit socket event
    if (title || description || priority || progress || dueDate) {
      SocketService.emitTaskUpdate(task.project, task._id, task, req.user.id);
    }

    successHandler(res, 200, 'Task updated', task);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) return errorHandler(res, 404, 'Task not found');

    await Task.findByIdAndDelete(req.params.taskId);
    successHandler(res, 200, 'Task deleted');
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Add subtask
exports.addSubtask = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return errorHandler(res, 400, 'Subtask title is required');

    const task = await Task.findById(req.params.taskId);
    if (!task) return errorHandler(res, 404, 'Task not found');

    task.subtasks.push({ title, completed: false });
    await task.save();

    successHandler(res, 200, 'Subtask added', task);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Toggle subtask
exports.toggleSubtask = async (req, res) => {
  try {
    const { subtaskIndex } = req.body;
    if (subtaskIndex === undefined) return errorHandler(res, 400, 'Subtask index required');

    const task = await Task.findById(req.params.taskId);
    if (!task) return errorHandler(res, 404, 'Task not found');

    if (task.subtasks[subtaskIndex]) {
      task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
      await task.save();
    }

    successHandler(res, 200, 'Subtask toggled', task);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Add tag
exports.addTag = async (req, res) => {
  try {
    const { tag } = req.body;
    if (!tag) return errorHandler(res, 400, 'Tag is required');

    const task = await Task.findById(req.params.taskId);
    if (!task) return errorHandler(res, 404, 'Task not found');

    if (!task.tags.includes(tag)) {
      task.tags.push(tag);
      await task.save();
    }

    successHandler(res, 200, 'Tag added', task);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Remove tag
exports.removeTag = async (req, res) => {
  try {
    const { tag } = req.body;
    if (!tag) return errorHandler(res, 400, 'Tag is required');

    const task = await Task.findById(req.params.taskId);
    if (!task) return errorHandler(res, 404, 'Task not found');

    task.tags = task.tags.filter(t => t !== tag);
    await task.save();

    successHandler(res, 200, 'Tag removed', task);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

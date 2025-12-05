const Project = require('../models/Project');
const Task = require('../models/Task');
const activityService = require('../services/activityService');
const { successHandler, errorHandler } = require('../utils/responseHandler');

// Get all projects for user (owned or member)
exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    })
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .sort({ updatedAt: -1 });

    successHandler(res, 200, 'Projects retrieved', projects);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Get single project
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!project) return errorHandler(res, 404, 'Project not found');
    successHandler(res, 200, 'Project retrieved', project);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Create project
exports.createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, budget, color } = req.body;
    if (!name) return errorHandler(res, 400, 'Project name is required');

    const project = new Project({
      name,
      description,
      owner: req.user.id,
      members: [{ user: req.user.id, role: 'owner' }],
      startDate,
      endDate,
      budget,
      color,
    });

    await project.save();
    await project.populate('owner', 'name email');

    // Log activity
    await activityService.logProjectCreated(project._id, req.user.id, name);

    successHandler(res, 201, 'Project created', project);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, budget, color } = req.body;
    const project = await Project.findById(req.params.projectId);

    if (!project) return errorHandler(res, 404, 'Project not found');

    // Only owner and leads can update
    const isMember = project.members.find(m => m.user.toString() === req.user.id);
    if (project.owner.toString() !== req.user.id && !isMember?.role?.includes('lead')) {
      return errorHandler(res, 403, 'Forbidden');
    }

    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (budget) project.budget = budget;
    if (color) project.color = color;

    await project.save();
    await project.populate('owner', 'name email');

    successHandler(res, 200, 'Project updated', project);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Delete project (owner only)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) return errorHandler(res, 404, 'Project not found');
    if (project.owner.toString() !== req.user.id) return errorHandler(res, 403, 'Forbidden');

    // Delete all tasks in project
    await Task.deleteMany({ project: req.params.projectId });
    await Project.findByIdAndDelete(req.params.projectId);

    successHandler(res, 200, 'Project deleted');
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Add member to project
exports.addMember = async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;
    if (!userId) return errorHandler(res, 400, 'User ID required');

    const project = await Project.findById(req.params.projectId);
    if (!project) return errorHandler(res, 404, 'Project not found');
    if (project.owner.toString() !== req.user.id) return errorHandler(res, 403, 'Forbidden');

    const isMember = project.members.find(m => m.user.toString() === userId);
    if (isMember) return errorHandler(res, 400, 'User already a member');

    project.members.push({ user: userId, role });
    await project.save();
    await project.populate('members.user', 'name email');

    // Log activity
    const User = require('../models/User');
    const member = await User.findById(userId);
    await activityService.logMemberAdded(project._id, req.user.id, userId, member?.name || 'Unknown');

    successHandler(res, 200, 'Member added', project);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Remove member from project
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return errorHandler(res, 400, 'User ID required');

    const project = await Project.findById(req.params.projectId);
    if (!project) return errorHandler(res, 404, 'Project not found');
    if (project.owner.toString() !== req.user.id) return errorHandler(res, 403, 'Forbidden');

    const User = require('../models/User');
    const member = await User.findById(userId);

    project.members = project.members.filter(m => m.user.toString() !== userId);
    await project.save();
    await project.populate('members.user', 'name email');

    // Log activity
    await activityService.logMemberRemoved(project._id, req.user.id, userId, member?.name || 'Unknown');

    successHandler(res, 200, 'Member removed', project);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

// Get project tasks
exports.getProjectTasks = async (req, res) => {
  try {
    const { status, priority, assignee, search } = req.query;
    const filter = { project: req.params.projectId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email')
      .populate('creator', 'name email')
      .sort({ priority: -1, dueDate: 1 });

    successHandler(res, 200, 'Tasks retrieved', tasks);
  } catch (err) {
    errorHandler(res, 500, err.message);
  }
};

const Team = require('../models/Team');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { logger } = require('../config/logger');

// Get all teams for current user
exports.getMyTeams = async (req, res) => {
  try {
    const userId = req.user.id;
    const teams = await Team.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    })
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .populate('projects');

    return successResponse(res, teams, 'Teams retrieved successfully');
  } catch (err) {
    logger.error('Error getting teams', err);
    return errorResponse(res, err.message, 500);
  }
};

// Get specific team
exports.getTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId)
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .populate('projects', 'name');

    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }

    // Check if user is member or owner
    const isMember =
      team.owner.toString() === userId ||
      team.members.some((m) => m.user._id.toString() === userId);

    if (!isMember && !team.isPublic) {
      return errorResponse(res, 'Not authorized to view this team', 403);
    }

    return successResponse(res, team, 'Team retrieved successfully');
  } catch (err) {
    logger.error('Error getting team', err);
    return errorResponse(res, err.message, 500);
  }
};

// Create new team
exports.createTeam = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!name) {
      return errorResponse(res, 'Team name is required', 400);
    }

    const team = await Team.create({
      name,
      description,
      owner: userId,
      isPublic: isPublic || false,
    });

    const populatedTeam = await team.populate('owner', 'name email');

    logger.info(`Team created: ${team._id} by user ${userId}`);
    return successResponse(res, populatedTeam, 'Team created successfully', 201);
  } catch (err) {
    logger.error('Error creating team', err);
    return errorResponse(res, err.message, 500);
  }
};

// Update team
exports.updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, description, isPublic } = req.body;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }

    // Only owner can update
    if (team.owner.toString() !== userId) {
      return errorResponse(res, 'Only team owner can update team', 403);
    }

    team.name = name || team.name;
    team.description = description !== undefined ? description : team.description;
    team.isPublic = isPublic !== undefined ? isPublic : team.isPublic;

    await team.save();

    const updatedTeam = await team.populate('owner', 'name email');
    logger.info(`Team updated: ${teamId}`);
    return successResponse(res, updatedTeam, 'Team updated successfully');
  } catch (err) {
    logger.error('Error updating team', err);
    return errorResponse(res, err.message, 500);
  }
};

// Delete team
exports.deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }

    // Only owner can delete
    if (team.owner.toString() !== userId) {
      return errorResponse(res, 'Only team owner can delete team', 403);
    }

    await Team.findByIdAndDelete(teamId);
    logger.info(`Team deleted: ${teamId}`);
    return successResponse(res, null, 'Team deleted successfully');
  } catch (err) {
    logger.error('Error deleting team', err);
    return errorResponse(res, err.message, 500);
  }
};

// Add member to team
exports.addMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { memberId, role } = req.body;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }

    // Only owner or admin can add members
    const userRole = team.members.find(
      (m) => m.user.toString() === userId
    )?.role;
    if (team.owner.toString() !== userId && userRole !== 'admin') {
      return errorResponse(res, 'Not authorized to add members', 403);
    }

    // Check if user already a member
    if (team.members.some((m) => m.user.toString() === memberId)) {
      return errorResponse(res, 'User is already a member', 400);
    }

    // Validate member exists
    const member = await User.findById(memberId);
    if (!member) {
      return errorResponse(res, 'User not found', 404);
    }

    team.members.push({
      user: memberId,
      role: role || 'member',
      joinedAt: new Date(),
    });

    await team.save();
    const populatedTeam = await team
      .populate('members.user', 'name email')
      .populate('owner', 'name email');

    logger.info(`Member ${memberId} added to team ${teamId}`);
    return successResponse(res, populatedTeam, 'Member added successfully');
  } catch (err) {
    logger.error('Error adding member', err);
    return errorResponse(res, err.message, 500);
  }
};

// Remove member from team
exports.removeMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { memberId } = req.body;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }

    // Only owner or admin can remove members
    const userRole = team.members.find(
      (m) => m.user.toString() === userId
    )?.role;
    if (team.owner.toString() !== userId && userRole !== 'admin') {
      return errorResponse(res, 'Not authorized to remove members', 403);
    }

    // Can't remove owner
    if (team.owner.toString() === memberId) {
      return errorResponse(res, 'Cannot remove team owner', 400);
    }

    team.members = team.members.filter(
      (m) => m.user.toString() !== memberId
    );

    await team.save();
    const populatedTeam = await team
      .populate('members.user', 'name email')
      .populate('owner', 'name email');

    logger.info(`Member ${memberId} removed from team ${teamId}`);
    return successResponse(res, populatedTeam, 'Member removed successfully');
  } catch (err) {
    logger.error('Error removing member', err);
    return errorResponse(res, err.message, 500);
  }
};

// Generate invite code
exports.generateInviteCode = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }

    // Only owner can generate invite codes
    if (team.owner.toString() !== userId) {
      return errorResponse(res, 'Only owner can generate invite codes', 403);
    }

    // Generate unique invite code
    const inviteCode = Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    team.inviteCodes.push({
      code: inviteCode,
      createdBy: userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await team.save();

    const response = {
      inviteCode,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    logger.info(`Invite code generated for team ${teamId}`);
    return successResponse(res, response, 'Invite code generated successfully');
  } catch (err) {
    logger.error('Error generating invite code', err);
    return errorResponse(res, err.message, 500);
  }
};

// Join team by invite code
exports.joinTeamByCode = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user.id;

    if (!inviteCode) {
      return errorResponse(res, 'Invite code is required', 400);
    }

    const team = await Team.findOne({
      'inviteCodes.code': inviteCode,
    })
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!team) {
      return errorResponse(res, 'Invalid invite code', 404);
    }

    // Check if code is expired
    const codeEntry = team.inviteCodes.find((c) => c.code === inviteCode);
    if (codeEntry.expiresAt < new Date()) {
      return errorResponse(res, 'Invite code has expired', 400);
    }

    // Check if already member
    if (team.members.some((m) => m.user.toString() === userId)) {
      return errorResponse(res, 'Already a member of this team', 400);
    }

    team.members.push({
      user: userId,
      role: 'member',
      joinedAt: new Date(),
    });

    await team.save();

    const updatedTeam = await team
      .populate('members.user', 'name email')
      .populate('owner', 'name email');

    logger.info(`User ${userId} joined team ${team._id} via invite code`);
    return successResponse(res, updatedTeam, 'Joined team successfully');
  } catch (err) {
    logger.error('Error joining team', err);
    return errorResponse(res, err.message, 500);
  }
};

// List all public teams
exports.getPublicTeams = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const teams = await Team.find({ isPublic: true })
      .populate('owner', 'name email')
      .select('-inviteCodes')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Team.countDocuments({ isPublic: true });

    return successResponse(
      res,
      {
        teams,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      'Public teams retrieved successfully'
    );
  } catch (err) {
    logger.error('Error getting public teams', err);
    return errorResponse(res, err.message, 500);
  }
};

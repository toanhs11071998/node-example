// authorize(roles) - allow only specified roles
module.exports = function authorize(allowedRoles = []) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    if (allowedRoles.length === 0) return next();

    if (allowedRoles.includes(user.role)) return next();

    return res.status(403).json({ success: false, message: 'Forbidden' });
  };
};

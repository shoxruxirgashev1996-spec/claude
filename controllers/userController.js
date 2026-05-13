const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.render('admin/users/index', { layout: 'layouts/admin', title: 'User Management', users });
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) { req.flash('error', 'Email already exists'); return res.redirect('/admin/users'); }
    await User.create({ name, email, password, role: role || 'admin' });
    req.flash('success', 'User created');
  } catch (err) { req.flash('error', err.message); }
  res.redirect('/admin/users');
};

exports.deleteUser = async (req, res) => {
  if (req.params.id === req.session.userId) {
    req.flash('error', 'Cannot delete yourself');
    return res.redirect('/admin/users');
  }
  await User.findByIdAndDelete(req.params.id);
  req.flash('success', 'User deleted');
  res.redirect('/admin/users');
};

exports.toggleUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user && user._id.toString() !== req.session.userId) {
    user.isActive = !user.isActive;
    await user.save();
  }
  res.redirect('/admin/users');
};

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!await user.comparePassword(req.body.current_password)) {
      req.flash('error', 'Current password incorrect');
      return res.redirect('/admin/settings');
    }
    user.password = req.body.new_password;
    await user.save();
    req.flash('success', 'Password changed');
  } catch (err) { req.flash('error', err.message); }
  res.redirect('/admin/settings');
};

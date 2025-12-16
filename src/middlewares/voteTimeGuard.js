// src/middlewares/voteTimeGuard.js
module.exports = function voteTimeGuard(req, res, next) {
  const now = new Date();

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const startMinutes = 12 * 60; // 12:00 → 720
  const endMinutes = 14 * 60 + 30; // 14:30 → 870

  if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
    return res.status(404).json({
      success: true,
      message: "Les votes sont terminés",
    });
  }

  //next();
};

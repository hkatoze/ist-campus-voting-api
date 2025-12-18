// src/middlewares/voteTimeGuard.js
module.exports = function voteTimeGuard(req, res, next) {
const now = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Africa/Ouagadougou" })
);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const startMinutes = 18 * 60; // 12:00
  const endMinutes = 21 * 60; // 14:30

  // ⏳ AVANT les votes
  if (currentMinutes < startMinutes) {
    return res.status(404).json({
      success: false,
      message: "Les votes sont terminés",
    });
  }
  // ❌ APRÈS les votes
  if (currentMinutes > endMinutes) {
    return res.status(404).json({
      success: false,
      message: "Les votes sont terminés",
    });
  }

  // ✅ PENDANT les votes
  next();
};

// src/middlewares/voteTimeGuard.js
module.exports = function voteTimeGuard(req, res, next) {
const now = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Africa/Ouagadougou" })
);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const startMinutes = 12 * 60; // 12:00
  const endMinutes = 17 * 60; // 14:30

  // ⏳ AVANT les votes
  if (currentMinutes < startMinutes) {
    return res.status(404).json({
      success: false,
      message: "Les votes commencent à 12H, veuillez patienter",
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

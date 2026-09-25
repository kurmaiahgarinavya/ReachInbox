import { Router } from "express";
import passport from "../config/passport";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/"
  }),
  (_req, res) => {
    res.redirect("http://localhost:5173/dashboard");
  }
);

router.get("/google/failure", (_req, res) => {
  res.status(401).json({
    message: "Google login failed"
  });
});

router.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      message: "Not logged in"
    });
  }

  res.json({
    user: req.user
  });
});

router.post("/logout", (req, res) => {
  req.logout((error) => {
    if (error) {
      return res.status(500).json({
        message: "Logout failed"
      });
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return res.status(500).json({
          message: "Session could not be destroyed"
        });
      }

      res.json({
        message: "Logged out successfully"
      });
    });
  });
});

export default router;
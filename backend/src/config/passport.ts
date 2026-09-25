import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import pool from "./database";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:5000/api/auth/google/callback"
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const name = profile.displayName || "";
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value || null;

        if (!email) {
          return done(new Error("Google account email not found"));
        }

        const result = await pool.query(
          `INSERT INTO users
           (google_id, name, email, avatar)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (email)
           DO UPDATE SET
             google_id = EXCLUDED.google_id,
             name = EXCLUDED.name,
             avatar = EXCLUDED.avatar
           RETURNING id, google_id, name, email, avatar`,
          [googleId, name, email, avatar]
        );

        return done(null, result.rows[0]);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const result = await pool.query(
      `SELECT id, google_id, name, email, avatar
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return done(null, false);
    }

    done(null, result.rows[0]);
  } catch (error) {
    done(error);
  }
});

export default passport;
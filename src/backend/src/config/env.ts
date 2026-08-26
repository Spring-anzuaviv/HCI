import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Thiếu biến môi trường DATABASE_URL");
}

export const env = {
  databaseUrl,
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  jwtSecret: process.env.JWT_SECRET ?? "local-development-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
};

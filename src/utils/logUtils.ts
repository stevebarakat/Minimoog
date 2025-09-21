import logger from "loglevel";

logger.setLevel(process.env.NODE_ENV === "production" ? "warn" : "debug");

export { logger };

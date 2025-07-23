import log from "loglevel";

log.setLevel(process.env.NODE_ENV === "production" ? "warn" : "debug");

export default log;

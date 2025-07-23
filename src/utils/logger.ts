import log from "loglevel";

// Set default log level (can be changed at runtime)
log.setLevel(process.env.NODE_ENV === "production" ? "warn" : "debug");

// Optionally, extend loglevel for remote logging here
// log.methodFactory = ...

export default log;

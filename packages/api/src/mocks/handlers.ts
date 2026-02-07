import authHandlers from "./handlers/auth";
import clubHandlers from "./handlers/club";
import clubReportHandlers from "./handlers/club.report";
import userHandlers from "./handlers/user";

export const handlers = [
  ...authHandlers,
  ...clubHandlers,
  ...userHandlers,
  ...clubReportHandlers,
];

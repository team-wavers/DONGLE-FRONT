import authHandlers from "./auth";
import clubHandlers from "./club";
import clubReportHandlers from "./club.report";
import userHandlers from "./user";

export const handlers = [
  ...authHandlers,
  ...clubHandlers,
  ...clubReportHandlers,
  ...userHandlers,
];

import { http, passthrough } from "msw";
import { apiPath } from "../api-path";

/** 미들웨어·쿠키 인증과 맞추기 위해 auth는 실서버로 통과 */
const authHandlers = [
    http.post(apiPath("/auth/login"), () => passthrough()),
    http.post(apiPath("/auth/refresh"), () => passthrough()),
    http.post(apiPath("/auth/logout"), () => passthrough()),
];

export default authHandlers;

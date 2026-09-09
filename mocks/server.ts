import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/** Used by the test runner's setup file; see README "Mocking the API". */
export const server = setupServer(...handlers);

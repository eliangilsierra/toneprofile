import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Demo backend for Vitest (component and flow tests).
export const server = setupServer(...handlers);

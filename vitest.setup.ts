import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "./mocks/server";

// "error" so a request nobody mocked fails the test instead of hitting the network.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

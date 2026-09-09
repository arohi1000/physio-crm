import { beforeEach, describe, expect, it } from "vitest";

import { mockGoogleIdTokenPrefix } from "@/mocks/authHandlers";
import { clearMockRefreshToken } from "@/mocks/mockRefreshCookie";

import {
  postDevSignIn,
  postGoogleSignIn,
  postLogout,
  postPasswordSignIn,
  postRefresh,
} from "./authRequests";

const doctorEmail = "doctor@physioclinic.local";
const staffEmail = "staff@physioclinic.local";
const deactivatedEmail = "former.staff@physioclinic.local";
const unprovisionedEmail = "someone@example.com";

beforeEach(() => {
  clearMockRefreshToken();
});

describe("sign-in", () => {
  it("returns a doctor_admin session for a provisioned Google account", async () => {
    const session = await postGoogleSignIn(`${mockGoogleIdTokenPrefix}${doctorEmail}`);

    expect(session.user).toMatchObject({ email: doctorEmail, role: "doctor_admin" });
    expect(session.accessToken).toBeTruthy();
  });

  it("returns a staff session through the development bypass", async () => {
    await expect(postDevSignIn(staffEmail)).resolves.toMatchObject({
      user: { email: staffEmail, role: "staff" },
    });
  });

  it("refuses an email that is not on the allow-list", async () => {
    await expect(postDevSignIn(unprovisionedEmail)).rejects.toMatchObject({ status: 401 });
  });

  it("refuses a deactivated account", async () => {
    await expect(postDevSignIn(deactivatedEmail)).rejects.toMatchObject({ status: 401 });
  });

  it("accepts the break-glass password account and rejects a wrong password", async () => {
    await expect(
      postPasswordSignIn("admin@physioclinic.local", "break-glass"),
    ).resolves.toMatchObject({
      user: { role: "doctor_admin" },
    });
    await expect(postPasswordSignIn("admin@physioclinic.local", "wrong")).rejects.toMatchObject({
      status: 401,
    });
  });

  it("refuses a password sign-in for a Google-only account", async () => {
    await expect(postPasswordSignIn(staffEmail, "anything")).rejects.toMatchObject({ status: 401 });
  });
});

describe("session lifecycle", () => {
  it("restores a session from the refresh cookie after signing in", async () => {
    await postDevSignIn(doctorEmail);

    await expect(postRefresh()).resolves.toMatchObject({ user: { email: doctorEmail } });
  });

  it("fails the silent refresh when there is no cookie", async () => {
    await expect(postRefresh()).rejects.toMatchObject({ status: 401 });
  });

  it("makes the refresh cookie unusable after signing out", async () => {
    await postDevSignIn(doctorEmail);

    await expect(postLogout()).resolves.toBeUndefined();
    await expect(postRefresh()).rejects.toMatchObject({ status: 401 });
  });
});

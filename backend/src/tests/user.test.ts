import request from "supertest";
import { app } from "../app";
import { User } from "../models/user.model";
import { tokenService } from "../services/token.service";

describe("User API", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("GET /api/users/me returns 401 when no access token cookie is provided", async () => {
    const response = await request(app).get("/api/users/me");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication required"
      }
    });
  });

  it("GET /api/users/me returns user info when authenticated", async () => {
    jest.spyOn(tokenService, "verifyAccessToken").mockReturnValue({
      sub: "u-21",
      email: "tester@example.com",
      username: "tester",
      purpose: "access"
    });
    jest.spyOn(User, "findByPk").mockResolvedValue({
      id: "u-21",
      username: "tester",
      email: "tester@example.com",
      requiresPasswordChange: false,
      isEmailVerified: true
    } as User);

    const response = await request(app)
      .get("/api/users/me")
      .set("Cookie", [`${tokenService.accessCookieName}=mock-access-token`]);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        user: {
          id: "u-21",
          username: "tester",
          email: "tester@example.com",
          requiresPasswordChange: false,
          isEmailVerified: true
        }
      }
    });
  });

  it("PATCH /api/users/me updates username when authenticated", async () => {
    jest.spyOn(tokenService, "verifyAccessToken").mockReturnValue({
      sub: "u-22",
      email: "tester@example.com",
      username: "tester",
      purpose: "access"
    });

    const saveMock = jest.fn().mockResolvedValue(undefined);
    const existingUser = {
      id: "u-22",
      username: "tester",
      email: "tester@example.com",
      requiresPasswordChange: false,
      isEmailVerified: true,
      save: saveMock
    } as unknown as User;

    jest.spyOn(User, "findByPk").mockResolvedValue(existingUser);
    jest.spyOn(User, "findOne").mockResolvedValue(null);

    const response = await request(app)
      .patch("/api/users/me")
      .set("Cookie", [`${tokenService.accessCookieName}=mock-access-token`])
      .send({ username: "tester-updated" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        user: {
          id: "u-22",
          username: "tester-updated",
          email: "tester@example.com",
          requiresPasswordChange: false,
          isEmailVerified: true
        }
      }
    });
    expect(saveMock).toHaveBeenCalledTimes(1);
  });
});

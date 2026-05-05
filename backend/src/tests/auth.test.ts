import { User } from "../models/user.model";
import { authService } from "../services/auth.service";
import { mailService } from "../services/mail.service";
import { tokenService } from "../services/token.service";

describe("Auth service - step 2.1", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("signup creates unverified user and sends verification email", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const createdUser = {
      id: "u-1",
      username: "tester",
      email: "tester@example.com",
      emailVerificationToken: null,
      save: saveMock
    } as unknown as User;

    jest.spyOn(User, "findOne").mockResolvedValue(null);
    jest.spyOn(User, "create").mockResolvedValue(createdUser);
    jest.spyOn(tokenService, "signEmailVerificationToken").mockReturnValue("verify-token");
    const sendEmailSpy = jest.spyOn(mailService, "sendVerificationEmail").mockResolvedValue(undefined);

    await authService.signup({
      username: "tester",
      email: "tester@example.com",
      password: "Password@123"
    });

    expect(User.findOne).toHaveBeenCalled();
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "tester",
        email: "tester@example.com",
        isEmailVerified: false
      })
    );
    expect(createdUser.emailVerificationToken).toBe("verify-token");
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(sendEmailSpy).toHaveBeenCalledWith("tester@example.com", "verify-token");
  });

  it("signup fails when username or email already exists", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue({ id: "u-2" } as User);

    await expect(
      authService.signup({
        username: "tester",
        email: "tester@example.com",
        password: "Password@123"
      })
    ).rejects.toMatchObject({
      message: "Email or username already in use",
      statusCode: 409
    });
  });

  it("verifyEmail marks account as verified when token is valid", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const existingUser = {
      id: "u-1",
      emailVerificationToken: "verify-token",
      isEmailVerified: false,
      save: saveMock
    } as unknown as User;

    jest.spyOn(tokenService, "verifyEmailVerificationToken").mockReturnValue({
      sub: "u-1",
      email: "tester@example.com",
      username: "tester",
      purpose: "email-verification"
    });
    jest.spyOn(User, "findByPk").mockResolvedValue(existingUser);

    await authService.verifyEmail("verify-token");

    expect(existingUser.isEmailVerified).toBe(true);
    expect(existingUser.emailVerificationToken).toBeNull();
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it("verifyEmail fails when token does not match stored value", async () => {
    const existingUser = {
      id: "u-1",
      emailVerificationToken: "another-token",
      isEmailVerified: false,
      save: jest.fn()
    } as unknown as User;

    jest.spyOn(tokenService, "verifyEmailVerificationToken").mockReturnValue({
      sub: "u-1",
      email: "tester@example.com",
      username: "tester",
      purpose: "email-verification"
    });
    jest.spyOn(User, "findByPk").mockResolvedValue(existingUser);

    await expect(authService.verifyEmail("verify-token")).rejects.toMatchObject({
      message: "Invalid verification token",
      statusCode: 400
    });
  });
});

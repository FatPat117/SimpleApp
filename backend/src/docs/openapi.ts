import { env } from "../config/env";

/** Swagger `/api/docs` — chỉnh khi đổi contract API. */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "SimpleApp Auth API",
    description:
      "Authentication API with JWT cookies, email verification, forgot-password flow, Google OAuth, and current-user profile endpoints.",
    version: "1.0.0",
    contact: {
      name: "SimpleApp"
    }
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: "Local (matches PORT in .env)"
    }
  ],
  tags: [
    { name: "Health", description: "Liveness check" },
    { name: "Auth", description: "Registration, login, tokens, password flows, Google OAuth" },
    { name: "Users", description: "Current user profile (requires access cookie)" }
  ],
  components: {
    securitySchemes: {
      cookieAccessToken: {
        type: "apiKey",
        in: "cookie",
        name: "accessToken",
        description: "HttpOnly cookie set by `POST /auth/login`, `POST /auth/refresh`, or Google callback."
      }
    },
    schemas: {
      SuccessEnvelope: {
        type: "object",
        required: ["success"],
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          data: { nullable: true }
        }
      },
      ErrorEnvelope: {
        type: "object",
        required: ["success", "error"],
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string" },
              details: { description: "Extra context (e.g. Zod field errors)" }
            }
          }
        }
      },
      UserPublic: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          username: { type: "string" },
          email: { type: "string", format: "email" },
          requiresPasswordChange: { type: "boolean" },
          isEmailVerified: { type: "boolean" }
        }
      },
      SignUpRequest: {
        type: "object",
        required: ["username", "email", "password"],
        properties: {
          username: { type: "string", minLength: 3, example: "johndoe" },
          email: { type: "string", format: "email", example: "john@example.com" },
          password: {
            type: "string",
            format: "password",
            description: "Min 8 chars, 1 uppercase, 1 special character",
            example: "Password@123"
          }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["identifier", "password"],
        properties: {
          identifier: {
            type: "string",
            description: "Username or email",
            example: "johndoe"
          },
          password: { type: "string", format: "password" }
        }
      },
      ForgotPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email" }
        }
      },
      ChangePasswordRequest: {
        type: "object",
        required: ["newPassword"],
        properties: {
          newPassword: {
            type: "string",
            format: "password",
            description: "Same rules as sign-up password. Only allowed when account has requiresPasswordChange."
          }
        }
      },
      UpdateMeRequest: {
        type: "object",
        properties: {
          username: { type: "string", minLength: 3, example: "newname" }
        },
        description: "At least one field required."
      },
      AuthSessionData: {
        type: "object",
        properties: {
          expiresIn: {
            type: "integer",
            description: "Access token lifetime in seconds (for UI countdown / session modal)",
            example: 900
          },
          user: { $ref: "#/components/schemas/UserPublic" }
        }
      },
      SignUpResponseData: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          verificationToken: { type: "string" }
        }
      },
      ForgotPasswordResponseData: {
        type: "object",
        properties: {
          temporaryPassword: {
            type: "string",
            nullable: true,
            description: "Generated temporary password. Null when account is not found."
          }
        }
      },
      MeResponseData: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/UserPublic" }
        }
      }
    }
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description: "Returns 200 when the process is up. Does not verify database connectivity.",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Register",
        description:
          "Creates an unverified user, hashes password, returns verification token. **Cannot log in** until account is verified.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignUpRequest" }
            }
          }
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/SignUpResponseData" },
                        message: {
                          type: "string",
                          example:
                            "Account created. Please verify your account before logging in."
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } },
          "409": { description: "Email or username already in use", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } },
          "429": { description: "Auth rate limit", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } }
        }
      }
    },
    "/api/auth/verify-email": {
      get: {
        tags: ["Auth"],
        summary: "Verify email",
        description:
          "Validates verification token and marks `isEmailVerified` true, then clears verification token.",
        parameters: [
          {
            name: "token",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Email verification JWT"
          }
        ],
        responses: {
          "200": {
            description: "Account verified",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { nullable: true },
                        message: { type: "string", example: "Account verified successfully." }
                      }
                    }
                  ]
                }
              }
            }
          },
          "400": { description: "Invalid or wrong-purpose token", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login (password)",
        description:
          "Sets HttpOnly `accessToken` and `refreshToken` cookies. Returns `expiresIn` and user **without** token strings. Fails with 403 if email not verified.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "Logged in — cookies set",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/AuthSessionData" }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } },
          "403": { description: "Email not verified", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } },
          "429": { description: "Auth rate limit", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } }
        }
      }
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh session",
        description:
          "Reads `refreshToken` cookie, validates and rotates refresh token in DB, sets new cookies. **Reuse detection:** presenting an old refresh token invalidates the stored session.",
        responses: {
          "200": {
            description: "New tokens issued",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/AuthSessionData" }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            description: "Missing/invalid refresh, or reuse detected",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } }
          },
          "429": { description: "Refresh rate limit", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } }
        }
      }
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        description:
          "Clears refresh token hash in DB (if authenticated) and clears auth cookies. Requires valid `accessToken` cookie.",
        security: [{ cookieAccessToken: [] }],
        responses: {
          "200": {
            description: "Logged out",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { nullable: true },
                        message: { type: "string", example: "Logged out successfully" }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": { description: "Not authenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } }
        }
      }
    },
    "/api/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Forgot password",
        description:
          "If email exists: generates temporary password and sets `requiresPasswordChange`. Temporary password is returned in response data.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ForgotPasswordRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "Temporary password generated (or null if account not found)",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/ForgotPasswordResponseData" },
                        message: {
                          type: "string",
                          example: "Temporary password generated successfully."
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } },
          "429": { description: "Forgot-password rate limit", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } }
        }
      }
    },
    "/api/auth/change-password": {
      post: {
        tags: ["Auth"],
        summary: "Change password (forced flow)",
        description:
          "Requires login **and** `requiresPasswordChange` on the user. Clears cookies after success; user must sign in again.",
        security: [{ cookieAccessToken: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChangePasswordRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "Password updated — cookies cleared",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { nullable: true },
                        message: {
                          type: "string",
                          example: "Password changed successfully. Please sign in again."
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "400": { description: "Validation or password change not required", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } },
          "401": { description: "Not authenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } }
        }
      }
    },
    "/api/auth/google": {
      get: {
        tags: ["Auth"],
        summary: "Start Google OAuth",
        description: "302 redirect to Google consent screen. Configure `GOOGLE_*` env vars and matching redirect URI in Google Cloud Console.",
        responses: {
          "302": {
            description: "Redirect to Google"
          },
          "500": {
            description: "OAuth not configured (placeholder client id/secret)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } }
          }
        }
      }
    },
    "/api/auth/google/callback": {
      get: {
        tags: ["Auth"],
        summary: "Google OAuth callback",
        description:
          "Exchanges `code` for tokens, creates/links user, sets auth cookies, redirects to frontend `/dashboard`.",
        parameters: [
          {
            name: "code",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Authorization code from Google"
          }
        ],
        responses: {
          "302": {
            description: "Redirect to FRONTEND_URL/dashboard"
          },
          "400": { description: "Missing code / validation", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } },
          "401": { description: "Token exchange or profile fetch failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } }
        }
      }
    },
    "/api/users/me": {
      get: {
        tags: ["Users"],
        summary: "Current user",
        description: "Returns profile for the user identified by `accessToken` cookie.",
        security: [{ cookieAccessToken: [] }],
        responses: {
          "200": {
            description: "Profile",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/MeResponseData" }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": { description: "Not authenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } },
          "404": { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } }
        }
      },
      patch: {
        tags: ["Users"],
        summary: "Update profile",
        description: "Updates allowed fields (e.g. `username`). At least one field required.",
        security: [{ cookieAccessToken: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateMeRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "Updated profile",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/MeResponseData" }
                      }
                    }
                  ]
                }
              }
            }
          },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } },
          "401": { description: "Not authenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } },
          "409": { description: "Username already in use", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } }
        }
      }
    }
  }
} as const;

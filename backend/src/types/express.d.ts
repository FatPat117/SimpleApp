/** Bổ sung `req.user` sau middleware authenticate. */
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
      username: string;
    };
  }
}

declare namespace Express {
  interface Request {
    authenticatedUser?: {
      userId: string;
      username: string;
    };
  }
}

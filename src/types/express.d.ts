declare namespace Express {
  interface Request {
    authenticatedUser?: {
      userId: number;
      email: string;
    };
  }
}

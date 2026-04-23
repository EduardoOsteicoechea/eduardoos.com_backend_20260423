export interface IEmailService {
  sendPasswordResetToken(email: string, resetToken: string): Promise<void>;
}

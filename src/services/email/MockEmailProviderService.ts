import { IEmailService } from "../../interfaces/IEmailService";

export class MockEmailProviderService implements IEmailService {
  async sendPasswordResetToken(email: string, resetToken: string): Promise<void> {
    console.log(`[MockEmailProvider] Reset token for ${email}: ${resetToken}`);
  }
}

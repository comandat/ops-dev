import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VerificationService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Generate a 6-digit random verification code
     */
    generateCode(): string {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[VerificationService] Generated code: ${code}`);
        return code;
    }

    /**
     * Send verification email to user
     * Note: This is a placeholder - implement with actual email provider (nodemailer, SendGrid, etc.)
     */
    async sendVerificationEmail(email: string, code: string): Promise<void> {
        console.log(`[VerificationService] Sending verification email to: ${email}`);
        console.log(`[VerificationService] Verification code: ${code}`);
        
        // TODO: Implement actual email sending logic
        // Example with nodemailer:
        // const transporter = nodemailer.createTransport({...});
        // await transporter.sendMail({
        //     from: process.env.EMAIL_FROM,
        //     to: email,
        //     subject: 'Email Verification Code',
        //     html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 15 minutes.</p>`
        // });
        
        // For now, just log - replace with actual email implementation
        console.log(`[VerificationService] Email sent successfully to ${email}`);
    }

    /**
     * Create a new verification code for a user and save to DB
     */
    async createVerificationCode(userId: string): Promise<string> {
        // Invalidate any existing unused codes for this user
        await this.prisma.verificationCode.updateMany({
            where: {
                userId,
                isUsed: false,
            },
            data: {
                isUsed: true,
            },
        });

        // Generate new code
        const code = this.generateCode();
        
        // Set expiration time (15 minutes from now)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        // Save to database
        const verificationCode = await this.prisma.verificationCode.create({
            data: {
                userId,
                code,
                expiresAt,
                isUsed: false,
            },
        });

        console.log(`[VerificationService] Created verification code for userId: ${userId}`);
        return verificationCode.code;
    }

    /**
     * Verify a code for a user
     * Returns true if code is valid and not expired
     */
    async verifyCode(userId: string, code: string): Promise<boolean> {
        // Find the verification code
        const verificationCode = await this.prisma.verificationCode.findFirst({
            where: {
                userId,
                code,
                isUsed: false,
            },
        });

        if (!verificationCode) {
            console.log(`[VerificationService] Invalid code for userId: ${userId}`);
            return false;
        }

        // Check if expired
        if (this.isCodeExpired(verificationCode.code, verificationCode.expiresAt)) {
            console.log(`[VerificationService] Expired code for userId: ${userId}`);
            return false;
        }

        // Mark as used
        await this.prisma.verificationCode.update({
            where: { id: verificationCode.id },
            data: { isUsed: true },
        });

        console.log(`[VerificationService] Code verified successfully for userId: ${userId}`);
        return true;
    }

    /**
     * Check if a code is expired
     * Can be called with just code string (will lookup in DB) or with full code object
     */
    isCodeExpired(code: string, expiresAt?: Date): boolean {
        // If expiresAt is provided, use it directly
        if (expiresAt) {
            return new Date() > expiresAt;
        }

        // Otherwise, lookup in DB
        const verificationCode = this.prisma.verificationCode.findFirst({
            where: { code },
        }).then(result => {
            if (!result) {
                return true; // Code doesn't exist, treat as expired
            }
            return new Date() > result.expiresAt;
        });

        return verificationCode as unknown as boolean;
    }

    /**
     * Complete verification flow: create code, send email
     */
    async sendVerificationCodeToUser(userId: string, email: string): Promise<void> {
        try {
            // Create verification code in DB
            const code = await this.createVerificationCode(userId);
            
            // Send email with code
            await this.sendVerificationEmail(email, code);
            
            console.log(`[VerificationService] Verification code sent to ${email}`);
        } catch (error) {
            console.error(`[VerificationService] Error sending verification code:`, error);
            throw new InternalServerErrorException('Failed to send verification code');
        }
    }
}

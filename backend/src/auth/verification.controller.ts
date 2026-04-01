import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException, TooManyRequestsException } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * DTO for sending verification code
 */
class SendVerificationCodeDto {
    email: string;
}

/**
 * DTO for verifying code
 */
class VerifyCodeDto {
    email: string;
    code: string;
}

/**
 * DTO for resending code
 */
class ResendCodeDto {
    email: string;
}

@Controller('auth')
export class VerificationController {
    constructor(
        private readonly verificationService: VerificationService,
        private readonly prisma: PrismaService
    ) { }

    /**
     * POST /auth/send-verification-code
     * Send verification code to user's email
     */
    @Post('send-verification-code')
    @HttpCode(HttpStatus.OK)
    async sendVerificationCode(@Body() body: SendVerificationCodeDto) {
        const { email } = body;

        if (!email) {
            throw new BadRequestException('Email is required');
        }

        // Find user by email
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (user.isVerified) {
            throw new BadRequestException('User is already verified');
        }

        // Send verification code
        await this.verificationService.sendVerificationCodeToUser(user.id, email);

        return { 
            success: true, 
            message: 'Verification code sent to your email' 
        };
    }

    /**
     * POST /auth/verify-code
     * Verify the code and activate user account
     */
    @Post('verify-code')
    @HttpCode(HttpStatus.OK)
    async verifyCode(@Body() body: VerifyCodeDto) {
        const { email, code } = body;

        if (!email || !code) {
            throw new BadRequestException('Email and code are required');
        }

        // Find user by email
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (user.isVerified) {
            throw new BadRequestException('User is already verified');
        }

        // Verify the code
        const isValid = await this.verificationService.verifyCode(user.id, code);

        if (!isValid) {
            throw new BadRequestException('Invalid or expired verification code');
        }

        // Mark user as verified
        await this.prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true },
        });

        return { 
            success: true, 
            message: 'Email verified successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isVerified: true,
            }
        };
    }

    /**
     * POST /auth/resend-code
     * Resend verification code (rate limited: 3 per hour)
     */
    @Post('resend-code')
    @HttpCode(HttpStatus.OK)
    async resendCode(@Body() body: ResendCodeDto) {
        const { email } = body;

        if (!email) {
            throw new BadRequestException('Email is required');
        }

        // Find user by email
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                verificationCodes: {
                    where: { isUsed: false },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (user.isVerified) {
            throw new BadRequestException('User is already verified');
        }

        // Rate limiting: check if user has requested more than 3 codes in the last hour
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);

        const recentCodes = user.verificationCodes.filter(
            (code) => code.createdAt >= oneHourAgo
        );

        if (recentCodes.length >= 3) {
            throw new TooManyRequestsException('Maximum 3 resend attempts allowed per hour');
        }

        // Send new verification code
        await this.verificationService.sendVerificationCodeToUser(user.id, email);

        return { 
            success: true, 
            message: 'Verification code resent to your email' 
        };
    }
}

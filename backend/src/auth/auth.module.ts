import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  imports: [UserModule],
  providers: [AuthService, VerificationService],
  controllers: [AuthController, VerificationController],
  exports: [AuthService, VerificationService]
})
export class AuthModule { }

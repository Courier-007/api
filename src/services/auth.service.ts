import type { IUser, IDone, ICreateUserDto } from '../interfaces';
import { convertMobileNumber } from '../lib';
import { otpService } from './otp.service';
import { usersService } from './users.service';
import console from 'console';

class AuthService {
  async sendVerificationOtp(
    mobile: string,
    done: IDone<{ token: string; verificationKey: string }>,
  ) {
    try {
      const otp = await otpService.generateOtp(mobile);
      if (!otp) return done(new Error('Unable to create token'));
      done(null, otp);
      console.log(otp.token);
    } catch (err: any) {
      done(err);
    }
  }

  async verifyRegistration(data: ICreateUserDto, done: IDone<IUser>) {
    if (data.password !== data.confirm_password) {
      done(new Error("Password: passwords don't match"));
      return;
    }

    try {
      const verify = await otpService.verifyOtp(
        data.mobile,
        data.token,
        data.verification_key,
      );
      if (!verify) return done(new Error('Unable to verify user'));

      await usersService.create(data, done);
    } catch (err: unknown) {
      done(err);
    }
  }

  async verifyLogin(mobile: string, password: string, done: IDone<IUser>) {
    try {
      const user = await usersService.findOne({
        mobile: convertMobileNumber(mobile),
      });

      if (!user) return done(null);
      if (!(await user.comparePassword(password))) {
        return done(new Error('Incorrect password'));
      }

      done(null, user);
    } catch (err: any) {
      done(err);
    }
  }

  async serializer(user: unknown, done: IDone<string>) {
    try {
      const data = user as IUser;
      if (!user) return done(new Error('User not found'));
      done(null, data._id);
    } catch (err: any) {
      done(err);
    }
  }

  async deserializer(userId: string, done: IDone<IUser | false>) {
    try {
      if (!userId) return done(null, false);
      const user = await usersService.findOne({ id: userId });
      if (!user) return done(null);
      done(null, user);
    } catch (err: unknown) {
      done(err);
    }
  }
}

export const authService = new AuthService();

import { Request, Response, NextFunction } from 'express';
import { IUser } from '../../interfaces';
import { CustomResponse } from '../../lib';
import { shopsService } from '../../services';

const { badRequest, unauthorized } = CustomResponse;

export function verifyUserShopMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.user as IUser;
  shopsService.findUsersShop({ userId: user._id }, (err, shop) => {
    if (err) return badRequest(res, err.message, err);
    if (!shop) return unauthorized(res, 'Please create a shop first', null);
    next();
  });
}

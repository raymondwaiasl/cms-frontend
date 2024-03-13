import { NewDataResponse } from './common';

export interface loginInput {
  loginName: string;
  pwd: string;
  loginType: string;
}

export interface LoginInputData {
  is_change: boolean;
  is_admin: string;
  expire_time: number;
  token: string;
  user_name: string;
  login_tips: string;
}

export interface forogtPwdInput {
  email: string;
}
export interface resetInput {
  token: string;
  password: string;
}

export type LoginInputResponse = NewDataResponse<LoginInputData>;

export interface PasswordPolicy {
  hasDigit: boolean;
  hasLetters: boolean;
  hasUpperLowerCase: boolean;
  hasSpecialChar: boolean;
  passwordLength: number;
}

export type GetPasswordPolicyResponse = NewDataResponse<PasswordPolicy>;

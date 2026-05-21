export type LoginParams =
  | {
      account: string;
      loginType: "phone";
      verificationCode: string;
    }
  | {
      account: string;
      loginType: "password";
      password: string;
    };

export type AuthParams = LoginParams;
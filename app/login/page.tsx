"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { setStoredUser } from "@/lib/auth/session";
import { setToken } from "@/lib/request";
import { useMemo, useState } from "react";
import { motion } from "motion/react"
import {
  Code2,
  FileText,
  Lock,
  MessageCircle,
  Smartphone,
  UserPlus,
  Wallet,
} from "lucide-react";

const qrCells = [
  1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0,
  1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0,
  1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1,
  1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0,
  1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1,
  0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1,
  1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0,
  0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1,
  1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0,
  1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1,
  1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1,
  0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0,
];

function buildWechatLoginUrl() {
  const appId = process.env.NEXT_PUBLIC_WECHAT_APP_ID;
  const redirectUri = process.env.NEXT_PUBLIC_WECHAT_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return "";
  }

  const params = new URLSearchParams({
    appid: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "snsapi_login",
    state: "ai-ledger-login",
  });

  return `https://open.weixin.qq.com/connect/qrconnect?${params.toString()}#wechat_redirect`;
}



export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"phone" | "password" | "register">(
    "phone",
  );
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const wechatLoginUrl = useMemo(() => buildWechatLoginUrl(), []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const account = phone.trim();
    const credential =
      authMode === "phone" ? verificationCode.trim() : password;

    if (!account) {
      setErrorMessage(authMode === "register" ? "请输入账号" : "请输入手机号");
      return;
    }

    if (!credential) {
      setErrorMessage(authMode === "phone" ? "请输入验证码" : "请输入密码");
      return;
    }

    if (authMode === "register" && password.length < 6) {
      setErrorMessage("密码至少需要 6 位");
      return;
    }

    if (authMode === "register" && password !== confirmPassword) {
      setErrorMessage("两次输入的密码不一致");
      return;
    }

    if (!hasAcceptedTerms) {
      setErrorMessage("请先同意服务条款和隐私政策");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        authMode === "register" ? "/api/auth/register" : "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: account,
            loginType: authMode,
            password: authMode !== "phone" ? password : undefined,
            verificationCode:
              authMode === "phone" ? verificationCode.trim() : undefined,
          }),
        },
      );

      const result = (await response.json().catch(() => null)) as
        | {
            token?: string;
            message?: string;
            data?: { token?: string };
            error?: { message?: string };
          }
        | null;

      if (!response.ok) {
        throw new Error(
          result?.message ??
            result?.error?.message ??
            (authMode === "register" ? "注册失败，请稍后重试" : "登录失败，请稍后重试"),
        );
      }

      const token = result?.token ?? result?.data?.token;
      const userFromApi =
        (result as { user?: { id?: string; name?: string; avatar?: string; email?: string } })
          ?.user ??
        (result as { data?: { user?: { id?: string; name?: string; avatar?: string; email?: string } } })
          ?.data?.user;

      if (token) {
        setToken(token);
      }

      setStoredUser({
        id: userFromApi?.id,
        name: userFromApi?.name ?? account,
        avatar: userFromApi?.avatar ?? null,
        email: userFromApi?.email ?? (account.includes("@") ? account : null),
      });

      router.push("/workBench");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : authMode === "register"
            ? "注册失败"
            : "登录失败",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f3f3] px-5 py-12 text-[#171717] sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-4xl flex-col justify-center">
        <Link
          href="/"
          className="mx-auto mb-14 flex items-center gap-4 text-3xl font-black tracking-tight"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
            <Wallet size={26} />
          </span>
          AI LEDGER
        </Link>

        <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="border-gray-100 lg:border-r lg:pr-10">
              <h1 className="text-center text-lg font-bold">扫码登录</h1>

              <div className="mx-auto mt-8 w-full max-w-[220px] rounded-2xl bg-white p-5 shadow-[0_16px_50px_rgba(0,0,0,0.08)]">
                {wechatLoginUrl ? (
                  <iframe
                    title="微信扫码登录"
                    src={wechatLoginUrl}
                    className="h-[210px] w-full rounded-xl border-0"
                  />
                ) : (
                  <div className="mx-auto grid aspect-square w-36 grid-cols-12 gap-1 rounded-xl bg-white p-3 ring-1 ring-gray-100">
                    {qrCells.map((cell, index) => (
                      <span
                        key={index}
                        className={cell ? "rounded-[2px] bg-black" : "bg-white"}
                      />
                    ))}
                  </div>
                )}

                <div className="mt-5 text-center">
                  <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-white">
                    <MessageCircle size={18} />
                  </div>
                  <p className="text-sm font-semibold">微信扫码登录</p>
                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    使用微信扫一扫，确认后即可安全登录。
                  </p>
                </div>
              </div>

              {!wechatLoginUrl ? (
                <p className="mx-auto mt-5 max-w-[260px] text-center text-xs leading-5 text-gray-400">
                  当前显示为演示二维码。配置微信开放平台参数后，会自动展示官方扫码登录。
                </p>
              ) : null}
            </div>

            <div className="lg:pl-2">
              {authMode === "register" ? (
                <div className="mb-9 flex items-center justify-between text-base font-bold">
                  <h2>账号注册</h2>
                  <button
                    className="text-sm font-semibold text-gray-400 transition hover:text-black"
                    type="button"
                    onClick={() => setAuthMode("phone")}
                  >
                    返回登录
                  </button>
                </div>
              ) : (
                <div className="mb-9 flex items-center gap-8 text-base font-bold">
                  <button
                    className={
                      authMode === "phone" ? "text-black" : "text-gray-400"
                    }
                    type="button"
                    onClick={() => setAuthMode("phone")}
                  >
                    手机登录
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}  whileTap={{ scale: 0.95 }}
                    className={
                      authMode === "password" ? "text-black" : "text-gray-400"
                    }
                    type="button"
                    onClick={() => setAuthMode("password")}
                  >
                    密码登录
                  </motion.button>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleLogin}>
                <label className="relative block">
                  {authMode === "register" ? (
                    <UserPlus
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                      size={18}
                    />
                  ) : (
                    <Smartphone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                      size={18}
                    />
                  )}
                  <input
                    className="h-12 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-300 focus:border-gray-900"
                    placeholder={
                      authMode === "register" ? "请输入注册账号" : "请输入您的手机号"
                    }
                    type={authMode === "register" ? "text" : "tel"}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </label>

                {authMode === "phone" ? (
                  <label className="relative block">
                    <input
                      className="h-12 w-full rounded-xl border border-gray-200 px-4 pr-32 text-sm outline-none transition placeholder:text-gray-300 focus:border-gray-900"
                      placeholder="请输入验证码"
                      type="text"
                      value={verificationCode}
                      onChange={(event) =>
                        setVerificationCode(event.target.value)
                      }
                    />
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-500"
                      type="button"
                    >
                      获取验证码
                    </button>
                  </label>
                ) : (
                  <>
                    <label className="relative block">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                      />
                      <input
                        className="h-12 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-300 focus:border-gray-900"
                        placeholder={
                          authMode === "register" ? "请设置密码" : "请输入密码"
                        }
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                    </label>

                    {authMode === "register" ? (
                      <label className="relative block">
                        <Lock
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                          size={18}
                        />
                        <input
                          className="h-12 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-300 focus:border-gray-900"
                          placeholder="请再次输入密码"
                          type="password"
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                        />
                      </label>
                    ) : null}
                  </>
                )}

                <label className="flex items-start gap-2 text-xs leading-5 text-gray-400">
                  <input
                    className="mt-1 h-3.5 w-3.5 rounded-full border-gray-300"
                    type="checkbox"
                    checked={hasAcceptedTerms}
                    onChange={(event) =>
                      setHasAcceptedTerms(event.target.checked)
                    }
                  />
                  <span>
                    登录或创建账户即表示您同意 服务条款 和 隐私政策
                  </span>
                </label>

                {errorMessage ? (
                  <p className="text-sm font-medium text-red-500">
                    {errorMessage}
                  </p>
                ) : null}

                <button
                  className="h-13 w-full rounded-xl bg-[#1c1c1c] py-4 text-base font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-300"
                  type="submit"
                  disabled={isSubmitting}       
                >
                  {isSubmitting
                    ? authMode === "register"
                      ? "注册中..."
                      : "登录中..."
                    : authMode === "register"
                      ? "立即注册"
                      : "立即登录"}
                </button>
              </form>

              {authMode === "register" ? (
                <p className="mt-6 text-center text-sm text-gray-500">
                  已有账号？{" "}
                  <button
                    className="font-semibold text-slate-600 transition hover:text-black"
                    type="button"
                    onClick={() => setAuthMode("phone")}
                  >
                    登录
                  </button>
                </p>
              ) : (
                <p className="mt-6 text-center text-sm text-gray-500">
                  没有账号？{" "}
                  <button
                    className="font-semibold text-slate-600 transition hover:text-black"
                    type="button"
                    onClick={() => setAuthMode("register")}
                  >
                    注册
                  </button>
                </p>
              )}

              <p className="mt-8 text-center text-xs text-gray-400">
                根据您的地区，已为您跳转至国内网站
              </p>
            </div>
          </div>
        </section>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          <a
            className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm"
            href="#"
          >
            <FileText className="mb-7 text-gray-900" size={20} />
            <h2 className="font-bold">Agent文档</h2>
            <p className="mt-2 text-sm text-gray-500">开始使用 AI Ledger Agent</p>
          </a>
          <a
            className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm"
            href="#"
          >
            <Code2 className="mb-7 text-gray-900" size={20} />
            <h2 className="font-bold">API参考</h2>
            <p className="mt-2 text-sm text-gray-500">
              使用 AI Ledger API 进行构建
            </p>
          </a>
        </div>
      </div>
    </main>
  );
}

const CREDENTIALS_KEY = "user-credentials";

type CredentialRecord = Record<string, string>;

function readAll(): CredentialRecord {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CredentialRecord;
  } catch {
    return {};
  }
}

function writeAll(data: CredentialRecord) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(data));
}

function resolveUserKey(userId?: string, fallback?: string) {
  return userId ?? fallback ?? "default";
}

/** 登录成功后保存密码（演示用，接 API 后可移除） */
export function saveLoginPassword(
  userId: string | undefined,
  fallback: string,
  password: string,
) {
  if (!password) return;
  const key = resolveUserKey(userId, fallback);
  const all = readAll();
  all[key] = password;
  writeAll(all);
}

export function verifyPassword(
  userId: string | undefined,
  fallback: string,
  password: string,
) {
  const key = resolveUserKey(userId, fallback);
  const stored = readAll()[key];
  if (!stored) return false;
  return stored === password;
}

export function changePassword(
  userId: string | undefined,
  fallback: string,
  currentPassword: string,
  newPassword: string,
): { ok: true } | { ok: false; message: string } {
  const key = resolveUserKey(userId, fallback);

  if (newPassword.length < 6) {
    return { ok: false, message: "新密码至少需要 6 位" };
  }

  const all = readAll();
  const stored = all[key];

  if (!stored) {
    return { ok: false, message: "尚未设置密码，请联系管理员" };
  }

  if (stored !== currentPassword) {
    return { ok: false, message: "当前密码不正确" };
  }

  if (currentPassword === newPassword) {
    return { ok: false, message: "新密码不能与当前密码相同" };
  }

  all[key] = newPassword;
  writeAll(all);
  return { ok: true };
}

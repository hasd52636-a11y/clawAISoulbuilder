// 简单的用户认证系统 - 使用localStorage

export interface User {
  email: string;
  password: string;
  name?: string;
}

// 邮箱格式验证
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 密码验证
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: '密码至少6位' };
  }
  return { valid: true };
}

// 简单哈希函数（生产环境应该用bcrypt）
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash) + password.charCodeAt(i);
    hash |= 0; // 转换为32位整数
  }
  return hash.toString(16);
}

// 获取所有用户
export function getUsers(): Record<string, User> {
  try {
    return JSON.parse(localStorage.getItem('clawnexus_users') || '{}');
  } catch {
    return {};
  }
}

// 注册用户
export function registerUser(email: string, password: string, name?: string): { success: boolean; message?: string } {
  // 验证邮箱
  if (!isValidEmail(email)) {
    return { success: false, message: '请输入有效的邮箱地址' };
  }
  
  // 验证密码
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return { success: false, message: passwordValidation.message };
  }
  
  const users = getUsers();
  
  // 检查用户是否已存在
  if (users[email]) {
    return { success: false, message: '该邮箱已被注册' };
  }
  
  // 存储用户（使用简单哈希）
  users[email] = { 
    email, 
    password: simpleHash(password),
    name: name || email.split('@')[0]
  };
  
  try {
    localStorage.setItem('clawnexus_users', JSON.stringify(users));
    return { success: true };
  } catch (error) {
    return { success: false, message: '注册失败' };
  }
}

// 用户登录
export function loginUser(email: string, password: string): { success: boolean; message?: string; user?: { email: string; name?: string } } {
  const users = getUsers();
  const user = users[email];
  
  if (!user) {
    return { success: false, message: '邮箱或密码错误' };
  }
  
  // 验证密码
  if (user.password !== simpleHash(password)) {
    return { success: false, message: '邮箱或密码错误' };
  }
  
  // 设置当前用户
  const currentUser = { email: user.email, name: user.name };
  localStorage.setItem('clawnexus_current_user', JSON.stringify(currentUser));
  
  return { success: true, user: currentUser };
}

// 获取当前登录用户
export function getCurrentUser(): { email: string; name?: string } | null {
  try {
    return JSON.parse(localStorage.getItem('clawnexus_current_user') || 'null');
  } catch {
    return null;
  }
}

// 用户登出
export function logoutUser(): void {
  localStorage.removeItem('clawnexus_current_user');
}

// 检查是否已登录
export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}
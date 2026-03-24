/**
 * 密码验证工具函数
 */

/**
 * 验证密码复杂度
 * @param {string} password - 密码
 * @param {Object} settings - 安全设置
 * @returns {Object} 验证结果
 */
function validatePasswordComplexity(password, settings) {
  const result = {
    isValid: true,
    errors: [],
    strength: 'weak'
  };

  // 检查最小长度
  const minLength = parseInt(settings.min_password_length) || 6;
  if (password.length < minLength) {
    result.isValid = false;
    result.errors.push(`密码长度不能少于${minLength}个字符`);
  }

  // 检查密码复杂度
  const complexity = settings.password_complexity || 'low';
  
  if (complexity === 'medium') {
    // 中等复杂度：至少包含字母和数字
    if (!/[a-zA-Z]/.test(password)) {
      result.isValid = false;
      result.errors.push('密码必须包含至少一个字母');
    }
    if (!/[0-9]/.test(password)) {
      result.isValid = false;
      result.errors.push('密码必须包含至少一个数字');
    }
  } else if (complexity === 'high') {
    // 高复杂度：必须包含大小写字母、数字和特殊字符
    if (!/[a-z]/.test(password)) {
      result.isValid = false;
      result.errors.push('密码必须包含至少一个小写字母');
    }
    if (!/[A-Z]/.test(password)) {
      result.isValid = false;
      result.errors.push('密码必须包含至少一个大写字母');
    }
    if (!/[0-9]/.test(password)) {
      result.isValid = false;
      result.errors.push('密码必须包含至少一个数字');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      result.isValid = false;
      result.errors.push('密码必须包含至少一个特殊字符');
    }
  }

  // 计算密码强度
  if (result.isValid) {
    let score = 0;
    if (password.length >= minLength) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
    
    if (score >= 4) {
      result.strength = 'strong';
    } else if (score >= 2) {
      result.strength = 'medium';
    } else {
      result.strength = 'weak';
    }
  }

  return result;
}

/**
 * 获取密码复杂度要求描述
 * @param {Object} settings - 安全设置
 * @returns {string} 要求描述
 */
function getPasswordRequirements(settings) {
  const minLength = parseInt(settings.min_password_length) || 6;
  const complexity = settings.password_complexity || 'low';
  
  let requirements = [`至少${minLength}个字符`];
  
  if (complexity === 'medium') {
    requirements.push('包含字母和数字');
  } else if (complexity === 'high') {
    requirements.push('包含大小写字母');
    requirements.push('包含数字');
    requirements.push('包含特殊字符');
  }
  
  return requirements.join('、');
}

/**
 * 生成密码强度提示
 * @param {string} password - 密码
 * @param {Object} settings - 安全设置
 * @returns {string} 强度提示
 */
function getPasswordStrengthHint(password, settings) {
  const validation = validatePasswordComplexity(password, settings);
  
  if (!validation.isValid) {
    return validation.errors.join('；');
  }
  
  const hints = [];
  const minLength = parseInt(settings.min_password_length) || 6;
  
  if (password.length < minLength) {
    hints.push(`长度至少${minLength}个字符`);
  }
  
  if (!/[a-z]/.test(password)) {
    hints.push('添加小写字母');
  }
  if (!/[A-Z]/.test(password)) {
    hints.push('添加大写字母');
  }
  if (!/[0-9]/.test(password)) {
    hints.push('添加数字');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    hints.push('添加特殊字符');
  }
  
  if (hints.length === 0) {
    return '密码强度很好！';
  }
  
  return `建议：${hints.join('、')}`;
}

module.exports = {
  validatePasswordComplexity,
  getPasswordRequirements,
  getPasswordStrengthHint
};

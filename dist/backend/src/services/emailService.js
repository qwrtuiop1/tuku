const nodemailer = require('nodemailer')

// QQ邮箱配置
const transporter = nodemailer.createTransport({
  service: 'qq',
  auth: {
    user: 'vtart@qq.com',
    pass: 'tthgbukopffvddfg' // QQ邮箱授权码
  }
})

// 发送邮件函数
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: 'vtart@qq.com',
      to: to,
      subject: subject,
      html: html
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('邮件发送成功:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('邮件发送失败:', error)
    return { success: false, error: error.message }
  }
}

// 发送密码重置邮件
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/reset-password?token=${resetToken}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">密码重置请求</h2>
      <p>您好，</p>
      <p>我们收到了您的密码重置请求。请点击下面的链接来重置您的密码：</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #409eff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">重置密码</a>
      </div>
      <p>如果上面的按钮无法点击，请复制下面的链接到浏览器地址栏：</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p><strong>注意：</strong>此链接有效期为24小时，过期后需要重新申请。</p>
      <p>如果您没有请求重置密码，请忽略此邮件。</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
    </div>
  `

  return await sendEmail(email, '图库系统 - 密码重置', html)
}

// 发送邮箱验证码邮件
const sendEmailVerificationCode = async (email, code, type = 'change_email') => {
  let typeText = '验证邮箱'
  if (type === 'change_email') {
    typeText = '更改邮箱'
  } else if (type === 'forgot_password') {
    typeText = '重置密码'
  }
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #333; margin: 0;">图库系统 - ${typeText}验证码</h2>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 15px 0; font-size: 16px;">您好，</p>
        <p style="margin: 0 0 20px 0;">您正在进行${typeText}操作，请使用以下验证码完成验证：</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: #409eff; color: white; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
            ${code}
          </div>
        </div>
        
        <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">
          <strong>验证码有效期：</strong>5分钟<br>
          <strong>使用说明：</strong>请在验证码输入框中输入上述6位数字
        </p>
      </div>
      
      <div style="margin: 30px 0; padding: 15px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          <strong>安全提醒：</strong><br>
          • 请勿将验证码泄露给他人<br>
          • 验证码仅用于本次${typeText}操作<br>
          • 如非本人操作，请忽略此邮件
        </p>
      </div>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
        此邮件由系统自动发送，请勿回复。<br>
        如有疑问，请联系系统管理员。
      </p>
    </div>
  `

  return await sendEmail(email, `图库系统 - ${typeText}验证码`, html)
}

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendEmailVerificationCode
}

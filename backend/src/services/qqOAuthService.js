const axios = require('axios');

class QQOAuthService {
  constructor() {
    this.clientId = process.env.QQ_APP_ID || '102815554';
    this.clientSecret = process.env.QQ_APP_KEY || '3zhARWP4VggU8Zns';
    this.redirectUri = process.env.QQ_REDIRECT_URI || 'https://tukufrontend.vtart.cn/auth/qq/callback';
    this.baseUrl = 'https://graph.qq.com';
  }

  // 生成QQ登录授权URL
  generateAuthUrl(state = '') {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'get_user_info',
      state: state
    });

    return `${this.baseUrl}/oauth2.0/authorize?${params.toString()}`;
  }

  // 通过授权码获取访问令牌
  async getAccessToken(code) {
    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        redirect_uri: this.redirectUri
      });

      const response = await axios.get(`${this.baseUrl}/oauth2.0/token?${params.toString()}`);
      
      // QQ返回的是URL编码的字符串，需要解析
      const data = this.parseUrlEncodedResponse(response.data);
      
      if (data.error) {
        throw new Error(`QQ OAuth错误: ${data.error_description || data.error}`);
      }

      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
        refreshToken: data.refresh_token
      };
    } catch (error) {
      console.error('获取QQ访问令牌失败:', error);
      throw new Error('QQ登录失败，请重试');
    }
  }

  // 通过访问令牌获取OpenID
  async getOpenId(accessToken) {
    try {
      const response = await axios.get(`${this.baseUrl}/oauth2.0/me`, {
        params: {
          access_token: accessToken
        }
      });

      const data = this.parseUrlEncodedResponse(response.data);
      
      if (data.error) {
        throw new Error(`获取OpenID失败: ${data.error_description || data.error}`);
      }

      return data.openid;
    } catch (error) {
      console.error('获取QQ OpenID失败:', error);
      throw new Error('获取用户信息失败');
    }
  }

  // 获取用户信息
  async getUserInfo(accessToken, openId) {
    try {
      const response = await axios.get(`${this.baseUrl}/user/get_user_info`, {
        params: {
          access_token: accessToken,
          oauth_consumer_key: this.clientId,
          openid: openId
        }
      });

      const data = response.data;
      
      if (data.ret !== 0) {
        throw new Error(`获取用户信息失败: ${data.msg || '未知错误'}`);
      }

      return {
        openId: openId,
        nickname: data.nickname,
        avatar: data.figureurl_qq_2 || data.figureurl_qq_1 || data.figureurl_2 || data.figureurl_1,
        avatar30: data.figureurl, // 30x30像素头像
        avatar50: data.figureurl_1, // 50x50像素头像
        avatar100: data.figureurl_2, // 100x100像素头像
        avatarQQ40: data.figureurl_qq_1, // 40x40像素QQ头像
        avatarQQ100: data.figureurl_qq_2, // 100x100像素QQ头像
        gender: data.gender === '男' ? 'male' : data.gender === '女' ? 'female' : 'unknown',
        genderType: data.gender_type,
        province: data.province,
        city: data.city,
        year: data.year,
        constellation: data.constellation,
        isYellowVip: data.is_yellow_vip === '1',
        yellowVipLevel: data.yellow_vip_level,
        isYellowYearVip: data.is_yellow_year_vip === '1'
      };
    } catch (error) {
      console.error('获取QQ用户信息失败:', error);
      throw new Error('获取用户信息失败');
    }
  }

  // 解析URL编码的响应
  parseUrlEncodedResponse(data) {
    const params = new URLSearchParams(data);
    const result = {};
    
    for (const [key, value] of params) {
      result[key] = value;
    }
    
    return result;
  }

  // 验证配置
  validateConfig() {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('QQ OAuth配置不完整，请检查环境变量');
    }
    return true;
  }
}

module.exports = new QQOAuthService();







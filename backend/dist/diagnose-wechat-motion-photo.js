/**
 * 微信 Motion Photo 诊断脚本
 * 用于分析微信实况照片的二进制结构
 * 
 * 使用方法: node diagnose-wechat-motion-photo.js <文件路径>
 */

const fs = require('fs');

const filePath = process.argv[2];
if (!filePath) {
  console.log('用法: node diagnose-wechat-motion-photo.js <文件路径>');
  process.exit(1);
}

async function diagnose() {
  console.log('=== 微信 Motion Photo 诊断工具 ===\n');
  console.log('文件:', filePath);

  const stat = await fs.promises.stat(filePath);
  console.log('文件大小:', stat.size, 'bytes', '(' + (stat.size / 1024 / 1024).toFixed(2) + ' MB)\n');

  const fd = await fs.promises.open(filePath, 'r');
  const buffer = Buffer.alloc(Math.min(stat.size, 100 * 1024 * 1024)); // 读取最多 100MB
  await fd.read(buffer, 0, buffer.length, 0);
  await fd.close();

  // 1. 检查文件头部
  console.log('--- 文件头部 (前 64 bytes) ---');
  const headerHex = buffer.slice(0, 64).toString('hex');
  console.log('Hex:', headerHex.match(/.{2}/g).join(' '));
  console.log('是否为 JPEG (FF D8 FF):', buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF);

  // 2. 查找 JPEG EOI 标记
  console.log('\n--- JPEG EOI 标记 (FF D9) ---');
  let eoiCount = 0;
  let lastEoiPos = -1;
  for (let i = buffer.length - 2; i >= 0; i--) {
    if (buffer[i] === 0xFF && buffer[i + 1] === 0xD9) {
      eoiCount++;
      if (lastEoiPos === -1) lastEoiPos = i + 2;
    }
  }
  console.log('找到 EOI (FF D9) 标记数量:', eoiCount);
  console.log('最后一个 EOI 位置:', lastEoiPos, '(偏移量)');
  if (lastEoiPos > 0) {
    console.log('最后一个 EOI 后面的数据大小:', stat.size - lastEoiPos, 'bytes');
  }

  // 3. 查找 ftyp 标记 (MP4/HEIF 容器)
  console.log('\n--- ftyp 标记 (MP4/HEIF 容器) ---');
  const ftypBuffer = Buffer.from('ftyp');
  let ftypCount = 0;
  let ftypPositions = [];
  let pos = 0;
  while (pos < buffer.length - 4) {
    const idx = buffer.indexOf(ftypBuffer, pos);
    if (idx === -1) break;
    // 验证 box 大小
    if (idx >= 4) {
      const boxLen = buffer.readUInt32BE(idx - 4);
      const remaining = buffer.length - (idx - 4);
      if (boxLen >= 8 && boxLen <= 1024 * 1024 && boxLen <= remaining) {
        ftypCount++;
        ftypPositions.push(idx);
        console.log(`  ftyp #${ftypCount}: 位置=${idx}, box长度=${boxLen}, 相对偏移=${(idx/stat.size*100).toFixed(2)}%`);
      }
    }
    pos = idx + 4;
  }
  console.log('找到有效的 ftyp 标记:', ftypCount);

  // 4. 查找 movi/AVI/RIFF 标记
  console.log('\n--- 其他视频容器标记 ---');
  const moviBuffer = Buffer.from('movi');
  const aviBuffer = Buffer.from('RIFF');
  const riffPos = buffer.indexOf(aviBuffer);
  const moviPos = buffer.indexOf(moviBuffer);
  console.log('RIFF 标记:', riffPos >= 0 ? `位置=${riffPos}` : '未找到');
  console.log('movi 标记:', moviPos >= 0 ? `位置=${moviPos}` : '未找到');

  // 5. 查找 MPF/MMT 标记 (MP4 Part 12 / Motion Photo)
  console.log('\n--- Motion Photo 特殊标记 ---');
  const mpfBuffer = Buffer.from('MPF');  // Motion Photo File
  const mmtBuffer = Buffer.from('MMT');  // Multi-Media Transport
  const axfBuffer = Buffer.from('AXF');  // Adobe XMP
  const pnmBuffer = Buffer.from('PNM');  // Photo Near Media (华为)
  
  for (const [name, marker] of [['MPF', mpfBuffer], ['MMT', mmtBuffer], ['AXF', axfBuffer], ['PNM', pnmBuffer]]) {
    pos = 0;
    let found = false;
    while (pos < buffer.length - marker.length) {
      const idx = buffer.indexOf(marker, pos);
      if (idx === -1) break;
      if (!found) {
        console.log(`${name} 标记: 位置=${idx}, 相对偏移=${(idx/stat.size*100).toFixed(2)}%`);
        found = true;
      }
      pos = idx + 1;
    }
    if (!found) console.log(`${name} 标记: 未找到`);
  }

  // 6. 查找 XMP 元数据
  console.log('\n--- XMP 元数据 ---');
  const xmpStart = Buffer.from('<x:xmpmeta');
  const xmpEnd = Buffer.from('</x:xmpmeta>');
  const xmpStartPos = buffer.indexOf(xmpStart);
  const xmpEndPos = buffer.indexOf(xmpEnd);
  console.log('XMP 起始标记:', xmpStartPos >= 0 ? `位置=${xmpStartPos}` : '未找到');
  console.log('XMP 结束标记:', xmpEndPos >= 0 ? `位置=${xmpEndPos}` : '未找到');
  
  if (xmpStartPos >= 0 && xmpEndPos >= 0) {
    const xmpData = buffer.slice(xmpStartPos, xmpEndPos + 12).toString('utf8');
    // 查找视频相关字段
    if (xmpData.includes('MotionPhoto') || xmpData.includes('Video')) {
      console.log('XMP 中包含 Motion Photo 或 Video 相关信息!');
      console.log('XMP 内容片段:', xmpData.substring(0, 500) + '...');
    }
  }

  // 7. 分析文件结构
  console.log('\n--- 文件结构分析 ---');
  if (ftypPositions.length > 0) {
    const firstFtyp = ftypPositions[0];
    console.log('检测结果: 可能是标准 Android Motion Photo');
    console.log('  - JPEG 在文件开头');
    console.log('  - MP4 容器在偏移', firstFtyp, '位置');
    const eoiBefore = findLastEoiBefore(buffer, firstFtyp);
    if (eoiBefore >= 0) {
      console.log('  - JPEG 结束于偏移', eoiBefore);
      console.log('  - 建议尝试从偏移', firstFtyp - 4, '提取 MP4');
    }
  } else if (lastEoiPos > 0 && stat.size - lastEoiPos > 1024) {
    console.log('检测结果: 可能是 JPEG + 外部视频格式');
    console.log('  - JPEG 结束于偏移', lastEoiPos);
    console.log('  - JPEG 后面有', stat.size - lastEoiPos, 'bytes 的数据');
    // 分析 JPEG 后的数据
    const afterEoi = buffer.slice(lastEoiPos, lastEoiPos + 32);
    console.log('  - JPEG 后的数据 (32 bytes):', afterEoi.toString('hex').match(/.{2}/g).join(' '));
  } else {
    console.log('检测结果: 无法识别格式');
    console.log('  - 没有找到 ftyp 标记');
    console.log('  - JPEG EOI 后数据量:', stat.size - lastEoiPos, 'bytes');
  }

  console.log('\n=== 诊断完成 ===');
}

function findLastEoiBefore(buffer, beforePos) {
  for (let i = beforePos - 2; i >= 1; i--) {
    if (buffer[i - 1] === 0xFF && buffer[i] === 0xD9) {
      return i + 1;
    }
  }
  return -1;
}

diagnose().catch(console.error);

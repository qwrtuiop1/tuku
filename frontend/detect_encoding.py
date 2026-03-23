import os
path = r'D:\QIanDuanXiangMu\tuku\frontend\src\components\FileUploader.vue'
# Try to detect encoding
raw = open(path, 'rb').read(200)
print('First 200 bytes (hex):', raw[:100].hex())
# Try different encodings
for enc in ['utf-8', 'gbk', 'gb2312', 'utf-16', 'latin1']:
    try:
        text = raw.decode(enc)
        print(f'{enc}: {text[:100]}')
    except:
        print(f'{enc}: FAILED')

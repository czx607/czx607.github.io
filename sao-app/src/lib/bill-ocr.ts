import type { IBillData, IBillItem } from '@/lib/history';

/**
 * 账单 OCR 识别
 *
 * 注意：开源版本需要自行配置 AI 图像识别服务。
 * 你可以使用以下任一方案：
 * 1. 接入百度/阿里/腾讯的通用文字识别 OCR API
 * 2. 使用 Tesseract.js 本地 OCR（纯前端，无需后端）
 * 3. 接入任意支持图片转 JSON 的 AI 服务
 *
 * 下面是一个基于 Tesseract.js 的示例实现（需安装 tesseract.js）
 * 或者你也可以替换为自己的 API 调用。
 */

export async function recognizeBill(imageFile: File): Promise<IBillData> {
  console.log('开始识别账单:', imageFile.name);

  // ============================================
  // 方案一：使用 Tesseract.js 本地 OCR（推荐开源使用）
  // 需要先安装：npm install tesseract.js
  // ============================================
  //
  // import Tesseract from 'tesseract.js';
  // const { data: { text } } = await Tesseract.recognize(imageFile, 'chi_sim+eng');
  // 然后从 text 中解析金额、日期、商家等信息
  //
  // ============================================
  // 方案二：调用后端 API
  // ============================================
  //
  // const formData = new FormData();
  // formData.append('image', imageFile);
  // const res = await fetch('/api/recognize-bill', { method: 'POST', body: formData });
  // const data = await res.json();
  // return data;
  //
  // ============================================

  // 临时占位：返回模拟数据（请替换为真实 OCR 实现）
  console.warn('当前使用的是模拟数据，请替换为真实 OCR 实现');
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    totalAmount: 88.5,
    date: new Date().toISOString().split('T')[0],
    merchant: '示例商家',
    items: [
      { name: '商品A', amount: 32, quantity: 2 },
      { name: '商品B', amount: 24.5, quantity: 1 },
    ] as IBillItem[],
  };
}

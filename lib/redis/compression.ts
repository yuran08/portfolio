/**
 * 数据压缩工具
 *
 * 提供数据压缩和解压功能，减少Redis内存使用
 */

import { gzip, gunzip } from "zlib";
import { promisify } from "util";

// 异步压缩/解压函数
const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

/**
 * 数据压缩工具类
 *
 * 【压缩策略】
 * - 小于1KB的数据不压缩，避免压缩开销
 * - 使用gzip压缩，兼容性好
 * - Base64编码，便于存储
 * - 自动标识压缩格式，支持版本兼容
 */
export class DataCompressor {
  /**
   * 压缩阈值，小于此大小的数据不压缩
   */
  private static readonly COMPRESSION_THRESHOLD = 1000; // 1KB

  /**
   * 压缩数据
   * @param data 要压缩的数据
   * @returns Promise<string> 标识过的压缩数据
   */
  static async compress(data: string): Promise<string> {
    if (data.length < DataCompressor.COMPRESSION_THRESHOLD) {
      // 小于阈值的数据不压缩，避免压缩开销
      return `raw:${data}`;
    }

    try {
      const compressed = await gzipAsync(Buffer.from(data, "utf-8"));
      return `gzip:${compressed.toString("base64")}`;
    } catch (error) {
      console.warn("⚠️ 数据压缩失败，使用原始数据:", error);
      return `raw:${data}`;
    }
  }

  /**
   * 解压数据
   * @param data 压缩的数据
   * @returns Promise<string> 解压后的数据
   */
  static async decompress(data: string): Promise<string> {
    // 原始数据，直接返回
    if (data.startsWith("raw:")) {
      return data.slice(4);
    }

    // gzip压缩数据
    if (data.startsWith("gzip:")) {
      try {
        const compressed = Buffer.from(data.slice(5), "base64");
        const decompressed = await gunzipAsync(compressed);
        return decompressed.toString("utf-8");
      } catch (error) {
        console.error("❌ 数据解压失败:", error);
        throw new Error("数据解压失败");
      }
    }

    // 兼容旧数据（无前缀标识）
    return data;
  }

  /**
   * 检查数据是否已压缩
   * @param data 数据
   * @returns 是否已压缩
   */
  static isCompressed(data: string): boolean {
    return data.startsWith("gzip:");
  }

  /**
   * 检查数据是否为原始格式
   * @param data 数据
   * @returns 是否为原始格式
   */
  static isRaw(data: string): boolean {
    return data.startsWith("raw:");
  }

  /**
   * 获取数据格式
   * @param data 数据
   * @returns 数据格式
   */
  static getFormat(data: string): "gzip" | "raw" | "unknown" {
    if (data.startsWith("gzip:")) return "gzip";
    if (data.startsWith("raw:")) return "raw";
    return "unknown";
  }

  /**
   * 批量压缩多个数据
   * @param dataArray 数据数组
   * @returns Promise<string[]> 压缩后的数据数组
   */
  static async compressBatch(dataArray: string[]): Promise<string[]> {
    return Promise.all(dataArray.map((data) => DataCompressor.compress(data)));
  }

  /**
   * 批量解压多个数据
   * @param dataArray 压缩的数据数组
   * @returns Promise<string[]> 解压后的数据数组
   */
  static async decompressBatch(dataArray: string[]): Promise<string[]> {
    return Promise.all(
      dataArray.map((data) => DataCompressor.decompress(data))
    );
  }

  /**
   * 获取压缩统计信息
   * @param originalData 原始数据
   * @param compressedData 压缩后的数据
   * @returns 压缩统计
   */
  static getCompressionStats(originalData: string, compressedData: string) {
    const originalSize = Buffer.byteLength(originalData, "utf-8");
    const compressedSize = Buffer.byteLength(compressedData, "utf-8");
    const compressionRatio =
      originalSize > 0 ? compressedSize / originalSize : 1;
    const spaceSaved = originalSize - compressedSize;
    const spaceSavedPercent =
      originalSize > 0 ? (spaceSaved / originalSize) * 100 : 0;

    return {
      originalSize,
      compressedSize,
      compressionRatio,
      spaceSaved,
      spaceSavedPercent: Math.round(spaceSavedPercent * 100) / 100,
    };
  }
}

// 导出便捷函数
export const compress = DataCompressor.compress.bind(DataCompressor);
export const decompress = DataCompressor.decompress.bind(DataCompressor);
export const isCompressed = DataCompressor.isCompressed.bind(DataCompressor);
export const isRaw = DataCompressor.isRaw.bind(DataCompressor);
export const getFormat = DataCompressor.getFormat.bind(DataCompressor);

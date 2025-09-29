import { useCallback } from 'react';
import SparkMD5 from 'spark-md5';

const useUpYunUpload = () => {
  // 获取账户信息 - 实际应用中应从安全的地方获取
  const getAccountInfo = useCallback(() => {
    const info = {
      bucket_name: "guoshao-service",
      opename: "guoshao520",
      opepass: "29ul2LJr2z8A130W2i3VJErGh25nD5Xg",
      acc_point: "http://v0.api.upyun.com/"
    }
    return info
  }, []);

  // 上传分块
  const uploadChunks = useCallback((file, uuid, savePath, onProgress) => {
    return new Promise((resolve, reject) => {
      const { bucket_name, opename, opepass, acc_point } = getAccountInfo();
      const blockSize = 1048576; // 1MB
      const totalChunks = Math.ceil(file.size / blockSize);
      let completedChunks = 0;

      const uploadChunk = (chunkIndex) => {
        if (chunkIndex >= totalChunks) {
          resolve();
          return;
        }

        const isLastChunk = chunkIndex === totalChunks - 1;
        const start = chunkIndex * blockSize;
        const end = isLastChunk ? file.size : start + blockSize;
        const chunkSize = end - start;

        const date = new Date().toUTCString();
        const sign = SparkMD5.hash(
          "PUT&/" +
          encodeURI(bucket_name + savePath) +
          "&" +
          date +
          "&" +
          chunkSize +
          "&" +
          SparkMD5.hash(opepass)
        );

        const xhr = new XMLHttpRequest();
        xhr.open("PUT", encodeURI(acc_point + bucket_name + savePath), true);
        
        xhr.setRequestHeader("Authorization", "UpYun " + opename + ":" + sign);
        xhr.setRequestHeader("X-Date", date);
        xhr.setRequestHeader("X-Upyun-Multi-Stage", "upload");
        xhr.setRequestHeader("X-Upyun-Multi-Length", chunkSize);
        xhr.setRequestHeader("X-Upyun-Multi-UUID", uuid);
        xhr.setRequestHeader("X-Upyun-Part-ID", chunkIndex);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");

        xhr.onload = function () {
          if (xhr.status === 204) {
            completedChunks++;
            const progress = (completedChunks / totalChunks) * 100;
            
            // 调用进度回调
            if (onProgress) {
              onProgress(progress);
            }
            
            // 上传下一个分块
            uploadChunk(chunkIndex + 1);
          } else {
            reject(new Error(`分块 ${chunkIndex} 上传失败: ${xhr.status}`));
          }
        };

        xhr.onerror = function () {
          reject(new Error(`分块 ${chunkIndex} 网络错误`));
        };

        xhr.send(file.slice(start, end));
      };

      // 开始上传第一个分块
      uploadChunk(0);
    });
  }, [getAccountInfo]);

  // 完成上传
  const completeUpload = useCallback((uuid, savePath) => {
    return new Promise((resolve, reject) => {
      const { bucket_name, opename, opepass, acc_point } = getAccountInfo();
      
      const date = new Date().toUTCString();
      const sign = SparkMD5.hash(
        "PUT&/" +
        encodeURI(bucket_name + savePath) +
        "&" +
        date +
        "&0&" +
        SparkMD5.hash(opepass)
      );

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", encodeURI(acc_point + bucket_name + savePath), false);
      
      xhr.setRequestHeader("Authorization", "UpYun " + opename + ":" + sign);
      xhr.setRequestHeader("X-Date", date);
      xhr.setRequestHeader("X-Upyun-Multi-Stage", "complete");
      xhr.setRequestHeader("X-Upyun-Multi-UUID", uuid);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");

      xhr.onload = function () {
        if (xhr.status === 201) {
          resolve({ success: true, path: savePath });
        } else if (xhr.status === 204) {
          resolve({ success: false, error: "文件已存在" });
        } else {
          reject(new Error(`完成上传失败: ${xhr.status}`));
        }
      };

      xhr.onerror = function () {
        reject(new Error("完成上传网络错误"));
      };

      xhr.send();
    });
  }, [getAccountInfo]);

  // 主上传函数
  const upLoadupy = useCallback(async (file, filePath = "file-path", onProgress) => {
    try {
      const { bucket_name, opename, opepass, acc_point } = getAccountInfo();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${file.name.split(".")[0]}-${new Date().getTime()}.${fileExtension}`;
      
      // 处理保存路径
      let save_as = filePath.startsWith("/") 
        ? `${filePath}/${fileName}` 
        : `/${filePath}/${fileName}`;

      // 初始化分块上传
      const date = new Date().toUTCString();
      const sign = SparkMD5.hash(
        "PUT&/" +
        encodeURI(bucket_name + save_as) +
        "&" +
        date +
        "&0&" +
        SparkMD5.hash(opepass)
      );

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", encodeURI(acc_point + bucket_name + save_as), true);
      
      // 设置请求头
      xhr.setRequestHeader("Authorization", "UpYun " + opename + ":" + sign);
      xhr.setRequestHeader("X-Date", date);
      xhr.setRequestHeader("X-Upyun-Multi-Stage", "initiate");
      xhr.setRequestHeader("x-upyun-multi-type", file.type);
      xhr.setRequestHeader("X-Upyun-Multi-Length", file.size);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");

      // 初始化请求
      const initResult = await new Promise((resolve, reject) => {
        xhr.onload = function () {
          if (xhr.status === 204) {
            const uuid = xhr.getResponseHeader("x-upyun-multi-uuid");
            resolve({ uuid, save_as });
          } else {
            reject(new Error(`初始化失败: ${xhr.status}`));
          }
        };

        xhr.onerror = function () {
          reject(new Error("初始化网络错误"));
        };

        xhr.send();
      });

      // 上传分块
      await uploadChunks(file, initResult.uuid, initResult.save_as, onProgress);
      
      // 完成上传
      const finalResult = await completeUpload(initResult.uuid, initResult.save_as);
      
      if (finalResult.success) {
        return { 
          success: true, 
          message: `文件 ${file.name} 上传成功`, 
          path: finalResult.path,
          fileName: file.name
        };
      } else {
        return { 
          success: false, 
          error: `文件 ${file.name} 已存在` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || `文件 ${file.name} 上传失败` 
      };
    }
  }, [getAccountInfo, uploadChunks, completeUpload]);

  // 批量上传函数
  const uploadFiles = useCallback(async (files, filePath = "file-path", onProgress) => {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 只处理图片文件
      if (!file.type.startsWith('image/')) {
        results.push({
          success: false,
          error: `文件 ${file.name} 不是图片格式`,
          fileName: file.name
        });
        continue;
      }
      
      // 单个文件进度回调
      const singleFileProgress = (progress) => {
        if (onProgress) {
          // 计算总体进度
          const overallProgress = (
            (i / files.length) * 100 + 
            (progress / 100) * (100 / files.length)
          );
          onProgress(overallProgress, i, files.length, file.name);
        }
      };
      
      const result = await upLoadupy(file, filePath, singleFileProgress);
      results.push(result);
    }
    
    return results;
  }, [upLoadupy]);

  return {
    upLoadupy,
    uploadFiles
  };
};

export default useUpYunUpload;
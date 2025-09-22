import SparkMD5 from 'spark-md5';

function getAccountInfo () {
  const info = {
    bucket_name: "guoshao-service",
    opename: "guoshao520",
    opepass: "29ul2LJr2z8A130W2i3VJErGh25nD5Xg",
    acc_point: "http://v0.api.upyun.com/"
  }
  return info
}

export function upLoadupy (id, filePath = "file-path") {
  return new Promise((resolve, reject) => {
    try {
      const { bucket_name, opename, opepass, acc_point } = getAccountInfo();
      const fileInput = document.getElementById(id);

      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        reject(new Error("未选择文件"));
        return;
      }

      let file = fileInput.files[0];
      let fileExtension = file.name.split('.').pop();
      let fileName = `${file.name.split(".")[0]}-${new Date().getTime()}.${fileExtension}`;

      if (!file) {
        reject(new Error("文件不存在"));
        return;
      }

      // 处理保存路径
      let save_as;
      if (filePath.startsWith("/")) {
        save_as = `${filePath}/${fileName}`;
      } else {
        save_as = `/${filePath}/${fileName}`;
      }

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

      xhr.onload = function () {
        if (xhr.status === 204) {
          const uuid = xhr.getResponseHeader("x-upyun-multi-uuid");
          uploadChunks(file, uuid, save_as)
            .then(() => completeUpload(uuid, save_as, file.name))
            .then(resolve)
            .catch(reject);
        } else {
          reject(new Error(`初始化失败: ${xhr.status}`));
        }
      };

      xhr.onerror = function () {
        reject(new Error("网络错误"));
      };

      xhr.send();
    } catch (error) {
      reject(error);
    }
  });
}

// 上传分块
function uploadChunks (file, uuid, savePath) {
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
          console.log(`上传进度: ${progress.toFixed(2)}%`);

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
}

// 完成上传
function completeUpload (uuid, savePath, originalFileName) {
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
        resolve({ message: `文件 ${originalFileName} 上传成功`, path: savePath });
      } else if (xhr.status === 204) {
        reject(new Error(`文件 ${originalFileName} 已存在`));
      } else {
        reject(new Error(`完成上传失败: ${xhr.status}`));
      }
    };

    xhr.onerror = function () {
      reject(new Error("完成上传网络错误"));
    };

    xhr.send();
  });
}

// 使用示例
// upLoadupy('fileInput')
//   .then(result => console.log('上传成功:', result))
//   .catch(error => console.error('上传失败:', error));
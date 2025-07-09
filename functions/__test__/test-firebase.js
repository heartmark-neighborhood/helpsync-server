import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getFunctions, httpsCallable, connectFunctionsEmulator} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";

// テスト用のFirebaseプロジェクト設定 (値はダミーでOK)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id", // ★ firebase.jsonのプロジェクトIDと合わせる
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);
// Functionsサービスを取得
const functions = getFunctions(app, "asia-northeast1"); // ★ リージョンを忘れずに指定

// --- ここが最重要ポイント ---
// Functions SDKをエミュレータに接続する
// 第2、第3引数はfirebase.jsonで設定したポート番号に合わせる
connectFunctionsEmulator(functions, "localhost", 5001);
// -------------------------

// HTMLのボタン要素を取得
const callButton = document.getElementById("callFunctionButton");
const resultDiv = document.getElementById("result");

// ボタンがクリックされたときの処理
callButton?.addEventListener("click", async () => {
  try {
    resultDiv.textContent = "関数を呼び出し中...";

    // ★★★ デプロイしたCallable関数への参照を作成 ★★★
    // グループ化した場合は "グループ名-関数名" ではなく、httpsCallableの第2引数に直接指定する
    const sendContactMessage = httpsCallable(functions, "createHelpRequest");

    // ★★★ 関数を呼び出し、データを渡す ★★★
    const result = await sendContactMessage({
      name: "Taro Emulator",
      email: "test@example.com",
      message: "エミュレータからのテストメッセージです。",
    });

    // 結果を表示
    console.log("関数からの戻り値:", result.data);
    resultDiv.textContent = `成功: ${JSON.stringify(result.data)}`;
  } catch (error) {
    // エラーを表示
    console.error("関数の呼び出しでエラーが発生しました:", error);
    resultDiv.textContent = `エラー: ${error.message}`;
  }
});

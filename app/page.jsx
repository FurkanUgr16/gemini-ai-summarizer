"use client"

import { useState } from "react";

export default function Home() {

  const [file, setFile] = useState(null)
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function handleFileChange(event) {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      // Dosya türü kontrolü
      if (selectedFile.type !== "application/pdf") {
        setError("Lütfen sadece PDF formatında bir dosya seçin.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(""); // Önceki hatayı temizle
    }
  }

   async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      setError("Lütfen özetlemek için bir dosya seçin.");
      return;
    }

    setLoading(true);
    setError("");
    setSummary("");

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      // response.ok kontrolü, 200-299 aralığındaki durum kodlarını kontrol eder.
      // Eğer API'den 400 veya 500 gibi bir hata dönerse, bu blok çalışır.
      if (!response.ok) {
        throw new Error(data.error || "Bilinmeyen bir hata oluştu.");
      }
      
      setSummary(data.summary);

    } catch (err) {
      // Bu catch bloğu hem ağ hatalarını (örn: internet kesintisi) 
      // hem de yukarıdaki throw new Error ile fırlatılan hataları yakalar.
      // JSON parse hatası da buraya düşer.
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>  
          <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 text-gray-800">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-2 text-blue-600">
          Gemini AI PDF Özetleyici
        </h1>
        <p className="text-center text-gray-500 mb-8">
          PDF dosyanızı yükleyin ve yapay zekanın sizin için özetlemesini izleyin.
        </p>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="mb-4">
            <label htmlFor="pdf-upload" className="block text-sm font-medium text-gray-700 mb-2">
              PDF Dosyası Seçin
            </label>
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !file}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Özetleniyor...' : 'Özetle'}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
            <strong className="font-bold">Hata: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {summary && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Özet</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {summary}
            </p>
          </div>
        )}
      </div>
    </main>

    </>
  );
}

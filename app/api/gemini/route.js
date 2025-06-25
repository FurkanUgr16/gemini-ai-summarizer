import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";



const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function bufferToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

export async function POST(req) {
  try {
    // 1. Dosyayı Form Verisinden Al
    const formData = await req.formData();
    const file = formData.get("pdf");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "PDF dosyası bulunamadı veya geçersiz." }, { status: 400 });
    }

    // 2. Dosyayı Buffer'a Çevir
    // Dosyanın ham verisini (byte) almak için arrayBuffer() kullanıyoruz.
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // 3. Gemini Modelini ve İstek Yapısını Hazırla
    // Dosya işleyebilen modern bir model seçiyoruz.
    const model = genAi.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = "Lütfen bu PDF belgesini kapsamlı bir şekilde özetle. Ana fikirleri, kilit noktaları ve genel temayı Türkçe olarak vurgula.";

    // Dosyamızın buffer'ını ve MIME türünü kullanarak Gemini için bir "part" oluşturuyoruz.
    const filePart = bufferToGenerativePart(fileBuffer, file.type);
    
    // DÜZELTME 3: generateContent'e hem metin prompt'unu hem de dosya part'ını gönderiyoruz.
    const result = await model.generateContent([prompt, filePart]);
   
    const summary = result.response.text();

    // DÜZELTME 4: Artık geçici dosya olmadığı için fs.unlinkSync satırını tamamen kaldırdık.

    return NextResponse.json({ summary });

  } catch (error) {
    console.error("Özetleme hatası:", error);
    return NextResponse.json(
      { error: "Özetleme sırasında sunucuda bir hata oluştu." },
      { status: 500 }
    );
  }
}

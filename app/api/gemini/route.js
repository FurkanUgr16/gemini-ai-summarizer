import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})


export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdf");


    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "PDF dosyası bulunamadı veya geçersiz." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    
    const contents = [
      {text: "Lütfen bu PDF belgesini kapsamlı bir şekilde özetle. Ana fikirleri, kilit noktaları ve genel temayı Türkçe olarak vurgula"},
      {inlineData: {
        mimeType: "application/pdf",
        data: buffer.toString("base64")
      }}
    ]
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents
    })
    return NextResponse.json({ summary: response.text})



  } catch (error) {
    console.error("Özetleme hatası:", error);
    return NextResponse.json(
      { error: "Özetleme sırasında sunucuda bir hata oluştu." },
      { status: 500 }
    );
  }
}

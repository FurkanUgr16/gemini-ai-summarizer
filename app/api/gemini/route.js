import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
 import pdf from "pdf-parse";
// import formidable from "formidable";
// import fs from "fs";


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});




export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get("pdf");

     if (!file) {
      return NextResponse.json({ error: "PDF dosyası bulunamadı." }, { status: 400 });
    }
    
    // Dosya bir string ise hata ver (genellikle yanlış yapılandırmada olur)
    if (typeof file === 'string') {
        return NextResponse.json({ error: "Geçersiz dosya formatı." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer)

    const pdfData = await pdf(buffer);
    const text = pdfData.text

     if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "PDF içinden metin ayıklanamadı veya dosya boş." },
        { status: 400 }
      );
    }

     fs.unlinkSync(pdfFile.filepath);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          text: "Summarize the text below according to the topics, main idea and key points. Unless the user specifies the language of your reply, your reply should be in the same language as the text given to you",
        },
        {
          inlineData:{
            mimeType: "application/pdf",
            data: pdfData.text
          }
        }
      ],
    });

    console.log(response.data.data)
   

   

    // Temizlik işleminden sonra
   
  

  } catch (error) {
    console.error("Özetleme hatası:", error);
    return NextResponse.json(
      { error: "Özetleme sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}

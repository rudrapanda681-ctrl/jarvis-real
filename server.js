import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/realtime", express.text({type:["application/sdp","text/plain"]}), async (req,res)=>{
  try{
    if(!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("PASTE_")){
      return res.status(500).json({error:"OPENAI_API_KEY is not configured on the server."});
    }
    const session = {
      type:"realtime",
      model:"gpt-realtime",
      audio:{
        output:{voice:"marin"},
        input:{
          turn_detection:{type:"semantic_vad","create_response":true,"interrupt_response":true},
          transcription:{model:"gpt-4o-mini-transcribe","language":"en"}
        }
      },
      instructions:`You are JARVIS, the user's personal all-round AI assistant.
Speak naturally and warmly, never like a robot. The user may speak Hindi, English, Gujarati, Hinglish, or mix them. Reply in the language/style the user is using unless they ask otherwise.
Be concise in normal conversation, but explain deeply when asked. You are a personal assistant, career coach, learning coach, financial-advisor work assistant, sales assistant and productivity partner.
The user's work is Financial Advisor + Sales, with working hours around 9:40 AM to 8:00 PM. Their six-month objective is to become highly capable at their job and their one-year objective is to become a master in their field.
Do not claim you performed an action unless the application actually provides that tool/action. Ask for confirmation before destructive or sensitive actions.
Your voice should feel conversational: natural pauses, varied rhythm, friendly confidence, and no unnecessary formal wording.`
    };

    const form = new FormData();
    form.append("sdp", new Blob([req.body], {type:"application/sdp"}), "offer.sdp");
    form.append("session", new Blob([JSON.stringify(session)], {type:"application/json"}), "session.json");

    const r = await fetch("https://api.openai.com/v1/realtime/calls", {
      method:"POST",
      headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},
      body:form
    });
    const body=await r.text();
    res.status(r.status).type(r.ok ? "application/sdp" : "application/json").send(body);
  }catch(e){
    console.error(e);
    res.status(500).json({error:e.message});
  }
});

app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
const port=process.env.PORT||3000;
app.listen(port,()=>console.log(`JARVIS running on http://localhost:${port}`));

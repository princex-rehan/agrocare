/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  Leaf, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  RotateCcw,
  Info,
  Stethoscope,
  Camera,
  Scan,
  Loader2,
  X,
  Sparkles,
  Zap,
  FlaskConical,
  Plus,
  MessageSquare
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- INITIALIZATION ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// --- DATA STRUCTURES ---

const CROPS = [
  { id: 'rice', name: 'Rice', icon: '🌾' },
  { id: 'tomato', name: 'Tomato', icon: '🍅' },
  { id: 'maize', name: 'Maize', icon: '🌽' },
  { id: 'wheat', name: 'Wheat', icon: '🌿' },
  { id: 'chili', name: 'Chili', icon: '🌶️' },
  { id: 'potato', name: 'Potato', icon: '🥔' },
  { id: 'sugarcane', name: 'Sugarcane', icon: '🎋' },
  { id: 'cotton', name: 'Cotton', icon: '☁️' },
  { id: 'soybean', name: 'Soybean', icon: '🫘' },
  { id: 'barley', name: 'Barley', icon: '🌾' },
  { id: 'millet', name: 'Millet', icon: '🌿' },
  { id: 'sorghum', name: 'Sorghum', icon: '🌱' },
  { id: 'groundnut', name: 'Groundnut', icon: '🥜' },
  { id: 'mustard', name: 'Mustard', icon: '🌼' },
  { id: 'sunflower', name: 'Sunflower', icon: '🌻' },
  { id: 'coffee', name: 'Coffee', icon: '☕' },
  { id: 'tea', name: 'Tea', icon: '🍵' },
  { id: 'rubber', name: 'Rubber', icon: '🌳' },
  { id: 'apple', name: 'Apple', icon: '🍎' },
  { id: 'mango', name: 'Mango', icon: '🥭' },
  { id: 'banana', name: 'Banana', icon: '🍌' },
  { id: 'grapes', name: 'Grapes', icon: '🍇' },
  { id: 'citrus', name: 'Citrus', icon: '🍋' },
  { id: 'onion', name: 'Onion', icon: '🧅' },
  { id: 'garlic', name: 'Garlic', icon: '🧄' },
  { id: 'cabbage', name: 'Cabbage', icon: '🥬' },
  { id: 'cauliflower', name: 'Cauliflower', icon: '🥦' },
  { id: 'brinjal', name: 'Eggplant', icon: '🍆' },
  { id: 'bhendi', name: 'Okra', icon: '🥒' },
  { id: 'turmeric', name: 'Turmeric', icon: 'root' },
  { id: 'ginger', name: 'Ginger', icon: '🫚' },
  { id: 'tobacco', name: 'Tobacco', icon: '🍂' },
  { id: 'jute', name: 'Jute', icon: '🧵' },
];

const SYMPTOMS = [
  { id: 'yellow_leaves', name: 'Yellow Leaves' },
  { id: 'brown_spots', name: 'Brown Spots' },
  { id: 'leaf_holes', name: 'Holes in Leaves' },
  { id: 'wilting', name: 'Wilting' },
  { id: 'white_powder', name: 'White Powder' },
  { id: 'curling', name: 'Curled Leaves' },
  { id: 'stunted', name: 'Stunted Growth' },
  { id: 'pests_visible', name: 'Visible Pests' },
  { id: 'deformed_fruit', name: 'Deformed Fruit' },
  { id: 'gray_mold', name: 'Gray Mold' },
  { id: 'black_soot', name: 'Black Sooty Mold' },
  { id: 'burnt_edges', name: 'Burnt Edge Tips' },
  { id: 'sticky_residue', name: 'Sticky Honeydew' },
  { id: 'dropping_leaves', name: 'Premature Leaf Drop' },
  { id: 'yellow_veins', name: 'Yellow Veins' },
  { id: 'necrotic_spots', name: 'Necrotic Spots' },
  { id: 'webbing', name: 'Fine Webbing' },
  { id: 'silvering', name: 'Silvering Surface' },
  { id: 'leaf_mining', name: 'Leaf Mining Trails' },
  { id: 'moldy_roots', name: 'Mushy Roots' },
  { id: 'ooze', name: 'Bacterial Ooze' },
  { id: 'galls', name: 'Galls/Swelling' },
  { id: 'powdery_mildew', name: 'Powdery Mildew' },
];

interface Diagnosis {
  issue: string;
  solution: string;
  avoid: string;
  pesticide?: string;
  next: string;
  severity: 'low' | 'medium' | 'high';
  visualReference?: string;
}

const CROP_RULES: Record<string, Record<string, Diagnosis>> = {
  tomato: {
    'yellow_leaves,brown_spots': {
      issue: "Early Fungal Infection (Blight)",
      solution: "Remove affected leaves immediately and improve spacing.",
      avoid: "Avoid overhead watering; it spreads fungal spores.",
      pesticide: "Chlorothalonil or Copper-based organic fungicide.",
      next: "Apply treatment every 7-10 days if humidity persists.",
      severity: 'medium'
    },
    'wilting': {
      issue: "Bacterial Wilt or Root Rot",
      solution: "Check soil moisture. If soil is wet, improve drainage.",
      avoid: "Do not move items from this plant to healthy ones.",
      pesticide: "No direct pesticide; use soil drench with Streptomycin if bacterial.",
      next: "Solarize the soil before the next planting season to kill pathogens.",
      severity: 'high'
    },
    'white_powder': {
      issue: "Powdery Mildew",
      solution: "Spray a mixture of 1 part milk and 9 parts water on leaves.",
      avoid: "Avoid high humidity and crowded planting.",
      pesticide: "Sulfur or Potassium Bicarbonate sprays.",
      next: "Monitor weekly; ensure morning sun reaches all parts of the plant.",
      severity: 'medium'
    }
  },
  rice: {
    'yellow_leaves': {
      issue: "Nitrogen Deficiency",
      solution: "Apply a small amount of urea or nitrogen-rich compost.",
      avoid: "Do not flood the field excessively; it can leach nutrients.",
      pesticide: "N/A (Nutritional Issue). Use Balanced Fertilizer.",
      next: "Test soil for NPK levels for the next crop cycle.",
      severity: 'low'
    },
    'leaf_holes': {
      issue: "Pest Infestation (Stem Borer or Leaf Folder)",
      solution: "Check for larvae inside rolled leaves.",
      avoid: "Avoid over-applying nitrogen, which attracts more pests.",
      pesticide: "Cartap hydrochloride 50SP or Chlorantraniliprole 18.5 SC.",
      next: "Set up light traps at night to attract and kill adult moths.",
      severity: 'medium'
    }
  },
  maize: {
    'leaf_holes': {
      issue: "Fall Armyworm Damage",
      solution: "Hand-pick caterpillars from the whorl (center) of the plant.",
      avoid: "Don't ignore small holes; they become large ragged edges fast.",
      pesticide: "Spinetoram 11.7 SC or Emamectin benzoate 5 SG.",
      next: "Deep ploughing in summer to expose pupae to birds and sun.",
      severity: 'high'
    },
    'stunted': {
      issue: "Low Phosphorus or Soil Acidity",
      solution: "Apply well-rotted manure or phosphorus fertilizer.",
      avoid: "Avoid planting in waterlogged spots.",
      pesticide: "N/A (Soil Issue). Apply Rock Phosphate or Lime.",
      next: "Consider a official soil pH test; lime can reduce acidity.",
      severity: 'low'
    }
  },
  generic: {
    'default': {
      issue: "General Plant Stress",
      solution: "Ensure consistent watering and check for visible pests.",
      avoid: "Don't apply chemicals until the issue is clearly identified.",
      pesticide: "Neem Oil (General Organic Preventive).",
      next: "Consult a local agriculture extension officer with a photo.",
      severity: 'low'
    }
  }
};

// --- CAMERA COMPONENT ---

function CameraModal({ onCapture, onClose }: { onCapture: (base64: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      console.error("Camera error:", err);
      alert("Please allow camera permissions to use this feature.");
      onClose();
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      onCapture(base64);
      stream?.getTracks().forEach(track => track.stop());
    }
  };

  useState(() => { startCamera(); });

  return (
    <div className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black z-10 pointer-events-none opacity-60" />
      
      {/* HUD Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-10 font-mono">
        <div className="flex justify-between items-start">
          <div className="text-[#8AB67C] flex flex-col gap-2">
             <div className="text-xl font-black italic">PATHOLOGY_SCAN_INIT</div>
             <div className="text-[10px] opacity-60 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-[#8AB67C] animate-pulse" />
               SENSOR_SYNC_04 // NOMINAL
             </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">
             <span className="text-white/60">SPECTRA:</span> IR+VISIBLE
             <span className="text-white/60">RES:</span> 4K_NATIVE
             <span className="text-white/60">LATENCY:</span> 12ms
          </div>
        </div>

        {/* Reticle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 flex items-center justify-center">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#8AB67C] shadow-[0_0_15px_rgba(138,182,124,0.5)]" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#8AB67C] shadow-[0_0_15px_rgba(138,182,124,0.5)]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#8AB67C] shadow-[0_0_15px_rgba(138,182,124,0.5)]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#8AB67C] shadow-[0_0_15px_rgba(138,182,124,0.5)]" />
          
          {/* Scanning Bar */}
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-0.5 bg-[#8AB67C] shadow-[0_0_20px_#8AB67C] z-30"
          />
        </div>

        <div className="flex justify-between items-end">
          <div className="text-[10px] text-[#8AB67C] flex flex-col gap-1 max-w-[200px]">
             <div className="opacity-40 uppercase tracking-widest">Cellular_Mapping:</div>
             <div className="flex items-center gap-2">
               <div className="flex-1 h-0.5 bg-[#8AB67C]/10 rounded-full overflow-hidden">
                 <motion.div 
                   animate={{ width: ['40%', '98%', '85%'] }}
                   transition={{ duration: 10, repeat: Infinity }}
                   className="h-full bg-[#8AB67C]"
                 />
               </div>
               <span className="font-bold">ACTIVE</span>
             </div>
          </div>
          <div className="text-[10px] opacity-40 text-right tracking-[0.2em] font-black italic">
            ALIGN TARGET AREA <br/>
            WAITING FOR OPTICAL LOCK...
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-xl aspect-[3/4] bg-[#0D110D] rounded-[2.5rem] overflow-hidden border border-[#1F261F] shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover grayscale brightness-125 contrast-125 saturate-50" 
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mt-12 flex gap-10 items-center z-50">
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { stream?.getTracks().forEach(t => t.stop()); onClose(); }}
          className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6 text-[#A3AFA3]" />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={capture}
          className="w-24 h-24 rounded-full bg-white flex items-center justify-center p-2 shadow-2xl relative"
        >
          <div className="w-full h-full rounded-full border-4 border-[#8AB67C] flex items-center justify-center ring-4 ring-black/5">
            <div className="w-8 h-8 rounded-full bg-[#8AB67C] shadow-[0_0_15px_#8AB67C]" />
          </div>
          {/* Snap pulses */}
          <div className="absolute inset-0 rounded-full border-2 border-white animate-[pulse-glow_2s_infinite]" />
        </motion.button>
        <div className="w-20" /> {/* Spacer */}
      </div>
    </div>
  );
}

// --- MAIN APP ---

export default function App() {
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<Diagnosis | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const currentDiagnosis = useMemo(() => {
    if (aiDiagnosis) return aiDiagnosis;
    if (!selectedCrop) return null;
    
    const key = [...selectedSymptoms].sort().join(',');
    const cropSpecific = CROP_RULES[selectedCrop];
    
    if (cropSpecific && cropSpecific[key]) return cropSpecific[key];
    
    if (selectedSymptoms.length > 0) {
      for (const s of selectedSymptoms) {
        if (cropSpecific && cropSpecific[s]) return cropSpecific[s];
      }
    }

    return CROP_RULES.generic.default;
  }, [selectedCrop, selectedSymptoms, aiDiagnosis]);

  const generateSmartDiagnosis = async () => {
    if (!selectedCrop || selectedSymptoms.length === 0) return;
    setIsAiLoading(true);
    setAiDiagnosis(null);
    
    const cropName = CROPS.find(c => c.id === selectedCrop)?.name;
    const symptomNames = selectedSymptoms.map(s => SYMPTOMS.find(sym => sym.id === s)?.name).join(', ');

    try {
      const prompt = `You are a professional plant pathologist. A farmer has a ${cropName} crop with the following symptoms: ${symptomNames}. 
      Provide a precise diagnosis in JSON format. 
      IMPORTANT: Structure the 'solution' and 'next' fields as clear, bulleted or numbered points for easy reading.
      Provide a 'visualReference' keyword that describes how this disease typically looks (to be used for image search).
      
      JSON format: { 
        "issue": "Disease/Pest Name", 
        "solution": "1. First point\\n2. Second point...", 
        "avoid": "What to avoid", 
        "pesticide": "Specific pesticide or organic treatment", 
        "next": "1. First step\\n2. Second step...", 
        "severity": "low/medium/high",
        "visualReference": "descriptive keywords for image search"
      }. 
      Ensure the response is valid JSON and nothing else.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      const text = result.text || '';
      const cleanedJson = text.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanedJson);

      setAiDiagnosis({
        issue: data.issue,
        solution: data.solution,
        avoid: data.avoid,
        pesticide: data.pesticide,
        next: data.next,
        severity: data.severity as 'low' | 'medium' | 'high',
        visualReference: data.visualReference
      });
      setShowResult(true);
    } catch (err) {
      console.error("Smart Diagnosis error:", err);
      setShowResult(true); // Fallback to rule-based if AI fails
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are an expert Agricultural Consultant. Always provide answers in numbered or bulleted points for clarity. Use Markdown for formatting. If relevant, describe what symptoms look like."
        },
        history: chatMessages.map(m => ({ 
          role: m.role === 'user' ? 'user' : 'model', 
          parts: [{ text: m.text }] 
        })),
      });

      const result = await chat.sendMessage({ message: userMsg });
      const text = result.text || '';
      setChatMessages(prev => [...prev, { role: 'model', text }]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I'm having trouble connecting to the network. Please try again later." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const analyzeWithAI = async (base64Image: string) => {
    setIsAiLoading(true);
    setIsCameraOpen(false);
    setAiDiagnosis(null);
    
    try {
      const base64Data = base64Image.split(',')[1];
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: "Analyze this image of a crop disease. Identify the crop, the symptoms, and provide a diagnosis in the following JSON format: { \"cropId\": \"(closest match from internal IDs: tomato, rice, maize, etc)\", \"issue\": \"Disease Name\", \"solution\": \"Immediate Action\", \"avoid\": \"What not to do\", \"pesticide\": \"Recommended pesticide or organic treatment\", \"next\": \"Detailed follow-up steps\", \"severity\": \"low/medium/high\", \"symptoms\": [\"list of symptoms detected\"] }. Ensure the response is valid JSON and nothing else." },
            { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
          ]
        }
      });

      const text = result.text || '';
      const data = JSON.parse(text.replace(/```json|```/g, '').trim());
      setAiDiagnosis({
        issue: data.issue,
        solution: data.solution,
        avoid: data.avoid,
        pesticide: data.pesticide,
        next: data.next,
        severity: data.severity as 'low' | 'medium' | 'high',
        visualReference: data.visualReference || `${selectedCropData?.name} ${data.issue}`
      });
      setSelectedCrop(data.cropId);
      setSelectedSymptoms(data.symptoms || []);
      setShowResult(true);
    } catch (err) {
      console.error("AI Analysis error:", err);
      alert("AI was unable to identify the crop/issue. Please try again or use manual selection.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const reset = () => {
    setSelectedCrop(null);
    setSelectedSymptoms([]);
    setShowResult(false);
    setAiDiagnosis(null);
  };

  const selectedCropData = CROPS.find(c => c.id === selectedCrop);

  return (
    <div className="min-h-screen bg-[#0A0D0A] text-[#E0E7E0] font-sans selection:bg-[#8AB67C] selection:text-[#0A0D0A] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 technical-overlay pointer-events-none opacity-40" />
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#8AB67C]/5 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-[#8AB67C]/5 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />

      {/* Navigation */}
      <nav className="h-20 border-b border-[#1F261F] flex items-center justify-between px-6 md:px-10 sticky top-0 bg-[#0A0D0A]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={reset}>
            <div className="w-10 h-10 bg-[#8AB67C] rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shadow-[0_0_20px_rgba(138,182,124,0.3)]">
              <Sprout className="w-6 h-6 text-[#0A0D0A]" />
            </div>
            <div>
              <h1 className="font-serif text-2xl tracking-tighter leading-none">AgroCare</h1>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#8AB67C] font-black opacity-60">by TECH TITANS</p>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-12 font-mono text-[10px] text-[#A3AFA3] tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8AB67C] animate-pulse" />
              Satellite Sync Active
          </div>
          <div className="flex items-center gap-2 opacity-40">
            Node: 0x2A_4B7
          </div>
          <div className="flex items-center gap-2 opacity-40 text-right">
            {new Date().toLocaleTimeString('en-US', { hour12: false })} <br/> GMT +0000
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center gap-2 px-6 py-2.5 border border-[#1F261F] text-[10px] uppercase tracking-widest font-black rounded-lg hover:bg-white/5 transition-all">
            Database
          </button>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="p-3 bg-[#8AB67C]/10 border border-[#8AB67C]/20 text-[#8AB67C] rounded-xl hover:bg-[#8AB67C] hover:text-[#0A0D0A] transition-all shadow-lg"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Selection */}
        <aside className="w-full md:w-[400px] border-r border-[#1F261F] p-6 md:p-10 flex flex-col gap-10 bg-[#0A0D0A] overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="flex flex-col gap-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCameraOpen(true)}
              className="w-full py-4 bg-[#8AB67C]/10 border border-[#8AB67C]/30 text-[#8AB67C] rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-[10px] hover:bg-[#8AB67C]/20 transition-all border-dashed overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <Camera className="w-4 h-4" /> AI Visual Scanner
            </motion.button>
            <div className="h-px bg-[#1F261F] my-2" />
          </div>

          <div>
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-[#8AB67C] mb-6 font-black flex items-center gap-2">
              <span className="w-4 h-[1px] bg-[#8AB67C]/30"></span> 01. Select Crop
            </h2>
            <motion.div 
              variants={{
                show: { transition: { staggerChildren: 0.05 } }
              }}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-3 pb-4"
            >
              {CROPS.map((crop) => {
                const isSelected = selectedCrop === crop.id;
                return (
                  <motion.button
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0 }
                    }}
                    key={crop.id}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      setSelectedCrop(crop.id);
                      setShowResult(false);
                      setAiDiagnosis(null);
                    }}
                    className={`px-4 py-4 rounded-xl text-left text-sm transition-all duration-300 flex items-center gap-3 border ${
                      isSelected 
                        ? 'bg-[#1A201A] border-[#8AB67C] text-[#E0E7E0] ring-1 ring-[#8AB67C]/30' 
                        : 'bg-[#0D110D] border-[#1F261F] text-[#E0E7E0]/40 hover:opacity-100 hover:border-[#334155]'
                    }`}
                  >
                    <span className="text-lg opacity-80">{crop.icon !== 'root' ? crop.icon : '🌱'}</span>
                    <span className="truncate">{crop.name}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>

          <motion.div 
            animate={{ opacity: selectedCrop ? 1 : 0.2 }}
            className={selectedCrop ? '' : 'pointer-events-none'}
          >
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-[#8AB67C] mb-6 font-black flex items-center gap-2">
              <span className="w-4 h-[1px] bg-[#8AB67C]/30"></span> 02. Observe Symptoms
            </h2>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map((symptom, idx) => {
                const isSelected = selectedSymptoms.includes(symptom.id);
                return (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#8AB67C] text-[#0A0D0A] shadow-[0_0_15px_rgba(138,182,124,0.3)]'
                        : 'border border-[#1F261F] text-[#E0E7E0] opacity-40 hover:opacity-100 hover:border-[#334155]'
                    }`}
                  >
                    {symptom.name}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <div className="mt-8">
            <button
              onClick={generateSmartDiagnosis}
              disabled={!selectedCrop || selectedSymptoms.length === 0 || isAiLoading}
              className="w-full py-5 bg-[#8AB67C] disabled:bg-[#1F261F] disabled:text-[#E0E7E0]/20 text-[#0A0D0A] text-[11px] uppercase tracking-[0.3em] font-black rounded-sm shadow-[0_10px_30px_rgba(138,182,124,0.1)] transition-all active:scale-[0.98] hover:brightness-110 flex items-center justify-center gap-2"
            >
              {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Smart Diagnosis
            </button>
            <p className="text-[9px] text-center opacity-30 mt-3 uppercase tracking-widest font-bold">Powered by Gemini AI Specialist</p>
          </div>
        </aside>

        {/* Diagnosis Result Area */}
        <section className="flex-1 p-8 md:p-16 bg-[#0E120E] relative overflow-hidden min-h-[500px] flex items-center justify-center">
          {/* Decorative Background Text */}
          <div className="absolute -right-20 bottom-[-50px] opacity-[0.03] select-none pointer-events-none hidden lg:block">
            <h1 className="text-[300px] font-serif leading-none uppercase">{selectedCropData?.id || 'CROP'}</h1>
          </div>

          <AnimatePresence mode="wait">
            {isAiLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col items-center justify-center p-20 text-center relative overflow-hidden z-10 w-full"
              >
                <div className="absolute inset-0 bg-[#8AB67C]/5 animate-pulse" />
                <motion.div 
                   animate={{ 
                    y: [-300, 300],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 left-0 w-full h-[1px] bg-[#8AB67C] z-30 shadow-[0_0_20px_#8AB67C]"
                />
                <div className="relative mb-12">
                  <div className="w-40 h-40 border border-[#8AB67C]/5 rounded-full animate-[spin_20s_linear_infinite]" />
                  <div className="w-32 h-32 border border-[#8AB67C]/10 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_10s_linear_infinite]" />
                  <div className="w-24 h-24 border-2 border-[#8AB67C]/30 border-t-[#8AB67C] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_3s_linear_infinite]" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Sparkles className="w-10 h-10 text-[#8AB67C] animate-pulse" />
                  </div>
                </div>
                <div className="relative z-40">
                  <motion.h3 
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-3xl font-serif mb-6 tracking-tight text-[#E0E7E0]"
                  >
                    Neural Engine <span className="opacity-40">Processing</span>
                  </motion.h3>
                  
                  <div className="flex flex-col gap-3 font-mono text-[9px] uppercase tracking-[0.3em] font-bold text-[#8AB67C]/50 mb-10">
                    <div className="flex items-center gap-4">
                      <span className="w-2 h-2 bg-[#8AB67C] animate-ping" />
                      Loading Symptom Matrix
                    </div>
                    <div className="flex items-center gap-4 opacity-30">
                      <span className="w-2 h-2 bg-[#8AB67C]" />
                      Querying Global Databases
                    </div>
                  </div>
                  
                  <p className="text-[#A3AFA3] text-sm italic max-w-xs mx-auto leading-relaxed opacity-60">Our AI is cross-referencing millions of leaf variations to find a matching pathology pattern.</p>
                </div>
              </motion.div>
            ) : !showResult ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto z-10"
              >
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-24 h-24 border border-dashed border-[#8AB67C]/30 rounded-3xl flex items-center justify-center mb-12 bg-gradient-to-br from-[#1F261F] to-[#0A0D0A] shadow-2xl relative group cursor-pointer"
                  onClick={() => setIsCameraOpen(true)}
                >
                  <div className="absolute inset-2 border border-[#8AB67C]/10 rounded-2xl animate-pulse" />
                  <Camera className="w-8 h-8 text-[#8AB67C]" />
                </motion.div>
                <h3 className="text-4xl font-serif mb-6 leading-tight tracking-tighter text-[#E0E7E0]">Crop Diagnostic <br/>Core Unit</h3>
                <p className="text-[#A3AFA3] text-sm leading-relaxed mb-12 opacity-60">
                  Deploy AI visual analysis or select physical symptoms to generate a multi-tier treatment protocol.
                </p>
                <div className="flex flex-col gap-4 w-full">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsCameraOpen(true)}
                    className="w-full py-5 bg-[#8AB67C] text-[#0A0D0A] text-[10px] uppercase tracking-[0.4em] font-black rounded-xl shadow-2xl flex items-center justify-center gap-3"
                  >
                    <Plus className="w-4 h-4" /> Initialize New Analysis
                  </motion.button>
                </div>
              </motion.div>
            ) : currentDiagnosis && (
              <motion.div
                key="result"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
                }}
                className="max-w-3xl relative z-10 w-full"
              >
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mb-16">
                  <div className="flex items-center gap-4 mb-10">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className={`px-4 py-1.5 rounded-full text-[9px] uppercase tracking-[0.3em] font-black border flex items-center gap-2 ${
                        currentDiagnosis.severity === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 
                        currentDiagnosis.severity === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'bg-[#8AB67C]/10 text-[#8AB67C] border-[#8AB67C]/20 shadow-[0_0_20px_rgba(138,182,124,0.1)]'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        currentDiagnosis.severity === 'high' ? 'bg-rose-500' : 
                        currentDiagnosis.severity === 'medium' ? 'bg-amber-500' : 'bg-[#8AB67C]'
                      }`} />
                      System Priority: {currentDiagnosis.severity}
                    </motion.div>
                    <div className="h-px flex-1 bg-gradient-to-r from-[#1F261F] to-transparent" />
                  </div>
                  
                  <h3 className="text-6xl md:text-8xl font-serif leading-none tracking-tighter mb-10 text-[#E0E7E0] selection:bg-[#8AB67C] selection:text-[#0A0D0A]">
                    {currentDiagnosis.issue.split('(')[0]}
                    {currentDiagnosis.issue.includes('(') && (
                      <motion.span 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="block text-[#8AB67C] font-sans text-2xl md:text-4xl italic font-light mt-6 mix-blend-screen"
                      >
                        {currentDiagnosis.issue.split('(')[1].replace(')', '')}
                      </motion.span>
                    )}
                  </h3>

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-wrap items-center gap-8"
                  >
                    <div className="bg-[#1A201A] border border-[#2D382D] p-5 rounded-3xl flex items-center gap-5 shadow-2xl">
                      <div className="w-16 h-16 bg-[#0A0D0A] rounded-2xl flex items-center justify-center text-4xl border border-[#1F261F] shadow-inner rotate-3">
                        {selectedCropData?.icon !== 'root' ? selectedCropData?.icon : '🌱'}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 font-black mb-1">Impacted Species</p>
                        <h4 className="text-2xl font-serif text-[#E0E7E0]">{selectedCropData?.name}</h4>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="space-y-16">
                    {currentDiagnosis.visualReference && (
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="rounded-[2.5rem] overflow-hidden border border-[#1F261F] relative group bg-[#0A0D0A] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)]"
                      >
                        <img 
                          src={`https://loremflickr.com/800/600/${selectedCropData?.name || 'plant'},${currentDiagnosis.visualReference.split(' ').join(',')}`} 
                          alt="Visual Reference"
                          className="w-full aspect-square object-cover opacity-60 group-hover:opacity-100 transition-all duration-1000 scale-105 group-hover:scale-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                        <div className="absolute bottom-8 left-8">
                          <p className="text-[10px] uppercase tracking-[0.4em] text-[#8AB67C] font-black mb-2 flex items-center gap-3">
                            <span className="w-6 h-px bg-[#8AB67C]" /> Reference Imagery
                          </p>
                          <h5 className="text-xl font-serif italic text-zinc-100">{currentDiagnosis.issue}</h5>
                        </div>
                      </motion.div>
                    )}
                    
                    <div className="space-y-10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#8AB67C]/10 rounded-2xl flex items-center justify-center border border-[#8AB67C]/20">
                          <Zap className="w-5 h-5 text-[#8AB67C]" />
                        </div>
                        <h4 className="text-[12px] uppercase tracking-[0.4em] font-black text-[#8AB67C] mb-0">Active Protocols</h4>
                      </div>
                      
                      <div className="space-y-6">
                        {currentDiagnosis.solution.split('\n').filter(l => l.trim()).map((line, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i }}
                            viewport={{ once: true }}
                            className="flex gap-4 group"
                          >
                            <span className="text-[#8AB67C] text-lg leading-none opacity-40 group-hover:opacity-100 transition-opacity">/</span>
                            <p className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors leading-relaxed">
                              {line.replace(/^\d+\.\s*|^\-\s*/, '').trim()}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }} className="space-y-12 h-fit md:sticky md:top-8">
                    <div className="bg-[#1A201A] p-10 md:p-12 border border-[#2D382D] flex flex-col rounded-[2rem] shadow-2xl relative overflow-hidden ring-1 ring-white/5">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#8AB67C]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                      
                      <h4 className="text-[11px] uppercase tracking-[0.4em] font-black mb-10 opacity-40 flex items-center gap-3">
                         Predictive Measures
                      </h4>

                      <div className="space-y-10 mb-12">
                        {currentDiagnosis.next.split('\n').filter(l => l.trim()).map((step, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (i * 0.1) }}
                            viewport={{ once: true }}
                            className="flex gap-6 group"
                          >
                            <div className="text-[#8AB67C] font-black h-9 w-9 min-w-[36px] rounded-2xl bg-[#8AB67C]/10 flex items-center justify-center text-[12px] group-hover:bg-[#8AB67C] group-hover:text-[#0A0D0A] transition-all rotate-3 ring-1 ring-[#8AB67C]/20">0{i + 1}</div>
                            <span className="flex-1 pt-1.5 text-zinc-300 leading-normal text-sm font-medium">{step.replace(/^\d+\.\s*|^\-\s*/, '').trim()}</span>
                          </motion.div>
                        ))}
                      </div>

                      {currentDiagnosis.pesticide && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          className="pt-10 border-t border-[#2D382D]"
                        >
                          <div className="flex items-center gap-3 mb-6">
                            <FlaskConical className="w-4 h-4 text-[#8AB67C]" />
                            <h5 className="text-[10px] uppercase tracking-[0.4em] font-black text-[#8AB67C]/60">Treatment Spec</h5>
                          </div>
                          <div className="text-sm text-zinc-100 bg-[#0A0D0A] p-6 rounded-2xl border border-[#2D382D] italic font-serif leading-relaxed shadow-inner">
                            "{currentDiagnosis.pesticide}"
                          </div>
                        </motion.div>
                      )}

                      <motion.button 
                        whileHover={{ gap: '1.5rem' }}
                        className="mt-12 flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em] text-[#8AB67C] group"
                      >
                        Pathology Network Login
                        <ChevronRight className="w-5 h-5" />
                      </motion.button>
                    </div>

                    <motion.button 
                      onClick={reset}
                      whileHover={{ opacity: 1 }}
                      className="w-full flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.5em] opacity-40 transition-opacity font-black group py-8 border-t border-dashed border-[#1F261F]"
                    >
                      <RotateCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-700" /> 
                      De-Initialize Current Session
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* AI Assistant Drawer */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 w-full sm:w-[450px] h-full bg-[#0A0D0A] z-[110] border-l border-[#1F261F] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-[#1F261F] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#8AB67C] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#0A0D0A]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest">Agro-Expert AI</h3>
                  <span className="text-[9px] text-[#8AB67C] uppercase font-black tracking-widest">Live Consultant</span>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-[#1F261F] rounded-full transition-colors text-[#A3AFA3]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                  <Sparkles className="w-12 h-12 mb-4" />
                  <p className="text-xs uppercase tracking-[0.2em] font-black">AI Assistant Ready</p>
                  <p className="text-[10px] mt-2 italic max-w-[200px]">"How can I help you with your {selectedCropData?.name || 'crops'} today?"</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#1A201A] text-[#E0E7E0] border border-[#2D382D]' 
                      : 'bg-[#0E120E] text-[#A3AFA3] border border-[#1F261F]'
                  }`}>
                    <div className="markdown-body prose prose-invert prose-xs max-w-none text-sm leading-relaxed overflow-x-auto">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#0E120E] p-4 rounded-2xl border border-[#1F261F]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#8AB67C]" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleChat} className="p-6 border-t border-[#1F261F] bg-[#0A0D0A]">
              <div className="relative flex items-center">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask anything about fertilizing, soil..."
                  className="w-full bg-[#1F261F] border border-[#1F261F] rounded-xl py-4 pl-4 pr-12 text-sm focus:border-[#8AB67C] outline-none transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="absolute right-4 text-[#8AB67C] disabled:opacity-20 transition-opacity"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Section */}
      <footer className="px-6 md:px-10 py-5 border-t border-[#1F261F] flex flex-col sm:flex-row justify-between items-center bg-[#0A0D0A] gap-4">
        <div className="text-[9px] opacity-20 uppercase tracking-[0.3em] font-medium text-center sm:text-left">
          AgroCare by TECH TITANS — AI Vision Enabled
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#8AB67C] animate-pulse"></div>
            <span className="text-[9px] opacity-40 uppercase tracking-[0.2em] font-black">AI Models Online</span>
          </div>
          <div className="w-px h-3 bg-[#1F261F]"></div>
          <div className="flex items-center gap-1 text-[9px] opacity-40 uppercase tracking-[0.2em]">
            <AlertCircle className="w-3 h-3" /> Not Professional Advice
          </div>
        </div>
      </footer>
    </div>
  );
}

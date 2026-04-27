import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#FAF7F2", card: "#FFFFFF",
  sage: "#7C9A7E", sageLight: "#EBF2EB",
  terra: "#C4785A", terraLight: "#FAF0EB",
  cream: "#F5EFE6", text: "#2C2C2C",
  muted: "#9A8F87", border: "#EDE8E1",
  water: "#7BA7BC", waterLight: "#EBF4F8",
  purple: "#9B7EC8", purpleLight: "#F3EEF9",
};

const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; font-family: 'DM Sans', sans-serif; }
  @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes slideLeft { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideRight { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
  @keyframes popIn { 0%{transform:scale(0.8);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
  .slide-up { animation: slideUp 0.45s ease forwards; }
  .fade-in  { animation: fadeIn 0.35s ease forwards; }
  .slide-left  { animation: slideLeft 0.3s ease forwards; }
  .slide-right { animation: slideRight 0.3s ease forwards; }
  .pop-in { animation: popIn 0.35s ease forwards; }
  ::-webkit-scrollbar { display:none; }
  textarea:focus { outline:none; }
  button:active { transform: scale(0.97); }
`;

const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const getGreeting = () => { const h=new Date().getHours(); return h<12?"Good morning":h<17?"Good afternoon":"Good evening"; };

// ── Static data ───────────────────────────────────────────
const FOCUS_OPTIONS = [
  { id:"high-protein",  label:"High Protein",     emoji:"💪", color:"#C4785A" },
  { id:"veggies",       label:"More Veggies",      emoji:"🥦", color:"#7C9A7E" },
  { id:"high-fiber",    label:"High Fiber",        emoji:"🌾", color:"#A0845C" },
  { id:"low-carb",      label:"Low Carb",          emoji:"🥗", color:"#7BA7BC" },
  { id:"quick",         label:"Quick & Easy",      emoji:"⚡", color:"#C4A45A" },
  { id:"family",        label:"Family-Friendly",   emoji:"👨‍👩‍👧",color:"#B07CC4" },
  { id:"mediterranean", label:"Mediterranean",     emoji:"🫒", color:"#7C9A7E" },
  { id:"anti-inflam",   label:"Anti-Inflammatory", emoji:"🫐", color:"#7BA7BC" },
  { id:"energy",        label:"Energy Boost",      emoji:"✨", color:"#C4785A" },
  { id:"gut-health",    label:"Gut Health",        emoji:"🌿", color:"#7C9A7E" },
];

const MEAL_TIMES = [
  { id:"breakfast", label:"Breakfast", emoji:"🌅" },
  { id:"lunch",     label:"Lunch",     emoji:"☀️" },
  { id:"dinner",    label:"Dinner",    emoji:"🌙" },
  { id:"snack",     label:"Snack",     emoji:"🍎" },
];

// Quick-pick preference tags for settings tab
const PREF_TAGS = [
  { group:"Diet",        tags:[{l:"Vegetarian",e:"🌱"},{l:"Vegan",e:"🌿"},{l:"Gluten-free",e:"🌾"},{l:"Dairy-free",e:"🥛"},{l:"Kosher",e:"✡️"},{l:"No pork",e:"🐷"}] },
  { group:"Allergies",   tags:[{l:"No nuts",e:"🥜"},{l:"No shellfish",e:"🦐"},{l:"No eggs",e:"🥚"},{l:"No soy",e:"🫘"}] },
  { group:"Preferences", tags:[{l:"I love spicy",e:"🌶️"},{l:"Kid-friendly only",e:"👶"},{l:"Israeli cuisine",e:"🇮🇱"},{l:"Mediterranean",e:"🫒"},{l:"Batch cooking",e:"🍲"},{l:"No cooking",e:"🥗"}] },
];

const TIPS = [
  "Drink a full glass of water before making the kids' lunch. You'll remember yours too.",
  "A 10-minute walk counts. Movement is movement, always.",
  "Eat sitting down today — even once. It changes how satisfied you feel.",
  "Protein at every meal keeps you fuller, longer. Think eggs, yogurt, legumes.",
  "Rest is part of training. A tired mom who slept is stronger than one who didn't.",
  "Batch cook one thing on Sunday. Even just boiling eggs changes your whole week.",
];

const FALLBACK = {
  breakfast: [
    { name:"Greek Yogurt Power Bowl",   emoji:"🫙", description:"Full-fat Greek yogurt with berries, honey and granola. Ready in 2 minutes.",   tags:["High protein","5 min","No cook"] },
    { name:"Avocado & Egg Toast",        emoji:"🥑", description:"Two eggs any style on whole grain toast with sliced avocado. Balanced and filling.", tags:["Healthy fats","10 min","Easy"] },
    { name:"Overnight Oats",             emoji:"🥣", description:"Prep the night before — oats, chia, almond milk, banana. Grab and go.",           tags:["High fiber","Prep ahead","Kid-friendly"] },
    { name:"Cottage Cheese & Fruit",     emoji:"🍓", description:"Creamy cottage cheese with seasonal fruit and honey. Protein-packed, zero cooking.", tags:["High protein","2 min","No cook"] },
  ],
  lunch: [
    { name:"Tuna & Veggie Wrap",   emoji:"🌯", description:"Canned tuna, cucumber, tomato, hummus in a whole wheat wrap. Under 5 minutes.",  tags:["High protein","5 min","No cook"] },
    { name:"Lentil Soup",          emoji:"🍲", description:"A big pot lasts the week and reheats beautifully. Protein, fiber, iron.",           tags:["High fiber","Meal prep","Family-friendly"] },
    { name:"Quinoa Salad Bowl",    emoji:"🥗", description:"Quinoa with roasted veggies, feta, lemon dressing. Great batch-cooked on Sunday.", tags:["Complete protein","Meal prep","Filling"] },
    { name:"Egg Salad on Rye",     emoji:"🥚", description:"Boiled eggs mashed with Greek yogurt and mustard on rye. Fast and protein-rich.",    tags:["High protein","10 min","Easy"] },
  ],
  dinner: [
    { name:"One-Pan Shakshuka",        emoji:"🍳", description:"Eggs poached in spiced tomato sauce. The whole family eats it — make a big pan.", tags:["High protein","20 min","Family-friendly"] },
    { name:"Salmon with Roasted Veg",  emoji:"🐟", description:"Sheet pan salmon with sweet potatoes and broccoli. Minimal cleanup.",              tags:["Omega-3","30 min","Anti-inflammatory"] },
    { name:"Chicken Stir Fry",         emoji:"🍗", description:"Chicken strips with whatever veg you have, over brown rice or quinoa.",            tags:["High protein","20 min","Flexible"] },
    { name:"Stuffed Bell Peppers",     emoji:"🫑", description:"Bell peppers filled with turkey, tomatoes, and rice. Kids love picking their color.", tags:["High protein","35 min","Family-friendly"] },
  ],
  snack: [
    { name:"Apple & Almond Butter",           emoji:"🍎", description:"Apple slices with almond butter. Fiber and healthy fats — no afternoon crash.",  tags:["Fiber","2 min","No cook"] },
    { name:"Hummus & Veggie Sticks",          emoji:"🥕", description:"Carrot, cucumber, celery dipped in hummus. Crunchy and satisfying.",              tags:["Fiber","5 min","Family-friendly"] },
    { name:"Energy Date Balls",               emoji:"🟤", description:"Blend dates, oats, peanut butter. Roll into balls, refrigerate. Eat all week.",   tags:["Energy","Meal prep","No bake"] },
    { name:"Hard Boiled Eggs + Tomatoes",     emoji:"🥚", description:"Prep eggs on Sunday. Grab 2 + a handful of tomatoes — most efficient protein.",   tags:["High protein","2 min","Meal prep"] },
  ],
};

// ── Shared UI components ──────────────────────────────────
function SkeletonCard({ height=200 }) {
  return <div style={{ background:`linear-gradient(90deg,${C.cream} 25%,#f0e8de 50%,${C.cream} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite", borderRadius:20, height, marginBottom:12 }} />;
}

function Chip({ label, emoji, selected, color, onClick, small }) {
  return (
    <button onClick={onClick} style={{
      display:"flex", alignItems:"center", gap:5,
      padding: small ? "5px 11px" : "7px 14px",
      borderRadius:50, whiteSpace:"nowrap",
      border:`1.5px solid ${selected ? color : C.border}`,
      background: selected ? color+"1A" : C.card,
      color: selected ? color : C.muted,
      fontFamily:"'DM Sans',sans-serif",
      fontSize: small ? 11 : 12, fontWeight:500,
      cursor:"pointer", transition:"all 0.2s",
    }}>
      {emoji && <span>{emoji}</span>}{label}
    </button>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize:11, fontWeight:500, letterSpacing:1.1, color:C.muted, textTransform:"uppercase", marginBottom:10 }}>{children}</div>;
}

// ── Swipeable Meal Stack ──────────────────────────────────
function MealSwipeStack({ meals, feedbacks, onFeedback }) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState("left");
  const touchStart = useRef(null);
  const go = (d) => {
    const next = idx + d;
    if (next < 0 || next >= meals.length) return;
    setDir(d > 0 ? "left" : "right");
    setIdx(next);
  };
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (!touchStart.current) return;
    const dx = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) go(dx > 0 ? 1 : -1);
    touchStart.current = null;
  };
  const meal = meals[idx];
  const fb   = feedbacks[idx];

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <span style={{ fontSize:12, color:C.muted }}>Option <b style={{ color:C.terra }}>{idx+1}</b> of {meals.length}</span>
        <div style={{ display:"flex", gap:8 }}>
          {[[-1,"‹"],[1,"›"]].map(([d,a]) => {
            const off = d<0 ? idx===0 : idx===meals.length-1;
            return <button key={d} onClick={()=>go(d)} disabled={off} style={{ width:32,height:32,borderRadius:"50%",border:`1.5px solid ${off?C.border:C.terra+"50"}`,background:off?C.cream:C.terraLight,color:off?C.border:C.terra,fontSize:16,cursor:off?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:600,transition:"all 0.2s" }}>{a}</button>;
          })}
        </div>
      </div>
      <div style={{ display:"flex", gap:5, marginBottom:14 }}>
        {meals.map((_,i)=>(
          <div key={i} onClick={()=>{setDir(i>idx?"left":"right");setIdx(i);}} style={{ height:4,borderRadius:4,cursor:"pointer",transition:"all 0.3s",flex:i===idx?2:1,background:i===idx?C.terra:C.border }} />
        ))}
      </div>
      <div key={`${idx}-${dir}`} className={dir==="left"?"slide-left":"slide-right"}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        style={{ background:C.card,borderRadius:24,padding:24,boxShadow:"0 4px 24px rgba(0,0,0,0.07)",borderTop:`4px solid ${C.terra}` }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
          <div style={{ fontFamily:"'Playfair Display',serif",fontSize:20,color:C.text,lineHeight:1.3,flex:1,paddingRight:12 }}>{meal.name}</div>
          <span style={{ fontSize:36 }}>{meal.emoji}</span>
        </div>
        <p style={{ fontSize:13.5,color:C.muted,lineHeight:1.65,marginBottom:14 }}>{meal.description}</p>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:16 }}>
          {meal.tags?.map(t=><span key={t} style={{ fontSize:11,padding:"4px 10px",background:C.terraLight,color:C.terra,borderRadius:50,fontWeight:500 }}>{t}</span>)}
        </div>
        {!fb ? (
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {[["✅","I'll try it","try",C.sage],["🍽️","Made it!","made",C.terra],["❌","Skip","skip",C.muted]].map(([e,l,v,col])=>(
              <button key={v} onClick={()=>onFeedback(idx,v)} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:50,border:`1.5px solid ${col}30`,background:`${col}10`,color:col,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer" }}>{e} {l}</button>
            ))}
          </div>
        ) : (
          <div className="fade-in" style={{ background:fb==="skip"?C.cream:C.sageLight,borderRadius:12,padding:"10px 14px",fontSize:13,color:fb==="skip"?C.muted:C.sage,fontWeight:500 }}>
            {fb==="try"&&"✨ Great choice — you've got this, Sara!"}
            {fb==="made"&&"🎉 That's a real win today!"}
            {fb==="skip"&&"No worries — swipe to the next one 😊"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Meals Tab ─────────────────────────────────────────────
function MealsTab({ prefs }) {
  const [focus, setFocus]       = useState("high-protein");
  const [mealTime, setMealTime] = useState("breakfast");
  const [meals, setMeals]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [feedbacks, setFeedbacks] = useState({});
  const [loadKey, setLoadKey]   = useState(0);
  const focusObj = FOCUS_OPTIONS.find(f=>f.id===focus);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setMeals([]); setFeedbacks({});
      const prefsLine = prefs?.trim()
        ? `\n\nIMPORTANT — Sara's personal preferences (always respect these):\n${prefs}`
        : "";
      try {
        const workerUrl = import.meta.env.VITE_WORKER_URL;
        const res = await fetch(workerUrl, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            model:"claude-sonnet-4-20250514", max_tokens:1000,
            messages:[{ role:"user", content:
              `You are a nutrition expert helping a busy Israeli mom of 2 kids under 4 eat healthy.
Generate exactly 4 healthy ${mealTime} ideas with focus on: ${focusObj?.label}.${prefsLine}
Respond ONLY with a raw JSON array (no markdown, no backticks):
[{"name":"Short name","emoji":"one emoji","description":"2 practical sentences for a busy mom.","tags":["tag1","tag2","tag3"]},...]
Tags: High protein, Quick, Easy, Family-friendly, No cook, Meal prep, High fiber, Low carb, etc. Max 3 tags.`
            }]
          })
        });
        if (cancelled) return;
        const data = await res.json();
        const text  = data.content?.[0]?.text||"";
        const clean = text.replace(/```json|```/g,"").trim();
        setMeals(JSON.parse(clean));
      } catch { if (!cancelled) setMeals(FALLBACK[mealTime]||FALLBACK.breakfast); }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [focus, mealTime, loadKey, prefs]);

  return (
    <div style={{ paddingTop:8 }}>
      <div style={{ fontFamily:"'Playfair Display',serif",fontSize:22,color:C.text,marginBottom:4 }}>What to eat today 🍽️</div>
      <p style={{ fontSize:13,color:C.muted,marginBottom:20 }}>Pick a focus and a meal — swipe through the options.</p>

      <SectionLabel>Focus on</SectionLabel>
      <div style={{ display:"flex",gap:8,overflowX:"auto",paddingBottom:6,marginBottom:20 }}>
        {FOCUS_OPTIONS.map(f=><Chip key={f.id} label={f.label} emoji={f.emoji} color={f.color} selected={focus===f.id} onClick={()=>setFocus(f.id)} />)}
      </div>

      <SectionLabel>Meal time</SectionLabel>
      <div style={{ display:"flex",gap:8,marginBottom:20 }}>
        {MEAL_TIMES.map(mt=>(
          <button key={mt.id} onClick={()=>setMealTime(mt.id)} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 4px",borderRadius:16,background:mealTime===mt.id?C.terra:C.card,border:`1.5px solid ${mealTime===mt.id?C.terra:C.border}`,color:mealTime===mt.id?"#fff":C.muted,cursor:"pointer",transition:"all 0.2s",fontFamily:"'DM Sans',sans-serif" }}>
            <span style={{ fontSize:18 }}>{mt.emoji}</span>
            <span style={{ fontSize:10,fontWeight:500 }}>{mt.label}</span>
          </button>
        ))}
      </div>

      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16 }}>
        <div style={{ padding:"5px 12px",borderRadius:50,background:focusObj?.color+"18",color:focusObj?.color,fontSize:12,fontWeight:500,border:`1px solid ${focusObj?.color}30` }}>
          {focusObj?.emoji} {focusObj?.label} · {MEAL_TIMES.find(m=>m.id===mealTime)?.emoji} {MEAL_TIMES.find(m=>m.id===mealTime)?.label}
        </div>
        {prefs?.trim() && (
          <div style={{ padding:"4px 10px",borderRadius:50,background:C.purpleLight,color:C.purple,fontSize:11,fontWeight:500,border:`1px solid ${C.purple}30` }}>
            ✦ Your prefs applied
          </div>
        )}
        <button onClick={()=>setLoadKey(k=>k+1)} style={{ marginLeft:"auto",background:"none",border:`1px solid ${C.border}`,cursor:"pointer",fontSize:13,color:C.muted,padding:"4px 10px",borderRadius:8 }}>↻ New</button>
      </div>

      {loading ? <><SkeletonCard height={44}/><SkeletonCard height={230}/></> : meals.length>0 &&
        <MealSwipeStack meals={meals} feedbacks={feedbacks} onFeedback={(i,v)=>setFeedbacks(f=>({...f,[i]:v}))} />
      }
    </div>
  );
}

// ── Preferences Tab ───────────────────────────────────────
function PrefsTab({ prefs, onSave }) {
  const [draft, setDraft]         = useState(prefs);
  const [saved, setSaved]         = useState(false);
  const [activeTags, setActiveTags] = useState([]);
  const textareaRef = useRef(null);

  const toggleTag = (label) => {
    const next = activeTags.includes(label)
      ? activeTags.filter(t=>t!==label)
      : [...activeTags, label];
    setActiveTags(next);
    if (!activeTags.includes(label)) {
      const addition = label.toLowerCase();
      setDraft(d => d ? `${d.trim()}, ${addition}` : addition);
    }
  };

  const handleSave = () => {
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    try { localStorage.setItem("sara_prefs", draft); } catch {}
  };

  const handleClear = () => {
    setDraft(""); setActiveTags([]); onSave("");
    try { localStorage.removeItem("sara_prefs"); } catch {}
  };

  return (
    <div style={{ paddingTop:8 }}>
      <div style={{ fontFamily:"'Playfair Display',serif",fontSize:22,color:C.text,marginBottom:4 }}>Your preferences 🌿</div>
      <p style={{ fontSize:13,color:C.muted,marginBottom:24,lineHeight:1.6 }}>
        Tell the app about yourself in your own words — allergies, things you love or hate, your lifestyle. Every suggestion will be adjusted for you.
      </p>

      {/* Natural language input */}
      <SectionLabel>Tell us about you</SectionLabel>
      <div style={{ background:C.card,borderRadius:20,padding:16,marginBottom:6,boxShadow:"0 2px 12px rgba(0,0,0,0.05)",border:`1.5px solid ${draft?.trim() ? C.purple+"60" : C.border}`,transition:"border-color 0.2s" }}>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={e => { setDraft(e.target.value); setSaved(false); }}
          placeholder={`For example:\n"I don't eat meat, I hate mushrooms, I love Israeli food, I'm always short on time in the mornings, and I'm trying to eat more protein."`}
          rows={5}
          style={{ width:"100%",border:"none",background:"transparent",fontFamily:"'DM Sans',sans-serif",fontSize:13.5,color:C.text,lineHeight:1.7,resize:"none" }}
        />
      </div>
      <p style={{ fontSize:11,color:C.muted,marginBottom:20 }}>Write freely — the AI understands natural language.</p>

      {/* Quick-pick tags */}
      <SectionLabel>Or tap to add quickly</SectionLabel>
      {PREF_TAGS.map(group => (
        <div key={group.group} style={{ marginBottom:16 }}>
          <div style={{ fontSize:12,color:C.muted,fontWeight:500,marginBottom:8 }}>{group.group}</div>
          <div style={{ display:"flex",gap:7,flexWrap:"wrap" }}>
            {group.tags.map(t => (
              <Chip key={t.l} label={t.l} emoji={t.e} small
                selected={activeTags.includes(t.l)}
                color={C.purple}
                onClick={() => toggleTag(t.l)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Save button */}
      <button onClick={handleSave} style={{
        width:"100%",padding:14,marginTop:8,marginBottom:12,
        background: saved ? C.sage : C.purple,
        color:"#fff",border:"none",borderRadius:16,
        fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:500,
        cursor:"pointer",transition:"background 0.3s",
        boxShadow:`0 4px 16px ${saved?C.sage:C.purple}40`,
      }}>
        {saved ? "✓ Saved — suggestions updated!" : "Save preferences"}
      </button>

      {draft?.trim() && (
        <button onClick={handleClear} style={{ width:"100%",padding:10,background:"none",border:`1px solid ${C.border}`,borderRadius:12,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.muted,cursor:"pointer" }}>
          Clear all preferences
        </button>
      )}

      {/* Active preview */}
      {draft?.trim() && (
        <div style={{ marginTop:20,background:C.purpleLight,borderRadius:16,padding:16,border:`1px solid ${C.purple}20` }}>
          <div style={{ fontSize:11,fontWeight:500,letterSpacing:1,color:C.purple,textTransform:"uppercase",marginBottom:8 }}>Currently active</div>
          <p style={{ fontSize:13,color:C.text,lineHeight:1.6,fontStyle:"italic" }}>"{draft}"</p>
        </div>
      )}
    </div>
  );
}

// ── Today Tab ─────────────────────────────────────────────
function TipCard({ tip }) {
  return (
    <div className="slide-up" style={{ background:C.cream,borderRadius:20,padding:20,marginBottom:14,border:`1px solid ${C.border}`,opacity:0,animationDelay:"0.05s" }}>
      <SectionLabel>Tip of the day</SectionLabel>
      <p style={{ fontSize:14,color:C.text,lineHeight:1.7,fontStyle:"italic" }}>"{tip}"</p>
    </div>
  );
}

function WorkoutCard() {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div className="slide-up" style={{ background:C.card,borderRadius:24,padding:22,marginBottom:14,boxShadow:"0 4px 24px rgba(0,0,0,0.06)",borderLeft:`4px solid ${C.sage}`,opacity:0,animationDelay:"0.1s" }}>
      <span style={{ fontSize:11,fontWeight:500,letterSpacing:1.2,color:C.sage,textTransform:"uppercase" }}>Workout suggestion</span>
      <div style={{ fontFamily:"'Playfair Display',serif",fontSize:19,color:C.text,marginTop:4,marginBottom:8 }}>Full Body Home Circuit</div>
      <p style={{ fontSize:13.5,color:C.muted,marginBottom:14 }}>No equipment. Designed for nap time — short, effective bursts.</p>
      <div style={{ display:"flex",gap:8,marginBottom:14 }}>
        {[["⏱","25 min"],["📍","Home"],["🔥","Beginner"]].map(([e,v])=>(
          <div key={v} style={{ background:C.sageLight,borderRadius:10,padding:"5px 10px",fontSize:12,color:C.sage,fontWeight:500 }}>{e} {v}</div>
        ))}
      </div>
      {!confirmed
        ? <button onClick={()=>setConfirmed(true)} style={{ width:"100%",padding:11,background:C.sage,color:"#fff",border:"none",borderRadius:14,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,cursor:"pointer" }}>✓ Block this time</button>
        : <div className="fade-in" style={{ background:C.sageLight,borderRadius:12,padding:12,textAlign:"center",fontSize:13,color:C.sage,fontWeight:500 }}>📅 Added to your schedule! You've got this.</div>
      }
    </div>
  );
}

function HydrationCard() {
  const [glasses, setGlasses] = useState(0);
  const target = 8;
  return (
    <div className="slide-up" style={{ background:C.card,borderRadius:24,padding:22,marginBottom:14,boxShadow:"0 4px 24px rgba(0,0,0,0.06)",borderLeft:`4px solid ${C.water}`,opacity:0,animationDelay:"0.15s" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
        <div>
          <span style={{ fontSize:11,fontWeight:500,letterSpacing:1.2,color:C.water,textTransform:"uppercase" }}>Hydration</span>
          <div style={{ fontFamily:"'Playfair Display',serif",fontSize:19,color:C.text,marginTop:4 }}>{glasses}/{target} glasses</div>
        </div>
        <span style={{ fontSize:26 }}>💧</span>
      </div>
      <div style={{ display:"flex",gap:5,marginBottom:14 }}>
        {Array.from({length:target}).map((_,i)=>(
          <div key={i} onClick={()=>setGlasses(i<glasses?i:i+1)} style={{ flex:1,height:8,borderRadius:4,background:i<glasses?C.water:C.border,cursor:"pointer",transition:"background 0.3s" }} />
        ))}
      </div>
      <button onClick={()=>setGlasses(g=>Math.min(g+1,target))} style={{ width:"100%",padding:10,background:glasses>=target?C.sageLight:C.waterLight,color:glasses>=target?C.sage:C.water,border:`1.5px solid ${glasses>=target?C.sage:C.water}`,borderRadius:12,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,cursor:"pointer" }}>
        {glasses>=target?"🎉 Goal reached today!":"+ Log a glass"}
      </button>
    </div>
  );
}

// ── Progress Tab ───────────────────────────────────────────
function WeeklyWinCard({ wins }) {
  const ds = ["M","T","W","T","F","S","S"];
  return (
    <div style={{ background:`linear-gradient(135deg,${C.terra},#B5604A)`,borderRadius:24,padding:24,marginBottom:16,boxShadow:"0 8px 32px rgba(196,120,90,0.25)" }}>
      <span style={{ fontSize:11,fontWeight:500,letterSpacing:1.2,color:"rgba(255,255,255,0.7)",textTransform:"uppercase" }}>This week</span>
      <div style={{ fontFamily:"'Playfair Display',serif",fontSize:22,color:"#fff",marginTop:4,marginBottom:20 }}>{wins.total} wins so far ✨</div>
      <div style={{ display:"flex",gap:6,marginBottom:20 }}>
        {ds.map((d,i)=>(
          <div key={i} style={{ flex:1,textAlign:"center" }}>
            <div style={{ width:"100%",aspectRatio:"1",borderRadius:"50%",background:wins.days[i]?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:wins.days[i]?12:0,marginBottom:4 }}>
              {wins.days[i]?"✓":""}
            </div>
            <div style={{ fontSize:10,color:"rgba(255,255,255,0.6)" }}>{d}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex",gap:12 }}>
        {[["🍽️",wins.meals,"meals"],["💪",wins.workouts,"workouts"],["💧",wins.hydration,"hydration"]].map(([e,v,l])=>(
          <div key={l} style={{ flex:1,background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"10px 8px",textAlign:"center" }}>
            <div style={{ fontSize:18 }}>{e}</div>
            <div style={{ fontSize:18,fontWeight:600,color:"#fff" }}>{v}</div>
            <div style={{ fontSize:10,color:"rgba(255,255,255,0.7)" }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────
export default function App() {
  const [tab, setTab]   = useState("today");
  const [prefs, setPrefs] = useState("");
  const [tip]           = useState(()=>TIPS[Math.floor(Math.random()*TIPS.length)]);
  const now = new Date();
  const dateStr = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
  const wins = { total:9, days:[true,true,false,true,true,false,false], meals:5, workouts:2, hydration:2 };

  // Load saved prefs on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sara_prefs");
      if (saved) setPrefs(saved);
    } catch {}
  }, []);

  const navItems = [
    { id:"today",    emoji:"☀️",  label:"Today"   },
    { id:"meals",    emoji:"🍽️", label:"Meals"   },
    { id:"progress", emoji:"✨",  label:"Progress" },
    { id:"prefs",    emoji:"🌿",  label:"Me"      },
  ];

  return (
    <>
      <style>{fonts}</style>
      <div style={{ minHeight:"100vh",background:C.bg,display:"flex",justifyContent:"center",paddingBottom:92 }}>
        <div style={{ width:"100%",maxWidth:390 }}>

          {/* Header */}
          <div style={{ padding:"52px 24px 16px",background:`linear-gradient(180deg,${C.cream} 0%,transparent 100%)` }}>
            <div style={{ fontSize:12,color:C.muted,letterSpacing:0.5,marginBottom:4 }}>{dateStr}</div>
            <div style={{ fontFamily:"'Playfair Display',serif",fontSize:28,color:C.text,lineHeight:1.2 }}>
              {getGreeting()},<br /><span style={{ color:C.terra }}>Sara</span> 🌿
            </div>
            {prefs?.trim() && (
              <div className="pop-in" style={{ display:"inline-flex",alignItems:"center",gap:5,marginTop:8,padding:"4px 11px",borderRadius:50,background:C.purpleLight,border:`1px solid ${C.purple}30`,fontSize:11,color:C.purple,fontWeight:500 }}>
                ✦ Personalised for you
              </div>
            )}
          </div>

          <div style={{ padding:"0 20px" }}>
            {tab==="today" && (
              <>
                <TipCard tip={tip} />
                <div className="slide-up" onClick={()=>setTab("meals")} style={{ background:C.terraLight,borderRadius:20,padding:18,marginBottom:14,border:`1px dashed ${C.terra}50`,opacity:0,animationDelay:"0.07s",cursor:"pointer" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:11,fontWeight:500,letterSpacing:1.1,color:C.terra,textTransform:"uppercase",marginBottom:4 }}>Meal ideas</div>
                      <div style={{ fontFamily:"'Playfair Display',serif",fontSize:16,color:C.text }}>Browse today's options →</div>
                      <div style={{ fontSize:12,color:C.muted,marginTop:2 }}>Breakfast · Lunch · Dinner · Snack</div>
                    </div>
                    <span style={{ fontSize:30 }}>🍽️</span>
                  </div>
                </div>
                <WorkoutCard />
                <HydrationCard />
              </>
            )}
            {tab==="meals"    && <MealsTab prefs={prefs} />}
            {tab==="progress" && (
              <div className="fade-in" style={{ paddingTop:8 }}>
                <div style={{ fontFamily:"'Playfair Display',serif",fontSize:22,color:C.text,marginBottom:20 }}>Your wins, Sara 🏆</div>
                <WeeklyWinCard wins={wins} />
                <div style={{ background:C.card,borderRadius:20,padding:20,boxShadow:"0 4px 24px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontFamily:"'Playfair Display',serif",fontSize:16,color:C.text,marginBottom:16 }}>What's working</div>
                  {[["🍽️","Meal consistency","You've been eating breakfast every day this week — huge!"],["💪","Showing up","Even on tough days, you open the app. That matters."],["💧","Hydration","Getting better each week. Keep those glasses coming."]].map(([e,t,d])=>(
                    <div key={t} style={{ display:"flex",gap:12,marginBottom:16 }}>
                      <div style={{ width:36,height:36,borderRadius:"50%",background:C.sageLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{e}</div>
                      <div>
                        <div style={{ fontSize:13,fontWeight:500,color:C.text,marginBottom:2 }}>{t}</div>
                        <div style={{ fontSize:12,color:C.muted,lineHeight:1.5 }}>{d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab==="prefs" && <PrefsTab prefs={prefs} onSave={setPrefs} />}
          </div>
        </div>

        {/* Bottom Nav */}
        <div style={{ position:"fixed",bottom:0,left:0,right:0,background:C.card,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"center",padding:"10px 0 26px",boxShadow:"0 -4px 24px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex",maxWidth:390,width:"100%" }}>
            {navItems.map(item=>(
              <button key={item.id} onClick={()=>setTab(item.id)} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"6px 0",position:"relative" }}>
                <span style={{ fontSize:20 }}>{item.emoji}</span>
                <span style={{ fontSize:11,fontWeight:500,color:tab===item.id?C.terra:C.muted,letterSpacing:0.3 }}>{item.label}</span>
                {tab===item.id && <div style={{ width:18,height:2.5,background:C.terra,borderRadius:2,marginTop:1 }} />}
                {item.id==="prefs" && prefs?.trim() && (
                  <div style={{ position:"absolute",top:4,right:"22%",width:7,height:7,borderRadius:"50%",background:C.purple }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

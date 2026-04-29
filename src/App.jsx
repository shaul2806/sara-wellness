import { useState, useEffect, useRef } from "react";

const C = {
  bg:"#FAF7F2", card:"#FFFFFF",
  sage:"#7C9A7E", sageLight:"#EBF2EB",
  terra:"#C4785A", terraLight:"#FAF0EB",
  cream:"#F5EFE6", text:"#2C2C2C",
  muted:"#9A8F87", border:"#EDE8E1",
  water:"#7BA7BC", waterLight:"#EBF4F8",
  purple:"#9B7EC8", purpleLight:"#F3EEF9",
  heart:"#E8637A", heartLight:"#FDEEF1",
};

const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${C.bg};font-family:'DM Sans',sans-serif;}
  @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes slideLeft{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
  @keyframes slideRight{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}
  @keyframes popIn{0%{transform:scale(0.8);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
  @keyframes heartPop{0%{transform:scale(1)}50%{transform:scale(1.4)}100%{transform:scale(1)}}
  .slide-up{animation:slideUp 0.45s ease forwards;}
  .fade-in{animation:fadeIn 0.35s ease forwards;}
  .slide-left{animation:slideLeft 0.3s ease forwards;}
  .slide-right{animation:slideRight 0.3s ease forwards;}
  .pop-in{animation:popIn 0.35s ease forwards;}
  .heart-pop{animation:heartPop 0.3s ease;}
  ::-webkit-scrollbar{display:none;}
  textarea:focus{outline:none;}
`;

const DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const getGreeting=()=>{const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening";};

// ── Storage helpers ───────────────────────────────────────
const ls = {
  get:(k,def)=>{ try{const v=localStorage.getItem(k);return v?JSON.parse(v):def;}catch{return def;} },
  set:(k,v)=>{ try{localStorage.setItem(k,JSON.stringify(v));}catch{} },
};

// ── Workout library ───────────────────────────────────────
const WORKOUTS = [
  {
    id:"fullbody", name:"Full Body Circuit", emoji:"🔥", duration:"25 min", location:"Home", level:"Beginner",
    description:"6 exercises targeting every muscle group. No equipment needed — perfect for nap time.",
    tags:["No equipment","Home","Beginner"],
    exercises:[
      {name:"Squats",          reps:"3 × 12", tip:"Feet shoulder-width, chest up",          emoji:"🦵"},
      {name:"Push-ups",        reps:"3 × 8",  tip:"On knees is totally fine",               emoji:"💪"},
      {name:"Glute Bridges",   reps:"3 × 15", tip:"Squeeze at the top for 1 sec",           emoji:"🍑"},
      {name:"Standing Crunches",reps:"3 × 20",tip:"Elbow to opposite knee",                 emoji:"🔥"},
      {name:"Reverse Lunges",  reps:"3 × 10", tip:"Step back, both knees at 90°",           emoji:"🦶"},
      {name:"Superman Hold",   reps:"3 × 10s",tip:"Lie face down, lift arms and legs",      emoji:"⭐"},
    ],
  },
  {
    id:"yoga", name:"Yoga Flow", emoji:"🧘", duration:"20 min", location:"Home", level:"All levels",
    description:"A calming flow to stretch, breathe, and reset. Exactly what a busy mom needs.",
    tags:["No equipment","Home","Calming"],
    exercises:[
      {name:"Child's Pose",      reps:"Hold 60s", tip:"Arms extended, breathe deeply",        emoji:"🌿"},
      {name:"Cat-Cow",           reps:"10 rounds", tip:"Slow and controlled with each breath", emoji:"🐱"},
      {name:"Downward Dog",      reps:"Hold 45s", tip:"Pedal heels to stretch calves",        emoji:"⬇️"},
      {name:"Warrior I",         reps:"30s each side",tip:"Front knee over ankle",            emoji:"⚔️"},
      {name:"Bridge Pose",       reps:"Hold 30s × 3",tip:"Engage glutes and core",            emoji:"🌉"},
      {name:"Seated Forward Fold",reps:"Hold 60s",tip:"Reach for your feet, don't strain",   emoji:"🧘"},
    ],
  },
  {
    id:"run", name:"Run / Walk", emoji:"🏃", duration:"20–30 min", location:"Outside", level:"All levels",
    description:"Fresh air and movement. Walk, jog, or mix — just get outside and go.",
    tags:["Outside","Cardio","Fresh air"],
    exercises:[
      {name:"Warm-up walk",   reps:"3 min",     tip:"Easy pace, arms loose",                 emoji:"🚶"},
      {name:"Jog",            reps:"5 min",      tip:"Comfortable pace — you should still talk",emoji:"🏃"},
      {name:"Walk recovery",  reps:"2 min",      tip:"Catch your breath",                     emoji:"🚶"},
      {name:"Jog",            reps:"5 min",      tip:"Push a little harder than before",      emoji:"🏃"},
      {name:"Walk recovery",  reps:"2 min",      tip:"Shake out your arms",                   emoji:"🚶"},
      {name:"Cool-down walk", reps:"3 min",      tip:"Slow it right down, deep breaths",      emoji:"🌬️"},
    ],
  },
  {
    id:"pilates", name:"Pilates Core", emoji:"✨", duration:"20 min", location:"Home", level:"Beginner",
    description:"Core-focused pilates that also strengthens your back and hips. Great for posture.",
    tags:["No equipment","Home","Core"],
    exercises:[
      {name:"The Hundred",    reps:"100 pumps",  tip:"Legs at 45°, chin to chest",            emoji:"💯"},
      {name:"Single Leg Stretch",reps:"3 × 10",  tip:"Alternate legs, keep lower back flat",  emoji:"🦵"},
      {name:"Rolling Like a Ball",reps:"10 reps",tip:"Massage the spine gently",              emoji:"⚽"},
      {name:"Side-lying Leg Lifts",reps:"3 × 12 each",tip:"Keep hips stacked",               emoji:"📐"},
      {name:"Plank",          reps:"3 × 20s",    tip:"Straight line from head to heels",      emoji:"🪵"},
      {name:"Swan Dive",      reps:"3 × 10",     tip:"Lift chest, engage back muscles",       emoji:"🦢"},
    ],
  },
  {
    id:"hiit", name:"HIIT Blast", emoji:"⚡", duration:"15 min", location:"Home", level:"Intermediate",
    description:"Short, intense bursts that torch calories fast. When you only have 15 minutes.",
    tags:["No equipment","Home","Intense"],
    exercises:[
      {name:"Jumping Jacks",  reps:"40s on / 20s off",tip:"Land softly",                     emoji:"⭐"},
      {name:"Burpees",        reps:"40s on / 20s off",tip:"Step instead of jump if needed",  emoji:"🔥"},
      {name:"High Knees",     reps:"40s on / 20s off",tip:"Drive knees up to hip height",    emoji:"🏃"},
      {name:"Mountain Climbers",reps:"40s on / 20s off",tip:"Keep hips level",               emoji:"⛰️"},
      {name:"Jump Squats",    reps:"40s on / 20s off",tip:"Land with soft knees",            emoji:"💥"},
      {name:"Rest",           reps:"60s",            tip:"Breathe. You earned it.",           emoji:"😮‍💨"},
    ],
  },
  {
    id:"stretch", name:"Recovery Stretch", emoji:"🌸", duration:"15 min", location:"Home", level:"Easy",
    description:"When your body needs a gentle day. Stretching is still training.",
    tags:["No equipment","Home","Easy"],
    exercises:[
      {name:"Neck Rolls",      reps:"5 each direction",tip:"Slow and gentle",                emoji:"🔄"},
      {name:"Shoulder Stretch",reps:"Hold 30s each",  tip:"Cross arm across chest",          emoji:"🙆"},
      {name:"Hip Flexor Lunge",reps:"Hold 45s each",  tip:"Front knee over ankle",           emoji:"🦵"},
      {name:"Hamstring Stretch",reps:"Hold 45s each", tip:"Hinge at hips, soft knees",       emoji:"🧘"},
      {name:"Pigeon Pose",     reps:"Hold 60s each",  tip:"Use a pillow under hip if needed",emoji:"🕊️"},
      {name:"Spinal Twist",    reps:"Hold 30s each",  tip:"Look over your back shoulder",    emoji:"🌀"},
    ],
  },
];

// ── Static data ───────────────────────────────────────────
const FOCUS_OPTIONS = [
  {id:"high-protein",  label:"High Protein",     emoji:"💪",color:"#C4785A"},
  {id:"veggies",       label:"More Veggies",      emoji:"🥦",color:"#7C9A7E"},
  {id:"high-fiber",    label:"High Fiber",        emoji:"🌾",color:"#A0845C"},
  {id:"low-carb",      label:"Low Carb",          emoji:"🥗",color:"#7BA7BC"},
  {id:"quick",         label:"Quick & Easy",      emoji:"⚡",color:"#C4A45A"},
  {id:"family",        label:"Family-Friendly",   emoji:"👨‍👩‍👧",color:"#B07CC4"},
  {id:"mediterranean", label:"Mediterranean",     emoji:"🫒",color:"#7C9A7E"},
  {id:"anti-inflam",   label:"Anti-Inflammatory", emoji:"🫐",color:"#7BA7BC"},
  {id:"energy",        label:"Energy Boost",      emoji:"✨",color:"#C4785A"},
  {id:"gut-health",    label:"Gut Health",        emoji:"🌿",color:"#7C9A7E"},
];
const MEAL_TIMES=[
  {id:"breakfast",label:"Breakfast",emoji:"🌅"},
  {id:"lunch",    label:"Lunch",    emoji:"☀️"},
  {id:"dinner",   label:"Dinner",   emoji:"🌙"},
  {id:"snack",    label:"Snack",    emoji:"🍎"},
];
const PREF_TAGS=[
  {group:"Diet",       tags:[{l:"Vegetarian",e:"🌱"},{l:"Vegan",e:"🌿"},{l:"Gluten-free",e:"🌾"},{l:"Dairy-free",e:"🥛"},{l:"Kosher",e:"✡️"},{l:"No pork",e:"🐷"}]},
  {group:"Allergies",  tags:[{l:"No nuts",e:"🥜"},{l:"No shellfish",e:"🦐"},{l:"No eggs",e:"🥚"},{l:"No soy",e:"🫘"}]},
  {group:"Preferences",tags:[{l:"I love spicy",e:"🌶️"},{l:"Kid-friendly",e:"👶"},{l:"Israeli cuisine",e:"🇮🇱"},{l:"Mediterranean",e:"🫒"},{l:"Batch cooking",e:"🍲"},{l:"No cooking",e:"🥗"}]},
];
const TIPS=[
  "Drink a full glass of water before making the kids' lunch. You'll remember yours too.",
  "A 10-minute walk counts. Movement is movement, always.",
  "Eat sitting down today — even once. It changes how satisfied you feel.",
  "Protein at every meal keeps you fuller, longer. Think eggs, yogurt, legumes.",
  "Rest is part of training. A tired mom who slept is stronger than one who didn't.",
  "Batch cook one thing on Sunday. Even just boiling eggs changes your whole week.",
];
const FALLBACK={
  breakfast:[
    {name:"Greek Yogurt Power Bowl",emoji:"🫙",description:"Full-fat Greek yogurt with berries, honey and granola. Ready in 2 minutes.",tags:["High protein","5 min","No cook"]},
    {name:"Avocado & Egg Toast",emoji:"🥑",description:"Two eggs any style on whole grain toast with sliced avocado. Balanced and filling.",tags:["Healthy fats","10 min","Easy"]},
    {name:"Overnight Oats",emoji:"🥣",description:"Prep the night before — oats, chia, almond milk, banana. Grab and go.",tags:["High fiber","Prep ahead","Kid-friendly"]},
    {name:"Cottage Cheese & Fruit",emoji:"🍓",description:"Creamy cottage cheese with seasonal fruit and honey. Protein-packed, zero cooking.",tags:["High protein","2 min","No cook"]},
  ],
  lunch:[
    {name:"Tuna & Veggie Wrap",emoji:"🌯",description:"Canned tuna, cucumber, tomato, hummus in a whole wheat wrap. Under 5 minutes.",tags:["High protein","5 min","No cook"]},
    {name:"Lentil Soup",emoji:"🍲",description:"A big pot lasts the week and reheats beautifully. Protein, fiber, iron.",tags:["High fiber","Meal prep","Family-friendly"]},
    {name:"Quinoa Salad Bowl",emoji:"🥗",description:"Quinoa with roasted veggies, feta, lemon dressing. Great batch-cooked on Sunday.",tags:["Complete protein","Meal prep","Filling"]},
    {name:"Egg Salad on Rye",emoji:"🥚",description:"Boiled eggs mashed with Greek yogurt and mustard on rye. Fast and protein-rich.",tags:["High protein","10 min","Easy"]},
  ],
  dinner:[
    {name:"One-Pan Shakshuka",emoji:"🍳",description:"Eggs poached in spiced tomato sauce. The whole family eats it — make a big pan.",tags:["High protein","20 min","Family-friendly"]},
    {name:"Salmon with Roasted Veg",emoji:"🐟",description:"Sheet pan salmon with sweet potatoes and broccoli. Minimal cleanup.",tags:["Omega-3","30 min","Anti-inflammatory"]},
    {name:"Chicken Stir Fry",emoji:"🍗",description:"Chicken strips with whatever veg you have, over brown rice or quinoa.",tags:["High protein","20 min","Flexible"]},
    {name:"Stuffed Bell Peppers",emoji:"🫑",description:"Bell peppers filled with turkey, tomatoes, and rice. Kids love picking their color.",tags:["High protein","35 min","Family-friendly"]},
  ],
  snack:[
    {name:"Apple & Almond Butter",emoji:"🍎",description:"Apple slices with almond butter. Fiber and healthy fats — no afternoon crash.",tags:["Fiber","2 min","No cook"]},
    {name:"Hummus & Veggie Sticks",emoji:"🥕",description:"Carrot, cucumber, celery dipped in hummus. Crunchy and satisfying.",tags:["Fiber","5 min","Family-friendly"]},
    {name:"Energy Date Balls",emoji:"🟤",description:"Blend dates, oats, peanut butter. Roll into balls, refrigerate. Eat all week.",tags:["Energy","Meal prep","No bake"]},
    {name:"Hard Boiled Eggs + Tomatoes",emoji:"🥚",description:"Prep eggs on Sunday. Grab 2 + a handful of tomatoes.",tags:["High protein","2 min","Meal prep"]},
  ],
};

// ── Shared UI ─────────────────────────────────────────────
function SkeletonCard({height=200}){
  return <div style={{background:`linear-gradient(90deg,${C.cream} 25%,#f0e8de 50%,${C.cream} 75%)`,backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite",borderRadius:20,height,marginBottom:12}}/>;
}
function SectionLabel({children,color}){
  return <div style={{fontSize:11,fontWeight:500,letterSpacing:1.1,color:color||C.muted,textTransform:"uppercase",marginBottom:10}}>{children}</div>;
}
function Chip({label,emoji,selected,color,onClick,small}){
  return(
    <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:5,padding:small?"5px 11px":"7px 14px",borderRadius:50,whiteSpace:"nowrap",border:`1.5px solid ${selected?color:C.border}`,background:selected?color+"1A":C.card,color:selected?color:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:small?11:12,fontWeight:500,cursor:"pointer",transition:"all 0.2s"}}>
      {emoji&&<span>{emoji}</span>}{label}
    </button>
  );
}

// ── Progress Strip ────────────────────────────────────────
function ProgressStrip({wins,onNavigate}){
  const ds=["M","T","W","T","F","S","S"];
  const streak=wins.days.reduce((acc,v,i,arr)=>{if(!v)return acc;let s=0;for(let j=i;j>=0&&arr[j];j--)s++;return Math.max(acc,s);},0);
  return(
    <div className="slide-up" onClick={onNavigate} style={{background:`linear-gradient(135deg,${C.terra},#B5604A)`,borderRadius:20,padding:18,marginBottom:14,cursor:"pointer",opacity:0,animationDelay:"0.02s",boxShadow:"0 6px 24px rgba(196,120,90,0.2)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div>
          <div style={{fontSize:11,fontWeight:500,letterSpacing:1.1,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",marginBottom:4}}>This week</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#fff"}}>{wins.total} wins ✨ <span style={{fontSize:14,opacity:0.8}}>🔥 {streak} day streak</span></div>
        </div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginTop:4}}>See more →</div>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {ds.map((d,i)=>(
          <div key={i} style={{flex:1,textAlign:"center"}}>
            <div style={{width:"100%",aspectRatio:"1",borderRadius:"50%",background:wins.days[i]?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:wins.days[i]?10:0,marginBottom:3}}>{wins.days[i]?"✓":""}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.6)"}}>{d}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        {[["🍽️",wins.meals,"meals"],["💪",wins.workouts,"workouts"],["💧",wins.hydration,"hydration"]].map(([e,v,l])=>(
          <div key={l} style={{flex:1,background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
            <div style={{fontSize:14}}>{e}</div>
            <div style={{fontSize:16,fontWeight:600,color:"#fff"}}>{v}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.7)"}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Workout Picker + Session ──────────────────────────────
function WorkoutSection(){
  const [phase,setPhase]=useState("pick"); // pick | session | done
  const [selected,setSelected]=useState(null);
  const [idx,setIdx]=useState(0);
  const [dir,setDir]=useState("left");
  const [current,setCurrent]=useState(0);
  const [timer,setTimer]=useState(0);
  const [running,setRunning]=useState(false);
  const touchStart=useRef(null);
  const intervalRef=useRef(null);

  useEffect(()=>{
    if(running){intervalRef.current=setInterval(()=>setTimer(t=>t+1),1000);}
    else{clearInterval(intervalRef.current);}
    return()=>clearInterval(intervalRef.current);
  },[running]);

  const fmt=(s)=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const go=(d)=>{const n=idx+d;if(n<0||n>=WORKOUTS.length)return;setDir(d>0?"left":"right");setIdx(n);};
  const onTouchStart=(e)=>{touchStart.current=e.touches[0].clientX;};
  const onTouchEnd=(e)=>{if(!touchStart.current)return;const dx=touchStart.current-e.changedTouches[0].clientX;if(Math.abs(dx)>40)go(dx>0?1:-1);touchStart.current=null;};

  if(phase==="pick"){
    const w=WORKOUTS[idx];
    return(
      <div className="slide-up" style={{background:C.card,borderRadius:24,padding:22,marginBottom:14,boxShadow:"0 4px 24px rgba(0,0,0,0.06)",borderLeft:`4px solid ${C.sage}`,opacity:0,animationDelay:"0.1s"}}>
        <span style={{fontSize:11,fontWeight:500,letterSpacing:1.2,color:C.sage,textTransform:"uppercase"}}>Workout suggestion</span>
        <p style={{fontSize:13,color:C.muted,marginTop:4,marginBottom:14}}>Swipe to pick your style today 👇</p>

        {/* Nav */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <span style={{fontSize:12,color:C.muted}}>Option <b style={{color:C.sage}}>{idx+1}</b> of {WORKOUTS.length}</span>
          <div style={{display:"flex",gap:8}}>
            {[[-1,"‹"],[1,"›"]].map(([d,a])=>{const off=d<0?idx===0:idx===WORKOUTS.length-1;return(
              <button key={d} onClick={()=>go(d)} disabled={off} style={{width:32,height:32,borderRadius:"50%",border:`1.5px solid ${off?C.border:C.sage+"50"}`,background:off?C.cream:C.sageLight,color:off?C.border:C.sage,fontSize:16,cursor:off?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:600}}>{a}</button>
            );})}
          </div>
        </div>

        {/* Dots */}
        <div style={{display:"flex",gap:5,marginBottom:14}}>
          {WORKOUTS.map((_,i)=><div key={i} onClick={()=>{setDir(i>idx?"left":"right");setIdx(i);}} style={{height:4,borderRadius:4,cursor:"pointer",transition:"all 0.3s",flex:i===idx?2:1,background:i===idx?C.sage:C.border}}/>)}
        </div>

        {/* Workout card */}
        <div key={`${idx}-${dir}`} className={dir==="left"?"slide-left":"slide-right"}
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
          style={{background:C.sageLight,borderRadius:20,padding:20,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.text,lineHeight:1.3,flex:1,paddingRight:12}}>{w.name}</div>
            <span style={{fontSize:36}}>{w.emoji}</span>
          </div>
          <p style={{fontSize:13.5,color:C.muted,lineHeight:1.6,marginBottom:12}}>{w.description}</p>
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
            {[["⏱",w.duration],["📍",w.location],["🔥",w.level]].map(([e,v])=>(
              <div key={v} style={{background:"rgba(124,154,126,0.15)",borderRadius:10,padding:"5px 10px",fontSize:12,color:C.sage,fontWeight:500}}>{e} {v}</div>
            ))}
          </div>
          {/* Exercise preview */}
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12}}>
            <div style={{fontSize:11,fontWeight:500,color:C.sage,marginBottom:8,letterSpacing:0.5}}>WHAT YOU'LL DO</div>
            {w.exercises.map(ex=>(
              <div key={ex.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <span style={{fontSize:13,color:C.text}}>{ex.emoji} {ex.name}</span>
                <span style={{fontSize:12,color:C.sage,fontWeight:500}}>{ex.reps}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={()=>{setSelected(w);setPhase("session");setCurrent(0);setTimer(0);setRunning(true);}} style={{width:"100%",padding:13,background:C.sage,color:"#fff",border:"none",borderRadius:14,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,cursor:"pointer",boxShadow:`0 4px 12px ${C.sage}40`}}>
          ▶ Start {w.name}
        </button>
      </div>
    );
  }

  if(phase==="session"&&selected){
    const ex=selected.exercises[current];
    const isLast=current===selected.exercises.length-1;
    return(
      <div className="fade-in" style={{background:C.card,borderRadius:24,padding:22,marginBottom:14,boxShadow:"0 4px 24px rgba(0,0,0,0.06)",border:`2px solid ${C.sage}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <span style={{fontSize:11,fontWeight:500,letterSpacing:1.2,color:C.sage,textTransform:"uppercase"}}>{selected.emoji} {selected.name}</span>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>Exercise {current+1} of {selected.exercises.length}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,fontWeight:600,color:C.terra,fontVariantNumeric:"tabular-nums"}}>{fmt(timer)}</span>
            <button onClick={()=>setRunning(r=>!r)} style={{background:running?C.terraLight:C.sageLight,border:"none",borderRadius:8,padding:"4px 10px",fontSize:12,color:running?C.terra:C.sage,cursor:"pointer",fontWeight:500}}>{running?"⏸":"▶"}</button>
          </div>
        </div>
        <div style={{display:"flex",gap:5,marginBottom:20}}>
          {selected.exercises.map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:4,background:i<=current?C.sage:C.border,transition:"all 0.4s"}}/>)}
        </div>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:52,marginBottom:8}}>{ex.emoji}</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,color:C.text,marginBottom:6}}>{ex.name}</div>
          <div style={{fontSize:22,fontWeight:600,color:C.sage,marginBottom:10}}>{ex.reps}</div>
          <div style={{fontSize:13,color:C.muted,background:C.sageLight,borderRadius:12,padding:"8px 16px",display:"inline-block"}}>💡 {ex.tip}</div>
        </div>
        <button onClick={()=>{if(isLast){setPhase("done");setRunning(false);}else{setCurrent(c=>c+1);}}} style={{width:"100%",padding:13,background:isLast?C.terra:C.sage,color:"#fff",border:"none",borderRadius:14,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,cursor:"pointer"}}>
          {isLast?"🎉 Finish workout!":"Next exercise →"}
        </button>
        <button onClick={()=>{setPhase("pick");setRunning(false);setTimer(0);setCurrent(0);}} style={{width:"100%",marginTop:8,padding:9,background:"none",border:`1px solid ${C.border}`,borderRadius:12,fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted,cursor:"pointer"}}>✕ Stop session</button>
      </div>
    );
  }

  if(phase==="done") return(
    <div className="pop-in" style={{background:`linear-gradient(135deg,${C.sage},#5d7d5f)`,borderRadius:24,padding:28,marginBottom:14,textAlign:"center",boxShadow:`0 8px 32px ${C.sage}40`}}>
      <div style={{fontSize:48,marginBottom:12}}>🏆</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:"#fff",marginBottom:8}}>You did it, Sara!</div>
      <div style={{fontSize:14,color:"rgba(255,255,255,0.8)",marginBottom:16}}>{selected?.name} · {fmt(timer)}</div>
      <div style={{background:"rgba(255,255,255,0.15)",borderRadius:14,padding:12,fontSize:13,color:"rgba(255,255,255,0.9)",marginBottom:20}}>Two kids under 4 and you still showed up. That's everything. 💪</div>
      <button onClick={()=>{setPhase("pick");setCurrent(0);setTimer(0);setSelected(null);}} style={{padding:"10px 24px",background:"rgba(255,255,255,0.2)",border:"1.5px solid rgba(255,255,255,0.4)",borderRadius:12,color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer"}}>Pick another workout</button>
    </div>
  );
}

// ── Hydration Card ────────────────────────────────────────
function HydrationCard(){
  const [glasses,setGlasses]=useState(()=>ls.get("sara_water_"+new Date().toDateString(),0));
  const target=8;
  const add=()=>{const n=Math.min(glasses+1,target);setGlasses(n);ls.set("sara_water_"+new Date().toDateString(),n);};
  return(
    <div className="slide-up" style={{background:C.card,borderRadius:24,padding:22,marginBottom:14,boxShadow:"0 4px 24px rgba(0,0,0,0.06)",borderLeft:`4px solid ${C.water}`,opacity:0,animationDelay:"0.15s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <span style={{fontSize:11,fontWeight:500,letterSpacing:1.2,color:C.water,textTransform:"uppercase"}}>Hydration</span>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,color:C.text,marginTop:4}}>{glasses}/{target} glasses</div>
        </div>
        <span style={{fontSize:26}}>💧</span>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:14}}>
        {Array.from({length:target}).map((_,i)=>(
          <div key={i} onClick={()=>setGlasses(i<glasses?i:i+1)} style={{flex:1,height:8,borderRadius:4,background:i<glasses?C.water:C.border,cursor:"pointer",transition:"background 0.3s"}}/>
        ))}
      </div>
      <button onClick={add} style={{width:"100%",padding:10,background:glasses>=target?C.sageLight:C.waterLight,color:glasses>=target?C.sage:C.water,border:`1.5px solid ${glasses>=target?C.sage:C.water}`,borderRadius:12,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,cursor:"pointer"}}>
        {glasses>=target?"🎉 Goal reached today!":"+ Log a glass"}
      </button>
    </div>
  );
}

// ── Meal Card with Heart ──────────────────────────────────
function MealCard({meal,feedback,onFeedback,loved,onHeart}){
  const [heartAnim,setHeartAnim]=useState(false);
  const handleHeart=()=>{
    setHeartAnim(true);
    setTimeout(()=>setHeartAnim(false),300);
    onHeart();
  };
  return(
    <div style={{background:C.card,borderRadius:24,padding:24,boxShadow:"0 4px 24px rgba(0,0,0,0.07)",borderTop:`4px solid ${C.terra}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.text,lineHeight:1.3,flex:1,paddingRight:12}}>{meal.name}</div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <span style={{fontSize:32}}>{meal.emoji}</span>
          <button onClick={handleHeart} className={heartAnim?"heart-pop":""} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,transition:"transform 0.2s"}}>
            {loved?"❤️":"🤍"}
          </button>
        </div>
      </div>
      <p style={{fontSize:13.5,color:C.muted,lineHeight:1.65,marginBottom:14}}>{meal.description}</p>
      {meal.isLoved&&<div style={{fontSize:11,color:C.heart,marginBottom:10,fontWeight:500}}>❤️ One of your favourites</div>}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
        {meal.tags?.map(t=><span key={t} style={{fontSize:11,padding:"4px 10px",background:C.terraLight,color:C.terra,borderRadius:50,fontWeight:500}}>{t}</span>)}
      </div>
      {!feedback?(
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["✅","I'll try it","try",C.sage],["🍽️","Made it!","made",C.terra],["❌","Skip","skip",C.muted]].map(([e,l,v,col])=>(
            <button key={v} onClick={()=>onFeedback(v)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:50,border:`1.5px solid ${col}30`,background:`${col}10`,color:col,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer"}}>{e} {l}</button>
          ))}
        </div>
      ):(
        <div className="fade-in" style={{background:feedback==="skip"?C.cream:C.sageLight,borderRadius:12,padding:"10px 14px",fontSize:13,color:feedback==="skip"?C.muted:C.sage,fontWeight:500}}>
          {feedback==="try"&&"✨ Great choice — you've got this, Sara!"}
          {feedback==="made"&&"🎉 That's a real win today!"}
          {feedback==="skip"&&"Got it — we'll skip this one in future 😊"}
        </div>
      )}
    </div>
  );
}

// ── Meals Tab ─────────────────────────────────────────────
function MealsTab({prefs}){
  const [focus,setFocus]=useState("high-protein");
  const [mealTime,setMealTime]=useState("breakfast");
  const [meals,setMeals]=useState([]);
  const [loading,setLoading]=useState(false);
  const [idx,setIdx]=useState(0);
  const [dir,setDir]=useState("left");
  const [feedbacks,setFeedbacks]=useState({});
  const [loadKey,setLoadKey]=useState(0);
  const [lovedDishes,setLovedDishes]=useState(()=>ls.get("sara_loved",[]));
  const [skippedDishes,setSkippedDishes]=useState(()=>ls.get("sara_skipped",[]));
  const [showLoved,setShowLoved]=useState(false);
  const touchStart=useRef(null);
  const focusObj=FOCUS_OPTIONS.find(f=>f.id===focus);

  const go=(d)=>{const n=idx+d;if(n<0||n>=meals.length)return;setDir(d>0?"left":"right");setIdx(n);};
  const onTouchStart=(e)=>{touchStart.current=e.touches[0].clientX;};
  const onTouchEnd=(e)=>{if(!touchStart.current)return;const dx=touchStart.current-e.changedTouches[0].clientX;if(Math.abs(dx)>40)go(dx>0?1:-1);touchStart.current=null;};

  const handleHeart=(meal)=>{
    const key=meal.name;
    const already=lovedDishes.find(d=>d.name===key);
    const next=already?lovedDishes.filter(d=>d.name!==key):[...lovedDishes,{name:meal.name,emoji:meal.emoji,mealTime}];
    setLovedDishes(next);
    ls.set("sara_loved",next);
  };

  const handleFeedback=(i,v)=>{
    setFeedbacks(f=>({...f,[i]:v}));
    if(v==="skip"){
      const name=meals[i]?.name;
      if(name&&!skippedDishes.includes(name)){
        const next=[...skippedDishes,name];
        setSkippedDishes(next);
        ls.set("sara_skipped",next);
      }
    }
  };

  useEffect(()=>{
    let cancelled=false;
    async function load(){
      setLoading(true);setMeals([]);setFeedbacks({});setIdx(0);
      const lovedNames=lovedDishes.map(d=>d.name).slice(0,5);
      const skippedNames=skippedDishes.slice(-10);
      const prefsLine=prefs?.trim()?`\nSara's preferences: ${prefs}`:"";
      const lovedLine=lovedNames.length?`\nSara LOVES these dishes (offer variations often): ${lovedNames.join(", ")}`:"";
      const skipLine=skippedNames.length?`\nSara SKIPPED these recently (never suggest them): ${skippedNames.join(", ")}`:"";
      try{
        const res=await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:
            `You are a nutrition expert helping a busy Israeli mom of 2 kids under 4.\nGenerate exactly 4 healthy ${mealTime} ideas with focus on: ${focusObj?.label}.${prefsLine}${lovedLine}${skipLine}\nIf she loves certain dishes, offer creative variations of them. Make suggestions feel personal and fresh.\nRespond ONLY with a raw JSON array (no markdown, no backticks):\n[{"name":"Short name","emoji":"one emoji","description":"2 practical sentences.","tags":["tag1","tag2","tag3"]},...]\nMax 3 tags. Tags: High protein, Quick, Easy, Family-friendly, No cook, Meal prep, etc.`
          }]})
        });
        if(cancelled)return;
        const data=await res.json();
        const text=data.content?.[0]?.text||"";
        const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
        // Flag loved dishes
        const withLoved=parsed.map(m=>({...m,isLoved:lovedDishes.some(d=>d.name===m.name)}));
        setMeals(withLoved);
      }catch{if(!cancelled)setMeals(FALLBACK[mealTime]||FALLBACK.breakfast);}
      if(!cancelled)setLoading(false);
    }
    load();
    return()=>{cancelled=true;};
  },[focus,mealTime,loadKey]);

  const allSwiped=meals.length>0&&idx===meals.length-1&&!!feedbacks[idx];

  return(
    <div style={{paddingTop:8}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:C.text,marginBottom:4}}>What to eat today 🍽️</div>
      <p style={{fontSize:13,color:C.muted,marginBottom:20}}>Pick a focus and a meal — swipe through the options.</p>

      {/* Loved dishes toggle */}
      {lovedDishes.length>0&&(
        <button onClick={()=>setShowLoved(s=>!s)} style={{display:"flex",alignItems:"center",gap:6,marginBottom:16,background:showLoved?C.heartLight:C.card,border:`1.5px solid ${showLoved?C.heart:C.border}`,borderRadius:50,padding:"6px 14px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,color:showLoved?C.heart:C.muted}}>
          ❤️ Your favourites ({lovedDishes.length}) {showLoved?"▲":"▼"}
        </button>
      )}

      {showLoved&&lovedDishes.length>0&&(
        <div className="fade-in" style={{background:C.heartLight,borderRadius:20,padding:16,marginBottom:16,border:`1px solid ${C.heart}20`}}>
          <div style={{fontSize:11,fontWeight:500,color:C.heart,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Dishes Sara loves</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {lovedDishes.map(d=>(
              <div key={d.name} style={{display:"flex",alignItems:"center",gap:5,background:"#fff",borderRadius:50,padding:"5px 12px",fontSize:12,color:C.text,border:`1px solid ${C.border}`}}>
                <span>{d.emoji}</span>{d.name}
                <button onClick={()=>{const next=lovedDishes.filter(x=>x.name!==d.name);setLovedDishes(next);ls.set("sara_loved",next);}} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:14,padding:0,marginLeft:4}}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <SectionLabel>Focus on</SectionLabel>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6,marginBottom:20}}>
        {FOCUS_OPTIONS.map(f=><Chip key={f.id} label={f.label} emoji={f.emoji} color={f.color} selected={focus===f.id} onClick={()=>setFocus(f.id)}/>)}
      </div>

      <SectionLabel>Meal time</SectionLabel>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {MEAL_TIMES.map(mt=>(
          <button key={mt.id} onClick={()=>setMealTime(mt.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 4px",borderRadius:16,background:mealTime===mt.id?C.terra:C.card,border:`1.5px solid ${mealTime===mt.id?C.terra:C.border}`,color:mealTime===mt.id?"#fff":C.muted,cursor:"pointer",transition:"all 0.2s",fontFamily:"'DM Sans',sans-serif"}}>
            <span style={{fontSize:18}}>{mt.emoji}</span>
            <span style={{fontSize:10,fontWeight:500}}>{mt.label}</span>
          </button>
        ))}
      </div>

      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
        <div style={{padding:"5px 12px",borderRadius:50,background:focusObj?.color+"18",color:focusObj?.color,fontSize:12,fontWeight:500,border:`1px solid ${focusObj?.color}30`}}>
          {focusObj?.emoji} {focusObj?.label} · {MEAL_TIMES.find(m=>m.id===mealTime)?.emoji} {MEAL_TIMES.find(m=>m.id===mealTime)?.label}
        </div>
        {prefs?.trim()&&<div style={{padding:"4px 10px",borderRadius:50,background:C.purpleLight,color:C.purple,fontSize:11,fontWeight:500,border:`1px solid ${C.purple}30`}}>✦ Personalised</div>}
        <button onClick={()=>setLoadKey(k=>k+1)} style={{marginLeft:"auto",background:"none",border:`1px solid ${C.border}`,cursor:"pointer",fontSize:13,color:C.muted,padding:"4px 10px",borderRadius:8}}>↻ New</button>
      </div>

      {loading?(<><SkeletonCard height={44}/><SkeletonCard height={260}/></>):meals.length>0&&(
        <>
          {/* Nav */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:12,color:C.muted}}>Option <b style={{color:C.terra}}>{idx+1}</b> of {meals.length}</span>
            <div style={{display:"flex",gap:8}}>
              {[[-1,"‹"],[1,"›"]].map(([d,a])=>{const off=d<0?idx===0:idx===meals.length-1;return(
                <button key={d} onClick={()=>go(d)} disabled={off} style={{width:32,height:32,borderRadius:"50%",border:`1.5px solid ${off?C.border:C.terra+"50"}`,background:off?C.cream:C.terraLight,color:off?C.border:C.terra,fontSize:16,cursor:off?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:600}}>{a}</button>
              );})}
            </div>
          </div>
          {/* Dots */}
          <div style={{display:"flex",gap:5,marginBottom:14}}>
            {meals.map((_,i)=><div key={i} onClick={()=>{setDir(i>idx?"left":"right");setIdx(i);}} style={{height:4,borderRadius:4,cursor:"pointer",transition:"all 0.3s",flex:i===idx?2:1,background:i===idx?C.terra:C.border}}/>)}
          </div>
          {/* Card */}
          <div key={`${idx}-${dir}`} className={dir==="left"?"slide-left":"slide-right"} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <MealCard
              meal={meals[idx]}
              feedback={feedbacks[idx]}
              onFeedback={(v)=>handleFeedback(idx,v)}
              loved={lovedDishes.some(d=>d.name===meals[idx]?.name)}
              onHeart={()=>handleHeart(meals[idx])}
            />
          </div>

          {/* Show more when all swiped */}
          {allSwiped&&(
            <button className="fade-in" onClick={()=>setLoadKey(k=>k+1)} style={{width:"100%",marginTop:16,padding:13,background:C.terra,color:"#fff",border:"none",borderRadius:16,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,cursor:"pointer",boxShadow:`0 4px 12px ${C.terra}40`}}>
              ✨ Show me more options
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ── Preferences Tab ───────────────────────────────────────
function PrefsTab({prefs,onSave}){
  const [draft,setDraft]=useState(prefs);
  const [saved,setSaved]=useState(false);
  const [activeTags,setActiveTags]=useState([]);
  const toggleTag=(label)=>{
    const next=activeTags.includes(label)?activeTags.filter(t=>t!==label):[...activeTags,label];
    setActiveTags(next);
    if(!activeTags.includes(label))setDraft(d=>d?`${d.trim()}, ${label.toLowerCase()}`:label.toLowerCase());
  };
  const handleSave=()=>{onSave(draft);setSaved(true);setTimeout(()=>setSaved(false),2500);try{localStorage.setItem("sara_prefs",draft);}catch{}};
  return(
    <div style={{paddingTop:8}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:C.text,marginBottom:8}}>Make it yours 🌿</div>
      <div style={{background:C.purpleLight,borderRadius:16,padding:16,marginBottom:24,border:`1px solid ${C.purple}20`}}>
        <div style={{fontSize:13.5,color:C.text,lineHeight:1.7}}>Tell us about your diet, allergies, and food preferences.<br/><span style={{color:C.purple,fontWeight:500}}>Every meal suggestion will be adjusted just for you.</span></div>
        <div style={{marginTop:10,display:"flex",gap:12}}>
          {[["🥦","No meat?","We'll skip it"],["🥜","Allergies?","We'll avoid them"],["🇮🇱","Love Israeli food?","We'll include it"]].map(([e,t,s])=>(
            <div key={t} style={{flex:1,textAlign:"center"}}>
              <div style={{fontSize:20,marginBottom:2}}>{e}</div>
              <div style={{fontSize:11,fontWeight:500,color:C.text}}>{t}</div>
              <div style={{fontSize:10,color:C.muted}}>{s}</div>
            </div>
          ))}
        </div>
      </div>
      <SectionLabel>Tap to add</SectionLabel>
      {PREF_TAGS.map(group=>(
        <div key={group.group} style={{marginBottom:16}}>
          <div style={{fontSize:12,color:C.muted,fontWeight:500,marginBottom:8}}>{group.group}</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {group.tags.map(t=><Chip key={t.l} label={t.l} emoji={t.e} small selected={activeTags.includes(t.l)} color={C.purple} onClick={()=>toggleTag(t.l)}/>)}
          </div>
        </div>
      ))}
      <SectionLabel>Or write freely</SectionLabel>
      <div style={{background:C.card,borderRadius:20,padding:16,marginBottom:6,boxShadow:"0 2px 12px rgba(0,0,0,0.05)",border:`1.5px solid ${draft?.trim()?C.purple+"60":C.border}`,transition:"border-color 0.2s"}}>
        <textarea value={draft} onChange={e=>{setDraft(e.target.value);setSaved(false);}}
          placeholder={`e.g. "I'm vegetarian, I hate mushrooms, I love Israeli food, mornings are always rushed"`}
          rows={4} style={{width:"100%",border:"none",background:"transparent",fontFamily:"'DM Sans',sans-serif",fontSize:13.5,color:C.text,lineHeight:1.7,resize:"none"}}/>
      </div>
      <p style={{fontSize:11,color:C.muted,marginBottom:20}}>Write anything — the AI understands natural language.</p>
      <button onClick={handleSave} style={{width:"100%",padding:14,background:saved?C.sage:C.purple,color:"#fff",border:"none",borderRadius:16,fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:500,cursor:"pointer",transition:"background 0.3s",boxShadow:`0 4px 16px ${saved?C.sage:C.purple}40`}}>
        {saved?"✓ Saved! Meals are now personalised for you":"Save my preferences"}
      </button>
      {draft?.trim()&&(
        <>
          <div style={{marginTop:16,background:C.purpleLight,borderRadius:14,padding:14,border:`1px solid ${C.purple}20`}}>
            <div style={{fontSize:11,fontWeight:500,letterSpacing:1,color:C.purple,textTransform:"uppercase",marginBottom:6}}>Currently active</div>
            <p style={{fontSize:13,color:C.text,lineHeight:1.6,fontStyle:"italic"}}>"{draft}"</p>
          </div>
          <button onClick={()=>{setDraft("");setActiveTags([]);onSave("");try{localStorage.removeItem("sara_prefs");}catch{} }} style={{width:"100%",marginTop:10,padding:9,background:"none",border:`1px solid ${C.border}`,borderRadius:12,fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted,cursor:"pointer"}}>Clear preferences</button>
        </>
      )}
    </div>
  );
}

// ── Progress Tab ──────────────────────────────────────────
function ProgressTab({wins}){
  const ds=["M","T","W","T","F","S","S"];
  return(
    <div className="fade-in" style={{paddingTop:8}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:C.text,marginBottom:20}}>Your wins, Sara 🏆</div>
      <div style={{background:`linear-gradient(135deg,${C.terra},#B5604A)`,borderRadius:24,padding:24,marginBottom:16,boxShadow:"0 8px 32px rgba(196,120,90,0.25)"}}>
        <span style={{fontSize:11,fontWeight:500,letterSpacing:1.2,color:"rgba(255,255,255,0.7)",textTransform:"uppercase"}}>This week</span>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:"#fff",marginTop:4,marginBottom:20}}>{wins.total} wins so far ✨</div>
        <div style={{display:"flex",gap:6,marginBottom:20}}>
          {ds.map((d,i)=>(
            <div key={i} style={{flex:1,textAlign:"center"}}>
              <div style={{width:"100%",aspectRatio:"1",borderRadius:"50%",background:wins.days[i]?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:wins.days[i]?12:0,marginBottom:4}}>{wins.days[i]?"✓":""}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.6)"}}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:12}}>
          {[["🍽️",wins.meals,"meals"],["💪",wins.workouts,"workouts"],["💧",wins.hydration,"hydration"]].map(([e,v,l])=>(
            <div key={l} style={{flex:1,background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
              <div style={{fontSize:18}}>{e}</div>
              <div style={{fontSize:18,fontWeight:600,color:"#fff"}}>{v}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.7)"}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:C.card,borderRadius:20,padding:20,boxShadow:"0 4px 24px rgba(0,0,0,0.05)"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:C.text,marginBottom:16}}>What's working</div>
        {[["🍽️","Meal consistency","You've been eating breakfast every day this week — huge!"],["💪","Showing up","Even on tough days, you open the app. That matters."],["💧","Hydration","Getting better each week. Keep those glasses coming."]].map(([e,t,d])=>(
          <div key={t} style={{display:"flex",gap:12,marginBottom:16}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:C.sageLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{e}</div>
            <div>
              <div style={{fontSize:13,fontWeight:500,color:C.text,marginBottom:2}}>{t}</div>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>{d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState("today");
  const [prefs,setPrefs]=useState("");
  const [tip]=useState(()=>TIPS[Math.floor(Math.random()*TIPS.length)]);
  const now=new Date();
  const dateStr=`${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
  const wins={total:9,days:[true,true,false,true,true,false,false],meals:5,workouts:2,hydration:2};

  useEffect(()=>{try{const p=localStorage.getItem("sara_prefs");if(p)setPrefs(p);}catch{}},[] );

  const navItems=[
    {id:"today",   emoji:"☀️", label:"Today"},
    {id:"meals",   emoji:"🍽️",label:"Meals"},
    {id:"progress",emoji:"✨", label:"Progress"},
    {id:"prefs",   emoji:"⚙️", label:"My Prefs"},
  ];

  return(
    <>
      <style>{fonts}</style>
      <div style={{minHeight:"100vh",background:C.bg,display:"flex",justifyContent:"center",paddingBottom:92}}>
        <div style={{width:"100%",maxWidth:390}}>

          {/* Header */}
          <div style={{padding:"52px 24px 16px",background:`linear-gradient(180deg,${C.cream} 0%,transparent 100%)`}}>
            <div style={{fontSize:12,color:C.muted,letterSpacing:0.5,marginBottom:4}}>{dateStr}</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,color:C.text,lineHeight:1.2}}>
              {getGreeting()},<br/><span style={{color:C.terra}}>Sara</span> 🌿
            </div>
            {prefs?.trim()&&<div className="pop-in" style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:8,padding:"4px 11px",borderRadius:50,background:C.purpleLight,border:`1px solid ${C.purple}30`,fontSize:11,color:C.purple,fontWeight:500}}>✦ Personalised for you</div>}
          </div>

          <div style={{padding:"0 20px"}}>
            {tab==="today"&&(
              <>
                <ProgressStrip wins={wins} onNavigate={()=>setTab("progress")}/>

                {/* Meal teaser */}
                <div className="slide-up" onClick={()=>setTab("meals")} style={{background:C.terraLight,borderRadius:20,padding:18,marginBottom:14,border:`1px dashed ${C.terra}50`,opacity:0,animationDelay:"0.07s",cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:11,fontWeight:500,letterSpacing:1.1,color:C.terra,textTransform:"uppercase",marginBottom:4}}>Meal ideas</div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:C.text}}>Browse today's options →</div>
                      <div style={{fontSize:12,color:C.muted,marginTop:2}}>Breakfast · Lunch · Dinner · Snack</div>
                    </div>
                    <span style={{fontSize:30}}>🍽️</span>
                  </div>
                </div>

                <WorkoutSection/>
                <HydrationCard/>

                {/* Tip of the day — at the bottom */}
                <div className="slide-up" style={{background:C.cream,borderRadius:20,padding:18,marginBottom:14,border:`1px solid ${C.border}`,opacity:0,animationDelay:"0.2s"}}>
                  <SectionLabel>Tip of the day</SectionLabel>
                  <p style={{fontSize:14,color:C.text,lineHeight:1.7,fontStyle:"italic"}}>"{tip}"</p>
                </div>
              </>
            )}
            {tab==="meals"&&<MealsTab prefs={prefs}/>}
            {tab==="progress"&&<ProgressTab wins={wins}/>}
            {tab==="prefs"&&<PrefsTab prefs={prefs} onSave={setPrefs}/>}
          </div>
        </div>

        {/* Bottom Nav */}
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.card,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"center",padding:"10px 0 26px",boxShadow:"0 -4px 24px rgba(0,0,0,0.06)"}}>
          <div style={{display:"flex",maxWidth:390,width:"100%"}}>
            {navItems.map(item=>(
              <button key={item.id} onClick={()=>setTab(item.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"6px 0",position:"relative"}}>
                <span style={{fontSize:20}}>{item.emoji}</span>
                <span style={{fontSize:10,fontWeight:500,color:tab===item.id?C.terra:C.muted,letterSpacing:0.3}}>{item.label}</span>
                {tab===item.id&&<div style={{width:18,height:2.5,background:C.terra,borderRadius:2,marginTop:1}}/>}
                {item.id==="prefs"&&prefs?.trim()&&<div style={{position:"absolute",top:4,right:"18%",width:7,height:7,borderRadius:"50%",background:C.purple}}/>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

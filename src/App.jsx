import { useState, useEffect, useRef } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');`;

// ── helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2);
const fmt = s => { const h = String(Math.floor(s/3600)).padStart(2,"0"), m = String(Math.floor((s%3600)/60)).padStart(2,"0"), sec = String(s%60).padStart(2,"0"); return `${h}:${m}:${sec}`; };
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ── CSV-derived plans ────────────────────────────────────────────────────────
const DEFAULT_PLANS = [
  { id:"plan1", name:"DAY 1", tag:"STRENGTH", exercises:[
    { name:"Back Squat",           sets:[{reps:"8",weight:"135"},{reps:"8",weight:"135"},{reps:"8",weight:"135"}], time:"" },
    { name:"Bench Press",          sets:[{reps:"8",weight:"115"},{reps:"8",weight:"135"},{reps:"8",weight:"135"},{reps:"8",weight:"135"}], time:"" },
    { name:"Romanian Deadlift",    sets:[{reps:"8",weight:"90"},{reps:"8",weight:"90"},{reps:"8",weight:"90"}], time:"" },
    { name:"Bent-Over Row",        sets:[{reps:"10",weight:"40"},{reps:"10",weight:"40"},{reps:"10",weight:"40"}], time:"" },
    { name:"Reverse Dumbbell Flyes",sets:[{reps:"12",weight:"15"},{reps:"12",weight:"15"},{reps:"12",weight:"15"}], time:"" },
    { name:"Dumbbell Shrugs",      sets:[{reps:"12",weight:"35"},{reps:"12",weight:"35"},{reps:"12",weight:"35"}], time:"" },
  ]},
  { id:"plan2", name:"DAY 2", tag:"STRENGTH", exercises:[
    { name:"Incline Dumbbell Press",sets:[{reps:"8",weight:"35"},{reps:"8",weight:"45"},{reps:"8",weight:"45"},{reps:"8",weight:"45"}], time:"" },
    { name:"Landmine Row",         sets:[{reps:"10",weight:"45"},{reps:"10",weight:"50"},{reps:"10",weight:"50"}], time:"" },
    { name:"Walking Lunges / Split Squats",sets:[{reps:"11",weight:"45"},{reps:"11",weight:"50"},{reps:"11",weight:"50"}], time:"" },
    { name:"Dumbbell Lateral Raises",sets:[{reps:"12",weight:"15"},{reps:"12",weight:"15"},{reps:"12",weight:"15"}], time:"" },
    { name:"Standing Calf Raises", sets:[{reps:"20",weight:"30"},{reps:"20",weight:"30"},{reps:"20",weight:"30"}], time:"" },
    { name:"AB RIPPER",            sets:[{reps:"",weight:""}], time:"" },
  ]},
  { id:"plan3", name:"DAY 3", tag:"STRENGTH", exercises:[
    { name:"Bulgarian Split Squats / Step-Ups",sets:[{reps:"10",weight:"45"},{reps:"10",weight:"45"},{reps:"10",weight:"45"}], time:"" },
    { name:"Dumbbell Press",       sets:[{reps:"8",weight:"45"},{reps:"8",weight:"45"},{reps:"8",weight:"45"}], time:"" },
    { name:"One-Arm Dumbbell Row", sets:[{reps:"10",weight:"45"},{reps:"10",weight:"45"},{reps:"10",weight:"45"}], time:"" },
    { name:"Reverse Dumbbell Flyes",sets:[{reps:"12",weight:"15"},{reps:"12",weight:"15"},{reps:"12",weight:"15"}], time:"" },
    { name:"Dumbbell Shrugs",      sets:[{reps:"12",weight:"35"},{reps:"12",weight:"35"},{reps:"12",weight:"35"}], time:"" },
    { name:"Single-Leg Standing Calf Raises",sets:[{reps:"15",weight:"30"},{reps:"15",weight:"30"},{reps:"15",weight:"30"}], time:"" },
    { name:"AB RIPPER",            sets:[{reps:"",weight:""}], time:"" },
  ]},
  { id:"plan4", name:"DAY 4", tag:"BODYWEIGHT", exercises:[
    { name:"Wide Pull-Ups",        sets:[{reps:"11",weight:"BW"}], time:"" },
    { name:"Standard Push-Ups",    sets:[{reps:"18",weight:"BW"}], time:"" },
    { name:"Chin-Ups",             sets:[{reps:"11",weight:"BW"}], time:"" },
    { name:"Military Push-Ups",    sets:[{reps:"18",weight:"BW"}], time:"" },
    { name:"Close-Grip Pull-Ups",  sets:[{reps:"9",weight:"BW"}], time:"" },
    { name:"Wide Push-Ups",        sets:[{reps:"18",weight:"BW"}], time:"" },
    { name:"Vaulter Pull-Ups",     sets:[{reps:"7",weight:"BW"}], time:"" },
    { name:"Staggered Push-Ups",   sets:[{reps:"18",weight:"BW"}], time:"" },
    { name:"Burnout Finisher",     sets:[{reps:"",weight:""}], time:"2" },
  ]},
  { id:"plan5", name:"DAY 5", tag:"RECOVERY", exercises:[
    { name:"X3 YOGA", sets:[{reps:"",weight:""}], time:"" },
  ]},
];

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0a0a0a;color:#e8e8e8;font-family:'Barlow',sans-serif;-webkit-tap-highlight-color:transparent;padding-top:env(safe-area-inset-top)}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
input[type=number]{-moz-appearance:textfield}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#111}::-webkit-scrollbar-thumb{background:#c8ff00;border-radius:2px}
.app{min-height:100vh;background:#0a0a0a;background-image:radial-gradient(ellipse at 80% 0%,rgba(200,255,0,.04) 0%,transparent 60%),radial-gradient(ellipse at 20% 100%,rgba(200,255,0,.03) 0%,transparent 50%)}
.header{display:flex;align-items:center;justify-content:space-between;padding:env(safe-area-inset-top, 16px) 20px 16px;border-bottom:1px solid #1a1a1a;position:sticky;top:0;z-index:100;background:rgba(10,10,10,.97);backdrop-filter:blur(10px)}
.logo{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:4px;color:#c8ff00;text-shadow:0 0 20px rgba(200,255,0,.3)}
.logo span{color:#fff}
.nav{display:flex;gap:3px;background:#111;border:1px solid #1e1e1e;border-radius:8px;padding:3px}
.nav-btn{padding:7px 14px;background:transparent;border:none;border-radius:5px;color:#666;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;transition:all .2s;white-space:nowrap}
.nav-btn:hover{color:#aaa}
.nav-btn.active{background:#c8ff00;color:#0a0a0a}
.content{padding:24px 16px;max-width:700px;margin:0 auto}
.section-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;gap:12px}
.section-title{font-family:'Bebas Neue',sans-serif;font-size:40px;letter-spacing:3px;line-height:1}
.section-title .accent{color:#c8ff00}
.btn{padding:9px 18px;border-radius:6px;border:none;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;transition:all .2s;white-space:nowrap}
.btn-primary{background:#c8ff00;color:#0a0a0a}
.btn-primary:hover{background:#d9ff33;box-shadow:0 0 20px rgba(200,255,0,.3)}
.btn-ghost{background:transparent;border:1px solid #2a2a2a;color:#888}
.btn-ghost:hover{border-color:#c8ff00;color:#c8ff00}
.btn-danger{background:transparent;border:1px solid #2a2a2a;color:#666}
.btn-danger:hover{border-color:#ff4444;color:#ff4444}
.btn-sm{padding:5px 12px;font-size:11px}
.btn-xs{padding:4px 8px;font-size:10px;letter-spacing:1px}

/* timer */
.timer-bar{display:flex;align-items:center;gap:20px;background:#111;border:1px solid #1e1e1e;border-left:3px solid #c8ff00;border-radius:8px;padding:14px 18px;margin-bottom:20px;flex-wrap:wrap}
.timer-label{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#555}
.timer-value{font-family:'Bebas Neue',sans-serif;font-size:30px;color:#c8ff00;letter-spacing:2px}
.timer-sm{font-size:22px}

/* exercise card */
.exercise-card{background:#111;border:1px solid #1e1e1e;border-radius:10px;margin-bottom:14px;overflow:hidden}
.exercise-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #1a1a1a;gap:8px}
.exercise-name{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;flex:1}
.sets-table{padding:12px 16px}
.sets-row{display:grid;grid-template-columns:28px 1fr 1fr 0.7fr 36px;gap:6px;align-items:center;padding:4px 0}
.sets-row-header{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#3a3a3a;padding-bottom:6px;border-bottom:1px solid #1a1a1a;margin-bottom:2px}
.set-num{font-family:'Bebas Neue',sans-serif;font-size:16px;color:#3a3a3a;text-align:center}
.set-input{background:#0d0d0d;border:1px solid #1e1e1e;border-radius:5px;padding:7px 8px;color:#e8e8e8;font-family:'Barlow',sans-serif;font-size:14px;text-align:center;width:100%;transition:all .2s;outline:none}
.set-input:focus{border-color:#c8ff00;box-shadow:0 0 0 2px rgba(200,255,0,.08)}
.set-input.completed{border-color:#1e3300;background:#0a1500;color:#c8ff00}
.set-input.prev{background:transparent;border:none;color:#333;font-size:12px;pointer-events:none;padding:7px 4px}
.cheat-col{display:flex;align-items:center;gap:3px}
.cheat-input{background:#0d0d0d;border:1px solid #1e1e1e;border-radius:5px;padding:5px 6px;color:#888;font-family:'Barlow',sans-serif;font-size:11px;text-align:center;width:100%;outline:none;transition:all .2s}
.cheat-input:focus{border-color:#ff9500;box-shadow:0 0 0 2px rgba(255,149,0,.08)}
.cheat-input.completed{border-color:#2a1a00;background:#160d00;color:#ff9500}
.cheat-label{font-size:9px;color:#333;font-family:'Barlow Condensed',sans-serif;letter-spacing:1px;white-space:nowrap}
.check-btn{width:28px;height:28px;border-radius:50%;border:2px solid #222;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;transition:all .2s;color:#333;flex-shrink:0}
.check-btn:hover{border-color:#c8ff00;color:#c8ff00}
.check-btn.done{background:#c8ff00;border-color:#c8ff00;color:#0a0a0a}
.add-set-row{padding:6px 16px 14px;display:flex;gap:8px}
.time-row{padding:0 16px 12px;display:flex;align-items:center;gap:10px}
.time-label{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#444}
.time-input{background:#0d0d0d;border:1px solid #1e1e1e;border-radius:5px;padding:6px 10px;color:#e8e8e8;font-family:'Barlow',sans-serif;font-size:14px;width:80px;text-align:center;outline:none}
.time-input:focus{border-color:#c8ff00}

/* notes */
.notes-area{width:100%;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:8px;padding:12px 14px;color:#aaa;font-family:'Barlow',sans-serif;font-size:13px;resize:vertical;min-height:80px;outline:none;transition:border-color .2s;margin-top:2px}
.notes-area:focus{border-color:#c8ff00}
.notes-label{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#444;padding:12px 16px 4px}

/* active workout header */
.active-plan-name{font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:3px;color:#555;text-transform:uppercase;margin-bottom:6px}

/* empty */
.empty-state{text-align:center;padding:60px 20px;color:#333}
.empty-icon{font-size:56px;margin-bottom:14px;display:block}
.empty-title{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:3px;color:#333;margin-bottom:8px}

/* modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.88);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:flex-end;justify-content:center;padding:0}
.modal{background:#111;border:1px solid #222;border-radius:16px 16px 0 0;width:100%;max-width:600px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden}
.modal-header{padding:18px 20px;border-bottom:1px solid #1a1a1a;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.modal-title{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px}
.modal-body{overflow-y:auto;padding:16px 20px;flex:1}
.modal-footer{padding:14px 20px;border-top:1px solid #1a1a1a;display:flex;gap:10px;flex-shrink:0}
.search-input{width:100%;background:#0a0a0a;border:1px solid #1e1e1e;border-radius:8px;padding:10px 14px;color:#e8e8e8;font-family:'Barlow',sans-serif;font-size:14px;outline:none;transition:border-color .2s}
.search-input:focus{border-color:#c8ff00}
.search-input::placeholder{color:#444}
.exercise-option{padding:11px 14px;border-radius:8px;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:#888;transition:all .15s}
.exercise-option:hover{background:#1a1a1a;color:#c8ff00}
.text-input{width:100%;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:8px;padding:10px 14px;color:#e8e8e8;font-family:'Barlow',sans-serif;font-size:14px;outline:none;transition:border-color .2s;margin-bottom:12px}
.text-input:focus{border-color:#c8ff00}
.text-input::placeholder{color:#444}
.form-label{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:6px;display:block}

/* plan cards */
.plans-grid{display:flex;flex-direction:column;gap:12px}
.plan-card{background:#111;border:1px solid #1e1e1e;border-radius:12px;padding:20px;position:relative;overflow:hidden;transition:border-color .2s}
.plan-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#c8ff00,transparent);opacity:0;transition:opacity .2s}
.plan-card:hover{border-color:#2a2a2a}
.plan-card:hover::before{opacity:1}
.plan-tag{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#c8ff00;margin-bottom:4px}
.plan-name{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:2px;margin-bottom:12px}
.plan-exercises{display:flex;flex-direction:column;gap:5px;margin-bottom:16px}
.plan-exercise-item{display:flex;justify-content:space-between;align-items:center;font-size:13px}
.plan-exercise-name{color:#888}
.plan-exercise-meta{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;color:#3a3a3a}
.plan-footer{display:flex;justify-content:space-between;align-items:center;padding-top:14px;border-top:1px solid #1a1a1a;gap:8px}
.plan-count{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;color:#3a3a3a;text-transform:uppercase}
.last-session{background:#0d1a00;border:1px solid #1e3300;border-radius:8px;padding:10px 14px;margin-bottom:14px}
.last-session-title{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#5a8a00;margin-bottom:8px}
.last-session-item{display:flex;justify-content:space-between;font-size:12px;color:#6a9a10;padding:2px 0}

/* history */
.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
.stat-card{background:#111;border:1px solid #1e1e1e;border-radius:10px;padding:16px 18px}
.stat-label{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#3a3a3a;margin-bottom:4px}
.stat-value{font-family:'Bebas Neue',sans-serif;font-size:36px;color:#c8ff00;letter-spacing:2px;line-height:1}
.stat-sub{font-size:11px;color:#3a3a3a;margin-top:2px}
.chart-card{background:#111;border:1px solid #1e1e1e;border-radius:10px;padding:20px;margin-bottom:14px}
.chart-title{font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:16px}
.chart-bars{display:flex;align-items:flex-end;gap:5px;height:100px}
.bar-col{display:flex;flex-direction:column;align-items:center;flex:1;gap:4px}
.bar{width:100%;border-radius:3px 3px 0 0;background:linear-gradient(180deg,#c8ff00,#8bbb00);transition:height .5s ease;min-height:2px}
.bar-label{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:1px;color:#3a3a3a;text-transform:uppercase}
.history-item{background:#111;border:1px solid #1e1e1e;border-radius:10px;padding:14px 18px;margin-bottom:10px;cursor:pointer;transition:border-color .2s}
.history-item:hover{border-color:#2a2a2a}
.history-name{font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px}
.history-meta{font-size:11px;color:#3a3a3a}
.history-right{text-align:right}
.history-volume{font-family:'Bebas Neue',sans-serif;font-size:22px;color:#c8ff00;letter-spacing:1px}
.history-vol-label{font-size:10px;color:#3a3a3a;font-family:'Barlow Condensed',sans-serif;letter-spacing:1px;text-transform:uppercase}
.history-note{font-size:12px;color:#555;margin-top:6px;font-style:italic;border-top:1px solid #1a1a1a;padding-top:6px}

/* complete banner */
.workout-complete-banner{background:linear-gradient(135deg,#1a2600,#0f1a00);border:1px solid #c8ff00;border-radius:10px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;box-shadow:0 0 30px rgba(200,255,0,.1);gap:12px;flex-wrap:wrap}
.complete-text{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:3px;color:#c8ff00}
.complete-sub{font-size:12px;color:#6a9a10;margin-top:2px}

/* PR tab */
.pr-month-section{margin-bottom:24px}
.pr-month-title{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;color:#c8ff00;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #1a1a1a}
.pr-item{background:#111;border:1px solid #1e1e1e;border-radius:8px;padding:12px 16px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.pr-item-left{flex:1}
.pr-exercise{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-bottom:2px}
.pr-weight{font-family:'Bebas Neue',sans-serif;font-size:22px;color:#c8ff00;letter-spacing:1px}
.pr-weight-unit{font-size:12px;color:#555;margin-left:2px}
.pr-date-badge{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#555;background:#1a1a1a;padding:3px 8px;border-radius:4px}

/* plan builder */
.plan-builder-exercise{background:#0d0d0d;border:1px solid #1e1e1e;border-radius:8px;padding:12px 14px;margin-bottom:10px}
.plan-builder-row{display:grid;grid-template-columns:1fr 60px 60px 60px 28px;gap:6px;align-items:center;margin-top:8px}
.plan-builder-header{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#333;display:grid;grid-template-columns:1fr 60px 60px 60px 28px;gap:6px;margin-bottom:4px}
.mini-input{background:#111;border:1px solid #222;border-radius:5px;padding:6px 8px;color:#e8e8e8;font-family:'Barlow',sans-serif;font-size:13px;text-align:center;width:100%;outline:none}
.mini-input:focus{border-color:#c8ff00}
.divider{height:1px;background:#1a1a1a;margin:14px 0}
`;

const EXERCISE_LIST = [
  "AB RIPPER","Back Squat","Bench Press","Bent-Over Row","Bulgarian Split Squats / Step-Ups",
  "Burnout Finisher","Chin-Ups","Close-Grip Pull-Ups","Deadlift","Dumbbell Lateral Raises",
  "Dumbbell Press","Dumbbell Shrugs","Face Pull","Incline Dumbbell Press","Landmine Row",
  "Lateral Raise","Leg Curl","Leg Press","Military Push-Ups","One-Arm Dumbbell Row",
  "Overhead Press","Pull-Up","Reverse Dumbbell Flyes","Romanian Deadlift","Single-Leg Standing Calf Raises",
  "Squat","Standard Push-Ups","Standing Calf Raises","Staggered Push-Ups","Tricep Dip",
  "Vaulter Pull-Ups","Walking Lunges / Split Squats","Wide Pull-Ups","Wide Push-Ups","X3 YOGA",
  "Cable Fly","Barbell Row","Shrug","Calf Raise",
];

// ── main component ────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("tracker");

  // persistent state
  const [plans, setPlans]     = useState(() => JSON.parse(localStorage.getItem("il_plans") || "null") || DEFAULT_PLANS);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("il_history") || "[]"));
  const [prs, setPrs]         = useState(() => JSON.parse(localStorage.getItem("il_prs") || "[]"));

  useEffect(() => { localStorage.setItem("il_plans", JSON.stringify(plans)); }, [plans]);
  useEffect(() => { localStorage.setItem("il_history", JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem("il_prs", JSON.stringify(prs)); }, [prs]);

  // active workout state
  const [activePlanId, setActivePlanId]   = useState(null);
  const [exercises, setExercises]         = useState([]);
  const [workoutNote, setWorkoutNote]     = useState("");
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutDone, setWorkoutDone]     = useState(false);
  const [timerSecs, setTimerSecs]         = useState(0);
  const [timerRunning, setTimerRunning]   = useState(false);
  const timerRef = useRef(null);

  // modals
  const [showExModal, setShowExModal]     = useState(false);
  const [exSearch, setExSearch]           = useState("");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editPlanId, setEditPlanId]       = useState(null);
  const [showHistoryDetail, setShowHistoryDetail] = useState(null);
  const [showPrModal, setShowPrModal]     = useState(false);
  const [editPrId, setEditPrId]           = useState(null);

  // plan builder state
  const [builderName, setBuilderName]   = useState("");
  const [builderTag, setBuilderTag]     = useState("");
  const [builderExs, setBuilderExs]     = useState([]);
  const [builderExSearch, setBuilderExSearch] = useState("");

  // PR form state
  const [prExercise, setPrExercise]   = useState("");
  const [prWeight, setPrWeight]       = useState("");
  const [prTargetDate, setPrTargetDate] = useState("");

  // timer
  useEffect(() => {
    if (timerRunning) { timerRef.current = setInterval(() => setTimerSecs(s => s+1), 1000); }
    else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  // ── helpers ────────────────────────────────────────────────────────────────
  const getLastSession = (planId) => history.filter(h => h.planId === planId).sort((a,b) => b.ts - a.ts)[0] || null;

  const startWorkout = (plan) => {
    const exs = plan.exercises.map(e => ({
      id: uid(), name: e.name, time: e.time || "",
      sets: e.sets.map(s => ({ id: uid(), reps: s.reps||"", weight: s.weight||"", cheat:"", completed: false }))
    }));
    setExercises(exs);
    setActivePlanId(plan.id);
    setWorkoutNote("");
    setWorkoutDone(false);
    setWorkoutStarted(true);
    setTimerSecs(0);
    setTimerRunning(true);
    setTab("tracker");
  };

  const finishWorkout = () => {
    setTimerRunning(false);
    setWorkoutDone(true);
    const vol = exercises.reduce((s, ex) => s + ex.sets.reduce((s2, set) =>
      s2 + (set.completed ? (parseFloat(set.weight)||0)*(parseFloat(set.reps)||0) : 0), 0), 0);
    const entry = {
      id: uid(), planId: activePlanId,
      name: activePlanId ? (plans.find(p=>p.id===activePlanId)?.name||"WORKOUT") : "CUSTOM WORKOUT",
      date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}),
      ts: Date.now(),
      exercises: exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.map(s => ({ reps:s.reps, weight:s.weight, cheat:s.cheat, completed:s.completed }))
      })),
      volume: Math.round(vol),
      note: workoutNote,
      duration: fmt(timerSecs),
    };
    setHistory(prev => [entry, ...prev]);
  };

  const resetWorkout = () => {
    setExercises([]); setWorkoutDone(false); setWorkoutStarted(false);
    setTimerSecs(0); setActivePlanId(null); setWorkoutNote("");
  };

  const addExercise = (name) => {
    setExercises(prev => [...prev, {
      id: uid(), name, time:"",
      sets: [{ id: uid(), reps:"", weight:"", cheat:"", completed:false }]
    }]);
    setShowExModal(false); setExSearch("");
    if (!workoutStarted) { setWorkoutStarted(true); setTimerRunning(true); }
  };

  const updSet = (exId, setId, field, val) =>
    setExercises(prev => prev.map(ex => ex.id!==exId ? ex : {
      ...ex, sets: ex.sets.map(s => s.id!==setId ? s : { ...s, [field]: val })
    }));

  const toggleSet = (exId, setId) =>
    setExercises(prev => prev.map(ex => ex.id!==exId ? ex : {
      ...ex, sets: ex.sets.map(s => s.id!==setId ? s : { ...s, completed: !s.completed })
    }));

  const addSet = (exId) =>
    setExercises(prev => prev.map(ex => ex.id!==exId ? ex : {
      ...ex, sets: [...ex.sets, { id:uid(), reps:"", weight:"", cheat:"", completed:false }]
    }));

  const removeLastSet = (exId) =>
    setExercises(prev => prev.map(ex => ex.id!==exId ? ex : {
      ...ex, sets: ex.sets.slice(0,-1)
    }));

  const removeExercise = (exId) => setExercises(prev => prev.filter(e => e.id!==exId));

  // plan builder
  const openNewPlan = () => {
    setEditPlanId(null);
    setBuilderName(""); setBuilderTag(""); setBuilderExs([]);
    setShowPlanModal(true);
  };

  const openEditPlan = (plan) => {
    setEditPlanId(plan.id);
    setBuilderName(plan.name); setBuilderTag(plan.tag);
    setBuilderExs(plan.exercises.map(e => ({
      id: uid(), name: e.name, time: e.time||"",
      sets: e.sets.map(s => ({ id:uid(), reps:s.reps||"", weight:s.weight||"" }))
    })));
    setShowPlanModal(true);
  };

  const addBuilderEx = (name) => {
    setBuilderExs(prev => [...prev, {
      id: uid(), name, time:"",
      sets: [{ id:uid(), reps:"", weight:"" }]
    }]);
    setBuilderExSearch("");
  };

  const updBuilderSet = (exId, setId, field, val) =>
    setBuilderExs(prev => prev.map(ex => ex.id!==exId ? ex : {
      ...ex, sets: ex.sets.map(s => s.id!==setId ? s : { ...s, [field]:val })
    }));

  const savePlan = () => {
    if (!builderName.trim()) return;
    const plan = {
      id: editPlanId || uid(),
      name: builderName.toUpperCase(),
      tag: builderTag.toUpperCase() || "CUSTOM",
      exercises: builderExs.map(ex => ({
        name: ex.name, time: ex.time,
        sets: ex.sets.map(s => ({ reps:s.reps, weight:s.weight }))
      }))
    };
    setPlans(prev => editPlanId ? prev.map(p => p.id===editPlanId ? plan : p) : [...prev, plan]);
    setShowPlanModal(false);
  };

  const deletePlan = (id) => setPlans(prev => prev.filter(p => p.id!==id));

  // PR helpers
  const openNewPr = () => { setEditPrId(null); setPrExercise(""); setPrWeight(""); setPrTargetDate(""); setShowPrModal(true); };
  const openEditPr = (pr) => { setEditPrId(pr.id); setPrExercise(pr.exercise); setPrWeight(pr.weight); setPrTargetDate(pr.targetDate); setShowPrModal(true); };
  const savePr = () => {
    if (!prExercise.trim() || !prWeight.trim() || !prTargetDate) return;
    const pr = { id: editPrId||uid(), exercise: prExercise, weight: prWeight, targetDate: prTargetDate };
    setPrs(prev => editPrId ? prev.map(p => p.id===editPrId ? pr : p) : [...prev, pr]);
    setShowPrModal(false);
  };
  const deletePr = (id) => setPrs(prev => prev.filter(p => p.id!==id));

  // PR grouped by month
  const prsByMonth = () => {
    const grouped = {};
    prs.forEach(pr => {
      const d = new Date(pr.targetDate + "T00:00:00");
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,"0")}`;
      const label = MONTHS[d.getMonth()] + " " + d.getFullYear();
      if (!grouped[key]) grouped[key] = { label, items:[] };
      grouped[key].items.push(pr);
    });
    return Object.entries(grouped).sort((a,b) => a[0].localeCompare(b[0])).map(([,v]) => v);
  };

  // export
  const exportData = () => {
    const data = { plans, history, prs, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null,2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ironlog-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  // computed
  const completedSets = exercises.reduce((s,ex) => s + ex.sets.filter(st=>st.completed).length, 0);
  const totalVolume   = exercises.reduce((s,ex) => s + ex.sets.filter(st=>st.completed).reduce((s2,st) => s2 + (parseFloat(st.weight)||0)*(parseFloat(st.reps)||0), 0), 0);
  const activePlan    = plans.find(p=>p.id===activePlanId);

  const weeklyVol = (() => {
    const days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
    const now = new Date(); const day = now.getDay();
    return days.map((label,i) => {
      const d = new Date(now); d.setDate(now.getDate() - day + i);
      const ds = d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
      const v = history.filter(h=>h.date===ds).reduce((s,h)=>s+h.volume,0);
      return { label, v };
    });
  })();
  const maxVol = Math.max(...weeklyVol.map(d=>d.v), 1);

  const filteredEx = EXERCISE_LIST.filter(e => e.toLowerCase().includes(exSearch.toLowerCase()));
  const filteredBuilderEx = EXERCISE_LIST.filter(e => e.toLowerCase().includes(builderExSearch.toLowerCase()));

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{FONTS}{CSS}</style>
      <div className="app">
        {/* HEADER */}
        <header className="header">
          <div className="logo">IRON<span>LOG</span></div>
          <nav className="nav">
            <button className={`nav-btn ${tab==="tracker"?"active":""}`} onClick={()=>setTab("tracker")}>Workout</button>
            <button className={`nav-btn ${tab==="plans"?"active":""}`} onClick={()=>setTab("plans")}>Plans</button>
            <button className={`nav-btn ${tab==="history"?"active":""}`} onClick={()=>setTab("history")}>History</button>
            <button className={`nav-btn ${tab==="prs"?"active":""}`} onClick={()=>setTab("prs")}>PRs</button>
          </nav>
        </header>

        <div className="content">

          {/* ── TRACKER TAB ── */}
          {tab==="tracker" && (<>
            <div className="section-header">
              <div>
                {activePlan && <div className="active-plan-name">{activePlan.name}</div>}
                <div className="section-title">
                  {workoutStarted ? <>ACTIVE<br/><span className="accent">WORKOUT</span></> : <>START<br/><span className="accent">TRAINING</span></>}
                </div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
                {workoutStarted && !workoutDone && <button className="btn btn-ghost" onClick={finishWorkout}>Finish</button>}
                <button className="btn btn-primary" onClick={()=>setShowExModal(true)}>+ Exercise</button>
              </div>
            </div>

            {workoutDone && (
              <div className="workout-complete-banner">
                <div>
                  <div className="complete-text">💪 WORKOUT COMPLETE</div>
                  <div className="complete-sub">{completedSets} sets · {Math.round(totalVolume).toLocaleString()} lbs · {fmt(timerSecs)}</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={resetWorkout}>New Workout</button>
              </div>
            )}

            {workoutStarted && (
              <div className="timer-bar">
                <div><div className="timer-label">Time</div><div className="timer-value">{fmt(timerSecs)}</div></div>
                <div><div className="timer-label">Sets Done</div><div className="timer-value timer-sm">{completedSets}</div></div>
                <div><div className="timer-label">Volume</div><div className="timer-value timer-sm">{Math.round(totalVolume).toLocaleString()}<span style={{fontSize:12,color:"#555",marginLeft:3}}>lbs</span></div></div>
              </div>
            )}

            {exercises.length===0 ? (
              <div className="empty-state">
                <span className="empty-icon">🏋️</span>
                <div className="empty-title">No exercises yet</div>
                <div style={{color:"#444",marginBottom:20,fontSize:14}}>Add an exercise or load a plan to begin</div>
                <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                  <button className="btn btn-primary" onClick={()=>setShowExModal(true)}>+ Add Exercise</button>
                  <button className="btn btn-ghost" onClick={()=>setTab("plans")}>Browse Plans</button>
                </div>
              </div>
            ) : (<>
              {exercises.map(ex => {
                const lastSession = getLastSession(activePlanId);
                const lastEx = lastSession?.exercises?.find(e=>e.name===ex.name);
                const hasTime = ex.time && ex.time.trim() !== "";
                return (
                  <div key={ex.id} className="exercise-card">
                    <div className="exercise-header">
                      <div className="exercise-name">{ex.name}</div>
                      <button className="btn btn-danger btn-xs" onClick={()=>removeExercise(ex.id)}>Remove</button>
                    </div>

                    {lastEx && (
                      <div style={{padding:"8px 16px 0"}}>
                        <div className="last-session">
                          <div className="last-session-title">Last Session</div>
                          {lastEx.sets.slice(0,3).map((s,i) => (
                            <div key={i} className="last-session-item">
                              <span>Set {i+1}</span>
                              <span>{s.weight && s.weight!=="BW" ? `${s.weight} lbs` : s.weight||"—"} × {s.reps||"—"}{s.cheat ? ` +${s.cheat} cheat` : ""}</span>
                            </div>
                          ))}
                          {lastEx.sets.length>3 && <div style={{fontSize:11,color:"#3a5a00",marginTop:2}}>+{lastEx.sets.length-3} more sets</div>}
                        </div>
                      </div>
                    )}

                    {hasTime && (
                      <div className="time-row">
                        <div className="time-label">Duration</div>
                        <input className="time-input" value={ex.time} onChange={e=>setExercises(prev=>prev.map(x=>x.id!==ex.id?x:{...x,time:e.target.value}))} placeholder="mins"/>
                        <span style={{fontSize:12,color:"#444"}}>min</span>
                      </div>
                    )}

                    <div className="sets-table">
                      <div className="sets-row sets-row-header">
                        <div style={{textAlign:"center"}}>#</div>
                        <div>Weight</div>
                        <div>Reps</div>
                        <div style={{fontSize:9}}>Cheat</div>
                        <div></div>
                      </div>
                      {ex.sets.map((set,idx) => (
                        <div key={set.id} className="sets-row">
                          <div className="set-num">{idx+1}</div>
                          <input className={`set-input${set.completed?" completed":""}`} type="text" inputMode="decimal" placeholder="lbs" value={set.weight} onChange={e=>updSet(ex.id,set.id,"weight",e.target.value)}/>
                          <input className={`set-input${set.completed?" completed":""}`} type="text" inputMode="numeric" placeholder="reps" value={set.reps} onChange={e=>updSet(ex.id,set.id,"reps",e.target.value)}/>
                          <input className={`cheat-input${set.completed?" completed":""}`} type="text" inputMode="numeric" placeholder="+0" value={set.cheat} onChange={e=>updSet(ex.id,set.id,"cheat",e.target.value)}/>
                          <button className={`check-btn${set.completed?" done":""}`} onClick={()=>toggleSet(ex.id,set.id)}>{set.completed?"✓":""}</button>
                        </div>
                      ))}
                    </div>
                    <div className="add-set-row">
                      <button className="btn btn-ghost btn-xs" onClick={()=>addSet(ex.id)}>+ Set</button>
                      {ex.sets.length>1 && <button className="btn btn-danger btn-xs" onClick={()=>removeLastSet(ex.id)}>− Set</button>}
                    </div>
                  </div>
                );
              })}

              <div style={{marginTop:8}}>
                <div className="notes-label">Workout Notes</div>
                <textarea className="notes-area" placeholder="How did this session feel? PRs, struggles, anything to remember..." value={workoutNote} onChange={e=>setWorkoutNote(e.target.value)}/>
              </div>

              {workoutStarted && !workoutDone && (
                <div style={{marginTop:16,display:"flex",gap:10}}>
                  <button className="btn btn-primary" style={{flex:1}} onClick={finishWorkout}>Finish Workout</button>
                </div>
              )}
            </>)}
          </>)}

          {/* ── PLANS TAB ── */}
          {tab==="plans" && (<>
            <div className="section-header">
              <div className="section-title">WORKOUT<br/><span className="accent">PLANS</span></div>
              <button className="btn btn-primary" onClick={openNewPlan}>+ New Plan</button>
            </div>
            <div className="plans-grid">
              {plans.map(plan => {
                const last = getLastSession(plan.id);
                return (
                  <div key={plan.id} className="plan-card">
                    <div className="plan-tag">{plan.tag}</div>
                    <div className="plan-name">{plan.name}</div>
                    {last && (
                      <div style={{fontSize:11,color:"#4a7a00",fontFamily:"Barlow Condensed",letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>
                        Last done: {last.date} · {last.volume.toLocaleString()} lbs
                      </div>
                    )}
                    <div className="plan-exercises">
                      {plan.exercises.slice(0,5).map((e,i) => (
                        <div key={i} className="plan-exercise-item">
                          <span className="plan-exercise-name">{e.name}</span>
                          <span className="plan-exercise-meta">
                            {e.sets.length > 0 && e.sets[0].reps ? `${e.sets.length}×${e.sets[0].reps}` : ""}
                            {e.time ? ` ${e.time}min` : ""}
                          </span>
                        </div>
                      ))}
                      {plan.exercises.length>5 && <div style={{fontSize:11,color:"#333",fontFamily:"Barlow Condensed"}}>+{plan.exercises.length-5} more</div>}
                    </div>
                    <div className="plan-footer">
                      <div className="plan-count">{plan.exercises.length} exercises</div>
                      <div style={{display:"flex",gap:8}}>
                        <button className="btn btn-ghost btn-xs" onClick={()=>openEditPlan(plan)}>Edit</button>
                        <button className="btn btn-danger btn-xs" onClick={()=>deletePlan(plan.id)}>Delete</button>
                        <button className="btn btn-primary btn-sm" onClick={()=>startWorkout(plan)}>Start ▶</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>)}

          {/* ── HISTORY TAB ── */}
          {tab==="history" && (<>
            <div className="section-header">
              <div className="section-title">YOUR<br/><span className="accent">PROGRESS</span></div>
              <button className="btn btn-ghost btn-sm" onClick={exportData}>⬇ Export</button>
            </div>
            <div className="stat-grid">
              <div className="stat-card"><div className="stat-label">Total Sessions</div><div className="stat-value">{history.length}</div></div>
              <div className="stat-card"><div className="stat-label">This Week</div><div className="stat-value">{weeklyVol.reduce((s,d)=>s+(d.v>0?1:0),0)}</div><div className="stat-sub">sessions</div></div>
              <div className="stat-card"><div className="stat-label">Best Volume</div><div className="stat-value">{history.length?Math.max(...history.map(h=>h.volume)).toLocaleString():0}</div><div className="stat-sub">lbs / session</div></div>
              <div className="stat-card"><div className="stat-label">Total Volume</div><div className="stat-value">{history.reduce((s,h)=>s+h.volume,0).toLocaleString()}</div><div className="stat-sub">lbs all time</div></div>
            </div>
            <div className="chart-card">
              <div className="chart-title">Weekly Volume (lbs)</div>
              <div className="chart-bars">
                {weeklyVol.map((d,i)=>(
                  <div key={i} className="bar-col">
                    <div className="bar" style={{height:`${(d.v/maxVol)*90}px`,opacity:d.v?1:0.12}}/>
                    <div className="bar-label">{d.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {history.length===0 ? (
              <div className="empty-state"><span className="empty-icon">📊</span><div className="empty-title">No sessions yet</div></div>
            ) : history.map(item=>(
              <div key={item.id} className="history-item" onClick={()=>setShowHistoryDetail(item)}>
                <div style={{flex:1}}>
                  <div className="history-name">{item.name}</div>
                  <div className="history-meta">{item.date} · {item.exercises?.length||0} exercises · {item.duration}</div>
                  {item.note && <div className="history-note">"{item.note}"</div>}
                </div>
                <div className="history-right">
                  <div className="history-volume">{item.volume.toLocaleString()}</div>
                  <div className="history-vol-label">lbs</div>
                </div>
              </div>
            ))}
          </>)}

          {/* ── PR TAB ── */}
          {tab==="prs" && (<>
            <div className="section-header">
              <div className="section-title">PR<br/><span className="accent">GOALS</span></div>
              <button className="btn btn-primary" onClick={openNewPr}>+ Add PR</button>
            </div>
            {prs.length===0 ? (
              <div className="empty-state"><span className="empty-icon">🏆</span><div className="empty-title">No PR goals yet</div><div style={{color:"#444",fontSize:14,marginBottom:20}}>Set a goal, chase it.</div><button className="btn btn-primary" onClick={openNewPr}>+ Add PR Goal</button></div>
            ) : prsByMonth().map((group,gi)=>(
              <div key={gi} className="pr-month-section">
                <div className="pr-month-title">{group.label}</div>
                {group.items.map(pr=>(
                  <div key={pr.id} className="pr-item">
                    <div className="pr-item-left">
                      <div className="pr-exercise">{pr.exercise}</div>
                      <div><span className="pr-weight">{pr.weight}</span><span className="pr-weight-unit">lbs</span></div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                      <div className="pr-date-badge">{new Date(pr.targetDate+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
                      <div style={{display:"flex",gap:6}}>
                        <button className="btn btn-ghost btn-xs" onClick={()=>openEditPr(pr)}>Edit</button>
                        <button className="btn btn-danger btn-xs" onClick={()=>deletePr(pr.id)}>✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>)}

        </div>{/* end content */}

        {/* ── EXERCISE PICKER MODAL ── */}
        {showExModal && (
          <div className="modal-overlay" onClick={()=>setShowExModal(false)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">ADD EXERCISE</div>
                <button className="btn btn-ghost btn-xs" onClick={()=>setShowExModal(false)}>✕</button>
              </div>
              <div style={{padding:"12px 20px",borderBottom:"1px solid #1a1a1a"}}>
                <input className="search-input" placeholder="Search exercises..." value={exSearch} onChange={e=>setExSearch(e.target.value)} autoFocus/>
              </div>
              <div style={{overflowY:"auto",padding:"8px"}}>
                {filteredEx.map(ex=>(
                  <div key={ex} className="exercise-option" onClick={()=>addExercise(ex)}>{ex}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PLAN BUILDER MODAL ── */}
        {showPlanModal && (
          <div className="modal-overlay" onClick={()=>setShowPlanModal(false)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">{editPlanId?"EDIT PLAN":"NEW PLAN"}</div>
                <button className="btn btn-ghost btn-xs" onClick={()=>setShowPlanModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                <label className="form-label">Plan Name</label>
                <input className="text-input" placeholder="e.g. PUSH DAY" value={builderName} onChange={e=>setBuilderName(e.target.value)}/>
                <label className="form-label">Category Tag</label>
                <input className="text-input" placeholder="e.g. PPL, STRENGTH, CARDIO" value={builderTag} onChange={e=>setBuilderTag(e.target.value)}/>

                <div className="divider"/>
                <label className="form-label" style={{marginBottom:10}}>Exercises</label>

                {builderExs.map((ex,ei)=>(
                  <div key={ex.id} className="plan-builder-exercise">
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                      <input className="text-input" style={{margin:0,flex:1,marginRight:8}} value={ex.name} onChange={e=>setBuilderExs(prev=>prev.map(x=>x.id!==ex.id?x:{...x,name:e.target.value}))} placeholder="Exercise name"/>
                      <button className="btn btn-danger btn-xs" onClick={()=>setBuilderExs(prev=>prev.filter(x=>x.id!==ex.id))}>✕</button>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <span style={{fontSize:11,color:"#444",fontFamily:"Barlow Condensed",letterSpacing:1,textTransform:"uppercase"}}>Duration (optional)</span>
                      <input className="mini-input" style={{width:60}} placeholder="min" value={ex.time} onChange={e=>setBuilderExs(prev=>prev.map(x=>x.id!==ex.id?x:{...x,time:e.target.value}))}/>
                    </div>
                    <div className="plan-builder-header">
                      <span>Set</span><span>Reps</span><span>Wt (lbs)</span><span></span><span></span>
                    </div>
                    {ex.sets.map((set,si)=>(
                      <div key={set.id} className="plan-builder-row">
                        <span style={{fontSize:12,color:"#444",fontFamily:"Bebas Neue",textAlign:"center"}}>{si+1}</span>
                        <input className="mini-input" placeholder="reps" value={set.reps} onChange={e=>updBuilderSet(ex.id,set.id,"reps",e.target.value)}/>
                        <input className="mini-input" placeholder="lbs" value={set.weight} onChange={e=>updBuilderSet(ex.id,set.id,"weight",e.target.value)}/>
                        <span></span>
                        <button className="btn btn-danger btn-xs" style={{padding:"3px 6px"}} onClick={()=>setBuilderExs(prev=>prev.map(x=>x.id!==ex.id?x:{...x,sets:x.sets.filter(s=>s.id!==set.id)}))}>−</button>
                      </div>
                    ))}
                    <button className="btn btn-ghost btn-xs" style={{marginTop:8}} onClick={()=>setBuilderExs(prev=>prev.map(x=>x.id!==ex.id?x:{...x,sets:[...x.sets,{id:uid(),reps:"",weight:""}]}))}>+ Set</button>
                  </div>
                ))}

                <div style={{marginTop:12}}>
                  <label className="form-label">Add Exercise</label>
                  <input className="search-input" placeholder="Search & tap to add..." value={builderExSearch} onChange={e=>setBuilderExSearch(e.target.value)}/>
                  {builderExSearch && (
                    <div style={{marginTop:4,background:"#0d0d0d",border:"1px solid #1e1e1e",borderRadius:8,maxHeight:180,overflowY:"auto"}}>
                      {filteredBuilderEx.slice(0,10).map(ex=>(
                        <div key={ex} className="exercise-option" style={{fontSize:13}} onClick={()=>addBuilderEx(ex)}>{ex}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" style={{flex:1}} onClick={savePlan}>Save Plan</button>
                <button className="btn btn-ghost" onClick={()=>setShowPlanModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY DETAIL MODAL ── */}
        {showHistoryDetail && (
          <div className="modal-overlay" onClick={()=>setShowHistoryDetail(null)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <div className="modal-title">{showHistoryDetail.name}</div>
                  <div style={{fontSize:12,color:"#555",marginTop:2}}>{showHistoryDetail.date} · {showHistoryDetail.duration}</div>
                </div>
                <button className="btn btn-ghost btn-xs" onClick={()=>setShowHistoryDetail(null)}>✕</button>
              </div>
              <div className="modal-body">
                {showHistoryDetail.note && (
                  <div style={{background:"#0d0d0d",border:"1px solid #1e1e1e",borderRadius:8,padding:"12px 14px",marginBottom:16,fontSize:13,color:"#888",fontStyle:"italic"}}>
                    "{showHistoryDetail.note}"
                  </div>
                )}
                {showHistoryDetail.exercises?.map((ex,i)=>(
                  <div key={i} style={{marginBottom:14}}>
                    <div style={{fontFamily:"Barlow Condensed",fontSize:15,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",color:"#aaa",marginBottom:6}}>{ex.name}</div>
                    {ex.sets.map((s,j)=>(
                      <div key={j} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:s.completed?"#c8ff00":"#444",padding:"3px 0",borderBottom:"1px solid #111"}}>
                        <span>Set {j+1}</span>
                        <span>{s.weight&&s.weight!=="BW"?`${s.weight} lbs`:s.weight||"—"} × {s.reps||"—"}{s.cheat?` +${s.cheat}`:""}</span>
                        <span>{s.completed?"✓":"—"}</span>
                      </div>
                    ))}
                  </div>
                ))}
                <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #1a1a1a",fontFamily:"Bebas Neue",fontSize:20,color:"#c8ff00",letterSpacing:2}}>
                  Total: {showHistoryDetail.volume.toLocaleString()} lbs
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PR MODAL ── */}
        {showPrModal && (
          <div className="modal-overlay" onClick={()=>setShowPrModal(false)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">{editPrId?"EDIT PR GOAL":"NEW PR GOAL"}</div>
                <button className="btn btn-ghost btn-xs" onClick={()=>setShowPrModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                <label className="form-label">Exercise</label>
                <input className="text-input" placeholder="e.g. Back Squat" value={prExercise} onChange={e=>setPrExercise(e.target.value)}/>
                <label className="form-label">Target Weight (lbs)</label>
                <input className="text-input" placeholder="e.g. 225" type="number" inputMode="decimal" value={prWeight} onChange={e=>setPrWeight(e.target.value)}/>
                <label className="form-label">Target Date</label>
                <input className="text-input" type="date" value={prTargetDate} onChange={e=>setPrTargetDate(e.target.value)}/>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" style={{flex:1}} onClick={savePr}>Save Goal</button>
                <button className="btn btn-ghost" onClick={()=>setShowPrModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

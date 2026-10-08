'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion';
import {
  Building2,
  BookOpen,
  UtensilsCrossed,
  Home as HomeIcon,
  Monitor,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Trophy,
} from 'lucide-react';

export interface BuildingFloorPlan {
  floorNumber: number;
  title: string;
  facilities: string[];
}

export interface FacilityBuilding {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  floors: number;
  desc: string;
  stats: {
    activeIssues: number;
    resolvedToday: number;
    avgResponse: string;
  };
  floorPlans: BuildingFloorPlan[];
}

export const CAMPUS_FACILITIES_DATA: FacilityBuilding[] = [
  {
    id: 'a1',
    name: 'A1 Building',
    category: 'Academic',
    icon: Building2,
    floors: 4,
    desc: 'Four-level main academic block (Ground Floor + 3 floors) housing CS & IT departments, classrooms, faculty cabins, and server infrastructure.',
    stats: { activeIssues: 3, resolvedToday: 14, avgResponse: '1.8 hrs' },
    floorPlans: [
      { floorNumber: 3, title: 'Floor 3', facilities: ['IT Classrooms 301-305', 'IT Seminar Hall', 'Faculty Cabins', 'WiFi AP-04'] },
      { floorNumber: 2, title: 'Floor 2', facilities: ['CS Labs 201-204', 'Main Server Room', 'WiFi AP-02', 'Restrooms'] },
      { floorNumber: 1, title: 'Floor 1', facilities: ['CS Classrooms 101-105', 'Faculty Rooms', 'Restrooms'] },
      { floorNumber: 0, title: 'Ground Floor', facilities: ['Administrative Office', 'Main Auditorium', 'Restrooms'] },
    ],
  },
  {
    id: 'a2',
    name: 'A2 Building',
    category: 'Academic',
    icon: Building2,
    floors: 4,
    desc: 'Four-level academic block (Ground Floor + 3 floors) housing advanced computer labs, ENTC department, and seminar halls.',
    stats: { activeIssues: 2, resolvedToday: 9, avgResponse: '2.4 hrs' },
    floorPlans: [
      { floorNumber: 3, title: 'Floor 3', facilities: ['Project Rooms', 'Incubation Center', 'Research Lab'] },
      { floorNumber: 2, title: 'Floor 2', facilities: ['High Performance Computing Lab', 'Smart Classroom'] },
      { floorNumber: 1, title: 'Floor 1', facilities: ['ENTC Classrooms 101-104', 'Faculty Offices'] },
      { floorNumber: 0, title: 'Ground Floor', facilities: ['ENTC Labs', 'Electronics Workshop', 'Restrooms'] },
    ],
  },
  {
    id: 'a3',
    name: 'A3 Building',
    category: 'Academic',
    icon: Building2,
    floors: 6,
    desc: 'Six-level academic building (Ground Floor + 5 floors) with First Year engineering labs, AI & Data Science Center of Excellence, drawing halls, and lecture rooms.',
    stats: { activeIssues: 1, resolvedToday: 11, avgResponse: '1.2 hrs' },
    floorPlans: [
      { floorNumber: 5, title: 'Floor 5', facilities: ['Advanced Research Wing', 'Faculty Cabins', 'Seminar Room'] },
      { floorNumber: 4, title: 'Floor 4', facilities: ['AI & Data Science CoE', 'Conference Room', 'Research Labs'] },
      { floorNumber: 3, title: 'Floor 3', facilities: ['FE Computer Labs', 'CAD Studio', 'Faculty Rooms'] },
      { floorNumber: 2, title: 'Floor 2', facilities: ['Drawing Hall 1 & 2', 'Smart Lecture Hall'] },
      { floorNumber: 1, title: 'Floor 1', facilities: ['FE Classrooms FE-1 to FE-4', 'Restrooms'] },
      { floorNumber: 0, title: 'Ground Floor', facilities: ['Physics & Chemistry Labs', 'Basic Workshop'] },
    ],
  },
  {
    id: 'fi',
    name: 'FI Building',
    category: 'Academic & Workshop',
    icon: Monitor,
    floors: 5,
    desc: 'Five-floor specialized engineering building with Maker spaces, robotics laboratories, and project bays.',
    stats: { activeIssues: 0, resolvedToday: 6, avgResponse: '1.5 hrs' },
    floorPlans: [
      { floorNumber: 4, title: 'Floor 4', facilities: ['Advanced Robotics & AI Hardware Lab', 'Project Testing Wing'] },
      { floorNumber: 3, title: 'Floor 3', facilities: ['Embedded Systems & IoT Bay', 'Research Desk'] },
      { floorNumber: 2, title: 'Floor 2', facilities: ['Robotics & Embedded Lab', 'Maker Space'] },
      { floorNumber: 1, title: 'Floor 1', facilities: ['CAD/CAM Design Studio', 'Project Bay'] },
      { floorNumber: 0, title: 'Ground Floor', facilities: ['Central Workshop', 'CNC Machine Unit'] },
    ],
  },
  {
    id: 'central-library',
    name: 'Central Library',
    category: 'Facility',
    icon: BookOpen,
    floors: 1,
    desc: 'Standalone central repository housing 40,000+ reference volumes, textbook stacks, periodical section, and catalog desks.',
    stats: { activeIssues: 1, resolvedToday: 8, avgResponse: '0.9 hrs' },
    floorPlans: [
      { floorNumber: 0, title: 'Main Library Level', facilities: ['Book Stack Area', 'Periodical Section', 'Circulation Desk', 'Reference Repository'] },
    ],
  },
  {
    id: 'reading-hall',
    name: 'Reading Hall',
    category: 'Facility',
    icon: BookOpen,
    floors: 1,
    desc: 'Standalone dedicated quiet study facility for PICT students with high-capacity seating and individual study cubicles.',
    stats: { activeIssues: 0, resolvedToday: 12, avgResponse: '0.6 hrs' },
    floorPlans: [
      { floorNumber: 0, title: 'Main Reading Level', facilities: ['Silent Reading Area (300+ Capacity)', 'Individual Study Cubicles', 'Power Outlets'] },
    ],
  },
  {
    id: 'boys-hostel',
    name: 'Boys Hostel',
    category: 'Residence',
    icon: HomeIcon,
    floors: 5,
    desc: 'Five-floor residential block with 77 student rooms, common washroom wings, purified drinking water, and in-room WiFi.',
    stats: { activeIssues: 4, resolvedToday: 19, avgResponse: '2.1 hrs' },
    floorPlans: [
      { floorNumber: 4, title: 'Floor 4', facilities: ['Rooms 401-409', 'Solar Hot Water Unit', 'Restroom Wing'] },
      { floorNumber: 3, title: 'Floor 3', facilities: ['Rooms 301-317', 'WiFi Router AP-03', 'Restroom Wing'] },
      { floorNumber: 2, title: 'Floor 2', facilities: ['Rooms 201-217', 'Quiet Study Room', 'Restroom Wing'] },
      { floorNumber: 1, title: 'Floor 1', facilities: ['Rooms 101-117', 'Purified Water Filter', 'Restroom Wing'] },
      { floorNumber: 0, title: 'Ground Floor', facilities: ['Rector Office', 'Dispensary', 'Common Room'] },
    ],
  },
  {
    id: 'girls-hostel',
    name: 'Girls Hostel',
    category: 'Residence',
    icon: HomeIcon,
    floors: 7,
    desc: 'Seven-floor residential building with 280+ student rooms, study lounges, 24/7 security desk, and dedicated WiFi APs.',
    stats: { activeIssues: 3, resolvedToday: 25, avgResponse: '1.7 hrs' },
    floorPlans: [
      { floorNumber: 6, title: 'Floor 6', facilities: ['Rooms 601-640', 'Fitness & Recreation Room'] },
      { floorNumber: 5, title: 'Floor 5', facilities: ['Rooms 501-540', 'Solar Water Purifier'] },
      { floorNumber: 4, title: 'Floor 4', facilities: ['Rooms 401-440', 'Restroom Wing'] },
      { floorNumber: 3, title: 'Floor 3', facilities: ['Rooms 301-340', 'Study Lounge', 'WiFi AP-03'] },
      { floorNumber: 2, title: 'Floor 2', facilities: ['Rooms 201-240', 'Restroom Wing'] },
      { floorNumber: 1, title: 'Floor 1', facilities: ['Rooms 101-140', 'Purified Water Filter'] },
      { floorNumber: 0, title: 'Ground Floor', facilities: ['Warden Office', 'Lobby Desk', 'Visitors Waiting Area'] },
    ],
  },
  {
    id: 'mes',
    name: 'MES (Mess)',
    category: 'Dining',
    icon: UtensilsCrossed,
    floors: 4,
    desc: 'Four-floor food & dining complex. Floors 1 to 3 serve regular student meals, while Floor 4 is designated for student clubs and activity meetings.',
    stats: { activeIssues: 1, resolvedToday: 22, avgResponse: '1.0 hrs' },
    floorPlans: [
      { floorNumber: 4, title: 'Floor 4 (Student Clubs)', facilities: ['Student Club Activity Space', 'Club Meeting Rooms', 'Multi-Purpose Area'] },
      { floorNumber: 3, title: 'Floor 3', facilities: ['Senior Student Dining Hall', 'Beverage Counter'] },
      { floorNumber: 2, title: 'Floor 2', facilities: ['Student Dining Hall', 'Handwash & Sanitizer Station'] },
      { floorNumber: 1, title: 'Floor 1', facilities: ['Main Student Mess', 'Serving Counters 1-4'] },
    ],
  },
  {
    id: 'playground',
    name: 'Playground',
    category: 'Sports & Outdoor',
    icon: Trophy,
    floors: 0,
    desc: 'Standalone outdoor athletic ground for cricket, football, basketball, volleyball, and campus sports tournaments.',
    stats: { activeIssues: 0, resolvedToday: 5, avgResponse: '0.8 hrs' },
    floorPlans: [
      { floorNumber: 0, title: 'Outdoor Sports Facility', facilities: ['Football & Cricket Pitch', 'Basketball Court', 'Volleyball Court', 'Athletic Track'] },
    ],
  },
];

export function CampusExplorer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);

  const lastChangeTimeRef = useRef<number>(0);
  const [isRapid, setIsRapid] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const handleSelectBuilding = useCallback(
    (idx: number, shouldScroll = true) => {
      const now = performance.now();
      if (now - lastChangeTimeRef.current < 120) {
        setIsRapid(true);
      } else {
        setIsRapid(false);
      }
      lastChangeTimeRef.current = now;

      setActiveIndex(idx);
      setActiveFloorIndex(0);

      if (shouldScroll && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const containerTop = rect.top + scrollTop;
        const totalScrollableHeight = containerRef.current.offsetHeight - window.innerHeight;
        const targetY =
          containerTop + (idx / (CAMPUS_FACILITIES_DATA.length - 1)) * totalScrollableHeight;

        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: 'smooth',
        });
      }
    },
    []
  );

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const total = CAMPUS_FACILITIES_DATA.length;
    const clamped = Math.min(0.999, Math.max(0, latest));
    const idx = Math.min(total - 1, Math.floor(clamped * total));
    if (idx !== activeIndex) {
      handleSelectBuilding(idx, false);
    }
  });

  const building = CAMPUS_FACILITIES_DATA[activeIndex] || CAMPUS_FACILITIES_DATA[0];
  const Icon = building.icon;
  const selectedFloor =
    building.floorPlans[activeFloorIndex] ||
    building.floorPlans[0] || {
      floorNumber: 0,
      title: 'Main Level',
      facilities: [],
    };

  return (
    <div ref={containerRef} className="relative w-full h-[340vh]">
      <div className="sticky top-20 w-full min-h-[580px] sm:min-h-[560px] rounded-3xl border border-cyan-500/30 bg-slate-950/90 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 p-4 sm:p-6 lg:p-8 flex flex-col justify-between overflow-hidden">
        {/* Top Header & Interactive Index Navigation Bar */}
        <div className="w-full border-b border-slate-800/80 pb-4 mb-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                CAMPUS INFRASTRUCTURE EXPLORER
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              BUILDING <span className="text-cyan-400 font-bold">{activeIndex + 1}</span> OF {CAMPUS_FACILITIES_DATA.length} (PICT GIS v2.4)
            </span>
          </div>

          {/* Clickable Index Pills Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 custom-scrollbar">
            {CAMPUS_FACILITIES_DATA.map((b, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelectBuilding(idx, true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] scale-105'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Single Content Area with Sequential AnimatePresence mode="wait" */}
        <div className="relative w-full flex-1 min-h-[440px] flex flex-col justify-between">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={building.id}
              initial={shouldReduceMotion || isRapid ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion || isRapid ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: isRapid ? 0.01 : 0.12, ease: 'easeInOut' }}
              className="w-full h-full flex flex-col justify-between p-2 sm:p-4"
            >
              <div className="space-y-4 sm:space-y-6 text-left overflow-y-auto max-h-full pr-1 custom-scrollbar">
                {/* Building Header & Category Chip */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 grid place-items-center shadow-[0_0_15px_rgba(6,182,212,0.2)] shrink-0">
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                        {building.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                          {building.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          {building.floors > 0 ? `${building.floors} Levels` : 'Outdoor Facility'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Live Stat Chips */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono font-medium">
                      <Flame className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                      <span>{building.stats.activeIssues} Open</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-mono font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                      <span>{building.stats.resolvedToday} Resolved Today</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono font-medium">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                      <span>{building.stats.avgResponse} Avg</span>
                    </div>
                  </div>
                </div>

                {/* Building Description */}
                <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
                  {building.desc}
                </p>

                {/* Interactive Stacked Layered Building Visualizer */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                      BUILDING LAYER SCHEMATIC (Click floor to inspect)
                    </span>
                    <span className="text-xs text-cyan-400 font-mono font-medium">
                      {selectedFloor?.title || 'Main Level'}
                    </span>
                  </div>

                  {/* Stacked Floor Layer Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                    {building.floorPlans.map((fp, idx) => {
                      const isFloorActive = activeFloorIndex === idx;
                      return (
                        <button
                          key={fp.floorNumber}
                          type="button"
                          onClick={() => setActiveFloorIndex(idx)}
                          className={`w-full p-2.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between ${
                            isFloorActive
                              ? 'bg-cyan-500/15 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.25)] text-white'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`size-6 rounded-lg grid place-items-center text-xs font-mono font-bold shrink-0 ${
                                isFloorActive
                                  ? 'bg-cyan-400 text-slate-950'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              F{fp.floorNumber}
                            </div>
                            <span className="text-xs font-semibold">{fp.title}</span>
                          </div>

                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform ${
                              isFloorActive ? 'text-cyan-400 translate-x-0.5' : 'text-slate-500'
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Mapped Facilities Panel for Active Floor */}
                  {selectedFloor && (
                    <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-left space-y-2 mt-2">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                        <span>{selectedFloor.title} Infrastructure & Facilities</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {selectedFloor.facilities.map((fac, fIdx) => (
                          <span
                            key={fIdx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-cyan-500/20 text-xs text-slate-200 font-sans"
                          >
                            <span className="size-1.5 rounded-full bg-cyan-400" />
                            {fac}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Badges */}
              <div className="flex items-center gap-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 mt-2">
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span>Active Issue Tracking & GIS Mapped</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Shield, BookOpen, Layers, Award, CheckCircle, Code } from 'lucide-react';
import Card from '../components/common/Card';

export default function About() {
  const documents = [
    { title: '01 Feasibility Study', desc: 'Technical, operational, economic, legal, and schedule feasibility.' },
    { title: '02 Software Requirements Specification (SRS)', desc: 'Functional requirements (R1–R9) and performance constraints.' },
    { title: '03 Software Project Management Plan (SPMP)', desc: 'Iterative lifecycle, team organization, and risk mitigation.' },
    { title: '04 Cost & Staff Estimation', desc: 'Basic COCOMO and Putnam-Norden staffing curve.' },
    { title: '05 WBS & Gantt Chart', desc: 'Work breakdown structure and 14-week project schedule.' },
    { title: '06 PERT & CPM Network', desc: 'Critical path calculation and activity slack analysis.' },
    { title: '07 Data Flow Diagrams (DFDs)', desc: 'Level 0 Context, Level 1, Level 2, and Level 3 process decompositions.' },
    { title: '08 UML Structural Diagrams', desc: 'Use Case, Class, and Object diagrams.' },
    { title: '09 Sequence & Collaboration Diagrams', desc: 'Chronological message flows and object interactions.' },
    { title: '10 Software Testing', desc: 'White-box, black-box, unit, integration, acceptance, usability, and performance testing.' },
  ];

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Software Engineering Laboratory Project
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
          About AirGuard
        </h1>
        <p className="text-sm sm:text-base text-[#475569] max-w-2xl mx-auto leading-relaxed">
          AirGuard is an end-to-end intelligent air quality prediction and environmental intelligence SaaS platform built according to rigorous software engineering principles.
        </p>
      </div>

      {/* Project Vision */}
      <Card title="Academic Project Foundation & Mission" icon={BookOpen} padding="p-6">
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Air pollution represents one of the most critical environmental challenges worldwide. Traditional physical air monitoring stations are expensive to install and only report lagging indicator data. 
          </p>
          <p>
            AirGuard bridges this gap by combining meteorological variables (temperature and relative humidity) with atmospheric pollutant concentrations (PM2.5, PM10, NO₂, SO₂, CO, and O₃) to produce instant, high-precision predictions of the Air Quality Index (AQI) using trained regression algorithms.
          </p>
          <p>
            Developed as part of the Software Engineering Laboratory curriculum, AirGuard embodies full SDLC lifecycle execution—from feasibility assessment and formal SRS documentation to UML architectural modeling, machine learning benchmarking, and multi-user web implementation.
          </p>
        </div>
      </Card>

      {/* 10 Lab Experiments Grid */}
      <div className="space-y-4">
        <div className="border-b border-[#E2E8F0] pb-2">
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Documented Engineering Experiments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            10 formal engineering reports prepared and implemented in this application.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {documents.map((doc, idx) => (
            <div
              key={doc.title}
              className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-sm space-y-1 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">{doc.title}</h3>
              </div>
              <p className="text-xs text-slate-500 pl-7">{doc.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Stack Card */}
      <Card title="Technology Architecture" icon={Code} padding="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Frontend</span>
            <p className="font-bold text-slate-900 mt-1">React 18 + Vite</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Tailwind CSS + Recharts</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Backend API</span>
            <p className="font-bold text-slate-900 mt-1">FastAPI (Python)</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Pydantic v2 + JWT Auth</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Database</span>
            <p className="font-bold text-slate-900 mt-1">PostgreSQL</p>
            <p className="text-[11px] text-slate-500 mt-0.5">SQLAlchemy 2.0 ORM</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Machine Learning</span>
            <p className="font-bold text-slate-900 mt-1">Scikit-learn</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Random Forest (R² 0.9996)</p>
          </div>
        </div>
      </Card>
    </div>
  );
}


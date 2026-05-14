import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import { 
  Printer, Save, Plus, Trash2, ChevronLeft, ChevronRight, 
  Settings as SettingsIcon, Layout, FileText, User, 
  Briefcase, GraduationCap, Code2, Palette, Type
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  period: string;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  location: string;
  period: string;
  description: string;
}

interface ResumeData {
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    address: string;
    summary: string;
  };
  experience: Experience[];
  education: Education[];
  skills: string[];
}

interface ResumeConfig {
  template: 'modern' | 'executive' | 'minimalist';
  primaryColor: string;
  fontSize: number;
  lineHeight: number;
  boldLines: boolean;
}

export const CreateResume = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'experience' | 'education' | 'skills' | 'styles'>('info');

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: 'TANIA KHATUN',
      jobTitle: 'Customer-focused Retail Sales Professional',
      email: 't.khatun@sample.bd',
      phone: '+880 1234 567890',
      address: 'Khulna, 9000 Bangladesh',
      summary: 'Customer-focused Retail Sales Professional with solid understanding of retail dynamics, marketing and customer service. Offering 5 years of experience providing quality product recommendations and solutions to meet customer needs and exceed expectations. Demonstrated record of exceeding revenue targets by leveraging communication skills and sales expertise.',
    },
    experience: [
      {
        id: '1',
        company: 'Retail Sales Associate, Easy',
        position: 'Khulna, Bangladesh',
        location: '',
        period: '02/2017 - Current',
        description: 'Increased monthly sales 10% by effectively upselling and cross-selling products to maximise profitability.\nPrevented store losses by leveraging awareness, attention to detail and integrity to identify and investigate concerns.\nProcessed payments and maintained accurate drawers to meet financial targets.',
      },
      {
        id: '2',
        company: 'Barista, Coffee Bank',
        position: 'Khulna, Bangladesh',
        location: '',
        period: '03/2015 - 01/2017',
        description: 'Upsold seasonal drinks and pastries, boosting average store sales by 106,000 BDT weekly.\nManaged morning rush of over 300 customers daily with efficient, levelheaded customer service.\nTrained entire staff of 15 baristas in new smoothie program offerings and procedures.\nDeveloped creative and appealing latte art techniques and instructed coworkers in method.',
      }
    ],
    education: [
      {
        id: '1',
        school: 'Bachelor of Social Science (BSS), Sociology, BSS (Hons.)',
        degree: '2019',
        location: 'Khulna University',
        period: 'CGPA 3.28',
        description: '',
      }
    ],
    skills: [
      'Cash register operation', 'POS system operation', 'Sales expertise', 'Teamwork',
      'Inventory management', 'Accurate money handling', 'Documentation and recordkeeping', 'Retail merchandising expertise'
    ]
  });

  const [config, setConfig] = useState<ResumeConfig>({
    template: 'modern',
    primaryColor: '#4f46e5',
    fontSize: 14,
    lineHeight: 1.5,
    boldLines: true
  });

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'resumes'), {
        userId: user.uid,
        ...resumeData,
        config,
        createdAt: new Date().toISOString()
      });
      alert('Resume saved successfully!');
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Failed to save resume.');
    } finally {
      setLoading(false);
    }
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      location: '',
      period: '',
      description: '',
    };
    setResumeData({ ...resumeData, experience: [...resumeData.experience, newExp] });
  };

  const removeExperience = (id: string) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter(exp => exp.id !== id)
    });
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      location: '',
      period: '',
      description: '',
    };
    setResumeData({ ...resumeData, education: [...resumeData.education, newEdu] });
  };

  const removeEducation = (id: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter(edu => edu.id !== id)
    });
  };

  const addSkill = () => {
    setResumeData({ ...resumeData, skills: [...resumeData.skills, 'New Skill'] });
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...resumeData.skills];
    newSkills[index] = value;
    setResumeData({ ...resumeData, skills: newSkills });
  };

  const removeSkill = (index: number) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter((_, i) => i !== index)
    });
  };

  // Rendering Templates
  const renderModern = () => (
    <div className="flex flex-col h-full bg-white text-slate-800" style={{ fontSize: `${config.fontSize}px`, lineHeight: config.lineHeight }}>
      {/* Header */}
      <div className="p-8 border-b-2" style={{ borderColor: config.boldLines ? config.primaryColor : '#e2e8f0' }}>
        <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: config.primaryColor }}>{resumeData.personalInfo.fullName}</h1>
        <p className="text-xl font-medium mt-1 text-slate-600">{resumeData.personalInfo.jobTitle}</p>
        
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
          <span className="flex items-center gap-1"><FileText size={14} /> {resumeData.personalInfo.email}</span>
          <span className="flex items-center gap-1"><User size={14} /> {resumeData.personalInfo.phone}</span>
          <span className="flex items-center gap-1"><Layout size={14} /> {resumeData.personalInfo.address}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Info */}
        <div className="w-1/3 p-8 bg-slate-50 overflow-y-auto">
          <section className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: config.primaryColor }}>Skills</h3>
            <ul className="space-y-2">
              {resumeData.skills.map((skill, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.primaryColor }}></div>
                  {skill}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: config.primaryColor }}>Summary</h3>
            <p className="text-slate-600 leading-relaxed italic">{resumeData.personalInfo.summary}</p>
          </section>
        </div>

        {/* Right Side - Experience & Education */}
        <div className="flex-1 p-8 overflow-y-auto bg-white">
          <section className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-b pb-2 flex items-center gap-2" style={{ color: config.primaryColor, borderColor: config.boldLines ? config.primaryColor : '#e2e8f0' }}>
              <Briefcase size={16} /> Experience
            </h3>
            <div className="space-y-8">
              {resumeData.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-slate-900">{exp.company}</h4>
                    <span className="text-xs font-medium text-slate-400">{exp.period}</span>
                  </div>
                  <p className="text-sm font-semibold mb-2" style={{ color: config.primaryColor }}>{exp.position}</p>
                  <p className="text-slate-600 whitespace-pre-line text-sm">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-b pb-2 flex items-center gap-2" style={{ color: config.primaryColor, borderColor: config.boldLines ? config.primaryColor : '#e2e8f0' }}>
              <GraduationCap size={16} /> Education
            </h3>
            <div className="space-y-6">
              {resumeData.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-slate-900">{edu.school}</h4>
                    <span className="text-xs font-medium text-slate-400">{edu.period}</span>
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: config.primaryColor }}>{edu.degree}</p>
                  <p className="text-xs text-slate-400">{edu.location}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  const renderExecutive = () => (
    <div className="flex flex-col h-full bg-white text-slate-800 p-12 overflow-y-auto" style={{ fontSize: `${config.fontSize}px`, lineHeight: config.lineHeight }}>
      <header className="text-center mb-10">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-2" style={{ color: config.primaryColor }}>{resumeData.personalInfo.fullName}</h1>
        <p className="text-lg font-bold text-slate-500 uppercase tracking-widest mb-4">{resumeData.personalInfo.jobTitle}</p>
        <div className="h-1 w-24 mx-auto mb-6" style={{ backgroundColor: config.primaryColor }}></div>
        <div className="flex justify-center flex-wrap gap-6 text-sm">
          <span>{resumeData.personalInfo.email}</span>
          <span>{resumeData.personalInfo.phone}</span>
          <span>{resumeData.personalInfo.address}</span>
        </div>
      </header>

      <div className="space-y-10">
        <section>
          <h3 className="text-lg font-black uppercase border-b-2 mb-4 pb-1" style={{ color: config.primaryColor, borderColor: config.boldLines ? config.primaryColor : '#e2e8f0' }}>Summary</h3>
          <p className="text-slate-600 leading-relaxed">{resumeData.personalInfo.summary}</p>
        </section>

        <section>
          <h3 className="text-lg font-black uppercase border-b-2 mb-6 pb-1" style={{ color: config.primaryColor, borderColor: config.boldLines ? config.primaryColor : '#e2e8f0' }}>Professional Experience</h3>
          <div className="space-y-8">
            {resumeData.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{exp.company}</h4>
                    <p className="font-bold italic text-slate-500">{exp.position}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold" style={{ color: config.primaryColor }}>{exp.period}</span>
                  </div>
                </div>
                <p className="text-slate-600 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-black uppercase border-b-2 mb-4 pb-1" style={{ color: config.primaryColor, borderColor: config.boldLines ? config.primaryColor : '#e2e8f0' }}>Education</h3>
          <div className="space-y-6">
            {resumeData.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold">{edu.school}</h4>
                  <p className="italic text-slate-500">{edu.degree}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold">{edu.period}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-black uppercase border-b-2 mb-4 pb-1" style={{ color: config.primaryColor, borderColor: config.boldLines ? config.primaryColor : '#e2e8f0' }}>Core Competencies</h3>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {resumeData.skills.map((skill, i) => (
              <div key={i} className="flex items-center gap-2 font-semibold text-slate-600">
                <span style={{ color: config.primaryColor }}>■</span> {skill}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  const renderMinimalist = () => (
    <div className="flex flex-col h-full bg-white text-slate-800 p-12 overflow-y-auto font-serif" style={{ fontSize: `${config.fontSize}px`, lineHeight: config.lineHeight }}>
      <header className="mb-12 border-l-4 pl-6" style={{ borderColor: config.primaryColor }}>
        <h1 className="text-4xl font-light tracking-tight mb-1">{resumeData.personalInfo.fullName}</h1>
        <p className="text-slate-400 italic mb-4">{resumeData.personalInfo.jobTitle}</p>
        <div className="text-xs text-slate-400 space-y-1">
          <p>{resumeData.personalInfo.email} • {resumeData.personalInfo.phone}</p>
          <p>{resumeData.personalInfo.address}</p>
        </div>
      </header>

      <section className="mb-10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-4">Summary</h3>
        <p className="text-slate-600 leading-relaxed font-sans text-sm">{resumeData.personalInfo.summary}</p>
      </section>

      <section className="mb-10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-6">Experience</h3>
        <div className="space-y-8">
          {resumeData.experience.map((exp) => (
            <div key={exp.id} className="grid grid-cols-[1fr_3fr] gap-6">
              <div className="text-xs font-medium text-slate-400 font-sans">{exp.period}</div>
              <div>
                <h4 className="font-bold text-slate-900">{exp.company}</h4>
                <p className="text-xs italic text-slate-500 mb-2">{exp.position}</p>
                <div className="text-slate-600 whitespace-pre-line text-sm font-sans">{exp.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-100">
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-6">Education</h3>
          <div className="space-y-6">
            {resumeData.education.map((edu) => (
              <div key={edu.id}>
                <h4 className="font-bold text-slate-900">{edu.school}</h4>
                <p className="text-xs italic text-slate-500 mb-1">{edu.degree}</p>
                <div className="text-[10px] text-slate-400 font-sans">{edu.period}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-6">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill, i) => (
              <span key={i} className="text-xs bg-slate-50 px-2 py-1 rounded text-slate-600 font-sans">
                {skill}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Resume Builder</h1>
          <p className="text-slate-500 mt-1">Create a professional resume with ease.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer size={18} /> Print / PDF
          </Button>
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            <Save size={18} /> {loading ? 'Saving...' : 'Save Draft'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start h-[calc(100vh-200px)]">
        {/* Editor Side */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden print:hidden">
          <div className="flex border-b border-slate-200 sticky top-0 bg-white z-10 overflow-x-auto no-scrollbar">
            {[
              { id: 'info', icon: User, label: 'Profile' },
              { id: 'experience', icon: Briefcase, label: 'Experience' },
              { id: 'education', icon: GraduationCap, label: 'Education' },
              { id: 'skills', icon: Code2, label: 'Skills' },
              { id: 'styles', icon: Palette, label: 'Style' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-all min-w-[100px] justify-center ${
                  activeTab === tab.id 
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
            <AnimatePresence mode="wait">
              {activeTab === 'info' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  key="info"
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 px-2">Personal Information</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Full Name</label>
                      <input 
                        className="w-full bg-slate-50 border-transparent rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 text-sm"
                        value={resumeData.personalInfo.fullName}
                        onChange={(e) => setResumeData({ ...resumeData, personalInfo: { ...resumeData.personalInfo, fullName: e.target.value }})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Job Title</label>
                      <input 
                        className="w-full bg-slate-50 border-transparent rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 text-sm"
                        value={resumeData.personalInfo.jobTitle}
                        onChange={(e) => setResumeData({ ...resumeData, personalInfo: { ...resumeData.personalInfo, jobTitle: e.target.value }})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Email</label>
                      <input 
                        className="w-full bg-slate-50 border-transparent rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 text-sm"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => setResumeData({ ...resumeData, personalInfo: { ...resumeData.personalInfo, email: e.target.value }})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Phone</label>
                      <input 
                        className="w-full bg-slate-50 border-transparent rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 text-sm"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => setResumeData({ ...resumeData, personalInfo: { ...resumeData.personalInfo, phone: e.target.value }})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Address</label>
                    <input 
                      className="w-full bg-slate-50 border-transparent rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 text-sm"
                      value={resumeData.personalInfo.address}
                      onChange={(e) => setResumeData({ ...resumeData, personalInfo: { ...resumeData.personalInfo, address: e.target.value }})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Professional Summary</label>
                    <textarea 
                      className="w-full bg-slate-50 border-transparent rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 text-sm min-h-[150px] resize-none"
                      value={resumeData.personalInfo.summary}
                      onChange={(e) => setResumeData({ ...resumeData, personalInfo: { ...resumeData.personalInfo, summary: e.target.value }})}
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'experience' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  key="experience"
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Work Experience</div>
                    <Button variant="outline" size="sm" onClick={addExperience} className="gap-1 h-8">
                      <Plus size={14} /> Add Work
                    </Button>
                  </div>
                  <div className="space-y-8">
                    {resumeData.experience.map((exp, index) => (
                      <div key={exp.id} className="p-4 bg-slate-50 rounded-xl space-y-4 relative group">
                        <button 
                          onClick={() => removeExperience(exp.id)}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-white shadow-md rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity border border-red-50"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Company</label>
                            <input 
                              className="w-full bg-white border-slate-200 rounded p-1.5 text-sm focus:ring-1 focus:ring-indigo-500"
                              value={exp.company}
                              onChange={(e) => {
                                const newExp = [...resumeData.experience];
                                newExp[index].company = e.target.value;
                                setResumeData({ ...resumeData, experience: newExp });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Position</label>
                            <input 
                              className="w-full bg-white border-slate-200 rounded p-1.5 text-sm focus:ring-1 focus:ring-indigo-500"
                              value={exp.position}
                              onChange={(e) => {
                                const newExp = [...resumeData.experience];
                                newExp[index].position = e.target.value;
                                setResumeData({ ...resumeData, experience: newExp });
                              }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Period</label>
                            <input 
                              className="w-full bg-white border-slate-200 rounded p-1.5 text-sm focus:ring-1 focus:ring-indigo-500"
                              value={exp.period}
                              placeholder="e.g. 02/2017 - Present"
                              onChange={(e) => {
                                const newExp = [...resumeData.experience];
                                newExp[index].period = e.target.value;
                                setResumeData({ ...resumeData, experience: newExp });
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                          <textarea 
                            className="w-full bg-white border-slate-200 rounded p-2 text-sm focus:ring-1 focus:ring-indigo-500 min-h-[100px] resize-none"
                            value={exp.description}
                            onChange={(e) => {
                              const newExp = [...resumeData.experience];
                              newExp[index].description = e.target.value;
                              setResumeData({ ...resumeData, experience: newExp });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'education' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  key="education"
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Education Details</div>
                    <Button variant="outline" size="sm" onClick={addEducation} className="gap-1 h-8">
                      <Plus size={14} /> Add Education
                    </Button>
                  </div>
                  <div className="space-y-8">
                    {resumeData.education.map((edu, index) => (
                      <div key={edu.id} className="p-4 bg-slate-50 rounded-xl space-y-4 relative group">
                        <button 
                          onClick={() => removeEducation(edu.id)}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-white shadow-md rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity border border-red-50"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">School / University</label>
                            <input 
                              className="w-full bg-white border-slate-200 rounded p-1.5 text-sm focus:ring-1 focus:ring-indigo-500"
                              value={edu.school}
                              onChange={(e) => {
                                const newEdu = [...resumeData.education];
                                newEdu[index].school = e.target.value;
                                setResumeData({ ...resumeData, education: newEdu });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Degree</label>
                            <input 
                              className="w-full bg-white border-slate-200 rounded p-1.5 text-sm focus:ring-1 focus:ring-indigo-500"
                              value={edu.degree}
                              onChange={(e) => {
                                const newEdu = [...resumeData.education];
                                newEdu[index].degree = e.target.value;
                                setResumeData({ ...resumeData, education: newEdu });
                              }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Location</label>
                            <input 
                              className="w-full bg-white border-slate-200 rounded p-1.5 text-sm focus:ring-1 focus:ring-indigo-500"
                              value={edu.location}
                              onChange={(e) => {
                                const newEdu = [...resumeData.education];
                                newEdu[index].location = e.target.value;
                                setResumeData({ ...resumeData, education: newEdu });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Period / Grade</label>
                            <input 
                              className="w-full bg-white border-slate-200 rounded p-1.5 text-sm focus:ring-1 focus:ring-indigo-500"
                              value={edu.period}
                              onChange={(e) => {
                                const newEdu = [...resumeData.education];
                                newEdu[index].period = e.target.value;
                                setResumeData({ ...resumeData, education: newEdu });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'skills' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  key="skills"
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Skills & Competencies</div>
                    <Button variant="outline" size="sm" onClick={addSkill} className="gap-1 h-8">
                      <Plus size={14} /> Add Skill
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {resumeData.skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2 group">
                        <input 
                          className="flex-1 bg-slate-50 border-transparent rounded p-2 text-sm focus:ring-1 focus:ring-indigo-500"
                          value={skill}
                          onChange={(e) => updateSkill(index, e.target.value)}
                        />
                        <button 
                          onClick={() => removeSkill(index)}
                          className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'styles' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  key="styles"
                  className="space-y-8"
                >
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                       <Layout size={14} /> Resume Template
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'modern', label: 'Modern', desc: 'Sleek Sidebar' },
                        { id: 'executive', label: 'Executive', desc: 'Bold Header' },
                        { id: 'minimalist', label: 'Minimal', desc: 'Serif Elegance' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setConfig({ ...config, template: t.id as any })}
                          className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                            config.template === t.id 
                              ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-500/20' 
                              : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className={`w-full aspect-[3/4] mb-2 rounded shadow-sm border ${config.template === t.id ? 'border-indigo-200' : 'border-slate-100'}`}></div>
                          <span className="text-xs font-bold text-slate-800">{t.label}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                       <Palette size={14} /> Color Accent
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {[
                        '#4f46e5', '#10b981', '#f59e0b', '#ef4444', 
                        '#0ea5e9', '#d946ef', '#27272a', '#1e40af'
                      ].map((color) => (
                        <button
                          key={color}
                          onClick={() => setConfig({ ...config, primaryColor: color })}
                          className={`w-10 h-10 rounded-full border-2 transition-all block ${
                            config.primaryColor === color ? 'ring-2 ring-offset-2 ring-slate-300 scale-110' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-2">
                       <Type size={14} /> Typography & Spacing
                    </div>
                    <div className="space-y-4 px-1">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold text-slate-600">
                          <span>Font Size</span>
                          <span>{config.fontSize}px</span>
                        </div>
                        <input 
                          type="range" min="10" max="24" className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          value={config.fontSize}
                          onChange={(e) => setConfig({ ...config, fontSize: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold text-slate-600">
                          <span>Line Spacing</span>
                          <span>{config.lineHeight}</span>
                        </div>
                        <input 
                          type="range" min="1" max="2" step="0.1" className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          value={config.lineHeight}
                          onChange={(e) => setConfig({ ...config, lineHeight: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-xs font-bold text-slate-700">Accent Lines</span>
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={config.boldLines}
                          onChange={(e) => setConfig({ ...config, boldLines: e.target.checked })}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Preview Side */}
        <div className="bg-slate-200 rounded-xl overflow-hidden shadow-inner h-full flex flex-col items-center justify-start p-4 lg:p-8 no-scrollbar scroll-smooth overflow-y-auto print:bg-white print:p-0 print:block print:static">
              <div className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] transition-all duration-300 origin-top print:shadow-none print:max-w-none print:min-h-0 print:w-full print:h-auto print:mx-0 print:p-0">
                {config.template === 'modern' && renderModern()}
                {config.template === 'executive' && renderExecutive()}
                {config.template === 'minimalist' && renderMinimalist()}
              </div>
            </div>
          </div>
        </div>
      );
    };

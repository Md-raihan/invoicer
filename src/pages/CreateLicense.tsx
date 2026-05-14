import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Printer, Save, Upload, User, CreditCard, MapPin, Calendar, Hash } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const CreateLicense = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [licenseData, setLicenseData] = useState({
    surname: 'DOE',
    firstNames: 'JOHN MICHAEL',
    dob: '15.05.1985',
    placeOfBirth: 'LONDON',
    issueDate: '12.04.2023',
    expiryDate: '11.04.2033',
    authority: 'DVLA',
    driverNumber: 'DOE--855155JM9IJ88',
    address: '10 DOWNING STREET\nWESTMINSTER\nLONDON SW1A 2AA',
    photo: '',
    signature: 'John Doe',
    categories: [
      { code: 'AM', from: '12.04.23', to: '11.04.33', codes: '01' },
      { code: 'A', from: '12.04.23', to: '11.04.33', codes: '' },
      { code: 'B1', from: '12.04.23', to: '11.04.33', codes: '' },
      { code: 'B', from: '12.04.23', to: '11.04.33', codes: '' },
      { code: 'f', from: '12.04.23', to: '11.04.33', codes: '' },
      { code: 'k', from: '12.04.23', to: '11.04.33', codes: '' },
      { code: 'l', from: '12.04.23', to: '11.04.33', codes: '' },
      { code: 'n', from: '12.04.23', to: '11.04.33', codes: '' },
      { code: 'p', from: '12.04.23', to: '11.04.33', codes: '' },
      { code: 'q', from: '12.04.23', to: '11.04.33', codes: '' },
    ]
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLicenseData({ ...licenseData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'id_cards'), {
        userId: user.uid,
        ...licenseData,
        type: 'UK_DRIVING_LICENSE',
        createdAt: new Date().toISOString()
      });
      alert('Identity card saved successfully!');
    } catch (error) {
      console.error('Error saving identity card:', error);
      alert('Failed to save identity card.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">UK Identity Builder</h1>
          <p className="text-slate-500 mt-1">Create professional identification mockups.</p>
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
          <div className="p-6 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <CreditCard size={16} /> License Details
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">1. Surname</label>
                <input 
                  className="w-full bg-slate-50 border-transparent rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 text-sm font-bold uppercase"
                  value={licenseData.surname}
                  onChange={(e) => setLicenseData({ ...licenseData, surname: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">2. First Names</label>
                <input 
                  className="w-full bg-slate-50 border-transparent rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 text-sm font-bold uppercase"
                  value={licenseData.firstNames}
                  onChange={(e) => setLicenseData({ ...licenseData, firstNames: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">3. Date & Place of Birth</label>
                <div className="flex gap-2">
                  <input 
                    placeholder="15.05.1985"
                    className="flex-1 bg-slate-50 border-transparent rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={licenseData.dob}
                    onChange={(e) => setLicenseData({ ...licenseData, dob: e.target.value })}
                  />
                  <input 
                    placeholder="LONDON"
                    className="flex-1 bg-slate-50 border-transparent rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 text-sm uppercase"
                    value={licenseData.placeOfBirth}
                    onChange={(e) => setLicenseData({ ...licenseData, placeOfBirth: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">5. Driver Number</label>
                <input 
                  className="w-full bg-slate-50 border-transparent rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 text-sm font-mono uppercase"
                  value={licenseData.driverNumber}
                  onChange={(e) => setLicenseData({ ...licenseData, driverNumber: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">4a. Issue Date</label>
                <input 
                  className="w-full bg-slate-50 border-transparent rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={licenseData.issueDate}
                  onChange={(e) => setLicenseData({ ...licenseData, issueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">4b. Expiry Date</label>
                <input 
                  className="w-full bg-slate-50 border-transparent rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={licenseData.expiryDate}
                  onChange={(e) => setLicenseData({ ...licenseData, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">8. Address</label>
              <textarea 
                className="w-full bg-slate-50 border-transparent rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 text-sm min-h-[100px] uppercase resize-none font-sans"
                value={licenseData.address}
                onChange={(e) => setLicenseData({ ...licenseData, address: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Photo Upload</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden"
                >
                  {licenseData.photo ? (
                    <img src={licenseData.photo} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <>
                      <Upload className="text-slate-400 mb-2" size={24} />
                      <span className="text-[10px] font-bold text-slate-500">UPLOAD PHOTO</span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">9. Signature</label>
                <input 
                  className="w-full bg-slate-50 border-transparent rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 text-sm italic font-serif"
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                  value={licenseData.signature}
                  onChange={(e) => setLicenseData({ ...licenseData, signature: e.target.value })}
                />
                <p className="text-[10px] text-slate-400 italic">This will appear in a handwriting font on the card.</p>
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-slate-100">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Back Side Categories</h3>
               <div className="space-y-3">
                  {licenseData.categories.map((cat, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 items-center">
                       <span className="text-xs font-bold text-slate-400 w-8">{cat.code}</span>
                       <input 
                         className="bg-slate-50 border-transparent rounded p-1 text-[10px] text-center"
                         value={cat.from}
                         onChange={(e) => {
                            const newCats = [...licenseData.categories];
                            newCats[index].from = e.target.value;
                            setLicenseData({ ...licenseData, categories: newCats });
                         }}
                       />
                       <input 
                         className="bg-slate-50 border-transparent rounded p-1 text-[10px] text-center"
                         value={cat.to}
                         onChange={(e) => {
                            const newCats = [...licenseData.categories];
                            newCats[index].to = e.target.value;
                            setLicenseData({ ...licenseData, categories: newCats });
                         }}
                       />
                       <input 
                         className="bg-slate-50 border-transparent rounded p-1 text-[10px]"
                         placeholder="Codes"
                         value={cat.codes}
                         onChange={(e) => {
                            const newCats = [...licenseData.categories];
                            newCats[index].codes = e.target.value;
                            setLicenseData({ ...licenseData, categories: newCats });
                         }}
                       />
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* Preview Side */}
        <div className="bg-slate-200 rounded-xl overflow-hidden shadow-inner h-full flex flex-col items-center justify-center p-4 lg:p-8 no-scrollbar scroll-smooth overflow-y-auto print:bg-white print:p-0 print:block print:static">
          <div className="flex gap-4 mb-6 print:hidden">
            <Button 
              variant={activeSide === 'front' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveSide('front')}
              className="rounded-full px-6"
            >
              Front Side
            </Button>
            <Button 
              variant={activeSide === 'back' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveSide('back')}
              className="rounded-full px-6"
            >
              Back Side
            </Button>
          </div>

          <motion.div 
            key={activeSide}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative print:shadow-none w-[500px] h-[315px] bg-[#fdf2f8] rounded-[20px] shadow-2xl overflow-hidden border border-slate-300 font-sans select-none flex flex-col" 
            id={activeSide === 'front' ? 'license-card-front' : 'license-card-back'}
          >
            {activeSide === 'front' ? (
              <>
                {/* Background Pattern - Security simulation */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ec4899 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }}></div>
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ec4899 0, #ec4899 1px, transparent 0, transparent 50%)', backgroundSize: '15px 15px' }}></div>
                
                {/* Top Bar */}
                <div className="px-6 py-4 flex justify-between items-start z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-700 rounded flex flex-col items-center justify-center text-white font-bold leading-none border-2 border-white/50 shadow-sm relative overflow-hidden">
                      <span className="text-[8px] mb-0.5 z-10">UNITED KINGDOM</span>
                      <span className="text-2xl mt-[-4px] z-10">UK</span>
                      {/* EU Stars Circle */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <div className="w-8 h-8 rounded-full border border-dashed border-yellow-400 rotate-45"></div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-pink-600 font-black text-xl leading-none tracking-tighter">DRIVING LICENCE</h2>
                      <p className="text-[7px] text-pink-400 font-bold mt-1 uppercase">European Communities Model</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="w-10 h-10 bg-slate-300 rounded-full bg-opacity-20 flex items-center justify-center border border-pink-200 relative overflow-hidden">
                      <div className="w-6 h-6 rounded-full border-2 border-pink-500/30"></div>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500/10 to-transparent"></div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 px-6 pb-6 flex gap-6 z-10">
                  {/* Photo Area */}
                  <div className="w-[120px] flex flex-col gap-2">
                    <div className="w-[120px] h-[150px] bg-white border border-slate-300 rounded-sm shadow-inner relative overflow-hidden grayscale contrast-125 brightness-110">
                      {licenseData.photo ? (
                        <img src={licenseData.photo} className="w-full h-full object-cover" alt="Photo" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 italic text-[10px] text-slate-400">PHOTO HERE</div>
                      )}
                      {/* Hologram-like overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none"></div>
                      {/* Security markings on photo */}
                      <div className="absolute bottom-2 right-2 w-6 h-6 border border-white/50 rounded-full opacity-20"></div>
                    </div>
                    <div className="text-[6px] text-slate-400 uppercase leading-[1.2] tracking-tighter font-mono bg-white/30 px-1 py-0.5 rounded">
                      DRIVER NO: {licenseData.driverNumber}
                    </div>
                  </div>

                  {/* Data Area */}
                  <div className="flex-1 grid grid-cols-1 gap-y-0.5 text-[9px] font-bold text-slate-700 leading-[1.1] relative">
                    <div className="flex gap-2">
                      <span className="text-pink-600 w-3">1.</span>
                      <span className="uppercase">{licenseData.surname}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-pink-600 w-3">2.</span>
                      <span className="uppercase">{licenseData.firstNames}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-pink-600 w-3">3.</span>
                      <span className="uppercase">{licenseData.dob} {licenseData.placeOfBirth}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-pink-600 w-3">4a.</span>
                      <span>{licenseData.issueDate}</span>
                      <span className="text-pink-600 ml-4 w-3">4b.</span>
                      <span>{licenseData.expiryDate}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-pink-600 w-3">4c.</span>
                      <span className="uppercase">{licenseData.authority}</span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-pink-600 w-3">5.</span>
                      <span className="text-[11px] font-mono tracking-wider">{licenseData.driverNumber}</span>
                    </div>
                    
                    {/* Signature */}
                    <div className="relative mt-2 h-10 flex items-center">
                      <span className="text-pink-600 w-3 self-start mt-1">7.</span>
                      <div className="flex-1 bg-white/50 border border-slate-200/50 h-8 rounded-sm overflow-hidden flex items-center px-4">
                        <span 
                          className="text-2xl opacity-80" 
                          style={{ fontFamily: "'Dancing Script', cursive" }}
                        >
                          {licenseData.signature}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <span className="text-pink-600 w-3">8.</span>
                      <span className="uppercase whitespace-pre-line text-[8px] leading-[1.2]">{licenseData.address}</span>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <span className="text-pink-600 w-3">9.</span>
                      <span className="uppercase text-[11px]">AM / A / B1 / B / FKLRNP</span>
                    </div>

                    {/* Ghost Image Simulation */}
                    <div className="absolute bottom-4 right-0 w-16 h-20 grayscale opacity-20 contrast-150 brightness-150 rotate-6 mix-blend-multiply pointer-events-none border border-slate-400/20 overflow-hidden">
                       {licenseData.photo && <img src={licenseData.photo} className="w-full h-full object-cover" />}
                    </div>
                  </div>
                </div>

                {/* Bottom Security Mark */}
                <div className="absolute bottom-2 left-6 flex items-center gap-4 opacity-30">
                   <div className="text-[7px] font-bold text-pink-700">UK Gov Security Number: 00293021</div>
                </div>
                <div className="absolute bottom-2 right-4 flex items-center gap-1 opacity-20">
                   <CreditCard size={20} className="text-pink-600" />
                   <div className="text-[6px] font-mono text-pink-700 font-black">SECURITY VALIDATED</div>
                </div>
              </>
            ) : (
              <>
                {/* Back Side Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #ec4899 0, #ec4899 1px, transparent 0, transparent 20px)', backgroundSize: '100% 20px' }}></div>
                
                {/* Back Side Grid */}
                <div className="mx-6 my-4 border border-slate-300 bg-white/50 flex-1 flex flex-col z-10">
                   <div className="grid grid-cols-5 bg-pink-100 border-b border-slate-300 text-[8px] font-bold text-pink-700 text-center py-0.5">
                      <div className="col-span-1">9.</div>
                      <div className="col-span-1">10.</div>
                      <div className="col-span-1">11.</div>
                      <div className="col-span-2">12.</div>
                   </div>
                   <div className="flex-1 overflow-hidden grid grid-cols-5 text-[7px] text-slate-700">
                      {licenseData.categories.map((cat, i) => (
                        <React.Fragment key={i}>
                          <div className="border-r border-b border-slate-200 px-2 flex items-center font-black bg-pink-50/30">{cat.code}</div>
                          <div className="border-r border-b border-slate-200 px-1 flex items-center justify-center font-mono">{cat.from}</div>
                          <div className="border-r border-b border-slate-200 px-1 flex items-center justify-center font-mono">{cat.to}</div>
                          <div className="col-span-2 border-b border-slate-200 px-1 flex items-center font-mono overflow-hidden truncate">{cat.codes}</div>
                        </React.Fragment>
                      ))}
                   </div>
                </div>

                {/* Back Side Footer */}
                <div className="px-6 pb-4 flex justify-between items-end z-10 text-[6px] text-slate-500 font-bold uppercase">
                   <div className="space-y-0.5">
                      <p>13. VALIDATED BY DRIVER AND VEHICLE LICENSING AGENCY</p>
                      <p>ADDRESS FOR RENEWAL: SWANSEA SA99 1AB</p>
                   </div>
                   <div className="text-right">
                      <p>BARCODE SIMULATION AREA</p>
                      <div className="w-24 h-4 bg-slate-200 mt-0.5 opacity-50 flex items-center justify-between px-1">
                         <div className="w-[1px] h-3 bg-black"></div>
                         <div className="w-[2px] h-3 bg-black"></div>
                         <div className="w-[1px] h-3 bg-black"></div>
                         <div className="w-[3px] h-3 bg-black"></div>
                         <div className="w-[1px] h-3 bg-black"></div>
                         <div className="w-[1px] h-3 bg-black"></div>
                         <div className="w-[2px] h-3 bg-black"></div>
                         <div className="w-[4px] h-3 bg-black"></div>
                         <div className="w-[1px] h-3 bg-black"></div>
                      </div>
                   </div>
                </div>
              </>
            )}
          </motion.div>
          <p className="mt-6 text-slate-500 text-xs text-center flex items-center gap-2">
             <MapPin size={12} /> Designed as a professional UK identification mockup.
          </p>
        </div>
      </div>

      {/* Google Font Import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');
        @media print {
          body * { visibility: hidden; }
          #license-card-front, #license-card-front *,
          #license-card-back, #license-card-back * { visibility: visible; }
          #license-card-front, #license-card-back {
            position: absolute;
            left: 0;
            top: 0;
            width: 85.6mm;
            height: 53.98mm;
            box-shadow: none;
            border: 1px solid #ddd;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            border-radius: 10px;
          }
        }
      `}</style>
    </div>
  );
};

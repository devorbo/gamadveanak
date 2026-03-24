import { useState } from 'react';
import { Gift, Plus, Trash2, Send, UserPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Participant {
  id: string;
  name: string;
  email: string;
}

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: '', email: '' },
    { id: '2', name: '', email: '' },
    { id: '3', name: '', email: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const addParticipant = () => {
    setParticipants([...participants, { id: Math.random().toString(36).substr(2, 9), name: '', email: '' }]);
  };

  const removeParticipant = (id: string) => {
    if (participants.length > 3) {
      setParticipants(participants.filter(p => p.id !== id));
    }
  };

  const updateParticipant = (id: string, field: 'name' | 'email', value: string) => {
    setParticipants(participants.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const shuffle = (array: any[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  const performDraw = async () => {
    // Validation
    if (participants.some(p => !p.name || !p.email)) {
      setStatus({ type: 'error', message: 'נא למלא את כל השמות והמיילים' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      let shuffled = [...participants];
      let valid = false;
      let attempts = 0;

      // Ensure no one gets themselves
      while (!valid && attempts < 100) {
        shuffled = shuffle([...participants]);
        valid = participants.every((p, i) => p.id !== shuffled[i].id);
        attempts++;
      }

      if (!valid) throw new Error('לא הצלחנו לבצע הגרלה תקינה, נסה שוב');

      const assignments = participants.map((p, i) => ({
        giverName: p.name,
        giverEmail: p.email,
        receiverName: shuffled[i].name,
      }));

      const response = await fetch('/api/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments }),
      });

      const result = await response.json();
      if (result.success) {
        setStatus({ type: 'success', message: 'ההגרלה בוצעה והמיילים נשלחו בהצלחה!' });
      } else {
        throw new Error(result.error || 'שגיאה בשליחת המיילים');
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'קרתה שגיאה בתהליך' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff1f7] font-sans text-gray-800 p-4 md:p-8" dir="rtl">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 bg-white rounded-3xl shadow-lg mb-6"
          >
            <Gift className="w-12 h-12 text-[#ed3591]" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#4a154b] mb-4">משחק הגמד והענק</h1>
          <p className="text-lg text-[#ed3591] opacity-80">ארגנו את החלפת המתנות שלכם בקלות ובנעימות</p>
        </div>

        {/* Main Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-[40px] shadow-2xl p-6 md:p-10"
        >
          <div className="space-y-4 mb-8">
            <AnimatePresence>
              {participants.map((p, index) => (
                <motion.div 
                  key={p.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="flex items-center gap-3 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#fdf2f8] flex items-center justify-center text-[#ed3591] font-bold text-sm">
                    {(index + 1).toString().padStart(2, '0')}
                  </div>
                  
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="שם"
                      value={p.name}
                      onChange={(e) => updateParticipant(p.id, 'name', e.target.value)}
                      className="w-full px-6 py-3 bg-[#fdf2f8] border-2 border-transparent focus:border-[#ed3591] focus:bg-white rounded-2xl outline-none transition-all placeholder:text-gray-400"
                    />
                    <input
                      type="email"
                      placeholder="אימייל"
                      value={p.email}
                      onChange={(e) => updateParticipant(p.id, 'email', e.target.value)}
                      className="w-full px-6 py-3 bg-[#fdf2f8] border-2 border-transparent focus:border-[#ed3591] focus:bg-white rounded-2xl outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>

                  <button 
                    onClick={() => removeParticipant(p.id)}
                    disabled={participants.length <= 3}
                    className="p-3 text-gray-300 hover:text-red-500 disabled:opacity-0 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={addParticipant}
              className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-[#ed3591] text-[#ed3591] rounded-2xl hover:bg-[#fdf2f8] transition-all font-bold"
            >
              <UserPlus className="w-5 h-5" />
              הוספת משתתף
            </button>
            
            <button
              onClick={performDraw}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#ed3591] text-white rounded-2xl hover:bg-[#d62a7e] shadow-lg shadow-pink-200 transition-all font-bold disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              בצע הגרלה ושלח מיילים
            </button>
          </div>

          {/* Status Messages */}
          <AnimatePresence>
            {status.type && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-6 p-4 rounded-2xl flex items-center gap-3 ${
                  status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}
              >
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="font-medium">{status.message}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>המשחק דורש לפחות 3 משתתפים. המיילים יישלחו באופן אנונימי לכל גמד.</p>
        </div>
      </div>
    </div>
  );
}

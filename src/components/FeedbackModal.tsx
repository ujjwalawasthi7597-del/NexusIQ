import React, { useState } from 'react';
import { X, ThumbsUp, ThumbsDown, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  messageId: string;
  initialRating: 'thumbs_up' | 'thumbs_down';
  onClose: () => void;
  onSubmit: (feedback: { rating: 'thumbs_up' | 'thumbs_down'; comment?: string; category?: string }) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  messageId,
  initialRating,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState<'thumbs_up' | 'thumbs_down'>(initialRating);
  const [category, setCategory] = useState<string>('accurate');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const negativeCategories = [
    { id: 'inaccurate_citation', label: 'Inaccurate Citation / Wrong Page' },
    { id: 'missing_context', label: 'Missing Key Information' },
    { id: 'hallucination', label: 'Answer contradicts source policy' },
    { id: 'outdated_policy', label: 'Outdated or Superseded Content' },
  ];

  const positiveCategories = [
    { id: 'accurate', label: 'Accurate and well cited' },
    { id: 'concise', label: 'Clear and concise' },
    { id: 'saved_time', label: 'Found exact policy instantly' },
  ];

  const categories = rating === 'thumbs_up' ? positiveCategories : negativeCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`/api/v1/messages/${messageId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment, category }),
    })
      .then((res) => res.json())
      .then(() => {
        setSubmitted(true);
        onSubmit({ rating, comment, category });
        setTimeout(() => {
          onClose();
        }, 1200);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Answer Quality Feedback</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">Thank you for your feedback!</h4>
            <p className="text-xs text-slate-400">
              Your evaluation helps fine-tune retrieval thresholds and citation groundings.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Rating Toggle */}
            <div className="flex items-center gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setRating('thumbs_up');
                  setCategory('accurate');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  rating === 'thumbs_up'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <ThumbsUp className="w-4 h-4 text-emerald-400" />
                <span>Helpful & Grounded</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRating('thumbs_down');
                  setCategory('inaccurate_citation');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  rating === 'thumbs_down'
                    ? 'border-rose-500 bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <ThumbsDown className="w-4 h-4 text-rose-400" />
                <span>Inaccurate / Issues</span>
              </button>
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Category</label>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      category === cat.id
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedback_category"
                      checked={category === cat.id}
                      onChange={() => setCategory(cat.id)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Comments */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Detailed Feedback (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What could be improved? Did the citations reference the correct page?"
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

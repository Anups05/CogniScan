// ClockDrawingTest.jsx
import React, { useRef, useState, useEffect } from "react";
import { ArrowLeft, Eraser, CheckCircle2, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ClockDrawingTest = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [testComplete, setTestComplete] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    context.scale(dpr, dpr);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 3;
    context.strokeStyle = document.documentElement.classList.contains("dark")
      ? "#e2e8f0"
      : "#1e293b";
    setCtx(context);
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    if (testComplete || !ctx) return;
    const { x, y } = getPos(e.nativeEvent || e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };
  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing || testComplete || !ctx) return;
    const { x, y } = getPos(e.nativeEvent || e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const stopDrawing = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    ctx.closePath();
    setIsDrawing(false);
  };
  const clearCanvas = () => {
    if (!ctx || testComplete) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/app/cognitive")}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Clock Drawing Test
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Draw a clock face showing 10 past 11
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        {!testComplete ? (
          <>
            <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-4 mb-6 text-sm text-indigo-800 dark:text-indigo-300 text-center">
              Draw a clock face, put in all the numbers, and set the time to{" "}
              <strong>10 minutes past 11</strong>.
            </div>

            <div className="relative w-full aspect-square max-w-md mx-auto bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 mb-6 touch-none overflow-hidden">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="absolute inset-0 w-full h-full cursor-crosshair rounded-2xl"
                style={{ width: "100%", height: "100%" }}
              />
            </div>

            <div className="flex gap-3 max-w-md mx-auto">
              <button
                onClick={clearCanvas}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Eraser className="w-4 h-4" /> Clear
              </button>
              <button
                onClick={() => setTestComplete(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors"
              >
                <Send className="w-4 h-4" /> Submit Drawing
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
              Drawing Submitted!
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto">
              Your drawing has been saved and will be analyzed by our AI model.
            </p>
            <button
              onClick={() => navigate("/app/cognitive")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              Return to Tests
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClockDrawingTest;

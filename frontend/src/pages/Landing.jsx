import React from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Sun, Moon } from "lucide-react";
import { useStore } from "../store/useStore";

const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useStore();
  const isDark = theme === "dark";

  const handleAuth = () => navigate("/login");

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-slate-50 dark:bg-[#0b1326] text-slate-900 dark:text-[#dae2fd] font-sans antialiased min-h-screen selection:bg-primary/30">
      <nav className="fixed top-0 w-full z-50 bg-slate-50 dark:bg-[#0b1326]/80 backdrop-blur-md shadow-2xl shadow-[#060e20]/40">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-8 h-20">
          <div className="flex items-center space-x-2">
            <div className="text-xl font-bold tracking-tighter text-[#c3c0ff] antialiased">
              CogniScan
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 font-['Inter'] antialiased tracking-tight bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-300/50 dark:border-slate-700/50 px-2 py-1.5 rounded-full shadow-lg">
            <button
              onClick={() => scrollTo("features")}
              className="text-slate-700 dark:text-slate-300 font-semibold px-4 py-1.5 rounded-full hover:bg-white dark:hover:bg-slate-700/80 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="text-slate-600 dark:text-slate-400 font-medium px-4 py-1.5 rounded-full hover:bg-white dark:hover:bg-slate-700/80 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
              How it Works
            </button>
            <button
              onClick={() => scrollTo("case-studies")}
              className="text-slate-600 dark:text-slate-400 font-medium px-4 py-1.5 rounded-full hover:bg-white dark:hover:bg-slate-700/80 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
              Case Studies
            </button>
            <button
              onClick={() => scrollTo("pricing")}
              className="text-slate-600 dark:text-slate-400 font-medium px-4 py-1.5 rounded-full hover:bg-white dark:hover:bg-slate-700/80 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
              Pricing
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 transition-colors border border-slate-300/50 dark:border-slate-700/50 shadow-sm"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleAuth}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 border-2 border-indigo-500/30"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>
      <main className="pt-32 pb-16">
        {/*  Hero Section  */}
        <section className="relative min-h-[600px] flex items-center overflow-hidden px-8">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-container/20 rounded-full blur-[100px]"></div>
          </div>
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-highest/50 border border-outline-variant/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-xs font-medium tracking-widest uppercase text-primary">
                  Now in Enterprise Beta
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-on-surface">
                Cognitive Health <br />
                <span className="text-primary-container">
                  Insight Powered by AI
                </span>
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-xl">
                Empower your clinical workforce with high-fidelity neurological
                screening. CogniScan leverages proprietary neural networks to
                detect subtle cognitive shifts before they impact outcomes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <button
                  onClick={handleAuth}
                  className="bg-[#c3c0ff] text-[#0f0069] hover:bg-[#dae2fd] px-8 py-4 rounded-md font-bold text-base shadow-xl shadow-primary-container/20 transition-colors"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={handleAuth}
                  className="px-8 py-4 rounded-md font-bold text-base text-on-surface bg-surface-container-highest hover:bg-surface-bright transition-colors"
                >
                  Watch Tech Demo
                </button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-3">
                  <img
                    className="w-10 h-10 rounded-full border-2 border-surface"
                    data-alt="professional medical researcher headshot portrait in clean studio lighting"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGawsWZsngk9Hapmrd9Ao2ulCczAaFvHmk-EsSHKNJfK9Z3wcTKsYVHavOXkQgtOCmUJ7CGdp54aDKa-TJu6Z_Qh0A5_2j1JJg9kztoTcZR7SPy2DxeoxpbP3OjYHT8KMWhbAkr4mWdwTqUpmyd8AlP2EWhP5xmgcArecD9SxYTMMHvWzZ8GsTbEhS5-8InormwqsEIfFuBzByBTAlk-xElJV-J3che4THxATHiDVyqHFeFv1IR24aM42b1NGkIj2H5eEhfdpqSz0"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-surface"
                    data-alt="senior executive doctor headshot portrait with soft blue background light"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8neVVJ_9PFJVLFtO8GNvajfPk1FKusWqWUS-NpnpCXUQj6lreh0NFPOZZ8zg1U6WEpJACOKv9oizoq913UZ5BLwHkb_u1I3TiHvdUVqpMNqNRcXjkCFzAzlj-wYVE6aVeCqCzlBUooUPS4De99ZTRPWCEpTOII53s-8Asg4gYAkANIS0WdY-hmQ0wCFKO_4g9kDtdyzNqc4aRkuUwroD3LTVZxnwifcWs0JELB4AMZJERwLmiWHLrluuZR2sADTYunAO7310wANM"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-surface"
                    data-alt="female scientist headshot looking confident with bokeh laboratory background"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgqqhpMsI-xD8BIkdSS81zYCknkMGjRFQ8Ee65C6l8bCpZCu_mM-DwFjPtrKPDZw5Tp4If0dR4KNySFG6mecLR2HaU3lIgbV1mX4X8bmU6gryyyIBO_18eK5n1I_-HE5V7IW9lxndfRAMZi0f8efxM223bF1fy_mTdgIpG8Rn-jATKPZlyH9oXSr20ESPKL_f_QWk3Km9j-otXChgiTu-bIPmmiZVjp-KKuLjgWgPrWgSn2Iupp44pTVzA6Mg85mqxRhS5y-RMF-E"
                  />
                </div>
                <p className="text-sm text-on-surface-variant">
                  <span className="text-primary font-bold">500+</span> Clinical
                  Partners Trusted
                </p>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl group-hover:bg-primary/30 transition-all duration-700"></div>
              <div className="relative rounded-2xl border border-outline-variant/10 overflow-hidden shadow-2xl bg-surface-container-low">
                <img
                  className="w-full h-full object-cover opacity-80"
                  data-alt="modern healthcare analytics dashboard showing glowing data visualizations of brain activity and neural pathways on a dark screen"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGWYFzfTgFYLORHM9nVbpAl2NCGHv8E8HJW4gN5wC3rl8gudabkMhtxy-ReW1CTzEGSL-WDgPeNIDm79_FZ2WB8RdqMr-_UP-roTR4Kndx_yPpTMK_W-KPDclyAs3l_sAjlinqd69XJ67UvJQcje03P02zNsnR7vN5FjMadBTp1y0TAVl7jxm04wFkHU2gMDQZ7bZt_jWjKsL15aAEWzcAOddQKIy_T6ncEV1tC9wVa9CakOKwRtX05Yl5jzjsGd03erQnWvbfAjk"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 p-6 glass-panel rounded-xl border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary tracking-widest uppercase">
                      Real-time Analysis
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      Scanning... 94%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[94%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/*  How it Works / Features Section  */}
        <section id="features" className="py-20 px-8 relative">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-on-surface">
                Precision Diagnostics <br />{" "}
                <span className="text-on-surface-variant font-medium">
                  Multimodal Approach
                </span>
              </h2>
              <p className="text-on-surface-variant max-w-2xl text-lg">
                We capture data where it lives. Our platform utilizes three core
                modalities to provide a 360-degree view of patient cognitive
                health.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/*  Card 1  */}
              <div className="group p-8 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-all duration-500 border border-outline-variant/5">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    mic
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-on-surface">
                  Speech Analysis
                </h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Advanced NLP detects linguistic patterns, prosody, and
                  phonetic shifts indicative of early-onset impairment.
                </p>
                <div className="mt-8 pt-8 border-t border-outline-variant/10 flex items-center text-primary font-semibold text-sm cursor-pointer group-hover:gap-2 transition-all">
                  Learn more{" "}
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </div>
              </div>
              {/*  Card 2  */}
              <div className="group p-8 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest transition-all duration-500 border border-outline-variant/10 scale-105 shadow-2xl">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    psychology
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-on-surface">
                  Cognitive Quests
                </h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Gamified diagnostic environments that measure reaction times,
                  spatial memory, and executive function in real-time.
                </p>
                <div className="mt-8 pt-8 border-t border-outline-variant/10 flex items-center text-primary font-semibold text-sm cursor-pointer group-hover:gap-2 transition-all">
                  View Methodology{" "}
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </div>
              </div>
              {/*  Card 3  */}
              <div className="group p-8 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-all duration-500 border border-outline-variant/5">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    face
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-on-surface">
                  Facial Analysis
                </h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Proprietary computer vision maps micro-expressions and
                  muscular tremors to correlate with neurological health states.
                </p>
                <div className="mt-8 pt-8 border-t border-outline-variant/10 flex items-center text-primary font-semibold text-sm cursor-pointer group-hover:gap-2 transition-all">
                  Read the Study{" "}
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/*  Trust & Security / Case Studies Section  */}
        <section
          id="case-studies"
          className="py-24 bg-surface-container-lowest relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]"></div>
          </div>
          <div className="max-w-7xl mx-auto px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div>
                <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-8">
                  Clinical-Grade Accuracy. <br />
                  Enterprise-Grade Security.
                </h2>
                <div className="grid grid-cols-2 gap-8 mb-12">
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">
                      99.2%
                    </div>
                    <div className="text-sm font-medium uppercase tracking-widest text-on-surface-variant">
                      Detection Precision
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">
                      12M+
                    </div>
                    <div className="text-sm font-medium uppercase tracking-widest text-on-surface-variant">
                      Analysis Minutes
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">
                      250ms
                    </div>
                    <div className="text-sm font-medium uppercase tracking-widest text-on-surface-variant">
                      Analysis Latency
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">
                      ISO 27001
                    </div>
                    <div className="text-sm font-medium uppercase tracking-widest text-on-surface-variant">
                      Global Standard
                    </div>
                  </div>
                </div>
                <div className="p-8 rounded-2xl bg-surface-container border border-outline-variant/20 flex gap-6 items-start">
                  <div className="w-12 h-12 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified_user
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-on-surface mb-2">
                      The Encrypted Security Badge
                    </h4>
                    <p className="text-on-surface-variant text-sm leading-relaxed">
                      All patient data is encrypted at rest and in transit using
                      AES-256. We are fully HIPAA compliant and SOC2 Type II
                      certified, ensuring your facility meets every regulatory
                      hurdle with ease.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4 pt-12">
                    <div className="aspect-square rounded-2xl bg-surface-container-high flex flex-col items-center justify-center p-6 text-center">
                      <span className="material-symbols-outlined text-4xl text-primary mb-4">
                        shield_person
                      </span>
                      <span className="text-xs font-bold text-on-surface tracking-widest uppercase">
                        HIPAA Compliant
                      </span>
                    </div>
                    <div className="aspect-square rounded-2xl bg-primary-container flex flex-col items-center justify-center p-6 text-center">
                      <span className="material-symbols-outlined text-4xl text-on-primary-container mb-4">
                        lock
                      </span>
                      <span className="text-xs font-bold text-on-primary-container tracking-widest uppercase">
                        SOC2 Type II
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="aspect-square rounded-2xl bg-surface-container-highest flex flex-col items-center justify-center p-6 text-center">
                      <span className="material-symbols-outlined text-4xl text-primary mb-4">
                        gpp_good
                      </span>
                      <span className="text-xs font-bold text-on-surface tracking-widest uppercase">
                        GDPR Ready
                      </span>
                    </div>
                    <div className="aspect-square rounded-2xl bg-surface-container flex flex-col items-center justify-center p-6 text-center">
                      <span className="material-symbols-outlined text-4xl text-primary mb-4">
                        analytics
                      </span>
                      <span className="text-xs font-bold text-on-surface tracking-widest uppercase">
                        Data Sovereign
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/*  CTA / Pricing Section  */}
        <section id="pricing" className="py-24 px-8">
          <div className="max-w-7xl mx-auto p-12 md:p-20 rounded-3xl bg-gradient-to-br from-primary-container to-background border border-primary/20 relative overflow-hidden text-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-6 relative z-10">
              Future-proof your <br />
              cognitive screening today.
            </h2>
            <p className="text-on-primary-container/80 text-lg mb-10 max-w-xl mx-auto relative z-10">
              Join 500+ clinics and enterprise healthcare providers leveraging
              CogniScan for preventative excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button
                onClick={handleAuth}
                className="bg-[#c3c0ff] text-[#0f0069] hover:bg-[#dae2fd] px-10 py-4 rounded-md font-bold text-lg shadow-xl shadow-primary-container/20 transition-colors"
              >
                Start Your Free Trial
              </button>
              <button
                onClick={handleAuth}
                className="bg-surface-container-highest hover:bg-surface-bright text-on-surface px-10 py-4 rounded-md font-bold text-lg shadow-lg border border-outline-variant/30 transition-colors"
              >
                Talk to Enterprise Sales
              </button>
            </div>
          </div>
        </section>
      </main>
      {/*  Footer  */}
      <footer className="bg-slate-50 dark:bg-[#0b1326] w-full pt-20 pb-10 border-t border-surface-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-7xl mx-auto px-8">
          <div className="col-span-2 md:col-span-1 space-y-6">
            <div className="text-lg font-black text-[#c3c0ff] tracking-widest uppercase antialiased">
              CogniScan
            </div>
            <p className="text-on-surface-variant font-['Inter'] text-sm leading-6 max-w-xs">
              Advancing neurological health through precision-engineered AI
              modalities.
            </p>
          </div>
          <div className="space-y-4">
            <h5 className="text-[#4f46e5] font-bold text-sm tracking-widest uppercase">
              Product
            </h5>
            <ul className="space-y-3">
              <li>
                <a
                  className="text-slate-600 dark:text-[#c7c4d8] hover:text-[#c3c0ff] underline-offset-4 hover:underline transition-all duration-300 opacity-80 hover:opacity-100"
                  href="#speech"
                >
                  Speech Analysis
                </a>
              </li>
              <li>
                <a
                  className="text-slate-600 dark:text-[#c7c4d8] hover:text-[#c3c0ff] underline-offset-4 hover:underline transition-all duration-300 opacity-80 hover:opacity-100"
                  href="#cognitive"
                >
                  Cognitive Quests
                </a>
              </li>
              <li>
                <a
                  className="text-slate-600 dark:text-[#c7c4d8] hover:text-[#c3c0ff] underline-offset-4 hover:underline transition-all duration-300 opacity-80 hover:opacity-100"
                  href="#pricing"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="text-[#4f46e5] font-bold text-sm tracking-widest uppercase">
              Company
            </h5>
            <ul className="space-y-3">
              <li>
                <a
                  className="text-slate-600 dark:text-[#c7c4d8] hover:text-[#c3c0ff] underline-offset-4 hover:underline transition-all duration-300 opacity-80 hover:opacity-100"
                  href="#"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  className="text-slate-600 dark:text-[#c7c4d8] hover:text-[#c3c0ff] underline-offset-4 hover:underline transition-all duration-300 opacity-80 hover:opacity-100"
                  href="#"
                >
                  Research
                </a>
              </li>
              <li>
                <a
                  className="text-slate-600 dark:text-[#c7c4d8] hover:text-[#c3c0ff] underline-offset-4 hover:underline transition-all duration-300 opacity-80 hover:opacity-100"
                  href="#"
                >
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="text-[#4f46e5] font-bold text-sm tracking-widest uppercase">
              Legal
            </h5>
            <ul className="space-y-3">
              <li>
                <a
                  className="text-slate-600 dark:text-[#c7c4d8] hover:text-[#c3c0ff] underline-offset-4 hover:underline transition-all duration-300 opacity-80 hover:opacity-100"
                  href="#"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  className="text-slate-600 dark:text-[#c7c4d8] hover:text-[#c3c0ff] underline-offset-4 hover:underline transition-all duration-300 opacity-80 hover:opacity-100"
                  href="#"
                >
                  HIPAA Compliance
                </a>
              </li>
              <li>
                <a
                  className="text-slate-600 dark:text-[#c7c4d8] hover:text-[#c3c0ff] underline-offset-4 hover:underline transition-all duration-300 opacity-80 hover:opacity-100"
                  href="#"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-20 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 dark:text-[#c7c4d8] font-['Inter'] text-xs leading-6 opacity-80">
            © 2024 CogniScan AI. Precision in Cognitive Health.
          </p>
          <div className="flex gap-6">
            <a
              className="text-slate-600 dark:text-[#c7c4d8] hover:text-[#c3c0ff] transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-xl">public</span>
            </a>
            <a
              className="text-slate-600 dark:text-[#c7c4d8] hover:text-[#c3c0ff] transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-xl">
                brand_awareness
              </span>
            </a>
            <a
              className="text-slate-600 dark:text-[#c7c4d8] hover:text-[#c3c0ff] transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-xl">groups</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

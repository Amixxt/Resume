// ==========================================================================
// AMIT KUSHWAHA - INTERACTIVE RESUME & PORTFOLIO ENGINE
// Includes: Particle Mesh Canvas, Theme Switcher, Filterable Skills & Projects,
//           ATS Print Export, Click-to-Copy, and "Ask Amit" AI Assistant
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. Reading Progress Bar
  // --------------------------------------------------------------------------
  const scrollProgress = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0 && scrollProgress) {
      const progress = (window.scrollY / totalHeight) * 100;
      scrollProgress.style.width = `${progress}%`;
    }
  }, { passive: true });

  // --------------------------------------------------------------------------
  // 2. Interactive Background Particle Canvas
  // --------------------------------------------------------------------------
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let particles = [];
    const particleCount = Math.min(Math.floor((width * height) / 16000), 65);
    const mouse = { x: -1000, y: -1000, radius: 120 };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.65;
        this.vy = (Math.random() - 0.5) * 0.65;
        this.baseRadius = Math.random() * 1.6 + 1.2;
        this.radius = this.baseRadius;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Gentle cursor interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
          this.radius = this.baseRadius + force * 1.5;
        } else {
          this.radius = this.baseRadius;
        }
      }

      draw(isDark) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(56, 189, 248, 0.7)' : 'rgba(2, 132, 199, 0.5)';
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }
    initParticles();

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    }, { passive: true });

    let animationFrameId;
    function animate() {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      ctx.clearRect(0, 0, width, height);
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

      // Connect near particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 115) {
            const opacity = (1 - dist / 115) * (isDark ? 0.22 : 0.15);
            ctx.beginPath();
            ctx.strokeStyle = isDark
              ? `rgba(56, 189, 248, ${opacity})`
              : `rgba(2, 132, 199, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw(isDark);
      });

      animationFrameId = requestAnimationFrame(animate);
    }
    animate();
  }

  // --------------------------------------------------------------------------
  // 3. Dark / Light Mode Switcher
  // --------------------------------------------------------------------------
  const themeToggle = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('amit_resume_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', storedTheme);

  const updateThemeUI = (theme) => {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('.btn-text');
    if (theme === 'light') {
      icon.className = 'fa-solid fa-sun';
      if (text) text.textContent = 'Light';
      themeToggle.title = 'Switch to Dark Mode';
    } else {
      icon.className = 'fa-solid fa-moon';
      if (text) text.textContent = 'Dark';
      themeToggle.title = 'Switch to Light Mode';
    }
  };
  updateThemeUI(storedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('amit_resume_theme', newTheme);
      updateThemeUI(newTheme);
      showToast(`Switched to ${newTheme.toUpperCase()} mode`);
    });
  }

  // --------------------------------------------------------------------------
  // 4. Toast Notification System
  // --------------------------------------------------------------------------
  let toastTimeout;
  const showToast = (message) => {
    let toast = document.getElementById('resume-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'resume-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  };

  // --------------------------------------------------------------------------
  // 5. Click to Copy Contact Info
  // --------------------------------------------------------------------------
  const copyButtons = document.querySelectorAll('[data-copy]');
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const text = btn.getAttribute('data-copy');
      const type = btn.getAttribute('data-type') || 'Contact';
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          showToast(`✓ ${type} copied to clipboard!`);
        }).catch(() => {
          showToast('Failed to copy to clipboard');
        });
      }
    });
  });

  // --------------------------------------------------------------------------
  // 6. Skill Category Filtering
  // --------------------------------------------------------------------------
  const skillFilters = document.querySelectorAll('.filter-pill');
  const skillCategories = document.querySelectorAll('.skill-category');

  skillFilters.forEach((pill) => {
    pill.addEventListener('click', () => {
      skillFilters.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const targetFilter = pill.getAttribute('data-filter');

      skillCategories.forEach((cat) => {
        if (targetFilter === 'all' || cat.getAttribute('data-category') === targetFilter) {
          cat.classList.remove('hidden');
        } else {
          cat.classList.add('hidden');
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // 7. Project Category Filtering
  // --------------------------------------------------------------------------
  const projFilters = document.querySelectorAll('.proj-filter-btn');
  const projCards = document.querySelectorAll('.project-card');

  projFilters.forEach((btn) => {
    btn.addEventListener('click', () => {
      projFilters.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filterType = btn.getAttribute('data-proj');

      projCards.forEach((card) => {
        if (filterType === 'all' || card.getAttribute('data-proj-type') === filterType) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // 8. Print / Save as PDF
  // --------------------------------------------------------------------------
  const printBtn = document.getElementById('print-resume-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // --------------------------------------------------------------------------
  // 9. Back to Top Smooth Scroll
  // --------------------------------------------------------------------------
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --------------------------------------------------------------------------
  // 10. Smart "Ask Amit" AI Assistant Widget
  // --------------------------------------------------------------------------
  const aiWidget = document.getElementById('ai-assistant-widget');
  const openAiBtn = document.getElementById('open-ai-btn');
  const floatingAiLauncher = document.getElementById('floating-ai-launcher');
  const closeAiBtn = document.getElementById('close-ai-btn');
  const aiMessagesList = document.getElementById('ai-messages-list');
  const aiChatForm = document.getElementById('ai-chat-form');
  const aiChatInput = document.getElementById('ai-chat-input');
  const promptChips = document.querySelectorAll('.ai-prompt-chip');

  const toggleAiWidget = (open) => {
    if (!aiWidget) return;
    if (open) {
      aiWidget.classList.add('open');
      aiWidget.setAttribute('aria-hidden', 'false');
      if (aiChatInput) setTimeout(() => aiChatInput.focus(), 250);
    } else {
      aiWidget.classList.remove('open');
      aiWidget.setAttribute('aria-hidden', 'true');
    }
  };

  if (openAiBtn) openAiBtn.addEventListener('click', () => toggleAiWidget(true));
  if (floatingAiLauncher) floatingAiLauncher.addEventListener('click', () => toggleAiWidget(true));
  if (closeAiBtn) closeAiBtn.addEventListener('click', () => toggleAiWidget(false));

  // Comprehensive System Knowledge Prompt for Amit Kushwaha
  const AMIT_AI_SYSTEM_PROMPT = `You are Amit's friendly personal AI assistant on his interactive portfolio & resume website.
Amit Kushwaha is an authentic 3rd-year B.Tech Computer Science & Engineering student at Global Institute of Engineering, Jabalpur (expected graduation: 2026). He completed his 12th standard (Science) from Green Valley Public School, Jabalpur.
- Technical Skills:
  * Languages: C, C++ (strong Object-Oriented Programming & Data Structures fundamentals), JavaScript (ES6+), TypeScript, Python
  * Web Tech: Semantic HTML5, modern CSS3 (Flexbox/Grid/Animations), React
  * Databases & Tools: SQL/MySQL basics, Git & GitHub for version control
- Key Projects:
  1. Interactive Web Portfolio & ATS Resume: Modern responsive interface built with clean HTML5, CSS3, JavaScript, Canvas API particle mesh, zero external bloat.
  2. Student Management Console System: C++ application using OOP principles (inheritance, encapsulation) and persistent file streams.
  3. CivicGrid Focus Visualizer: JavaScript productivity utility with visual state rendering.
- Internship & Career Status: Actively seeking Software Engineering, C++ Developer, or Web Development internships (open to remote & on-site roles).
- Contact Info: Email: hydranarcoo@gmail.com, Phone: +91 8109315812, Location: Jabalpur, Madhya Pradesh, India (PIN 482004), GitHub: github.com/Amixxt, Portfolio: https://amixtportfolio.vercel.app/
- Guidelines:
  * Respond warmly, politely, and enthusiastically in 2 to 3 concise sentences.
  * Adapt to the user's language: if greeted or asked in Hindi or Hinglish (e.g., "kaise ho", "kya chal raha hai", "batao", "kya skills hai"), reply warmly in natural Hinglish/Hindi. If asked in English, reply in crisp English.
  * Stick strictly to Amit's true background and skills.`;

  // Local Knowledge Base Fallback Engine (instant offline backup)
  const generateAiAnswer = (query) => {
    const q = query.toLowerCase().trim();

    if (q.includes('skill') || q.includes('stack') || q.includes('tech') || q.includes('language') || q.includes('c++')) {
      return "Amit's core technical competencies include:\n• Primary Language: C / C++ (with strong Object-Oriented Programming & Data Structures fundamentals)\n• Web Development: Semantic HTML5, modern CSS3 (Flexbox/Grid/Animations), and modern JavaScript (ES6+)\n• Database & Tools: SQL/MySQL basics, Git & GitHub for version control\n• Core Mindset: Fast learner, analytical problem solving, and writing clean maintainable code.";
    }

    if (q.includes('project') || q.includes('portfolio') || q.includes('work') || q.includes('built')) {
      return "Amit has engineered several practical projects:\n1. Interactive Web Portfolio & Resume: Built with clean HTML5, CSS3, JavaScript, and Canvas API with zero external bloat.\n2. Student Management Console System: A structured C++ application applying OOP principles (inheritance, encapsulation) and persistent file handling streams.\n3. CivicGrid Focus Visualizer: A JavaScript productivity utility with visual state rendering.";
    }

    if (q.includes('college') || q.includes('education') || q.includes('degree') || q.includes('btech') || q.includes('b.tech') || q.includes('school')) {
      return "Amit is currently in his 3rd year pursuing a B.Tech in Computer Science & Engineering at Global Institute of Engineering, Jabalpur (expected graduation in 2026). He completed his Higher Secondary (12th Science) schooling at Green Valley Public School.";
    }

    if (q.includes('intern') || q.includes('hire') || q.includes('job') || q.includes('role') || q.includes('available')) {
      return "Yes! Amit is actively seeking Software Engineering and Web Development internships. He is excited to apply his solid foundational grasp of C++, data structures, and responsive web development to collaborate with real-world engineering teams.";
    }

    if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('reach') || q.includes('call') || q.includes('message')) {
      return "You can get in touch with Amit directly:\n• Email: hydranarcoo@gmail.com\n• Phone: +91 8109315812\n• Location: Jabalpur, Madhya Pradesh, India\n• GitHub: github.com/Amixxt\n• LinkedIn: linkedin.com/in/amixxt";
    }

    if (q.includes('location') || q.includes('where') || q.includes('city') || q.includes('jabalpur')) {
      return "Amit is based in Jabalpur, Madhya Pradesh, India (482004). He is available for remote internships as well as on-site opportunities.";
    }

    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('namaste') || q.includes('kaise')) {
      return "Hey! Great to connect with you. I can assist you with details regarding Amit's coding projects, C++ and web stack, academic credentials, or direct contact info. What would you like to know?";
    }

    return "Amit is a 3rd-year B.Tech CSE student passionate about C++, OOP, and modern web interfaces. Feel free to ask about his technical skills, academic projects, or internship availability, or reach out to him directly at hydranarcoo@gmail.com!";
  };

  // Real AI Fetch with Timeout & Local Fallback
  const fetchRealAiResponse = async (userQuery) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const fullPrompt = `${AMIT_AI_SYSTEM_PROMPT}\n\nUser Question: ${userQuery}\n\nHelpful, concise answer as Amit's Assistant:`;
    const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      if (!text || !text.trim()) throw new Error('Empty response');
      return text.trim();
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('Real AI endpoint unavailable, using local knowledge engine:', err);
      return generateAiAnswer(userQuery);
    }
  };

  const appendMessage = (text, isUser = false) => {
    if (!aiMessagesList) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-msg ${isUser ? 'user-msg' : 'bot-msg'}`;

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.style.whiteSpace = 'pre-line';
    bubble.textContent = text;

    msgDiv.appendChild(bubble);
    aiMessagesList.appendChild(msgDiv);
    aiMessagesList.scrollTop = aiMessagesList.scrollHeight;
  };

  const handleUserInput = async (inputText) => {
    if (!inputText || !inputText.trim()) return;
    appendMessage(inputText, true);

    // Show realistic typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-msg bot-msg';
    typingDiv.innerHTML = '<div class="msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    aiMessagesList.appendChild(typingDiv);
    aiMessagesList.scrollTop = aiMessagesList.scrollHeight;

    try {
      const botReply = await fetchRealAiResponse(inputText);
      typingDiv.remove();
      appendMessage(botReply, false);
    } catch {
      typingDiv.remove();
      const fallbackReply = generateAiAnswer(inputText);
      appendMessage(fallbackReply, false);
    }
  };

  if (aiChatForm) {
    aiChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = aiChatInput.value.trim();
      if (text) {
        aiChatInput.value = '';
        handleUserInput(text);
      }
    });
  }

  // Quick Chips
  promptChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const promptType = chip.getAttribute('data-prompt');
      let query = '';
      if (promptType === 'skills') query = "What are Amit's main technical skills?";
      if (promptType === 'projects') query = "Tell me about Amit's projects";
      if (promptType === 'internship') query = "Is Amit available for internships?";
      if (promptType === 'contact') query = "How can I contact Amit?";
      handleUserInput(query);
    });
  });
});

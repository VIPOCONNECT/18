/**
 * נגן מוזיקה לרכב - מודול ניהול ערכות נושא
 * שלב 4: תכונות מתקדמות - מצב יום/לילה
 */

// אובייקט גלובלי לניהול ערכות נושא
const ThemeManager = {
    // מאפיינים
    isDarkMode: true, // ברירת מחדל - מצב לילה
    localStorageKey: 'carMusicPlayer_theme',
    themes: {
        dark: {
            name: 'מצב לילה',
            background: '#121212',
            text: '#ffffff',
            primary: '#1db954',
            secondary: '#535353',
            playerBackground: '#000000',
            controlBackground: 'rgba(18, 18, 18, 0.8)'
        },
        light: {
            name: 'מצב יום',
            background: '#f5f5f5',
            text: '#333333',
            primary: '#1db954',
            secondary: '#b3b3b3',
            playerBackground: '#e0e0e0',
            controlBackground: 'rgba(245, 245, 245, 0.8)'
        }
    },
    
    // אתחול מנהל ערכות נושא
    init: function() {
        console.log('אתחול מנהל ערכות נושא');
        this.loadSavedTheme();
        this.updateThemeToggleButton();
        
        // הוספת מאזין אירועים לכפתור החלפת ערכת נושא
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // הוספת האזנה לשינויים במצב המערכת (מצב כהה/בהיר)
        this.listenToSystemThemeChanges();
    },
    
    // טעינת ערכת נושא שמורה
    loadSavedTheme: function() {
        try {
            const savedTheme = localStorage.getItem(this.localStorageKey);
            if (savedTheme !== null) {
                this.isDarkMode = savedTheme === 'dark';
            } else {
                // בדוק העדפות מערכת
                this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            this.applyTheme();
        } catch (error) {
            console.error('שגיאה בטעינת ערכת נושא:', error);
        }
    },
    
    // שמירת ערכת הנושא הנוכחית
    saveTheme: function() {
        try {
            localStorage.setItem(this.localStorageKey, this.isDarkMode ? 'dark' : 'light');
        } catch (error) {
            console.error('שגיאה בשמירת ערכת נושא:', error);
        }
    },
    
    // החלפת ערכת נושא
    toggleTheme: function() {
        this.isDarkMode = !this.isDarkMode;
        this.applyTheme();
        this.saveTheme();
        this.updateThemeToggleButton();
        
        // הצגת הודעת אישור
        const themeName = this.isDarkMode ? 'מצב לילה' : 'מצב יום';
        updateStatus(`ערכת נושא: ${themeName}`);
    },
    
    // החלת ערכת הנושא הנוכחית
    applyTheme: function() {
        const theme = this.isDarkMode ? this.themes.dark : this.themes.light;
        document.documentElement.style.setProperty('--background-color', theme.background);
        document.documentElement.style.setProperty('--text-color', theme.text);
        document.documentElement.style.setProperty('--primary-color', theme.primary);
        document.documentElement.style.setProperty('--secondary-color', theme.secondary);
        document.documentElement.style.setProperty('--player-background', theme.playerBackground);
        document.documentElement.style.setProperty('--control-background', theme.controlBackground);
        
        // עדכון מטה-תגית עבור צבע הנושא
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme.background);
        }
        
        // עדכון class של body
        document.body.classList.toggle('dark-theme', this.isDarkMode);
        document.body.classList.toggle('light-theme', !this.isDarkMode);
    },
    
    // עדכון כפתור החלפת ערכת נושא
    updateThemeToggleButton: function() {
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        if (themeToggleBtn) {
            const icon = themeToggleBtn.querySelector('i');
            if (icon) {
                if (this.isDarkMode) {
                    icon.className = 'fas fa-sun'; // סמל שמש במצב לילה
                    themeToggleBtn.setAttribute('aria-label', 'עבור למצב יום');
                    themeToggleBtn.setAttribute('title', 'עבור למצב יום');
                } else {
                    icon.className = 'fas fa-moon'; // סמל ירח במצב יום
                    themeToggleBtn.setAttribute('aria-label', 'עבור למצב לילה');
                    themeToggleBtn.setAttribute('title', 'עבור למצב לילה');
                }
            }
        }
    },
    
    // האזנה לשינויים במצב המערכת
    listenToSystemThemeChanges: function() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // טיפול בשינוי העדפות המשתמש במערכת
        mediaQuery.addEventListener('change', (e) => {
            // רק אם המשתמש לא בחר ידנית נושא אחר
            if (localStorage.getItem(this.localStorageKey) === null) {
                this.isDarkMode = e.matches;
                this.applyTheme();
                this.updateThemeToggleButton();
            }
        });
    }
};

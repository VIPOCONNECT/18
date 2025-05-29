/**
 * נגן מוזיקה לרכב - מודול ניהול PWA
 * שלב 4: תכונות מתקדמות - התקנת PWA ומידע שיר
 */

// אובייקט גלובלי לניהול ה-PWA
const PWAManager = {
    // מאפיינים
    deferredPrompt: null,
    trackInfoTimer: null,
    localStorageKeyTrackInfo: 'carMusicPlayer_currentTrack',
    
    // אתחול מנהל ה-PWA
    init: function() {
        console.log('אתחול מנהל PWA');
        
        // רישום Service Worker
        this.registerServiceWorker();
        
        // טיפול באירוע beforeinstallprompt
        this.setupInstallListeners();
        
        // אתחול מידע השיר הנוכחי
        this.initCurrentTrackInfo();
    },
    
    // רישום Service Worker
    registerServiceWorker: function() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('Service Worker נרשם בהצלחה:', registration.scope);
                })
                .catch(error => {
                    console.error('שגיאה ברישום Service Worker:', error);
                });
        } else {
            console.log('Service Workers אינם נתמכים בדפדפן זה');
        }
    },
    
    // הגדרת מאזיני אירועים להתקנת PWA
    setupInstallListeners: function() {
        // שמירת אירוע beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            // מניעת הצגת דיאלוג ההתקנה האוטומטי
            e.preventDefault();
            
            // שמירת האירוע כדי להשתמש בו מאוחר יותר
            this.deferredPrompt = e;
            
            // הצגת כפתור ההתקנה
            this.showInstallButton();
        });
        
        // כאשר האפליקציה כבר מותקנת, הסתרת הכפתור
        window.addEventListener('appinstalled', () => {
            console.log('האפליקציה הותקנה בהצלחה');
            this.hideInstallButton();
            this.deferredPrompt = null;
        });
        
        // טיפול בלחיצה על כפתור ההתקנה
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.addEventListener('click', () => {
                this.installPWA();
            });
        }
    },
    
    // הצגת כפתור התקנת PWA
    showInstallButton: function() {
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'flex';
        }
    },
    
    // הסתרת כפתור התקנת PWA
    hideInstallButton: function() {
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    },
    
    // התקנת האפליקציה כ-PWA
    installPWA: function() {
        if (!this.deferredPrompt) {
            console.log('אין אפשרות להתקין את האפליקציה כעת');
            return;
        }
        
        // הצגת דיאלוג ההתקנה
        this.deferredPrompt.prompt();
        
        // בדיקת החלטת המשתמש
        this.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('המשתמש הסכים להתקין את האפליקציה');
                updateStatus('האפליקציה מותקנת! 🎉');
            } else {
                console.log('המשתמש דחה את התקנת האפליקציה');
            }
            
            // ניקוי האירוע השמור
            this.deferredPrompt = null;
        });
    },
    
    // אתחול מידע השיר הנוכחי
    initCurrentTrackInfo: function() {
        // התחלת עדכונים תקופתיים של מידע השיר
        this.trackInfoTimer = setInterval(() => {
            this.updateCurrentTrackInfo();
        }, 1000);
        
        // האזנה לשינויים בשיר הנוכחי
        document.addEventListener('video-changed', () => {
            setTimeout(() => {
                this.updateCurrentTrackInfo(true);
            }, 1000);
        });
        
        // אתחול שליטה בסרגל התקדמות
        this.initProgressControl();
    },
    
    // עדכון מידע השיר הנוכחי
    updateCurrentTrackInfo: function(forceUpdate = false) {
        if (!MusicPlayer.player || !MusicPlayer.player.getPlayerState) return;
        
        try {
            // קבלת מידע רק אם הנגן פועל או אם נדרש עדכון מאולץ
            if (MusicPlayer.player.getPlayerState() === YT.PlayerState.PLAYING || forceUpdate) {
                const videoData = MusicPlayer.player.getVideoData();
                const title = videoData.title || 'שם השיר לא זמין';
                
                // עדכון כותרת השיר
                const trackTitleElement = document.getElementById('trackTitle');
                if (trackTitleElement && trackTitleElement.textContent !== title) {
                    trackTitleElement.textContent = title;
                    
                    // שמירת מידע השיר הנוכחי באחסון המקומי
                    this.saveCurrentTrackInfo(title, videoData.video_id);
                    
                    // שליחת אירוע עדכון שיר
                    const event = new CustomEvent('track-info-updated', { 
                        detail: { title, videoId: videoData.video_id }
                    });
                    document.dispatchEvent(event);
                }
                
                // עדכון זמני הניגון
                this.updateTrackTimes();
                
                // עדכון סרגל ההתקדמות
                this.updateProgressBar();
            }
        } catch (error) {
            console.error('שגיאה בעדכון מידע השיר:', error);
        }
    },
    
    // שמירת מידע השיר הנוכחי
    saveCurrentTrackInfo: function(title, videoId) {
        try {
            const trackInfo = { title, videoId, timestamp: Date.now() };
            localStorage.setItem(this.localStorageKeyTrackInfo, JSON.stringify(trackInfo));
        } catch (error) {
            console.error('שגיאה בשמירת מידע השיר:', error);
        }
    },
    
    // עדכון זמני ניגון
    updateTrackTimes: function() {
        if (!MusicPlayer.player || !MusicPlayer.player.getCurrentTime) return;
        
        const currentTime = MusicPlayer.player.getCurrentTime() || 0;
        const duration = MusicPlayer.player.getDuration() || 0;
        
        const currentTimeElement = document.getElementById('currentTime');
        const durationElement = document.getElementById('duration');
        
        if (currentTimeElement) {
            currentTimeElement.textContent = this.formatTime(currentTime);
        }
        
        if (durationElement) {
            durationElement.textContent = this.formatTime(duration);
        }
    },
    
    // עדכון סרגל ההתקדמות
    updateProgressBar: function() {
        if (!MusicPlayer.player) return;
        
        const currentTime = MusicPlayer.player.getCurrentTime() || 0;
        const duration = MusicPlayer.player.getDuration() || 0;
        
        if (duration > 0) {
            const progressPercent = (currentTime / duration) * 100;
            const progressBar = document.getElementById('progressBar');
            
            if (progressBar) {
                progressBar.style.width = `${progressPercent}%`;
            }
        }
    },
    
    // אתחול שליטה בסרגל ההתקדמות
    initProgressControl: function() {
        const progressContainer = document.getElementById('progressContainer');
        
        if (progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                if (!MusicPlayer.player || !MusicPlayer.player.seekTo) return;
                
                const duration = MusicPlayer.player.getDuration() || 0;
                if (duration <= 0) return;
                
                // חישוב המיקום החדש
                const rect = progressContainer.getBoundingClientRect();
                const clickPosition = e.clientX - rect.left;
                const percentClicked = clickPosition / rect.width;
                
                // המרה לשניות
                const seekTime = duration * percentClicked;
                
                // דילוג למיקום החדש
                MusicPlayer.player.seekTo(seekTime, true);
                
                // עדכון התצוגה
                this.updateTrackTimes();
                this.updateProgressBar();
            });
        }
    },
    
    // פורמט זמן (שניות -> mm:ss)
    formatTime: function(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        seconds = Math.floor(seconds);
        const minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
};

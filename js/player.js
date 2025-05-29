/**
 * נגן מוזיקה לרכב - מודול ניהול הנגן
 * שלב 3: תמיכה בפלייליסטים מרובים
 */

// אובייקט גלובלי לניהול הנגן
const PlayerManager = {
    // מאפיינים
    player: null,
    isPlaying: false,
    isMuted: false,
    isShuffle: false,
    lastVolume: 100,
    isPlaylistChanging: false, // מציין אם במצב החלפת פלייליסט
    
    // אתחול הנגן
    init: function() {
        console.log('אתחול מנהל הנגן');
        // אתחול מנהל הפלייליסטים אם קיים
        if (typeof PlaylistManager !== 'undefined') {
            PlaylistManager.init();
        }
        this.setupYouTubeAPI();
    },
    
    // הגדרת YouTube API
    setupYouTubeAPI: function() {
        // אם החלון כבר מכיל את פונקציית האתחול של YouTube, לא נגדיר אותה שוב
        if (window.onYouTubeIframeAPIReady) {
            console.log('onYouTubeIframeAPIReady כבר מוגדר, משתמש בפונקציה הקיימת');
            return;
        }
        
        // הגדרת פונקציית האתחול של YouTube API
        window.onYouTubeIframeAPIReady = () => {
            console.log('YouTube API נטען בהצלחה');
            updateStatus('טוען פלייליסט...');
            this.createPlayer();
        };
    },
    
    // יצירת נגן YouTube
    createPlayer: function() {
        try {
            this.player = new YT.Player('player', {
                height: '100%',
                width: '100%',
                playerVars: {
                    'autoplay': 1,
                    'controls': 0, // מסתיר את הבקרים המובנים
                    'listType': 'playlist',
                    'list': this.getCurrentPlaylistId(),
                    'rel': 0,
                    'modestbranding': 1,
                    'enablejsapi': 1
                },
                events: {
                    'onReady': this.onPlayerReady.bind(this),
                    'onStateChange': this.onPlayerStateChange.bind(this),
                    'onError': this.onPlayerError.bind(this)
                }
            });
        } catch (error) {
            console.error('שגיאה ביצירת נגן YouTube:', error);
            this.handlePlayerCreationError();
        }
    },
    
    // טיפול בשגיאת יצירת נגן
    handlePlayerCreationError: function() {
        updateStatus('שגיאה בטעינת הנגן. מנסה שנית...');
        
        setTimeout(() => {
            try {
                this.createPlayer();
            } catch (secondError) {
                console.error('ניסיון שני נכשל:', secondError);
                this.createDirectEmbed();
            }
        }, 2000);
    },
    
    // יצירת הטמעה ישירה במקרה שה-API נכשל
    createDirectEmbed: function() {
        updateStatus('מנסה טעינה בשיטה חלופית...');
        
        const playerContainer = document.getElementById('player');
        playerContainer.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/videoseries?list=${this.getCurrentPlaylistId()}&autoplay=1&rel=0&modestbranding=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
        
        updateStatus('הנגן טעון במצב מוגבל');
        document.getElementById('currentSong').textContent = 'מידע לא זמין במצב מוגבל';
    },
    
    // כאשר הנגן מוכן
    onPlayerReady: function(event) {
        console.log('הנגן מוכן');
        this.isPlaying = true;
        updateStatus('מנגן...');
        
        // הגדרת עוצמת קול התחלתית
        this.setVolume(this.lastVolume);
        
        // עדכון תצוגת השיר הנוכחי
        this.updateCurrentSong();
        
        // הפעלת טיימר לעדכון שם השיר
        this.startSongUpdateTimer();
    },
    
    // כאשר מצב הנגן משתנה
    onPlayerStateChange: function(event) {
        switch(event.data) {
            case YT.PlayerState.PLAYING:
                this.isPlaying = true;
                updateStatus('מנגן...');
                this.updateCurrentSong();
                break;
                
            case YT.PlayerState.PAUSED:
                this.isPlaying = false;
                updateStatus('מושהה');
                break;
                
            case YT.PlayerState.ENDED:
                updateStatus('הפלייליסט הסתיים');
                break;
                
            case YT.PlayerState.BUFFERING:
                updateStatus('טוען...');
                break;
        }
    },
    
    // טיפול בשגיאות נגן
    onPlayerError: function(event) {
        console.error('שגיאת נגן YouTube:', event.data);
        
        let errorMessage = 'שגיאה בהפעלת השיר';
        switch(event.data) {
            case 2:
                errorMessage = 'מזהה הסרטון לא חוקי';
                break;
            case 5:
                errorMessage = 'שגיאת HTML5 Player';
                break;
            case 100:
                errorMessage = 'הסרטון לא נמצא או הוסר';
                break;
            case 101:
            case 150:
                errorMessage = 'לא ניתן להטמיע את הסרטון';
                break;
        }
        
        updateStatus(errorMessage + ' - עובר לשיר הבא...');
        
        // נסה לעבור לשיר הבא אם יש שגיאה
        setTimeout(() => this.nextTrack(), 2000);
    },
    
    // עדכון שם השיר הנוכחי
    updateCurrentSong: function() {
        if (!this.player || !this.player.getVideoData) return;
        
        try {
            const videoData = this.player.getVideoData();
            if (videoData && videoData.title) {
                document.getElementById('currentSong').textContent = videoData.title;
            } else {
                document.getElementById('currentSong').textContent = 'לא ניתן לקבל מידע על השיר';
            }
        } catch (error) {
            console.error('שגיאה בקבלת מידע על השיר:', error);
            document.getElementById('currentSong').textContent = 'שגיאה בקבלת מידע';
        }
    },
    
    // התחלת טיימר לעדכון שם השיר
    startSongUpdateTimer: function() {
        // עדכון כל 2 שניות
        setInterval(() => this.updateCurrentSong(), 2000);
    },
    
    // הפעלת שיר
    playVideo: function() {
        if (!this.player || !this.player.playVideo) return;
        this.player.playVideo();
        this.isPlaying = true;
    },
    
    // השהיית שיר
    pauseVideo: function() {
        if (!this.player || !this.player.pauseVideo) return;
        this.player.pauseVideo();
        this.isPlaying = false;
    },
    
    // מעבר לשיר הבא
    nextTrack: function() {
        if (!this.player || !this.player.nextVideo) return;
        this.player.nextVideo();
        updateStatus('עובר לשיר הבא...');
    },
    
    // מעבר לשיר הקודם
    previousTrack: function() {
        if (!this.player || !this.player.previousVideo) return;
        this.player.previousVideo();
        updateStatus('עובר לשיר הקודם...');
    },
    
    // הפעלת/כיבוי מצב ערבוב
    toggleShuffle: function() {
        this.isShuffle = !this.isShuffle;
        
        // עדכון מצב הכפתור
        const shuffleBtn = document.getElementById('shuffleBtn');
        if (this.isShuffle) {
            shuffleBtn.classList.add('shuffle-active');
            this.shufflePlaylist();
            updateStatus('מצב ערבוב: פעיל');
        } else {
            shuffleBtn.classList.remove('shuffle-active');
            updateStatus('מצב ערבוב: כבוי');
        }
    },
    
    // ערבוב הפלייליסט הנוכחי
    shufflePlaylist: function() {
        if (!this.player || !this.player.getPlaylist) return;
        
        try {
            const playlist = this.player.getPlaylist();
            if (playlist && playlist.length > 0) {
                const randomIndex = Math.floor(Math.random() * playlist.length);
                this.player.playVideoAt(randomIndex);
                updateStatus('ערבוב פלייליסט...');
            }
        } catch (error) {
            console.error('שגיאה בערבוב פלייליסט:', error);
        }
    },
    
    // שליטה בעוצמת הקול
    setVolume: function(volume) {
        if (!this.player || !this.player.setVolume) return;
        
        try {
            this.lastVolume = volume;
            this.player.setVolume(volume);
            this.updateVolumeSlider(volume);
            this.updateVolumeIcon(volume);
        } catch (error) {
            console.error('שגיאה בשינוי עוצמת הקול:', error);
        }
    },
    
    // עדכון מחוון עוצמת הקול
    updateVolumeSlider: function(volume) {
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.value = volume;
            
            // עדכון צבע המחוון כדי לשקף את רמת העוצמה
            const percentage = (volume / 100) * 100;
            volumeSlider.style.background = `linear-gradient(to right, #1db954 0%, #1db954 ${percentage}%, #666 ${percentage}%)`;
        }
    },
    
    // עדכון אייקון עוצמת הקול
    updateVolumeIcon: function(volume) {
        const volumeIcon = document.getElementById('muteBtn').querySelector('i');
        
        if (volume === 0 || this.isMuted) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (volume < 50) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    },
    
    // הפעלת/כיבוי השתקה
    toggleMute: function() {
        if (!this.player || !this.player.isMuted) return;
        
        try {
            if (this.player.isMuted()) {
                this.player.unMute();
                this.isMuted = false;
                this.updateVolumeSlider(this.lastVolume);
                this.updateVolumeIcon(this.lastVolume);
                updateStatus('השתקה: כבויה');
            } else {
                this.player.mute();
                this.isMuted = true;
                this.updateVolumeIcon(0);
                updateStatus('השתקה: פעילה');
            }
        } catch (error) {
            console.error('שגיאה בהפעלת/כיבוי השתקה:', error);
        }
    },
    
    // קבלת מזהה הפלייליסט הנוכחי
    getCurrentPlaylistId: function() {
        // בדיקה אם מנהל הפלייליסטים מוגדר
        if (typeof PlaylistManager !== 'undefined') {
            return PlaylistManager.getCurrentPlaylistId();
        }
        // ערך ברירת מחדל אם מנהל הפלייליסטים לא קיים
        return 'PLiZpXrV9jUl9q2UJZQhXgzcwAYR_bZGLM';
    },
    
    // החלפת פלייליסט
    changePlaylist: function(direction) {
        if (this.isPlaylistChanging) return;
        this.isPlaylistChanging = true;
        
        // הצגת הודעת טעינה
        updateStatus('מחליף פלייליסט...');
        
        // בחירת הפלייליסט הבא/קודם
        let playlist;
        if (direction === 'next') {
            playlist = PlaylistManager.nextPlaylist();
        } else {
            playlist = PlaylistManager.previousPlaylist();
        }
        
        // הפעלת אנימציית החלפת פלייליסט
        PlaylistManager.animatePlaylistChange();
        
        // טעינת הפלייליסט החדש
        if (this.player) {
            try {
                // השמדת הנגן הנוכחי
                this.player.destroy();
                
                // יצירת נגן חדש לאחר השהייה קצרה
                setTimeout(() => {
                    this.createPlayer();
                    this.isPlaylistChanging = false;
                }, 500);
            } catch (error) {
                console.error('שגיאה בהחלפת פלייליסט:', error);
                this.createDirectEmbed();
                this.isPlaylistChanging = false;
            }
        } else {
            // אם הנגן לא קיים, ננסה ליצור הטמעה ישירה
            this.createDirectEmbed();
            this.isPlaylistChanging = false;
        }
    }
};

// פונקציית עזר לעדכון הודעת סטטוס
function updateStatus(message) {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

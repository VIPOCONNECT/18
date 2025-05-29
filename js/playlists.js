/**
 * נגן מוזיקה לרכב - מודול ניהול פלייליסטים
 * שלב 3: תמיכה בפלייליסטים מרובים
 */

// אובייקט גלובלי לניהול פלייליסטים
const PlaylistManager = {
    // מאפיינים
    playlists: [
        { 
            id: 'PLiZpXrV9jUl9q2UJZQhXgzcwAYR_bZGLM', 
            name: '🎵 שירים ישראלים 🇮🇱', 
            description: 'מגוון שירים ישראלים פופולריים' 
        },
        { 
            id: 'PLXwcztXXCVLkIkfJzrR1Ka0fP9Zjm6bzx', 
            name: '🎤 שלמה ארצי', 
            description: 'שירים נבחרים של שלמה ארצי' 
        },
        { 
            id: 'PLs4CQGlgT9OxCtWsDBDf1kEoFvfbNXHTM', 
            name: '🌟 שירים שקטים', 
            description: 'שירים שקטים ומרגיעים לנסיעה רגועה' 
        },
        { 
            id: 'PLQkXi3HmGxA2oqOqAvD4t71gNE1vqXCXr', 
            name: '🚘 שירי דרך', 
            description: 'שירים מושלמים לנסיעות ארוכות' 
        },
        { 
            id: 'PLwcToBG_rai5tJLnJpCuZBu4D_hNhIBje', 
            name: '🕺 שירים קצביים', 
            description: 'שירים קצביים ואנרגטיים' 
        },
        { 
            id: 'PLw7V5j-tU8gg3T24nYmgB9QNI8EhC5KHw', 
            name: '🇮🇱 אייל גולן', 
            description: 'שירים נבחרים של אייל גולן' 
        }
    ],
    
    // המיקום הנוכחי בפלייליסטים
    currentIndex: 0,
    
    // שם מפתח עבור אחסון מקומי
    localStorageKey: 'carMusicPlayer_playlist',
    
    // אתחול מנהל הפלייליסטים
    init: function() {
        console.log('אתחול מנהל הפלייליסטים');
        this.loadSavedPlaylist();
        this.updatePlaylistDisplay();
    },
    
    // טעינת פלייליסט שנשמר באחסון המקומי
    loadSavedPlaylist: function() {
        try {
            const savedIndex = localStorage.getItem(this.localStorageKey);
            if (savedIndex !== null) {
                const index = parseInt(savedIndex);
                if (!isNaN(index) && index >= 0 && index < this.playlists.length) {
                    this.currentIndex = index;
                    console.log(`טעינת פלייליסט שמור: ${this.getCurrentPlaylist().name}`);
                }
            }
        } catch (error) {
            console.error('שגיאה בטעינת פלייליסט שמור:', error);
        }
    },
    
    // שמירת המיקום הנוכחי באחסון המקומי
    saveCurrentPlaylist: function() {
        try {
            localStorage.setItem(this.localStorageKey, this.currentIndex.toString());
            console.log(`שמירת פלייליסט: ${this.getCurrentPlaylist().name}`);
        } catch (error) {
            console.error('שגיאה בשמירת פלייליסט:', error);
        }
    },
    
    // קבלת אובייקט הפלייליסט הנוכחי
    getCurrentPlaylist: function() {
        return this.playlists[this.currentIndex];
    },
    
    // קבלת מזהה הפלייליסט הנוכחי
    getCurrentPlaylistId: function() {
        return this.getCurrentPlaylist().id;
    },
    
    // מעבר לפלייליסט הבא
    nextPlaylist: function() {
        this.currentIndex = (this.currentIndex + 1) % this.playlists.length;
        this.updatePlaylistDisplay();
        this.saveCurrentPlaylist();
        return this.getCurrentPlaylist();
    },
    
    // מעבר לפלייליסט הקודם
    previousPlaylist: function() {
        this.currentIndex = (this.currentIndex - 1 + this.playlists.length) % this.playlists.length;
        this.updatePlaylistDisplay();
        this.saveCurrentPlaylist();
        return this.getCurrentPlaylist();
    },
    
    // עדכון תצוגת הפלייליסט
    updatePlaylistDisplay: function() {
        const playlist = this.getCurrentPlaylist();
        const playlistNameElement = document.getElementById('playlistName');
        const playlistDescElement = document.getElementById('playlistDescription');
        
        if (playlistNameElement) {
            playlistNameElement.textContent = playlist.name;
        }
        
        if (playlistDescElement) {
            playlistDescElement.textContent = playlist.description;
        }
    },
    
    // הוספת אנימציית החלפת פלייליסט
    animatePlaylistChange: function() {
        const playlistInfo = document.querySelector('.playlist-info');
        
        if (playlistInfo) {
            // הוספת אנימציה
            playlistInfo.classList.add('playlist-change-animation');
            
            // הסרת האנימציה לאחר שהיא הסתיימה
            setTimeout(() => {
                playlistInfo.classList.remove('playlist-change-animation');
            }, 500);
        }
    }
};

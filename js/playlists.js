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
            name: '🎴 שלמה ארצי', 
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
    
    // מפתח עבור פלייליסטים מותאמים אישית
    localStorageKeyCustomPlaylists: 'carMusicPlayer_customPlaylists',
    
    // אתחול מנהל הפלייליסטים
    init: function() {
        console.log('אתחול מנהל הפלייליסטים');
        this.loadCustomPlaylists(); // טעינת פלייליסטים מותאמים אישית
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
    },
    // טעינת פלייליסטים מותאמים אישית
    loadCustomPlaylists: function() {
        try {
            const customPlaylistsJson = localStorage.getItem(this.localStorageKeyCustomPlaylists);
            if (customPlaylistsJson) {
                const customPlaylists = JSON.parse(customPlaylistsJson);
                // הוספת הפלייליסטים המותאמים לרשימה הכללית
                this.playlists = [...this.playlists, ...customPlaylists];
                console.log(`נטענו ${customPlaylists.length} פלייליסטים מותאמים אישית`);
            }
        } catch (error) {
            console.error('שגיאה בטעינת פלייליסטים מותאמים אישית:', error);
        }
    },
    
    // הוספת פלייליסט מותאם אישית
    addCustomPlaylist: function(name, id, description) {
        // יצירת אובייקט פלייליסט חדש
        const newPlaylist = {
            id: id,
            name: name,
            description: description,
            isCustom: true  // סימון שזה פלייליסט מותאם אישית
        };
        
        try {
            // טעינת פלייליסטים קיימים
            let customPlaylists = [];
            const customPlaylistsJson = localStorage.getItem(this.localStorageKeyCustomPlaylists);
            
            if (customPlaylistsJson) {
                customPlaylists = JSON.parse(customPlaylistsJson);
            }
            
            // הוספת הפלייליסט החדש
            customPlaylists.push(newPlaylist);
            
            // שמירה חזרה ב-localStorage
            localStorage.setItem(this.localStorageKeyCustomPlaylists, JSON.stringify(customPlaylists));
            
            // הוספת הפלייליסט לרשימה הנוכחית
            this.playlists.push(newPlaylist);
            
            console.log(`נוסף פלייליסט חדש: ${name}`);
            return true;
        } catch (error) {
            console.error('שגיאה בהוספת פלייליסט מותאם אישית:', error);
            return false;
        }
    },
    
    // הסרת פלייליסט מותאם אישית
    removeCustomPlaylist: function(playlistId) {
        try {
            // טעינת פלייליסטים קיימים
            const customPlaylistsJson = localStorage.getItem(this.localStorageKeyCustomPlaylists);
            
            if (customPlaylistsJson) {
                let customPlaylists = JSON.parse(customPlaylistsJson);
                
                // הסרת הפלייליסט
                customPlaylists = customPlaylists.filter(p => p.id !== playlistId);
                
                // שמירה חזרה ב-localStorage
                localStorage.setItem(this.localStorageKeyCustomPlaylists, JSON.stringify(customPlaylists));
                
                // עדכון הרשימה הנוכחית
                this.playlists = this.playlists.filter(p => p.id !== playlistId);
                
                console.log(`הוסר פלייליסט עם מזהה: ${playlistId}`);
                return true;
            }
        } catch (error) {
            console.error('שגיאה בהסרת פלייליסט מותאם אישית:', error);
        }
        return false;
    }
};

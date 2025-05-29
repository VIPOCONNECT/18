/**
 * נגן מוזיקה לרכב - אפליקציה ראשית
 * שלב 4: תכונות מתקדמות - מצבי יום/לילה, PWA ותצוגת מידע שיר
 */

// הגדרת משתנים גלובליים
let player; // אובייקט הנגן של YouTube
const statusMessage = document.getElementById('status-message');
const playlistName = document.getElementById('playlistName');
const playlistDescription = document.getElementById('playlistDescription');
const prevPlaylistBtn = document.getElementById('prevPlaylistBtn');
const nextPlaylistBtn = document.getElementById('nextPlaylistBtn');
const trackTitle = document.getElementById('trackTitle');
const progressBar = document.getElementById('progressBar');
const currentTime = document.getElementById('currentTime');
const duration = document.getElementById('duration');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const installBtn = document.getElementById('installBtn');

// פונקציה שתופעל כאשר YouTube API נטען
function onYouTubeIframeAPIReady() {
    statusMessage.textContent = 'טוען פלייליסט...';
    
    // יצירת נגן YouTube דרך מודול MusicPlayer
    try {
        MusicPlayer.init();
    } catch (error) {
        console.error('שגיאה בטעינת נגן YouTube:', error);
        statusMessage.textContent = 'שגיאה בטעינת הנגן. מנסה שנית...';
        
        // ניסיון שני עם השהייה קצרה
        setTimeout(() => {
            try {
                MusicPlayer.init();
            } catch (secondError) {
                console.error('ניסיון שני נכשל:', secondError);
                statusMessage.textContent = 'לא ניתן לטעון את הנגן. נא לרענן את הדף.';
                
                // גישה ישירה ליצירת iframe
                MusicPlayer.createDirectEmbed();
            }
        }, 2000);
    }
}

// עדכון הודעת סטטוס
function updateStatus(message) {
    if (statusMessage) {
        statusMessage.textContent = message;
        
        // הוספת אנימציה להודעה
        statusMessage.classList.remove('fade-in');
        // טריק CSS - גורם לדפדפן להפעיל מחדש את האנימציה
        void statusMessage.offsetWidth;
        statusMessage.classList.add('fade-in');
        
        // הסתרת ההודעה אחרי 3 שניות אם זו לא הודעת שגיאה
        if (!message.includes('שגיאה') && !message.includes('לא ניתן')) {
            setTimeout(() => {
                statusMessage.textContent = '';
            }, 3000);
        }
    }
    
    // שליחת הודעה לקונסול לצורכי ניפוי תקלות
    console.log(`סטטוס: ${message}`);
}

// טיפול בשגיאות נגן
function onPlayerError(event) {
    console.error('שגיאת נגן YouTube:', event.data);
    
    switch(event.data) {
        case 2:
            updateStatus('מזהה הסרטון לא חוקי');
            break;
        case 5:
            updateStatus('שגיאת HTML5 Player');
            break;
        case 100:
            updateStatus('הסרטון לא נמצא או הוסר');
            break;
        case 101:
        case 150:
            updateStatus('לא ניתן להטמיע את הסרטון');
            break;
        default:
            updateStatus('שגיאה בנגן. קוד: ' + event.data);
    }
    
    // נסה לעבור לסרטון הבא אם יש שגיאה
    if (MusicPlayer.player && typeof MusicPlayer.player.nextVideo === 'function') {
        setTimeout(() => {
            MusicPlayer.player.nextVideo();
        }, 3000);
    }
}

// הגדרת מאזיני אירועים לכפתורי הניגון
function setupEventListeners() {
    console.log('מגדיר מאזיני אירועים');
    
    // כפתורי ניגון בסיסיים
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const muteBtn = document.getElementById('muteBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    
    // כפתור הפעלה
    if (playBtn) {
        playBtn.addEventListener('click', () => MusicPlayer.playVideo());
    }
    
    // כפתור השהייה
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => MusicPlayer.pauseVideo());
    }
    
    // כפתור הקודם
    if (prevBtn) {
        prevBtn.addEventListener('click', () => MusicPlayer.previousVideo());
    }
    
    // כפתור הבא
    if (nextBtn) {
        nextBtn.addEventListener('click', () => MusicPlayer.nextVideo());
    }
    
    // כפתור ערבוב
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', () => MusicPlayer.toggleShuffle());
    }
    
    // כפתור השתקה
    if (muteBtn) {
        muteBtn.addEventListener('click', () => MusicPlayer.toggleMute());
    }
    
    // מחוון עוצמת קול
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            MusicPlayer.setVolume(e.target.value);
        });
    }
    
    // כפתורי ניווט בין פלייליסטים
    if (prevPlaylistBtn) {
        prevPlaylistBtn.addEventListener('click', () => {
            MusicPlayer.changePlaylist('prev');
        });
    }
    
    if (nextPlaylistBtn) {
        nextPlaylistBtn.addEventListener('click', () => {
            MusicPlayer.changePlaylist('next');
        });
    }
}

// הגדרת מאזיני אירועים לדיאלוג הוספת פלייליסט
function setupPlaylistModalListeners() {
    console.log('מגדיר מאזיני אירועים לדיאלוג הוספת פלייליסט');
    
    // טיפול בהוספת פלייליסט
    const addPlaylistBtn = document.getElementById('addPlaylistBtn');
    const playlistModal = document.getElementById('playlistModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const addPlaylistForm = document.getElementById('addPlaylistForm');
    
    // פתיחת הדיאלוג
    if (addPlaylistBtn) {
        addPlaylistBtn.addEventListener('click', () => {
            playlistModal.style.display = 'block';
        });
    }
    
    // סגירת הדיאלוג בלחיצה על X
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            playlistModal.style.display = 'none';
        });
    }
    
    // סגירת הדיאלוג בלחיצה מחוץ לתוכן
    window.addEventListener('click', (event) => {
        if (event.target === playlistModal) {
            playlistModal.style.display = 'none';
        }
    });
    
    // טיפול בשליחת הטופס
    if (addPlaylistForm) {
        addPlaylistForm.addEventListener('submit', (event) => {
            event.preventDefault();
            
            const name = document.getElementById('playlistName').value;
            const id = document.getElementById('playlistId').value;
            const description = document.getElementById('playlistDescription').value;
            
            if (name && id) {
                // בדיקה שהמזהה תקין
                if (!id.match(/^PL[a-zA-Z0-9_-]+$/)) {
                    alert('מזהה הפלייליסט אינו תקין. אנא העתק את המזהה מכתובת ה-URL של הפלייליסט ביוטיוב.');
                    return;
                }
                
                // הוספת אימוג'י בתחילת השם אם אין כזה
                const nameWithEmoji = name.match(/^\p{Emoji}/u) ? name : `🎵 ${name}`;
                
                // ניסיון להוסיף את הפלייליסט
                if (PlaylistManager.addCustomPlaylist(nameWithEmoji, id, description)) {
                    alert('הפלייליסט נוסף בהצלחה!');
                    playlistModal.style.display = 'none';
                    
                    // איפוס הטופס
                    addPlaylistForm.reset();
                    
                    // מעבר לפלייליסט החדש
                    PlaylistManager.currentIndex = PlaylistManager.playlists.length - 1;
                    PlaylistManager.updatePlaylistDisplay();
                    MusicPlayer.changePlaylist('current');
                } else {
                    alert('אירעה שגיאה בהוספת הפלייליסט.');
                }
            } else {
                alert('אנא מלא את כל השדות הנדרשים.');
            }
        });
    }
}

// הוספת מאזין טעינת דף
window.addEventListener('load', () => {
    console.log('הדף נטען');
    
    // אתחול מנהלי המודולים
    if (typeof ThemeManager !== 'undefined') {
        ThemeManager.init();
    }
    
    if (typeof PWAManager !== 'undefined') {
        PWAManager.init();
    }
    
    // הגדרת מאזיני אירועים
    setupEventListeners();
    
    // הגדרת מאזיני אירועים לדיאלוג הוספת פלייליסט
    setupPlaylistModalListeners();
    
    // אם הנגן לא נטען אחרי 5 שניות, נסה לטעון ישירות
    setTimeout(() => {
        if (!MusicPlayer.player || typeof MusicPlayer.player.getPlayerState !== 'function') {
            console.log('נגן YouTube לא נטען. מנסה שיטה חלופית...');
            MusicPlayer.createDirectEmbed();
        }
    }, 5000);
});

// שמירת הגדרות בסגירת הדף
window.addEventListener('beforeunload', () => {
    console.log('שומר הגדרות...');
    // כל פעולות השמירה מטופלות במודולים השונים
});

// הוספת מאזין לאירוע שינוי שיר
document.addEventListener('track-info-updated', (event) => {
    console.log('עדכון מידע שיר:', event.detail.title);
    
    // שליחת אירוע ניווט אם קיים
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: event.detail.title,
            artist: 'YouTube Music',
            album: playlistName ? playlistName.textContent : '',
            artwork: [
                { src: `https://img.youtube.com/vi/${event.detail.videoId}/hqdefault.jpg`, sizes: '480x360', type: 'image/jpeg' }
            ]
        });
    }
});

// הוספת מאזין לשינוי גודל מסך
window.addEventListener('resize', () => {
    // התאמת הממשק לגודל המסך הנוכחי
    const viewportHeight = window.innerHeight;
    document.documentElement.style.setProperty('--viewport-height', `${viewportHeight}px`);
});

// חיבור לאירועי מקלדת עבור קיצורי מקשים
document.addEventListener('keydown', (event) => {
    // מניעת קיצורי מקשים אם אנחנו בתוך שדה טקסט
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch (event.key) {
        case ' ': // מקש רווח - הפעלה/השהייה
            if (MusicPlayer.isPlaying) {
                MusicPlayer.pauseVideo();
            } else {
                MusicPlayer.playVideo();
            }
            event.preventDefault();
            break;
            
        case 'ArrowRight': // חץ ימינה - שיר הבא (מותאם לעברית)
            MusicPlayer.previousVideo();
            event.preventDefault();
            break;
            
        case 'ArrowLeft': // חץ שמאלה - שיר קודם (מותאם לעברית)
            MusicPlayer.nextVideo();
            event.preventDefault();
            break;
            
        case 'ArrowUp': // חץ למעלה - הגברת עוצמת קול
            MusicPlayer.increaseVolume(10);
            event.preventDefault();
            break;
            
        case 'ArrowDown': // חץ למטה - הנמכת עוצמת קול
            MusicPlayer.decreaseVolume(10);
            event.preventDefault();
            break;
            
        case 'm': // m - השתקה
            MusicPlayer.toggleMute();
            event.preventDefault();
            break;
    }
});



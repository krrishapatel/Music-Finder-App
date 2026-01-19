// Main Application Logic for Song Stuck in My Head
// This file handles user interactions and search functionality

class SongSearchApp {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.initializeElements();
        this.attachEventListeners();
        this.initializeApp();
    }

    // Get references to all DOM elements we'll need
    initializeElements() {
        // Search inputs and buttons
        this.lyricsInput = document.getElementById('lyrics-input');
        this.descriptionInput = document.getElementById('description-input');
        this.lyricsSearchBtn = document.getElementById('lyrics-search-btn');
        this.descriptionSearchBtn = document.getElementById('description-search-btn');

        // Audio recording elements
        this.startRecordingBtn = document.getElementById('start-recording-btn');
        this.stopRecordingBtn = document.getElementById('stop-recording-btn');
        this.audioRecorder = document.getElementById('audio-recorder');
        this.audioStatus = document.getElementById('audio-status');
        this.audioPermissionNotice = document.getElementById('audio-permission-notice');
        this.audioProcessing = document.getElementById('audio-processing');
        this.audioResults = document.getElementById('audio-results');
        this.progressFill = document.getElementById('progress-fill');

        // Results and UI elements
        this.resultsSection = document.getElementById('results-section');
        this.resultsContainer = document.getElementById('results-container');
        this.loadingElement = document.getElementById('loading');

        console.log('Elements initialized:', {
            lyricsInput: !!this.lyricsInput,
            descriptionInput: !!this.descriptionInput,
            audioRecorder: !!this.audioRecorder,
            resultsSection: !!this.resultsSection
        });
    }

    // Set up event listeners for user interactions
    attachEventListeners() {
        // Lyrics search
        this.lyricsSearchBtn.addEventListener('click', () => {
            this.handleLyricsSearch();
        });

        // Allow Enter key to trigger search
        this.lyricsInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.handleLyricsSearch();
            }
        });

        // Description search
        this.descriptionSearchBtn.addEventListener('click', () => {
            this.handleDescriptionSearch();
        });

        this.descriptionInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.handleDescriptionSearch();
            }
        });

        // Audio recording
        this.startRecordingBtn.addEventListener('click', () => {
            this.startRecording();
        });

        this.stopRecordingBtn.addEventListener('click', () => {
            this.stopRecording();
        });

        console.log('Event listeners attached');
    }

    // Initialize the app when page loads
    async initializeApp() {
        console.log('Song Search App initialized!');
        console.log('Available songs in database:', songsDatabase.length);

        // Check initial microphone permission status
        await this.checkInitialMicrophonePermission();
    }

    // Check microphone permission on app load
    async checkInitialMicrophonePermission() {
        try {
            const result = await navigator.permissions.query({ name: 'microphone' });
            this.updateMicrophoneStatusIndicator(result.state);
        } catch (error) {
            // Permission API not supported, hide indicator
            console.log('Permission API not supported');
        }
    }

    // Update the microphone status indicator in UI
    updateMicrophoneStatusIndicator(status) {
        // You could add a status indicator element to the UI
        console.log('Microphone permission status:', status);
    }

    // Handle lyrics-based search
    handleLyricsSearch() {
        const searchText = this.lyricsInput.value.trim().toLowerCase();

        if (!searchText) {
            this.showError('Please enter some lyrics to search for.');
            return;
        }

        console.log('Searching for lyrics:', searchText);
        this.showLoading();

        // Simulate API delay (in real app, this would be an actual API call)
        setTimeout(() => {
            const results = this.searchByLyrics(searchText);
            this.displayResults(results, `lyrics containing "${this.lyricsInput.value}"`);
            this.hideLoading();
        }, 1000); // 1 second delay for demo
    }

    // Handle description-based search
    handleDescriptionSearch() {
        const searchText = this.descriptionInput.value.trim().toLowerCase();

        if (!searchText) {
            this.showError('Please describe the song you\'re looking for.');
            return;
        }

        console.log('Searching for description:', searchText);
        this.showLoading();

        setTimeout(() => {
            const results = this.searchByDescription(searchText);
            this.displayResults(results, `songs matching "${this.descriptionInput.value}"`);
            this.hideLoading();
        }, 1200); // Slightly longer delay
    }

    // Search songs by lyrics content
    searchByLyrics(searchText) {
        const results = [];

        for (const song of songsDatabase) {
            const lyrics = song.lyrics.toLowerCase();
            const title = song.title.toLowerCase();
            const artist = song.artist.toLowerCase();

            // Check if search text appears in lyrics, title, or artist
            if (lyrics.includes(searchText) ||
                title.includes(searchText) ||
                artist.includes(searchText)) {
                results.push(song);
            }
        }

        return results;
    }

    // Search songs by description/tags
    searchByDescription(searchText) {
        const results = [];
        const searchWords = searchText.split(' ');

        for (const song of songsDatabase) {
            let score = 0;
            const description = song.description.toLowerCase();
            const genre = song.genre.toLowerCase();
            const tags = song.tags.join(' ').toLowerCase();

            // Check each search word against various fields
            for (const word of searchWords) {
                if (word.length < 2) continue; // Skip very short words

                // Higher score for exact matches
                if (description.includes(word)) score += 3;
                if (genre.includes(word)) score += 2;
                if (tags.includes(word)) score += 2;
                if (song.title.toLowerCase().includes(word)) score += 1;
                if (song.artist.toLowerCase().includes(word)) score += 1;
            }

            // Only include songs with some relevance
            if (score > 0) {
                results.push({
                    ...song,
                    relevanceScore: score
                });
            }
        }

        // Sort by relevance score (highest first)
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // Display search results
    displayResults(results, searchQuery, isAudioSearch = false) {
        // Clear previous results
        this.resultsContainer.innerHTML = '';

        if (results.length === 0) {
            this.showNoResults(searchQuery);
            return;
        }

        // Update section title
        const resultsTitle = this.resultsSection.querySelector('h2');
        const resultType = isAudioSearch ? 'audio match' : 'result';
        resultsTitle.textContent = `🔍 Found ${results.length} ${resultType}${results.length !== 1 ? 'es' : ''} for ${searchQuery}`;

        // Create result cards
        for (const song of results) {
            const songCard = this.createSongCard(song, isAudioSearch);
            this.resultsContainer.appendChild(songCard);
        }

        // Show results section
        this.resultsSection.classList.remove('hidden');

        // Scroll to results
        this.resultsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    // Create a song result card
    createSongCard(song, isAudioSearch = false) {
        const card = document.createElement('div');
        card.className = 'song-result';

        // Add confidence score for audio searches
        const confidenceHTML = isAudioSearch ?
            `<div class="confidence-score">
                <span class="confidence-label">🎵 Match: ${song.audioConfidence}%</span>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${song.audioConfidence}%"></div>
                </div>
            </div>` : '';

        card.innerHTML = `
            <h3 class="song-title">${song.title}</h3>
            <p class="song-artist">by ${song.artist}</p>

            ${confidenceHTML}

            <div class="song-info">
                <span class="song-tag">${song.year}</span>
                <span class="song-tag">${song.genre}</span>
                <span class="song-tag">${song.album}</span>
            </div>

            <div class="song-lyrics">
                "${song.lyrics.split('.')[0]}..."
            </div>

            <div class="song-description">
                <small>${song.description}</small>
            </div>

            <div class="song-actions">
                <button class="action-btn" onclick="app.playSong('${song.title}')">▶️ Play</button>
                <button class="action-btn" onclick="app.saveSong(${song.id})">💾 Save</button>
                <button class="action-btn" onclick="app.shareSong(${song.id})">📤 Share</button>
            </div>
        `;

        return card;
    }

    // Show "no results" message
    showNoResults(searchQuery) {
        const noResultsCard = document.createElement('div');
        noResultsCard.className = 'song-result';
        noResultsCard.innerHTML = `
            <h3>😔 No songs found</h3>
            <p>We couldn't find any songs matching "${searchQuery}".</p>
            <div class="song-actions">
                <button class="action-btn" onclick="app.showSuggestions()">💡 Get Suggestions</button>
                <button class="action-btn" onclick="app.tryDifferentSearch()">🔄 Try Different Search</button>
            </div>
        `;

        this.resultsContainer.appendChild(noResultsCard);
        this.resultsSection.classList.remove('hidden');
    }

    // Audio Recording Methods
    async startRecording() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create MediaRecorder
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            // Set up event handlers
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                this.processRecordedAudio();
            };

            // Start recording
            this.mediaRecorder.start();
            this.isRecording = true;

            // Update UI
            this.updateRecordingUI(true);

            // Hide permission notice since we got access
            if (this.audioPermissionNotice) {
                this.audioPermissionNotice.style.display = 'none';
            }

            console.log('Recording started');

        } catch (error) {
            console.error('Error accessing microphone:', error);

            // Show user-friendly error message with instructions
            this.showMicrophoneError();

            // Reset UI state
            this.updateRecordingUI(false);
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;

            // Stop all tracks to release microphone
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());

            // Update UI to show processing
            this.showAudioProcessing();

            console.log('Recording stopped');
        }
    }

    updateRecordingUI(isRecording) {
        if (isRecording) {
            this.audioRecorder.classList.add('recording-active');
            this.startRecordingBtn.disabled = true;
            this.stopRecordingBtn.disabled = false;
            this.audioStatus.querySelector('p').textContent = '🔴 Recording... Click "Stop Recording" when done';
        } else {
            this.audioRecorder.classList.remove('recording-active');
            this.startRecordingBtn.disabled = false;
            this.stopRecordingBtn.disabled = true;
            this.audioStatus.querySelector('p').textContent = 'Click "Start Recording" to hum or sing your song';
        }
    }

    showAudioProcessing() {
        this.audioProcessing.classList.remove('hidden');
        this.audioStatus.classList.add('hidden');
        this.audioResults.classList.add('hidden');

        // Animate progress bar
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 2;
            this.progressFill.style.width = progress + '%';

            if (progress >= 100) {
                clearInterval(progressInterval);
            }
        }, 100);
    }

    processRecordedAudio() {
        // Simulate audio processing delay
        setTimeout(() => {
            // Hide processing, show results
            this.audioProcessing.classList.add('hidden');
            this.audioResults.classList.remove('hidden');
            this.audioStatus.classList.remove('hidden');

            // Generate mock results based on audio "analysis"
            this.generateAudioResults();

            console.log('Audio processing complete');
        }, 3000); // 3 second processing time
    }

    generateAudioResults() {
        // Advanced audio recognition - analyze recording patterns and match to song characteristics
        // In a real app, this would use actual audio fingerprinting algorithms

        // Get recording metadata (simulated analysis)
        const recordingDuration = this.mediaRecorder ? 5 + Math.random() * 10 : 7; // Simulate 5-15 second recording
        const audioFeatures = this.analyzeAudioFeatures(recordingDuration);

        // Match songs based on analyzed features
        const matchedSongs = this.findMatchingSongs(audioFeatures);

        // Sort by relevance and take top matches
        const topMatches = matchedSongs
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 5);

        // Convert to result format with confidence scores
        const results = topMatches.map(match => {
            const song = songsDatabase.find(s => s.id === match.id);
            return {
                ...song,
                audioConfidence: Math.round(match.relevanceScore * 100)
            };
        });

        // Display results
        this.displayResults(results, 'your hummed melody', true);
    }

    analyzeAudioFeatures(duration) {
        // Advanced audio analysis for humming recognition
        // Simulates real audio fingerprinting and melody analysis

        const features = {
            duration: duration,
            complexity: this.analyzeMelodyComplexity(duration),
            tempo: this.analyzeHummingTempo(duration),
            vocalStyle: this.analyzeVocalCharacteristics(),
            melodyType: this.classifyMelodyPattern(duration),
            emotionalTone: this.detectEmotionalTone(duration),
            pitchRange: this.estimatePitchRange(duration),
            rhythm: this.analyzeRhythmicPatterns(duration)
        };

        console.log('🎵 Advanced audio analysis:', features);
        return features;
    }

    analyzeMelodyComplexity(duration) {
        // Analyze melody complexity based on humming duration and patterns
        if (duration < 4) return 'very_simple';      // Twinkle Twinkle, Happy Birthday
        if (duration < 7) return 'simple';           // Children's songs, basic melodies
        if (duration < 10) return 'moderate';        // Pop songs, simple anthems
        if (duration < 15) return 'complex';         // Rock songs, detailed melodies
        return 'very_complex';                       // Operatic, progressive pieces
    }

    analyzeHummingTempo(duration) {
        // People hum at different speeds based on song familiarity
        if (duration < 6) return 'very_fast';        // Quick, familiar tunes
        if (duration < 9) return 'fast';            // Upbeat pop songs
        if (duration < 12) return 'medium';         // Standard tempo
        if (duration < 15) return 'slow';           // Ballads, emotional songs
        return 'very_slow';                         // Slow, dramatic pieces
    }

    analyzeVocalCharacteristics() {
        // Analyze vocal style from humming patterns
        const styles = [
            'gentle', 'emotional', 'powerful', 'raw', 'smooth',
            'passionate', 'dreamy', 'confident', 'vulnerable', 'bold'
        ];
        // Weight towards more common humming styles
        const weightedStyles = [
            'gentle', 'gentle', 'emotional', 'emotional', 'powerful',
            'raw', 'smooth', 'smooth', 'passionate', 'dreamy'
        ];
        return weightedStyles[Math.floor(Math.random() * weightedStyles.length)];
    }

    classifyMelodyPattern(duration) {
        // Classify based on common humming patterns and song types
        if (duration < 5) {
            // Very short: Simple, repetitive songs
            return ['simple', 'celebratory', 'repetitive', 'nursery'][Math.floor(Math.random() * 4)];
        } else if (duration < 8) {
            // Short: Pop, folk, simple anthems
            return ['catchy', 'anthemic', 'nostalgic', 'folk', 'pop'][Math.floor(Math.random() * 5)];
        } else if (duration < 12) {
            // Medium: Rock, romantic, dance
            return ['romantic', 'anthemic', 'dance', 'rock', 'emotional'][Math.floor(Math.random() * 5)];
        } else {
            // Long: Complex, spiritual, operatic
            return ['operatic', 'progressive', 'spiritual', 'mysterious', 'dramatic'][Math.floor(Math.random() * 5)];
        }
    }

    detectEmotionalTone(duration) {
        // Detect emotional tone from humming duration and intensity
        if (duration < 6) return 'joyful';          // Happy, celebratory
        if (duration < 9) return 'melancholic';     // Reflective, sad
        if (duration < 12) return 'passionate';     // Love, intensity
        if (duration < 15) return 'mysterious';     // Intriguing, haunting
        return 'profound';                          // Deep emotional content
    }

    estimatePitchRange(duration) {
        // Estimate vocal range from humming patterns
        if (duration < 7) return 'narrow';          // Limited range, simple songs
        if (duration < 11) return 'medium';         // Standard range
        return 'wide';                              // Wide range, complex songs
    }

    analyzeRhythmicPatterns(duration) {
        // Analyze rhythmic complexity
        if (duration < 6) return 'simple';          // Steady, simple rhythm
        if (duration < 10) return 'moderate';       // Some variation
        return 'complex';                           // Complex rhythms
    }

    analyzeEnergyLevel(duration) {
        // Analyze energy/intensity of humming
        if (duration < 5) return 'high';           // Short, intense bursts
        if (duration < 10) return 'medium';        // Moderate energy
        return 'varied';                           // Long, varied energy
    }

    analyzeTimbreCharacteristics() {
        // Analyze vocal tone characteristics
        const timbres = ['bright', 'warm', 'dark', 'clear', 'husky', 'nasal', 'full'];
        return timbres[Math.floor(Math.random() * timbres.length)];
    }

    analyzeDynamicRange(duration) {
        // Analyze volume changes during humming
        if (duration < 8) return 'consistent';      // Steady volume
        if (duration < 12) return 'moderate';       // Some volume changes
        return 'expressive';                        // Lots of dynamics
    }

    // Enhanced matching with additional audio features
    calculateAdvancedRelevance(audioFeatures, song) {
        let bonus = 0;

        // Energy level matching
        if (audioFeatures.energy === 'high' && song.tempo === 'fast') bonus += 0.1;
        if (audioFeatures.energy === 'varied' && song.genre === 'Rock') bonus += 0.1;

        // Timbre matching
        if (audioFeatures.timbre === 'bright' && song.genre === 'Pop') bonus += 0.1;
        if (audioFeatures.timbre === 'warm' && song.genre === 'R&B') bonus += 0.1;
        if (audioFeatures.timbre === 'dark' && song.genre === 'Rock') bonus += 0.1;

        // Dynamics matching
        if (audioFeatures.dynamics === 'expressive' && song.vocalStyle === 'emotional') bonus += 0.1;

        return bonus;
    }

    findMatchingSongs(audioFeatures) {
        const matches = [];

        for (const song of songsDatabase) {
            let relevanceScore = 0;
            let matchReasons = [];

            // ===== MELODY COMPLEXITY MATCHING (High Weight) =====
            if (this.matchComplexity(audioFeatures.complexity, song)) {
                const weight = this.getComplexityWeight(audioFeatures.complexity);
                relevanceScore += weight;
                matchReasons.push(`Complexity: ${audioFeatures.complexity}`);
            }

            // ===== MELODY TYPE MATCHING (High Weight) =====
            if (audioFeatures.melodyType === song.melodyType) {
                relevanceScore += 0.4;
                matchReasons.push(`Melody: ${song.melodyType}`);
            } else if (this.isRelatedMelodyType(audioFeatures.melodyType, song.melodyType)) {
                relevanceScore += 0.2;
                matchReasons.push(`Related melody: ${song.melodyType}`);
            }

            // ===== TEMPO MATCHING =====
            if (this.matchTempo(audioFeatures.tempo, song.tempo)) {
                relevanceScore += 0.25;
                matchReasons.push(`Tempo: ${song.tempo}`);
            }

            // ===== VOCAL STYLE MATCHING =====
            if (audioFeatures.vocalStyle === song.vocalStyle) {
                relevanceScore += 0.3;
                matchReasons.push(`Style: ${song.vocalStyle}`);
            } else if (this.isRelatedVocalStyle(audioFeatures.vocalStyle, song.vocalStyle)) {
                relevanceScore += 0.15;
                matchReasons.push(`Related style: ${song.vocalStyle}`);
            }

            // ===== EMOTIONAL TONE MATCHING =====
            if (this.matchEmotionalTone(audioFeatures.emotionalTone, song)) {
                relevanceScore += 0.2;
                matchReasons.push(`Emotion: ${audioFeatures.emotionalTone}`);
            }

            // ===== GENRE PREFERENCES =====
            const genreBonus = this.getGenreBonus(audioFeatures, song);
            if (genreBonus > 0) {
                relevanceScore += genreBonus;
                matchReasons.push(`Genre: ${song.genre}`);
            }

            // ===== DURATION PATTERNS =====
            if (this.matchDurationPattern(audioFeatures.duration, song)) {
                relevanceScore += 0.1;
                matchReasons.push(`Duration pattern`);
            }

            // ===== ADVANCED AUDIO FEATURES =====
            const advancedBonus = this.calculateAdvancedRelevance(audioFeatures, song);
            if (advancedBonus > 0) {
                relevanceScore += advancedBonus;
                matchReasons.push(`Advanced features`);
            }

            // ===== PITCH RANGE BONUS =====
            if (audioFeatures.pitchRange === 'wide' && song.genre === 'Rock') {
                relevanceScore += 0.1;
            }
            if (audioFeatures.pitchRange === 'narrow' && song.genre === 'Pop') {
                relevanceScore += 0.1;
            }

            // ===== RHYTHM COMPLEXITY =====
            if (audioFeatures.rhythm === song.tempo) {
                relevanceScore += 0.1;
            }

            // ===== YEAR/ERA BONUSES =====
            if (audioFeatures.emotionalTone === 'nostalgic' && song.year < 2000) {
                relevanceScore += 0.1;
            }
            if (audioFeatures.emotionalTone === 'modern' && song.year >= 2010) {
                relevanceScore += 0.1;
            }

            // Only include songs with meaningful relevance (at least 15% match)
            if (relevanceScore >= 0.15) {
                matches.push({
                    id: song.id,
                    relevanceScore: Math.min(relevanceScore, 1.0),
                    matchReasons: matchReasons
                });
            }
        }

        return matches;
    }

    matchComplexity(audioComplexity, song) {
        const complexityMap = {
            'very_simple': ['simple', 'celebratory', 'repetitive'],
            'simple': ['simple', 'celebratory', 'repetitive', 'nursery'],
            'moderate': ['romantic', 'anthemic', 'nostalgic', 'catchy', 'pop'],
            'complex': ['operatic', 'progressive', 'mysterious', 'spiritual', 'rock'],
            'very_complex': ['operatic', 'progressive', 'mysterious', 'spiritual', 'dramatic']
        };

        return complexityMap[audioComplexity]?.includes(song.melodyType) ||
               audioComplexity === 'very_simple' && song.genre === 'Children\'s Music' ||
               audioComplexity === 'simple' && song.genre === 'Traditional';
    }

    getComplexityWeight(complexity) {
        const weights = {
            'very_simple': 0.5,
            'simple': 0.4,
            'moderate': 0.35,
            'complex': 0.3,
            'very_complex': 0.25
        };
        return weights[complexity] || 0.2;
    }

    isRelatedMelodyType(audioType, songType) {
        const relatedTypes = {
            'romantic': ['emotional', 'passionate', 'love'],
            'anthemic': ['uplifting', 'powerful', 'anthem'],
            'nostalgic': ['emotional', 'melancholic', 'dreamy'],
            'catchy': ['fun', 'upbeat', 'pop'],
            'operatic': ['powerful', 'dramatic', 'emotional'],
            'spiritual': ['mysterious', 'peaceful', 'profound']
        };

        return relatedTypes[audioType]?.includes(songType) || false;
    }

    isRelatedVocalStyle(audioStyle, songStyle) {
        const relatedStyles = {
            'gentle': ['soft', 'calm', 'sweet'],
            'emotional': ['passionate', 'vulnerable', 'raw'],
            'powerful': ['strong', 'energetic', 'commanding'],
            'raw': ['emotional', 'authentic', 'real'],
            'smooth': ['calm', 'confident', 'sultry']
        };

        return relatedStyles[audioStyle]?.includes(songStyle) || false;
    }

    matchTempo(audioTempo, songTempo) {
        const tempoMap = {
            'very_fast': ['fast', 'upbeat', 'energetic'],
            'fast': ['fast', 'upbeat', 'medium'],
            'medium': ['medium', 'moderate'],
            'slow': ['slow', 'medium', 'ballad'],
            'very_slow': ['slow', 'ballad', 'very_slow']
        };

        return audioTempo === songTempo ||
               tempoMap[audioTempo]?.includes(songTempo) ||
               false;
    }

    matchEmotionalTone(tone, song) {
        // Match emotional tone with song characteristics
        const toneMatches = {
            'joyful': song.melodyType === 'celebratory' || song.tags.includes('happy') || song.tags.includes('fun'),
            'melancholic': song.melodyType === 'emotional' || song.melodyType === 'ballad' || song.tags.includes('sad'),
            'passionate': song.melodyType === 'romantic' || song.melodyType === 'intense' || song.tags.includes('love'),
            'mysterious': song.melodyType === 'mysterious' || song.melodyType === 'spiritual' || song.tags.includes('haunting'),
            'profound': song.melodyType === 'spiritual' || song.year < 1980 || song.genre === 'Rock'
        };

        return toneMatches[tone] || false;
    }

    getGenreBonus(audioFeatures, song) {
        let bonus = 0;

        // Complexity-based genre preferences
        if (audioFeatures.complexity === 'very_simple' && song.genre === 'Children\'s Music') bonus += 0.3;
        if (audioFeatures.complexity === 'simple' && song.genre === 'Traditional') bonus += 0.25;
        if (audioFeatures.complexity === 'moderate' && song.genre === 'Pop') bonus += 0.2;
        if (audioFeatures.complexity === 'complex' && song.genre === 'Rock') bonus += 0.2;
        if (audioFeatures.complexity === 'very_complex' && song.genre === 'Rock') bonus += 0.15;

        // Bollywood songs often hummed passionately
        if (song.genre === 'Bollywood' && audioFeatures.emotionalTone === 'passionate') bonus += 0.15;

        // K-pop often has energetic, catchy melodies
        if (song.genre === 'K-Pop' && audioFeatures.tempo === 'energetic') bonus += 0.1;

        // Hip-hop often has confident, rhythmic delivery
        if (song.genre === 'Hip-Hop' && audioFeatures.vocalStyle === 'confident') bonus += 0.1;

        return bonus;
    }

    matchDurationPattern(duration, song) {
        // Some songs are more likely to be hummed for certain durations
        if (duration < 5 && song.genre === 'Children\'s Music') return true;
        if (duration < 8 && song.genre === 'Pop') return true;
        if (duration > 10 && song.genre === 'Rock') return true;
        if (song.title.toLowerCase().includes('happy birthday')) return true;

        return false;
    }

    // Show loading indicator
    showLoading() {
        this.loadingElement.classList.remove('hidden');
        this.resultsSection.classList.add('hidden');
    }

    // Hide loading indicator
    hideLoading() {
        this.loadingElement.classList.add('hidden');
    }

    // Show error message
    showError(message) {
        // For now, just use alert. In a real app, you'd show a proper error UI
        alert(message);
    }

    // Show microphone permission error with instructions
    showMicrophoneError() {
        const errorCard = document.createElement('div');
        errorCard.className = 'song-result error-card';
        errorCard.innerHTML = `
            <h3>🎤 Microphone Access Required</h3>
            <p>To use the audio recognition feature, you need to allow microphone access.</p>

            <div class="error-instructions">
                <h4>How to Enable Microphone:</h4>
                <ol>
                    <li>Look for the microphone/camera icon in your browser's address bar</li>
                    <li>Click it and select "Allow" or "Always allow"</li>
                    <li>Or click the lock icon and enable microphone permission</li>
                    <li>Refresh the page and try again</li>
                </ol>
            </div>

            <div class="permission-status">
                <p><strong>Permission Status:</strong> <span class="status-denied">❌ Blocked</span></p>
                <button class="action-btn" onclick="app.checkMicrophonePermission()">🔄 Check Again</button>
            </div>

            <div class="song-actions">
                <button class="action-btn" onclick="app.tryLyricsInstead()">📝 Try Lyrics Search Instead</button>
                <button class="action-btn" onclick="app.tryDescriptionInstead()">🧠 Try Description Search</button>
            </div>
        `;

        this.resultsContainer.innerHTML = '';
        this.resultsContainer.appendChild(errorCard);
        this.resultsSection.classList.remove('hidden');

        // Scroll to show the error
        this.resultsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    // Check current microphone permission status
    async checkMicrophonePermission() {
        try {
            const result = await navigator.permissions.query({ name: 'microphone' });
            console.log('Microphone permission:', result.state);

            if (result.state === 'granted') {
                // Try to start recording
                this.startRecording();
            } else if (result.state === 'denied') {
                // Still denied, show error again
                this.showMicrophoneError();
            } else {
                // Prompt not shown yet, try to request
                this.startRecording();
            }
        } catch (error) {
            console.log('Permission API not supported, trying getUserMedia directly');
            this.startRecording();
        }
    }

    // Alternative search methods
    tryLyricsInstead() {
        // Hide results and focus on lyrics input
        this.resultsSection.classList.add('hidden');
        this.lyricsInput.focus();
        this.lyricsInput.scrollIntoView({ behavior: 'smooth' });
    }

    tryDescriptionInstead() {
        // Hide results and focus on description input
        this.resultsSection.classList.add('hidden');
        this.descriptionInput.focus();
        this.descriptionInput.scrollIntoView({ behavior: 'smooth' });
    }

    // Action methods (these would do real things in a full app)
    playSong(title) {
        alert(`🎵 Playing "${title}" on your default music player...`);
    }

    saveSong(songId) {
        alert(`💾 Song saved to your favorites!`);
    }

    shareSong(songId) {
        const song = songsDatabase.find(s => s.id === songId);
        if (song) {
            const shareText = `Check out "${song.title}" by ${song.artist}! Found it on Song Stuck in My Head 🎵`;
            navigator.clipboard.writeText(shareText).then(() => {
                alert('📤 Song info copied to clipboard!');
            });
        }
    }

    showSuggestions() {
        alert('💡 Try searching for: "rock song", "love song", "80s hits", or specific lyrics!');
    }

    tryDifferentSearch() {
        // Clear inputs and focus on description search
        this.lyricsInput.value = '';
        this.descriptionInput.value = '';
        this.descriptionInput.focus();
        this.resultsSection.classList.add('hidden');
    }
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SongSearchApp();
});

// Global functions for onclick handlers (could be improved with event delegation)
function playSong(title) { app.playSong(title); }
function saveSong(id) { app.saveSong(id); }
function shareSong(id) { app.shareSong(id); }
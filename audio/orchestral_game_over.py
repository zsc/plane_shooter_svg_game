#!/usr/bin/env python3
"""
Orchestral Game Over Music Generator
Creates somber, melancholic game over music
"""

import numpy as np
from scipy.io import wavfile
import subprocess
import os
import sys
sys.path.append(os.path.dirname(__file__))
from orchestral_battle import generate_brass_tone, generate_bass_tone_fixed, generate_string_tone_fixed
from orchestral_boss import generate_choir_tone
from generate_music import *

def create_game_over_melody():
    """Create a somber, melancholic game over theme."""
    melody = [
        # Slow, sad opening
        ('E4', 2.0), ('D4', 2.0), ('C4', 2.0), ('B3', 2.0),
        
        ('A3', 1.5), ('B3', 0.5), ('C4', 2.0), ('E4', 2.0),
        
        ('D4', 1.5), ('C4', 0.5), ('B3', 2.0), ('A3', 2.0),
        
        # Descending theme
        ('G3', 1.0), ('A3', 1.0), ('B3', 1.0), ('C4', 1.0),
        
        ('D4', 2.0), ('C4', 1.0), ('B3', 1.0),
        
        ('A3', 4.0), ('E3', 4.0),
        
        # Final lament
        ('F3', 2.0), ('G3', 2.0),
        
        ('A3', 3.0), ('rest', 1.0),
        
        ('E3', 4.0),
    ]
    return melody

def create_game_over_bass():
    """Create deep, mournful bass line."""
    bass = [
        # Slow pedal tones
        ('A2', 4.0), ('G2', 4.0),
        
        ('F2', 4.0), ('E2', 4.0),
        
        ('D2', 4.0), ('C2', 4.0),
        
        ('B1', 2.0), ('C2', 2.0),
        
        ('D2', 2.0), ('E2', 2.0),
        
        ('F2', 4.0), ('E2', 4.0),
        
        ('D2', 4.0),
        
        ('C2', 4.0),
        
        ('A1', 4.0),
    ]
    return bass

def create_game_over_strings():
    """Create mournful string chords."""
    strings = [
        # Slow, sustained chords
        ([('A3', 'C4', 'E4')], 4.0),
        ([('G3', 'B3', 'D4')], 4.0),
        
        ([('F3', 'A3', 'C4')], 4.0),
        ([('E3', 'G3', 'B3')], 4.0),
        
        ([('D3', 'F3', 'A3')], 4.0),
        ([('C3', 'E3', 'G3')], 4.0),
        
        ([('B2', 'D3', 'F3')], 2.0),
        ([('C3', 'E3', 'G3')], 2.0),
        
        ([('D3', 'F3', 'A3')], 2.0),
        ([('E3', 'G3', 'B3')], 2.0),
        
        ([('F3', 'A3', 'C4')], 4.0),
        ([('E3', 'G3', 'B3')], 4.0),
        
        ([('D3', 'F3', 'A3')], 4.0),
        
        ([('C3', 'E3', 'G3')], 4.0),
        
        ([('A2', 'C3', 'E3')], 4.0),
    ]
    return strings

def main():
    print("Generating Orchestral Game Over Music")
    print("=" * 50)
    
    tempo = 60  # Slow, somber tempo
    sample_rate = 44100
    beat_duration = 60.0 / tempo
    
    # Create parts
    print("Creating melancholic melody...")
    melody = create_game_over_melody()
    
    print("Creating mournful bass...")
    bass = create_game_over_bass()
    
    print("Creating somber strings...")
    strings = create_game_over_strings()
    
    # Generate melody track (solo cello)
    print("Generating solo cello melody...")
    melody_track = np.array([])
    for note, duration in melody:
        frequency = NOTES.get(note, 0)
        tone = generate_string_tone_fixed(frequency, duration * beat_duration, sample_rate, 
                                         amplitude=0.4, instrument='cello')
        melody_track = np.concatenate([melody_track, tone])
    
    # Generate bass track
    print("Generating deep bass...")
    bass_track = np.array([])
    for note, duration in bass:
        frequency = NOTES.get(note, 0)
        tone = generate_bass_tone_fixed(frequency, duration * beat_duration, sample_rate, amplitude=0.5)
        bass_track = np.concatenate([bass_track, tone])
    
    # Generate string section
    print("Generating mournful strings...")
    string_track = np.array([])
    for chord_notes, duration in strings:
        chord_duration = duration * beat_duration
        chord_sound = np.zeros(int(sample_rate * chord_duration))
        
        for notes_tuple in chord_notes:
            for note in notes_tuple:
                frequency = NOTES.get(note, 0)
                tone = generate_string_tone_fixed(frequency, chord_duration, sample_rate, 
                                                 amplitude=0.1, instrument='cello')
                chord_sound += tone
        
        if np.max(np.abs(chord_sound)) > 0:
            chord_sound = chord_sound / np.max(np.abs(chord_sound)) * 0.3
        string_track = np.concatenate([string_track, chord_sound])
    
    # Simple piano notes for atmosphere
    print("Generating atmospheric piano...")
    piano_track = np.array([])
    piano_notes = [
        ('A4', 1.0), ('rest', 3.0),
        ('G4', 1.0), ('rest', 3.0),
        ('F4', 1.0), ('rest', 3.0),
        ('E4', 1.0), ('rest', 3.0),
        ('D4', 1.0), ('rest', 3.0),
        ('C4', 1.0), ('rest', 3.0),
        ('B3', 1.0), ('rest', 3.0),
        ('A3', 1.0), ('rest', 3.0),
        ('rest', 4.0),
        ('E3', 4.0),
    ]
    for note, duration in piano_notes:
        frequency = NOTES.get(note, 0)
        tone = generate_piano_tone(frequency, duration * beat_duration, sample_rate, amplitude=0.25)
        piano_track = np.concatenate([piano_track, tone])
    
    # Pad tracks to same length
    max_len = max(len(melody_track), len(bass_track), len(string_track), len(piano_track))
    for track in [melody_track, bass_track, string_track, piano_track]:
        if len(track) < max_len:
            padding = max_len - len(track)
            if track is melody_track:
                melody_track = np.pad(track, (0, padding))
            elif track is bass_track:
                bass_track = np.pad(track, (0, padding))
            elif track is string_track:
                string_track = np.pad(track, (0, padding))
            elif track is piano_track:
                piano_track = np.pad(track, (0, padding))
    
    # Mix with heavy reverb for atmosphere
    print("Mixing somber orchestra...")
    tracks_to_mix = [
        (melody_track, 0.0, 0.5),       # Melody: center, heavy reverb
        (bass_track, 0.0, 0.3),         # Bass: center, moderate reverb
        (string_track, -0.3, 0.7),      # Strings: left, very heavy reverb
        (piano_track, 0.3, 0.6),        # Piano: right, heavy reverb
    ]
    
    mixed_audio = mix_tracks_stereo(tracks_to_mix, sample_rate)
    
    # Apply fade out at the end
    fade_duration = int(2 * sample_rate)  # 2 second fade
    if len(mixed_audio) > fade_duration:
        fade_out = np.linspace(1, 0, fade_duration)
        mixed_audio[-fade_duration:] *= fade_out
    
    # Save
    wav_file = save_as_wav(mixed_audio, 'game_over.wav', sample_rate)
    
    print("\nConverting to OGG format...")
    ogg_file = convert_to_ogg(wav_file, 'game_over.ogg')
    
    if ogg_file:
        print(f"\n✓ Success! Generated orchestral game over music:")
        print(f"  - {ogg_file}")
    
    # Clean up
    if os.path.exists(wav_file) and ogg_file:
        os.remove(wav_file)

if __name__ == "__main__":
    main()
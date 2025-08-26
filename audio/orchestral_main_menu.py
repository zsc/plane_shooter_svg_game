#!/usr/bin/env python3
"""
Orchestral Main Menu Music Generator
Creates a majestic, heroic theme for the game's main menu
"""

import numpy as np
from scipy.io import wavfile
import subprocess
import os
import sys
sys.path.append(os.path.dirname(__file__))
from generate_music import *

def create_main_menu_melody():
    """Create a heroic main menu theme melody."""
    # Heroic and uplifting main theme
    melody = [
        # Opening fanfare (8 bars)
        ('C5', 1.0), ('G4', 0.5), ('E4', 0.5), ('C5', 1.0), ('D5', 0.5), ('E5', 0.5),
        ('F5', 1.5), ('E5', 0.5), ('D5', 1.0), ('C5', 1.0),
        
        ('G4', 1.0), ('A4', 0.5), ('B4', 0.5), ('C5', 1.5), ('D5', 0.5),
        ('E5', 2.0), ('D5', 1.0), ('C5', 1.0),
        
        # Main theme (8 bars)
        ('E5', 0.75), ('D5', 0.25), ('C5', 0.5), ('B4', 0.5), ('A4', 0.5), ('G4', 0.5),
        ('A4', 0.5), ('B4', 0.5), ('C5', 1.0), ('E5', 1.0),
        
        ('D5', 0.75), ('C5', 0.25), ('B4', 0.5), ('A4', 0.5), ('G4', 1.0),
        ('F4', 0.5), ('G4', 0.5), ('A4', 1.0), ('C5', 1.0),
        
        # Bridge section (8 bars)
        ('G5', 1.0), ('F5', 0.5), ('E5', 0.5), ('D5', 0.5), ('C5', 0.5), ('B4', 0.5), ('A4', 0.5),
        ('B4', 1.0), ('C5', 1.0), ('D5', 2.0),
        
        ('E5', 0.5), ('F5', 0.5), ('G5', 1.0), ('A5', 0.5), ('G5', 0.5), ('F5', 0.5), ('E5', 0.5),
        ('D5', 1.5), ('E5', 0.5), ('C5', 2.0),
        
        # Climax and resolution (8 bars)
        ('C5', 0.5), ('D5', 0.5), ('E5', 0.5), ('F5', 0.5), ('G5', 1.0), ('A5', 1.0),
        ('G5', 0.5), ('F5', 0.5), ('E5', 0.5), ('D5', 0.5), ('C5', 2.0),
        
        ('E5', 1.0), ('G5', 1.0), ('C5', 2.0),
        ('D5', 1.0), ('B4', 1.0), ('C5', 2.0),
    ]
    return melody

def create_main_menu_bass():
    """Create a powerful bass line for the main menu."""
    bass = [
        # Opening (matches fanfare)
        ('C2', 2.0), ('G2', 1.0), ('C2', 1.0),
        ('F2', 2.0), ('G2', 2.0),
        ('C2', 1.0), ('E2', 1.0), ('G2', 1.0), ('C3', 1.0),
        ('G2', 2.0), ('G2', 1.0), ('C2', 1.0),
        
        # Main theme support
        ('A2', 1.0), ('E2', 1.0), ('A2', 1.0), ('C2', 1.0),
        ('G2', 1.0), ('D2', 1.0), ('G2', 1.0), ('B2', 1.0),
        ('F2', 1.0), ('C2', 1.0), ('F2', 1.0), ('A2', 1.0),
        ('G2', 2.0), ('G2', 1.0), ('C2', 1.0),
        
        # Bridge
        ('C2', 1.0), ('G2', 1.0), ('C3', 1.0), ('G2', 1.0),
        ('F2', 1.0), ('C2', 1.0), ('G2', 2.0),
        ('A2', 1.0), ('E2', 1.0), ('G2', 1.0), ('D2', 1.0),
        ('F2', 1.5), ('G2', 0.5), ('C2', 2.0),
        
        # Climax
        ('C2', 0.5), ('C2', 0.5), ('G2', 1.0), ('C3', 2.0),
        ('F2', 1.0), ('G2', 1.0), ('C2', 2.0),
        ('C2', 1.0), ('G2', 1.0), ('C2', 2.0),
        ('G2', 1.0), ('G2', 1.0), ('C2', 2.0),
    ]
    return bass

def create_main_menu_strings():
    """Create lush string arrangements for the main menu."""
    strings = [
        # Opening chords (whole notes, rich harmonies)
        ([('C3', 'E3', 'G3', 'C4')], 2.0), ([('G3', 'B3', 'D4', 'G4')], 2.0),
        ([('F3', 'A3', 'C4', 'F4')], 2.0), ([('G3', 'B3', 'D4', 'G4')], 2.0),
        ([('C3', 'E3', 'G3', 'C4')], 2.0), ([('G3', 'B3', 'D4', 'G4')], 2.0),
        ([('E3', 'G3', 'C4', 'E4')], 2.0), ([('C3', 'E3', 'G3', 'C4')], 2.0),
        
        # Main theme harmonization
        ([('A3', 'C4', 'E4', 'A4')], 2.0), ([('E3', 'G3', 'C4', 'E4')], 2.0),
        ([('G3', 'B3', 'D4', 'G4')], 2.0), ([('D3', 'F3', 'A3', 'D4')], 2.0),
        ([('F3', 'A3', 'C4', 'F4')], 2.0), ([('C3', 'E3', 'G3', 'C4')], 2.0),
        ([('G3', 'B3', 'D4', 'G4')], 2.0), ([('C3', 'E3', 'G3', 'C4')], 2.0),
        
        # Bridge section
        ([('C4', 'E4', 'G4')], 1.0), ([('B3', 'D4', 'G4')], 1.0), 
        ([('A3', 'C4', 'F4')], 1.0), ([('G3', 'B3', 'E4')], 1.0),
        ([('F3', 'A3', 'D4')], 2.0), ([('G3', 'B3', 'D4')], 2.0),
        ([('A3', 'C4', 'E4')], 2.0), ([('G3', 'B3', 'D4')], 2.0),
        ([('F3', 'A3', 'C4')], 1.5), ([('G3', 'B3', 'D4')], 0.5), ([('C3', 'E3', 'G3')], 2.0),
        
        # Climax
        ([('C4', 'E4', 'G4', 'C5')], 2.0), ([('A3', 'C4', 'F4', 'A4')], 2.0),
        ([('F3', 'A3', 'C4', 'F4')], 1.0), ([('G3', 'B3', 'D4', 'G4')], 1.0), 
        ([('C3', 'E3', 'G3', 'C4')], 2.0),
        ([('E3', 'G3', 'C4', 'E4')], 2.0), ([('C3', 'E3', 'G3', 'C4')], 2.0),
        ([('G3', 'B3', 'D4')], 2.0), ([('C3', 'E3', 'G3', 'C4')], 2.0),
    ]
    return strings

def create_main_menu_brass():
    """Create heroic brass section for the main menu."""
    brass = [
        # French horns - warm, heroic sound
        # Opening fanfare support
        ('rest', 2.0), ('C4', 1.0), ('E4', 1.0),
        ('F4', 2.0), ('G4', 2.0),
        ('E4', 2.0), ('D4', 1.0), ('C4', 1.0),
        ('G4', 2.0), ('E4', 2.0),
        
        # Main theme - brass accents
        ('rest', 1.0), ('C4', 0.5), ('E4', 0.5), ('G4', 2.0),
        ('rest', 1.0), ('D4', 0.5), ('F4', 0.5), ('A4', 2.0),
        ('rest', 1.0), ('C4', 0.5), ('E4', 0.5), ('G4', 2.0),
        ('B3', 1.0), ('D4', 1.0), ('C4', 2.0),
        
        # Bridge - sustained brass
        ('G4', 4.0), ('F4', 4.0),
        ('E4', 4.0), ('D4', 2.0), ('E4', 2.0),
        
        # Climax - full brass power
        ('C4', 0.5), ('E4', 0.5), ('G4', 0.5), ('C5', 0.5), ('E5', 2.0),
        ('F4', 1.0), ('G4', 1.0), ('C5', 2.0),
        ('G4', 2.0), ('E4', 2.0),
        ('D4', 2.0), ('C4', 2.0),
    ]
    return brass

def create_main_menu_timpani():
    """Create timpani rolls and accents for dramatic effect."""
    timpani = [
        # Opening timpani rolls
        ('C2', 0.25), ('C2', 0.25), ('C2', 0.25), ('C2', 0.25), 
        ('rest', 1.0), ('G2', 1.0), ('rest', 1.0),
        ('F2', 0.5), ('F2', 0.5), ('rest', 1.0), ('G2', 0.5), ('G2', 0.5), ('rest', 1.0),
        ('C2', 2.0), ('rest', 2.0),
        ('G2', 2.0), ('rest', 2.0),
        
        # Main theme punctuation
        ('rest', 3.0), ('C2', 1.0),
        ('rest', 3.0), ('G2', 1.0),
        ('rest', 3.0), ('F2', 1.0),
        ('G2', 0.5), ('rest', 1.5), ('C2', 2.0),
        
        # Bridge rolls
        ('rest', 4.0), ('rest', 4.0),
        ('C2', 0.25), ('C2', 0.25), ('C2', 0.25), ('C2', 0.25), 
        ('G2', 0.25), ('G2', 0.25), ('G2', 0.25), ('G2', 0.25),
        ('rest', 2.0),
        ('F2', 0.5), ('G2', 0.5), ('rest', 1.0), ('C2', 2.0),
        
        # Climax
        ('C2', 0.125), ('C2', 0.125), ('C2', 0.125), ('C2', 0.125),
        ('C2', 0.125), ('C2', 0.125), ('C2', 0.125), ('C2', 0.125),
        ('G2', 1.0), ('rest', 2.0),
        ('F2', 1.0), ('G2', 1.0), ('C2', 2.0),
        ('rest', 2.0), ('C2', 2.0),
        ('G2', 1.0), ('rest', 1.0), ('C2', 2.0),
    ]
    return timpani

def generate_brass_tone(frequency, duration, sample_rate=44100, amplitude=0.4):
    """Generate brass instrument sound."""
    if frequency == 0:
        return np.zeros(int(sample_rate * duration))
    
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    
    # Brass-like ADSR
    attack = int(0.03 * sample_rate)
    decay = int(0.05 * sample_rate)
    sustain_level = 0.8
    release = int(0.1 * sample_rate)
    
    envelope = np.ones_like(t) * sustain_level
    envelope[:attack] = np.linspace(0, 1, attack)
    envelope[attack:attack+decay] = np.linspace(1, sustain_level, decay)
    if release < len(envelope):
        envelope[-release:] = np.linspace(sustain_level, 0, release)
    
    # Brass harmonics (strong odd harmonics)
    tone = amplitude * envelope * (
        1.0 * np.sin(2 * np.pi * frequency * t) +  # Fundamental
        0.5 * np.sin(3 * np.pi * frequency * t) +  # 3rd harmonic (strong)
        0.3 * np.sin(5 * np.pi * frequency * t) +  # 5th harmonic
        0.2 * np.sin(7 * np.pi * frequency * t) +  # 7th harmonic
        0.1 * np.sin(9 * np.pi * frequency * t)   # 9th harmonic
    )
    
    # Add slight vibrato for realism
    vibrato = 1 + 0.005 * np.sin(2 * np.pi * 4.5 * t)
    tone = tone * vibrato
    
    return tone

def generate_timpani_tone(frequency, duration, sample_rate=44100, amplitude=0.6):
    """Generate timpani drum sound."""
    if frequency == 0:
        return np.zeros(int(sample_rate * duration))
    
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    
    # Timpani has a pitched tone with quick decay
    amp_envelope = np.exp(-3 * t)  # Faster decay than bass drum
    
    # Fundamental with slight pitch bend
    pitch_bend = frequency * (1 + 0.1 * np.exp(-20 * t))
    
    # Timpani sound (fundamental + harmonics + membrane resonance)
    timpani = amplitude * amp_envelope * (
        0.7 * np.sin(2 * np.pi * pitch_bend * t) +  # Fundamental with pitch bend
        0.2 * np.sin(4 * np.pi * frequency * t) +    # 2nd harmonic
        0.1 * np.sin(6 * np.pi * frequency * t) +    # 3rd harmonic
        0.05 * np.random.normal(0, 0.1, len(t)) * np.exp(-50 * t)  # Initial strike
    )
    
    return timpani

def main():
    print("Generating Orchestral Main Menu Music")
    print("=" * 50)
    
    tempo = 100  # Majestic tempo
    sample_rate = 44100
    beat_duration = 60.0 / tempo
    
    # Create all parts
    print("Creating melody...")
    melody = create_main_menu_melody()
    
    print("Creating bass line...")
    bass = create_main_menu_bass()
    
    print("Creating string arrangements...")
    strings = create_main_menu_strings()
    
    print("Creating brass section...")
    brass = create_main_menu_brass()
    
    print("Creating timpani...")
    timpani = create_main_menu_timpani()
    
    # Generate melody track (flute/violin lead)
    print("Generating melody track...")
    melody_track = np.array([])
    for note, duration in melody:
        frequency = NOTES.get(note, 0)
        # Use violin for main melody
        tone = generate_string_tone(frequency, duration * beat_duration, sample_rate, 
                                   amplitude=0.4, instrument='violin')
        melody_track = np.concatenate([melody_track, tone])
    
    # Generate bass track
    print("Generating bass track...")
    bass_track = np.array([])
    for note, duration in bass:
        frequency = NOTES.get(note, 0)
        tone = generate_bass_tone(frequency, duration * beat_duration, sample_rate, amplitude=0.6)
        bass_track = np.concatenate([bass_track, tone])
    
    # Generate string section
    print("Generating string sections...")
    string_track = np.array([])
    for chord_notes, duration in strings:
        chord_duration = duration * beat_duration
        chord_sound = np.zeros(int(sample_rate * chord_duration))
        
        for notes_tuple in chord_notes:
            for note in notes_tuple:
                frequency = NOTES.get(note, 0)
                tone = generate_string_tone(frequency, chord_duration, sample_rate, 
                                           amplitude=0.15, instrument='cello')
                chord_sound += tone
        
        if np.max(np.abs(chord_sound)) > 0:
            chord_sound = chord_sound / np.max(np.abs(chord_sound)) * 0.5
        string_track = np.concatenate([string_track, chord_sound])
    
    # Generate brass section
    print("Generating brass section...")
    brass_track = np.array([])
    for note, duration in brass:
        frequency = NOTES.get(note, 0)
        tone = generate_brass_tone(frequency, duration * beat_duration, sample_rate, amplitude=0.35)
        brass_track = np.concatenate([brass_track, tone])
    
    # Generate timpani
    print("Generating timpani...")
    timpani_track = np.array([])
    for note, duration in timpani:
        frequency = NOTES.get(note, 0)
        tone = generate_timpani_tone(frequency, duration * beat_duration, sample_rate, amplitude=0.5)
        timpani_track = np.concatenate([timpani_track, tone])
    
    # Mix all tracks with stereo panning
    print("Mixing orchestra with spatial positioning...")
    
    tracks_to_mix = [
        (melody_track, 0.1, 0.3),      # Melody: slightly right, moderate reverb
        (bass_track, 0.0, 0.2),         # Bass: center, light reverb
        #(string_track, -0.2, 0.5),      # Strings: left, rich reverb
        (brass_track, 0.3, 0.4),        # Brass: right, moderate reverb
        (timpani_track, -0.1, 0.6),     # Timpani: slightly left, hall reverb
    ]
    
    mixed_audio = mix_tracks_stereo(tracks_to_mix, sample_rate)
    
    # Save as WAV
    wav_file = save_as_wav(mixed_audio, 'main_menu.wav', sample_rate)
    
    # Convert to OGG
    print("\nConverting to OGG format...")
    ogg_file = convert_to_ogg(wav_file, 'main_menu.ogg')
    
    if ogg_file:
        print(f"\n✓ Success! Generated orchestral main menu music:")
        print(f"  - {wav_file}")
        print(f"  - {ogg_file}")
    
    # Clean up WAV file
    if os.path.exists(wav_file) and ogg_file:
        os.remove(wav_file)
        print(f"  - Cleaned up temporary WAV file")

if __name__ == "__main__":
    main()

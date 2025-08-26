#!/usr/bin/env python3
"""
Orchestral Victory Music Generator
Creates triumphant, celebratory victory fanfare
"""

import numpy as np
from scipy.io import wavfile
import subprocess
import os
import sys
sys.path.append(os.path.dirname(__file__))
from orchestral_battle import generate_brass_tone, generate_bass_tone_fixed, generate_string_tone_fixed
from orchestral_boss import generate_choir_tone
from orchestral_main_menu import generate_timpani_tone
from generate_music import *

def create_victory_melody():
    """Create a triumphant victory fanfare."""
    melody = [
        # Triumphant opening fanfare
        ('C5', 0.5), ('C5', 0.25), ('C5', 0.25), ('C5', 1.0), 
        ('E5', 0.5), ('G5', 0.5), ('C6', 2.0),
        
        ('G5', 0.5), ('E5', 0.5), ('C5', 0.5), ('G4', 0.5),
        ('A4', 0.5), ('B4', 0.5), ('C5', 2.0),
        
        # Celebratory theme
        ('E5', 0.5), ('D5', 0.5), ('C5', 0.5), ('D5', 0.5),
        ('E5', 0.5), ('F5', 0.5), ('G5', 2.0),
        
        ('A5', 0.5), ('G5', 0.5), ('F5', 0.5), ('E5', 0.5),
        ('D5', 0.5), ('C5', 0.5), ('G5', 2.0),
        
        # Grand finale
        ('C5', 0.25), ('D5', 0.25), ('E5', 0.25), ('F5', 0.25),
        ('G5', 0.25), ('A5', 0.25), ('B5', 0.25), ('C6', 0.25),
        ('C6', 1.0), ('G5', 1.0), ('E5', 1.0), ('C5', 1.0),
        
        ('F5', 1.0), ('E5', 0.5), ('D5', 0.5),
        ('C5', 4.0),
    ]
    return melody

def create_victory_bass():
    """Create uplifting bass for victory theme."""
    bass = [
        # Foundation
        ('C2', 1.0), ('G2', 1.0), ('C3', 2.0),
        ('E2', 1.0), ('G2', 1.0), ('C2', 2.0),
        
        # Walking bass
        ('F2', 0.5), ('G2', 0.5), ('A2', 0.5), ('B2', 0.5),
        ('C3', 1.0), ('G2', 1.0),
        
        ('C2', 0.5), ('E2', 0.5), ('G2', 0.5), ('C3', 0.5),
        ('G2', 0.5), ('E2', 0.5), ('C2', 2.0),
        
        # Support
        ('F2', 1.0), ('C3', 1.0), ('G2', 2.0),
        ('A2', 1.0), ('F2', 1.0), ('G2', 2.0),
        
        # Finale
        ('C2', 0.5), ('G2', 0.5), ('C3', 0.5), ('G2', 0.5),
        ('C2', 2.0),
        ('F2', 1.0), ('G2', 1.0), ('C2', 4.0),
    ]
    return bass

def create_victory_brass():
    """Create triumphant brass section."""
    brass = [
        # Fanfare
        ('C4', 0.5), ('C4', 0.25), ('C4', 0.25), ('rest', 0.5),
        ('E4', 0.5), ('G4', 1.0), ('rest', 1.0),
        
        ('G4', 0.5), ('E4', 0.5), ('C4', 1.0),
        ('rest', 0.5), ('D4', 0.5), ('E4', 1.0),
        
        # Harmonies
        ('C4', 1.0), ('E4', 1.0), ('G4', 2.0),
        ('F4', 1.0), ('E4', 1.0), ('D4', 2.0),
        
        ('E4', 2.0), ('G4', 2.0),
        
        # Power ending
        ('C5', 0.25), ('rest', 0.25), ('C5', 0.25), ('rest', 0.25),
        ('C5', 0.25), ('rest', 0.25), ('C5', 0.25), ('rest', 0.25),
        ('E5', 1.0), ('D5', 1.0), ('C5', 2.0),
        
        ('F4', 1.0), ('G4', 1.0), ('C5', 4.0),
    ]
    return brass

def main():
    print("Generating Orchestral Victory Music")
    print("=" * 50)
    
    tempo = 120  # Celebratory tempo
    sample_rate = 44100
    beat_duration = 60.0 / tempo
    
    # Create parts
    print("Creating victory melody...")
    melody = create_victory_melody()
    
    print("Creating uplifting bass...")
    bass = create_victory_bass()
    
    print("Creating triumphant brass...")
    brass = create_victory_brass()
    
    # Generate tracks
    print("Generating melody track...")
    melody_track = np.array([])
    for note, duration in melody:
        frequency = NOTES.get(note, 0)
        tone = generate_string_tone_fixed(frequency, duration * beat_duration, sample_rate, 
                                         amplitude=0.45, instrument='violin')
        melody_track = np.concatenate([melody_track, tone])
    
    print("Generating bass track...")
    bass_track = np.array([])
    for note, duration in bass:
        frequency = NOTES.get(note, 0)
        tone = generate_bass_tone_fixed(frequency, duration * beat_duration, sample_rate, amplitude=0.6)
        bass_track = np.concatenate([bass_track, tone])
    
    print("Generating brass fanfare...")
    brass_track = np.array([])
    for note, duration in brass:
        frequency = NOTES.get(note, 0)
        tone = generate_brass_tone(frequency, duration * beat_duration, sample_rate, amplitude=0.5)
        brass_track = np.concatenate([brass_track, tone])
    
    # Simple timpani rolls
    print("Generating timpani rolls...")
    timpani_track = np.array([])
    timpani_notes = [
        ('C2', 0.25), ('C2', 0.25), ('C2', 0.25), ('C2', 0.25),
        ('rest', 3.0),
        ('G2', 0.25), ('G2', 0.25), ('G2', 0.25), ('G2', 0.25),
        ('rest', 3.0),
        ('C2', 0.125), ('C2', 0.125), ('C2', 0.125), ('C2', 0.125),
        ('C2', 0.125), ('C2', 0.125), ('C2', 0.125), ('C2', 0.125),
        ('C2', 4.0),
    ]
    for note, duration in timpani_notes:
        frequency = NOTES.get(note, 0)
        tone = generate_timpani_tone(frequency, duration * beat_duration, sample_rate, amplitude=0.4)
        timpani_track = np.concatenate([timpani_track, tone])
    
    # Pad tracks to same length
    max_len = max(len(melody_track), len(bass_track), len(brass_track), len(timpani_track))
    if len(timpani_track) < max_len:
        timpani_track = np.pad(timpani_track, (0, max_len - len(timpani_track)))
    if len(brass_track) < max_len:
        brass_track = np.pad(brass_track, (0, max_len - len(brass_track)))
    if len(bass_track) < max_len:
        bass_track = np.pad(bass_track, (0, max_len - len(bass_track)))
    if len(melody_track) < max_len:
        melody_track = np.pad(melody_track, (0, max_len - len(melody_track)))
    
    # Mix
    print("Mixing triumphant orchestra...")
    tracks_to_mix = [
        (melody_track, 0.0, 0.4),       # Melody: center, reverb
        (bass_track, 0.0, 0.2),         # Bass: center
        (brass_track, 0.2, 0.5),        # Brass: right, reverb
        (timpani_track, -0.2, 0.6),     # Timpani: left, hall reverb
    ]
    
    mixed_audio = mix_tracks_stereo(tracks_to_mix, sample_rate)
    
    # Save
    wav_file = save_as_wav(mixed_audio, 'victory.wav', sample_rate)
    
    print("\nConverting to OGG format...")
    ogg_file = convert_to_ogg(wav_file, 'victory.ogg')
    
    if ogg_file:
        print(f"\n✓ Success! Generated orchestral victory music:")
        print(f"  - {ogg_file}")
    
    # Clean up
    if os.path.exists(wav_file) and ogg_file:
        os.remove(wav_file)

if __name__ == "__main__":
    main()
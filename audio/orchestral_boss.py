#!/usr/bin/env python3
"""
Orchestral Boss Battle Music Generator
Creates epic, intense boss battle music
"""

import numpy as np
from scipy.io import wavfile
import subprocess
import os
import sys
sys.path.append(os.path.dirname(__file__))
from orchestral_battle import generate_brass_tone, generate_bass_tone_fixed, generate_string_tone_fixed
from generate_music import *

def create_boss_melody():
    """Create an epic, menacing boss theme."""
    melody = [
        # Opening - ominous and powerful
        ('E3', 0.5), ('E3', 0.5), ('E3', 0.5), ('E3', 0.5),
        ('F3', 1.0), ('E3', 1.0),
        ('D3', 0.5), ('D3', 0.5), ('D3', 0.5), ('D3', 0.5),
        ('E3', 1.0), ('D3', 1.0),
        
        # Main boss theme - epic and threatening
        ('A4', 1.0), ('G4', 0.5), ('F4', 0.5),
        ('E4', 0.5), ('D4', 0.5), ('C4', 0.5), ('B3', 0.5),
        ('A3', 2.0), ('E4', 2.0),
        
        ('F4', 1.0), ('E4', 0.5), ('D4', 0.5),
        ('C4', 0.5), ('B3', 0.5), ('A3', 0.5), ('G3', 0.5),
        ('F3', 2.0), ('C4', 2.0),
        
        # Intensity building
        ('D4', 0.25), ('E4', 0.25), ('F4', 0.25), ('G4', 0.25),
        ('A4', 0.25), ('B4', 0.25), ('C5', 0.25), ('D5', 0.25),
        ('E5', 1.0), ('D5', 0.5), ('C5', 0.5),
        ('B4', 0.5), ('A4', 0.5), ('G4', 0.5), ('F4', 0.5),
        
        # Epic climax
        ('E5', 2.0), ('D5', 1.0), ('C5', 1.0),
        ('B4', 2.0), ('A4', 1.0), ('G4', 1.0),
        ('F4', 0.5), ('G4', 0.5), ('A4', 0.5), ('B4', 0.5),
        ('C5', 0.5), ('D5', 0.5), ('E5', 1.0),
        
        # Final assault
        ('A5', 0.5), ('G5', 0.5), ('F5', 0.5), ('E5', 0.5),
        ('D5', 0.5), ('C5', 0.5), ('B4', 0.5), ('A4', 0.5),
        ('G4', 0.25), ('F4', 0.25), ('E4', 0.25), ('D4', 0.25),
        ('C4', 0.25), ('B3', 0.25), ('A3', 0.25), ('G3', 0.25),
        ('F3', 1.0), ('E3', 3.0),
    ]
    return melody

def create_boss_bass():
    """Create thunderous bass for boss battle."""
    bass = [
        # Ominous pedal tones
        ('E2', 0.5), ('E2', 0.5), ('E2', 0.5), ('E2', 0.5),
        ('E2', 0.5), ('E2', 0.5), ('E2', 0.5), ('E2', 0.5),
        ('D2', 0.5), ('D2', 0.5), ('D2', 0.5), ('D2', 0.5),
        ('D2', 0.5), ('D2', 0.5), ('D2', 0.5), ('D2', 0.5),
        
        # Heavy driving pattern
        ('A1', 0.25), ('A1', 0.25), ('E2', 0.25), ('A2', 0.25),
        ('A1', 0.25), ('A1', 0.25), ('E2', 0.25), ('A2', 0.25),
        ('G1', 0.25), ('G1', 0.25), ('D2', 0.25), ('G2', 0.25),
        ('G1', 0.25), ('G1', 0.25), ('D2', 0.25), ('G2', 0.25),
        
        ('F1', 0.25), ('F1', 0.25), ('C2', 0.25), ('F2', 0.25),
        ('F1', 0.25), ('F1', 0.25), ('C2', 0.25), ('F2', 0.25),
        ('E1', 0.25), ('E1', 0.25), ('B1', 0.25), ('E2', 0.25),
        ('E1', 0.25), ('E1', 0.25), ('B1', 0.25), ('E2', 0.25),
        
        # Intense chromatic movement
        ('D2', 0.5), ('D#2', 0.5), ('E2', 0.5), ('F2', 0.5),
        ('F#2', 0.5), ('G2', 0.5), ('G#2', 0.5), ('A2', 0.5),
        ('E2', 1.0), ('D2', 0.5), ('C2', 0.5),
        ('B1', 0.5), ('A1', 0.5), ('G1', 0.5), ('F1', 0.5),
        
        # Epic section
        ('E1', 1.0), ('E1', 1.0), ('E2', 1.0), ('E1', 1.0),
        ('D1', 1.0), ('D1', 1.0), ('D2', 1.0), ('D1', 1.0),
        ('C1', 0.5), ('D1', 0.5), ('E1', 0.5), ('F1', 0.5),
        ('G1', 0.5), ('A1', 0.5), ('B1', 1.0),
        
        # Final thunder
        ('A1', 0.25), ('A1', 0.25), ('A1', 0.25), ('A1', 0.25),
        ('G1', 0.25), ('G1', 0.25), ('G1', 0.25), ('G1', 0.25),
        ('F1', 0.25), ('F1', 0.25), ('F1', 0.25), ('F1', 0.25),
        ('E1', 0.25), ('E1', 0.25), ('E1', 0.25), ('E1', 0.25),
        ('E1', 4.0),
    ]
    return bass

def create_boss_drums():
    """Create thunderous drum patterns for boss battle."""
    drums = [
        # Epic intro - timpani-like
        ('kick', 0.5), ('rest', 0.5), ('kick', 0.5), ('rest', 0.5),
        ('kick', 0.5), ('rest', 0.5), ('kick', 0.5), ('rest', 0.5),
        ('kick', 0.5), ('rest', 0.5), ('kick', 0.5), ('rest', 0.5),
        ('kick', 0.5), ('rest', 0.5), ('kick', 0.5), ('snare', 0.5),
        
        # Main pattern - relentless
        ('kick', 0.25), ('kick', 0.25), ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.25), ('hihat', 0.25), ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.25), ('kick', 0.25), ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.25), ('snare', 0.25), ('snare', 0.25), ('snare', 0.25),
        
        # Double bass assault
        ('kick', 0.125), ('kick', 0.125), ('hihat', 0.25), 
        ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.125), ('kick', 0.125), ('kick', 0.125), ('kick', 0.125),
        ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.25), ('snare', 0.125), ('snare', 0.125),
        ('kick', 0.25), ('snare', 0.125), ('snare', 0.125),
        ('kick', 0.125), ('kick', 0.125), ('snare', 0.25),
        ('kick', 0.125), ('kick', 0.125), ('snare', 0.25),
        
        # Build section
        ('snare', 0.125), ('snare', 0.125), ('snare', 0.125), ('snare', 0.125),
        ('snare', 0.125), ('snare', 0.125), ('snare', 0.125), ('snare', 0.125),
        ('kick', 0.25), ('kick', 0.25), ('kick', 0.25), ('kick', 0.25),
        ('snare', 0.25), ('snare', 0.25), ('snare', 0.25), ('snare', 0.25),
        
        # Epic climax
        ('kick', 0.5), ('snare', 0.5), ('kick', 0.5), ('snare', 0.5),
        ('kick', 0.5), ('snare', 0.5), ('kick', 0.5), ('snare', 0.5),
        ('kick', 0.25), ('kick', 0.25), ('snare', 0.25), ('snare', 0.25),
        ('kick', 0.25), ('snare', 0.25), ('snare', 0.25), ('snare', 0.25),
        
        # Final assault
        ('kick', 0.25), ('kick', 0.25), ('kick', 0.25), ('kick', 0.25),
        ('snare', 0.25), ('snare', 0.25), ('snare', 0.25), ('snare', 0.25),
        ('kick', 0.125), ('kick', 0.125), ('kick', 0.125), ('kick', 0.125),
        ('snare', 0.125), ('snare', 0.125), ('snare', 0.125), ('snare', 0.125),
        ('kick', 1.0), ('rest', 3.0),
    ]
    return drums

def create_boss_choir():
    """Create epic choir vocals for boss battle."""
    # Simulating choir "Ahs" and "Ohs" with low frequencies
    choir = [
        # Ominous opening
        ('A2', 2.0), ('rest', 2.0),
        ('G2', 2.0), ('rest', 2.0),
        
        # Main section - epic swells
        ('C3', 4.0), ('D3', 4.0),
        ('E3', 4.0), ('F3', 4.0),
        
        # Intense section
        ('G3', 2.0), ('A3', 2.0),
        ('B3', 2.0), ('C4', 2.0),
        
        # Epic climax
        ('E4', 4.0), ('D4', 4.0),
        ('C4', 2.0), ('B3', 2.0),
        
        # Final
        ('A3', 2.0), ('G3', 2.0),
        ('F3', 2.0), ('E3', 2.0),
        ('E3', 4.0),
    ]
    return choir

def generate_choir_tone(frequency, duration, sample_rate=44100, amplitude=0.3):
    """Generate choir-like sound using multiple voices."""
    if frequency == 0:
        return np.zeros(int(sample_rate * duration))
    
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    
    # Choir envelope - slow attack for swells
    attack = int(0.2 * sample_rate)
    decay = int(0.1 * sample_rate)
    sustain_level = 0.8
    release = int(0.3 * sample_rate)
    
    envelope = np.ones_like(t) * sustain_level
    if attack < len(envelope):
        envelope[:attack] = np.linspace(0, 1, min(attack, len(envelope)))
    if attack < len(envelope) and attack + decay <= len(envelope):
        envelope[attack:attack+decay] = np.linspace(1, sustain_level, decay)
    if release < len(envelope):
        envelope[-release:] = np.linspace(sustain_level, 0, release)
    
    # Multiple detuned voices for choir effect
    voices = 0
    detune_amounts = [-0.01, -0.005, 0, 0.005, 0.01]  # Slight detuning
    
    for detune in detune_amounts:
        freq_detuned = frequency * (1 + detune)
        # Vowel formants simulation (simplified)
        voices += np.sin(2 * np.pi * freq_detuned * t)  # Fundamental
        voices += 0.3 * np.sin(4 * np.pi * freq_detuned * t)  # 2nd harmonic
        voices += 0.2 * np.sin(6 * np.pi * freq_detuned * t)  # 3rd harmonic
    
    # Normalize and apply envelope
    tone = amplitude * envelope * voices / len(detune_amounts)
    
    return tone

def main():
    print("Generating Orchestral Boss Battle Music")
    print("=" * 50)
    
    tempo = 120  # Epic, moderate tempo for boss
    sample_rate = 44100
    beat_duration = 60.0 / tempo
    
    # Create all parts
    print("Creating boss melody...")
    melody = create_boss_melody()
    
    print("Creating thunderous bass...")
    bass = create_boss_bass()
    
    print("Creating epic drums...")
    drums = create_boss_drums()
    
    print("Creating choir vocals...")
    choir = create_boss_choir()
    
    # Generate melody track
    print("Generating melody track...")
    melody_track = np.array([])
    for note, duration in melody:
        frequency = NOTES.get(note, 0)
        tone = generate_string_tone_fixed(frequency, duration * beat_duration, sample_rate, 
                                         amplitude=0.4, instrument='cello')
        melody_track = np.concatenate([melody_track, tone])
    
    # Generate bass track
    print("Generating bass track...")
    bass_track = np.array([])
    for note, duration in bass:
        frequency = NOTES.get(note, 0)
        tone = generate_bass_tone_fixed(frequency, duration * beat_duration, sample_rate, amplitude=0.8)
        bass_track = np.concatenate([bass_track, tone])
    
    # Generate drum track
    print("Generating drum track...")
    drum_track = np.array([])
    for drum_type, duration in drums:
        drum_duration = duration * beat_duration
        if drum_type == 'kick':
            sound = generate_kick_drum(drum_duration, sample_rate, amplitude=0.9)
        elif drum_type == 'snare':
            sound = generate_snare_drum(drum_duration, sample_rate, amplitude=0.7)
        elif drum_type == 'hihat':
            sound = generate_hihat(drum_duration, sample_rate, amplitude=0.3, closed=False)
        else:  # rest
            sound = np.zeros(int(sample_rate * drum_duration))
        drum_track = np.concatenate([drum_track, sound])
    
    # Generate choir track
    print("Generating epic choir...")
    choir_track = np.array([])
    for note, duration in choir:
        frequency = NOTES.get(note, 0)
        tone = generate_choir_tone(frequency, duration * beat_duration, sample_rate, amplitude=0.35)
        choir_track = np.concatenate([choir_track, tone])
    
    # Generate brass accents
    print("Generating brass power chords...")
    brass_track = np.array([])
    # Simple brass hits following the bass pattern
    for note, duration in bass[:16]:  # Use first part of bass for brass
        frequency = NOTES.get(note, 0)
        if frequency > 0:
            frequency *= 2  # One octave higher
        tone = generate_brass_tone(frequency, duration * beat_duration, sample_rate, amplitude=0.45)
        brass_track = np.concatenate([brass_track, tone])
    
    # Pad brass track to match length
    if len(brass_track) < len(melody_track):
        brass_track = np.pad(brass_track, (0, len(melody_track) - len(brass_track)))
    
    # Mix all tracks
    print("Mixing epic orchestra...")
    
    tracks_to_mix = [
        (melody_track, 0.0, 0.3),       # Melody: center, moderate reverb
        (bass_track, 0.0, 0.15),        # Bass: center, light reverb
        (drum_track, 0.0, 0.1),         # Drums: center, minimal reverb
        (choir_track, -0.2, 0.6),       # Choir: left, heavy reverb
        (brass_track, 0.2, 0.4),        # Brass: right, moderate reverb
    ]
    
    mixed_audio = mix_tracks_stereo(tracks_to_mix, sample_rate)
    
    # Save as WAV
    wav_file = save_as_wav(mixed_audio, 'boss.wav', sample_rate)
    
    # Convert to OGG
    print("\nConverting to OGG format...")
    ogg_file = convert_to_ogg(wav_file, 'boss.ogg')
    
    if ogg_file:
        print(f"\n✓ Success! Generated orchestral boss battle music:")
        print(f"  - {wav_file}")
        print(f"  - {ogg_file}")
    
    # Clean up WAV file
    if os.path.exists(wav_file) and ogg_file:
        os.remove(wav_file)
        print(f"  - Cleaned up temporary WAV file")

if __name__ == "__main__":
    main()
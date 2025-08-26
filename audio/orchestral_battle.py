#!/usr/bin/env python3
"""
Orchestral Battle Music Generator
Creates intense, action-packed battle music for gameplay
"""

import numpy as np
from scipy.io import wavfile
import subprocess
import os
import sys
sys.path.append(os.path.dirname(__file__))
from generate_music import *

def create_battle_melody():
    """Create an intense battle theme melody."""
    # Fast-paced, urgent battle theme
    melody = [
        # Opening assault (8 bars) - rapid, aggressive
        ('E4', 0.25), ('E4', 0.25), ('E4', 0.25), ('E4', 0.25), 
        ('F4', 0.5), ('G4', 0.5), ('A4', 1.0), ('G4', 1.0),
        
        ('F4', 0.25), ('E4', 0.25), ('D4', 0.25), ('C4', 0.25),
        ('D4', 0.5), ('E4', 0.5), ('F4', 1.0), ('E4', 1.0),
        
        ('G4', 0.25), ('A4', 0.25), ('B4', 0.25), ('C5', 0.25),
        ('D5', 0.5), ('C5', 0.5), ('B4', 0.5), ('A4', 0.5), ('G4', 1.0),
        
        ('A4', 0.5), ('B4', 0.5), ('C5', 0.5), ('D5', 0.5),
        ('E5', 1.0), ('D5', 0.5), ('C5', 0.5),
        
        # Combat intensifies (8 bars)
        ('E5', 0.25), ('D5', 0.25), ('C5', 0.25), ('B4', 0.25),
        ('A4', 0.25), ('G4', 0.25), ('F4', 0.25), ('E4', 0.25),
        ('D4', 0.5), ('E4', 0.5), ('F4', 1.0),
        
        ('G4', 0.25), ('A4', 0.25), ('B4', 0.25), ('C5', 0.25),
        ('D5', 0.5), ('E5', 0.5), ('F5', 0.5), ('E5', 0.5), ('D5', 1.0),
        
        ('C5', 0.25), ('B4', 0.25), ('A4', 0.25), ('G4', 0.25),
        ('F4', 0.5), ('E4', 0.5), ('D4', 0.5), ('C4', 0.5), ('E4', 1.0),
        
        ('A4', 0.5), ('C5', 0.5), ('E5', 0.5), ('A5', 0.5),
        ('G5', 0.5), ('F5', 0.5), ('E5', 0.5), ('D5', 0.5),
        
        # Bridge - tension building (8 bars)
        ('C5', 0.125), ('D5', 0.125), ('E5', 0.125), ('F5', 0.125),
        ('G5', 0.125), ('F5', 0.125), ('E5', 0.125), ('D5', 0.125),
        ('C5', 0.5), ('B4', 0.5), ('A4', 1.0), ('G4', 1.0),
        
        ('F4', 0.25), ('G4', 0.25), ('A4', 0.25), ('B4', 0.25),
        ('C5', 0.25), ('D5', 0.25), ('E5', 0.25), ('F5', 0.25),
        ('G5', 1.0), ('F5', 1.0),
        
        ('E5', 0.5), ('D5', 0.5), ('C5', 0.5), ('B4', 0.5),
        ('A4', 0.5), ('G4', 0.5), ('F4', 0.5), ('E4', 0.5),
        
        ('D4', 0.25), ('E4', 0.25), ('F4', 0.25), ('G4', 0.25),
        ('A4', 0.5), ('B4', 0.5), ('C5', 2.0),
        
        # Final assault (8 bars)
        ('E5', 0.125), ('E5', 0.125), ('E5', 0.125), ('E5', 0.125),
        ('F5', 0.25), ('E5', 0.25), ('D5', 0.5), ('C5', 0.5), ('B4', 1.0),
        
        ('C5', 0.25), ('D5', 0.25), ('E5', 0.25), ('F5', 0.25),
        ('G5', 0.5), ('A5', 0.5), ('G5', 0.5), ('F5', 0.5), ('E5', 1.0),
        
        ('D5', 0.5), ('C5', 0.5), ('B4', 0.5), ('A4', 0.5),
        ('G4', 0.5), ('F4', 0.5), ('E4', 0.5), ('D4', 0.5),
        
        ('C4', 0.25), ('D4', 0.25), ('E4', 0.25), ('F4', 0.25),
        ('G4', 0.5), ('A4', 0.5), ('E4', 2.0),
    ]
    return melody

def create_battle_bass():
    """Create driving bass line for battle music."""
    bass = [
        # Driving ostinato pattern
        ('E2', 0.25), ('E2', 0.25), ('E2', 0.25), ('E2', 0.25),
        ('F2', 0.25), ('F2', 0.25), ('G2', 0.25), ('G2', 0.25),
        ('A2', 0.5), ('G2', 0.5), ('F2', 0.5), ('E2', 0.5),
        
        ('D2', 0.25), ('D2', 0.25), ('D2', 0.25), ('D2', 0.25),
        ('E2', 0.25), ('E2', 0.25), ('F2', 0.25), ('F2', 0.25),
        ('G2', 0.5), ('F2', 0.5), ('E2', 0.5), ('D2', 0.5),
        
        ('C2', 0.25), ('C2', 0.25), ('G2', 0.25), ('G2', 0.25),
        ('C3', 0.25), ('C3', 0.25), ('G2', 0.25), ('G2', 0.25),
        ('F2', 0.5), ('E2', 0.5), ('D2', 0.5), ('C2', 0.5),
        
        ('A2', 0.25), ('A2', 0.25), ('E2', 0.25), ('E2', 0.25),
        ('A2', 0.25), ('A2', 0.25), ('C3', 0.25), ('C3', 0.25),
        ('E3', 0.5), ('D3', 0.5), ('C3', 0.5), ('B2', 0.5),
        
        # Intensified pattern
        ('E2', 0.125), ('E2', 0.125), ('E2', 0.125), ('E2', 0.125),
        ('E2', 0.125), ('E2', 0.125), ('E2', 0.125), ('E2', 0.125),
        ('D2', 0.25), ('E2', 0.25), ('F2', 0.25), ('G2', 0.25), ('A2', 2.0),
        
        ('G2', 0.25), ('G2', 0.25), ('D2', 0.25), ('D2', 0.25),
        ('G2', 0.25), ('G2', 0.25), ('B2', 0.25), ('B2', 0.25),
        ('D3', 0.5), ('C3', 0.5), ('B2', 0.5), ('A2', 0.5),
        
        ('F2', 0.25), ('F2', 0.25), ('C2', 0.25), ('C2', 0.25),
        ('F2', 0.25), ('F2', 0.25), ('A2', 0.25), ('A2', 0.25),
        ('C3', 0.5), ('B2', 0.5), ('A2', 0.5), ('G2', 0.5),
        
        ('E2', 0.25), ('F2', 0.25), ('G2', 0.25), ('A2', 0.25),
        ('B2', 0.25), ('C3', 0.25), ('D3', 0.25), ('E3', 0.25),
        ('C3', 1.0), ('G2', 1.0),
        
        # Bridge pattern
        ('C2', 0.5), ('G2', 0.5), ('C3', 0.5), ('G2', 0.5),
        ('C2', 0.5), ('G2', 0.5), ('C3', 0.5), ('G2', 0.5),
        
        ('F2', 0.5), ('C3', 0.5), ('F3', 0.5), ('C3', 0.5),
        ('G2', 0.5), ('D3', 0.5), ('G3', 0.5), ('D3', 0.5),
        
        ('A2', 0.5), ('E3', 0.5), ('A3', 0.5), ('E3', 0.5),
        ('F2', 0.5), ('C3', 0.5), ('F3', 0.5), ('C3', 0.5),
        
        ('D2', 0.5), ('A2', 0.5), ('D3', 0.5), ('A2', 0.5),
        ('G2', 0.5), ('D3', 0.5), ('C3', 2.0),
        
        # Final assault bass
        ('E2', 0.25), ('E2', 0.25), ('B2', 0.25), ('B2', 0.25),
        ('E3', 0.25), ('E3', 0.25), ('B2', 0.25), ('B2', 0.25),
        ('E2', 0.5), ('F2', 0.5), ('G2', 0.5), ('A2', 0.5),
        
        ('C3', 0.25), ('C3', 0.25), ('G2', 0.25), ('G2', 0.25),
        ('C3', 0.25), ('C3', 0.25), ('E3', 0.25), ('E3', 0.25),
        ('G3', 0.5), ('F3', 0.5), ('E3', 0.5), ('D3', 0.5),
        
        ('B2', 0.5), ('A2', 0.5), ('G2', 0.5), ('F2', 0.5),
        ('E2', 0.5), ('D2', 0.5), ('C2', 0.5), ('B1', 0.5),
        
        ('C2', 0.25), ('D2', 0.25), ('E2', 0.25), ('F2', 0.25),
        ('G2', 0.25), ('A2', 0.25), ('B2', 0.25), ('C3', 0.25),
        ('E2', 2.0),
    ]
    return bass

def create_battle_drums():
    """Create intense drum patterns for battle."""
    drums = [
        # Fast, driving beat - 32 bars total
        # Opening assault
        ('kick', 0.25), ('hihat', 0.125), ('hihat', 0.125), ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.25), ('hihat', 0.25), ('snare', 0.25), ('hihat', 0.125), ('hihat', 0.125),
        ('kick', 0.25), ('kick', 0.25), ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.25), ('hihat', 0.25), ('snare', 0.5),
        
        # Repeat with variations
        ('kick', 0.25), ('hihat', 0.25), ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.125), ('kick', 0.125), ('hihat', 0.25), ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.25), ('hihat', 0.125), ('hihat', 0.125), ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.25), ('snare', 0.25), ('snare', 0.25), ('snare', 0.25),
        
        # Double bass pattern
        ('kick', 0.125), ('kick', 0.125), ('hihat', 0.25), ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.125), ('kick', 0.125), ('hihat', 0.25), ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.25), ('hihat', 0.25), ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.25), ('snare', 0.125), ('snare', 0.125), ('snare', 0.25), ('hihat', 0.25),
        
        # Fill section
        ('snare', 0.125), ('snare', 0.125), ('snare', 0.125), ('snare', 0.125),
        ('kick', 0.25), ('kick', 0.25), ('snare', 0.5), ('hihat', 0.5),
        ('kick', 0.5), ('snare', 0.5), ('kick', 0.25), ('kick', 0.25), ('snare', 0.5),
        
        # Intense pattern
        ('kick', 0.25), ('hihat', 0.125), ('hihat', 0.125), ('snare', 0.25), ('hihat', 0.125), ('hihat', 0.125),
        ('kick', 0.125), ('kick', 0.125), ('hihat', 0.25), ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.25), ('hihat', 0.25), ('snare', 0.125), ('snare', 0.125), ('hihat', 0.125), ('hihat', 0.125),
        ('kick', 0.25), ('snare', 0.25), ('kick', 0.25), ('snare', 0.25),
        
        # Bridge - half-time feel
        ('kick', 0.5), ('rest', 0.5), ('snare', 0.5), ('rest', 0.5),
        ('kick', 0.5), ('rest', 0.5), ('snare', 0.5), ('hihat', 0.25), ('hihat', 0.25),
        ('kick', 0.5), ('rest', 0.5), ('snare', 0.5), ('rest', 0.5),
        ('kick', 0.25), ('kick', 0.25), ('rest', 0.5), ('snare', 1.0),
        
        # Build-up
        ('kick', 0.25), ('hihat', 0.25), ('kick', 0.25), ('hihat', 0.25),
        ('snare', 0.25), ('hihat', 0.25), ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.125), ('kick', 0.125), ('snare', 0.125), ('snare', 0.125),
        ('kick', 0.125), ('kick', 0.125), ('snare', 0.125), ('snare', 0.125),
        ('snare', 0.125), ('snare', 0.125), ('snare', 0.125), ('snare', 0.125),
        ('snare', 0.125), ('snare', 0.125), ('snare', 0.125), ('snare', 0.125),
        
        # Final assault
        ('kick', 0.25), ('hihat', 0.125), ('hihat', 0.125), ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.125), ('kick', 0.125), ('hihat', 0.25), ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.25), ('hihat', 0.25), ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.25), ('snare', 0.25), ('kick', 0.25), ('snare', 0.25),
        
        ('kick', 0.25), ('kick', 0.25), ('snare', 0.25), ('hihat', 0.25),
        ('kick', 0.25), ('hihat', 0.25), ('snare', 0.25), ('snare', 0.125), ('snare', 0.125),
        ('kick', 0.5), ('snare', 0.5), ('kick', 0.5), ('snare', 0.5),
        ('kick', 0.25), ('snare', 0.25), ('snare', 0.25), ('snare', 0.25), ('kick', 1.0),
    ]
    return drums

def create_battle_strings():
    """Create aggressive string staccatos and tremolo for battle."""
    strings = [
        # Staccato eighth notes - aggressive rhythm
        ([('E3', 'B3', 'E4')], 0.25), ([('E3', 'B3', 'E4')], 0.25), 
        ([('E3', 'B3', 'E4')], 0.25), ([('E3', 'B3', 'E4')], 0.25),
        ([('F3', 'C4', 'F4')], 0.5), ([('G3', 'D4', 'G4')], 0.5),
        ([('A3', 'E4', 'A4')], 1.0), ([('G3', 'D4', 'G4')], 1.0),
        
        ([('F3', 'C4', 'F4')], 0.25), ([('E3', 'B3', 'E4')], 0.25),
        ([('D3', 'A3', 'D4')], 0.25), ([('C3', 'G3', 'C4')], 0.25),
        ([('D3', 'A3', 'D4')], 0.5), ([('E3', 'B3', 'E4')], 0.5),
        ([('F3', 'C4', 'F4')], 1.0), ([('E3', 'B3', 'E4')], 1.0),
        
        # Tremolo sections for intensity
        ([('C3', 'G3', 'C4', 'E4')], 0.125), ([('C3', 'G3', 'C4', 'E4')], 0.125),
        ([('C3', 'G3', 'C4', 'E4')], 0.125), ([('C3', 'G3', 'C4', 'E4')], 0.125),
        ([('D3', 'A3', 'D4', 'F4')], 0.125), ([('D3', 'A3', 'D4', 'F4')], 0.125),
        ([('D3', 'A3', 'D4', 'F4')], 0.125), ([('D3', 'A3', 'D4', 'F4')], 0.125),
        ([('E3', 'B3', 'E4', 'G4')], 1.0), ([('D3', 'A3', 'D4', 'F4')], 1.0),
        
        ([('A3', 'E4', 'A4')], 0.5), ([('B3', 'F4', 'B4')], 0.5),
        ([('C4', 'G4', 'C5')], 0.5), ([('D4', 'A4', 'D5')], 0.5),
        ([('E4', 'B4', 'E5')], 1.0), ([('D4', 'A4', 'D5')], 0.5), ([('C4', 'G4', 'C5')], 0.5),
        
        # Sustained tension chords
        ([('E3', 'G3', 'B3', 'E4')], 2.0), ([('D3', 'F3', 'A3', 'D4')], 2.0),
        ([('C3', 'E3', 'G3', 'C4')], 2.0), ([('B2', 'D3', 'F3', 'B3')], 2.0),
        
        ([('A2', 'C3', 'E3', 'A3')], 2.0), ([('G2', 'B2', 'D3', 'G3')], 2.0),
        ([('F2', 'A2', 'C3', 'F3')], 2.0), ([('E2', 'G2', 'B2', 'E3')], 2.0),
        
        # Bridge - building tension
        ([('C3', 'E3', 'G3')], 0.5), ([('G3', 'B3', 'D4')], 0.5),
        ([('C4', 'E4', 'G4')], 0.5), ([('G3', 'B3', 'D4')], 0.5),
        ([('C3', 'E3', 'G3')], 0.5), ([('G3', 'B3', 'D4')], 0.5),
        ([('C4', 'E4', 'G4')], 0.5), ([('G3', 'B3', 'D4')], 0.5),
        
        ([('F3', 'A3', 'C4')], 0.5), ([('C4', 'E4', 'G4')], 0.5),
        ([('F4', 'A4', 'C5')], 0.5), ([('C4', 'E4', 'G4')], 0.5),
        ([('G3', 'B3', 'D4')], 0.5), ([('D4', 'F4', 'A4')], 0.5),
        ([('G4', 'B4', 'D5')], 0.5), ([('D4', 'F4', 'A4')], 0.5),
        
        ([('A3', 'C4', 'E4')], 0.5), ([('E4', 'G4', 'B4')], 0.5),
        ([('A4', 'C5', 'E5')], 0.5), ([('E4', 'G4', 'B4')], 0.5),
        ([('F3', 'A3', 'C4')], 0.5), ([('C4', 'E4', 'G4')], 0.5),
        ([('F4', 'A4', 'C5')], 0.5), ([('C4', 'E4', 'G4')], 0.5),
        
        ([('D3', 'F3', 'A3')], 0.5), ([('A3', 'C4', 'E4')], 0.5),
        ([('D4', 'F4', 'A4')], 0.5), ([('A3', 'C4', 'E4')], 0.5),
        ([('G3', 'B3', 'D4')], 0.5), ([('D4', 'F4', 'A4')], 0.5),
        ([('C4', 'E4', 'G4')], 2.0),
        
        # Final assault - rapid staccatos
        ([('E3', 'B3', 'E4')], 0.125), ([('E3', 'B3', 'E4')], 0.125),
        ([('E3', 'B3', 'E4')], 0.125), ([('E3', 'B3', 'E4')], 0.125),
        ([('F3', 'C4', 'F4')], 0.25), ([('E3', 'B3', 'E4')], 0.25),
        ([('D3', 'A3', 'D4')], 0.5), ([('C3', 'G3', 'C4')], 0.5), ([('B2', 'F3', 'B3')], 1.0),
        
        ([('C3', 'G3', 'C4')], 0.25), ([('D3', 'A3', 'D4')], 0.25),
        ([('E3', 'B3', 'E4')], 0.25), ([('F3', 'C4', 'F4')], 0.25),
        ([('G3', 'D4', 'G4')], 0.5), ([('A3', 'E4', 'A4')], 0.5),
        ([('G3', 'D4', 'G4')], 0.5), ([('F3', 'C4', 'F4')], 0.5), ([('E3', 'B3', 'E4')], 1.0),
        
        ([('D3', 'A3', 'D4')], 0.5), ([('C3', 'G3', 'C4')], 0.5),
        ([('B2', 'F3', 'B3')], 0.5), ([('A2', 'E3', 'A3')], 0.5),
        ([('G2', 'D3', 'G3')], 0.5), ([('F2', 'C3', 'F3')], 0.5),
        ([('E2', 'B2', 'E3')], 0.5), ([('D2', 'A2', 'D3')], 0.5),
        
        ([('C2', 'G2', 'C3')], 0.25), ([('D2', 'A2', 'D3')], 0.25),
        ([('E2', 'B2', 'E3')], 0.25), ([('F2', 'C3', 'F3')], 0.25),
        ([('G2', 'D3', 'G3')], 0.5), ([('A2', 'E3', 'A3')], 0.5),
        ([('E2', 'B2', 'E3')], 2.0),
    ]
    return strings

def create_battle_brass():
    """Create powerful brass hits and fanfares for battle."""
    brass = [
        # Brass stabs and hits
        ('rest', 0.5), ('E4', 0.25), ('E4', 0.25), ('rest', 0.5), ('F4', 0.25), ('G4', 0.25),
        ('A4', 0.5), ('rest', 0.5), ('G4', 0.5), ('rest', 0.5),
        
        ('rest', 0.5), ('F4', 0.25), ('E4', 0.25), ('rest', 0.5), ('D4', 0.25), ('C4', 0.25),
        ('rest', 0.5), ('E4', 0.5), ('rest', 0.5), ('F4', 0.5),
        
        # Power chords
        ('G4', 0.25), ('rest', 0.25), ('A4', 0.25), ('rest', 0.25),
        ('B4', 0.25), ('rest', 0.25), ('C5', 0.25), ('rest', 0.25),
        ('D5', 0.5), ('C5', 0.5), ('B4', 0.5), ('A4', 0.5),
        
        ('rest', 1.0), ('E5', 0.5), ('rest', 0.5), ('D5', 0.5), ('rest', 0.5),
        
        # Sustained power notes
        ('E5', 2.0), ('D5', 2.0),
        ('C5', 2.0), ('B4', 2.0),
        ('A4', 2.0), ('G4', 2.0),
        ('F4', 2.0), ('E4', 2.0),
        
        # Fanfare section
        ('C5', 0.25), ('C5', 0.25), ('C5', 0.25), ('rest', 0.25),
        ('G4', 0.25), ('G4', 0.25), ('G4', 0.25), ('rest', 0.25),
        ('E5', 1.0), ('D5', 1.0),
        
        ('F4', 0.25), ('F4', 0.25), ('F4', 0.25), ('rest', 0.25),
        ('C5', 0.25), ('C5', 0.25), ('C5', 0.25), ('rest', 0.25),
        ('G5', 1.0), ('F5', 1.0),
        
        ('E5', 0.5), ('D5', 0.5), ('C5', 0.5), ('B4', 0.5),
        ('A4', 0.5), ('G4', 0.5), ('F4', 0.5), ('E4', 0.5),
        
        ('rest', 0.5), ('A4', 0.5), ('rest', 0.5), ('B4', 0.5),
        ('C5', 2.0),
        
        # Final brass assault
        ('E5', 0.25), ('rest', 0.25), ('E5', 0.25), ('rest', 0.25),
        ('F5', 0.25), ('E5', 0.25), ('D5', 0.25), ('C5', 0.25),
        ('rest', 0.5), ('B4', 0.5), ('rest', 1.0),
        
        ('C5', 0.25), ('D5', 0.25), ('E5', 0.25), ('F5', 0.25),
        ('G5', 0.5), ('A5', 0.5), ('G5', 0.5), ('F5', 0.5), ('E5', 1.0),
        
        ('D5', 0.5), ('C5', 0.5), ('B4', 0.5), ('A4', 0.5),
        ('G4', 0.5), ('F4', 0.5), ('E4', 0.5), ('D4', 0.5),
        
        ('rest', 0.5), ('G4', 0.5), ('rest', 0.5), ('A4', 0.5),
        ('E4', 2.0),
    ]
    return brass

def main():
    print("Generating Orchestral Battle Music")
    print("=" * 50)
    
    tempo = 140  # Fast battle tempo
    sample_rate = 44100
    beat_duration = 60.0 / tempo
    
    # Create all parts
    print("Creating battle melody...")
    melody = create_battle_melody()
    
    print("Creating driving bass line...")
    bass = create_battle_bass()
    
    print("Creating intense drum patterns...")
    drums = create_battle_drums()
    
    print("Creating aggressive strings...")
    strings = create_battle_strings()
    
    print("Creating powerful brass...")
    brass = create_battle_brass()
    
    # Generate melody track
    print("Generating melody track...")
    melody_track = np.array([])
    for note, duration in melody:
        frequency = NOTES.get(note, 0)
        tone = generate_string_tone(frequency, duration * beat_duration, sample_rate, 
                                   amplitude=0.35, instrument='violin')
        melody_track = np.concatenate([melody_track, tone])
    
    # Generate bass track
    print("Generating bass track...")
    bass_track = np.array([])
    for note, duration in bass:
        frequency = NOTES.get(note, 0)
        tone = generate_bass_tone(frequency, duration * beat_duration, sample_rate, amplitude=0.7)
        bass_track = np.concatenate([bass_track, tone])
    
    # Generate drum track
    print("Generating drum track...")
    drum_track = np.array([])
    for drum_type, duration in drums:
        drum_duration = duration * beat_duration
        if drum_type == 'kick':
            sound = generate_kick_drum(drum_duration, sample_rate, amplitude=0.8)
        elif drum_type == 'snare':
            sound = generate_snare_drum(drum_duration, sample_rate, amplitude=0.6)
        elif drum_type == 'hihat':
            sound = generate_hihat(drum_duration, sample_rate, amplitude=0.4, closed=True)
        else:  # rest
            sound = np.zeros(int(sample_rate * drum_duration))
        drum_track = np.concatenate([drum_track, sound])
    
    # Generate string section
    print("Generating string sections...")
    string_track = np.array([])
    for chord_notes, duration in strings:
        chord_duration = duration * beat_duration
        chord_sound = np.zeros(int(sample_rate * chord_duration))
        
        for notes_tuple in chord_notes:
            for note in notes_tuple:
                frequency = NOTES.get(note, 0)
                # Use shorter attack for staccato effect in battle
                tone = generate_string_tone(frequency, chord_duration, sample_rate, 
                                           amplitude=0.12, instrument='violin')
                chord_sound += tone
        
        if np.max(np.abs(chord_sound)) > 0:
            chord_sound = chord_sound / np.max(np.abs(chord_sound)) * 0.45
        string_track = np.concatenate([string_track, chord_sound])
    
    # Generate brass section
    print("Generating brass section...")
    brass_track = np.array([])
    for note, duration in brass:
        frequency = NOTES.get(note, 0)
        tone = generate_brass_tone(frequency, duration * beat_duration, sample_rate, amplitude=0.4)
        brass_track = np.concatenate([brass_track, tone])
    
    # Mix all tracks with battle-appropriate panning
    print("Mixing orchestra for battle intensity...")
    
    tracks_to_mix = [
        (melody_track, 0.0, 0.2),       # Melody: center, light reverb
        (bass_track, 0.0, 0.1),          # Bass: center, minimal reverb
        (drum_track, -0.05, 0.05),       # Drums: slightly left, very dry
        (string_track, -0.3, 0.3),       # Strings: left, moderate reverb
        (brass_track, 0.3, 0.35),        # Brass: right, moderate reverb
    ]
    
    mixed_audio = mix_tracks_stereo(tracks_to_mix, sample_rate)
    
    # Save as WAV
    wav_file = save_as_wav(mixed_audio, 'battle.wav', sample_rate)
    
    # Convert to OGG
    print("\nConverting to OGG format...")
    ogg_file = convert_to_ogg(wav_file, 'battle.ogg')
    
    if ogg_file:
        print(f"\n✓ Success! Generated orchestral battle music:")
        print(f"  - {wav_file}")
        print(f"  - {ogg_file}")
    
    # Clean up WAV file
    if os.path.exists(wav_file) and ogg_file:
        os.remove(wav_file)
        print(f"  - Cleaned up temporary WAV file")

if __name__ == "__main__":
    main()